import { LoadScript } from '@react-google-maps/api'

export default function GoogleMapProvider({ children }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Check if API key is configured
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-navy-900">
        <div className="text-center text-white">
          <p className="text-lg font-bold mb-4">Google Maps Error</p>
          <p className="text-sm text-white/60 mb-4">API Key not configured</p>
          <p className="text-xs text-white/40">
            Get a free API key from: https://console.cloud.google.com/google/maps-apis/credentials
          </p>
        </div>
      </div>
    )
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={['places']}>
      {children}
    </LoadScript>
  )
}
