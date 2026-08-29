import axios, { AxiosInstance } from 'axios'
import citiesData from './cities.json'
import type { City, SearchResult, HomeBase, ItineraryDay, WeatherData, TripRequest, ItineraryResponse, ActivityBlock, User } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('city_planner_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

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

export async function searchCities(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
  if (!query || typeof query !== 'string' || query.trim().length < 2) return []

  try {
    const response = await apiClient.get<SearchResult[]>('/api/search-cities', {
      params: { query: query.trim() },
      signal,
    })
    return response.data
  } catch (error) {
    if (axios.isCancel(error)) throw error
    const q = query.trim().toLowerCase()
    return (citiesData.cities as unknown as City[])
      .filter((c) => c.name.toLowerCase().startsWith(q) || c.country.toLowerCase().startsWith(q))
      .slice(0, 10)
      .map((c) => ({
        place_id: '',
        name: c.name,
        country: c.country,
        description: `${c.name}, ${c.country}`,
        latitude: c.latitude,
        longitude: c.longitude,
        countryCode: c.countryCode,
      }))
  }
}

export async function getCityDetails(placeId: string, signal?: AbortSignal): Promise<City> {
  const response = await apiClient.get<City>('/api/place-details', {
    params: { placeId },
    signal,
  })
  return response.data
}

export async function getWeatherForecast(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string
): Promise<WeatherData | null> {
  try {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null

    const formatDate = (dateStr: string | null | undefined): string | null => {
      if (!dateStr) return null
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return null
      return date.toISOString().split('T')[0]
    }

    const start = formatDate(startDate)
    const end = formatDate(endDate)
    if (!start || !end) return null

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
    return response.data
  } catch {
    return null
  }
}

interface GeocodingResult {
  address: { road?: string; city?: string; country?: string; town?: string }
  display_name?: string
  lat: string
  lon: string
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
  const response = await apiClient.get<GeocodingResult>('/api/reverse-geocode', {
    params: { lat, lng },
  })
  return response.data
}

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
    const msg =
      axios.isAxiosError(error) && error.response?.data?.message
        ? (error.response.data.message as string)
        : 'Failed to generate itinerary'
    throw new Error(msg)
  }
}

interface DayRegenerateResponse {
  success: boolean
  day: ItineraryDay
}

export async function regenerateDay(
  tripData: TripRequest & { itinerary?: ItineraryDay[] | null },
  dayIndex: number
): Promise<DayRegenerateResponse> {
  try {
    const response = await apiClient.post<DayRegenerateResponse>('/api/regenerate-day', {
      city: tripData.city,
      homeBase: tripData.homeBase,
      dayIndex,
      travelStyles: tripData.travelStyles,
      pace: tripData.pace,
      existingItinerary: tripData.itinerary,
    })
    return response.data
  } catch (error) {
    const msg =
      axios.isAxiosError(error) && error.response?.data?.message
        ? (error.response.data.message as string)
        : 'Failed to regenerate day'
    throw new Error(msg)
  }
}

interface SwapActivityResponse {
  success: boolean
  block: ActivityBlock
  grounded?: boolean
}

export async function swapActivity(
  city: string,
  dayIndex: number,
  blockType: string,
  currentActivity: ActivityBlock,
  travelStyles: string[],
  pace: string,
  homeBase: HomeBase,
  /** Places already scheduled elsewhere, so the swap does not duplicate one. */
  excludePlaceIds?: string[]
): Promise<SwapActivityResponse> {
  try {
    const response = await apiClient.post<SwapActivityResponse>('/api/swap-activity', {
      city,
      homeBase,
      dayIndex,
      blockType,
      currentActivity,
      travelStyles,
      pace,
      excludePlaceIds,
    })
    return response.data
  } catch (error) {
    const msg =
      axios.isAxiosError(error) && error.response?.data?.message
        ? (error.response.data.message as string)
        : 'Failed to swap activity'
    throw new Error(msg)
  }
}

