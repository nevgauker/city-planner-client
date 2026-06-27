import { ReactNode } from 'react'
import { LoadScript } from '@react-google-maps/api'

interface Props {
  children: ReactNode
}

export default function GoogleMapProvider({ children }: Props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-navy-900">
        <div className="text-center text-white">
          <p className="text-lg font-bold mb-4">Google Maps Error</p>
          <p className="text-sm text-white/60 mb-4">API Key not configured</p>
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
