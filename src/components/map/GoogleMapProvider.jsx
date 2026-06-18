import { useEffect, useState } from 'react'

export default function GoogleMapProvider({ children }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if API key is configured
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      setError('API Key not configured')
      return
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      return
    }

    // Load Google Maps script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      setIsLoaded(true)
      console.log('✓ Google Maps API loaded')
    }

    script.onerror = () => {
      setError('Failed to load Google Maps API')
      console.error('Failed to load Google Maps API')
    }

    document.head.appendChild(script)

    return () => {
      // Don't remove the script on unmount to avoid reloading
    }
  }, [apiKey])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-navy-900">
        <div className="text-center text-white">
          <p className="text-lg font-bold mb-4">Google Maps Error</p>
          <p className="text-sm text-white/60 mb-4">{error}</p>
          <p className="text-xs text-white/40">
            Get a free API key from: https://console.cloud.google.com/google/maps-apis/credentials
          </p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-navy-900">
        <div className="text-white">Loading Google Maps...</div>
      </div>
    )
  }

  return children
}
