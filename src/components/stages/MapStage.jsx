import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { reverseGeocode } from '../../lib/api'
import LocationConfirmationCard from '../ui/LocationConfirmationCard'
import BackButton from '../ui/BackButton'

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapEvents({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng)
    },
  })
  return null
}

// Component to handle map invalidation
function MapResizer() {
  const map = useMap()

  useEffect(() => {
    // Invalidate size after mount to ensure proper rendering
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [map])

  return null
}

export default function MapStage({ city, coordinates, onHomeBaseSelected, onBack }) {
  const [selectedPin, setSelectedPin] = useState(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const mapContainerRef = useRef(null)

  const handleMapClick = async (latlng) => {
    setIsGeocoding(true)
    try {
      const result = await reverseGeocode(latlng.lat, latlng.lng)
      const address = result.address?.city || result.address?.town || result.display_name || 'Selected location'

      setSelectedPin({
        lat: latlng.lat,
        lng: latlng.lng,
        address,
      })
    } catch (error) {
      toast.error('Failed to get address for this location')
      console.error(error)
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

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="relative w-full"
        style={{ height: 'calc(100vh - 80px)', backgroundColor: '#1a1f3a' }}
      >
        <MapContainer
          center={[coordinates.lat, coordinates.lng]}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <MapResizer />
          <MapEvents onMapClick={handleMapClick} />

          {selectedPin && (
            <Marker position={[selectedPin.lat, selectedPin.lng]}>
              <Popup>{selectedPin.address}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

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
