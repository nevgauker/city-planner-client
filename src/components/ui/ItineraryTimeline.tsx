import { motion } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { RotateCw, RefreshCw } from 'lucide-react'
import { formatDate, getWeatherIcon, getWeatherDescription } from '../../lib/utils'
import type { ItineraryDay, ActivityBlock, TripRequest } from '../../types/api'

interface Props {
  itinerary: ItineraryDay[] | null
  tripData?: {
    city?: string | null
    homeBase?: { address?: string } | null
    startDate?: string | null
    endDate?: string | null
  }
  selectedActivityIndex: number | null
  onActivitySelect: (index: number) => void
  onRegenerateDay: (dayIndex: number) => void
  isRegenerating: boolean
  regeneratingDay: number | null
  onSwapActivity?: (dayIndex: number, period: string, activity: ActivityBlock) => void
  swappingActivity: string | null
  onScrolledPastDay2?: () => void
}

export default function ItineraryTimeline({
  itinerary,
  tripData,
  selectedActivityIndex,
  onActivitySelect,
  onRegenerateDay,
  isRegenerating,
  regeneratingDay,
  onSwapActivity,
  swappingActivity,
  onScrolledPastDay2,
}: Props) {
  if (!itinerary || itinerary.length === 0) {
    return <div className="p-6 text-white/60">No itinerary data available</div>
  }

  const day2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!day2Ref.current || !onScrolledPastDay2) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onScrolledPastDay2()
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(day2Ref.current)
    return () => observer.disconnect()
  }, [onScrolledPastDay2])

  let activityCount = 0
  const startDate = new Date(tripData?.startDate || '')
  const getDayDate = (index: number) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + index)
    return date
  }

  const getDayOfWeek = (index: number) => {
    return getDayDate(index).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  }

  return (
    <div className="p-3 sm:p-6 space-y-6 sm:space-y-8">
      <div className="sticky top-0 bg-navy-900 z-10 pb-6 border-b border-white/10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          {tripData?.city} · {itinerary.length} days
        </h2>
        <p className="text-white/60 text-xs sm:text-sm mb-3">
          {formatDate(tripData?.startDate || '')} – {formatDate(tripData?.endDate || '')}
        </p>
        {tripData?.homeBase?.address && (
          <p className="text-white/50 text-xs sm:text-sm">
            Starting from: <span className="text-white/70">{tripData.homeBase.address}</span>
          </p>
        )}
      </div>

      {itinerary.map((day, dayIndex) => (
        <motion.div
          key={dayIndex}
          ref={dayIndex === 1 ? day2Ref : undefined}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dayIndex * 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Day {dayIndex + 1} — {getDayOfWeek(dayIndex)}
              </h3>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-white/70 flex-wrap">
                <div className="flex items-center gap-1">
                  <span>{getWeatherIcon(day.weatherCode)}</span>
                  <span>{getWeatherDescription(day.weatherCode)}</span>
                  <span className="text-warm-accent font-medium">{day.temperature}°C</span>
                </div>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => onRegenerateDay(dayIndex)} disabled={isRegenerating && regeneratingDay === dayIndex} className="no-print p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50">
              <RotateCw className={`w-5 h-5 text-warm-accent ${isRegenerating && regeneratingDay === dayIndex ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>

          {(['morning', 'afternoon', 'evening'] as const).map((period) => {
            const activity = day.blocks?.[period]
            if (!activity) return null
            const globalActivityIndex = activityCount++
            const isSelected = selectedActivityIndex === globalActivityIndex

            return (
              <motion.button
                key={`${dayIndex}-${period}`}
                onClick={() => onActivitySelect(globalActivityIndex)}
                whileHover={{ scale: 1.02 }}
                className={`w-full text-left p-3 sm:p-4 rounded-lg transition-all ${isSelected ? 'bg-warm-accent/20 border border-warm-accent' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="px-2 py-1 bg-warm-accent/20 rounded text-warm-accent text-xs font-medium">
                      {period.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-xs text-white/50 font-semibold">
                      {String(globalActivityIndex + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base text-white mb-1">{activity.activity}</p>
                    <p className="text-xs sm:text-sm text-white/70">{activity.place_name}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-white/50 flex-wrap">
                      <span className="px-2 py-1 bg-white/10 rounded">{activity.category}</span>
                      <span>⏱️ {activity.duration_minutes} min</span>
                    </div>
                    {activity.notes && <p className="text-xs text-white/60 mt-2 italic">{activity.notes}</p>}
                  </div>
                  <motion.div
                    onClick={(e) => { e.stopPropagation(); onSwapActivity?.(dayIndex, period, activity) }}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                    className="no-print p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
                    style={{ opacity: swappingActivity === `${dayIndex}-${period}` ? 0.5 : 1 }}
                  >
                    <RefreshCw className={`w-4 h-4 text-warm-accent ${swappingActivity === `${dayIndex}-${period}` ? 'animate-spin' : ''}`} />
                  </motion.div>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      ))}
    </div>
  )
}
