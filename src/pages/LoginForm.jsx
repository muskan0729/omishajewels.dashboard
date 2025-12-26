import { useState } from "react";
import logo from "../images/logo.png";
import paymentGatewayBg from "../images/login-background.jpg";
import { usePost } from "../hooks/usePost";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const { execute: login, error, loading } = usePost("/login");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);
console.log(response);
     if (response) {
    localStorage.setItem("token", response.token);
    localStorage.setItem("email", response.user.email);
    localStorage.setItem("role", btoa(response.user.role_type));
    localStorage.setItem("user", JSON.stringify(response.user));

    // Check KYC status
if (response.user.kyc === 1) {
  // Full KYC done → Dashboard
  navigate("/dashboard", { replace: true });

} else if (response.user.pre_kyc_status === 0) {
  // Pre-KYC not done → Fill Member Form
  navigate("/MemberUserForm", { replace: true });

} else {
  // Pre-KYC done but KYC pending
  navigate("/merchant-success", { replace: true });
}

  }
} catch (err) {
  console.log("Login failed:", err);
}
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gray-100 overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: `url(${paymentGatewayBg})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-10 border border-gray-200">

        {/* Logo + Site Name (Side-by-side) */}
        <div className="flex items-center justify-center pr-10 mb-2">
          <img src={logo} alt="logo" className="w-40 h-auto" />

          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-[#615141] tracking-wide leading-tight">
              Omisha<span className="text-[#c7a43d]">Jewels</span>
            </h1>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center mb-6">
          Welcome back! Please sign in.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div className="relative z-0">
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`block w-full py-3 px-1 text-sm text-gray-900 bg-transparent border-b-2 focus:outline-none peer ${
                error?.errors?.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]
                peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Email
            </label>

            {error?.errors?.email && (
              <p className="text-sm text-red-500 mt-1">{error.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative z-0">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`block w-full py-3 px-1 text-sm text-gray-900 bg-transparent border-b-2 focus:outline-none peer ${
                error?.errors?.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder=" "
            />

            <label
              htmlFor="password"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0]
                peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Password
            </label>

            {/* Show/Hide Password */}
            <button
              type="button"
              className="absolute right-0 top-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>

            {error?.errors?.password && (
              <p className="text-sm text-red-500 mt-1">{error.errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#615141] hover:bg-[#c7a43d] text-white rounded-lg transition font-semibold shadow-md disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
<p className="text-center text-sm text-gray-500 mt-4">
  Don’t have an account?{" "}
  <span
    onClick={() => navigate("/register")}
    className="text-[#c7a43d] font-semibold cursor-pointer hover:underline"
  >
    Create one
  </span>
</p>

        </form>
      </div>
    </section>
  );
}

export default LoginForm;
