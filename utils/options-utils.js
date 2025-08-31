import { useState, useEffect } from 'react';

// Utility functions for fetching options from Firebase

export const fetchOptionsFromFirebase = async (type) => {
  try {
    const response = await fetch(`/api/admin/manage-options?type=${type}`);
    const data = await response.json();
    
    if (response.ok) {
      return data.data || [];
    } else {
      console.error('Failed to fetch options:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching options:', error);
    return [];
  }
};

// Convenience functions for specific option types
export const fetchStates = () => fetchOptionsFromFirebase('states');
export const fetchSectors = () => fetchOptionsFromFirebase('sectors');

// Hook for React components (if you want to use it in components)
export const useOptions = (type) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const data = await fetchOptionsFromFirebase(type);
        setOptions(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [type]);

  return { options, loading, error };
};
