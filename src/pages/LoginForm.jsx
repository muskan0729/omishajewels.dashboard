import "../css/login.css";
import logo from "../images/logo.png";
import bg from "../images/login-background.jpg";
import { useLogin } from "../js/login";

const getCustomErrorMessage = (error, field) => {
  if (!error) return null;

  const rawMessage = error?.errors?.[field]?.[0] || error?.message || "";

  // EMAIL errors
  if (field === "email") {
    if (rawMessage.includes("do not match")) {
      return "Email or password is incorrect";
    }
    if (rawMessage.includes("required")) {
      return "Email is required";
    }
    if (rawMessage.includes("valid")) {
      return "Please enter a valid email address";
    }
  }

  // PASSWORD errors
  if (field === "password") {
    if (rawMessage.includes("do not match")) {
      return "Incorrect password";
    }
    if (rawMessage.includes("required")) {
      return "Password is required";
    }
    if (rawMessage.includes("at least")) {
      return "Password must be at least 6 characters";
    }
  }

  // fallback
  return "Invalid credentials. Please try again.";
};

const Login = () => {
  const {
    showPassword,
    setShowPassword,
    formData,
    handleChange,
    handleSubmit,
    error,
    loading,
    navigate,
  } = useLogin();

  return (
    <section className="login-wrapper">
      <div className="login-bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="login-overlay" />

      <div className="login-card">
        <div className="login-logo">
          <img src={logo} alt="logo" />
          <h1 className="login-title">
            Omisha<span>Jewels</span>
          </h1>
        </div>

        <p className="login-subtitle">Welcome back! Please sign in.</p>

        <form onSubmit={handleSubmit}>
          {/*  FORM LEVEL ERROR (when no field-specific error exists) */}
          {error && !error?.errors && (
            <p className="form-error">
              Something went wrong. Please try again.
            </p>
          )}

          {/* EMAIL */}
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${
                getCustomErrorMessage(error, "email") ? "input-error" : ""
              }`}
              required
            />
            <label className="form-label">Email</label>

            {getCustomErrorMessage(error, "email") && (
              <span className="field-error">
                {getCustomErrorMessage(error, "email")}
              </span>
            )}
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder=" "
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${
                getCustomErrorMessage(error, "password") ? "input-error" : ""
              }`}
              required
            />
            <label className="form-label">Password</label>

            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>

            {getCustomErrorMessage(error, "password") && (
              <span className="field-error">
                {getCustomErrorMessage(error, "password")}
              </span>
            )}
          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="login-footer">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")}>Create one</span>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;
