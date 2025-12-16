import React, { useEffect, useState } from "react";
import { Stepper } from "../components/Stepper";
import { SchemeModal } from "../components/SchemeModal";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import { BankModal } from "../components/BankModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { useGet } from "../hooks/useGet";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";

export const MemberOnboardForm = () => {
  const [errors, setErrors] = useState();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [showPayinModal, setShowPayinModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeTab, setActiveTab] = useState("payin");
  const toast = useToast();
  const [airpayMids, setAirpayMids] = useState([]);

  const [memberFormData, setMemberFormData] = useState({
    name: "",
    mobile_no: "",
    email: "",
    business_mcc: "",
    city: "",
    district: "",
    state: "",
    pin_code: "",
    address: "",
    company_pan_no: "",
    company_gst_no: "",
    cin_llpin: "",
    account_holder_name: "",
    bank_account_no: "",
    ifsc_code: "",
    website_url: "",
    company_type: "",
    date_of_incorporation: "",
    cancel_cheque_doc: null,
    company_pan_no_doc: null,
    company_gst_no_doc: null,
    director_info: [
      {
        director_name: "",
        director_pan_no: "",
        director_aadhar_no: "",
        director_gender: "",
        director_dob: "",
        user_pan_doc: null,
        user_addhar_doc: null,
      },
    ],
    payin_at_onboard: "",
    payout_at_onboard: "",
    scheme_id: "",
  });

const stepRequiredFields = {
  1: [
    "name",
    "mobile_no",
    "email",
    "business_mcc",
    "city",
    "district",
    "state",
    "pin_code",
    "address",
  ],
  2: [
    "company_pan_no",
    "company_gst_no",
    "cin_llpin",
    "account_holder_name",
    "bank_account_no",
    "ifsc_code",
    "website_url",
    "company_type",
    "date_of_incorporation",
    "company_pan_no_doc",   // add file here
    "company_gst_no_doc",   // add file here
    "cancel_cheque_doc",    // add file here
  ],
  3: [
    "director_name",
    "director_pan_no",
    "director_aadhar_no",
    "director_gender",
    "director_dob",
    "user_pan_doc",     // add director files here if required
    "user_addhar_doc",
  ],
  4: ["payin_at_onboard", "payout_at_onboard", "scheme_id"],
};


  const navigate = useNavigate();

  const { data: payoutBanks, refetch: refetchPayout } = useGet(
    "/payoutbanks-List?status=1"
  );
  const {
    data: midCredentials,
    refetch: refetchCredentials,
    isLoading,
  } = useGet("/credentials");

  const { data: payinBanks, refetch: refetchPayin } = useGet(
    "/payinbanks-List?status=1"
  );
  const { data: schemes, refetch: refetchScheme } = useGet("/get-scheme");

  const { execute: executeMember } = usePost("/onboard-merchant");

  const handleSchemeModal = () => {
    setShowSchemeModal(!showSchemeModal);
  };

  const handlePayoutModal = () => {
    setShowPayoutModal(!showPayoutModal);
    setActiveTab("payout");
  };

  const handlePayinModal = () => {
    setShowPayinModal(!showPayinModal);
    setActiveTab("payin");
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = () => {  
    const requiredFields = stepRequiredFields[currentStep];
    const newErrors = {};

    if (currentStep === 3) {
      memberFormData.director_info.forEach((director, idx) => {
        requiredFields.forEach((field) => {
          if (!director[field] || director[field].trim() === "") {
            if (!newErrors.director) newErrors.director = [];
            newErrors.director[idx] = {
              ...newErrors.director[idx],
              [field]: "This field is required",
            };
          }
        });
      });
    } else {
      requiredFields.forEach((field) => {
        let value;

        value = memberFormData[field];

        if (!value || value === "") {
          newErrors[field] = `This field is required`;
        }
      });
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // true if no errors
  };

  const handleNext = () => {
    // if (validateStep()) {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
    // }
  };
  useEffect(() => {
    if (memberFormData.payin_at_onboard !== "Airpay") return; // only run for Airpay
    if (isLoading) return; // wait for API
    const credentialsData = midCredentials?.data || [];
    if (credentialsData.length > 0) {
      setAirpayMids(credentialsData);
      console.log("✅ credentials loaded:", credentialsData);
    } else {
      console.warn("⚠️ no credentials found yet");
      setAirpayMids([]);
    }
  }, [memberFormData.payin_at_onboard, midCredentials, isLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert credentials_id to integer
    const newValue =
      name === "credentials_id" ? parseInt(value, 10) || "" : value;

    if (name === "payin_at_onboard" && value === "Airpay") {
      refetchCredentials();
    }

    setMemberFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

const handleDirectorChange = (index, e) => {
  const { name, value, files } = e.target;
  setMemberFormData((prev) => {
    const updatedDirectors = [...prev.director_info];
    updatedDirectors[index] = {
      ...updatedDirectors[index],
      [name]: files ? files[0] : value,
    };
    return { ...prev, director_info: updatedDirectors };
  });
  console.log(`Director ${index} ${name}:`, files ? files[0] : value);
};


  const addDirector = () => {
    setMemberFormData((prev) => ({
      ...prev,
      director_info: [
        ...prev.director_info,
        {
          director_name: "",
          director_gender: "",
          director_pan_no: "",
         
          director_aadhar_no: "",
          user_pan_doc: null,
          user_addhar_doc: null,
          director_dob: "",
        },
      ],
    }));
  };

  const removeDirector = (index) => {
    setMemberFormData((prev) => ({
      ...prev,
      director_info: prev.director_info.filter((_, i) => i !== index),
    }));
  };
const handleCompanyFileChange = (e) => {
  const { name, files } = e.target;
  setMemberFormData((prev) => ({
    ...prev,
    [name]: files?.[0] || null, // only keep real file
  }));
  console.log(name, files?.[0]); // verify
};

const handleDirectorFileChange = (index, e) => {
  const { name, files } = e.target;
  setMemberFormData((prev) => {
    const updatedDirectors = [...prev.director_info];
    updatedDirectors[index][name] = files?.[0] || null;
    return { ...prev, director_info: updatedDirectors };
  });
  console.log(`Director ${index} ${name}`, files?.[0]);
};


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateStep()) return;

  try {
    const formData = new FormData();

    console.log("===== Form Submission Start =====");

    // Append text fields (excluding files and directors)
    Object.keys(memberFormData).forEach((key) => {
      if (!["director_info", "company_pan_no_doc", "company_gst_no_doc", "cancel_cheque_doc"].includes(key)) {
        formData.append(key, memberFormData[key]);
        console.log(`[Text] ${key}:`, memberFormData[key]);
      }
    });

    // Append company files
    ["company_pan_no_doc", "company_gst_no_doc", "cancel_cheque_doc"].forEach((fileKey) => {
      if (memberFormData[fileKey] instanceof File) {
        formData.append(fileKey, memberFormData[fileKey]);
        console.log(`[File] ${fileKey}:`, memberFormData[fileKey].name);
      }
    });

    // Append directors correctly
    memberFormData.director_info.forEach((director, idx) => {
      Object.keys(director).forEach((field) => {
        const value = director[field];
        if (value instanceof File) {
          formData.append(`director_info[${idx}][${field}]`, value);
          console.log(`[File] director_info[${idx}][${field}]:`, value.name);
        } else {
          formData.append(`director_info[${idx}][${field}]`, value);
          console.log(`[Text] director_info[${idx}][${field}]:`, value);
        }
      });
    });

    console.log("===== Form Submission End =====");

    await executeMember(formData);
    toast.success("Form submitted successfully!");
    navigate("/member-list");

  } catch (err) {
    const errors = err?.response?.data?.errors;
    const msg = errors
      ? Object.values(errors)[0][0]
      : err?.response?.data?.message || "Something went wrong";
    toast.error(msg);
  }
};


  return (
    <>
      <div className="bg-gradient-to-t from-[#b58351] to-[#b6916d]  flex justify-between items-center mb-3 p-2.5">
        <h4 className="font-bold text-white text-lg py-2">
          Add New Merchant Details
        </h4>
      </div>

      <Stepper currentStep={currentStep} />

      <form onSubmit={handleSubmit} encType="multipart/form-data">
     {currentStep === 1 && (
  <div className="grid gap-6 mb-6 md:grid-cols-1">
    {/* Box Layout Wrapper */}
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Merchant Info</h2>
      <div className="grid gap-6 md:grid-cols-2">

        {/* Business Name */}
        <div className="relative">
          <input
            type="text"
            name="name"
            id="floating_outlined_name"
            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 appearance-none peer ${
              errors?.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder=""
            value={memberFormData.name}
            onChange={handleChange}
          />
          <label
            htmlFor="floating_outlined_name"
            className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
              errors?.name
                ? "peer-focus:text-red-600"
                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
            }`}
          >
            Business Name <span className="text-red-600">*</span>
          </label>
          {errors?.name && (
            <span className="mt-1 text-sm text-red-500">{errors?.name}</span>
          )}
        </div>

        {/* Business Mobile */}
        <div className="relative">
          <input
            type="number"
            name="mobile_no"
            id="floating_outlined_mobile"
            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 appearance-none peer ${
              errors?.mobile_no ? "border-red-500" : "border-gray-300"
            }`}
            placeholder=""
            value={memberFormData.mobile_no}
            onChange={handleChange}
          />
          <label
            htmlFor="floating_outlined_mobile"
            className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
              errors?.mobile_no
                ? "peer-focus:text-red-600"
                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
            }`}
          >
            Business Mobile <span className="text-red-600">*</span>
          </label>
          {errors?.mobile_no && (
            <span className="text-sm text-red-500">{errors?.mobile_no}</span>
          )}
        </div>

        {/* Business Email */}
        <div className="relative">
          <input
            type="email"
            name="email"
            id="floating_outlined_email"
            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
              errors?.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder=""
            value={memberFormData.email}
            onChange={handleChange}
          />
          <label
            htmlFor="floating_outlined_email"
            className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
              errors?.email
                ? "peer-focus:text-red-600"
                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
            }`}
          >
            Business Email <span className="text-red-600">*</span>
          </label>
          {errors?.email && (
            <span className="text-sm text-red-500">{errors?.email}</span>
          )}
        </div>

        {/* Business MCC */}
        <div className="relative">
          <input
            type="number"
            name="business_mcc"
            id="floating_outlined_mcc"
            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
              errors?.business_mcc ? "border-red-500" : "border-gray-300"
            }`}
            placeholder=""
            value={memberFormData.business_mcc}
            onChange={handleChange}
          />
          <label
            htmlFor="floating_outlined_mcc"
            className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
              errors?.business_mcc
                ? "peer-focus:text-red-600"
                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
            }`}
          >
            Business MCC <span className="text-red-600">*</span>
          </label>
          {errors?.business_mcc && (
            <span className="text-sm text-red-500">{errors?.business_mcc}</span>
          )}
        </div>

        {/* City */}
        <div className="relative">
          <input
            type="text"
            name="city"
            id="floating_outlined_city"
            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
              errors?.city ? "border-red-500" : "border-gray-300"
            }`}
            placeholder=""
            value={memberFormData.city}
            onChange={handleChange}
          />
          <label
            htmlFor="floating_outlined_city"
            className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
              errors?.city
                ? "peer-focus:text-red-600"
                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
            }`}
          >
            City <span className="text-red-600">*</span>
          </label>
          {errors?.city && (
            <span className="text-sm text-red-500">{errors?.city}</span>
          )}
        </div>

        {/* State */}
        <div className="relative">
          <input
            type="text"
            name="state"
            id="floating_outlined_state"
            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
              errors?.state ? "border-red-500" : "border-gray-300"
            }`}
            placeholder=""
            value={memberFormData.state}
            onChange={handleChange}
          />
          <label
            htmlFor="floating_outlined_state"
            className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
              errors?.state
                ? "peer-focus:text-red-600"
                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
            }`}
          >
            State <span className="text-red-600">*</span>
          </label>
          {errors?.state && (
            <span className="text-sm text-red-500">{errors?.state}</span>
          )}
        </div>

        {/* District */}
        <div className="relative">
          <input
            type="text"
            name="district"
            id="floating_outlined_district"
            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
              errors?.district ? "border-red-500" : "border-gray-300"
            }`}
            placeholder=""
            value={memberFormData.district}
            onChange={handleChange}
          />
          <label
            htmlFor="floating_outlined_district"
            className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
              errors?.district
                ? "peer-focus:text-red-600"
                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
            }`}
          >
            District <span className="text-red-600">*</span>
          </label>
          {errors?.district && (
            <span className="text-sm text-red-500">{errors?.district}</span>
          )}
        </div>

        {/* Pincode */}
        <div className="relative">
          <input
            type="number"
            name="pin_code"
            id="floating_outlined_pin"
            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
              errors?.pin_code ? "border-red-500" : "border-gray-300"
            }`}
            placeholder=""
            value={memberFormData.pin_code}
            onChange={handleChange}
          />
          <label
            htmlFor="floating_outlined_pin"
            className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
              errors?.pin_code
                ? "peer-focus:text-red-600"
                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
            }`}
          >
            Pincode <span className="text-red-600">*</span>
          </label>
          {errors?.pin_code && (
            <span className="text-sm text-red-500">{errors?.pin_code}</span>
          )}
        </div>

        {/* Address */}
        <div className="relative md:col-span-2">
          <input
            type="text"
            name="address"
            id="floating_outlined_address"
            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
              errors?.address ? "border-red-500" : "border-gray-300"
            }`}
            placeholder=""
            value={memberFormData.address}
            onChange={handleChange}
          />
          <label
            htmlFor="floating_outlined_address"
            className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
              errors?.address
                ? "peer-focus:text-red-600"
                : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4"
            }`}
          >
            Address <span className="text-red-600">*</span>
          </label>
          {errors?.address && (
            <span className="text-sm text-red-500">{errors?.address}</span>
          )}
        </div>

      </div>
    </div>
  </div>
)}


        {currentStep === 2 && (
          <div className="grid gap-6 mb-5 md:grid-cols-2">
            <div className="relative">
              <input
                type="text"
                name="company_pan_no"
                id="floating_outlined_pan"
                className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
                  errors?.company_pan_no ? "border-red-500" : "border-gray-300"
                }`}
                placeholder=""
                value={memberFormData.company_pan_no}
                onChange={handleChange}
              />
              <label
                for="floating_outlined_pan"
                className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                  errors?.company_pan_no
                    ? "peer-focus:text-red-600"
                    : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                }`}
              >
                Company Pan Number <span className="text-red-600">*</span>
              </label>
              {errors?.company_pan_no && (
                <span className="text-sm text-red-500">
                  {errors?.company_pan_no}
                </span>
              )}
            </div>
      <div className="relative">
 <input type="file" name="company_pan_no_doc" className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer" onChange={handleCompanyFileChange} />

  <label
    htmlFor="floating_outlined_pan_doc"
    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
  >
    Document Of Pan Card <span className="text-red-600">*</span>
  </label>
