'use client';

import { createContext, useContext } from 'react';
import { useCandidateLocation } from './useCandidateLocation';

const CandidateLocationContext = createContext(null);

/**
 * Provides one shared candidate-location state to a subtree, so multiple
 * consumers (e.g. dozens of job cards) don't each trigger a geolocation
 * prompt or a separate localStorage read.
 */
export const CandidateLocationProvider = ({ autoRequest = true, children }) => {
  const value = useCandidateLocation({ autoRequest });
  return (
    <CandidateLocationContext.Provider value={value}>
      {children}
    </CandidateLocationContext.Provider>
  );
};

/**
 * Reads shared candidate-location state if a provider is above in the tree,
 * otherwise falls back to a component-local hook instance.
 */
export const useCandidateLocationScoped = (options) => {
  const ctx = useContext(CandidateLocationContext);
  const local = useCandidateLocation({
    autoRequest: ctx ? false : options?.autoRequest,
  });
  return ctx ?? local;
};
