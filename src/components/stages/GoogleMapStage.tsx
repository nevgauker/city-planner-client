import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { GoogleMap, MarkerF } from '@react-google-maps/api'
import { reverseGeocode } from '../../lib/api'
import { modernCivicMapStyle } from '../../lib/mapStyles'
import LocationConfirmationCard from '../ui/LocationConfirmationCard'
import BackButton from '../ui/BackButton'

interface Pin { lat: number; lng: number; address: string }

interface Props {
  city: string | null
  coordinates: [number, number]
  onHomeBaseSelected: (coordinates: [number, number], address: string) => void
  onBack: () => void
}

export default function GoogleMapStage({ city, coordinates, onHomeBaseSelected, onBack }: Props) {
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (selectedPin || !e.latLng) return
    setIsGeocoding(true)
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    try {
      const result = await reverseGeocode(lat, lng)
      const address = result.address?.city || result.address?.town || result.display_name || 'Selected location'
      setSelectedPin({ lat, lng, address })
    } catch {
      const fallbackAddress = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      setSelectedPin({ lat, lng, address: fallbackAddress })
      toast.info('Location selected (address unavailable)')
    } finally {
      setIsGeocoding(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full bg-neutral-dark" style={{ height: '100vh' }}>
      <BackButton onClick={onBack} />
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: 'calc(100vh - 20px)', position: 'absolute', top: 0, left: 0 }}
        options={{ zoom: 14, center: { lat: coordinates[0], lng: coordinates[1] }, mapTypeControl: false, fullscreenControl: false, streetViewControl: false, styles: modernCivicMapStyle as google.maps.MapTypeStyle[], backgroundColor: '#f5f1e8' }}
        onClick={handleMapClick}
      >
        {selectedPin && (
          <MarkerF
            position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
            icon={{ path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z', fillColor: '#ffc68d', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 2 }}
          />
        )}
      </GoogleMap>
      {!selectedPin && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
          <div className="glass-effect card-elevation px-6 py-3 rounded-lg text-center">
            <p className="text-neutral-dark text-base sm:text-sm">Click on the map to select your home base in {city}</p>
          </div>
        </motion.div>
      )}
      {selectedPin && (
        <LocationConfirmationCard
          address={selectedPin.address}
          city={city ?? ''}
          isLoading={isGeocoding}
          onConfirm={() => onHomeBaseSelected([selectedPin.lat, selectedPin.lng], selectedPin.address)}
          onChangeLocation={() => setSelectedPin(null)}
        />
      )}
    </motion.div>
  )
}
