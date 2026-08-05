import { useSimulationStore } from '../store/useSimulationStore'
import { motion } from 'framer-motion'

export function Header() {
  const viewMode = useSimulationStore((s) => s.viewMode)
  const setViewMode = useSimulationStore((s) => s.setViewMode)
  const aiState = useSimulationStore((s) => s.aiState)
  const running = useSimulationStore((s) => s.running)

  const tabs = [
    { id: 'device' as const, label: 'Device' },
    { id: 'simulation' as const, label: 'Simulation' },
    { id: 'patient' as const, label: 'Patient' },
    { id: 'cardiologist' as const, label: 'Clinical' },
  ]

  return (
    <header className="h-12 flex items-center px-5 border-b border-neutral-800 bg-neutral-950 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center">
          <span className="text-[9px] font-bold text-neutral-300">AC</span>
        </div>
        <div>
          <h1 className="text-xs font-medium text-neutral-200 tracking-wide">AICARES</h1>
        </div>
      </div>

      <nav className="flex items-center gap-0.5 ml-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`relative px-3.5 py-1.5 text-[11px] font-medium rounded transition-colors ${
              viewMode === tab.id
                ? 'text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {viewMode === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-neutral-800 rounded border border-neutral-700"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-green-500' : 'bg-neutral-600'}`} />
          <span className="text-neutral-500">{running ? 'Running' : 'Stopped'}</span>
        </div>
        <span className="text-neutral-600">|</span>
        <span className="text-neutral-500">
          AI: <span className="text-neutral-300">{aiState}</span>
        </span>
      </div>
    </header>
  )
}
