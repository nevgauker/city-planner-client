import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { LogOut, Archive } from 'lucide-react'
import type { Quota } from '../../types/api'

interface Props {
  onClose: () => void
  quota: Quota | null
  onViewTrips?: () => void
  onLogout?: () => void
}

export default function AccountMenu({ onClose, quota, onViewTrips, onLogout }: Props) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    onLogout?.()
    onClose()
  }

  const remaining = quota ? quota.monthlyGenerationsLimit - quota.monthlyGenerations : 10
  const limit = quota?.monthlyGenerationsLimit ?? 10
  const resetDays = quota?.daysUntilReset ?? 30

  return (
    <motion.div
      className="absolute top-full right-0 mt-2 w-56 glass-effect card-elevation rounded-lg p-4 z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-4">
        <div>
          <p className="text-white/80 text-sm mb-1">Account</p>
          <p className="text-white font-medium truncate">{user?.email}</p>
        </div>
        <div className="border-t border-white/20" />
        <div>
          <p className="text-white/80 text-sm mb-1">Plan</p>
          <p className="text-warm-accent font-medium capitalize">{quota?.planTier ?? 'Beta'} (free)</p>
        </div>
        <div className="border-t border-white/20" />
        <div>
          <p className="text-white/80 text-sm mb-1">Quota</p>
          <p className="text-white font-medium">{remaining} of {limit} generations left</p>
          <p className="text-white/60 text-xs mt-1">Resets in {resetDays} days</p>
        </div>
        <div className="border-t border-white/20" />
        <motion.button
          onClick={() => { onViewTrips?.(); onClose() }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-900/30 border border-blue-500/50 hover:bg-blue-900/50 rounded-lg text-blue-300 font-medium transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Archive className="w-4 h-4" />
          My Trips
        </motion.button>
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-900/30 border border-red-500/50 hover:bg-red-900/50 rounded-lg text-red-300 font-medium transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.button>
      </div>
    </motion.div>
  )
}
