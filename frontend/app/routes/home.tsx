import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function Home() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) {
      return
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [103.8198, 1.3521],
      zoom: 11,
    })

    return () => {
      map.remove()
    }
  }, [])

  return <div style={{ width: '100vw', height: '100dvh' }} ref={mapContainerRef} />
}
