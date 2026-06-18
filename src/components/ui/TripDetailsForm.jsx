import { motion } from 'framer-motion'
import { Calendar, Zap } from 'lucide-react'

// Convert YYYY-MM-DD to DD/MM/YYYY
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

// Convert DD/MM/YYYY to YYYY-MM-DD
const formatDateInternal = (displayStr) => {
  if (!displayStr) return ''
  const parts = displayStr.split('/')
  if (parts.length !== 3) return ''
  const [day, month, year] = parts
  if (!day || !month || !year || year.length !== 4) return ''
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export default function TripDetailsForm({
  city,
  formData,
  travelStyles,
  paceOptions,
  onTravelStyleToggle,
  onPaceChange,
  onDateChange,
  onSubmit,
}) {
  return (
    <div className="glass-effect card-elevation rounded-lg p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Plan Your {city} Trip</h2>
        <p className="text-white/60">Tell us about your travel preferences</p>
      </div>

      {/* Date Range */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-white font-medium">
          <Calendar className="w-5 h-5 text-warm-accent" />
          Travel Dates
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Start Date (DD/MM/YYYY)</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={formatDateDisplay(formData.startDate)}
              onChange={(e) => {
                const internalFormat = formatDateInternal(e.target.value)
                if (internalFormat) {
                  onDateChange('startDate', internalFormat)
                }
              }}
              maxLength="10"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-warm-accent"
            />
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">End Date (DD/MM/YYYY)</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={formatDateDisplay(formData.endDate)}
              onChange={(e) => {
                const internalFormat = formatDateInternal(e.target.value)
                if (internalFormat) {
                  onDateChange('endDate', internalFormat)
                }
              }}
              maxLength="10"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-warm-accent"
            />
          </div>
        </div>
        {/* Show trip duration */}
        {formData.startDate && formData.endDate && (
          <div className="text-xs text-warm-accent bg-warm-accent/10 px-3 py-2 rounded">
            ✈️ {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} days
          </div>
        )}
      </div>

      {/* Travel Styles */}
      <div className="space-y-4">
        <label className="block text-white font-medium">Travel Styles (select at least one)</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {travelStyles.map((style) => (
            <motion.button
              key={style}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTravelStyleToggle(style)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                formData.travelStyles.includes(style)
                  ? 'bg-warm-accent text-navy-900'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              {style}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Pace */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-white font-medium">
          <Zap className="w-5 h-5 text-warm-accent" />
          Travel Pace
        </label>
        <div className="grid grid-cols-3 gap-3">
          {paceOptions.map((pace) => (
            <motion.button
              key={pace}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPaceChange(pace)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                formData.pace === pace
                  ? 'bg-warm-accent text-navy-900'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              {pace}
            </motion.button>
          ))}
        </div>

        {/* Pace Descriptions */}
        <div className="mt-3 text-xs text-white/60 space-y-1">
          <p>
            <strong>Relaxed:</strong> 2-3 activities per day, leisurely pace
          </p>
          <p>
            <strong>Balanced:</strong> 4-5 activities per day, moderate pace
          </p>
          <p>
            <strong>Packed:</strong> 6+ activities per day, maximize experiences
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSubmit}
        className="w-full px-6 py-3 bg-warm-accent hover:bg-warm-light text-navy-900 font-bold rounded-lg transition-colors text-lg"
      >
        Plan My Trip ✈️
      </motion.button>
    </div>
  )
}
