import { useEffect, useRef } from 'react'
import { useSimulationStore } from '../store/useSimulationStore'

export function useSimulationLoop() {
  const intervalRef = useRef<number | null>(null)
  const running = useSimulationStore((s) => s.running)
  const tick = useSimulationStore((s) => s.tick)

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(tick, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, tick])
}
