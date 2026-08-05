import { useSimulationStore } from '../store/useSimulationStore'
import { motion } from 'framer-motion'

export function PatientPanel() {
  const aiState = useSimulationStore((s) => s.aiState)
  const rhfRisk = useSimulationStore((s) => s.rhfRisk)
  const battery = useSimulationStore((s) => s.battery)
  const heartRate = useSimulationStore((s) => s.heartRate)

  const isNormal = aiState === 'Monitoring'
  const isWarning = aiState === 'Predicting RV Failure' || aiState === 'Compensating'
  const isEmergency = aiState === 'Emergency Support'

  const getStatusIcon = () => {
    if (isEmergency) return '🔴'
    if (isWarning) return '🟡'
    return '🟢'
  }

  const getMessages = () => {
    if (isEmergency) {
      return [
        '⚠ Right-heart strain detected.',
        'The AI support system has adjusted blood flow.',
        'Please avoid strenuous activity.',
        'Your cardiologist has been notified.',
        'Stay calm and rest.',
      ]
    }
    if (isWarning) {
      return [
        'AI is monitoring a slight change in heart function.',
        'The system is making minor adjustments.',
        'Continue your normal light activities.',
        'No immediate action required from you.',
      ]
    }
    return [
      'Everything looks normal.',
      'AI is monitoring your heart.',
      'No intervention required.',
      'You can continue your daily activities.',
    ]
  }

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 space-y-6"
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-1">My AICARES</h2>
          <p className="text-xs text-white/40">Patient Companion</p>
        </div>

        {/* Status */}
        <div className={`rounded-xl p-6 text-center ${
          isEmergency ? 'bg-red-500/10 border border-red-500/30' :
          isWarning ? 'bg-yellow-500/10 border border-yellow-500/30' :
          'bg-green-500/10 border border-green-500/30'
        }`}>
          <div className="text-4xl mb-3">{getStatusIcon()}</div>
          <h3 className={`text-lg font-semibold ${
            isEmergency ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {isEmergency ? 'Attention Required' : isWarning ? 'Minor Adjustment' : 'All Systems Normal'}
          </h3>
        </div>

        {/* Messages */}
        <div className="space-y-3">
          {getMessages().map((msg, i) => (
            <motion.div
              key={msg}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 text-sm text-white/70"
            >
              <span className="text-white/30 mt-0.5">•</span>
              <span>{msg}</span>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-panel p-3 text-center">
            <p className="text-[10px] text-white/40 mb-1">Heart Rate</p>
            <p className="text-lg font-mono font-semibold text-green-400">{heartRate}</p>
          </div>
          <div className="glass-panel p-3 text-center">
            <p className="text-[10px] text-white/40 mb-1">Battery</p>
            <p className="text-lg font-mono font-semibold text-blue-400">{Math.round(battery)}%</p>
          </div>
          <div className="glass-panel p-3 text-center">
            <p className="text-[10px] text-white/40 mb-1">Risk</p>
            <p className={`text-lg font-mono font-semibold ${
              rhfRisk > 60 ? 'text-red-400' : rhfRisk > 30 ? 'text-yellow-400' : 'text-green-400'
            }`}>{rhfRisk}%</p>
          </div>
        </div>

        <div className="text-center text-[11px] text-white/30">
          Last updated: just now
        </div>
      </motion.div>
    </div>
  )
}
