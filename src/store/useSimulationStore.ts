import { create } from 'zustand'

export type AIState = 'Monitoring' | 'Predicting RV Failure' | 'Compensating' | 'Optimizing Flow' | 'Emergency Support'
export type RVPumpState = 'OFF' | 'Standby' | 'Active' | 'Emergency'
export type ViewMode = 'device' | 'simulation' | 'patient' | 'cardiologist'

export interface Notification {
  id: string
  message: string
  type: 'info' | 'warning' | 'danger' | 'success'
  timestamp: number
}

export interface VitalHistory {
  time: number
  raPressure: number
  paPressure: number
  lvadRpm: number
  rvPumpFlow: number
  cardiacOutput: number
  heartRate: number
}

export interface SimulationState {
  running: boolean
  time: number
  viewMode: ViewMode

  // Vitals
  heartRate: number
  systolicBP: number
  diastolicBP: number
  cardiacOutput: number
  temperature: number
  battery: number

  // Pressures
  raPressure: number
  paPressure: number
  lvFilling: number

  // LVAD
  lvadRpm: number
  lvadFlow: number
  lvadTargetRpm: number

  // RV Pump
  rvPumpState: RVPumpState
  rvPumpFlow: number
  rvPumpRpm: number

  // AI
  aiState: AIState
  rhfRisk: number
  aiConfidence: number

  // Controls
  rvFailureSeverity: number
  heartRateControl: number
  paPressureControl: number
  cardiacOutputControl: number

  // History
  vitalHistory: VitalHistory[]
  notifications: Notification[]

  // Actions
  start: () => void
  pause: () => void
  reset: () => void
  injectRVFailure: () => void
  recoverPatient: () => void
  tick: () => void
  setViewMode: (mode: ViewMode) => void
  setRvFailureSeverity: (val: number) => void
  setLvadTargetRpm: (val: number) => void
  setHeartRateControl: (val: number) => void
  setPaPressureControl: (val: number) => void
  setCardiacOutputControl: (val: number) => void
  addNotification: (msg: string, type: Notification['type']) => void
}

