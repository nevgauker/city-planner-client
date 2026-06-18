// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Convert km distance to walking minutes (assuming 1.4 m/s average walking speed)
export function distanceToWalkingMinutes(distanceKm) {
  const walkingSpeedMs = 1.4
  const minutes = (distanceKm * 1000) / (walkingSpeedMs * 60)
  return Math.round(minutes)
}

// Calculate walking time between two coordinates
export function calculateWalkingTime(lat1, lng1, lat2, lng2) {
  const distance = calculateDistance(lat1, lng1, lat2, lng2)
  return distanceToWalkingMinutes(distance)
}

// Format date for display
export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// Get weather icon based on weather code (WMO codes)
export function getWeatherIcon(code) {
  const iconMap = {
    0: '☀️', // Clear
    1: '🌤️', // Mainly clear
    2: '⛅', // Partly cloudy
    3: '☁️', // Overcast
    45: '🌫️', // Foggy
    48: '🌫️', // Depositing rime fog
    51: '🌧️', // Light drizzle
    53: '🌧️', // Moderate drizzle
    55: '🌧️', // Dense drizzle
    61: '🌧️', // Slight rain
    63: '🌧️', // Moderate rain
    65: '⛈️', // Heavy rain
    71: '🌨️', // Slight snow
    73: '🌨️', // Moderate snow
    75: '🌨️', // Heavy snow
    77: '🌨️', // Snow grains
    80: '🌧️', // Slight rain showers
    81: '🌧️', // Moderate rain showers
    82: '⛈️', // Violent rain showers
    85: '🌨️', // Slight snow showers
    86: '🌨️', // Heavy snow showers
    95: '⛈️', // Thunderstorm
    96: '⛈️', // Thunderstorm with hail
    99: '⛈️', // Thunderstorm with hail
  }
  return iconMap[code] || '🌤️'
}

// Get weather description from WMO code
export function getWeatherDescription(code) {
  const descMap = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with hail',
  }
  return descMap[code] || 'Unknown'
}

// Parse itinerary date to get day count
export function getDayNumber(dateString, startDate) {
  const start = new Date(startDate)
  const current = new Date(dateString)
  const diffTime = Math.abs(current - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

// Validate coordinates
export function isValidCoordinates(lat, lng) {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

// Color mapping for categories
export function getCategoryColor(category) {
  const colorMap = {
    Culture: '#FF6B6B',
    'Food & Drink': '#4ECDC4',
    Nightlife: '#95E1D3',
    Nature: '#38ADA9',
    Shopping: '#FF9D56',
    'Hidden Gems': '#FFDAB9',
    Wellness: '#87CEEB',
  }
  return colorMap[category] || '#CCCCCC'
}

// Generate marker color based on day index
export function getMarkerColor(index) {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#4D96FF', '#A78BFA', '#F97316']
  return colors[index % colors.length]
}

// Debounce function for search and API calls
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Generate ICS calendar file from itinerary
export function generateICS(itinerary, city) {
  const now = new Date()
  const uid = `${city}-${now.getTime()}@cityplanner.app`

  const formatDateTime = (dateStr, hour) => {
    const date = new Date(dateStr)
    date.setHours(hour, 0, 0, 0)
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const escapeText = (text) => {
    if (!text) return ''
    return text.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
  }

  const activities = []
  itinerary.forEach((day, dayIdx) => {
    const slots = [
      { time: 9, block: day.blocks.morning },
      { time: 13, block: day.blocks.afternoon },
      { time: 18, block: day.blocks.evening },
    ]

    slots.forEach((slot) => {
      const activity = slot.block
      if (activity && activity.activity) {
        const start = formatDateTime(day.date, slot.time)
        const duration = (activity.duration_minutes || 60)
        const endHour = slot.time + Math.ceil(duration / 60)
        const end = formatDateTime(day.date, endHour)

        const summary = `${activity.activity} at ${activity.place_name}`
        const description = `${activity.category || 'Activity'} • ${activity.notes || ''}`

        activities.push({
          start,
          end,
          summary,
          description,
          location: activity.place_name,
        })
      }
    })
  })

  const events = activities
    .map(
      (a) => `BEGIN:VEVENT
DTSTART:${a.start}
DTEND:${a.end}
UID:${uid}-${Math.random()}
DTSTAMP:${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${escapeText(a.summary)}
DESCRIPTION:${escapeText(a.description)}
LOCATION:${escapeText(a.location)}
STATUS:CONFIRMED
END:VEVENT`
    )
    .join('\n')

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//City Planner//City Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
CALENDARNAME:${escapeText(city)} Trip
CALDESC:Travel itinerary for ${city}
X-WR-CALNAME:${escapeText(city)} Trip
X-WR-CALDESC:Travel itinerary for ${city}
${events}
END:VCALENDAR`

  return ics
}

// Download ICS file
export function downloadICS(ics, city) {
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${city}-itinerary.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
