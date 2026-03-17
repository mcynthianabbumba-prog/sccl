import { useEffect, useRef } from 'react'

// We use vanilla Leaflet to avoid SSR issues and keep bundle clean
let L = null

async function getLeaflet() {
  if (L) return L
  L = await import('leaflet')
  return L
}

export default function FacilityMap({
  hospitals = [],
  center = [0.3476, 32.7571],
  zoom = 12,
  height = '500px',
  onMarkerClick,
  selectedId,
}) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const markersRef = useRef({})

  useEffect(() => {
    let map = null

    async function init() {
      const Leaflet = await getLeaflet()

      if (instanceRef.current) {
        instanceRef.current.remove()
      }

      map = Leaflet.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
      })

      instanceRef.current = map

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Add markers
      hospitals.forEach(h => {
        if (!h.latitude || !h.longitude) return

        const isEmergency = h.emergency_available
        const isVerified = h.is_verified

        const icon = Leaflet.divIcon({
          className: '',
          html: `
            <div style="
              position: relative;
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 36px;
                height: 36px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                background: ${isEmergency ? '#dc2626' : '#2563eb'};
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              "></div>
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -60%);
                color: white;
                font-size: 13px;
                font-weight: bold;
              ">
                ${isEmergency ? '🚨' : isVerified ? '✓' : '+'}
              </div>
              ${h.id === selectedId ? `
                <div style="
                  position: absolute;
                  inset: -8px;
                  border-radius: 50%;
                  border: 3px solid #2563eb;
                  animation: pulse-ring 1.5s ease infinite;
                "></div>
              ` : ''}
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        })

        const services = h.hospital_services?.map(s => s.service_type.replace(/_/g, ' ')).slice(0, 3) || []

        const marker = Leaflet.marker([h.latitude, h.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: 'DM Sans', sans-serif; min-width: 200px;">
              <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px;">${h.name}</div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">${h.address || h.sub_county || ''}</div>
              ${services.length > 0 ? `
                <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
                  ${services.map(s => `
                    <span style="
                      background: #dbeafe; color: #1d4ed8;
                      font-size: 10px; font-weight: 600;
                      padding: 2px 6px; border-radius: 999px;
                      text-transform: capitalize;
                    ">${s}</span>
                  `).join('')}
                </div>
              ` : ''}
              ${h.phone ? `<div style="font-size: 12px; color: #475569;">📞 ${h.phone}</div>` : ''}
              ${h.emergency_available ? `
                <div style="
                  margin-top: 8px; padding: 6px;
                  background: #fee2e2; border-radius: 6px;
                  font-size: 11px; color: #b91c1c; font-weight: 600;
                ">
                  🚨 24/7 Emergency Available
                </div>
              ` : ''}
            </div>
          `, { maxWidth: 280 })

        marker.on('click', () => {
          if (onMarkerClick) onMarkerClick(h)
        })

        markersRef.current[h.id] = marker
      })
    }

    init()

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [hospitals])

  // Pan to selected marker
  useEffect(() => {
    if (selectedId && instanceRef.current && markersRef.current[selectedId]) {
      const marker = markersRef.current[selectedId]
      instanceRef.current.setView(marker.getLatLng(), 14, { animate: true })
      marker.openPopup()
    }
  }, [selectedId])

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
      }}
    />
  )
}
