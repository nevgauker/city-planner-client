import { useMemo } from 'react'
import { GoogleMap, MarkerF, PolylineF } from '@react-google-maps/api'
import { getMarkerColor } from '../../lib/utils'
import { modernCivicMapStyle } from '../../lib/mapStyles'
import type { ItineraryDay, HomeBase } from '../../types/api'

interface Props {
  itinerary: ItineraryDay[] | null
  selectedActivityIndex: number | null
  homeBase: HomeBase | null
  onMarkerClick?: (index: number) => void
  onHomeBaseClick?: () => void
}

export default function GoogleItineraryMap({ itinerary, selectedActivityIndex, homeBase, onMarkerClick, onHomeBaseClick }: Props) {
  if (!itinerary || itinerary.length === 0 || !homeBase) {
    return <div className="w-full h-full flex items-center justify-center bg-taupe-700"><p className="text-white/60">Loading map...</p></div>
  }

  const toNum = (val: unknown): number => { const n = Number(val); return isFinite(n) ? n : 0 }

  const allActivities = useMemo(() => {
    const activities: Array<{ index: number; day: string; period: string; lat: number; lng: number; activity: string }> = []
    let i = 0
    itinerary.forEach((day) => {
      ;(['morning', 'afternoon', 'evening'] as const).forEach((period) => {
        const a = day.blocks?.[period]
        if (a) { activities.push({ index: i++, day: day.date, period, ...a, lat: toNum(a.lat), lng: toNum(a.lng) }) }
      })
    })
    return activities
  }, [itinerary])

  const bounds = useMemo(() => {
    const coords = [{ lat: toNum(homeBase.lat), lng: toNum(homeBase.lng) }, ...allActivities.map((a) => ({ lat: a.lat, lng: a.lng }))]
    return coords.reduce(
      (acc, c) => ({ north: Math.max(acc.north, c.lat), south: Math.min(acc.south, c.lat), east: Math.max(acc.east, c.lng), west: Math.min(acc.west, c.lng) }),
      { north: -Infinity, south: Infinity, east: -Infinity, west: Infinity }
    )
  }, [homeBase, allActivities])

  const center = useMemo(() => ({ lat: (bounds.north + bounds.south) / 2, lng: (bounds.east + bounds.west) / 2 }), [bounds])
  const homeCoords = useMemo(() => ({ lat: toNum(homeBase.lat), lng: toNum(homeBase.lng) }), [homeBase])

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={12}
        options={{ mapTypeControl: false, fullscreenControl: false, streetViewControl: false, styles: modernCivicMapStyle as google.maps.MapTypeStyle[], backgroundColor: '#f5f1e8' }}
      >
      <PolylineF path={[homeCoords, ...allActivities.map((a) => ({ lat: a.lat, lng: a.lng }))]} options={{ strokeColor: '#b8674f', strokeOpacity: 0.8, strokeWeight: 3 }} />
      <MarkerF position={homeCoords} title="Home Base - Click to view" onClick={onHomeBaseClick} icon={{ path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z', fillColor: '#ffc68d', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 2.5 }} />
      {allActivities.map((activity) => (
        <MarkerF
          key={`${activity.index}-${activity.day}`}
          position={{ lat: activity.lat, lng: activity.lng }}
          title={`${activity.index + 1}. ${activity.activity} - Click to view`}
          onClick={() => onMarkerClick?.(activity.index)}
          icon={{ path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z', fillColor: getMarkerColor(activity.index), fillOpacity: selectedActivityIndex === activity.index ? 1 : 0.7, strokeColor: selectedActivityIndex === activity.index ? '#fff' : 'rgba(255,255,255,0.5)', strokeWeight: selectedActivityIndex === activity.index ? 2 : 1, scale: selectedActivityIndex === activity.index ? 1.8 : 1.5 }}
        />
      ))}
      </GoogleMap>

      <div className="absolute top-24 left-4 sm:top-20 sm:right-4 sm:left-auto bg-cream-50 border border-taupe-300 rounded-lg p-4 shadow-md max-w-xs z-20">
        <p className="text-xs font-semibold text-neutral-dark mb-2">Activity Sequence</p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffc68d' }} />
            <span className="text-neutral-dark/70">🏠 Home Base</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-dark/70">
            <span className="text-xs">🔢 Numbered dots = activities in order</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-dark/70 mt-2">
            <span className="text-xs">Click a dot to highlight it</span>
          </div>
        </div>
      </div>
    </div>
  )
}