</div>
            <div className="relative">
              <input
                type="text"
                name="company_gst_no"
                id="floating_outlined_gst"
                className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
                  errors?.company_gst_no ? "border-red-500" : "border-gray-300"
                }`}
                value={memberFormData.company_gst_no}
                onChange={handleChange}
                placeholder=""
              />
              <label
                for="floating_outlined_gst"
                className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                  errors?.company_gst_no
                    ? "peer-focus:text-red-600"
                    : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                }`}
              >
                GST Number <span className="text-red-600">*</span>
              </label>
              {errors?.company_gst_no && (
                <span className="text-sm text-red-500">
                  {errors?.company_gst_no}
                </span>
              )}
            </div>
            <div className="relative">
<input type="file" name="company_gst_no_doc" className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer" onChange={handleCompanyFileChange} />



              <label
                for="floating_outlined_gst_doc"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              >
                Document Of GST Number <span className="text-red-600">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                name="cin_llpin"
                id="floating_outlined_cin"
                className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
                  errors?.cin_llpin ? "border-red-500" : "border-gray-300"
                }`}
                value={memberFormData.cin_llpin}
                onChange={handleChange}
                placeholder=""
              />
              <label
                for="floating_outlined_cin"
                className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                  errors?.cin_llpin
                    ? "peer-focus:text-red-600"
                    : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                }`}
              >
                CIN Number <span className="text-red-600">*</span>
              </label>
              {errors?.cin_llpin && (
                <span className="text-sm text-red-500">
                  {errors?.cin_llpin}
                </span>
              )}
            </div>
            <div className="relative">
              <label
                for="company_type"
                className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                  errors?.company_type
                    ? "peer-focus:text-red-600"
                    : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                }`}
              >
                Company Type <span className="text-red-600">*</span>
              </label>
              <select
                id="company_type"
                name="company_type"
                onChange={handleChange}
                value={memberFormData.company_type}
                className={`bg-gray-50 border  text-gray-900 text-sm rounded-lg w-full p-2.5 ${
                  errors?.company_type ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option selected>Choose company type</option>
                <option value="proprietary">Proprietary</option>
                <option value="partnership">Partnership</option>
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="llp">LLP</option>
                <option value="society">Society</option>
                <option value="trust">Trust</option>
                <option value="government">Government</option>
                <option value="huf">HUF</option>
                <option value="boi">BOI</option>
                <option value="aop">AOP</option>
                <option value="ajp">AJP</option>
              </select>
              {errors?.company_type && (
                <span className="text-sm text-red-500">
                  {errors?.company_type}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="date"
                name="date_of_incorporation"
                id="floating_outlined_date"
                className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
                  errors?.date_of_incorporation
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                value={memberFormData.date_of_incorporation}
                onChange={handleChange}
                placeholder=""
              />
              <label
                for="floating_outlined_date"
                className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                  errors?.date_of_incorporation
                    ? "peer-focus:text-red-600"
                    : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                }`}
              >
                Date Of Incorporation <span className="text-red-600">*</span>
              </label>
              {errors?.date_of_incorporation && (
                <span className="text-sm text-red-500">
                  {errors?.date_of_incorporation}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                name="account_holder_name"
                id="floating_outlined_account_holder_name"
                className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
                  errors?.account_holder_name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                value={memberFormData.account_holder_name}
                onChange={handleChange}
                placeholder=""
              />
              <label
                for="floating_outlined_account_holder_name"
                className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                  errors?.account_holder_name
                    ? "peer-focus:text-red-600"
                    : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                }`}
              >
                Account Holder Name <span className="text-red-600">*</span>
              </label>
              {errors?.account_holder_name && (
                <span className="text-sm text-red-500">
                  {errors?.account_holder_name}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                name="bank_account_no"
                id="floating_outlined_account_number"
                className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
                  errors?.bank_account_no ? "border-red-500" : "border-gray-300"
                }`}
                value={memberFormData.bank_account_no}
                onChange={handleChange}
                placeholder=""
              />
              <label
                for="floating_outlined_account_number"
                className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                  errors?.bank_account_no
                    ? "peer-focus:text-red-600"
                    : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                }`}
              >
                Bank Account Number <span className="text-red-600">*</span>
              </label>
              {errors?.bank_account_no && (
                <span className="text-sm text-red-500">
                  {errors?.bank_account_no}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                name="ifsc_code"
                id="floating_outlined_ifsc"
                className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
                  errors?.ifsc_code ? "border-red-500" : "border-gray-300"
                }`}
                value={memberFormData.ifsc_code}
                onChange={handleChange}
                placeholder=""
              />
              <label
                for="floating_outlined_ifsc"
                className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                  errors?.ifsc_code
                    ? "peer-focus:text-red-600"
                    : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                }`}
              >
                IFSC Code <span className="text-red-600">*</span>
              </label>
              {errors?.ifsc_code && (
                <span className="text-sm text-red-500">
                  {errors?.ifsc_code}
                </span>
              )}
            </div>
            <div className="relative">
<input type="file" name="cancel_cheque_doc" className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer" onChange={handleCompanyFileChange} />


              <label
                for="floating_outlined_cancel_doc"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              >
                Document Of Cancel Cheque{" "}
                <span className="text-red-600">*</span>
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                name="website_url"
                id="floating_outlined_web"
                className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
                  errors?.website_url ? "border-red-500" : "border-gray-300"
                }`}
                value={memberFormData.website_url}
                onChange={handleChange}
                placeholder=""
              />
              <label
                for="floating_outlined_web"
                className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                  errors?.website_url
                    ? "peer-focus:text-red-600"
                    : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                }`}
              >
                Website Url <span className="text-red-600">*</span>
              </label>
              {errors?.website_url && (
                <span className="text-sm text-red-500">
                  {errors?.website_url}
                </span>
              )}
            </div>
          </div>
        )}

        {currentStep === 3 &&
          memberFormData.director_info.map((director, index) => (
            <div key={index} className="grid gap-6 mb-6 md:grid-cols-2">
              <div className="relative">
                <input
                  type="text"
                  id="floating_outlined_director_name"
                  name="director_name"
                  className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
                    errors?.director?.[index]?.director_name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={director.director_name}
                  onChange={(e) => handleDirectorChange(index, e)}
                  placeholder=""
                  required
                />
                <label
                  for="floating_outlined_director_name"
                  className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                    errors?.director?.[index]?.director_name
                      ? "peer-focus:text-red-600"
                      : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                  }`}
                >
                  Name <span className="text-red-600">*</span>
                </label>
                {errors?.director?.[index]?.director_name && (
                  <span className="text-sm text-red-500">
                    {errors?.director?.[index]?.director_name}
                  </span>
                )}
              </div>
              <div className="relative">
                <label
                  for="default"
                  className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                    errors?.director?.[index]?.director_gender
                      ? "peer-focus:text-red-600"
                      : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                  }`}
                >
                  Gender
                </label>
                <select
                  id="default"
                  name="director_gender"
                  className={`bg-gray-50 border text-gray-900 text-sm rounded-lg w-full p-2.5 ${
                    errors?.director?.[index]?.director_gender
                      ? "border-red-500"
                      : " border-gray-300"
                  }`}
                  value={director.director_gender}
                  onChange={(e) => handleDirectorChange(index, e)}
                  required
                >
                  <option selected>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors?.director?.[index]?.director_gender && (
                  <span className="text-sm text-red-500">
                    {errors?.director?.[index]?.director_gender}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  id="floating_outlined_director_pan"
                  name="director_pan_no"
                  value={director.director_pan_no}
                  onChange={(e) => handleDirectorChange(index, e)}
                  className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
                    errors?.director?.[index]?.director_pan_no
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder=""
                  required
                />
                <label
                  for="floating_outlined_director_pan"
                  className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                    errors?.director?.[index]?.director_pan_no
                      ? "peer-focus:text-red-600"
                      : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                  }`}
                >
                  Pan Number <span className="text-red-600">*</span>
                </label>
                {errors?.director?.[index]?.director_pan_no && (
                  <span className="text-sm text-red-500">
                    {errors?.director?.[index]?.director_pan_no}
                  </span>
                )}
              </div>
              <div className="relative">
<input
      type="file"
      name="user_pan_doc"
      className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer"
      onChange={(e) => handleDirectorFileChange(index, e)}
    />



                <label
                  for="floating_outlined_director_pan_doc"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Document Of Pan Card <span className="text-red-600">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  id="floating_outlined_director_aadhar_no"
                  name="director_aadhar_no"
                  value={director.director_aadhar_no}
                  onChange={(e) => handleDirectorChange(index, e)}
                  className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
                    errors?.director?.[index]?.director_aadhar_no
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder=""
                  required
                />
                <label
                  for="floating_outlined_director_aadhar_no"
                  className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                    errors?.director?.[index]?.director_aadhar_no
                      ? "peer-focus:text-red-600"
                      : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                  }`}
                >
                  Aadhar Number <span className="text-red-600">*</span>
                </label>
                {errors?.director?.[index]?.director_aadhar_no && (
                  <span className="text-sm text-red-500">
                    {errors?.director?.[index]?.director_aadhar_no}
                  </span>
                )}
              </div>
              <div className="relative">
    <input
      type="file"
      name="user_addhar_doc"
      className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer"
      onChange={(e) => handleDirectorFileChange(index, e)}
    />

                <label
                  for="floating_outlined_director_aadhar_doc"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                >
                  Document Of Aadhar Card{" "}
                  <span className="text-red-600">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="date"
                  id="floating_outlined_director_dob"
                  name="director_dob"
                  value={director.director_dob}
                  onChange={(e) => handleDirectorChange(index, e)}
                  className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none peer ${
                    errors?.director?.[index]?.director_dob
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder=""
                  required
                />
                <label
                  for="floating_outlined_director_dob"
                  className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                    errors?.director?.[index]?.director_dob
                      ? "peer-focus:text-red-600"
                      : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                  }`}
                >
                  DOB <span className="text-red-600">*</span>
                </label>
                {errors?.director?.[index]?.director_dob && (
                  <span className="text-sm text-red-500">
                    {errors?.director?.[index]?.director_dob}
                  </span>
                )}
              </div>
              <div>
                <Button
                  type="button"
                  onClick={() => removeDirector(index)}
                  className="text-red-800 p-3 rounded-xl cursor-pointer"
                >
                  <i class="fa-solid fa-trash fa-lg"></i>
                </Button>
              </div>
            </div>
          ))}

        {currentStep === 4 && (
          <div className="grid gap-6 mb-6 md:grid-cols-2 p-5">
            <div className="flex items-center gap-2 mb-4">
              {/* <div className="flex gap-3 items-start"> */}
              {/* 🏦 Bank Select */}
              <div className="relative flex-1">
                <label
                  htmlFor="payin_at_onboard"
                  className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                    errors?.payin_at_onboard
                      ? "peer-focus:text-red-600"
                      : "peer-focus:text-blue-600"
                  }`}
                >
                  Payin at Onboard
                </label>

                <select
                  id="payin_at_onboard"
                  name="payin_at_onboard"
                  className={`bg-gray-50 border text-gray-900 text-sm rounded-lg w-full p-2.5 ${
                    errors?.payin_at_onboard
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={memberFormData.payin_at_onboard}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Bank</option>
                  {payinBanks?.data.map((item) => (
                    <option key={item.id} value={item.onboard_payin_bank}>
                      {item.onboard_payin_bank}
                    </option>
                  ))}
                </select>

                {errors?.payin_at_onboard && (
                  <span className="text-sm text-red-500">
                    {errors?.payin_at_onboard}
                  </span>
                )}
              </div>
              <Button
                type="button"
                className="cursor-pointer text-white font-medium rounded-full w-10 h-10 text-lg flex items-center justify-center bg-[#b58351] hover:bg-blue-800"
                onClick={handlePayinModal}
              >
                +
              </Button>
              {/* 💳 Airpay MID Select — only show when Airpay is selected */}
              {memberFormData.payin_at_onboard === "Airpay" && (
                <div className="relative flex-1">
                  <label
                    htmlFor="airpay_mid"
                    className="absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2"
                  >
                    Airpay MID
                  </label>

                  <select
                    id="airpay_mid"
                    name="credentials_id"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
                    value={memberFormData.airpay_mid}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Airpay MID</option>
                    {airpayMids.map((mid) => (
                      <option key={mid.id} value={mid.id}>
                        {mid.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* </div> */}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <label
                  for="default"
                  className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                    errors?.payout_at_onboard
                      ? "peer-focus:text-red-600"
                      : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                  }`}
                >
                  Payout at Onboard
                </label>
                <select
                  id="default"
                  name="payout_at_onboard"
                  className={`bg-gray-50 border text-gray-900 text-sm rounded-lg w-full p-2.5 ${
                    errors?.payout_at_onboard
                      ? "border-red-500"
                      : " border-gray-300"
                  }`}
                  value={memberFormData.payout_at_onboard}
                  onChange={handleChange}
                  required
                >
                  <option selected>Select Bank</option>
                  {payoutBanks?.data.map((item) => {
                    return (
                      <option key={item.id} value={item.onboard_payout_bank}>
                        {item.onboard_payout_bank}
                      </option>
                    );
                  })}
                </select>
                {errors?.payout_at_onboard && (
                  <span className="text-sm text-red-500">
                    {errors?.payout_at_onboard}
                  </span>
                )}
              </div>

              <Button
                type="button"
                className="cursor-pointer text-white font-medium rounded-full w-10 h-10 text-lg flex items-center justify-center bg-[#b58351] hover:bg-blue-800"
                onClick={handlePayoutModal}
              >
                +
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <label
                  htmlFor="default"
                  className={`absolute text-sm duration-300 text-gray-500 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 ${
                    errors?.scheme_id
                      ? "peer-focus:text-red-600"
                      : "peer-focus:text-blue-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                  }`}
                >
                  Scheme
                </label>
                <select
                  id="default"
                  name="scheme_id"
                  className={`bg-gray-50 border text-gray-900 text-sm rounded-lg w-full p-2.5 ${
                    errors?.scheme_id ? "border-red-500" : " border-gray-300"
                  }`}
                  value={memberFormData.scheme_id}
                  onChange={handleChange}
                >
                  <option value="">Select Scheme</option>
                  {schemes?.data.map((item) => {
                    return (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    );
                  })}
                </select>
                {errors?.scheme_id && (
                  <span className="text-sm text-red-500">
                    {errors?.scheme_id}
                  </span>
                )}
              </div>

              <Button
                type="button"
                className="cursor-pointer text-white font-medium rounded-full w-10 h-10 text-lg flex items-center justify-center bg-[#b58351] hover:bg-blue-800"
                onClick={handleSchemeModal}
              >
                +
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <div>
            <button
              type="button"
              className={`text-white font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center mr-3 ${
                currentStep === 1
                  ? "disabled bg-gray-500 cursor-not-allowed"
                  : "bg-[#b58351] hover:bg-blue-800 cursor-pointer"
              }`}
              onClick={handlePrev}
            >
              &lt; Prev
            </button>

            {currentStep < 4 && (
              <button
                type="button"
                className="cursor-pointer text-white bg-[#615141] hover:bg-blue-800 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                onClick={handleNext}
              >
                Next &gt;
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="submit"
                className="cursor-pointer text-white bg-[#615141] hover:bg-blue-800 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
              >
                Submit
              </button>
            )}
          </div>
          <div className="flex justify-between">
            {currentStep === 3 && (
              <Button
                type="button"
                onClick={addDirector}
                className="cursor-pointer px-4 py-2 mr-2 bg-[#615141] text-white rounded-lg hover:bg-blue-800"
              >
                + Add Director
              </Button>
            )}
            <Button
              onClick={() => setShowConfirmModal(!showConfirmModal)}
              type="button"
              className="cursor-pointer text-white bg-[#615141] hover:bg-blue-800 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
            >
              Go Back
            </Button>
          </div>
        </div>
      </form>

      <SchemeModal
        showModal={showSchemeModal}
        handleModal={handleSchemeModal}
        refreshTable={refetchScheme}
      />

      {activeTab === "payin" ? (
        <BankModal
          showModal={showPayinModal}
          handleModal={handlePayinModal}
          activeTab={activeTab}
          refreshTable={refetchPayin}
        />
      ) : (
        <BankModal
          showModal={showPayoutModal}
          handleModal={handlePayoutModal}
          activeTab={activeTab}
          refreshTable={refetchPayout}
        />
      )}

      <ConfirmModal
        showConfirmModal={showConfirmModal}
        heading={"Are you sure you want to go back?"}
        body={"If you go back then you will lose your filled data in form."}
        handleConfirmModal={setShowConfirmModal}
        action={() => navigate("/member-list")}
      />
    </>
  );
};
