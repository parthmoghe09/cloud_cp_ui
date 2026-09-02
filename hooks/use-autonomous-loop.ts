"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { generateCycle, STAGES } from "@/lib/scenarios"
import type { AgentReading, LoopCycle, SafetyCheck, StageId } from "@/lib/types"

const STAGE_DURATIONS: Record<StageId, number> = {
  telemetry: 2400,
  anomaly: 2600,
  swarm: 4400,
  consensus: 2600,
  safety: 3600,
  kubernetes: 3600,
  verification: 3000,
  learning: 2800,
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const listener = () => setReduced(mq.matches)
    mq.addEventListener("change", listener)
    return () => mq.removeEventListener("change", listener)
  }, [])
  return reduced
}

export function useAutonomousLoop() {
  const reducedMotion = usePrefersReducedMotion()
  const [cycleIndex, setCycleIndex] = useState(0)
  const [stageIndex, setStageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [cycle, setCycle] = useState<LoopCycle>(() => generateCycle(0))
  const [agents, setAgents] = useState<AgentReading[]>(() => cycle.agents)
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheck[]>(() => cycle.safetyChecks)

  const startRef = useRef<number>(Date.now())
  const elapsedRef = useRef<number>(0)

  const stage = STAGES[stageIndex].id

  useEffect(() => {
    startRef.current = Date.now()
    elapsedRef.current = 0
  }, [stageIndex, cycleIndex])

  useEffect(() => {
    if (paused) return
    const speed = reducedMotion ? 1.6 : 1
    const tick = setInterval(() => {
      const now = Date.now()
      const elapsed = elapsedRef.current + (now - startRef.current) * speed
      startRef.current = now
      elapsedRef.current = elapsed
      const duration = STAGE_DURATIONS[stage]
      const p = Math.min(1, elapsed / duration)
      setProgress(p)

      if (stage === "swarm") {
        setAgents((prev) =>
          prev.map((a, i) => {
            const threshold = (i + 1) / prev.length
            return { ...a, state: p >= threshold ? "complete" : p >= threshold - 1 / prev.length + 0.05 ? "analyzing" : "idle" }
          }),
        )
      }

      if (stage === "safety") {
        setSafetyChecks((prev) =>
          prev.map((c, i) => {
            const threshold = (i + 1) / prev.length
            if (cycle.consensus === "quorum-failed") {
              return { ...c, status: p >= threshold ? "fail" : "pending" }
            }
            return { ...c, status: p >= threshold ? "pass" : "pending" }
          }),
        )
      }

      if (p >= 1) {
        if (stageIndex >= STAGES.length - 1) {
          const nextIndex = cycleIndex + 1
          const nextCycle = generateCycle(nextIndex)
          setCycleIndex(nextIndex)
          setCycle(nextCycle)
          setAgents(nextCycle.agents)
          setSafetyChecks(nextCycle.safetyChecks)
          setStageIndex(0)
        } else {
          setStageIndex((s) => s + 1)
        }
      }
    }, 90)
    return () => clearInterval(tick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, paused, cycleIndex, reducedMotion])

  const stageStatus = useMemo(() => {
    return STAGES.map((s, i) => {
      if (i < stageIndex) return "complete" as const
      if (i === stageIndex) return "active" as const
      return "pending" as const
    })
  }, [stageIndex])

  return {
    stages: STAGES,
    stage,
    stageIndex,
    stageStatus,
    progress,
    cycle,
    agents,
    safetyChecks,
    paused,
    setPaused,
    reducedMotion,
  }
}
