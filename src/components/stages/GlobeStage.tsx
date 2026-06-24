import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { searchCities, getCityDetails } from '../../lib/api'
import GlobeCanvas, { GlobeHandle } from '../3d/GlobeCanvas'
import CitySearch from '../ui/CitySearch'
import type { SearchResult } from '../../types/api'

interface Props {
  onCitySelected: (city: string, coordinates: [number, number]) => void
}

export default function GlobeStage({ onCitySelected }: Props) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCity, setSelectedCity] = useState<SearchResult | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const globeRef = useRef<GlobeHandle>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchAbortRef = useRef<AbortController | null>(null)

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

      globeRef.current?.rotateTo(lat, lng)
      setTimeout(() => onCitySelected(name, [lat, lng]), 2000)
    } catch (error) {
      console.error('City select error:', error)
      toast.error('Could not load city details. Please try again.')
      setSelectedCity(null)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-screen h-screen">
      <GlobeCanvas ref={globeRef} />

      <div className="absolute top-4 left-4 z-10">
        <div className="text-white">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🌍</span>
            <div>
              <h1 className="text-xl font-bold">City Planner</h1>
              <p className="text-xs text-white/60">AI-powered travel itineraries</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
        <CitySearch onSearch={handleSearch} results={searchResults} onSelectCity={handleCitySelect} isLoading={isSearching} error={searchError} />
      </div>

      {!selectedCity && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white/60">
          <p className="text-sm">Drag to rotate • Search for a city to start your adventure</p>
          <p className="text-xs mt-2 opacity-50">✋ Touch to explore the globe</p>
        </motion.div>
      )}

      {selectedCity && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="glass-effect card-elevation px-8 py-6 rounded-lg">
            <div className="animate-spin h-8 w-8 border-4 border-warm-accent border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-white text-center">Preparing your map...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
