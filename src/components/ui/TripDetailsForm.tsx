import { motion } from 'framer-motion'
import { Calendar, Zap, Sparkles, Leaf } from 'lucide-react'
import type { Taxonomy } from '../../types/api'

interface FormData {
  startDate: string
  endDate: string
  travelStyles: string[]
  pace: string
  subCategories: Record<string, string[]>
  dietary: string[]
}

interface StylePresetInfo {
  emoji: string
  subtitle: string
  styles: string[]
}

interface PaceOption {
  value: 'Relaxed' | 'Balanced' | 'Packed'
  label: string
  sub: string
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
  stylePresetsWithInfo?: Record<string, StylePresetInfo>
  onStylePreset: (preset: string) => void
  selectedPreset?: string | null
  onHoverToggle?: () => void
  taxonomy?: Taxonomy | null
  onSubCategoryToggle: (categoryId: string, subId: string) => void
  onDietaryToggle: (dietaryId: string) => void
}

const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

const PACE_DATA: PaceOption[] = [
  { value: 'Relaxed', label: 'Relaxed', sub: '2–3 activities / day' },
  { value: 'Balanced', label: 'Balanced', sub: '4–5 activities / day' },
  { value: 'Packed', label: 'Packed', sub: '6+ activities / day' },
]

function calculateDays(startDate: string, endDate: string): number | null {
  if (!startDate || !endDate) return null
  return Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export default function TripDetailsForm({
  city, formData, travelStyles, paceOptions,
  onTravelStyleToggle, onPaceChange, onDateChange, onSubmit,
  tripDurationPresets, onTripDurationPreset, stylePresetsWithInfo, onStylePreset,
  selectedPreset, onHoverToggle, taxonomy, onSubCategoryToggle, onDietaryToggle,
}: Props) {
  const days = calculateDays(formData.startDate, formData.endDate)

  // Only show sub-categories for styles the traveller actually picked, and only
  // for styles that have any — otherwise the form balloons with irrelevant chips.
  const refinable = (taxonomy?.categories ?? []).filter(
    (c) => c.subCategories.length > 0 && formData.travelStyles.includes(c.label)
  )
  return (
    <div className="glass-effect card-elevation rounded-lg p-5 sm:p-8 pt-10 sm:pt-12 pb-8 sm:pb-10 space-y-8 sm:space-y-10">
      <div className="text-center pb-6 border-b-2 border-taupe-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-dark mb-3">Plan Your {city} Trip</h2>
        <p className="text-sm sm:text-base text-neutral-dark/70">Tell us about your travel preferences</p>
      </div>

      {/* Section: Choose a Vibe (Style Presets) */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={24} className="text-accent-terracotta" />
          <span className="text-lg font-semibold text-neutral-dark">Choose a Vibe</span>
        </div>
        {stylePresetsWithInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(stylePresetsWithInfo).map(([preset, info]) => (
              <motion.button
                key={preset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onStylePreset(preset)}
                className={`flex flex-col items-start p-4 sm:p-4 rounded-lg border transition-all min-h-[110px] sm:min-h-[100px] ${
                  selectedPreset === preset
                    ? 'bg-accent-terracotta text-white border-accent-terracotta'
                    : 'bg-cream-50 border-taupe-300 text-neutral-dark hover:border-accent-terracotta/50 hover:bg-cream-200'
                }`}
              >
                <span className="text-2xl mb-2">{info.emoji}</span>
                <span className="font-semibold text-base">{preset}</span>
                <span className={`text-sm sm:text-xs mt-2 ${selectedPreset === preset ? 'text-white/80' : 'text-neutral-dark/60'}`}>{info.subtitle}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-taupe-200" />
        <span className="text-xs text-neutral-dark/50 whitespace-nowrap">or mix your own</span>
        <div className="flex-1 h-px bg-taupe-200" />
      </div>

      {/* Section: Individual Style Toggles */}
      <div className="space-y-4">
        {selectedPreset && (
          <p className="text-sm text-neutral-dark/50 italic">Customizing {selectedPreset}…</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {travelStyles.map((style) => (
            <motion.button
              key={style}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTravelStyleToggle(style)}
              className={`px-3 sm:px-4 py-3 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-all ${
                formData.travelStyles.includes(style)
                  ? 'bg-accent-terracotta text-white border border-accent-terracotta'
                  : 'bg-cream-50 border border-taupe-300 text-neutral-dark hover:border-accent-terracotta/50 hover:bg-cream-200'
              }`}
            >
              {style}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Section: Optional sub-categories, per selected style */}
      {refinable.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <Sparkles size={20} className="text-accent-sage" />
            <span className="text-base font-semibold text-neutral-dark">Get more specific</span>
            <span className="text-xs text-neutral-dark/50">optional</span>
          </div>
          {refinable.map((category) => (
            <div key={category.id} className="space-y-2">
              <label className="text-sm text-neutral-dark/60 font-medium">
                {category.emoji} {category.label}
              </label>
              <div className="flex flex-wrap gap-2">
                {category.subCategories.map((sub) => {
                  const active = (formData.subCategories[category.id] ?? []).includes(sub.id)
                  return (
                    <motion.button
                      key={sub.id}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onSubCategoryToggle(category.id, sub.id)}
                      aria-pressed={active}
                      className={`px-3 py-2 rounded-full text-sm transition-all border ${
                        active
                          ? 'bg-accent-sage text-white border-accent-sage'
                          : 'bg-cream-50 border-taupe-300 text-neutral-dark hover:border-accent-sage/50 hover:bg-cream-200'
                      }`}
                    >
                      {sub.label}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section: Dietary needs — constraints, not preferences */}
      {taxonomy?.dietary?.length ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <Leaf size={20} className="text-accent-sage" />
            <span className="text-base font-semibold text-neutral-dark">Dietary needs</span>
            <span className="text-xs text-neutral-dark/50">optional</span>
          </div>
          <p className="text-xs text-neutral-dark/60">
            Applied to every food stop, whatever else you pick.
          </p>
          <div className="flex flex-wrap gap-2">
            {taxonomy.dietary.map((option) => {
              const active = formData.dietary.includes(option.id)
              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onDietaryToggle(option.id)}
                  aria-pressed={active}
                  className={`px-3 py-2 rounded-full text-sm transition-all border ${
                    active
                      ? 'bg-accent-terracotta text-white border-accent-terracotta'
                      : 'bg-cream-50 border-taupe-300 text-neutral-dark hover:border-accent-terracotta/50 hover:bg-cream-200'
                  }`}
                >
                  {option.label}
                </motion.button>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Section: Travel Dates */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Calendar size={24} className="text-accent-terracotta" />
          <span className="text-lg font-semibold text-neutral-dark">When are you going?</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['startDate', 'endDate'] as const).map((field) => (
            <div key={field}>
              <label className="text-sm text-neutral-dark/60 mb-2 block font-medium">{field === 'startDate' ? 'Start Date' : 'End Date'}</label>
              <input
                type="date"
                value={formData[field]}
                onChange={(e) => onDateChange(field, e.target.value)}
                className="w-full px-4 py-3 bg-cream-100 border border-taupe-300 rounded-lg text-neutral-dark text-base placeholder-neutral-dark/40 focus:outline-none focus:border-accent-terracotta"
              />
            </div>
          ))}
        </div>

        {days && (
          <div className="inline-flex items-center gap-2 text-xs text-accent-terracotta bg-accent-terracotta/10 px-3 py-2 rounded">
            ✈️ <span className="font-semibold">{days} days</span>
          </div>
        )}

        {tripDurationPresets && (
          <div className="space-y-3">
            <label className="text-sm text-neutral-dark/60 font-medium">Quick pick:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tripDurationPresets.map((preset) => (
                <motion.button
                  key={preset.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTripDurationPreset(preset.days)}
                  className="px-3 py-3 sm:py-2 text-sm sm:text-xs bg-cream-50 border border-taupe-300 text-neutral-dark rounded font-medium hover:border-accent-terracotta/50 hover:bg-cream-200 transition-all flex flex-col items-center justify-center"
                >
                  <span className="text-base sm:text-sm font-semibold">{preset.label}</span>
                  <span className="text-xs sm:text-xs text-neutral-dark/60">{preset.days}d</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section: Travel Pace */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Zap size={24} className="text-accent-terracotta" />
          <span className="text-lg font-semibold text-neutral-dark">What's your pace?</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PACE_DATA.map((paceOption) => (
            <motion.button
              key={paceOption.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPaceChange(paceOption.value)}
              className={`flex flex-col items-start p-4 sm:p-4 rounded-lg border transition-all min-h-[100px] sm:min-h-[90px] ${
                formData.pace === paceOption.value
                  ? 'bg-accent-terracotta text-white border-accent-terracotta'
                  : 'bg-cream-50 border-taupe-300 text-neutral-dark hover:border-accent-terracotta/50 hover:bg-cream-200'
              }`}
            >
              <span className="font-semibold text-base">{paceOption.label}</span>
              <span className={`text-sm sm:text-xs mt-2 ${formData.pace === paceOption.value ? 'text-white/80' : 'text-neutral-dark/60'}`}>{paceOption.sub}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSubmit}
        className="w-full px-4 sm:px-6 py-4 sm:py-3 bg-accent-terracotta hover:bg-accent-terracotta_light text-white font-bold rounded-lg transition-colors text-lg sm:text-lg"
      >
        Plan My Trip ✈️
      </motion.button>
    </div>
  )
}
