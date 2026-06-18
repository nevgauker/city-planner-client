import { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import GlobeStage from './components/stages/GlobeStage'
import GoogleMapStage from './components/stages/GoogleMapStage'
import TripDetailsStage from './components/stages/TripDetailsStage'
import ItineraryStage from './components/stages/ItineraryStage'
import GoogleMapProvider from './components/map/GoogleMapProvider'
import { decodeTripFromShare } from './lib/api'

const STAGES = {
  GLOBE: 0,
  MAP: 1,
  DETAILS: 2,
  ITINERARY: 3,
}

export default function App() {
  const [currentStage, setCurrentStage] = useState(STAGES.GLOBE)
  const [tripData, setTripData] = useState({
    city: null,
    coordinates: null,
    homeBase: null,
    startDate: null,
    endDate: null,
    travelStyles: [],
    pace: 'Balanced',
    itinerary: null,
  })

  // Handle shared trips from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shared = params.get('shared')
    if (shared) {
      const sharedTrip = decodeTripFromShare(shared)
      if (sharedTrip) {
        setTripData({
          city: sharedTrip.city,
          homeBase: sharedTrip.homeBase,
          startDate: sharedTrip.startDate,
          endDate: sharedTrip.endDate,
          travelStyles: sharedTrip.travelStyles,
          pace: sharedTrip.pace,
          itinerary: sharedTrip.itinerary,
          coordinates: null,
        })
        setCurrentStage(STAGES.ITINERARY)
        toast.success('Shared itinerary loaded!')
      } else {
        toast.error('Failed to load shared itinerary')
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleCitySelected = (city, coordinates) => {
    setTripData((prev) => ({
      ...prev,
      city,
      coordinates,
    }))
    setCurrentStage(STAGES.MAP)
  }

  const handleHomeBaseSelected = (coordinates, address) => {
    setTripData((prev) => ({
      ...prev,
      homeBase: {
        lat: coordinates[0],
        lng: coordinates[1],
        address,
      },
    }))
    setCurrentStage(STAGES.DETAILS)
  }

  const handleTripDetailsSubmit = (details) => {
    setTripData((prev) => ({
      ...prev,
      startDate: details.startDate,
      endDate: details.endDate,
      travelStyles: details.travelStyles,
      pace: details.pace,
    }))
    setCurrentStage(STAGES.ITINERARY)
  }

  const handleRegenerateDay = (dayIndex) => {
    // Will be implemented in ItineraryStage
    console.log('Regenerate day:', dayIndex)
  }

  const handleBackToMap = () => {
    setCurrentStage(STAGES.MAP)
  }

  const handleBackToDetails = () => {
    setCurrentStage(STAGES.DETAILS)
  }

  return (
    <GoogleMapProvider>
      <div className="w-full h-screen bg-navy-900 overflow-hidden">
        {currentStage === STAGES.GLOBE && (
          <GlobeStage onCitySelected={handleCitySelected} />
        )}

        {currentStage === STAGES.MAP && (
          <GoogleMapStage
            city={tripData.city}
            coordinates={tripData.coordinates}
            onHomeBaseSelected={handleHomeBaseSelected}
            onBack={() => setCurrentStage(STAGES.GLOBE)}
          />
        )}

      {currentStage === STAGES.DETAILS && (
        <TripDetailsStage
          city={tripData.city}
          onSubmit={handleTripDetailsSubmit}
          onBack={handleBackToMap}
        />
      )}

      {currentStage === STAGES.ITINERARY && (
        <ItineraryStage
          tripData={tripData}
          onRegenerateDay={handleRegenerateDay}
          onBack={handleBackToDetails}
        />
      )}

        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </GoogleMapProvider>
  )
}
