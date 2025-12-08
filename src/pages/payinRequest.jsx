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

  const intervalRef = useRef(null);

  const { execute: executePayin, loading } = usePost("/Airpay/request");
  const { execute: executeCheckStatus } = usePost("/AP/payin/checkstatus");

  // Generate unique order ID on mount
  useEffect(() => {
    const uniqueOrderId = `DSB${Date.now()}${Math.floor(Math.random() * 1000)}`;
    setPayerOrderId(uniqueOrderId);
  }, []);

  // Poll payment status
  useEffect(() => {
    if (orderId) {
      intervalRef.current = setInterval(checkPaymentStatus, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  // Auto-reset form after success/fail
  useEffect(() => {
    if (showSuccess || showFailed) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setShowFailed(false);
        setQrUrl("");
        setAmount("");
        setPayerName("");
        setPayerMobile("");
        setPayerEmail("");
        const uniqueOrderId = `DSB${Date.now()}${Math.floor(Math.random() * 1000)}`;
        setPayerOrderId(uniqueOrderId);
      }, 5000);
      return () => clearTimeout(timer);
    }


  }, [showSuccess, showFailed]);
    

  const handlePayinSubmit = async () => {
    if (Number(amount) < 10) {
      setAmountError("Amount must be at least ₹10");
      return;
    }
    try {
      const payload = {
        buyer_name: payerName,
        buyer_phone: payerMobile,
        buyer_email: payerEmail,
        amount,
        orderid: payerOrderId,
      };
      const data = await executePayin(payload);
      if (data.status === "success") {
        setQrUrl(
          `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
            data.data.qrcode_string
          )}`
        );
        setOrderId(data.data.orderid);
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
                onChange={(e) => setPayerName(e.target.value)}
                className="block w-full border-b-2 border-gray-300 py-2 px-0 text-gray-900 bg-transparent focus:outline-none focus:border-blue-600 peer"
                placeholder=" " // important for peer-focus & floating label
              />
              <label className={`absolute left-0 text-gray-500 text-sm transition-all duration-200
                ${payerName ? "-top-3 text-blue-600 text-xs" : "top-2"} 
                peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm`}>
                Payer Name
              </label>
            </div>

            <div className="relative w-full">
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                setAmount(val);
                setAmountError(Number(val) < 10 ? "Amount must be at least ₹10" : "");
              }}
              className="peer block w-full border-b-2 border-gray-300 py-2 px-0 text-gray-900 focus:border-blue-600 focus:outline-none placeholder-transparent"
              placeholder=" "
            />
            <label
              className="
                absolute left-0 text-gray-500 text-sm 
                transition-all duration-200
                peer-placeholder-shown:top-2
                peer-placeholder-shown:text-gray-400
                peer-focus:-top-3
                peer-focus:text-blue-600
                peer-valid:-top-3
                peer-valid:text-blue-600
              "
            >
              Amount
            </label>
            {amountError && <p className="text-red-600 text-sm mt-1">{amountError}</p>}
          </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
          {/* Mobile Number */}
          <div className="relative w-full">
            <input
              type="tel"
              required
              value={payerMobile}
              onChange={(e) => setPayerMobile(e.target.value)}
              className="peer block w-full border-b-2 border-gray-300 py-2 px-0
                        text-gray-900 focus:border-blue-600 focus:outline-none 
                        placeholder-transparent"
              placeholder=" "
            />
            <label
              className="
                absolute left-0 text-gray-500 text-sm transition-all duration-200

                peer-placeholder-shown:top-2
                peer-placeholder-shown:text-gray-400
                
                peer-focus:-top-3
                peer-focus:text-blue-600

                peer-valid:-top-3
                peer-valid:text-blue-600
              "
            >
              Mobile Number
            </label>
          </div>

          {/* Email */}
            <div className="relative w-full">
              <input
                type="email"
                required
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                className="peer block w-full border-b-2 border-gray-300 py-2 px-0
                          text-gray-900 focus:border-blue-600 focus:outline-none 
                          placeholder-transparent"
                placeholder=" "
              />

              <label
                className={`
                  absolute left-0 text-gray-500 text-sm transition-all duration-200
                  
                  ${payerEmail ? "-top-3 text-blue-600" : "top-2 text-gray-400"}
                  peer-focus:-top-3 peer-focus:text-blue-600
                `}
              >
                Email
              </label>
            </div>
        </div>

          <div className="flex justify-center mt-4">
            <Button
              onClick={handlePayinSubmit}
              className="bg-[#615141] hover:bg-blue-700 text-white rounded-lg px-6 py-2 shadow-md"
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
            <h3 className="text-gray-800 font-semibold text-lg mb-4">Scan to Pay</h3>
            <img src={qrUrl} alt="UPI QR Code" className="w-64 h-64 mb-4" />
            <Button onClick={() => setQrUrl("")} className="bg-[#615141] hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Success / Fail */}
      {showSuccess && (
        <div className="flex justify-center">
          <div className="bg-green-100 w-72 h-72 rounded-full shadow-lg flex flex-col items-center justify-center border border-green-300">
            <h2 className="text-green-800 font-bold text-lg">Payment Successful!</h2>
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
