import { useEffect, useState, useCallback } from 'react'
import { useSimulationStore, Notification } from '../store/useSimulationStore'
import { motion, AnimatePresence } from 'framer-motion'

export function NotificationPanel() {
  const notifications = useSimulationStore((s) => s.notifications)
  const [visible, setVisible] = useState<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    const newIds = notifications.slice(0, 4).map((n) => n.id)
    setVisible((prev) => {
      const next = new Set(prev)
      for (const id of newIds) {
        if (!dismissed.has(id)) next.add(id)
      }
      return next
    })

    // Auto-dismiss after 3 seconds
    for (const id of newIds) {
      if (!dismissed.has(id)) {
        setTimeout(() => {
          dismiss(id)
        }, 3000)
      }
    }
  }, [notifications, dismissed])

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
    setVisible((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const visibleNotifications = notifications.filter((n) => visible.has(n.id))

  if (visibleNotifications.length === 0) return null

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'danger': return 'border-red-500/40 bg-red-500/10 text-red-300'
      case 'warning': return 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
      case 'success': return 'border-green-500/40 bg-green-500/10 text-green-300'
      default: return 'border-blue-500/30 bg-blue-500/10 text-blue-300'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {visibleNotifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-md text-xs font-medium ${getTypeStyles(n.type)}`}
          >
            <span className="flex-1">{n.message}</span>
            <button
              onClick={() => dismiss(n.id)}
              className="shrink-0 w-4 h-4 flex items-center justify-center rounded hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
