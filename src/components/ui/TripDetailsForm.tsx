import { motion } from 'framer-motion'
import { Calendar, Zap } from 'lucide-react'

interface FormData {
  startDate: string
  endDate: string
  travelStyles: string[]
  pace: string
}

interface DurationPreset {
  label: string
  days: number
}

interface Props {
  city: string | null
  formData: FormData
  travelStyles: string[]
  paceOptions: ('Relaxed' | 'Balanced' | 'Packed')[]
  onTravelStyleToggle: (style: string) => void
  onPaceChange: (pace: 'Relaxed' | 'Balanced' | 'Packed') => void
  onDateChange: (field: 'startDate' | 'endDate', value: string) => void
  onSubmit: () => void
  tripDurationPresets?: DurationPreset[]
  onTripDurationPreset: (days: number) => void
  stylePresets?: Record<string, string[]>
  onStylePreset: (preset: string) => void
}

const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export default function TripDetailsForm({
  city, formData, travelStyles, paceOptions,
  onTravelStyleToggle, onPaceChange, onDateChange, onSubmit,
  tripDurationPresets, onTripDurationPreset, stylePresets, onStylePreset,
}: Props) {
  return (
    <div className="glass-effect card-elevation rounded-lg p-4 sm:p-8 space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-xl sm:text-3xl font-bold text-neutral-dark mb-2">Plan Your {city} Trip</h2>
        <p className="text-xs sm:text-base text-neutral-dark/60">Tell us about your travel preferences</p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-2 text-neutral-dark font-medium">
          <Calendar className="w-5 h-5 text-accent-terracotta" />
          Travel Dates
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['startDate', 'endDate'] as const).map((field) => (
            <div key={field}>
              <label className="text-xs text-neutral-dark/60 mb-1 block">{field === 'startDate' ? 'Start Date' : 'End Date'}</label>
              <input
                type="date"
                value={formData[field]}
                onChange={(e) => onDateChange(field, e.target.value)}
                className="w-full px-4 py-2 bg-cream-100 border border-taupe-300 rounded-lg text-neutral-dark placeholder-neutral-dark/40 focus:outline-none focus:border-accent-terracotta"
              />
              <p className="text-xs text-neutral-dark/40 mt-1">Selected: {formatDateDisplay(formData[field])}</p>
            </div>
          ))}
        </div>

        {formData.startDate && formData.endDate && (
          <div className="text-xs text-accent-terracotta bg-accent-terracotta/10 px-3 py-2 rounded">
            ✈️ {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
          </div>
        )}

        {tripDurationPresets && (
          <div className="mt-4 space-y-2">
            <label className="text-xs text-neutral-dark/60">Quick presets:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tripDurationPresets.map((preset) => (
                <motion.button key={preset.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onTripDurationPreset(preset.days)} className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-neutral-dark rounded border border-white/20 transition-colors">
                  {preset.label}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <label className="block text-neutral-dark font-medium">Travel Styles (select at least one)</label>
        {stylePresets && (
          <div className="mb-4 space-y-2">
            <label className="text-xs text-neutral-dark/60">Curated styles:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {Object.keys(stylePresets).map((preset) => (
                <motion.button key={preset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onStylePreset(preset)}
                  className={`px-3 py-2 text-xs rounded font-medium transition-all ${JSON.stringify(formData.travelStyles) === JSON.stringify(stylePresets![preset]) ? 'bg-accent-terracotta text-white' : 'bg-white/10 text-neutral-dark hover:bg-taupe-200 border border-white/20'}`}>
                  {preset}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {travelStyles.map((style) => (
            <motion.button key={style} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onTravelStyleToggle(style)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${formData.travelStyles.includes(style) ? 'bg-accent-terracotta text-neutral-dark' : 'bg-white/10 text-neutral-dark hover:bg-taupe-200 border border-white/20'}`}>
              {style}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-2 text-neutral-dark font-medium">
          <Zap className="w-5 h-5 text-accent-terracotta" />
          Travel Pace
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {paceOptions.map((pace) => (
            <motion.button key={pace} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onPaceChange(pace)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${formData.pace === pace ? 'bg-accent-terracotta text-neutral-dark' : 'bg-white/10 text-neutral-dark hover:bg-taupe-200 border border-white/20'}`}>
              {pace}
            </motion.button>
          ))}
        </div>
        <div className="mt-3 text-xs text-neutral-dark/60 space-y-1">
          <p><strong>Relaxed:</strong> 2–3 activities per day</p>
          <p><strong>Balanced:</strong> 4–5 activities per day</p>
          <p><strong>Packed:</strong> 6+ activities per day</p>
        </div>
      </div>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onSubmit} className="w-full px-4 sm:px-6 py-3 bg-accent-terracotta hover:bg-accent-terracotta_light text-neutral-dark font-bold rounded-lg transition-colors text-base sm:text-lg">
        Plan My Trip ✈️
      </motion.button>
    </div>
  )
}