interface LocalTrip {
  id: string
  city: string
  homeBase: HomeBase
  startDate: string
  endDate: string
  travelStyles: string[]
  pace: string
  itinerary: ItineraryDay[]
  savedAt: string
}

export function saveTrip(tripId: string, tripData: Partial<LocalTrip>, itinerary: ItineraryDay[]): string {
  const trips: Record<string, LocalTrip> = JSON.parse(localStorage.getItem('savedTrips') || '{}')
  trips[tripId] = {
    id: tripId,
    city: tripData.city ?? '',
    homeBase: tripData.homeBase!,
    startDate: tripData.startDate ?? '',
    endDate: tripData.endDate ?? '',
    travelStyles: tripData.travelStyles ?? [],
    pace: tripData.pace ?? 'Balanced',
    itinerary,
    savedAt: new Date().toISOString(),
  }
  localStorage.setItem('savedTrips', JSON.stringify(trips))
  return tripId
}

export function getSavedTrips(): LocalTrip[] {
  const trips: Record<string, LocalTrip> = JSON.parse(localStorage.getItem('savedTrips') || '{}')
  return Object.values(trips).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  )
}

export function getTrip(tripId: string): LocalTrip | null {
  const trips: Record<string, LocalTrip> = JSON.parse(localStorage.getItem('savedTrips') || '{}')
  return trips[tripId] || null
}

export function deleteTrip(tripId: string): void {
  const trips: Record<string, LocalTrip> = JSON.parse(localStorage.getItem('savedTrips') || '{}')
  delete trips[tripId]
  localStorage.setItem('savedTrips', JSON.stringify(trips))
}

export function encodeTripForShare(tripData: object, itinerary: ItineraryDay[]): string {
  return btoa(JSON.stringify({ ...tripData, itinerary }))
}

export function decodeTripFromShare(encoded: string): (object & { itinerary: ItineraryDay[] }) | null {
  try {
    return JSON.parse(atob(encoded))
  } catch {
    return null
  }
}

interface AuthResponse {
  token: string
  user: { id: string; email: string; planTier: string }
}

export const loginUser = (email: string, password: string): Promise<AuthResponse> =>
  apiClient.post<AuthResponse>('/api/auth/login', { email, password }).then((r) => r.data)

export const registerUser = (email: string, password: string): Promise<AuthResponse> =>
  apiClient.post<AuthResponse>('/api/auth/register', { email, password }).then((r) => r.data)

export const googleAuth = (googleToken: string): Promise<AuthResponse> =>
  apiClient.post<AuthResponse>('/api/auth/google', { token: googleToken }).then((r) => r.data)

export const fetchMe = (): Promise<User> =>
  apiClient.get<User>('/api/auth/me').then((r) => r.data)

export const saveTripToBackend = (
  city: string,
  title: string,
  startDate: string,
  endDate: string,
  travelStyles: string[],
  pace: string,
  homeBase: HomeBase,
  itineraryData: ItineraryDay[]
): Promise<unknown> =>
  apiClient
    .post('/api/trips', { city, title, startDate, endDate, travelStyles, pace, homeBase, itineraryData })
    .then((r) => r.data)

export const submitFeedback = (
  rating: number,
  city: string,
  comment: string,
  wouldRecommend: boolean | null
): Promise<unknown> =>
  apiClient.post('/api/feedback', { rating, city, comment, wouldRecommend }).then((r) => r.data)

export const submitUpgradeInterest = (reason: string): Promise<unknown> =>
  apiClient.post('/api/feedback/upgrade-interest', { reason }).then((r) => r.data)

export const listTrips = (): Promise<unknown> =>
  apiClient.get('/api/trips').then((r) => r.data)

export const deleteSavedTrip = (id: string): Promise<unknown> =>
  apiClient.delete(`/api/trips/${id}`).then((r) => r.data)

export default apiClient
