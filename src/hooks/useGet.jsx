import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export function useGet(endpoint) {
  const [data, setData] = useState(null); // Stores the response data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Function to fetch data from the backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
          // ✅ Sends HTTP-only cookies automatically
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
      });
      setData(response.data);
    } catch (err) {
      // Capture backend errors or network errors
      setError(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount and whenever the endpoint changes
  useEffect(() => {
    fetchData();
  }, [endpoint]);

  // Return state and refetch function for manual reload
  return { data, loading, error, refetch: fetchData };
}
