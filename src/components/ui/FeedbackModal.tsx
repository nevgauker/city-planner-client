import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { submitFeedback } from '../../lib/api'
import { Star } from 'lucide-react'

interface Props {
  city: string
  onClose: () => void
  initialRating?: number
}

export default function FeedbackModal({ city, onClose, initialRating = 0 }: Props) {
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await submitFeedback(rating, city, comment, wouldRecommend)
      localStorage.setItem(`feedback_rated_${city}`, '1')
      localStorage.setItem(`feedback_rating_${city}`, rating.toString())
      toast.success('Thanks for your feedback!')
      onClose()
    } catch {
      toast.error('Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(`feedback_rated_${city}`, '1')
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleDismiss}
    >
      <motion.div
        className="glass-effect card-elevation rounded-lg p-8 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-2 text-white">How was your {city} itinerary?</h2>
        <p className="text-white/60 text-sm mb-6">Your feedback helps us improve City Planner</p>

        <div className="space-y-6">
          <div>
            <p className="text-white/80 text-sm mb-3">Rate your experience</p>
            <div className="flex gap-4 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button key={star} onClick={() => setRating(star)} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                  <Star className={`w-8 h-8 transition-colors ${star <= rating ? 'fill-accent-terracotta text-accent-terracotta' : 'text-white/30'}`} />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">What did you love or want to improve? (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Tell us what you think..."
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-accent-terracotta focus:ring-2 focus:ring-accent-terracotta/30 transition-all resize-none h-24"
            />
            <p className="text-white/40 text-xs mt-1">{comment.length}/500 characters</p>
          </div>

          <div>
            <p className="text-white/80 text-sm mb-3">Would you recommend City Planner to a friend?</p>
            <div className="flex gap-3">
              {([true, false] as const).map((val) => (
                <motion.button
                  key={String(val)}
                  onClick={() => setWouldRecommend(wouldRecommend === val ? null : val)}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                    wouldRecommend === val
                      ? val ? 'bg-green-900/50 border border-green-500/50 text-green-300' : 'bg-red-900/50 border border-red-500/50 text-red-300'
                      : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {val ? 'Yes' : 'No'}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button onClick={handleDismiss} className="flex-1 py-3 px-4 border border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Not now
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={!rating || loading}
              className="flex-1 py-3 px-4 bg-accent-terracotta hover:bg-accent-terracotta_light text-neutral-dark rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={rating && !loading ? { scale: 1.02 } : {}}
              whileTap={rating && !loading ? { scale: 0.98 } : {}}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
