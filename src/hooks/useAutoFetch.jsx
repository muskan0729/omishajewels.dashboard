import { useEffect } from "react";
import { useGet } from "./useGet"; // your existing hook

export default function useAutoFetch(endpoint, intervalMs = 3600000) {
  const { data, loading, error, refetch } = useGet(endpoint);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch(); // use useGet’s refetch function
    }, intervalMs);
    return () => clearInterval(interval);
  }, [refetch, intervalMs]);

  return { data, loading, error, refetch };
}
