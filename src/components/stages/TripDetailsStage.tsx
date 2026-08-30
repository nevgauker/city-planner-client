import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import TripDetailsForm from '../ui/TripDetailsForm'
import BackButton from '../ui/BackButton'
import { getTaxonomy } from '../../lib/api'
import type { Taxonomy } from '../../types/api'

const TRAVEL_STYLES = ['Culture', 'Food & Drink', 'Nightlife', 'Nature', 'Shopping', 'Hidden Gems', 'Wellness']
const PACE_OPTIONS: ('Relaxed' | 'Balanced' | 'Packed')[] = ['Relaxed', 'Balanced', 'Packed']
const TRAVEL_STYLE_PRESETS = {
  'Beach Bum': { emoji: '🏖️', subtitle: 'Sun, sea & chill', styles: ['Nature', 'Food & Drink', 'Wellness'] },
  'Culture Vulture': { emoji: '🎭', subtitle: 'Art, history & museums', styles: ['Culture', 'Hidden Gems', 'Food & Drink'] },
  'Foodie Paradise': { emoji: '🍝', subtitle: 'Markets, bites & drinks', styles: ['Food & Drink', 'Culture', 'Shopping'] },
  'Adventure Seeker': { emoji: '🏔️', subtitle: 'Outdoors & off the map', styles: ['Nature', 'Nightlife', 'Hidden Gems'] },
  'Luxury Explorer': { emoji: '💎', subtitle: 'Comfort & exclusivity', styles: ['Shopping', 'Wellness', 'Food & Drink'] },
}
const TRIP_DURATION_PRESETS = [
  { label: 'Weekend', days: 3 },
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '3 Weeks', days: 21 },
]

interface FormData {
  startDate: string
  endDate: string
  travelStyles: string[]
  pace: 'Relaxed' | 'Balanced' | 'Packed'
  subCategories: Record<string, string[]>
  dietary: string[]
}

interface Props {
  city: string | null
  onSubmit: (formData: FormData) => void
  onBack: () => void
}

export default function TripDetailsStage({ city, onSubmit, onBack }: Props) {
  const getDefaultDates = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const endDate = new Date(tomorrow)
    endDate.setDate(endDate.getDate() + 6)
    const fmt = (d: Date) => d.toISOString().split('T')[0]
    return { startDate: fmt(tomorrow), endDate: fmt(endDate) }
  }

  const [formData, setFormData] = useState<FormData>({
    ...getDefaultDates(),
    travelStyles: [],
    pace: 'Balanced',
    subCategories: {},
    dietary: [],
  })
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null)

  // Sub-categories are an enhancement: if the taxonomy cannot be loaded the
  // form still works with the styles below, so failure is silent by design.
  useEffect(() => {
    getTaxonomy().then(setTaxonomy)
  }, [])

  const categoryIdFor = (label: string) => taxonomy?.categories.find((c) => c.label === label)?.id

  const handleTravelStyleToggle = (style: string) => {
    setFormData((prev) => {
      const removing = prev.travelStyles.includes(style)
      const subCategories = { ...prev.subCategories }

      // Deselecting a style discards its refinements — keeping them would send
      // preferences for a category the traveller is no longer asking for.
      if (removing) {
        const id = categoryIdFor(style)
        if (id) delete subCategories[id]
      }

      return {
        ...prev,
        travelStyles: removing ? prev.travelStyles.filter((s) => s !== style) : [...prev.travelStyles, style],
        subCategories,
      }
    })
    setSelectedPreset(null)
  }

  const handleSubCategoryToggle = (categoryId: string, subId: string) => {
    setFormData((prev) => {
      const current = prev.subCategories[categoryId] ?? []
      const next = current.includes(subId) ? current.filter((s) => s !== subId) : [...current, subId]
      const subCategories = { ...prev.subCategories }
      if (next.length) subCategories[categoryId] = next
      else delete subCategories[categoryId]
      return { ...prev, subCategories }
    })
  }

  const handleDietaryToggle = (dietaryId: string) => {
    setFormData((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(dietaryId)
        ? prev.dietary.filter((d) => d !== dietaryId)
        : [...prev.dietary, dietaryId],
    }))
  }

  const handleStylePreset = (preset: string) => {
    const styles = TRAVEL_STYLE_PRESETS[preset as keyof typeof TRAVEL_STYLE_PRESETS]?.styles || []
    // A preset replaces the style selection outright, so refinements tied to the
    // old selection no longer apply. Dietary needs are constraints, not part of
    // the vibe, and survive.
    setFormData((prev) => ({ ...prev, travelStyles: styles, subCategories: {} }))
    setSelectedPreset(preset)
  }

  const handleTripDurationPreset = (days: number) => {
    const start = new Date(); start.setDate(start.getDate() + 1)
    const end = new Date(start); end.setDate(end.getDate() + days - 1)
    const fmt = (d: Date) => d.toISOString().split('T')[0]
    setFormData((prev) => ({ ...prev, startDate: fmt(start), endDate: fmt(end) }))
  }

  const handleSubmit = () => {
    if (!formData.startDate || !formData.endDate) {
      toast.warn('Please select both start and end dates')
      return
    }
    if (formData.travelStyles.length === 0) {
      toast.warn('Please select at least one travel style')
      return
    }
    onSubmit(formData)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full bg-cream-50 flex flex-col items-center pt-20 sm:pt-24 px-3 sm:px-4 pb-6 overflow-y-auto">
      <BackButton onClick={onBack} />
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full max-w-2xl mb-6">
        <TripDetailsForm
          city={city}
          formData={formData}
          travelStyles={TRAVEL_STYLES}
          paceOptions={PACE_OPTIONS}
          onTravelStyleToggle={handleTravelStyleToggle}
          onPaceChange={(pace) => setFormData((prev) => ({ ...prev, pace }))}
          onDateChange={(field, value) => setFormData((prev) => ({ ...prev, [field]: value }))}
          onSubmit={handleSubmit}
          tripDurationPresets={TRIP_DURATION_PRESETS}
          onTripDurationPreset={handleTripDurationPreset}
          stylePresetsWithInfo={TRAVEL_STYLE_PRESETS}
          onStylePreset={handleStylePreset}
          selectedPreset={selectedPreset}
          taxonomy={taxonomy}
          onSubCategoryToggle={handleSubCategoryToggle}
          onDietaryToggle={handleDietaryToggle}
        />
      </motion.div>
    </motion.div>
  )
}
