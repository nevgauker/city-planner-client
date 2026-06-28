import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

interface Props {
  onClick: () => void
}

export default function BackButton({ onClick }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="absolute top-4 left-4 z-20 p-3 sm:p-2 bg-cream-100 border border-taupe-300 rounded-lg hover:bg-cream-200 transition-colors shadow-sm min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto flex items-center justify-center"
    >
      <ChevronLeft className="w-6 h-6 text-neutral-dark" />
    </motion.button>
  )
}
