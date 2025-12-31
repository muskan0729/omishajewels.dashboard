import { useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export function usePost(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (body, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const headers = {
        Authorization: "Bearer " + localStorage.getItem("token"),
        ...options.headers,
      };

      // If body is FormData, do NOT set Content-Type manually
      if (!(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      const response = await axios.post(`${BASE_URL}${endpoint}`, body, {
        headers,
      });

      setData(response.data);
      return response.data;
    } catch (err) {
      const errData = err.response?.data || "Something went wrong";
      setError(errData);
      throw errData;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute, setError };
}
