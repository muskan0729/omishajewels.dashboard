import { useState } from "react";

function SpayGlidePGCancel() {
    //const location = useLocation();

    // Get message from state or query param
    //const message = location.state?.message || "Sorry, we cannot process your transaction at the moment.";
    const message = "Sorry, we cannot process your transaction at the moment.";

return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Cancelled</h1>
      <p className="text-gray-700 mb-6">{message}</p>
      {/* <button
        className="px-6 py-3 bg-[#615141] text-white rounded-lg font-semibold"
        onClick={() => navigate("/")} // go back home or review page
      >
        Go Back
      </button> */}
    </div>
  );
}

export default SpayGlidePGCancel;