const DEFAULT_STATE = {
  running: false,
  time: 0,
  viewMode: 'device' as ViewMode,
  heartRate: 72,
  systolicBP: 120,
  diastolicBP: 80,
  cardiacOutput: 5.2,
  temperature: 36.8,
  battery: 94,
  raPressure: 5,
  paPressure: 18,
  lvFilling: 12,
  lvadRpm: 9000,
  lvadFlow: 4.8,
  lvadTargetRpm: 9000,
  rvPumpState: 'OFF' as RVPumpState,
  rvPumpFlow: 0,
  rvPumpRpm: 0,
  aiState: 'Monitoring' as AIState,
  rhfRisk: 8,
  aiConfidence: 96,
  rvFailureSeverity: 0,
  heartRateControl: 72,
  paPressureControl: 18,
  cardiacOutputControl: 5.2,
  vitalHistory: [] as VitalHistory[],
  notifications: [] as Notification[],
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  ...DEFAULT_STATE,

  start: () => set({ running: true }),
  pause: () => set({ running: false }),

  reset: () => set({
    ...DEFAULT_STATE,
    notifications: [{
      id: crypto.randomUUID(),
      message: 'System reset complete',
      type: 'info',
      timestamp: Date.now(),
    }],
  }),

  injectRVFailure: () => {
    set({ rvFailureSeverity: 80, running: true })
    get().addNotification('Acute RV failure — elevated RA pressure, declining output', 'danger')
  },

  recoverPatient: () => {
    set({ rvFailureSeverity: 0 })
    get().addNotification('Clinical recovery — RV function restored', 'success')
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setRvFailureSeverity: (val) => set({ rvFailureSeverity: val }),
  setLvadTargetRpm: (val) => set({ lvadTargetRpm: val }),
  setHeartRateControl: (val) => set({ heartRateControl: val }),
  setPaPressureControl: (val) => set({ paPressureControl: val }),
  setCardiacOutputControl: (val) => set({ cardiacOutputControl: val }),

  addNotification: (message, type) => set((state) => ({
    notifications: [
      { id: crypto.randomUUID(), message, type, timestamp: Date.now() },
      ...state.notifications,
    ].slice(0, 50),
  })),

  tick: () => {
    const state = get()
    if (!state.running) return

    const dt = 1
    const time = state.time + dt
    const severity = state.rvFailureSeverity / 100

    // Simulate vitals with noise
    const noise = () => (Math.random() - 0.5) * 2
    const baseHR = state.heartRateControl + severity * 30
    const heartRate = Math.round(baseHR + noise() * 2)

    const baseSys = 120 - severity * 25
    const systolicBP = Math.round(baseSys + noise() * 3)
    const diastolicBP = Math.round(80 - severity * 15 + noise() * 2)

    const baseRA = 5 + severity * 18
    const raPressure = Math.round((baseRA + noise()) * 10) / 10

    const basePA = state.paPressureControl + severity * 25
    const paPressure = Math.round((basePA + noise()) * 10) / 10

    const baseCO = state.cardiacOutputControl - severity * 2.5
    const cardiacOutput = Math.round(Math.max(2, baseCO + noise() * 0.2) * 10) / 10

    const lvFilling = Math.round((12 - severity * 4 + noise()) * 10) / 10

    const battery = Math.max(0, state.battery - 0.002)
    const temperature = Math.round((36.8 + severity * 0.5 + noise() * 0.1) * 10) / 10

    // AI Logic
    let rhfRisk = severity * 100
    rhfRisk = Math.min(99, Math.max(0, rhfRisk + noise() * 3))
    rhfRisk = Math.round(rhfRisk)

    let aiState: AIState = 'Monitoring'
    let rvPumpState: RVPumpState = 'OFF'
    let rvPumpFlow = 0
    let rvPumpRpm = 0
    let lvadRpm = state.lvadRpm
    let lvadFlow = state.lvadFlow

    const prevAiState = state.aiState
    const prevRvPumpState = state.rvPumpState

    if (rhfRisk < 20) {
      aiState = 'Monitoring'
      rvPumpState = 'OFF'
      rvPumpFlow = 0
      rvPumpRpm = 0
      lvadRpm = Math.round(lerp(lvadRpm, state.lvadTargetRpm, 0.05))
    } else if (rhfRisk < 40) {
      aiState = 'Predicting RV Failure'
      rvPumpState = 'Standby'
      rvPumpFlow = 0
      rvPumpRpm = 1000
      lvadRpm = Math.round(lerp(lvadRpm, state.lvadTargetRpm, 0.05))
    } else if (rhfRisk < 70) {
      aiState = 'Compensating'
      rvPumpState = 'Active'
      rvPumpFlow = Math.round((severity * 3 + noise() * 0.1) * 10) / 10
      rvPumpRpm = Math.round(3000 + severity * 3000)
      lvadRpm = Math.round(lerp(lvadRpm, state.lvadTargetRpm - 500, 0.03))
    } else if (rhfRisk < 85) {
      aiState = 'Optimizing Flow'
      rvPumpState = 'Active'
      rvPumpFlow = Math.round((severity * 4 + noise() * 0.1) * 10) / 10
      rvPumpRpm = Math.round(5000 + severity * 2000)
      lvadRpm = Math.round(lerp(lvadRpm, state.lvadTargetRpm - 1000, 0.03))
    } else {
      aiState = 'Emergency Support'
      rvPumpState = 'Emergency'
      rvPumpFlow = Math.round((4.5 + noise() * 0.1) * 10) / 10
      rvPumpRpm = Math.round(7000 + severity * 1500)
      lvadRpm = Math.round(lerp(lvadRpm, state.lvadTargetRpm - 1500, 0.05))
    }

    lvadFlow = Math.round((lvadRpm / 9000 * 4.8 + noise() * 0.1) * 10) / 10

    // Notifications
    const notifications: Array<{ msg: string; type: Notification['type'] }> = []
    if (prevAiState !== aiState) {
      if (aiState === 'Predicting RV Failure') notifications.push({ msg: 'Elevated pulmonary pressure detected', type: 'warning' })
      if (aiState === 'Compensating') notifications.push({ msg: 'AI activated RV Assist pump', type: 'warning' })
      if (aiState === 'Emergency Support') notifications.push({ msg: '⚠ Emergency RV support activated', type: 'danger' })
      if (aiState === 'Monitoring' && prevAiState !== 'Monitoring') notifications.push({ msg: 'RV function normalized – support returning to standby', type: 'success' })
    }
    if (prevRvPumpState !== rvPumpState) {
      if (rvPumpState === 'Active') notifications.push({ msg: 'LVAD speed adjusted to balance flow', type: 'info' })
    }

    // History
    const historyEntry: VitalHistory = {
      time,
      raPressure,
      paPressure,
      lvadRpm,
      rvPumpFlow,
      cardiacOutput,
      heartRate,
    }
    const vitalHistory = [...state.vitalHistory, historyEntry].slice(-60)

    const rvFailureSeverity = state.rvFailureSeverity

    set({
      time,
      heartRate,
      systolicBP,
      diastolicBP,
      cardiacOutput,
      temperature,
      battery,
      raPressure,
      paPressure,
      lvFilling,
      lvadRpm,
      lvadFlow,
      rvPumpState,
      rvPumpFlow,
      rvPumpRpm,
      aiState,
      rhfRisk,
      aiConfidence: Math.round(96 - severity * 10 + noise()),
      vitalHistory,
      rvFailureSeverity,
    })

    for (const n of notifications) {
      get().addNotification(n.msg, n.type)
    }
  },
}))

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
