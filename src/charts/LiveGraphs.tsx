import { useSimulationStore } from '../store/useSimulationStore'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts'

export function LiveGraphs() {
  const vitalHistory = useSimulationStore((s) => s.vitalHistory)

  const charts = [
    { key: 'raPressure' as const, label: 'RA Pressure', color: '#ff6b6b', unit: 'mmHg', domain: [0, 25] as [number, number], warn: 12 },
    { key: 'paPressure' as const, label: 'PA Pressure', color: '#4ecdc4', unit: 'mmHg', domain: [0, 50] as [number, number], warn: 30 },
    { key: 'lvadRpm' as const, label: 'LVAD Speed', color: '#5b9bd5', unit: 'rpm', domain: [5000, 11000] as [number, number], warn: undefined },
    { key: 'rvPumpFlow' as const, label: 'RV Pump Flow', color: '#a855f7', unit: 'L/min', domain: [0, 5] as [number, number], warn: undefined },
    { key: 'cardiacOutput' as const, label: 'Cardiac Output', color: '#22c55e', unit: 'L/min', domain: [2, 7] as [number, number], warn: 3.5 },
    { key: 'heartRate' as const, label: 'Heart Rate', color: '#f59e0b', unit: 'bpm', domain: [50, 140] as [number, number], warn: 110 },
  ]

  return (
    <div className="glass p-3 grid grid-cols-3 gap-2 h-full">
      {charts.map((chart) => (
        <div key={chart.key} className="min-h-0">
          <p className="text-[9px] uppercase tracking-wider text-neutral-500 mb-1">
            {chart.label}
            <span className="ml-1 text-neutral-600">({chart.unit})</span>
          </p>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={vitalHistory} margin={{ top: 2, right: 4, bottom: 2, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={chart.domain} allowDataOverflow={false} />
              {chart.warn !== undefined && (
                <ReferenceLine y={chart.warn} stroke="rgba(255,100,100,0.3)" strokeDasharray="2 2" />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1c22',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  fontSize: '10px',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.4)' }}
                itemStyle={{ color: chart.color }}
                formatter={(value: number) => [value.toFixed(1), chart.label]}
              />
              <Line
                type="monotone"
                dataKey={chart.key}
                stroke={chart.color}
                strokeWidth={1.5}
                dot={false}
                animationDuration={200}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  )
}
