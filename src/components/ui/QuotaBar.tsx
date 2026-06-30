import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { submitUpgradeInterest } from '../../lib/api'
import { ChevronDown } from 'lucide-react'
import { toast } from 'react-toastify'
import AccountMenu from './AccountMenu'

interface Props {
  onSignInClick: () => void
  onViewTrips?: () => void
  onLogout?: () => void
}

export default function QuotaBar({ onSignInClick, onViewTrips, onLogout }: Props) {
  const { user, quota } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [hasNotified, setHasNotified] = useState(
    () => localStorage.getItem('upgrade_interest_notified') === 'true'
  )

  if (!user) {
    return (
      <motion.div
        className="fixed top-4 right-4 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <motion.button
          onClick={onSignInClick}
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign In
        </motion.button>
      </motion.div>
    )
  }

  const remaining = quota ? quota.monthlyGenerationsLimit - quota.monthlyGenerations : 10
  const limit = quota?.monthlyGenerationsLimit ?? 10
  const daysUntilReset = quota?.daysUntilReset ?? 30
  const isLow = remaining <= 2
  const isExhausted = remaining <= 0

  return (
    <motion.div
      className="fixed top-4 right-4 z-40 max-w-[calc(100vw-2rem)]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
        {isExhausted ? (
          <motion.button
            onClick={async () => {
              try {
                await submitUpgradeInterest('quota_exhausted')
                toast.success("You're on the list! We'll notify you when Pro launches.")
                localStorage.setItem('upgrade_interest_notified', 'true')
                setHasNotified(true)
              } catch {
                toast.error('Failed to register interest. Please try again.')
              }
            }}
            disabled={hasNotified}
            whileHover={!hasNotified ? { scale: 1.05 } : {}}
            whileTap={!hasNotified ? { scale: 0.95 } : {}}
            className={`glass-effect rounded-full px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              hasNotified ? 'text-accent-sage cursor-default' : 'text-accent-terracotta hover:bg-cream-200 cursor-pointer'
            }`}
            title={`Resets in ${daysUntilReset} ${daysUntilReset === 1 ? 'day' : 'days'}`}
          >
            {hasNotified ? "✓ List" : `${daysUntilReset}d`}
          </motion.button>
        ) : (
          <div className="glass-effect rounded-full px-2 sm:px-4 py-2 group cursor-help">
            <span className="text-xs sm:text-sm font-semibold text-neutral-dark whitespace-nowrap">
              {remaining}/{limit}
            </span>
            <div className="hidden group-hover:block absolute top-full mt-2 right-0 bg-neutral-dark text-cream-50 text-xs rounded px-3 py-2 whitespace-nowrap z-50 border border-taupe-300">
              Generation uses 1 credit. Resets every 30 days.
            </div>
          </div>
        )}

        <motion.button
          onClick={() => setShowMenu(!showMenu)}
          className="glass-effect rounded-full px-2 sm:px-4 py-2 flex items-center gap-1 sm:gap-2 hover:bg-cream-200 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xs sm:text-sm font-medium text-neutral-dark truncate max-w-[80px] sm:max-w-[120px]">{user.email}</span>
          <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-neutral-light transition-transform ${showMenu ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>

      {showMenu && (
        <AccountMenu
          onClose={() => setShowMenu(false)}
          quota={quota}
          onViewTrips={onViewTrips}
          onLogout={onLogout}
        />
      )}
    </motion.div>
  )
}
