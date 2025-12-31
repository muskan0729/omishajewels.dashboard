import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import paymentGatewayBg from "../images/login-background.jpg";
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

  const handleKeyDown = (e, i) => {
  if (e.key === "Backspace" && !otp[i] && i > 0) {
    refs.current[i - 1].focus();
  }
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
          onKeyDown={(e) => handleKeyDown(e, i)}
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

  const [nameError, setNameError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");

  const [mobileOtp, setMobileOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  const [mobileSent, setMobileSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [mobileTime, resetMobileTimer] = useTimer(30);
  const [emailTime, resetEmailTimer] = useTimer(30);

   /* ================= VALIDATION ================= */
  const validateName = () => {
    if (!data.name.trim()) {
      setNameError("Full name is required");
      return false;
    }
    return true;
  };

  const validateMobile = () => {
    if (!/^\d{10}$/.test(data.mobile_no)) {
      setMobileError("Enter valid 10 digit mobile number");
      return false;
    }
    return true;
  };

  const validateEmail = () => {
    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      setEmailError("Enter valid email address");
      return false;
    }
    return true;
  };

  /* ================= HANDLERS ================= */
  const sendMobile = async () => {
    setMobileError("");
    if (!validateName() || !validateMobile() ) return;

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
    if (!validateEmail()) return;
    
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

  // const register = async () => {
  //   try {
  //     await registerUser({
  //       ...data,
  //       password: data.mobile_no,
  //       password_confirmation: data.mobile_no,
  //     });
  //     navigate("/MemberUserForm");
  //   } catch (err) {
  //     setError(err?.response?.data?.message || "Failed to register");
  //   }
  // };

  const register = async () => {
  try {
    const res = await registerUser({
      ...data,
      password: data.mobile_no,
      password_confirmation: data.mobile_no,
    });

    // 👇 response se id le rahe hain
    navigate("/MemberUserForm", {
      state: {
        id: res.id,
        name: data.name,
        mobile_no: data.mobile_no,
        email: data.email,
      },
    });
  } catch (err) {
    setError(err?.response?.data?.message || "Failed to register");
  }
};


  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      
      {/* ================= BACKGROUND IMAGE ================= */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: `url(${paymentGatewayBg})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-10 w-full flex items-center justify-center px-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl px-10 py-10">
          
          {/* ================= BRAND ================= */}
          {/* <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3">
              <img src={logo} alt="logo" className="w-20 h-auto" />
              <h1 className="text-xl font-bold text-[#615141] tracking-wide">
                Omisha<span className="text-[#c7a43d]">Jewels</span>
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-2">Create an account</p>
          </div> */}

          {/* Logo + Site Name (Side-by-side) */}
          <div className="flex items-center justify-center pr-10 mb-2">
            <img src={logo} alt="logo" className="w-40 h-auto" />
  
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-[#615141] tracking-wide leading-tight">
                Omisha<span className="text-[#c7a43d]">Jewels</span>
              </h1>
            </div>
          </div>
  
          <p className="text-sm text-gray-500 text-center">
            Create Your Account
          </p>

          {/* ================= FORM ================= */}
          <div className="space-y-5">
            
            {/* NAME */}
            {!(mobileVerified && emailVerified) && (
              // <FloatingInput
              //   id="name"
              //   label="Full Name"
              //   value={data.name}
              //   error={nameError}
              //   onChange={(e) => {
              //     setData({ ...data, name: e.target.value });
              //     setNameError("");
              //   }}
              // />
              <FloatingInput
                id="name"
                label="Full Name"
                value={data.name}
                error={nameError}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, ""); // ✅ only letters & spaces
                  setData({ ...data, name: value });
                  setNameError("");
                }}
              />
            )}

            {/* ================= MOBILE ================= */}
            {!mobileVerified && (
              <div className="space-y-4">
                <FloatingInput
                  id="mobile"
                  label="Mobile Number"
                  value={data.mobile_no}
                  error={mobileError}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10); // ✅ only digits, max 10
                    setData({ ...data, mobile_no: value });
                    setMobileError("");
                  }}
                />

                {!mobileSent ? (
                  <GoldBtn className="w-full" onClick={sendMobile}>
                    Send Mobile OTP
                  </GoldBtn>
                ) : (
                  <div className="bg-[#faf9f7] border border-gray-200 rounded-2xl p-4 space-y-3">
                    <OtpInput value={mobileOtp} onChange={setMobileOtp} />

                    <GoldBtn className="w-full" onClick={verifyMobile}>
                      Verify Mobile
                    </GoldBtn>

                    {/* {mobileError && (
                      <p className="text-red-500 text-xs text-center">
                        {mobileError}
                      </p>
                    )} */}

                    <p className="text-xs text-center text-gray-500">
                      {mobileTime > 0 ? (
                        <>Resend in {mobileTime}s</>
                      ) : (
                        <span
                          className="text-blue-600 cursor-pointer"
                          onClick={sendMobile}
                        >
                          Resend OTP
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ================= EMAIL ================= */}
            {mobileVerified && !emailVerified && (
              <div className="space-y-4">
                {/* <Verified label="Mobile Verified" /> */}
                <FloatingInput
                  id="email"
                  label="Email Address"
                  value={data.email}
                  error={emailError}
                  onChange={(e) => {
                    setData({ ...data, email: e.target.value });
                    setEmailError("");
                  }}
                />

                {!emailSent ? (
                  <BrownBtn className="w-full" onClick={sendEmail}>
                    Send Email OTP
                  </BrownBtn>
                ) : (
                  <div className="bg-[#faf9f7] border border-gray-200 rounded-2xl p-4 space-y-3">
                    <OtpInput value={emailOtp} onChange={setEmailOtp} />

                    <BrownBtn className="w-full" onClick={verifyEmail}>
                      Verify Email
                    </BrownBtn>

                    {/* {emailError && (
                      <p className="text-red-500 text-xs text-center">
                        {emailError}
                      </p>
                    )} */}

                    <p className="text-xs text-center text-gray-500">
                      {emailTime > 0 ? (
                        <>Resend in {emailTime}s</>
                      ) : (
                        <span
                          className="text-blue-600 cursor-pointer"
                          onClick={sendEmail}
                        >
                          Resend OTP
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ================= SUMMARY ================= */}
            {mobileVerified && emailVerified && (
              <div className="pt-2 space-y-3">
                <SummaryItem label="Name" value={data.name} />
                <SummaryItem label="Mobile" value={data.mobile_no} verified />
                <SummaryItem label="Email" value={data.email} verified />

                <button
                  onClick={register}
                  className="w-full mt-4 py-3 rounded-xl
                            bg-gradient-to-r from-[#615141] to-[#c7a43d]
                            text-white font-semibold tracking-wide
                            transition-all duration-200
                            hover:-translate-y-0.5 active:scale-95"
                >
                  Register & Continue
                </button>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-xs text-center mt-2">{error}</p>
            )}
          </div>
          <p className="text-center text-sm text-gray-500 mt-11">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-[#c7a43d] font-semibold cursor-pointer hover:underline"
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );

}

/* ================= UI COMPONENTS ================= */
function FloatingInput({ id, label, value, onChange, error }) {
  return (
    <div className="relative mt-4">
      <input
        id={id}
        value={value}
        onChange={onChange}
        placeholder=" "
        className={`
          w-full px-3 pt-5 pb-1.5 
          border-b-2
          ${error ? "border-red-500" : "border-gray-300"}
          focus:outline-none focus:border-[#c7a43d]
          peer
        `}
      />

      <label
        htmlFor={id}
        className={`
          absolute left-3 top-1 text-xs cursor-text
          transition-all duration-200
          peer-placeholder-shown:top-4
          peer-placeholder-shown:text-sm
          peer-focus:top-1
          peer-focus:text-xs
          ${error ? "text-red-500" : "text-gray-400"}
        `}
      >
        {label}
      </label>

      {error && (
        <p className="text-red-500 text-xs mt-1 ml-3">{error}</p>
      )}
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

// const SummaryItem = ({ label, value, verified }) => (
//   <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 mt-2">
//     <div>
//       <p className="text-gray-600 text-sm">{label}</p>
//       <p className="font-medium text-gray-800">{value}</p>
//     </div>
//     {verified && <span className="text-green-600 text-2xl">✔</span>}
//   </div>
// );

const SummaryItem = ({ label, value, verified }) => (
  <div
    className={`
      flex justify-between items-center rounded-xl p-4 mt-2 border
      ${
        verified
          ? "bg-green-50 border-green-200"
          : "bg-gray-50 border-gray-200"
      }
    `}
  >
    <div>
      <p
        className={`
          text-xs font-medium tracking-wide uppercase
          ${verified ? "text-green-700" : "text-gray-500"}
        `}
      >
        {label}
      </p>

      <p
        className={`
          text-sm font-semibold mt-0.5
          ${verified ? "text-green-900" : "text-gray-800"}
        `}
      >
        {value}
      </p>
    </div>

    {verified && (
      <span className="text-green-700 text-xs font-semibold tracking-wide">
        <i className="fa-solid fa-check-circle"></i>
      </span>
    )}
  </div>
);
