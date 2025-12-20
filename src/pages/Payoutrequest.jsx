import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import { usePost } from "../hooks/usePost";
import { useGet } from "../hooks/useGet";

import { useToast } from "../contexts/ToastContext";
import { TableSkeleton } from "../components/TableSkeleton";

const Payoutrequest = () => {
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("IMPS");
  const [isLoading, setIsLoading] = useState(false);
// ===== TOKEN DROPDOWN =====
const [tokens, setTokens] = useState([]);
const [selectedToken, setSelectedToken] = useState("");

  const [amountError, setAmountError] = useState("");
  const [beneEmailError, setbeneEmailError] = useState("");
  const [benephoneError, setbenephoneError] = useState("");

  const [AddACcont, setAddAccount] = useState("");
  const [AddIfsc, setAddIfsc] = useState("");
  const [AddUpi, setAddUpi] = useState("");
  const [AddBeneName, setAddBeneName] = useState("");
  const [beneMobile, setBeneMobile] = useState("");
  const [AddBeneEmail, setBeneEmail] = useState("");
  const [AddBank, setAddBank] = useState("");
  const [AddAddress, setAddAddress] = useState("");

  const [beneficiary, setbeneficiary] = useState([]);
  const toast = useToast();

  const { data, loading, error, refetch } = useGet("/beneficiary-List");

  // ===== GET TOKEN LIST =====
const {
  data: tokenData,
  loading: tokenLoading,
  error: tokenError,
} = useGet("/get-tokens");

  useEffect(() => {
    if (data?.data) {
      setbeneficiary(data.data);
    }
  }, [data]);

  // ===== STORE TOKEN DATA =====
useEffect(() => {
  if (tokenData?.data) {
    setTokens(tokenData.data);
  }
}, [tokenData]);


  const { execute: payoutsend } = usePost("/payout/request");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    if (!selectedUser) return;

if (!selectedToken) {
  toast.error("Please select token");
  return;
}

    try {
      const payload = {
        // token: "Pq4mPdo9AkdT2NkEw4MANTy5fw7kBY",
         token: selectedToken,
        orderid: "DASH" + Date.now(),
        beneficiary_email: selectedUser.beneficiary_email_id,
        beneficiary_phone: selectedUser.beneficiary_mobile_no,
        amount,
        beneficiary_account_number: selectedUser.account_no,
        beneficiary_ifsc: selectedUser.ifsc_code,
        beneficiary_name: selectedUser.beneficiary_name,
        mode: paymentMode,
      };

      // console.log("api clicked");
      const response = await payoutsend(payload);
      // console.log("response", response);
      if (response?.status?.toLowerCase() === "success") {
        toast.success("✅ Payout Completed");
        resetForm();
        setShowModal(false);
      } else if (response?.status?.toLowerCase() === "pending") {
        toast.info("⏳ Payout Initiated (Pending Confirmation)");
        setShowModal(false);
      } else {
        toast.error(response?.message || "❌ Payout Failed");
      }
    } catch (err) {
      console.error("payout error", err);
      toast.error("Payout ");
    } finally {
      setIsLoading(false); // stop loading after response
    }
  };
  const resetForm = () => {
    setAddAddress("");
    setAddBank("");
    setBeneEmail("");
    setBeneMobile("");
    setAddBeneName("");
    setAddIfsc("");
    setAddAccount("");
    // whatever fields you have
  };

  const { execute: addbeneficiary } = usePost("/store-beneficiary-detail");

  const handleAddBeneficiary = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      // console.log("add beneficiary api clicked");
      const payload = {
        bank_name: AddBank,
        account_no: AddACcont,
        ifsc_code: AddIfsc,
        upi_number: AddUpi,
        beneficiary_name: AddBeneName,
        beneficiary_mobile_no: beneMobile,
        beneficiary_email_id: AddBeneEmail,
        beneficiary_address: AddAddress,
      };
      const data = await addbeneficiary(payload);

      // console.log("added beneficiary", data);
      setShowFormModal(false);

      toast.success("Form submitted successfully!");
      resetForm();
    } catch (err) {
      // console.log("error to add beneficiary", err);
      toast.error("Error to add Beneficiary");
    } finally {
      setIsLoading(false); // stop loading after response
    }
  };
  const membercolumn = [
    { header: "Sr No", accessor: "sqno" },
    { header: "Beneficiary Id", accessor: "beneficiaryid" },
    { header: "Bank Details", accessor: "bankdetails" },
    { header: "Beneficiary Details", accessor: "beneficiarydetails" },
    { header: "Action", accessor: "action" },
  ];

  // const memberdata = [
  //   {
  //     beneficiaryid: "1",
  //     bankdetails: "Yuvraj",
  //     beneficiarydetails: "Rs.1000",
  //   },
  //   {
  //     beneficiaryid: "2",
  //     bankdetails: "Aakash",
  //     beneficiarydetails: "Rs.4000",
  //   },
  // ];




  const tableDataWithActions = beneficiary.map((row, index) => ({
    id: row.id,
    sqno: index + 1,
    beneficiaryid: row.id,
    bankdetails: (
      <div className="flex flex-col text-left">
        <span>
          Bank Name : <b>{row.bank_name}</b>
        </span>
        <span>
          Account No:<b> {row.account_no}</b>
        </span>
        {/* <span>
          UPI Number:<b> {row.upi_number}</b>
        </span> */}
        <span>
          IFSC Code:<b> {row.ifsc_code}</b>
        </span>
      </div>
    ),
    beneficiarydetails: (
      <div className="flex flex-col text-left">
        <span>
          Beneficiary Name : <b>{row.beneficiary_name || "null"}</b>
        </span>
        <span>
          Beneficiary Mobile No. : <b>{row.beneficiary_mobile_no || "null"}</b>
        </span>
        <span>
          Beneficiary Email Id : <b>{row.beneficiary_email_id || "null"}</b>
        </span>
        <span>
          Beneficiary Address : <b>{row.beneficiary_address || "null"}</b>
        </span>
      </div>
    ),

    action: (
      <Button
        onClick={() => {
          setSelectedUser(row);
          setShowModal(true);
        }}
        className="text-white bg-[#615141] hover:bg-blue-700 px-4 py-1 rounded-lg text-sm cursor-pointer"
      >
        send
      </Button>
    ),
  }));

  return (
    <>

      {/* <div className="bg-gradient-to-t from-[#b58351] to-[#b6916d]  flex justify-between items-center mb-3 p-2.5">
        <h4 className="font-bold text-white text-lg py-2">Beneficiary List</h4> */}
      <div className="p-4">
        <div
          className="bg-gradient-to-t from-[#b58351] to-[#b6916d]  
               flex justify-between items-center 
               rounded-lg p-4 mb-4"
        >
          <h4 className="font-bold text-white text-lg">Beneficiary List</h4>

        <Button
  type="button"
  className="bg-white border border-sky-200 text-sky-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-sky-50 hover:border-sky-300 transition-all duration-200 cursor-pointer"
  onClick={() => setShowFormModal(true)}
>
  + Add New Beneficiary
</Button>

        </div>

        <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
          {loading ? <TableSkeleton /> : (
            <Table
              columns={membercolumn}
              data={tableDataWithActions}
              showExport={false}
              showStatusFilter={false}
              endPoint="/delete-Beneficiary"
              refreshTable={refetch}
            />
          )}
        </div>
      </div>

      {/* ✅ Modal with background blur */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
        // onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ✅ Modal Header */}
            <div className="bg-gradient-to-r  from-[#f4e1c1] to-[#e6b35a] text-white font-medium rounded-t-lg px-5 py-3 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Payout to Beneficiary</h3>
              <Button
                onClick={() => setShowModal(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-red-500 font-bold text-lg shadow-md hover:bg-red-500 hover:text-white transition"
              >
                <i class="fa-solid fa-xmark fa-lg"></i>
              </Button>
            </div>

            {/* Beneficiary Table */}
            <div className="overflow-x-auto p-4">

              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr
                    style={{ backgroundColor: "#bec3ceff" }}
                    className="font-medium"
                  >
                    <th className="p-2 border border-white text-gray-500">
                      NAME
                    </th>
                    <th className="p-2 border border-white text-gray-500">
                      ACCOUNT
                    </th>
                    <th className="p-2 border border-white text-gray-500">
                      IFSC
                    </th>
                    <th className="p-2 border border-white text-gray-500">
                      BANK
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {selectedUser && (
                    <tr
                      style={{ backgroundColor: "#68f3b9ff" }}
                      className="font-medium text-white"
                    >
                      <td className="p-2 border">
                        {selectedUser.beneficiary_name}
                      </td>
                      <td className="p-2 border">{selectedUser.account_no}</td>
                      <td className="p-2 border">{selectedUser.ifsc_code}</td>
                      <td className="p-2 border">{selectedUser.bank_name}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* <Table
              columns={columns}
              data={filteredData}
              showDeleteColumn={false}
            /> */}


            {/* Scroll bar (if table overflows) */}
            {/* <div className="overflow-x-scroll px-4 mb-2">
              <div className="h-1"></div>
            </div> */}

            {/* Divider Line */}
            <div className="border-t border-gray-300 mx-4 mb-1"></div>

            {/* ✅ Modal Body */}
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">

                {/* ===== TOKEN ID DROPDOWN ===== */}
<div>
  <label className="block mb-2 text-sm font-medium text-gray-900">
    Token ID
  </label>
  <select
    value={selectedToken}
    onChange={(e) => setSelectedToken(e.target.value)}
    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
  >
    <option value="">
      {tokenLoading ? "Loading..." : "-- Select Token --"}
    </option>

    {tokens.map((t, i) => (
      <option key={i} value={t.token}>
        {t.token}
      </option>
    ))}
  </select>

  {tokenError && (
    <p className="text-red-600 text-sm mt-1">
      Unable to load token list
    </p>
  )}
</div>

                {/* Amount */}
                <div>
                  <label
                    htmlFor="amount"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Amount
                  </label>
                  <input
                    id="amount"
                    type="number"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Payment Mode */}
                <div>
                  <label
                    htmlFor="paymentMode"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    {" "}
                    Payment Mode{" "}
                  </label>
                  <select
                    id="paymentMode"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  >
                    <option>IMPS</option>
                    <option>NEFT</option>
                    <option>UPI</option>
                    <option>RTGS</option>
                  </select>
                </div>
              </div>

              {/* ✅ Buttons aligned to right */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-white bg-gray-600 hover:bg-red-400 transition"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`${isLoading
                    ? "bg-blue-700 cursor-not-allowed opacity-80"
                    : "bg-[#615141] hover:bg-blue-700"
                    } text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center`}
                >
                  {isLoading && (
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 mr-2 text-gray-200 animate-spin fill-white"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08197 50.5908C9.08197 73.1895 27.4013 91.5089 50 91.5089C72.5987 91.5089 90.918 73.1895 90.918 50.5908C90.918 27.9921 72.5987 9.67273 50 9.67273C27.4013 9.67273 9.08197 27.9921 9.08197 50.5908Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5538C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5463 70.6331 15.2552C75.2735 17.9642 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5423 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      ></path>
                    </svg>
                  )}
                  {isLoading ? "Processing..." : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Beneficiary Modal */}
      {showFormModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
        // onClick={() => setShowFormModal(false)}
        >
          <div
            className="bg-white border rounded-lg shadow-lg max-w-3xl w-full mx-2 p-6 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="text-white bg-gradient-to-r  from-[#f4e1c1] to-[#e6b35a] 
              font-medium rounded-t-lg text-sm px-5 py-3 flex justify-between items-center"
            >
              <h4 className="font-bold text-white text-lg py-2">
                Add Beneficiary Details
              </h4>
              <Button
                onClick={() => setShowFormModal(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-red-500 font-bold text-lg shadow-md hover:bg-red-500 hover:text-white transition"
              >
                <i class="fa-solid fa-xmark fa-lg"></i>
              </Button>
            </div>

            {/* Modal Body */}
            <form className="p-6" onSubmit={handleAddBeneficiary}>
              <div class="grid md:grid-cols-2 md:gap-6 px-4">
                <div class="relative z-0 w-full mb-5 group">
                  <input
                    type="text"
                    name="floating_first_name"
                    value={AddACcont}
                    onChange={(e) => setAddAccount(e.target.value)}
                    id="floating_first_name"
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    required
                  />
                  <label
                    for="floating_first_name"
                    class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Account No.
                  </label>
                </div>
                <div class="relative z-0 w-full mb-5 group">
                  <input
                    type="text"
                    name="floating_first_name"
                    value={AddBank}
                    onChange={(e) => setAddBank(e.target.value)}
                    id="floating_first_name"
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    required
                  />
                  <label
                    for="floating_first_name"
                    class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Bank Name.
                  </label>
                </div>
              </div>
              <div class="grid md:grid-cols-2 md:gap-6 px-4">
                <div class="relative z-0 w-full mb-5 group">
                  <input
                    type="text"
                    name="floating_last_name"
                    id="floating_last_name"
                    value={AddIfsc}
                    onChange={(e) => setAddIfsc(e.target.value)}
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    required
                  />
                  <label
                    for="floating_last_name"
                    class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    IFSC Code
                  </label>
                </div>
                {/* <div class="relative z-0 w-full mb-5 group">
                  <input
                    type="text"
                    name="floating_last_name"
                    id="floating_last_name"
                    value={AddUpi}
                    onChange={(e) => setAddUpi(e.target.value)}
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                  />
                  <label
                    for="floating_last_name"
                    class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    UPI Number
                  </label>
                </div> */}
                <div class="relative z-0 w-full mb-5 group">
                  <input
                    type="tel"
                    pattern="[0-9]{10}"
                    name="floating_phone"
                    id="floating_phone"
                    value={beneMobile}
                    onChange={(e) => setBeneMobile(e.target.value)}
                    //     onChange={(e) => {
                    //   const value = e.target.value;
                    //   setBeneMobile(value);

                    //   // Simple email validation regex
                    //   const numberPattern =/^[1-9]\d{9}$/;
                    //   if (!numberPattern.test(value)) {
                    //     setbenephoneError("Enter a valid 10-digit mobile number");
                    //   } else {
                    //     setbenephoneError("");
                    //   }
                    // }}
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=""
                  />
                  <label
                    for="floating_phone"
                    class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Beneficiary Mobile Number
                  </label>
                  {benephoneError && (
                    <p className="text-red-600 text-sm mt-1">
                      {benephoneError}
                    </p>
                  )}
                </div>
              </div>
              <div class="grid md:grid-cols-2 md:gap-6 px-4">
                <div class="relative z-0 w-full mb-5 group">
                  <input
                    type="text"
                    name="floating_last_name"
                    id="floating_last_name"
                    value={AddBeneName}
                    onChange={(e) => setAddBeneName(e.target.value)}
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                    required
                  />
                  <label
                    for="floating_last_name"
                    class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Beneficiary Name
                  </label>
                </div>
                <div class="relative z-0 w-full mb-5 group">
                  <input
                    type="text"
                    name="floating_first_name"
                    value={AddAddress}
                    onChange={(e) => setAddAddress(e.target.value)}
                    id="floating_first_name"
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                  // required
                  />
                  <label
                    for="floating_first_name"
                    class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Beneficiary Address.
                  </label>
                </div>
              </div>
              <div class="grid md:grid-cols-2 md:gap-6 px-4">
                {/* <div class="relative z-0 w-full mb-5 group">
                  <input
                    type="tel"
                    pattern="[0-9]{10}"
                    name="floating_phone"
                    id="floating_phone"
                    value={beneMobile}
                    // onChange={(e) => setBeneMobile(e.target.value)}
                    onChange={(e) => {
                  const value = e.target.value;
                  setBeneMobile(value);

                  // Simple email validation regex
                  const numberPattern =/^[1-9]\d{9}$/;
                  if (!numberPattern.test(value)) {
                    setbenephoneError("Enter a valid 10-digit mobile number");
                  } else {
                    setbenephoneError("");
                  }
                }}
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                  />
                  <label
                    for="floating_phone"
                    class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Beneficiary Mobile Number
                  </label>
                {benephoneError && (
                <p className="text-red-600 text-sm mt-1">{benephoneError}</p>
              )}
                </div> */}
                <div class="relative z-0 w-full mb-5 group">
                  <input
                    type="text"
                    name="floating_last_name"
                    id="floating_last_name"
                    value={AddBeneEmail}
                    // onChange={(e) => setBeneEmail(e.target.value)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setBeneEmail(value);

                      // Simple email validation regex
                      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailPattern.test(value)) {
                        setbeneEmailError("Enter a valid email address");
                      } else {
                        setbeneEmailError("");
                      }
                    }}
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    placeholder=" "
                  />
                  <label
                    for="floating_last_name"
                    class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                  >
                    Beneficiary Email ID
                  </label>
                  {beneEmailError && (
                    <p className="text-red-600 text-sm mt-1">
                      {beneEmailError}
                    </p>
                  )}
                </div>
              </div>
              <div class="flex justify-center mt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`${isLoading
                    ? "bg-blue-700 cursor-not-allowed opacity-80"
                    : "bg-[#615141] hover:bg-blue-700"
                    } text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center`}
                // className="cursor-pointer text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                >
                  {/* Submit */}
                  {isLoading && (
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 mr-2 text-gray-200 animate-spin fill-white"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08197 50.5908C9.08197 73.1895 27.4013 91.5089 50 91.5089C72.5987 91.5089 90.918 73.1895 90.918 50.5908C90.918 27.9921 72.5987 9.67273 50 9.67273C27.4013 9.67273 9.08197 27.9921 9.08197 50.5908Z"
                        fill="currentColor"
                      ></path>
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5538C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5463 70.6331 15.2552C75.2735 17.9642 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5423 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      ></path>
                    </svg>
                  )}
                  {isLoading ? "Processing..." : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Payoutrequest;
