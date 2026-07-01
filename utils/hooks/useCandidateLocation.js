'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { coordsForPostalCode } from '@/utils/distance';

const CACHE_KEY = 'candidateGeoCoords';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const readCache = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() - parsed.t > CACHE_TTL_MS) return null;
    return { lat: parsed.lat, lng: parsed.lng };
  } catch {
    return null;
  }
};

const writeCache = (coords) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ lat: coords.lat, lng: coords.lng, t: Date.now() }),
    );
  } catch {
    /* ignore */
  }
};

/**
 * Resolves the current candidate's coordinates for distance calculations.
 *
 * Strategy (in order):
 *   1. Cached browser geolocation (localStorage, 24h TTL)
 *   2. Fresh browser geolocation via navigator.geolocation
 *   3. Fallback to the postal_code on the user's profile (Redux)
 *
 * Never throws; on failure returns { coords: null, source: null }.
 */
export const useCandidateLocation = ({ autoRequest = true } = {}) => {
  const profilePostalCode = useSelector(
    (store) => store.user?.user?.postal_code,
  );

  const [state, setState] = useState({
    coords: null,
    source: null,
    status: 'idle',
    error: null,
  });

  const requestGeolocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return Promise.resolve(null);
    }
    setState((s) => ({ ...s, status: 'loading', error: null }));
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          writeCache(coords);
          setState({
            coords,
            source: 'geolocation',
            status: 'success',
            error: null,
          });
          resolve(coords);
        },
        (err) => {
          setState((s) => ({
            ...s,
            status: 'error',
            error: err?.message || 'Geolocation denied',
          }));
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
      );
    });
  }, []);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setState({
        coords: cached,
        source: 'geolocation-cache',
        status: 'success',
        error: null,
      });
      return;
    }

    const fallback = coordsForPostalCode(profilePostalCode);

    if (!autoRequest) {
      if (fallback) {
        setState({
          coords: { lat: fallback.lat, lng: fallback.lng },
          source: 'postal-code',
          status: 'success',
          error: null,
        });
      }
      return;
    }

    let cancelled = false;
    requestGeolocation().then((coords) => {
      if (cancelled) return;
      if (coords) return;
      if (fallback) {
        setState({
          coords: { lat: fallback.lat, lng: fallback.lng },
          source: 'postal-code',
          status: 'success',
          error: null,
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [autoRequest, profilePostalCode, requestGeolocation]);

  return { ...state, requestGeolocation };
};
