import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePost } from "../hooks/usePost";

function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { execute: verifyMobile } = usePost("/verify-mobile-otp");
  const { execute: verifyEmail } = usePost("/verify-email-otp");

  const [mobileOtp, setMobileOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [step, setStep] = useState("mobile");
  const [error, setError] = useState("");

  const handleMobileVerify = async () => {
    setError("");
    try {
      const res = await verifyMobile({
        mobile: state.mobile_no, // ✅ FIX: OTP table uses `mobile`
        otp: mobileOtp,
      });

      if (res) {
        setStep("email");
      }
    } catch (err) {
      setError("Invalid or expired mobile OTP");
    }
  };

  const handleEmailVerify = async () => {
    setError("");
    try {
      const res = await verifyEmail({
        email: state.email,
        otp: emailOtp,
      });

      if (res) {
        navigate("/MemberUserForm", { replace: true });
      }
    } catch (err) {
      setError("Invalid or expired email OTP");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">

        {step === "mobile" && (
          <>
            <h2 className="text-xl font-bold mb-6 text-center">
              Verify Mobile Number
            </h2>

            <FloatingInput
              label="Mobile OTP"
              value={mobileOtp}
              onChange={(e) => setMobileOtp(e.target.value)}
            />

            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

            <button
              onClick={handleMobileVerify}
              className="w-full mt-5 bg-[#c7a43d] text-white py-2 rounded-lg font-semibold"
            >
              Verify Mobile
            </button>
          </>
        )}

        {step === "email" && (
          <>
            <h2 className="text-xl font-bold mb-6 text-center">
              Verify Email Address
            </h2>

            <FloatingInput
              label="Email OTP"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
            />

            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

            <button
              onClick={handleEmailVerify}
              className="w-full mt-5 bg-[#615141] text-white py-2 rounded-lg font-semibold"
            >
              Verify Email
            </button>
          </>
        )}
      </div>
    </section>
  );
}

/* ---------- Floating Input ---------- */

function FloatingInput({ label, value, onChange }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        required
        className="w-full px-3 py-3 text-sm bg-transparent border-b-2 border-gray-300
                   focus:outline-none focus:border-[#c7a43d]"
      />
      <label
        className={`absolute left-3 px-1 bg-white text-gray-500 transition-all
        ${value ? "-top-2 text-xs text-[#c7a43d]" : "top-3 text-sm"}`}
      >
        {label}
      </label>
    </div>
  );
}

export default VerifyOtp;
