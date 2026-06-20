import { useState, useEffect, FC, ReactNode } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import GlobeStage from './components/stages/GlobeStage'
import GoogleMapStage from './components/stages/GoogleMapStage'
import TripDetailsStage from './components/stages/TripDetailsStage'
import ItineraryStage from './components/stages/ItineraryStage'
import GoogleMapProvider from './components/map/GoogleMapProvider'
import AuthModal from './components/auth/AuthModal.jsx'
import QuotaBar from './components/ui/QuotaBar.jsx'
import SavedTripsPanel from './components/ui/SavedTripsPanel.jsx'
import { useAuth } from './contexts/AuthContext.jsx'
import { decodeTripFromShare } from './lib/api'
import type { City, ItineraryDay, WeatherData } from './types/api'

const STAGES = {
  GLOBE: 0,
  MAP: 1,
  DETAILS: 2,
  ITINERARY: 3,
}

interface TripData {
  city: string | null
  coordinates: [number, number] | null
  homeBase: {
    lat: number
    lng: number
    address: string
  } | null
  startDate: string | null
  endDate: string | null
  travelStyles: string[]
  pace: 'Relaxed' | 'Balanced' | 'Packed'
  itinerary: ItineraryDay[] | null
  weatherForecast?: WeatherData
}

const App: FC = () => {
  const authContext = useAuth() as any
  const { user, refreshQuota } = authContext
  const [currentStage, setCurrentStage] = useState<number>(STAGES.GLOBE)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSavedTrips, setShowSavedTrips] = useState(false)
  const [pendingGeneration, setPendingGeneration] = useState(false)
  const [existingItinerary, setExistingItinerary] = useState<ItineraryDay[] | null>(null)
  const [tripData, setTripData] = useState<TripData>({
    city: null,
    coordinates: null,
    homeBase: null,
    startDate: null,
    endDate: null,
    travelStyles: [],
    pace: 'Balanced',
    itinerary: null,
  })

  // Check for shared trip URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sharedData = params.get('shared')

    if (sharedData) {
      const decoded = decodeTripFromShare(sharedData)
      if (decoded) {
        const { itinerary, ...trip } = decoded
        setTripData(prev => ({
          ...prev,
          ...trip,
        }))
        setExistingItinerary(itinerary)
        setCurrentStage(STAGES.ITINERARY)
        toast.success('Shared trip loaded!')
      } else {
        toast.error('Failed to load shared trip')
      }
    }
  }, [])

  const handleCitySelected = (city: string, coordinates: [number, number]): void => {
    setTripData((prev) => ({
      ...prev,
      city,
      coordinates,
    }))
    setCurrentStage(STAGES.MAP)
  }

  const handleHomeBaseSelected = (coordinates: [number, number], address: string): void => {
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

  interface TripDetails {
    startDate: string
    endDate: string
    travelStyles: string[]
    pace: 'Relaxed' | 'Balanced' | 'Packed'
  }

  const handleTripDetailsSubmit = (details: TripDetails): void => {
    console.log('🔍 handleTripDetailsSubmit called, user:', user)
    setExistingItinerary(null)
    setTripData((prev) => ({
      ...prev,
      startDate: details.startDate,
      endDate: details.endDate,
      travelStyles: details.travelStyles,
      pace: details.pace,
    }))

    if (!user) {
      console.log('📝 No user found, showing auth modal')
      setPendingGeneration(true)
      setShowAuthModal(true)
      return
    }

    console.log('✅ User authenticated, proceeding to itinerary stage')
    setCurrentStage(STAGES.ITINERARY)
  }

  const handleAuthSuccess = (): void => {
    setShowAuthModal(false)
    refreshQuota()
    if (pendingGeneration) {
      setPendingGeneration(false)
      setCurrentStage(STAGES.ITINERARY)
    }
  }

  const handleRegenerateDay = (dayIndex: number): void => {
    console.log('Regenerate day:', dayIndex)
  }

  const handleBackToMap = (): void => {
    setCurrentStage(STAGES.MAP)
  }

  const handleBackToDetails = (): void => {
    setCurrentStage(STAGES.DETAILS)
  }

  const handleLoadSavedTrip = (savedTripData: TripData, itinerary: ItineraryDay[]): void => {
    setTripData((prev) => ({
      ...prev,
      ...savedTripData,
    }))
    setExistingItinerary(itinerary)
    setCurrentStage(STAGES.ITINERARY)
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
            existingItinerary={existingItinerary}
          />
        )}

        <div className="no-print">
          <QuotaBar
            onSignInClick={() => setShowAuthModal(true)}
            onViewTrips={() => setShowSavedTrips(true)}
          />
        </div>

        {showAuthModal && (
          <AuthModal
            onSuccess={handleAuthSuccess}
            onClose={() => {
              setShowAuthModal(false)
              setPendingGeneration(false)
            }}
          />
        )}

        {showSavedTrips && (
          <SavedTripsPanel
            onClose={() => setShowSavedTrips(false)}
            onLoadTrip={handleLoadSavedTrip}
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

export default App
