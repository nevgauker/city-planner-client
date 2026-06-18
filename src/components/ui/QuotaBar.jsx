import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { ChevronDown } from 'lucide-react';
import AccountMenu from './AccountMenu.jsx';

export default function QuotaBar({ onSignInClick }) {
  const { user, quota } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) {
    return (
      <motion.div
        className='fixed top-4 right-4 z-40'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <motion.button
          onClick={onSignInClick}
          className='px-6 py-2 bg-warm-accent hover:bg-warm-light text-navy-900 font-bold rounded-full transition-colors'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign In
        </motion.button>
      </motion.div>
    );
  }

  const remaining = quota
    ? quota.monthlyGenerationsLimit - quota.monthlyGenerations
    : 10;
  const limit = quota?.monthlyGenerationsLimit || 10;
  const isLow = remaining <= 2;
  const isExhausted = remaining <= 0;

  return (
    <motion.div
      className='fixed top-4 right-4 z-40'
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className='flex items-center gap-3'>
        {isExhausted ? (
          <div className='glass-effect card-elevation rounded-full px-4 py-2 text-sm'>
            <span className='text-red-400 font-semibold'>
              Quota reached · Upgrade coming soon
            </span>
          </div>
        ) : (
          <div className='glass-effect card-elevation rounded-full px-4 py-2 flex items-center gap-3'>
            <div className='flex gap-1'>
              {[...Array(limit)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < remaining
                      ? isLow
                        ? 'bg-amber-400'
                        : 'bg-warm-accent'
                      : 'bg-white/20'
                  }`}
                  animate={
                    isLow && i < remaining
                      ? { opacity: [1, 0.5, 1] }
                      : { opacity: 1 }
                  }
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              ))}
            </div>
            <span className={`text-sm font-semibold ${
              isLow ? 'text-amber-400' : 'text-warm-accent'
            }`}>
              {remaining} left
            </span>
          </div>
        )}

        <motion.button
          onClick={() => setShowMenu(!showMenu)}
          className='glass-effect card-elevation rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/20 transition-all'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className='text-sm text-white/80 truncate max-w-[120px]'>
            {user.email}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-white/60 transition-transform ${
              showMenu ? 'rotate-180' : ''
            }`}
          />
        </motion.button>
      </div>

      {showMenu && (
        <AccountMenu onClose={() => setShowMenu(false)} quota={quota} />
      )}
    </motion.div>
  );
}
