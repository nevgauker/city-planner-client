import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { generateItinerary, regenerateDay, getWeatherForecast, saveTrip, encodeTripForShare, saveTripToBackend, swapActivity } from '../../lib/api'
import { generateICS, downloadICS } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import ItineraryTimeline from '../ui/ItineraryTimeline'
import GoogleItineraryMap from '../map/GoogleItineraryMap'
import BackButton from '../ui/BackButton'
import FeedbackModal from '../ui/FeedbackModal'
import type { ItineraryDay, HomeBase, ActivityBlock, TripRequest } from '../../types/api'

interface TripData {
  city: string | null
  homeBase: HomeBase | null
  startDate: string | null
  endDate: string | null
  travelStyles: string[]
  pace: 'Relaxed' | 'Balanced' | 'Packed'
  itinerary?: ItineraryDay[] | null
}

interface Props {
  tripData: TripData
  onBack: () => void
  existingItinerary?: ItineraryDay[] | null
}

export default function ItineraryStage({ tripData, onBack, existingItinerary }: Props) {
  const city: string = tripData.city ?? ''
  const homeBase: HomeBase = tripData.homeBase!
  const startDate: string = tripData.startDate ?? ''
  const endDate: string = tripData.endDate ?? ''
  const safeTrip = { ...tripData, city, homeBase, startDate, endDate } as TripRequest & { itinerary?: ItineraryDay[] | null }
  const { refreshQuota } = useAuth()
  const generatingRef = useRef(false)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const feedbackScrollRef = useRef(false)
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(existingItinerary || null)
  const [isLoading, setIsLoading] = useState(!existingItinerary)
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<number | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [swappingActivity, setSwappingActivity] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('Checking the weather...')

  useEffect(() => {
    const statusMessages = [
      'Checking the weather...',
      'Finding hidden gems...',
      'Building your day-by-day plan...'
    ]
    let messageIndex = 0
    const statusInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % statusMessages.length
      setStatusMessage(statusMessages[messageIndex])
    }, 4000)

    return () => clearInterval(statusInterval)
  }, [])

  useEffect(() => {
    if (existingItinerary) { setIsLoading(false); return }
    if (generatingRef.current) return

    generatingRef.current = true
    const generate = async () => {
      try {
        let weatherData = null
        try { weatherData = await getWeatherForecast(homeBase.lat, homeBase.lng, startDate, endDate) } catch { /* optional */ }

        const result = await generateItinerary({ ...safeTrip, weatherForecast: weatherData ?? undefined })
        setItinerary(result.itinerary)
        saveTrip(`${city}-${Date.now()}`, { city, homeBase, startDate, endDate, travelStyles: tripData.travelStyles, pace: tripData.pace }, result.itinerary)
        try { await saveTripToBackend(city, `${city} Trip`, startDate, endDate, tripData.travelStyles, tripData.pace, homeBase, result.itinerary) } catch { /* non-critical */ }
        toast.success('Itinerary generated & saved!')
        refreshQuota()

        feedbackTimerRef.current = setTimeout(() => {
          if (!localStorage.getItem(`feedback_rated_${city}`) && feedbackScrollRef.current) {
            setShowFeedback(true)
          }
        }, 60000)
      } catch (error) {
        toast.error((error as Error).message || 'Failed to generate itinerary')
      } finally {
        setIsLoading(false)
        generatingRef.current = false
      }
    }
    generate()

    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [tripData])

  const handleScrolledPastDay2 = () => {
    feedbackScrollRef.current = true
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current)
      feedbackTimerRef.current = setTimeout(() => {
        if (!localStorage.getItem(`feedback_rated_${city}`)) {
          setShowFeedback(true)
        }
      }, 5000)
    }
  }

  const handleRegenerateDayClick = async (dayIndex: number) => {
    setIsRegenerating(true); setRegeneratingDay(dayIndex)
    try {
      const result = await regenerateDay(safeTrip, dayIndex)
      setItinerary((prev) => { if (!prev) return prev; const updated = [...prev]; updated[dayIndex] = result.day; return updated })
      toast.success('Day regenerated!')
      refreshQuota()
    } catch (error) {
      toast.error((error as Error).message || 'Failed to regenerate day')
    } finally {
      setIsRegenerating(false); setRegeneratingDay(null)
    }
  }

  const handleSwapActivity = async (dayIndex: number, blockType: string, currentActivity: ActivityBlock) => {
    const key = `${dayIndex}-${blockType}`
    setSwappingActivity(key)
    try {
      const result = await swapActivity(city, dayIndex, blockType, currentActivity, tripData.travelStyles, tripData.pace, homeBase)
      setItinerary((prev) => {
        if (!prev) return prev
        const updated = [...prev]
        updated[dayIndex] = { ...updated[dayIndex], blocks: { ...updated[dayIndex].blocks, [blockType]: result.block } }
        return updated
      })
      toast.success('Activity swapped!')
      refreshQuota()
    } catch (error) {
      toast.error((error as Error).message || 'Failed to swap activity')
    } finally {
      setSwappingActivity(null)
    }
  }

  const handleShareItinerary = () => {
    if (!itinerary) return
    const encoded = encodeTripForShare(tripData, itinerary)
    navigator.clipboard.writeText(`${window.location.origin}?shared=${encoded}`)
      .then(() => toast.success('Share link copied!'))
      .catch(() => toast.error('Failed to copy share link'))
  }

  const handleCalendarExport = () => {
    if (!itinerary) return
    try { downloadICS(generateICS(itinerary, city), city); toast.success('Calendar file downloaded!') }
    catch { toast.error('Failed to export to calendar') }
  }

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full bg-neutral-dark flex flex-col md:flex-row">
        <div className="no-print"><BackButton onClick={onBack} /></div>

        <div className="w-full md:w-1/3 lg:w-2/5 h-1/2 md:h-full overflow-hidden border-r border-white/10 bg-taupe-700">
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((day) => (
              <div key={day} className="space-y-3">
                <div className="h-6 bg-white/10 rounded animate-pulse w-3/4" />
                <div className="space-y-2">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-4 bg-white/5 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-2/3 lg:w-3/5 h-1/2 md:h-full flex items-center justify-center relative bg-neutral-dark">
          <div className="h-full w-full bg-white/5 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-accent-terracotta border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-white mb-2">Building your schedule…</p>
              <p className="text-white/60 text-sm">{statusMessage}</p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full bg-neutral-dark flex flex-col md:flex-row">
      <div className="no-print"><BackButton onClick={onBack} /></div>

      <div className="w-full md:w-1/3 lg:w-2/5 h-1/2 md:h-full overflow-y-auto border-r border-white/10 print:border-0 print:h-auto print:w-full">
        <ItineraryTimeline
          itinerary={itinerary}
          tripData={tripData}
          selectedActivityIndex={selectedActivityIndex}
          onActivitySelect={setSelectedActivityIndex}
          onRegenerateDay={handleRegenerateDayClick}
          isRegenerating={isRegenerating}
          regeneratingDay={regeneratingDay}
          onSwapActivity={handleSwapActivity}
          swappingActivity={swappingActivity}
          onScrolledPastDay2={handleScrolledPastDay2}
        />
      </div>

      <div className="no-print w-full md:w-2/3 lg:w-3/5 h-1/2 md:h-full relative">
        <GoogleItineraryMap itinerary={itinerary} selectedActivityIndex={selectedActivityIndex} homeBase={homeBase} />

        <motion.button
          onClick={() => { setFeedbackRating(parseInt(localStorage.getItem(`feedback_rating_${city}`) || '0')); setShowFeedback(true) }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 w-12 h-12 rounded-full bg-accent-terracotta/20 hover:bg-accent-terracotta/40 border border-accent-terracotta/50 flex items-center justify-center transition-colors"
        >
          <span className="text-xl">💬</span>
        </motion.button>

        <div className="no-print absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex gap-2 flex-col sm:flex-row">
          <button onClick={handleShareItinerary} className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-accent-terracotta hover:bg-accent-terracotta_light text-white rounded-lg font-medium transition-colors">🔗 Share</button>
          <button onClick={handleCalendarExport} className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">📅 Calendar</button>
          <button onClick={() => window.print()} className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-accent-terracotta hover:bg-accent-terracotta_light text-neutral-dark rounded-lg font-medium transition-colors">🖨️ Print</button>
        </div>
      </div>

      {showFeedback && <FeedbackModal city={city} initialRating={feedbackRating} onClose={() => setShowFeedback(false)} />}
    </motion.div>
  )
}
