import { useSimulationStore } from '../store/useSimulationStore'
import { motion } from 'framer-motion'

interface VitalCardProps {
  label: string
  value: string | number
  unit: string
  description?: string
  status?: 'normal' | 'warning' | 'danger'
}

function VitalCard({ label, value, unit, description, status = 'normal' }: VitalCardProps) {
  const statusColor = status === 'danger' ? 'text-red-400' : status === 'warning' ? 'text-amber-400' : 'text-green-400'
  const borderColor = status === 'danger' ? 'border-red-500/30' : status === 'warning' ? 'border-amber-500/30' : 'border-neutral-800'

  return (
    <div className={`glass-panel p-2.5 border ${borderColor} transition-colors`}>
      <p className="text-[9px] uppercase tracking-wider text-neutral-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-lg font-semibold font-mono ${statusColor}`}>
          {value}
        </span>
        <span className="text-[9px] text-neutral-600">{unit}</span>
      </div>
      {description && <p className="text-[8.5px] text-neutral-600 mt-0.5">{description}</p>}
    </div>
  )
}

export function VitalsPanel() {
  const state = useSimulationStore()

  const hrStatus = state.heartRate > 120 ? 'danger' : state.heartRate > 100 ? 'warning' : 'normal'
  const coStatus = state.cardiacOutput < 3.5 ? 'danger' : state.cardiacOutput < 4.0 ? 'warning' : 'normal'
  const raStatus = state.raPressure > 15 ? 'danger' : state.raPressure > 10 ? 'warning' : 'normal'
  const paStatus = state.paPressure > 35 ? 'danger' : state.paPressure > 25 ? 'warning' : 'normal'

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass overflow-y-auto p-3 space-y-2"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
        Patient Vitals
      </h2>
      <p className="text-[9px] text-neutral-500 mb-2">
        Real-time sensor readings. Yellow = elevated. Red = critical.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <VitalCard
          label="Heart Rate"
          value={state.heartRate}
          unit="bpm"
          status={hrStatus}
        />
        <VitalCard
          label="Blood Pressure"
          value={`${state.systolicBP}/${state.diastolicBP}`}
          unit="mmHg"
        />
        <VitalCard
          label="Cardiac Output"
          value={state.cardiacOutput}
          unit="L/min"
          description="Total flow to body"
          status={coStatus}
        />
        <VitalCard
          label="LVAD Flow"
          value={state.lvadFlow}
          unit="L/min"
          description="Left pump output"
        />
        <VitalCard
          label="RA Pressure"
          value={state.raPressure}
          unit="mmHg"
          description="Rises in RV failure"
          status={raStatus}
        />
        <VitalCard
          label="PA Pressure"
          value={state.paPressure}
          unit="mmHg"
          description="Pulmonary artery"
          status={paStatus}
        />
        <VitalCard
          label="RV Pump Flow"
          value={state.rvPumpFlow}
          unit="L/min"
          description={state.rvPumpState === 'OFF' ? 'Pump inactive' : 'AI-activated support'}
          status={state.rvPumpState === 'Emergency' ? 'danger' : state.rvPumpState === 'Active' ? 'warning' : 'normal'}
        />
        <VitalCard
          label="Temperature"
          value={state.temperature}
          unit="°C"
        />
        <VitalCard
          label="LVAD Speed"
          value={state.lvadRpm.toLocaleString()}
          unit="rpm"
          description={state.aiState === 'Monitoring' ? 'Normal' : 'AI-reduced'}
        />
        <VitalCard
          label="Battery"
          value={Math.round(state.battery)}
          unit="%"
          status={state.battery < 20 ? 'danger' : state.battery < 50 ? 'warning' : 'normal'}
        />
      </div>
    </motion.div>
  )
}
