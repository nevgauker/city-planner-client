import { useState } from 'react'
import { motion } from 'framer-motion'
import TripDetailsForm from '../ui/TripDetailsForm'
import BackButton from '../ui/BackButton'

const TRAVEL_STYLES = [
  'Culture',
  'Food & Drink',
  'Nightlife',
  'Nature',
  'Shopping',
  'Hidden Gems',
  'Wellness',
]

const PACE_OPTIONS = ['Relaxed', 'Balanced', 'Packed']

const TRAVEL_STYLE_PRESETS = {
  'Beach Bum': ['Nature', 'Food & Drink', 'Wellness'],
  'Culture Vulture': ['Culture', 'History', 'Hidden Gems'],
  'Foodie Paradise': ['Food & Drink', 'Culture', 'Shopping'],
  'Adventure Seeker': ['Nature', 'Nightlife', 'Hidden Gems'],
  'Luxury Explorer': ['Shopping', 'Wellness', 'Food & Drink'],
}

const TRIP_DURATION_PRESETS = [
  { label: 'Weekend', days: 3 },
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '3 Weeks', days: 21 },
]

export default function TripDetailsStage({ city, onSubmit, onBack }) {
  // Calculate default dates (tomorrow to 7 days from tomorrow)
  const getDefaultDates = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const endDate = new Date(tomorrow)
    endDate.setDate(endDate.getDate() + 6) // 7 days total (tomorrow + 6 more)

    const formatDate = (date) => date.toISOString().split('T')[0]

    return {
      startDate: formatDate(tomorrow),
      endDate: formatDate(endDate),
    }
  }

  const defaultDates = getDefaultDates()

  const [formData, setFormData] = useState({
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    travelStyles: [],
    pace: 'Balanced',
  })

  const handleTravelStyleToggle = (style) => {
    setFormData((prev) => ({
      ...prev,
      travelStyles: prev.travelStyles.includes(style)
        ? prev.travelStyles.filter((s) => s !== style)
        : [...prev.travelStyles, style],
    }))
  }

  const handlePaceChange = (pace) => {
    setFormData((prev) => ({
      ...prev,
      pace,
    }))
  }

  const handleDateChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTripDurationPreset = (days) => {
    const start = new Date()
    start.setDate(start.getDate() + 1)
    const end = new Date(start)
    end.setDate(end.getDate() + days - 1)

    const formatDate = (date) => date.toISOString().split('T')[0]
    setFormData((prev) => ({
      ...prev,
      startDate: formatDate(start),
      endDate: formatDate(end),
    }))
  }

  const handleStylePreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      travelStyles: TRAVEL_STYLE_PRESETS[preset],
    }))
  }

  const handleSubmit = () => {
    if (!formData.startDate || !formData.endDate) {
      alert('Please select both start and end dates')
      return
    }

    if (formData.travelStyles.length === 0) {
      alert('Please select at least one travel style')
      return
    }

    onSubmit(formData)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full bg-gradient-to-b from-navy-900 to-navy-800 flex flex-col items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      {/* Back Button */}
      <BackButton onClick={onBack} />

      {/* Form Panel */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl my-4"
      >
        <TripDetailsForm
          city={city}
          formData={formData}
          travelStyles={TRAVEL_STYLES}
          paceOptions={PACE_OPTIONS}
          onTravelStyleToggle={handleTravelStyleToggle}
          onPaceChange={handlePaceChange}
          onDateChange={handleDateChange}
          onSubmit={handleSubmit}
          tripDurationPresets={TRIP_DURATION_PRESETS}
          onTripDurationPreset={handleTripDurationPreset}
          stylePresets={TRAVEL_STYLE_PRESETS}
          onStylePreset={handleStylePreset}
        />
      </motion.div>
    </motion.div>
  )
}
