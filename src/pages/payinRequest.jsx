import { useEffect, useRef, useState } from "react";

import Button from "../components/Button";
import { usePost } from "../hooks/usePost";

export const PayinRequest = () => {
  const [payerName, setPayerName] = useState("");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [payerMobile, setPayerMobile] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerOrderId, setPayerOrderId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);

  const [payerNameError, setPayerNameError] = useState("");
  const [payerMobileError, setPayerMobileError] = useState("");
  const [payerEmailError, setPayerEmailError] = useState("");

  const [qrTimer, setQrTimer] = useState(120); // 2 min = 120 sec
  const qrTimerRef = useRef(null);

  const intervalRef = useRef(null);

  const { execute: executePayin, loading } = usePost("/Airpay/request");
  const { execute: executeCheckStatus } = usePost("/AP/payin/checkstatus");

  // Poll payment status
  useEffect(() => {
    if (orderId) {
      intervalRef.current = setInterval(checkPaymentStatus, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  useEffect(() => {
    if (qrTimer === 0) {
      clearInterval(qrTimerRef.current);
      resetForm(); // ⬅️ AUTO BACK
    }
  }, [qrTimer]);

  useEffect(() => {
    if (showSuccess || showFailed) {
      const timer = setTimeout(() => {
        resetForm();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess, showFailed]);

    useEffect(() => {
  const uniqueOrderId = `DSB${Date.now()}${Math.floor(Math.random() * 1000)}`;
  setPayerOrderId(uniqueOrderId);
}, []);


  const handlePayinSubmit = async () => {
    let isValid = true;

    if (!payerName || !nameRegex.test(payerName)) {
      setPayerNameError("Name should contain only alphabets");
      isValid = false;
    }

    if (!mobileRegex.test(payerMobile)) {
      setPayerMobileError("Enter a valid 10-digit mobile number");
      isValid = false;
    }

    if (!emailRegex.test(payerEmail)) {
      setPayerEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!amount || Number(amount) < 10) {
      setAmountError("Amount must be at least ₹10");
      isValid = false;
    }

    if (!isValid) return; // STOP API CALL

    // API CALL
    try {
      const payload = {
        buyer_name: payerName,
        buyer_phone: payerMobile,
        buyer_email: payerEmail,
        amount,
        orderid: payerOrderId,
      };

      const data = await executePayin(payload);
    // console.log("pay data",data);
      if (data.status === "success") {
        setQrUrl(
          `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
            data.data.qrcode_string,
          )}`,
        );
        setOrderId(data.data.orderid);

        // ⏱️ START QR TIMER
        setQrTimer(120);
        clearInterval(qrTimerRef.current);
        qrTimerRef.current = setInterval(() => {
          setQrTimer((prev) => prev - 1);
        }, 1000);

        setShowSuccess(false);
        setShowFailed(false);
      } else {
        setShowFailed(true);
        setQrUrl("");
      }
    } catch {
      setShowFailed(true);
      setQrUrl("");
    }
  };

  const resetForm = () => {
    // stop timers
    clearInterval(intervalRef.current);
    clearInterval(qrTimerRef.current);

    // reset timer
    setQrTimer(120);

    // form values
    setPayerName("");
    setAmount("");
    setPayerMobile("");
    setPayerEmail("");

    // errors
    setAmountError("");
    setPayerNameError("");
    setPayerMobileError("");
    setPayerEmailError("");

    // flow states
    setQrUrl("");
    setOrderId("");
    setShowSuccess(false);
    setShowFailed(false);

    // new order id
    const uniqueOrderId = `DSB${Date.now()}${Math.floor(Math.random() * 1000)}`;
    setPayerOrderId(uniqueOrderId);

    // stop polling (important)
    clearInterval(intervalRef.current);
  };

  const checkPaymentStatus = async () => {
    try {
      if (!orderId) return;
      const formData = new FormData();
      formData.append("orderid", orderId);
      const statusData = await executeCheckStatus(formData);
      if (statusData?.status === "SUCCESS") {
        clearInterval(intervalRef.current);
        setShowSuccess(true);
        setShowFailed(false);
        setQrUrl("");
      } else if (statusData?.status === "FAILED") {
        clearInterval(intervalRef.current);
        setShowFailed(true);
        setShowSuccess(false);
        setQrUrl("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const nameRegex = /^[A-Za-z ]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-t from-[#b58351] to-[#b6916d]  rounded-lg p-4 shadow-md">
        <h4 className="text-white font-bold text-xl">Load Wallet</h4>
      </div>

      {/* Form */}
      {!qrUrl && !showSuccess && !showFailed && (
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4 border border-gray-200">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative w-full">
              <input
                type="text"
                value={payerName}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "" || nameRegex.test(value)) {
                    setPayerName(value);
                    setPayerNameError("");
                  } else {
                    setPayerNameError("Name should contain only alphabets");
                  }
                }}
                className="block w-full border-b-2 border-gray-300 py-2 px-0
                  text-gray-900 bg-transparent focus:outline-none focus:border-yellow-600 peer"
                placeholder=" "
              />
              <label
                className={`absolute left-0 text-gray-500 text-sm transition-all duration-200
                ${payerName ? "-top-3 text-yellow-600 text-xs" : "top-2"} 
                peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm`}
              >
                Payer Name
              </label>
              {payerNameError && (
                <p className="text-red-600 text-sm mt-1">{payerNameError}</p>
              )}
            </div>

            <div className="relative w-full">
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  setAmount(val);
                  setAmountError(
                    Number(val) < 10 ? "Amount must be at least ₹10" : "",
                  );
                }}
                className="peer block w-full border-b-2 border-gray-300 py-2 px-0 text-gray-900 focus:border-yellow-600 focus:outline-none placeholder-transparent"
                placeholder=" "
              />
              <label
                className={`
                  absolute left-0 text-gray-500 text-sm transition-all duration-200
                  
                  ${amount ? "-top-3 text-yellow-600" : "top-2 text-gray-400"}
                  peer-focus:-top-3 peer-focus:text-yellow-600
                `}
              >
                Amount
              </label>
              {amountError && (
                <p className="text-red-600 text-sm mt-1">{amountError}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Mobile Number */}
            <div className="relative w-full">
              <input
                type="tel"
                required
                pattern="[6-9]{1}[0-9]{9}"
                value={payerMobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");

                  if (value.length <= 10) {
                    setPayerMobile(value);
                    setPayerMobileError("");
                  }
                }}
                className="peer block w-full border-b-2 border-gray-300 py-2 px-0
               text-gray-900 focus:border-yellow-600 focus:outline-none
               placeholder-transparent"
                placeholder=" "
              />
              <label
                className={`
                  absolute left-0 text-gray-500 text-sm transition-all duration-200
                  
                  ${payerMobile ? "-top-3 text-yellow-600" : "top-2 text-gray-400"}
                  peer-focus:-top-3 peer-focus:text-yellow-600
                `}
              >
                Mobile Number
              </label>
              {payerMobileError && (
                <p className="text-red-600 text-sm mt-1">{payerMobileError}</p>
              )}
            </div>

            {/* Email */}
            <div className="relative w-full">
              <input
                type="email"
                value={payerEmail}
                onChange={(e) => {
                  const value = e.target.value;
                  setPayerEmail(value);

                  if (!emailRegex.test(value)) {
                    setPayerEmailError("Please enter a valid email address");
                  } else {
                    setPayerEmailError("");
                  }
                }}
                className="peer block w-full border-b-2 border-gray-300 py-2 px-0
                text-gray-900 focus:border-yellow-600 focus:outline-none
                placeholder-transparent"
                placeholder=" "
              />

              <label
                className={`
                  absolute left-0 text-gray-500 text-sm transition-all duration-200
                  
                  ${payerEmail ? "-top-3 text-yellow-600" : "top-2 text-gray-400"}
                  peer-focus:-top-3 peer-focus:text-yellow-600
                `}
              >
                Email
              </label>
              {payerEmailError && (
                <p className="text-red-600 text-sm mt-1">{payerEmailError}</p>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Button
              onClick={handlePayinSubmit}
              className="bg-[#615141] hover:bg-yellow-800 text-white rounded-lg px-6 py-2 shadow-md cursor-pointer"
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      )}

      {/* QR Code */}
      {qrUrl && (
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border border-gray-200">
            <h3 className="text-gray-800 font-semibold text-lg mb-4">
              Scan to Pay
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Time left:{" "}
              <span className="font-semibold text-red-600">
                {Math.floor(qrTimer / 60)}:
                {(qrTimer % 60).toString().padStart(2, "0")}
              </span>
            </p>
            <img src={qrUrl} alt="UPI QR Code" className="w-64 h-64 mb-4" />
            <Button
              onClick={resetForm}
              className="bg-[#615141] hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
            >
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Success / Fail */}
      {showSuccess && (
        <div className="flex justify-center">
          <div className="bg-green-100 w-72 h-72 rounded-full shadow-lg flex flex-col items-center justify-center border border-green-300">
            <h2 className="text-green-800 font-bold text-lg">
              Payment Successful!
            </h2>
          </div>
        </div>
      )}

      {showFailed && (
        <div className="flex justify-center">
          <div className="bg-red-100 w-72 h-72 rounded-full shadow-lg flex flex-col items-center justify-center border border-red-300">
            <h2 className="text-red-700 font-bold text-lg">Payment Failed!</h2>
            <p className="text-red-600 text-sm mt-1">Please try again</p>
          </div>
        </div>
      )}
    </div>
  );
};
