import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Mail, Lock } from 'lucide-react';

export default function AuthModal({ onSuccess, onClose }) {
  const { login, register, loading, error } = useAuth();
  const [tab, setTab] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Email and password are required');
      return;
    }

    if (tab === 'signup') {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setLocalError('Password must be at least 8 characters');
        return;
      }
    }

    const result =
      tab === 'signin'
        ? await login(email, password)
        : await register(email, password);

    if (result.success) {
      onSuccess();
    } else {
      setLocalError(result.error || 'Authentication failed');
    }
  };

  const displayError = localError || error;

  return (
    <motion.div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className='glass-effect card-elevation rounded-lg p-8 w-full max-w-md'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='mb-8'>
          <h2 className='text-2xl font-bold mb-2'>
            {tab === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className='text-white/60 text-sm'>
            {tab === 'signup'
              ? 'Create your free account to generate your itinerary'
              : 'Sign in to your account'}
          </p>
        </div>

        <div className='flex gap-4 mb-6'>
          <motion.button
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              tab === 'signin'
                ? 'bg-warm-accent text-navy-900'
                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
            }`}
            onClick={() => {
              setTab('signin');
              setLocalError('');
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In
          </motion.button>
          <motion.button
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              tab === 'signup'
                ? 'bg-warm-accent text-navy-900'
                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
            }`}
            onClick={() => {
              setTab('signup');
              setLocalError('');
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Account
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-white/80 text-sm mb-2'>Email</label>
            <div className='relative'>
              <Mail className='absolute left-3 top-3.5 w-5 h-5 text-warm-accent/60' />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                className='w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/30 transition-all'
              />
            </div>
          </div>

          <div>
            <label className='block text-white/80 text-sm mb-2'>
              Password
            </label>
            <div className='relative'>
              <Lock className='absolute left-3 top-3.5 w-5 h-5 text-warm-accent/60' />
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
                className='w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/30 transition-all'
              />
            </div>
          </div>

          {tab === 'signup' && (
            <div>
              <label className='block text-white/80 text-sm mb-2'>
                Confirm Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3.5 w-5 h-5 text-warm-accent/60' />
                <input
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder='••••••••'
                  className='w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/30 transition-all'
                />
              </div>
            </div>
          )}

          {displayError && (
            <motion.div
              className='bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm'
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {displayError}
            </motion.div>
          )}

          <motion.button
            type='submit'
            disabled={loading}
            className='w-full py-3 bg-warm-accent hover:bg-warm-light text-navy-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading
              ? 'Loading...'
              : tab === 'signin'
                ? 'Sign In'
                : 'Create Account'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
