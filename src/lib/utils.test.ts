import { describe, it, expect } from 'vitest'
import {
  calculateDistance,
  distanceToWalkingMinutes,
  calculateWalkingTime,
  formatDate,
  getWeatherIcon,
  getWeatherDescription,
  getDayNumber,
  isValidCoordinates,
  getCategoryColor,
  getMarkerColor,
  generateICS,
} from './utils'
import type { ItineraryDay } from '../types/api'

describe('utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      // Paris to London: approximately 344 km
      const distance = calculateDistance(48.8566, 2.3522, 51.5074, -0.1278)
      expect(distance).toBeGreaterThan(340)
      expect(distance).toBeLessThan(350)
    })

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(48.8566, 2.3522, 48.8566, 2.3522)
      expect(distance).toBe(0)
    })
  })

  describe('distanceToWalkingMinutes', () => {
    it('should convert 1km to approximately 12 minutes', () => {
      const minutes = distanceToWalkingMinutes(1)
      expect(minutes).toBeGreaterThan(10)
      expect(minutes).toBeLessThan(14)
    })

    it('should return 0 for 0km', () => {
      const minutes = distanceToWalkingMinutes(0)
      expect(minutes).toBe(0)
    })
  })

  describe('calculateWalkingTime', () => {
    it('should calculate walking time between coordinates', () => {
      const minutes = calculateWalkingTime(48.8566, 2.3522, 48.8566, 2.3522 + 0.01)
      expect(minutes).toBeGreaterThan(0)
    })
  })

  describe('formatDate', () => {
    it('should format date string to readable format', () => {
      const formatted = formatDate('2024-06-27')
      expect(formatted).toMatch(/\w+, \w+ \d+/)
    })

    it('should handle various date formats', () => {
      const formatted = formatDate('2024-12-25T12:00:00Z')
      expect(formatted).toContain('Dec')
      expect(formatted).toContain('25')
    })
  })

  describe('getWeatherIcon', () => {
    it('should return sun emoji for clear sky (0)', () => {
      expect(getWeatherIcon(0)).toBe('☀️')
    })

    it('should return cloud emoji for overcast (3)', () => {
      expect(getWeatherIcon(3)).toBe('☁️')
    })

    it('should return rain emoji for rain codes', () => {
      expect(getWeatherIcon(61)).toBe('🌧️')
      expect(getWeatherIcon(63)).toBe('🌧️')
    })

    it('should return storm emoji for thunderstorm (95)', () => {
      expect(getWeatherIcon(95)).toBe('⛈️')
    })

    it('should return default emoji for unknown code', () => {
      expect(getWeatherIcon(9999)).toBe('🌤️')
    })
  })

  describe('getWeatherDescription', () => {
    it('should return description for clear sky', () => {
      expect(getWeatherDescription(0)).toBe('Clear sky')
    })

    it('should return description for rain', () => {
      expect(getWeatherDescription(61)).toBe('Slight rain')
    })

    it('should return unknown for unknown code', () => {
      expect(getWeatherDescription(9999)).toBe('Unknown')
    })
  })

  describe('getDayNumber', () => {
    it('should return 1 for same date', () => {
      const dayNum = getDayNumber('2024-06-27', '2024-06-27')
      expect(dayNum).toBe(1)
    })

    it('should return 2 for next day', () => {
      const dayNum = getDayNumber('2024-06-28', '2024-06-27')
      expect(dayNum).toBe(2)
    })

    it('should handle previous dates', () => {
      const dayNum = getDayNumber('2024-06-26', '2024-06-27')
      expect(dayNum).toBe(2)
    })
  })

  describe('isValidCoordinates', () => {
    it('should accept valid coordinates', () => {
      expect(isValidCoordinates(48.8566, 2.3522)).toBe(true)
      expect(isValidCoordinates(0, 0)).toBe(true)
      expect(isValidCoordinates(90, 180)).toBe(true)
      expect(isValidCoordinates(-90, -180)).toBe(true)
    })

    it('should reject invalid latitude', () => {
      expect(isValidCoordinates(91, 0)).toBe(false)
      expect(isValidCoordinates(-91, 0)).toBe(false)
    })

    it('should reject invalid longitude', () => {
      expect(isValidCoordinates(0, 181)).toBe(false)
      expect(isValidCoordinates(0, -181)).toBe(false)
    })
  })

  describe('getCategoryColor', () => {
    it('should return color for known category', () => {
      expect(getCategoryColor('Culture')).toBe('#FF6B6B')
      expect(getCategoryColor('Food & Drink')).toBe('#4ECDC4')
      expect(getCategoryColor('Nature')).toBe('#38ADA9')
    })

    it('should return gray for unknown category', () => {
      expect(getCategoryColor('Unknown')).toBe('#CCCCCC')
    })
  })

  describe('getMarkerColor', () => {
    it('should return color for index', () => {
      expect(getMarkerColor(0)).toBe('#FF6B6B')
      expect(getMarkerColor(1)).toBe('#4ECDC4')
    })

    it('should cycle through colors for high indices', () => {
      expect(getMarkerColor(7)).toBe('#FF6B6B')
      expect(getMarkerColor(8)).toBe('#4ECDC4')
    })
  })

  describe('generateICS', () => {
    it('should generate valid ICS calendar', () => {
      const itinerary = [
        {
          date: '2024-06-27',
          day: 1,
          weather: 'Partly cloudy',
          temperature: 22,
          weatherCode: 2,
          blocks: {
            morning: {
              activity: 'Visit Eiffel Tower',
              place_name: 'Eiffel Tower, Paris',
              category: 'Culture',
              lat: 48.8584,
              lng: 2.2945,
              duration_minutes: 120,
              notes: 'Don\'t forget camera',
            },
            afternoon: null,
            evening: null,
          },
        },
      ] as unknown as ItineraryDay[]

      const ics = generateICS(itinerary, 'Paris')

      expect(ics).toContain('BEGIN:VCALENDAR')
      expect(ics).toContain('END:VCALENDAR')
      expect(ics).toContain('BEGIN:VEVENT')
      expect(ics).toContain('END:VEVENT')
      expect(ics).toContain('Visit Eiffel Tower')
      expect(ics).toContain('Eiffel Tower\\, Paris')
    })

    it('should handle empty itinerary', () => {
      const ics = generateICS([], 'Paris')

      expect(ics).toContain('BEGIN:VCALENDAR')
      expect(ics).toContain('END:VCALENDAR')
      expect(ics).not.toContain('BEGIN:VEVENT')
    })

    it('should escape special characters in ICS', () => {
      const itinerary = [
        {
          date: '2024-06-27',
          day: 1,
          weather: 'Clear',
          temperature: 20,
          weatherCode: 0,
          blocks: {
            morning: {
              activity: 'Visit; Tower',
              place_name: 'Tower, Place',
              category: 'Culture',
              lat: 48.8584,
              lng: 2.2945,
              duration_minutes: 60,
              notes: 'Line 1\nLine 2',
            },
            afternoon: null,
            evening: null,
          },
        },
      ] as unknown as ItineraryDay[]

      const ics = generateICS(itinerary, 'Paris')

      expect(ics).toContain('SUMMARY:Visit\\; Tower')
      expect(ics).toContain('\\n')
    })
  })
})
