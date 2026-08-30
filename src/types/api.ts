export interface ActivityBlock {
  activity: string
  place_name: string
  category: string
  lat: number
  lng: number
  duration_minutes: number
  notes: string
  budget_usd?: number

  // Provenance — present only when the block was resolved against real place
  // data. `source: 'generated'` means the server fell back to ungrounded
  // generation, so these are absent and the coordinates are model-supplied.
  place_id?: string
  rating?: number
  rating_count?: number
  price_level?: number
  address?: string
  verified_at?: string
  source?: 'grounded' | 'generated'
}

export interface ItineraryDay {
  day: number
  date: string
  weather: string
  temperature: number
  weatherCode: number
  budget_usd?: number
  blocks: {
    morning: ActivityBlock
    afternoon: ActivityBlock
    evening: ActivityBlock
  }
}

export interface ItineraryResponse {
  success: boolean
  itinerary: ItineraryDay[]
  /** False when no verified places were available and the model generated freely. */
  grounded?: boolean
}

export interface WeatherData {
  daily: {
    time: string[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
    weather_code?: number[]
  }
}

export interface TripRequest {
  city: string
  homeBase: HomeBase
  startDate: string
  endDate: string
  travelStyles: string[]
  pace: 'Relaxed' | 'Balanced' | 'Packed'
  weatherForecast?: WeatherData
  preferences?: Preferences
}

/** Served by GET /api/taxonomy — the server owns this list. */
export interface TaxonomySubCategory {
  id: string
  label: string
}

export interface TaxonomyCategory {
  id: string
  label: string
  emoji: string
  subCategories: TaxonomySubCategory[]
}

export interface TaxonomyDietaryOption {
  id: string
  label: string
}

export interface Taxonomy {
  categories: TaxonomyCategory[]
  dietary: TaxonomyDietaryOption[]
}

export interface Preferences {
  /** Category id -> chosen sub-category ids. Soft preferences. */
  subCategories?: Record<string, string[]>
  /** Dietary constraint ids. Hard constraints. */
  dietary?: string[]
}

export interface HomeBase {
  lat: number
  lng: number
  address: string
}

export interface SearchResult {
  place_id: string
  name: string
  country: string
  description: string
  latitude?: number
  longitude?: number
  countryCode?: string
}

export interface City {
  id?: number
  name: string
  region?: string
  country: string
  latitude: number
  longitude: number
  countryCode?: string
  population?: number
  place_id?: string
}

export interface User {
  id: string
  email: string
  planTier: string
  monthlyGenerations: number
  monthlyGenerationsLimit: number
  monthlyRegenerations: number
  monthlyRegenerationsLimit: number
  daysUntilReset: number
}

export interface Quota {
  monthlyGenerations: number
  monthlyGenerationsLimit: number
  monthlyRegenerations: number
  monthlyRegenerationsLimit: number
  daysUntilReset: number
  planTier: string
}

export interface SavedTrip {
  id: string
  city: string
  title?: string
  startDate: string
  endDate: string
  createdAt?: string
  travelStyles: string[]
  pace: 'Relaxed' | 'Balanced' | 'Packed'
  homeBase: HomeBase
  coordinates?: [number, number] | null
  itineraryData: ItineraryDay[] | string
}
