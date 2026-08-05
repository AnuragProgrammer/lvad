import { useSimulationStore } from '../store/useSimulationStore'
import { motion } from 'framer-motion'
import { LiveGraphs } from '../charts/LiveGraphs'

export function CardiologistPanel() {
  const {
    aiState,
    rhfRisk,
    lvadRpm,
    lvadFlow,
    rvPumpState,
    rvPumpFlow,
    rvPumpRpm,
    raPressure,
    paPressure,
    heartRate,
    cardiacOutput,
    systolicBP,
    diastolicBP,
    notifications,
  } = useSimulationStore()

  const getSeverityColor = () => {
    if (rhfRisk > 70) return 'text-red-400'
    if (rhfRisk > 40) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getSeverityBg = () => {
    if (rhfRisk > 70) return 'bg-red-500/10 border-red-500/30'
    if (rhfRisk > 40) return 'bg-yellow-500/10 border-yellow-500/30'
    return 'bg-green-500/10 border-green-500/30'
  }

  const getSuggestedIntervention = () => {
    if (rhfRisk > 85) return 'Consider surgical evaluation. Emergency RV support active.'
    if (rhfRisk > 70) return 'Increase diuretics. Monitor fluid balance closely.'
    if (rhfRisk > 40) return 'Optimize LVAD parameters. Monitor trend.'
    if (rhfRisk > 20) return 'Continue current management. Routine follow-up.'
    return 'No intervention required. Patient stable.'
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-lg font-semibold">Cardiologist Dashboard</h2>
          <p className="text-xs text-white/40">Real-time patient monitoring and device management</p>
        </div>
        <div className={`px-4 py-2 rounded-lg border ${getSeverityBg()}`}>
          <span className="text-[10px] uppercase tracking-wider text-white/50">RHF Risk</span>
          <p className={`text-2xl font-bold font-mono ${getSeverityColor()}`}>{rhfRisk}%</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Heart Rate" value={`${heartRate}`} unit="bpm" />
        <MetricCard label="Blood Pressure" value={`${systolicBP}/${diastolicBP}`} unit="mmHg" />
        <MetricCard label="Cardiac Output" value={`${cardiacOutput}`} unit="L/min" />
        <MetricCard label="AI State" value={aiState} unit="" small />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* LVAD Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass p-4"
        >
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">LVAD Parameters</h3>
          <div className="space-y-2">
            <DataRow label="Speed" value={`${lvadRpm.toLocaleString()} rpm`} />
            <DataRow label="Flow" value={`${lvadFlow} L/min`} />
            <DataRow label="Mode" value={aiState === 'Monitoring' ? 'Normal' : 'AI-Controlled'} />
            <DataRow label="Power" value="5.2 W" />
          </div>
        </motion.div>

        {/* RV Pump Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass p-4"
        >
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">RV Assist Pump</h3>
          <div className="space-y-2">
            <DataRow label="Status" value={rvPumpState} highlight={rvPumpState !== 'OFF'} />
            <DataRow label="Speed" value={`${rvPumpRpm.toLocaleString()} rpm`} />
            <DataRow label="Flow" value={`${rvPumpFlow} L/min`} />
            <DataRow label="RA Pressure" value={`${raPressure} mmHg`} />
            <DataRow label="PA Pressure" value={`${paPressure} mmHg`} />
          </div>
        </motion.div>
      </div>

      {/* Suggested Intervention */}
      <div className={`glass p-4 border ${getSeverityBg()}`}>
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
          Suggested Intervention
        </h3>
        <p className="text-sm text-white/80">{getSuggestedIntervention()}</p>
      </div>

      {/* Graphs */}
      <div className="h-[200px]">
        <LiveGraphs />
      </div>

      {/* Recent Events */}
      <div className="glass p-4">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
          Recent Events
        </h3>
        <div className="space-y-2 max-h-[150px] overflow-y-auto">
          {notifications.slice(0, 10).map((n) => (
            <div key={n.id} className="flex items-center gap-2 text-[11px]">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                n.type === 'danger' ? 'bg-red-400' :
                n.type === 'warning' ? 'bg-yellow-400' :
                n.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
              }`} />
              <span className="text-white/60">{n.message}</span>
              <span className="ml-auto text-white/20 text-[9px]">
                {new Date(n.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="text-[11px] text-white/30">No events recorded</p>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, unit, small }: { label: string; value: string; unit: string; small?: boolean }) {
  return (
    <div className="glass-panel p-3">
      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`${small ? 'text-xs' : 'text-lg'} font-semibold font-mono text-white`}>{value}</span>
        {unit && <span className="text-[10px] text-white/30">{unit}</span>}
      </div>
    </div>
  )
}

function DataRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[11px] text-white/50">{label}</span>
      <span className={`text-[11px] font-mono ${highlight ? 'text-blue-400' : 'text-white/70'}`}>{value}</span>
    </div>
  )
}
