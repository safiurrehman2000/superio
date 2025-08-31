import { useState, useEffect } from "react";

export const useOptionsFromFirebase = (type) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/manage-options?type=${type}`);
        const data = await response.json();

        if (response.ok) {
          setOptions(data.data || []);
        } else {
          setError(data.error || "Failed to fetch options");
        }
      } catch (err) {
        setError("Failed to fetch options");
        console.error(`Error fetching ${type}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [type]);

  return { options, loading, error };
};

// Convenience hooks for specific option types
export const useStates = () => useOptionsFromFirebase("states");
export const useSectors = () => useOptionsFromFirebase("sectors");
