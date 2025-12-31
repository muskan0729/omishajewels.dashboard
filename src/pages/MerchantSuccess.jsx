import { useNavigate } from "react-router-dom";

const MerchantSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8efe4] via-[#f3e3cf] to-[#e6d5b8] px-4">
      <div className="relative bg-white shadow-2xl rounded-2xl p-10 max-w-md w-full text-center overflow-hidden">

        {/* Decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d7a874]/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#b58351]/20 rounded-full blur-3xl"></div>

        {/* Success Icon */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#b58351] to-[#d7a874] flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-check text-white text-4xl"></i>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#4d443b] mb-2">
          Merchant Created Successfully
        </h2>

        {/* Divider */}
        <div className="w-16 h-1 bg-gradient-to-r from-[#b58351] to-[#d7a874] mx-auto rounded-full mb-4"></div>

        {/* Message */}
        <p className="text-[#6b5e52] text-sm mb-4">
          Your merchant account has been created and submitted for verification.
        </p>

        <p className="text-[#6b5e52] text-sm mb-8 leading-relaxed">
          Our team is currently reviewing your submitted documents.
          <br />
          ...You will receive your login credentials via email within...
          <span className="font-semibold text-[#4d443b]"> 24 – 48 hours</span>.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate("/")}
          className="
            w-full
            bg-gradient-to-r from-[#b58351] to-[#d7a874]
            text-white
            py-3
            rounded-xl
            font-semibold
            shadow-lg
            hover:brightness-110
            hover:shadow-xl
            transition
          "
        >
          Go to Dashboard
        </button>

        {/* Footer note */}
        <p className="text-xs text-[#9c8a78] mt-6">
          Need help? Contact our support team anytime.
        </p>
      </div>
    </div>
  );
};

export default MerchantSuccess;

