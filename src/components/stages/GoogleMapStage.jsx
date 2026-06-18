import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { GoogleMap, MarkerF } from '@react-google-maps/api'
import { reverseGeocode } from '../../lib/api'
import LocationConfirmationCard from '../ui/LocationConfirmationCard'
import BackButton from '../ui/BackButton'

// Dark map style matching our theme
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1f3a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1f3a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d1d5db' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7280' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#2d3748' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2d3748' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3f4651' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212531' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3f4f6' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2d3748' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7280' }],
  },
]

export default function GoogleMapStage({ city, coordinates, onHomeBaseSelected, onBack }) {
  const mapRef = useRef(null)
  const [selectedPin, setSelectedPin] = useState(null)
  const [isGeocoding, setIsGeocoding] = useState(false)

  const mapOptions = {
    zoom: 14,
    center: { lat: coordinates.lat, lng: coordinates.lng },
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    styles: darkMapStyle,
    backgroundColor: '#1a1f3a',
  }

  const handleMapClick = async (e) => {
    if (selectedPin) return // Already selected, don't allow another

    setIsGeocoding(true)
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()

    try {
      // Try to get address from Nominatim
      const result = await reverseGeocode(lat, lng)
      const address = result.address?.city || result.address?.town || result.display_name || 'Selected location'

      console.log('✓ Geocoding successful:', address)

      setSelectedPin({
        lat,
        lng,
        address,
      })
    } catch (error) {
      console.error('Geocoding error:', error.message)
      // Fallback: use coordinates as address if geocoding fails
      const fallbackAddress = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      console.log('Using fallback address:', fallbackAddress)

      setSelectedPin({
        lat,
        lng,
        address: fallbackAddress,
      })
      toast.info('Location selected (address unavailable)')
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleConfirmLocation = () => {
    onHomeBaseSelected([selectedPin.lat, selectedPin.lng], selectedPin.address)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full bg-navy-900"
      style={{ height: '100vh' }}
    >
      {/* Back Button */}
      <BackButton onClick={onBack} />

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: 'calc(100vh - 20px)',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        options={mapOptions}
        onLoad={(map) => {
          mapRef.current = map
        }}
        onClick={handleMapClick}
      >
        {/* Home Base Marker */}
        {selectedPin && (
          <MarkerF
            position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
            icon={{
              path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
              fillColor: '#ff9d56',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
              scale: 2,
            }}
          />
        )}
      </GoogleMap>

      {/* Instruction Overlay */}
      {!selectedPin && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="glass-effect card-elevation px-6 py-3 rounded-lg text-center">
            <p className="text-white text-sm">Click on the map to select your home base in {city}</p>
          </div>
        </motion.div>
      )}

      {/* Confirmation Card */}
      {selectedPin && (
        <LocationConfirmationCard
          address={selectedPin.address}
          city={city}
          isLoading={isGeocoding}
          onConfirm={handleConfirmLocation}
          onChangeLocation={() => setSelectedPin(null)}
        />
      )}
    </motion.div>
  )
}
