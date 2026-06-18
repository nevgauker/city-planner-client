import axios, { AxiosInstance } from 'axios'
import citiesData from './cities.json'
import type { City, WeatherData, TripRequest, ItineraryResponse } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Client-side city search (instant, no API calls)
export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  // Return empty for empty query
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return []
  }

  try {
    const searchQuery = query.trim().toLowerCase()

    // Filter cities by name or country (client-side, instant)
    const results = (citiesData.cities as unknown as City[])
      .filter((city) => {
        const nameMatch = city.name.toLowerCase().startsWith(searchQuery)
        const countryMatch = city.country.toLowerCase().startsWith(searchQuery)
        return nameMatch || countryMatch
      })
      .slice(0, 10) // Return top 10 results

    // Simulate slight delay for UX consistency
    return new Promise((resolve) => {
      setTimeout(() => resolve(results), 200)
    })
  } catch (error) {
    console.error('Search error:', error)
    throw new Error('Unable to search cities.')
  }
}

// Open-Meteo API for weather (free, no key needed)
export async function getWeatherForecast(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string
): Promise<WeatherData | null> {
  try {
    // Validate coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates, using fallback weather')
      return null
    }

    // Ensure dates are in YYYY-MM-DD format
    const formatDate = (dateStr: string | null | undefined): string | null => {
      if (!dateStr) return null
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr
      }
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return null
      return date.toISOString().split('T')[0]
    }

    const start = formatDate(startDate)
    const end = formatDate(endDate)

    if (!start || !end) {
      console.warn('Invalid date format, using fallback weather')
      return null
    }

    console.log(`🌤️  Fetching weather for ${lat}, ${lng} from ${start} to ${end}`)

    const response = await axios.get<WeatherData>('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lng,
        daily: 'temperature_2m_max,temperature_2m_min,weather_code',
        timezone: 'auto',
        start_date: start,
        end_date: end,
      },
      timeout: 8000,
    })

    console.log('✓ Weather forecast received')
    return response.data
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Weather error:', errorMessage)
    console.warn('Weather API unavailable, continuing without weather data')
    return null
  }
}

interface GeocodingResult {
  address: {
    road?: string
    city?: string
    country?: string
  }
  lat: string
  lon: string
}

// Nominatim reverse geocoding
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
  try {
    const response = await axios.get<GeocodingResult>(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          format: 'json',
          lat,
          lon: lng,
        },
        headers: {
          'User-Agent': 'TravelPlanner/1.0',
        },
      }
    )
    return response.data
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    throw new Error('Failed to get address')
  }
}

// Backend API: Generate itinerary
export async function generateItinerary(tripData: TripRequest): Promise<ItineraryResponse> {
  try {
    const response = await apiClient.post<ItineraryResponse>('/api/generate-itinerary', {
      city: tripData.city,
      homeBase: tripData.homeBase,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      travelStyles: tripData.travelStyles,
      pace: tripData.pace,
    })
    return response.data
  } catch (error) {
    const errorMessage =
      axios.isAxiosError(error) && error.response?.data?.message
        ? (error.response.data.message as string)
        : 'Failed to generate itinerary'
    console.error('Error generating itinerary:', error)
    throw new Error(errorMessage)
  }
}

interface DayRegenerateRequest {
  city: string
  homeBase: {
    lat: number
    lng: number
    address: string
  }
  dayIndex: number
  travelStyles: string[]
  pace: string
  existingItinerary: any[]
}

interface DayRegenerateResponse {
  success: boolean
  day: any
}

// Backend API: Regenerate single day
export async function regenerateDay(
  tripData: TripRequest,
  dayIndex: number
): Promise<DayRegenerateResponse> {
  try {
    const response = await apiClient.post<DayRegenerateResponse>('/api/regenerate-day', {
      city: tripData.city,
      homeBase: tripData.homeBase,
      dayIndex,
      travelStyles: tripData.travelStyles,
      pace: tripData.pace,
      existingItinerary: (tripData as any).itinerary,
    })
    return response.data
  } catch (error) {
    const errorMessage =
      axios.isAxiosError(error) && error.response?.data?.message
        ? (error.response.data.message as string)
        : 'Failed to regenerate day'
    console.error('Error regenerating day:', error)
    throw new Error(errorMessage)
  }
}

export default apiClient
