import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { searchCities } from '../../lib/api'
import GlobeCanvas from '../3d/GlobeCanvas'
import CitySearch from '../ui/CitySearch'

export default function GlobeStage({ onCitySelected }) {
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCity, setSelectedCity] = useState(null)
  const [searchError, setSearchError] = useState(null)
  const globeRef = useRef(null)

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      const results = await searchCities(query)

      setSearchResults(results)
      if (results.length === 0) {
        setSearchError('No cities found. Try: Paris, London, Tokyo, New York...')
      }
    } catch (error) {
      console.error('Search error:', error)
      const errorMessage = error.message || 'Failed to search cities'
      setSearchError(errorMessage)
      toast.error(errorMessage)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleCitySelect = (city) => {
    setSelectedCity(city)
    setSearchResults([])

    // Trigger globe rotation animation
    if (globeRef.current) {
      globeRef.current.rotateTo(city.latitude, city.longitude)
    }

    // Call callback after animation completes
    setTimeout(() => {
      onCitySelected(city.name, {
        lat: city.latitude,
        lng: city.longitude,
      })
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full"
    >
      {/* 3D Globe Canvas */}
      <GlobeCanvas ref={globeRef} />

      {/* Search Bar Overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
        <CitySearch
          onSearch={handleSearch}
          results={searchResults}
          onSelectCity={handleCitySelect}
          isLoading={isSearching}
          error={searchError}
        />
      </div>

      {/* Welcome Text */}
      {!selectedCity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white/60"
        >
          <p className="text-sm">Drag to rotate • Search for a city to start your adventure</p>
          <p className="text-xs mt-2 opacity-50">✋ Touch to explore the globe</p>
        </motion.div>
      )}

      {/* Loading State */}
      {selectedCity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/30"
        >
          <div className="glass-effect card-elevation px-8 py-6 rounded-lg">
            <div className="animate-spin h-8 w-8 border-4 border-warm-accent border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-white text-center">Preparing your map...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
