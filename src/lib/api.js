import axios from 'axios'
import citiesData from './cities.json'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('city_planner_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 logout
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('city_planner_token')
      localStorage.removeItem('city_planner_user')
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(error)
  }
)

// Client-side city search (instant, no API calls)
export async function searchCities(query, signal) {
  // Return empty for empty query
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return []
  }

  try {
    const searchQuery = query.trim().toLowerCase()

    // Filter cities by name or country (client-side, instant)
    const results = citiesData.cities
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
export async function getWeatherForecast(lat, lng, startDate, endDate) {
  try {
    // Validate coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates, using fallback weather')
      return null
    }

    // Ensure dates are in YYYY-MM-DD format
    const formatDate = (dateStr) => {
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

    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
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
    console.error('❌ Weather error:', error.message)
    console.warn('Weather API unavailable, continuing without weather data')
    return null
  }
}

// Nominatim reverse geocoding
export async function reverseGeocode(lat, lng) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat,
        lon: lng,
      },
      headers: {
        'User-Agent': 'TravelPlanner/1.0',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    throw new Error('Failed to get address')
  }
}

// Backend API: Generate itinerary
export async function generateItinerary(tripData) {
  try {
    const response = await apiClient.post('/api/generate-itinerary', {
      city: tripData.city,
      homeBase: tripData.homeBase,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      travelStyles: tripData.travelStyles,
      pace: tripData.pace,
    })
    return response.data
  } catch (error) {
    console.error('Error generating itinerary:', error)
    throw new Error(error.response?.data?.message || 'Failed to generate itinerary')
  }
}

// Backend API: Regenerate single day
export async function regenerateDay(tripData, dayIndex) {
  try {
    const response = await apiClient.post('/api/regenerate-day', {
      city: tripData.city,
      homeBase: tripData.homeBase,
      dayIndex,
      travelStyles: tripData.travelStyles,
      pace: tripData.pace,
      existingItinerary: tripData.itinerary,
    })
    return response.data
  } catch (error) {
    console.error('Error regenerating day:', error)
    throw new Error(error.response?.data?.message || 'Failed to regenerate day')
  }
}

// LocalStorage management for saved trips
export function saveTrip(tripId, tripData, itinerary) {
  const trips = JSON.parse(localStorage.getItem('savedTrips') || '{}')
  trips[tripId] = {
    id: tripId,
    city: tripData.city,
    homeBase: tripData.homeBase,
    startDate: tripData.startDate,
    endDate: tripData.endDate,
    travelStyles: tripData.travelStyles,
    pace: tripData.pace,
    itinerary,
    savedAt: new Date().toISOString(),
  }
  localStorage.setItem('savedTrips', JSON.stringify(trips))
  return tripId
}

export function getSavedTrips() {
  const trips = JSON.parse(localStorage.getItem('savedTrips') || '{}')
  return Object.values(trips).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
}

export function getTrip(tripId) {
  const trips = JSON.parse(localStorage.getItem('savedTrips') || '{}')
  return trips[tripId] || null
}

export function deleteTrip(tripId) {
  const trips = JSON.parse(localStorage.getItem('savedTrips') || '{}')
  delete trips[tripId]
  localStorage.setItem('savedTrips', JSON.stringify(trips))
}

// Share link encoding/decoding
export function encodeTripForShare(tripData, itinerary) {
  const data = {
    city: tripData.city,
    homeBase: tripData.homeBase,
    startDate: tripData.startDate,
    endDate: tripData.endDate,
    travelStyles: tripData.travelStyles,
    pace: tripData.pace,
    itinerary,
  }
  const json = JSON.stringify(data)
  return btoa(json)
}

export function decodeTripFromShare(encoded) {
  try {
    const json = atob(encoded)
    return JSON.parse(json)
  } catch (error) {
    console.error('Failed to decode shared trip:', error)
    return null
  }
}

// Auth API functions
export const loginUser = (email, password) =>
  apiClient.post('/api/auth/login', { email, password }).then((r) => r.data)

export const registerUser = (email, password) =>
  apiClient.post('/api/auth/register', { email, password }).then((r) => r.data)

export const fetchMe = () => apiClient.get('/api/auth/me').then((r) => r.data)

// Backend trip persistence
export const saveTripToBackend = (city, title, itineraryData) =>
  apiClient
    .post('/trips', {
      city,
      title,
      itineraryData: JSON.stringify(itineraryData),
    })
    .then((r) => r.data)

// Feedback API functions
export const submitFeedback = (rating, city, comment, wouldRecommend) =>
  apiClient
    .post('/feedback', { rating, city, comment, wouldRecommend })
    .then((r) => r.data)

export const submitUpgradeInterest = (reason) =>
  apiClient.post('/feedback/upgrade-interest', { reason }).then((r) => r.data)

// Trip management API
export const listTrips = () =>
  apiClient.get('/api/trips').then((r) => r.data)

export const deleteSavedTrip = (id) =>
  apiClient.delete(`/api/trips/${id}`).then((r) => r.data)

export default apiClient
