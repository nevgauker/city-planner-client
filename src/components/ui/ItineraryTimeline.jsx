import { motion } from 'framer-motion'
import { RotateCw, Cloud, Droplets } from 'lucide-react'
import { formatDate, getWeatherIcon, getWeatherDescription, getDayNumber } from '../../lib/utils'

export default function ItineraryTimeline({
  itinerary,
  selectedActivityIndex,
  onActivitySelect,
  onRegenerateDay,
  isRegenerating,
  regeneratingDay,
}) {
  if (!itinerary || itinerary.length === 0) {
    return <div className="p-6 text-white/60">No itinerary data available</div>
  }

  let activityCount = 0

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="sticky top-0 bg-navy-900 z-10 pb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Your Itinerary</h2>
        <p className="text-white/60 text-sm">{itinerary.length} days of adventure</p>
      </div>

      {/* Timeline */}
      {itinerary.map((day, dayIndex) => (
        <motion.div
          key={dayIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dayIndex * 0.1 }}
          className="space-y-4"
        >
          {/* Day Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">
                Day {dayIndex + 1} {' '} {formatDate(day.date)}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-white/70">
                <div className="flex items-center gap-1">
                  <span>{getWeatherIcon(day.weatherCode)}</span>
                  <span>{getWeatherDescription(day.weatherCode)}</span>
                  <span className="text-warm-accent font-medium">{day.temperature}°C</span>
                </div>
                {day.budget_usd && (
                  <div className="px-2 py-1 bg-green-600/20 rounded text-green-400 text-xs font-medium">
                    💰 ${day.budget_usd}
                  </div>
                )}
              </div>
            </div>

            {/* Regenerate Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onRegenerateDay(dayIndex)}
              disabled={isRegenerating && regeneratingDay === dayIndex}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              title="Regenerate this day"
            >
              <RotateCw
                className={`w-5 h-5 text-warm-accent ${
                  isRegenerating && regeneratingDay === dayIndex ? 'animate-spin' : ''
                }`}
              />
            </motion.button>
          </div>

          {/* Activities */}
          {['morning', 'afternoon', 'evening'].map((period) => {
            const activity = day.blocks?.[period]
            if (!activity) return null

            const globalActivityIndex = activityCount++
            const isSelected = selectedActivityIndex === globalActivityIndex

            return (
              <motion.button
                key={`${dayIndex}-${period}`}
                onClick={() => onActivitySelect(globalActivityIndex)}
                whileHover={{ scale: 1.02 }}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-warm-accent/20 border border-warm-accent'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Time Badge */}
                  <div className="px-2 py-1 bg-warm-accent/20 rounded text-warm-accent text-xs font-medium flex-shrink-0">
                    {period.charAt(0).toUpperCase()}
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1">
                    <p className="font-medium text-white mb-1">{activity.activity}</p>
                    <p className="text-sm text-white/70">{activity.place_name}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-white/50 flex-wrap">
                      <span className="px-2 py-1 bg-white/10 rounded">{activity.category}</span>
                      <span>⏱️ {activity.duration_minutes} min</span>
                      {activity.budget_usd && (
                        <span className="px-2 py-1 bg-green-600/20 rounded text-green-400 font-medium">
                          ${activity.budget_usd}
                        </span>
                      )}
                    </div>
                    {activity.notes && (
                      <p className="text-xs text-white/60 mt-2 italic">{activity.notes}</p>
                    )}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      ))}
    </div>
  )
}
