import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, Lock, Chrome } from 'lucide-react'
import type { CredentialResponse } from '@react-oauth/google'

interface Props {
  onSuccess: () => void
  onClose: () => void
}

export default function AuthModal({ onSuccess, onClose }: Props) {
  const { login, register, loading, error, loginWithGoogle } = useAuth()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!email || !password) { setLocalError('Email and password are required'); return }
    if (tab === 'signup') {
      if (password !== confirmPassword) { setLocalError('Passwords do not match'); return }
      if (password.length < 8) { setLocalError('Password must be at least 8 characters'); return }
    }

    const result = tab === 'signup' ? await register(email, password) : await login(email, password)

    if (result.success) {
      if (tab === 'signup' && !localStorage.getItem('beta_welcomed')) {
        toast.success('Welcome to City Planner! 🎉 You have 10 free itineraries.')
        localStorage.setItem('beta_welcomed', '1')
      }
      onSuccess()
    } else {
      setLocalError(result.error || 'Authentication failed')
    }
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLocalError('')
    try {
      const result = await loginWithGoogle(credentialResponse.credential!)
      if (result.success) {
        if (!localStorage.getItem('beta_welcomed')) {
          toast.success('Welcome to City Planner! 🎉 You have 10 free itineraries.')
          localStorage.setItem('beta_welcomed', '1')
        }
        onSuccess()
      } else {
        setLocalError(result.error || 'Google sign-in failed')
      }
    } catch (err) {
      setLocalError('Failed to process Google sign-in')
    }
  }

  const displayError = localError || error
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-dark/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card-elevation rounded-lg p-8 w-full max-w-md bg-cream-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-light text-neutral-dark mb-2">{tab === 'signin' ? 'Sign In' : 'Create Account'}</h2>
          <p className="text-neutral-light text-sm">{tab === 'signup' ? 'Create your account to plan your next adventure' : 'Sign in to your account'}</p>
        </div>

        <div className="flex gap-4 mb-6">
          {(['signin', 'signup'] as const).map((t) => (
            <motion.button
              key={t}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${tab === t ? 'bg-accent-terracotta text-cream-50' : 'bg-cream-200 text-neutral-dark hover:bg-cream-300'}`}
              onClick={() => { setTab(t); setLocalError('') }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t === 'signin' ? 'Sign In' : 'Create Account'}
            </motion.button>
          ))}
        </div>

        {/* Google OAuth Button */}
        {googleClientId && (
          <GoogleOAuthProvider clientId={googleClientId}>
            <motion.div
              className="mb-4 p-3 bg-accent-terracotta/5 border border-accent-terracotta/30 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-neutral-dark">
                <strong>💡 Tip:</strong> Sign in with Google uses your Google account. If you already have an account with this email and password, signing in with Google will link to that account.
              </p>
            </motion.div>

            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setLocalError('Google sign-in failed')}
                text={tab === 'signin' ? 'signin_with' : 'signup_with'}
              />
            </div>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-taupe-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-cream-50 text-neutral-light">or</span>
              </div>
            </div>
          </GoogleOAuthProvider>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[{ label: 'Email', type: 'email', value: email, onChange: setEmail, icon: Mail, placeholder: 'you@example.com' },
            { label: 'Password', type: 'password', value: password, onChange: setPassword, icon: Lock, placeholder: '••••••••' }
          ].map(({ label, type, value, onChange, icon: Icon, placeholder }) => (
            <div key={label}>
              <label className="block text-neutral-dark text-sm mb-2 font-medium">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-3.5 w-5 h-5 text-accent-terracotta/60" />
                <input
                  type={type}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="input-field pl-10"
                />
              </div>
            </div>
          ))}

          {tab === 'signup' && (
            <div>
              <label className="block text-neutral-dark text-sm mb-2 font-medium">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-accent-terracotta/60" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10"
                />
              </div>
            </div>
          )}

          {displayError && (
            <motion.div
              className="bg-red-100 border border-red-400 rounded-lg p-3 text-red-700 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {displayError}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? 'Loading...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}
