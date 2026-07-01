'use client';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  coordsForPostalCode,
  formatDistanceKm,
  haversineKm,
} from '@/utils/distance';
import { useCandidateLocationScoped } from '@/utils/hooks/CandidateLocationContext';

const wrapperStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};

export default function JobDistance({ job, compact = false }) {
  const userType = useSelector((store) => store.user?.userType);
  const isLoggedIn = useSelector((store) => !!store.user?.user?.uid);

  const jobCoords = useMemo(
    () => coordsForPostalCode(job?.postalCode),
    [job?.postalCode],
  );

  const shouldShow = userType !== 'Employer' && jobCoords;

  const { coords, status, source, requestGeolocation } = useCandidateLocationScoped({
    autoRequest: shouldShow && isLoggedIn,
  });

  if (!shouldShow) return null;

  const distanceKm = coords ? haversineKm(coords, jobCoords) : null;
  const label = formatDistanceKm(distanceKm);

  if (label) {
    return (
      <li>
        <span className='icon flaticon-map-locator'></span>
        <span style={wrapperStyle}>
          {label} van jou
          {source === 'postal-code' && (
            <span style={{ color: '#888', fontSize: '0.85em' }}>
              (o.b.v. postcode)
            </span>
          )}
        </span>
      </li>
    );
  }

  if (compact) return null;
  if (!isLoggedIn) return null;

  if (status === 'loading') {
    return (
      <li>
        <span className='icon flaticon-map-locator'></span>
        <span style={{ color: '#888' }}>Afstand berekenen…</span>
      </li>
    );
  }

  return (
    <li>
      <span className='icon flaticon-map-locator'></span>
      <button
        type='button'
        onClick={requestGeolocation}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          color: '#FA5508',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        Toon afstand van jou
      </button>
    </li>
  );
}
