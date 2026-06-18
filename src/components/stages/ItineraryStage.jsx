import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { generateItinerary, regenerateDay, getWeatherForecast } from '../../lib/api'
import ItineraryTimeline from '../ui/ItineraryTimeline'
import GoogleItineraryMap from '../map/GoogleItineraryMap'
import BackButton from '../ui/BackButton'

export default function ItineraryStage({ tripData, onRegenerateDay, onBack }) {
  const [itinerary, setItinerary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regeneratingDay, setRegeneratingDay] = useState(null)

  useEffect(() => {
    const generateItineraryData = async () => {
      try {
        // Try to fetch weather data (but it's optional)
        let weatherData = null
        try {
          weatherData = await getWeatherForecast(
            tripData.homeBase.lat,
            tripData.homeBase.lng,
            tripData.startDate,
            tripData.endDate,
          )
          if (weatherData) {
            console.log('✓ Weather data available')
          }
        } catch (weatherError) {
          console.log('⚠️ Weather data unavailable, continuing without it')
        }

        // Generate itinerary with or without weather
        console.log('🎯 Generating itinerary...')
        const result = await generateItinerary({
          ...tripData,
          weatherForecast: weatherData,
        })

        setItinerary(result.itinerary)
        toast.success('Itinerary generated successfully!')
      } catch (error) {
        toast.error(error.message || 'Failed to generate itinerary')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    generateItineraryData()
  }, [tripData])

  const handleRegenerateDayClick = async (dayIndex) => {
    setIsRegenerating(true)
    setRegeneratingDay(dayIndex)

    try {
      const result = await regenerateDay(tripData, dayIndex)
      setItinerary((prev) => {
        const updated = [...prev]
        updated[dayIndex] = result.day
        return updated
      })
      toast.success('Day regenerated successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to regenerate day')
    } finally {
      setIsRegenerating(false)
      setRegeneratingDay(null)
    }
  }

  const handleExportItinerary = () => {
    // TODO: Implement export functionality
    toast.info('Export feature coming soon!')
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-navy-900">
        <div className="glass-effect card-elevation px-8 py-6 rounded-lg text-center">
          <div className="animate-spin h-8 w-8 border-4 border-warm-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white mb-2">Building your schedule…</p>
          <p className="text-white/60 text-sm">Checking the weather and planning activities</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full bg-navy-900 flex flex-col md:flex-row"
    >
      {/* Back Button */}
      <BackButton onClick={onBack} />

      {/* Timeline Panel - Left */}
      <div className="w-full md:w-1/3 lg:w-2/5 h-1/2 md:h-full overflow-y-auto border-r border-white/10">
        <ItineraryTimeline
          itinerary={itinerary}
          selectedActivityIndex={selectedActivityIndex}
          onActivitySelect={setSelectedActivityIndex}
          onRegenerateDay={handleRegenerateDayClick}
          isRegenerating={isRegenerating}
          regeneratingDay={regeneratingDay}
        />
      </div>

      {/* Map Panel - Right */}
      <div className="w-full md:w-2/3 lg:w-3/5 h-1/2 md:h-full relative">
        <GoogleItineraryMap
          itinerary={itinerary}
          selectedActivityIndex={selectedActivityIndex}
          homeBase={tripData.homeBase}
        />

        {/* Export Button */}
        <button
          onClick={handleExportItinerary}
          className="absolute bottom-4 right-4 z-10 px-4 py-2 bg-warm-accent hover:bg-warm-light text-navy-900 rounded-lg font-medium transition-colors"
        >
          📥 Export
        </button>
      </div>
    </motion.div>
  )
}
