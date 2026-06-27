import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

vi.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    refreshQuota: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('./components/stages/MapHeroStage', () => ({
  default: () => <div>Map Hero Stage</div>,
}))

vi.mock('./components/stages/GoogleMapStage', () => ({
  default: () => <div>Google Map Stage</div>,
}))

vi.mock('./components/stages/TripDetailsStage', () => ({
  default: () => <div>Trip Details Stage</div>,
}))

vi.mock('./components/stages/ItineraryStage', () => ({
  default: () => <div>Itinerary Stage</div>,
}))

vi.mock('./components/map/GoogleMapProvider', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('./components/auth/AuthModal', () => ({
  default: () => <div>Auth Modal</div>,
}))

vi.mock('./components/ui/QuotaBar', () => ({
  default: () => <div>Quota Bar</div>,
}))

vi.mock('./components/ui/SavedTripsPanel', () => ({
  default: () => <div>Saved Trips Panel</div>,
}))

describe('App', () => {
  it('renders successfully', () => {
    const { container } = render(<App />)
    expect(container).toBeDefined()
  })
})
