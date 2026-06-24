import type { ItineraryDay, ActivityBlock } from '../types/api'

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function distanceToWalkingMinutes(distanceKm: number): number {
  return Math.round((distanceKm * 1000) / (1.4 * 60))
}

export function calculateWalkingTime(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return distanceToWalkingMinutes(calculateDistance(lat1, lng1, lat2, lng2))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const WEATHER_ICONS: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌧️', 53: '🌧️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '⛈️',
  71: '🌨️', 73: '🌨️', 75: '🌨️', 77: '🌨️',
  80: '🌧️', 81: '🌧️', 82: '⛈️',
  85: '🌨️', 86: '🌨️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
}

export function getWeatherIcon(code: number): string {
  return WEATHER_ICONS[code] ?? '🌤️'
}

const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
  85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
}

export function getWeatherDescription(code: number): string {
  return WEATHER_DESCRIPTIONS[code] ?? 'Unknown'
}

export function getDayNumber(dateString: string, startDate: string): number {
  const diffMs = Math.abs(new Date(dateString).getTime() - new Date(startDate).getTime())
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1
}

export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

const CATEGORY_COLORS: Record<string, string> = {
  Culture: '#FF6B6B',
  'Food & Drink': '#4ECDC4',
  Nightlife: '#95E1D3',
  Nature: '#38ADA9',
  Shopping: '#FF9D56',
  'Hidden Gems': '#FFDAB9',
  Wellness: '#87CEEB',
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#CCCCCC'
}

const MARKER_COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#4D96FF', '#A78BFA', '#F97316']

export function getMarkerColor(index: number): string {
  return MARKER_COLORS[index % MARKER_COLORS.length]
}

interface ICSActivity {
  start: string
  end: string
  summary: string
  description: string
  location: string
}

export function generateICS(itinerary: ItineraryDay[], city: string): string {
  const now = new Date()
  const uid = `${city}-${now.getTime()}@cityplanner.app`

  const formatDateTime = (dateStr: string, hour: number): string => {
    const date = new Date(dateStr)
    date.setHours(hour, 0, 0, 0)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  }

  const escapeText = (text: string): string =>
    text?.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;') ?? ''

  const activities: ICSActivity[] = []
  itinerary.forEach((day) => {
    const slots: { time: number; block: ActivityBlock }[] = [
      { time: 9, block: day.blocks.morning },
      { time: 13, block: day.blocks.afternoon },
      { time: 18, block: day.blocks.evening },
    ]
    slots.forEach(({ time, block }) => {
      if (block?.activity) {
        activities.push({
          start: formatDateTime(day.date, time),
          end: formatDateTime(day.date, time + Math.ceil((block.duration_minutes || 60) / 60)),
          summary: `${block.activity} at ${block.place_name}`,
          description: `${block.category || 'Activity'} • ${block.notes || ''}`,
          location: block.place_name,
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

  return `BEGIN:VCALENDAR
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
}

export function downloadICS(ics: string, city: string): void {
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
