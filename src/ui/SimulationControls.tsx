import { useSimulationStore } from '../store/useSimulationStore'

export function SimulationControls() {
  const {
    running,
    start,
    pause,
    reset,
    injectRVFailure,
    recoverPatient,
    rvFailureSeverity,
    lvadTargetRpm,
    heartRateControl,
    paPressureControl,
    cardiacOutputControl,
    setRvFailureSeverity,
    setLvadTargetRpm,
    setHeartRateControl,
    setPaPressureControl,
    setCardiacOutputControl,
  } = useSimulationStore()

  return (
    <div className="glass p-3 overflow-y-auto">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
        Controls
      </h2>
      <p className="text-[9.5px] text-neutral-500 mb-3">
        Press Start, then Inject RVF to see the AI detect failure and activate the RV pump.
      </p>

      {/* Main action buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={running ? pause : start}
          className={`px-3 py-2 rounded-md text-[11px] font-semibold transition-all ${
            running
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
              : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
          }`}
        >
          {running ? '⏸ Pause' : '▶ Start Simulation'}
        </button>
        <button
          onClick={reset}
          className="px-3 py-2 rounded-md text-[11px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 transition-all"
        >
          ↺ Reset All
        </button>
      </div>

      {/* Scenario buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <button
            onClick={injectRVFailure}
            className="w-full px-3 py-2 rounded-md text-[11px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
          >
            ⚠ Inject RV Failure
          </button>
          <p className="text-[8.5px] text-neutral-600 mt-1">Simulates acute right heart failure</p>
        </div>
        <div>
          <button
            onClick={recoverPatient}
            className="w-full px-3 py-2 rounded-md text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
          >
            ✓ Recover Patient
          </button>
          <p className="text-[8.5px] text-neutral-600 mt-1">Represents clinical treatment restoring RV</p>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3 border-t border-neutral-800 pt-3">
        <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Adjust Parameters</p>

        <SliderControl
          label="RV Failure Severity"
          description="How badly the right ventricle is failing (0 = healthy, 100 = total failure)"
          value={rvFailureSeverity}
          min={0}
          max={100}
          unit="%"
          onChange={setRvFailureSeverity}
          color="red"
        />
        <SliderControl
          label="LVAD Target Speed"
          description="Target pump speed — AI may reduce this during RV failure"
          value={lvadTargetRpm}
          min={6000}
          max={12000}
          step={100}
          unit="rpm"
          onChange={setLvadTargetRpm}
          color="blue"
        />
        <SliderControl
          label="Heart Rate"
          description="Patient's base heart rate"
          value={heartRateControl}
          min={50}
          max={140}
          unit="bpm"
          onChange={setHeartRateControl}
          color="green"
        />
        <SliderControl
          label="PA Pressure"
          description="Pulmonary artery pressure — rises during RV failure"
          value={paPressureControl}
          min={10}
          max={50}
          unit="mmHg"
          onChange={setPaPressureControl}
          color="blue"
        />
        <SliderControl
          label="Cardiac Output"
          description="Total blood flow to the body"
          value={cardiacOutputControl}
          min={2}
          max={8}
          step={0.1}
          unit="L/min"
          onChange={setCardiacOutputControl}
          color="purple"
        />
      </div>
    </div>
  )
}

interface SliderProps {
  label: string
  description: string
  value: number
  min: number
  max: number
  step?: number
  unit: string
  onChange: (val: number) => void
  color: string
}

function SliderControl({ label, description, value, min, max, step = 1, unit, onChange, color }: SliderProps) {
  const colorMap: Record<string, string> = {
    red: 'accent-red-500',
    blue: 'accent-blue-500',
    green: 'accent-green-500',
    purple: 'accent-purple-500',
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-[10px] text-neutral-300">{label}</span>
        <span className="text-[10px] font-mono text-neutral-400">
          {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value} {unit}
        </span>
      </div>
      <p className="text-[8.5px] text-neutral-600 mb-1">{description}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-1 rounded-full appearance-none bg-neutral-800 cursor-pointer ${colorMap[color] || ''}`}
      />
    </div>
  )
}
