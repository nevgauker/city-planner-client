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
      className="absolute top-full right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] card-elevation rounded-lg p-4 z-50"
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-4">
        <div>
          <p className="text-neutral-light text-sm mb-1">Account</p>
          <p className="text-neutral-dark font-medium truncate">{user?.email}</p>
        </div>
        <div className="border-t border-taupe-300" />
        <div>
          <p className="text-neutral-light text-sm mb-1">Plan</p>
          <p className="text-accent-sage font-medium capitalize">{quota?.planTier ?? 'Beta'} (free)</p>
        </div>
        <div className="border-t border-taupe-300" />
        <div>
          <p className="text-neutral-light text-sm mb-1">Quota</p>
          <p className="text-neutral-dark font-medium">{remaining} of {limit} generations left</p>
          <p className="text-neutral-light text-xs mt-1">Resets in {resetDays} days</p>
        </div>
        <div className="border-t border-taupe-300" />
        <motion.button
          onClick={() => { onViewTrips?.(); onClose() }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-accent-sage/10 border border-accent-sage/30 hover:bg-accent-sage/20 rounded-lg text-accent-sage font-medium transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Archive className="w-4 h-4" />
          My Trips
        </motion.button>
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-accent-terracotta/10 border border-accent-terracotta/30 hover:bg-accent-terracotta/20 rounded-lg text-accent-terracotta font-medium transition-all"
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
