import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

export default function CitySearch({ onSearch, results, onSelectCity, isLoading, error }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    // Client-side search is instant, so search immediately
    onSearch(query)
  }, [query])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
  }

  const handleSelectCity = (city) => {
    onSelectCity(city)
    setQuery('')
  }

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for a city..."
          className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/30 transition-all"
        />
        <Search className="absolute left-3 top-3.5 w-5 h-5 text-white/50" />

        {isLoading && (
          <div className="absolute right-3 top-3.5">
            <div className="animate-spin h-5 w-5 border-2 border-warm-accent border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full mt-2 w-full bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm z-20"
        >
          {error}
        </motion.div>
      )}

      {/* Dropdown Results */}
      {results.length > 0 && !error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full mt-2 w-full bg-navy-800 border border-white/20 rounded-lg overflow-hidden card-elevation z-20"
        >
          {results.map((city, index) => (
            <motion.button
              key={city.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelectCity(city)}
              className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 text-white"
            >
              <div className="font-medium">{city.name}</div>
              <div className="text-xs text-white/50">
                {city.countryCode && `${city.countryCode}`}
                {city.admin1Code && ` • ${city.admin1Code}`}
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
