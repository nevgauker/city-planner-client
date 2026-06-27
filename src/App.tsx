import { useState, useEffect, FC } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import MapHeroStage from './components/stages/MapHeroStage'
import GoogleMapStage from './components/stages/GoogleMapStage'
import TripDetailsStage from './components/stages/TripDetailsStage'
import ItineraryStage from './components/stages/ItineraryStage'
import GoogleMapProvider from './components/map/GoogleMapProvider'
import AuthModal from './components/auth/AuthModal'
import QuotaBar from './components/ui/QuotaBar'
import SavedTripsPanel from './components/ui/SavedTripsPanel'
import { useAuth } from './contexts/AuthContext'
import { decodeTripFromShare } from './lib/api'
import type { ItineraryDay, WeatherData } from './types/api'

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
  itinerary?: ItineraryDay[] | null
  weatherForecast?: WeatherData
}

const App: FC = () => {
  const { user, refreshQuota } = useAuth()
  const [currentStage, setCurrentStage] = useState<number>(STAGES.GLOBE)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSavedTrips, setShowSavedTrips] = useState(false)
  const [pendingGeneration, setPendingGeneration] = useState(false)
  const [existingItinerary, setExistingItinerary] = useState<ItineraryDay[] | null>(null)
  const [isNewTrip, setIsNewTrip] = useState(false)
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
        setIsNewTrip(false)
        setCurrentStage(STAGES.ITINERARY)
        toast.success('Shared trip loaded!')
      } else {
        toast.error('Failed to load shared trip')
      }
    }
  }, [])

  const handleCitySelected = (city: string, coordinates: [number, number]): void => {
    setTripData((prev) => ({ ...prev, city, coordinates }))
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

  const handleTripDetailsSubmit = (details: {
    startDate: string
    endDate: string
    travelStyles: string[]
    pace: 'Relaxed' | 'Balanced' | 'Packed'
  }): void => {
    setExistingItinerary(null)
    setIsNewTrip(true)
    setTripData((prev) => ({
      ...prev,
      startDate: details.startDate,
      endDate: details.endDate,
      travelStyles: details.travelStyles,
      pace: details.pace,
    }))

    if (!user) {
      setPendingGeneration(true)
      setShowAuthModal(true)
      return
    }

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

  const handleBackToMap = (): void => {
    setCurrentStage(STAGES.MAP)
  }

  const handleBackToDetails = (): void => {
    if (isNewTrip) {
      setCurrentStage(STAGES.DETAILS)
    } else {
      setCurrentStage(STAGES.GLOBE)
    }
  }

  const handleLoadSavedTrip = (savedTripData: TripData, itinerary: ItineraryDay[]): void => {
    setTripData((prev) => ({
      ...prev,
      ...savedTripData,
    }))
    setExistingItinerary(itinerary)
    setIsNewTrip(false)
    setCurrentStage(STAGES.ITINERARY)
  }

  const handleLogout = (): void => {
    setCurrentStage(STAGES.GLOBE)
    setTripData({
      city: null,
      coordinates: null,
      homeBase: null,
      startDate: null,
      endDate: null,
      travelStyles: [],
      pace: 'Balanced',
      itinerary: null,
    })
    setShowSavedTrips(false)
    setShowAuthModal(false)
    setPendingGeneration(false)
  }

  return (
    <GoogleMapProvider>
      <div className="w-full h-screen bg-cream-50 overflow-hidden">
        {currentStage === STAGES.GLOBE && (
          <MapHeroStage onCitySelected={handleCitySelected} />
        )}

        {currentStage === STAGES.MAP && (
          <GoogleMapStage
            city={tripData.city}
            coordinates={tripData.coordinates!}
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
            onBack={handleBackToDetails}
            existingItinerary={existingItinerary}
          />
        )}

        <div className="no-print">
          <QuotaBar
            onSignInClick={() => setShowAuthModal(true)}
            onViewTrips={() => setShowSavedTrips(true)}
            onLogout={handleLogout}
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
