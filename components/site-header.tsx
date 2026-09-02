"use client"

import { useEffect, useState } from "react"
import { Pause, Play } from "lucide-react"

export function SiteHeader({
  paused,
  onTogglePause,
}: {
  paused: boolean
  onTogglePause: () => void
}) {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-signal/40 bg-signal/10">
            <span className="h-2 w-2 rounded-full bg-signal" style={{ animation: "pulse-signal 2s ease-in-out infinite" }} />
          </div>
          <span className="font-sans text-sm font-semibold tracking-[0.18em] text-foreground">
            AUTOFLOW<span className="text-signal">.</span>AI
          </span>
          <span className="hidden rounded-sm border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
            control plane
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verified opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-verified" />
            </span>
            <span className="uppercase tracking-widest">live</span>
          </div>
          <span className="hidden font-mono text-xs text-muted-foreground tabular-nums sm:inline">{time} UTC</span>
          <button
            onClick={onTogglePause}
            aria-label={paused ? "Resume simulation" : "Pause simulation"}
            className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 py-1.5 text-xs text-foreground transition-colors hover:border-signal/50 hover:text-signal"
          >
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            <span className="hidden sm:inline">{paused ? "Resume" : "Pause"}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
