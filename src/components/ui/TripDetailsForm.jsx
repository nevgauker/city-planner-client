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
  tripDurationPresets,
  onTripDurationPreset,
  stylePresets,
  onStylePreset,
}) {
  return (
    <div className="glass-effect card-elevation rounded-lg p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-3xl font-bold text-white mb-2">Plan Your {city} Trip</h2>
        <p className="text-xs sm:text-base text-white/60">Tell us about your travel preferences</p>
      </div>

      {/* Date Range */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-white font-medium">
          <Calendar className="w-5 h-5 text-warm-accent" />
          Travel Dates
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Start Date</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => onDateChange('startDate', e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-warm-accent"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector('input[type="date"]')
                  if (input) input.click()
                }}
                className="px-3 py-2 bg-warm-accent/20 border border-warm-accent/50 rounded-lg hover:bg-warm-accent/30 transition-colors"
              >
                📅
              </button>
            </div>
            <p className="text-xs text-white/40 mt-1">Selected: {formatDateDisplay(formData.startDate)}</p>
          </div>
          <div>
            <label className="text-xs text-white/60 mb-1 block">End Date</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => onDateChange('endDate', e.target.value)}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-warm-accent"
              />
              <button
                type="button"
                onClick={() => {
                  const inputs = document.querySelectorAll('input[type="date"]')
                  if (inputs.length > 1) inputs[1].click()
                }}
                className="px-3 py-2 bg-warm-accent/20 border border-warm-accent/50 rounded-lg hover:bg-warm-accent/30 transition-colors"
              >
                📅
              </button>
            </div>
            <p className="text-xs text-white/40 mt-1">Selected: {formatDateDisplay(formData.endDate)}</p>
          </div>
        </div>
        {/* Show trip duration */}
        {formData.startDate && formData.endDate && (
          <div className="text-xs text-warm-accent bg-warm-accent/10 px-3 py-2 rounded">
            ✈️ {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))} days
          </div>
        )}

        {/* Quick Duration Presets */}
        {tripDurationPresets && (
          <div className="mt-4 space-y-2">
            <label className="text-xs text-white/60">Quick presets:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tripDurationPresets.map((preset) => (
                <motion.button
                  key={preset.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTripDurationPreset(preset.days)}
                  className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 transition-colors"
                >
                  {preset.label}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Travel Styles */}
      <div className="space-y-4">
        <label className="block text-white font-medium">Travel Styles (select at least one)</label>

        {/* Quick Style Presets */}
        {stylePresets && (
          <div className="mb-4 space-y-2">
            <label className="text-xs text-white/60">Curated styles:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {Object.keys(stylePresets).map((preset) => (
                <motion.button
                  key={preset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onStylePreset(preset)}
                  className={`px-3 py-2 text-xs rounded font-medium transition-all ${
                    JSON.stringify(formData.travelStyles) === JSON.stringify(stylePresets[preset])
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {preset}
                </motion.button>
              ))}
            </div>
          </div>
        )}

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
        className="w-full px-4 sm:px-6 py-3 bg-warm-accent hover:bg-warm-light text-navy-900 font-bold rounded-lg transition-colors text-base sm:text-lg"
      >
        Plan My Trip ✈️
      </motion.button>
    </div>
  )
}
