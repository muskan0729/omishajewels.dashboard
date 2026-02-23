import { useState } from "react";
import { usePost } from "../hooks/usePost";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const {
    execute: login,
    error,
    loading,
    setError,
  } = usePost("/login");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login(formData);

      if (!response) return;

      localStorage.setItem("token", response.token);
      localStorage.setItem("email", response.user.email);
      localStorage.setItem(
        "role",
        btoa(response.user.role_type)
      );
      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      if (response.user.kyc === 1) {
        navigate("/dashboardmain", { replace: true });
      } else if (response.user.pre_kyc_status === 0) {
        navigate("/MemberUserForm", { replace: true });
      } else {
        navigate("/merchant-success", { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return {
    showPassword,
    setShowPassword,
    formData,
    handleChange,
    handleSubmit,
    error,
    loading,
    navigate,
  };
};