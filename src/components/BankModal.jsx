import Button from "./Button";
import { usePost } from "../hooks/usePost";
import { useEffect, useState } from "react";

export const BankModal = ({ showModal, handleModal, activeTab, refreshTable }) => {
  const apiEndPoint =
    activeTab === "payin" ? "/onboard-payinbank" : "/onboard-payoutbank";
  const [bankName, setBankName] = useState("");
  const {
    error,
    execute: onBoardBank,
    loading,
    setError,
  } = usePost(apiEndPoint);

  useEffect(() => {
    if (showModal) {
      setBankName("");
      setError(null);
    }
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload =
      activeTab === "payin"
        ? { onboard_payin_bank: bankName }
        : { onboard_payout_bank: bankName };

    try {
      const response = await onBoardBank(payload);
      if (response) {
        handleModal(false);
        setBankName(" ");
        if(refreshTable) refreshTable();
      }
    } catch (err) {
      console.log("Login failed:", err);
    }
  };

  return (
    <>
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
          onClick={() => handleModal(false)}
        >
          <div
            className="bg-white border rounded-lg shadow-lg max-w-3xl w-full mx-2 p-6 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="text-white bg-gradient-to-r  from-[#f4e1c1] to-[#e6b35a] 
              font-medium rounded-t-lg text-sm px-5 py-3 flex justify-between items-center"
            >
              <h4 className="font-bold text-[#615141] text-lg py-2">
                {activeTab === "payin" ? "Add Payin Bank" : "Add Payout Bank"}
              </h4>
              <Button
                onClick={() => handleModal(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-red-500 font-bold text-lg shadow-md hover:bg-red-500 hover:text-white transition"
              >
                <i class="fa-solid fa-xmark fa-lg"></i>
              </Button>
            </div>

            <form className="p-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-1 md:gap-6 px-4">
                <div className="relative z-0 w-full mb-5 group">
                  <input
                    type="text"
                    name={
                      activeTab === "payin"
                        ? "onboard_payin_bank"
                        : "onboard_payout_bank"
                    }
                    id="floating_bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className={`block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer ${
                      error?.error
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-[#b58351]"
                    }`}
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="floating_bank"
                    className={`peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-[#b58351] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}
                  >
                    Bank Name
                  </label>
                  {error?.error && (
                    <p className="mt-1 text-sm text-red-500">{error.error}</p>
                  )}
                </div>
                <div className="relative z-0 w-full mb-5 group">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Bank Type
                  </label>
                  <div className="w-full border rounded-md p-2 text-sm bg-gray-100 text-gray-900">
                    {activeTab === "payin" ? "Payin" : "Payout"}
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className={`cursor-pointer text-white bg-gradient-to-r from-[#b58351] to-[#d7a874]
                  hover:brightness-110 focus:ring-6 
                  focus:outline-none focus:ring-yellow-100 font-medium rounded-lg text-sm w-full sm:w-auto 
                  // px-5 py-2.5 text-center ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
