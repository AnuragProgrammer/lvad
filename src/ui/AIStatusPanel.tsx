import { useSimulationStore } from '../store/useSimulationStore'
import { motion } from 'framer-motion'

export function AIStatusPanel() {
  const aiState = useSimulationStore((s) => s.aiState)
  const rhfRisk = useSimulationStore((s) => s.rhfRisk)
  const aiConfidence = useSimulationStore((s) => s.aiConfidence)
  const rvPumpState = useSimulationStore((s) => s.rvPumpState)
  const rvPumpRpm = useSimulationStore((s) => s.rvPumpRpm)
  const rvPumpFlow = useSimulationStore((s) => s.rvPumpFlow)
  const lvadRpm = useSimulationStore((s) => s.lvadRpm)

  const getStateColor = () => {
    switch (aiState) {
      case 'Monitoring': return 'text-neutral-300'
      case 'Predicting RV Failure': return 'text-amber-400'
      case 'Compensating': return 'text-teal-400'
      case 'Optimizing Flow': return 'text-blue-300'
      case 'Emergency Support': return 'text-red-400'
    }
  }

  const getStateDescription = () => {
    switch (aiState) {
      case 'Monitoring': return 'All sensors within normal range. No intervention needed.'
      case 'Predicting RV Failure': return 'Early signs of RV strain detected. RV pump on standby.'
      case 'Compensating': return 'RV pump active. Reducing LVAD speed to balance flow.'
      case 'Optimizing Flow': return 'Adjusting both pumps to maximize cardiac output.'
      case 'Emergency Support': return 'Maximum RV support. LVAD speed reduced to prevent suction.'
    }
  }

  const getRiskColor = () => {
    if (rhfRisk < 20) return 'bg-green-600'
    if (rhfRisk < 40) return 'bg-amber-500'
    if (rhfRisk < 70) return 'bg-orange-500'
    return 'bg-red-600'
  }

  const getPumpStateLabel = () => {
    switch (rvPumpState) {
      case 'OFF': return { label: 'Off', color: 'text-neutral-500', desc: 'Not needed — RV functioning normally' }
      case 'Standby': return { label: 'Standby', color: 'text-amber-400', desc: 'Ready to activate if risk increases' }
      case 'Active': return { label: 'Active', color: 'text-teal-400', desc: 'Pumping blood from RA to PA' }
      case 'Emergency': return { label: 'Emergency', color: 'text-red-400', desc: 'Maximum output — critical support' }
    }
  }

  const pumpInfo = getPumpStateLabel()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="glass overflow-y-auto p-3 space-y-3"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60">
        AI Controller Status
      </h2>

      {/* What the AI does */}
      <div className="glass-panel p-3">
        <p className="text-[10px] leading-relaxed text-neutral-400">
          The AI monitors pressures and flow to detect right heart failure.
          When detected, it activates the RV pump and adjusts the LVAD to keep the patient stable.
        </p>
      </div>

      {/* Current AI State */}
      <div className="glass-panel p-3">
        <p className="text-[9px] uppercase tracking-wider text-neutral-500 mb-1">What the AI is doing</p>
        <p className={`text-sm font-semibold ${getStateColor()}`}>{aiState}</p>
        <p className="text-[10px] text-neutral-500 mt-1">{getStateDescription()}</p>
      </div>

      {/* RHF Risk */}
      <div className="glass-panel p-3">
        <p className="text-[9px] uppercase tracking-wider text-neutral-500 mb-1">RV Failure Risk</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-neutral-900 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getRiskColor()} rounded-full`}
              animate={{ width: `${rhfRisk}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className={`text-lg font-bold font-mono ${rhfRisk > 60 ? 'text-red-400' : rhfRisk > 30 ? 'text-amber-400' : 'text-green-400'}`}>
            {rhfRisk}%
          </span>
        </div>
        <p className="text-[9px] text-neutral-600 mt-1">
          {rhfRisk < 20 ? 'Low risk — normal function' :
           rhfRisk < 40 ? 'Moderate — early warning signs' :
           rhfRisk < 70 ? 'High — RV support activated' :
           'Critical — emergency intervention'}
        </p>
      </div>

      {/* RV Pump Status */}
      <div className="glass-panel p-3">
        <p className="text-[9px] uppercase tracking-wider text-neutral-500 mb-2">RV Assist Pump</p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-neutral-400">Status</span>
            <span className={`text-[11px] font-semibold ${pumpInfo.color}`}>{pumpInfo.label}</span>
          </div>
          <p className="text-[9px] text-neutral-600">{pumpInfo.desc}</p>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-neutral-400">Speed</span>
            <span className="text-[10px] font-mono text-neutral-300">{rvPumpRpm.toLocaleString()} rpm</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-neutral-400">Flow output</span>
            <span className="text-[10px] font-mono text-neutral-300">{rvPumpFlow} L/min</span>
          </div>
        </div>
      </div>

      {/* LVAD Status */}
      <div className="glass-panel p-3">
        <p className="text-[9px] uppercase tracking-wider text-neutral-500 mb-2">LVAD</p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-neutral-400">Speed</span>
            <span className="text-[10px] font-mono text-neutral-300">{lvadRpm.toLocaleString()} rpm</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-neutral-400">Mode</span>
            <span className="text-[10px] text-neutral-300">
              {aiState === 'Monitoring' ? 'Normal operation' : 'AI-reduced (preventing suction)'}
            </span>
          </div>
        </div>
      </div>

      {/* Confidence */}
      <div className="glass-panel p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] uppercase tracking-wider text-neutral-500">AI Confidence</span>
          <span className="text-[10px] font-mono text-neutral-400">{aiConfidence}%</span>
        </div>
        <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${aiConfidence}%` }}
          />
        </div>
      </div>
    </motion.div>
  )
}
