import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import { usePost } from "../hooks/usePost";

/* ================= OTP INPUT ================= */
function OtpInput({ value, onChange }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const refs = useRef([]);

  useEffect(() => {
    // update internal OTP if value prop changes (for clearing)
    if (value === "") setOtp(Array(6).fill(""));
  }, [value]);

  const handleChange = (v, i) => {
    if (!/^\d?$/.test(v)) return;
    const arr = [...otp];
    arr[i] = v;
    setOtp(arr);
    onChange(arr.join(""));
    if (v && i < 5) refs.current[i + 1].focus();
  };

  return (
    <div className="flex justify-between gap-2 mt-3">
      {otp.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          maxLength={1}
          onChange={(e) => handleChange(e.target.value, i)}
          className="w-12 h-12 rounded-lg border border-gray-300 text-center text-lg
                     focus:border-[#c7a43d] focus:ring-1 focus:ring-[#c7a43d] outline-none"
        />
      ))}
    </div>
  );
}

/* ================= TIMER ================= */
function useTimer(start) {
  const [time, setTime] = useState(start);

  useEffect(() => {
    if (time <= 0) return;
    const t = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(t);
  }, [time]);

  return [time, () => setTime(start)];
}

/* ================= MAIN ================= */
export default function RegisterForm() {
  const navigate = useNavigate();

  const sendMobileOtp = usePost("/send-mobile-otp").execute;
  const verifyMobileOtp = usePost("/verify-mobile-otp").execute;
  const sendEmailOtp = usePost("/send-email-otp").execute;
  const verifyEmailOtp = usePost("/verify-email-otp").execute;
  const registerUser = usePost("/registernew").execute;

  const [data, setData] = useState({ name: "", email: "", mobile_no: "" });
  const [mobileOtp, setMobileOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  const [mobileSent, setMobileSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [mobileTime, resetMobileTimer] = useTimer(15);
  const [emailTime, resetEmailTimer] = useTimer(15);

  const [mobileError, setMobileError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");

  /* ================= HANDLERS ================= */
  const sendMobile = async () => {
    setMobileError("");
    try {
      await sendMobileOtp({ mobile_no: data.mobile_no });
      setMobileSent(true);
      resetMobileTimer();
      setMobileOtp(""); // clear OTP inputs
    } catch (err) {
      setMobileError(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyMobile = async () => {
    setMobileError("");
    if (mobileTime <= 0) {
      setMobileError("OTP expired. Please resend.");
      setMobileOtp("");
      return;
    }
    try {
      const res = await verifyMobileOtp({ mobile_no: data.mobile_no, otp: mobileOtp });
      if (res?.verified) {
        setMobileVerified(true);
      } else {
        setMobileError("Invalid OTP");
      }
    } catch (err) {
      setMobileError(err?.response?.data?.message || "Invalid OTP");
    }
  };

  const sendEmail = async () => {
    setEmailError("");
    try {
      await sendEmailOtp({ email: data.email });
      setEmailSent(true);
      resetEmailTimer();
      setEmailOtp("");
    } catch (err) {
      setEmailError(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyEmail = async () => {
    setEmailError("");
    if (emailTime <= 0) {
      setEmailError("OTP expired. Please resend.");
      setEmailOtp("");
      return;
    }
    try {
      const res = await verifyEmailOtp({ email: data.email, otp: emailOtp });
      if (res?.verified) {
        setEmailVerified(true);
      } else {
        setEmailError("Invalid OTP");
      }
    } catch (err) {
      setEmailError(err?.response?.data?.message || "Invalid OTP");
    }
  };

  const register = async () => {
    try {
      await registerUser({
        ...data,
        password: data.mobile_no,
        password_confirmation: data.mobile_no,
      });
      navigate("/MemberUserForm");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to register");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
        {/* Logo + Site Name (Side-by-side) */}
              <div className="flex items-center justify-center gap-4 mb-2">
                <img src={logo} alt="logo" className="w-25 h-auto" />
      
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-[#615141] tracking-wide leading-tight">
                    Omisha<span className="text-[#c7a43d]">Jewels</span>
                  </h1>
                </div>
              </div>
                  <p className="text-sm text-gray-500 text-center mb-6">
            Create an account
        </p>

        {/* ================= NAME ================= */}
        <FloatingInput
          label="Full Name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />

        {/* ================= MOBILE ================= */}
        {!mobileVerified && (
          <>
            <FloatingInput
              label="Mobile Number"
              value={data.mobile_no}
              onChange={(e) => setData({ ...data, mobile_no: e.target.value })}
            />

            {!mobileSent ? (
              <GoldBtn onClick={sendMobile}>Send Mobile OTP</GoldBtn>
            ) : (
              <>
                <OtpInput value={mobileOtp} onChange={setMobileOtp} />
                <GoldBtn onClick={verifyMobile}>Verify Mobile</GoldBtn>
                {mobileError && <p className="text-red-500 text-xs mt-1">{mobileError}</p>}

                {mobileTime > 0 ? (
                  <p className="text-xs text-center mt-2">Resend in {mobileTime}s</p>
                ) : (
                  <p
                    className="text-xs text-center mt-2 text-blue-600 cursor-pointer"
                    onClick={sendMobile}
                  >
                    Resend OTP
                  </p>
                )}
              </>
            )}
          </>
        )}

        {/* ================= EMAIL ================= */}
        {mobileVerified && !emailVerified && (
          <>
            <Verified label="Mobile Verified" />

            <FloatingInput
              label="Email Address"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />

            {!emailSent ? (
              <BrownBtn onClick={sendEmail}>Send Email OTP</BrownBtn>
            ) : (
              <>
                <OtpInput value={emailOtp} onChange={setEmailOtp} />
                <BrownBtn onClick={verifyEmail}>Verify Email</BrownBtn>
                {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}

                {emailTime > 0 ? (
                  <p className="text-xs text-center mt-2">Resend in {emailTime}s</p>
                ) : (
                  <p
                    className="text-xs text-center mt-2 text-blue-600 cursor-pointer"
                    onClick={sendEmail}
                  >
                    Resend OTP
                  </p>
                )}
              </>
            )}
          </>
        )}

        {/* ================= FINAL SUMMARY ================= */}
        {mobileVerified && emailVerified && (
          <div className="mt-4">
            <SummaryItem label="Name" value={data.name} />
            <SummaryItem label="Mobile" value={data.mobile_no} verified />
            <SummaryItem label="Email" value={data.email} verified />

            <button
              onClick={register}
              className="w-full mt-6 py-3 rounded-xl
                         bg-gradient-to-r from-[#615141] to-[#c7a43d]
                         text-white font-semibold"
            >
              Register & Continue
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */
function FloatingInput({ label, value, onChange }) {
  return (
    <div className="relative mt-5">
      <input
        value={value}
        onChange={onChange}
        className="w-full px-3 pt-5 pb-2 border-b-2 border-gray-300
                   focus:outline-none focus:border-[#c7a43d] peer"
        placeholder=" "
      />
      <label className="absolute left-3 top-1 text-gray-400 text-sm
                        transition-all duration-200 peer-placeholder-shown:top-5
                        peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base
                        peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#615141]">
        {label}
      </label>
    </div>
  );
}

const GoldBtn = ({ children, ...p }) => (
  <button {...p} className="w-full mt-3 py-2 rounded-lg bg-[#c7a43d] text-white">
    {children}
  </button>
);

const BrownBtn = ({ children, ...p }) => (
  <button {...p} className="w-full mt-3 py-2 rounded-lg bg-[#615141] text-white">
    {children}
  </button>
);

const Verified = ({ label }) => (
  <div className="flex items-center gap-2 text-green-600 mt-4">
    <span className="text-xl">✔</span>
    <span className="font-medium">{label}</span>
  </div>
);

const SummaryItem = ({ label, value, verified }) => (
  <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 mt-2">
    <div>
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
    {verified && <span className="text-green-600 text-2xl">✔</span>}
  </div>
);
