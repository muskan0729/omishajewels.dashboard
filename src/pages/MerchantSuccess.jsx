import { useNavigate } from "react-router-dom";

const MerchantSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center">
        
        {/* Icon */}
        <div className="text-green-600 text-6xl mb-4">✅</div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Merchant Created Successfully
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-4">
          Your merchant account has been created successfully.
        </p>

        <p className="text-gray-600 mb-6">
          We are currently reviewing your documents.  
          You will receive your login credentials via email within
          <b> 24 to 48 hours</b>.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default MerchantSuccess;
