import { useMemo } from 'react'
import { GoogleMap, MarkerF, PolylineF } from '@react-google-maps/api'
import { getMarkerColor } from '../../lib/utils'

// Dark map style
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

export default function GoogleItineraryMap({ itinerary, selectedActivityIndex, homeBase }) {
  console.log('🗺️ GoogleItineraryMap received homeBase:', homeBase, 'Type:', typeof homeBase)

  if (!itinerary || itinerary.length === 0 || !homeBase) {
    console.log('⚠️ Missing data for map:', { itinerary: !!itinerary, homeBase: !!homeBase })
    return (
      <div className="w-full h-full flex items-center justify-center bg-navy-800">
        <p className="text-white/60">Loading map...</p>
      </div>
    )
  }

  const toNumber = (val) => {
    const num = Number(val)
    const result = isFinite(num) ? num : 0
    if (val !== result) {
      console.log('🔢 toNumber conversion:', { input: val, output: result, type: typeof val })
    }
    return result
  }

  // Flatten all activities
  const allActivities = useMemo(() => {
    const activities = []
    let activityIndex = 0
    itinerary.forEach((day) => {
      ;['morning', 'afternoon', 'evening'].forEach((period) => {
        const activity = day.blocks?.[period]
        if (activity) {
          activities.push({
            index: activityIndex,
            day: day.date,
            period,
            ...activity,
            lat: toNumber(activity.lat),
            lng: toNumber(activity.lng),
          })
          activityIndex++
        }
      })
    })
    return activities
  }, [itinerary])

  // Calculate bounds
  const bounds = useMemo(() => {
    const coords = [
      { lat: toNumber(homeBase.lat), lng: toNumber(homeBase.lng) },
      ...allActivities.map((a) => ({ lat: a.lat, lng: a.lng })),
    ]

    if (coords.length === 0) return null

    let minLat = coords[0].lat
    let maxLat = coords[0].lat
    let minLng = coords[0].lng
    let maxLng = coords[0].lng

    coords.forEach((c) => {
      minLat = Math.min(minLat, c.lat)
      maxLat = Math.max(maxLat, c.lat)
      minLng = Math.min(minLng, c.lng)
      maxLng = Math.max(maxLng, c.lng)
    })

    return {
      north: maxLat,
      south: minLat,
      east: maxLng,
      west: minLng,
    }
  }, [homeBase, allActivities])

  const center = {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2,
  }

  const homeBaseCoords = {
    lat: toNumber(homeBase.lat),
    lng: toNumber(homeBase.lng),
  }

  // Polyline path
  const polylinePath = [
    homeBaseCoords,
    ...allActivities.map((a) => ({ lat: a.lat, lng: a.lng })),
  ]

  return (
    <GoogleMap
      mapContainerStyle={{
        width: '100%',
        height: '100%',
      }}
      center={center}
      zoom={12}
      options={{
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: darkMapStyle,
        backgroundColor: '#1a1f3a',
      }}
    >
      {/* Polyline connecting activities */}
      <PolylineF
        path={polylinePath}
        options={{
          strokeColor: '#ff9d56',
          strokeOpacity: 0.4,
          strokeWeight: 2,
          geodesic: false,
        }}
      />

      {/* Home base marker */}
      <MarkerF
        position={homeBaseCoords}
        title="Home Base"
        icon={{
          path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
          fillColor: '#ffc68d',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
          scale: 2.5,
        }}
      />

      {/* Activity markers */}
      {allActivities.map((activity) => (
        <MarkerF
          key={`${activity.index}-${activity.day}`}
          position={{ lat: activity.lat, lng: activity.lng }}
          title={`${activity.index + 1}. ${activity.activity}`}
          icon={{
            path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
            fillColor: getMarkerColor(activity.index),
            fillOpacity: selectedActivityIndex === activity.index ? 1 : 0.7,
            strokeColor: selectedActivityIndex === activity.index ? '#fff' : 'rgba(255,255,255,0.5)',
            strokeWeight: selectedActivityIndex === activity.index ? 2 : 1,
            scale: selectedActivityIndex === activity.index ? 1.8 : 1.5,
          }}
        />
      ))}
    </GoogleMap>
  )
}
