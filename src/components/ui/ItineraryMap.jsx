import { useState, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getMarkerColor } from '../../lib/utils'

function MapResizer() {
  const map = useMap()

  useEffect(() => {
    // Invalidate size after mount
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [map])

  return null
}

// Custom marker for activities
function createActivityMarker(color, number) {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${number}</div>`,
    iconSize: [32, 32],
    className: '',
  })
}

// Home base marker
function createHomeMarker() {
  return L.divIcon({
    html: `<div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ff9d56, #ffc68d); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 3px solid white; box-shadow: 0 2px 12px rgba(0,0,0,0.5);">🏠</div>`,
    iconSize: [40, 40],
    className: '',
  })
}

export default function ItineraryMap({ itinerary, selectedActivityIndex, homeBase }) {
  if (!itinerary || itinerary.length === 0 || !homeBase) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-navy-800">
        <p className="text-white/60">No itinerary to display</p>
      </div>
    )
  }

  // Flatten all activities to track positions
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
          })
          activityIndex++
        }
      })
    })
    return activities
  }, [itinerary])

  // Calculate bounds for all markers
  const bounds = useMemo(() => {
    const coords = [
      [homeBase.lat, homeBase.lng],
      ...allActivities.map((a) => [a.lat, a.lng]),
    ]
    if (coords.length === 0) return [[0, 0], [0, 0]]

    const lats = coords.map((c) => c[0])
    const lngs = coords.map((c) => c[1])
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ]
  }, [homeBase, allActivities])

  // Create polyline connecting all activities in order
  const polylinePoints = useMemo(
    () => [
      [homeBase.lat, homeBase.lng],
      ...allActivities.map((a) => [a.lat, a.lng]),
    ],
    [homeBase, allActivities],
  )

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [50, 50] }}
      style={{ width: '100%', height: '100%' }}
    >
      <MapResizer />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {/* Polyline connecting activities */}
      <Polyline
        positions={polylinePoints}
        color="rgba(255, 157, 86, 0.4)"
        weight={2}
        dashArray="5, 5"
      />

      {/* Home base marker */}
      <Marker position={[homeBase.lat, homeBase.lng]} icon={createHomeMarker()}>
        <Popup>
          <div className="text-sm">
            <strong>Home Base</strong>
            <br />
            {homeBase.address}
          </div>
        </Popup>
      </Marker>

      {/* Activity markers */}
      {allActivities.map((activity, idx) => (
        <Marker
          key={`${activity.index}-${idx}`}
          position={[activity.lat, activity.lng]}
          icon={createActivityMarker(
            getMarkerColor(activity.index),
            activity.index + 1,
          )}
        >
          <Popup>
            <div className="text-sm max-w-xs">
              <div className="font-bold text-warm-accent mb-1">{activity.index + 1}. {activity.activity}</div>
              <div className="text-xs text-white/70 mb-2">{activity.place_name}</div>
              <div className="text-xs">
                <span className="inline-block px-2 py-1 bg-white/10 rounded mr-1">
                  {activity.category}
                </span>
              </div>
              <div className="text-xs text-white/60 mt-2">
                {activity.period} • {activity.duration_minutes} min
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
