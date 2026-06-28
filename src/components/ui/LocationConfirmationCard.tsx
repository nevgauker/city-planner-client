import { motion } from 'framer-motion'
import { MapPin, Check, X } from 'lucide-react'

interface Props {
  address: string
  city: string
  isLoading: boolean
  onConfirm: () => void
  onChangeLocation: () => void
}

export default function LocationConfirmationCard({ address, city, isLoading, onConfirm, onChangeLocation }: Props) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50"
    >
      <div className="glass-effect card-elevation rounded-lg p-6">
        <div className="flex items-start gap-4">
          <MapPin className="w-5 h-5 text-accent-terracotta flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-neutral-dark font-medium mb-1">Home base location</h3>
            <p className="text-neutral-dark/70 text-sm mb-4">{address}</p>
            <p className="text-neutral-dark/60 text-xs mb-4">in {city}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onChangeLocation}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-taupe-300 rounded-lg text-neutral-dark hover:bg-taupe-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Change
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-accent-terracotta hover:bg-accent-terracotta_light text-neutral-dark rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-neutral-dark border-t-transparent rounded-full" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm & Continue
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
