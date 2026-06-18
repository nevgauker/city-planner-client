// Activity block in the itinerary
export interface ActivityBlock {
  activity: string
  place_name: string
  category: string
  lat: number
  lng: number
  duration_minutes: number
  notes: string
}

// Single day in the itinerary
export interface ItineraryDay {
  day: number
  date: string
  weather: string
  temperature: number
  weatherCode: number
  blocks: {
    morning: ActivityBlock
    afternoon: ActivityBlock
    evening: ActivityBlock
  }
}

// Complete itinerary response
export interface ItineraryResponse {
  success: boolean
  itinerary: ItineraryDay[]
}

// Weather forecast data
export interface WeatherData {
  daily: {
    time: string[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
    weather_code?: number[]
  }
}

// Trip request data
export interface TripRequest {
  city: string
  homeBase: {
    lat: number
    lng: number
    address: string
  }
  startDate: string
  endDate: string
  travelStyles: string[]
  pace: 'Relaxed' | 'Balanced' | 'Packed'
  weatherForecast?: WeatherData
}

// City search result
export interface City {
  id?: number
  name: string
  region?: string
  country: string
  latitude: number
  longitude: number
  countryCode?: string
  population?: number
}
