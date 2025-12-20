import { useState } from "react";
import logo from "../images/logo.png";
import paymentGatewayBg from "../images/login-background.jpg";
import { usePost } from "../hooks/usePost";
import { useNavigate } from "react-router-dom";

function RegisterForm() {
  const navigate = useNavigate();
  const { execute: register, error, loading } = usePost("/registernew");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_no: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setPasswordError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        mobile_no: formData.mobile_no,
        password: formData.password,
        password_confirmation: formData.confirm_password,
      });

      if (response) {
        navigate("/verify-otp", {
          state: {
            email: formData.email,
            mobile_no: formData.mobile_no,
          },
        });
      }
    } catch (err) {
      console.error("Registration failed", err);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gray-100 overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${paymentGatewayBg})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-gray-200">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <img src={logo} alt="Omisha Jewels" className="w-30 h-22 object-contain" />
          <div>
            <h1 className="text-2xl font-bold tracking-wide text-[#615141]">
              Omisha<span className="text-[#c7a43d]">Jewels</span>
            </h1>
            <p className="text-sm text-gray-500">Create your luxury account</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={error?.errors?.name}
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={error?.errors?.email}
          />

          <Input
            label="Mobile Number"
            type="tel"
            name="mobile_no"
            value={formData.mobile_no}
            onChange={handleChange}
            error={error?.errors?.mobile_no}
          />

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
            onChange={handleChange}
            error={error?.errors?.password}
          />

          <PasswordInput
            label="Confirm Password"
            name="confirm_password"
            value={formData.confirm_password}
            show={showConfirmPassword}
            toggle={() => setShowConfirmPassword(!showConfirmPassword)}
            onChange={handleChange}
            error={passwordError}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-3 rounded-xl bg-gradient-to-r from-[#615141] to-[#c7a43d]
                       text-white font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-[#c7a43d] font-semibold cursor-pointer hover:underline"
            >
              Sign In
            </span>
          </p>

        </form>
      </div>
    </section>
  );
}

/* ---------- FIXED FLOATING INPUT ---------- */

function Input({ label, type = "text", name, value, onChange, error }) {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className={`w-full px-3 py-3 text-sm bg-transparent border-b-2 focus:outline-none peer ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />

      <label
        className={`absolute left-3 px-1 bg-white text-gray-500 transition-all
        ${value ? "-top-2 text-xs text-[#c7a43d]" : "top-3 text-sm"}
        peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#c7a43d]`}
      >
        {label}
      </label>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function PasswordInput({ label, name, value, show, toggle, onChange, error }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        required
        className={`w-full px-3 py-3 text-sm bg-transparent border-b-2 focus:outline-none peer ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />

      <label
        className={`absolute left-3 px-1 bg-white text-gray-500 transition-all
        ${value ? "-top-2 text-xs text-[#c7a43d]" : "top-3 text-sm"}
        peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#c7a43d]`}
      >
        {label}
      </label>

      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
      >
        {show ? "🙈" : "👁️"}
      </button>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default RegisterForm;
