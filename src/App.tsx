import { useSimulationLoop } from './hooks/useSimulationLoop'
import { useSimulationStore } from './store/useSimulationStore'
import { DeviceScene } from './components/DeviceScene'
import { HeartScene } from './components/HeartScene'
import { VitalsPanel } from './ui/VitalsPanel'
import { AIStatusPanel } from './ui/AIStatusPanel'
import { LiveGraphs } from './charts/LiveGraphs'
import { SimulationControls } from './ui/SimulationControls'
import { NotificationPanel } from './ui/NotificationPanel'
import { PatientPanel } from './ui/PatientPanel'
import { CardiologistPanel } from './ui/CardiologistPanel'
import { Header } from './ui/Header'
import { motion, AnimatePresence } from 'framer-motion'

export default function App() {
  useSimulationLoop()
  const viewMode = useSimulationStore((s) => s.viewMode)

  return (
    <div className="h-screen w-screen flex flex-col bg-dark-900 font-sans select-none">
      <Header />

      <AnimatePresence mode="wait">
        {viewMode === 'device' && (
          <motion.div
            key="device"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 relative min-h-0">
              <DeviceScene />
              <div className="absolute top-4 left-4 max-w-xs">
                <div className="bg-neutral-950/90 backdrop-blur border border-neutral-800 rounded-md px-4 py-3">
                  <h2 className="text-xs font-medium text-neutral-200 mb-1.5">AICARES Device Assembly</h2>
                  <p className="text-[10.5px] leading-relaxed text-neutral-500">
                    Hover over any component to learn how it works. The system consists of a primary LVAD
                    implanted in the left ventricle, an adaptive right ventricular assist pump controlled
                    by an AI algorithm, and an external controller that manages both devices.
                  </p>
                </div>
              </div>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <span className="text-[10px] text-neutral-600">
                  Drag to rotate · Scroll to zoom · Right-click to pan
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'simulation' && (
          <motion.div
            key="simulation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex-1 grid grid-cols-[1fr_320px_320px] gap-2 p-2 min-h-0">
              <div className="glass relative overflow-hidden">
                <HeartScene />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[9.5px] text-neutral-500 bg-neutral-950/80 rounded px-2 py-1">
                    Note: This device stabilizes the patient during RV failure by supporting pulmonary circulation — it does not cure the underlying condition.
                  </p>
                </div>
              </div>
              <VitalsPanel />
              <AIStatusPanel />
            </div>

            <div className="h-[280px] shrink-0 grid grid-cols-[1fr_360px] gap-2 px-2 pb-4 pt-1">
              <LiveGraphs />
              <SimulationControls />
            </div>
          </motion.div>
        )}

        {viewMode === 'patient' && (
          <motion.div
            key="patient"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 p-4 overflow-auto"
          >
            <PatientPanel />
          </motion.div>
        )}

        {viewMode === 'cardiologist' && (
          <motion.div
            key="cardiologist"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 p-4 overflow-auto"
          >
            <CardiologistPanel />
          </motion.div>
        )}
      </AnimatePresence>

      <NotificationPanel />
    </div>
  )
}
