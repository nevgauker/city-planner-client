import { useMemo } from 'react'
import { GoogleMap, MarkerF, PolylineF } from '@react-google-maps/api'
import { getMarkerColor } from '../../lib/utils'
import { darkMapStyle } from '../../lib/mapStyles'
import type { ItineraryDay, HomeBase } from '../../types/api'

interface Props {
  itinerary: ItineraryDay[] | null
  selectedActivityIndex: number | null
  homeBase: HomeBase | null
}

export default function GoogleItineraryMap({ itinerary, selectedActivityIndex, homeBase }: Props) {
  if (!itinerary || itinerary.length === 0 || !homeBase) {
    return <div className="w-full h-full flex items-center justify-center bg-navy-800"><p className="text-white/60">Loading map...</p></div>
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

  const center = { lat: (bounds.north + bounds.south) / 2, lng: (bounds.east + bounds.west) / 2 }
  const homeCoords = { lat: toNum(homeBase.lat), lng: toNum(homeBase.lng) }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center}
      zoom={12}
      options={{ mapTypeControl: false, fullscreenControl: false, streetViewControl: false, styles: darkMapStyle, backgroundColor: '#1a1f3a' }}
    >
      <PolylineF path={[homeCoords, ...allActivities.map((a) => ({ lat: a.lat, lng: a.lng }))]} options={{ strokeColor: '#ff9d56', strokeOpacity: 0.4, strokeWeight: 2 }} />
      <MarkerF position={homeCoords} title="Home Base" icon={{ path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z', fillColor: '#ffc68d', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 2.5 }} />
      {allActivities.map((activity) => (
        <MarkerF
          key={`${activity.index}-${activity.day}`}
          position={{ lat: activity.lat, lng: activity.lng }}
          title={`${activity.index + 1}. ${activity.activity}`}
          icon={{ path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z', fillColor: getMarkerColor(activity.index), fillOpacity: selectedActivityIndex === activity.index ? 1 : 0.7, strokeColor: selectedActivityIndex === activity.index ? '#fff' : 'rgba(255,255,255,0.5)', strokeWeight: selectedActivityIndex === activity.index ? 2 : 1, scale: selectedActivityIndex === activity.index ? 1.8 : 1.5 }}
        />
      ))}
    </GoogleMap>
  )
}
