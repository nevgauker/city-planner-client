import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { generateItinerary, regenerateDay, getWeatherForecast, saveTrip, encodeTripForShare, saveTripToBackend } from '../../lib/api'
import ItineraryTimeline from '../ui/ItineraryTimeline'
import GoogleItineraryMap from '../map/GoogleItineraryMap'
import BackButton from '../ui/BackButton'
import FeedbackModal from '../ui/FeedbackModal.jsx'

export default function ItineraryStage({ tripData, onRegenerateDay, onBack }) {
  const [itinerary, setItinerary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regeneratingDay, setRegeneratingDay] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)

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
        // Auto-save to localStorage
        const tripId = `${tripData.city}-${Date.now()}`
        saveTrip(tripId, tripData, result.itinerary)

        // Save to backend
        try {
          await saveTripToBackend(
            tripData.city,
            `${tripData.city} Trip`,
            result.itinerary,
          )
        } catch (err) {
          console.warn('Failed to save trip to backend:', err)
        }

        toast.success('Itinerary generated & saved!')

        // Show feedback modal after 8 seconds
        setTimeout(() => {
          const alreadyRated = localStorage.getItem(
            `feedback_rated_${tripData.city}`,
          )
          if (!alreadyRated) {
            setShowFeedback(true)
          }
        }, 8000)
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
    if (!itinerary || !tripData) {
      toast.error('No itinerary to export')
      return
    }

    const exportData = {
      city: tripData.city,
      homeBase: tripData.homeBase,
      dates: {
        start: tripData.startDate,
        end: tripData.endDate,
      },
      preferences: {
        travelStyles: tripData.travelStyles,
        pace: tripData.pace,
      },
      itinerary,
      exportedAt: new Date().toISOString(),
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${tripData.city}-itinerary-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Itinerary exported as JSON!')
  }

  const handleShareItinerary = () => {
    if (!itinerary || !tripData) {
      toast.error('No itinerary to share')
      return
    }

    const encoded = encodeTripForShare(tripData, itinerary)
    const shareUrl = `${window.location.origin}?shared=${encoded}`

    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Share link copied to clipboard!')
    }).catch(() => {
      toast.error('Failed to copy share link')
    })
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

        {/* Export & Share Buttons */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex gap-2 flex-col sm:flex-row">
          <button
            onClick={handleShareItinerary}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
            title="Copy share link to clipboard"
          >
            🔗 Share
          </button>
          <button
            onClick={handleExportItinerary}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-warm-accent hover:bg-warm-light text-navy-900 rounded-lg font-medium transition-colors whitespace-nowrap"
            title="Download as JSON"
          >
            📥 Export
          </button>
        </div>
      </div>

      {showFeedback && (
        <FeedbackModal
          city={tripData.city}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </motion.div>
  )
}
