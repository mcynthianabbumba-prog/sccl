// src/hooks/useGeolocation.js
import { useState, useCallback } from 'react';

/**
 * Hook to get the browser's current geolocation.
 *
 * Usage:
 *   const { coords, loading, error, request } = useGeolocation();
 *   // call request() to prompt the user for location
 */
export const useGeolocation = () => {
  const [coords, setCoords]   = useState(null);   // [lat, lng]
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Could not access your location.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  /**
   * Haversine distance in km between two [lat, lng] pairs.
   */
  const distanceTo = useCallback((targetLat, targetLng) => {
    if (!coords) return null;
    const R = 6371;
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(targetLat - coords[0]);
    const dLon = toRad(targetLng - coords[1]);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coords[0])) * Math.cos(toRad(targetLat)) * Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  }, [coords]);

  return { coords, loading, error, request, distanceTo };
};
