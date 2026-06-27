import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  saveTrip,
  getSavedTrips,
  getTrip,
  deleteTrip,
  encodeTripForShare,
  decodeTripFromShare,
} from './api'
import type { HomeBase, ItineraryDay } from '../types/api'

describe('api - local storage functions', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('saveTrip', () => {
    it('should save trip to localStorage', () => {
      const tripData = {
        city: 'Paris',
        startDate: '2024-06-27',
        endDate: '2024-07-02',
        travelStyles: ['Culture', 'Food & Drink'],
        pace: 'Balanced',
        homeBase: { lat: 48.8566, lng: 2.3522, address: 'Paris' } as HomeBase,
      }
      const itinerary: ItineraryDay[] = []

      const tripId = saveTrip('trip-1', tripData, itinerary)

      expect(tripId).toBe('trip-1')
      const saved = JSON.parse(localStorage.getItem('savedTrips') || '{}')
      expect(saved['trip-1']).toBeDefined()
      expect(saved['trip-1'].city).toBe('Paris')
    })

    it('should overwrite existing trip', () => {
      const tripData1 = {
        city: 'Paris',
        startDate: '2024-06-27',
        endDate: '2024-07-02',
        travelStyles: ['Culture'],
        pace: 'Balanced',
        homeBase: { lat: 48.8566, lng: 2.3522, address: 'Paris' } as HomeBase,
      }
      const tripData2 = {
        city: 'London',
        startDate: '2024-07-03',
        endDate: '2024-07-08',
        travelStyles: ['Nightlife'],
        pace: 'Packed',
        homeBase: { lat: 51.5074, lng: -0.1278, address: 'London' } as HomeBase,
      }

      saveTrip('trip-1', tripData1, [])
      saveTrip('trip-1', tripData2, [])

      const saved = JSON.parse(localStorage.getItem('savedTrips') || '{}')
      expect(saved['trip-1'].city).toBe('London')
    })
  })

  describe('getSavedTrips', () => {
    it('should return empty array when no trips saved', () => {
      const trips = getSavedTrips()
      expect(trips).toEqual([])
    })

    it('should return all saved trips sorted by savedAt descending', () => {
      const tripData = {
        city: 'Paris',
        startDate: '2024-06-27',
        endDate: '2024-07-02',
        travelStyles: ['Culture'],
        pace: 'Balanced',
        homeBase: { lat: 48.8566, lng: 2.3522, address: 'Paris' } as HomeBase,
      }

      saveTrip('trip-1', tripData, [])
      // Small delay to ensure different timestamps
      const beforeSecond = new Date()
      const secondTrip = {
        ...tripData,
        city: 'London',
      }
      localStorage.setItem(
        'savedTrips',
        JSON.stringify({
          'trip-1': {
            id: 'trip-1',
            ...tripData,
            itinerary: [],
            savedAt: new Date(beforeSecond.getTime() - 1000).toISOString(),
          },
          'trip-2': {
            id: 'trip-2',
            ...secondTrip,
            itinerary: [],
            savedAt: new Date().toISOString(),
          },
        })
      )

      const trips = getSavedTrips()
      expect(trips.length).toBe(2)
      expect(trips[0].id).toBe('trip-2')
      expect(trips[1].id).toBe('trip-1')
    })
  })

  describe('getTrip', () => {
    it('should return trip by id', () => {
      const tripData = {
        city: 'Paris',
        startDate: '2024-06-27',
        endDate: '2024-07-02',
        travelStyles: ['Culture'],
        pace: 'Balanced',
        homeBase: { lat: 48.8566, lng: 2.3522, address: 'Paris' } as HomeBase,
      }

      saveTrip('trip-1', tripData, [])

      const trip = getTrip('trip-1')
      expect(trip).toBeDefined()
      expect(trip?.city).toBe('Paris')
      expect(trip?.id).toBe('trip-1')
    })

    it('should return null for non-existent trip', () => {
      const trip = getTrip('non-existent')
      expect(trip).toBeNull()
    })
  })

  describe('deleteTrip', () => {
    it('should delete trip from localStorage', () => {
      const tripData = {
        city: 'Paris',
        startDate: '2024-06-27',
        endDate: '2024-07-02',
        travelStyles: ['Culture'],
        pace: 'Balanced',
        homeBase: { lat: 48.8566, lng: 2.3522, address: 'Paris' } as HomeBase,
      }

      saveTrip('trip-1', tripData, [])
      expect(getTrip('trip-1')).toBeDefined()

      deleteTrip('trip-1')
      expect(getTrip('trip-1')).toBeNull()
    })

    it('should not fail when deleting non-existent trip', () => {
      expect(() => deleteTrip('non-existent')).not.toThrow()
    })
  })

  describe('encodeTripForShare', () => {
    it('should encode trip data to base64 string', () => {
      const tripData = { city: 'Paris', startDate: '2024-06-27' }
      const itinerary: ItineraryDay[] = []

      const encoded = encodeTripForShare(tripData, itinerary)

      expect(typeof encoded).toBe('string')
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('should encode data that can be decoded back', () => {
      const tripData = { city: 'Paris', startDate: '2024-06-27' }
      const itinerary: ItineraryDay[] = []

      const encoded = encodeTripForShare(tripData, itinerary)
      const decoded = decodeTripFromShare(encoded) as any

      expect(decoded).toBeDefined()
      expect(decoded?.city).toBe('Paris')
      expect(decoded?.startDate).toBe('2024-06-27')
      expect(decoded?.itinerary).toBeDefined()
    })
  })

  describe('decodeTripFromShare', () => {
    it('should decode valid base64 encoded trip', () => {
      const tripData = { city: 'Paris', startDate: '2024-06-27', itinerary: [] }
      const encoded = btoa(JSON.stringify(tripData))

      const decoded = decodeTripFromShare(encoded) as any

      expect(decoded).toBeDefined()
      expect((decoded as any).city).toBe('Paris')
      expect(decoded.itinerary).toEqual([])
    })

    it('should return null for invalid base64', () => {
      const decoded = decodeTripFromShare('invalid!!!base64')
      expect(decoded).toBeNull()
    })

    it('should return null for valid base64 but invalid JSON', () => {
      const encoded = btoa('not valid json')
      const decoded = decodeTripFromShare(encoded)
      expect(decoded).toBeNull()
    })

    it('should return null for empty string', () => {
      const decoded = decodeTripFromShare('')
      expect(decoded).toBeNull()
    })
  })
})
