import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { GoogleMap, MarkerF } from '@react-google-maps/api'
import { searchCities, getCityDetails } from '../../lib/api'
import { modernCivicMapStyle } from '../../lib/mapStyles'
import CitySearch from '../ui/CitySearch'
import type { SearchResult } from '../../types/api'

interface Props {
  onCitySelected: (city: string, coordinates: [number, number]) => void
}

export default function MapHeroStage({ onCitySelected }: Props) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCity, setSelectedCity] = useState<SearchResult | null>(null)
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number } | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [showOnboardingCue, setShowOnboardingCue] = useState(true)
  const mapRef = useRef<google.maps.Map | null>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const onboardingSeen = localStorage.getItem('onboarding_seen')
    setShowOnboardingCue(!onboardingSeen)
  }, [])

  const handleSearch = useCallback(async (query: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchAbortRef.current?.abort()

    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    searchTimerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      searchAbortRef.current = controller
      setIsSearching(true)
      setSearchError(null)
      try {
        const results = await searchCities(query, controller.signal)
        setSearchResults(results)
        if (results.length === 0) setSearchError('No cities found. Try: Paris, London, Tokyo, New York...')
      } catch (error) {
        if (controller.signal.aborted) return
        const errorMessage = (error as Error).message || 'Failed to search cities'
        setSearchError(errorMessage)
        toast.error(errorMessage)
        setSearchResults([])
      } finally {
        if (!controller.signal.aborted) setIsSearching(false)
      }
    }, 300)
  }, [])

  const handleCitySelect = async (result: SearchResult) => {
    localStorage.setItem('onboarding_seen', '1')
    setShowOnboardingCue(false)
    setSelectedCity(result)
    setSearchResults([])
    setIsSearching(true)

    try {
      let lat: number, lng: number, name: string

      if (result.place_id) {
        const city = await getCityDetails(result.place_id)
        lat = city.latitude
        lng = city.longitude
        name = city.name
      } else {
        lat = result.latitude!
        lng = result.longitude!
        name = result.name
      }

      setSelectedPin({ lat, lng })
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng })
        mapRef.current.setZoom(6)
      }

      setTimeout(() => onCitySelected(name, [lat, lng]), 1000)
    } catch (error) {
      console.error('City select error:', error)
      toast.error('Could not load city details. Please try again.')
      setSelectedCity(null)
      setSelectedPin(null)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-screen overflow-hidden">
      {/* Full-screen Google Map */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat: 20, lng: 10 }}
        zoom={2}
        options={{
          styles: modernCivicMapStyle as google.maps.MapTypeStyle[],
          backgroundColor: '#f5f1e8',
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: false,
          scaleControl: false,
        }}
        onLoad={(map) => {
          mapRef.current = map
        }}
      >
        {/* City marker */}
        {selectedPin && (
          <MarkerF
            position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
            icon={{
              path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
              fillColor: '#b8674f',
              fillOpacity: 1,
              strokeColor: '#f5f1e8',
              strokeWeight: 2,
              scale: 1.5,
            }}
          />
        )}
      </GoogleMap>

      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="topo-divider" />
        <motion.div
          className="bg-cream-50/95 backdrop-blur-sm px-6 py-5"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between mb-4 max-w-2xl mx-auto">
            <h1 className="text-xl font-light text-neutral-dark tracking-wide">City Planner</h1>
            <span className="text-xs text-neutral-light hidden sm:block">
              AI-powered travel itineraries
            </span>
          </div>
          <div className="max-w-md mx-auto">
            <CitySearch
              onSearch={handleSearch}
              results={searchResults}
              onSelectCity={handleCitySelect}
              isLoading={isSearching}
              error={searchError}
              dropUp={true}
            />
          </div>
          <p className="text-center text-xs text-neutral-light mt-3">
            Search for a city to begin planning your trip
          </p>
        </motion.div>
      </div>

      {/* Loading Overlay */}
      {selectedCity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-cream-50/20 backdrop-blur-sm"
        >
          <div className="card-elevation px-8 py-6">
            <div className="animate-spin h-8 w-8 border-4 border-accent-terracotta border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-neutral-dark text-center">Preparing your map...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
