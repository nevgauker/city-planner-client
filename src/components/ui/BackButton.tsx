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
      className="absolute top-4 left-4 z-20 p-2 glass-effect card-elevation rounded-lg hover:bg-white/20 transition-colors"
    >
      <ChevronLeft className="w-6 h-6 text-white" />
    </motion.button>
  )
}
