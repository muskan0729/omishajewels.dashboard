import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePost } from "../hooks/usePost";
import paymentGatewayBg from "../images/login-background.jpg";

const MemberUserForm = () => {
  const navigate = useNavigate();
  const { execute: executeMember, loading } = usePost("/onboard-user");
  const [previewFile, setPreviewFile] = useState(null);
  const [previewType, setPreviewType] = useState(""); // image | video

  const [step, setStep] = useState(1);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    name: user.name || "",
    mobile_no: user.mobile_no || "",
    email: user.email || "",
    business_mcc: "",
    company_type: "",
    company_pan_no: "",
    company_gst_no: "",
    cin_llpin: "",
    date_of_incorporation: "",
    website_url: "",
    account_holder_name: "",
    bank_account_no: "",
    ifsc_code: "",
    city: "",
    state: "",
    district: "",
    pin_code: "",
    address: "",
  });

  const [companyDocs, setCompanyDocs] = useState({
    company_pan_no_doc: null,
    company_gst_no_doc: null,
    cancel_cheque_doc: null,
  });

  const [directors, setDirectors] = useState([
    {
      director_name: "",
      director_pan_no: "",
      director_aadhar_no: "",
      director_gender: "",
      director_dob: "",
      user_pan_doc: null,
      user_addhar_doc: null,
    },
  ]);

  const [videoKYC, setVideoKYC] = useState(null);
  const [errors, setErrors] = useState({});

  // --- Regex for basic validation ---
  const phoneRegex = /^[0-9]{10}$/;
  const nameRegex = /^[A-Za-z ]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const textNumberRegex = /^[A-Za-z0-9]+$/;
  const pinnumberRegex = /^[0-9]{6}$/;
  const aadharRegex = /^[0-9]{12}$/;

  // --- Validation per step ---
  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      // Business details + files
      [
        "name",
        "mobile_no",
        "email",
        "business_mcc",
        "company_type",
        "company_pan_no",
        "company_gst_no",
        "cin_llpin",
        "date_of_incorporation",
      ].forEach((f) => {
        const val = formData[f];
        if (!val) newErrors[f] = "This field is Required";
        else {
          if (f === "name" && !nameRegex.test(val))
            newErrors[f] = "Invalid Name";
          if (f === "mobile_no" && !phoneRegex.test(val))
            newErrors[f] = "Invalid Mobile";
          if (f === "email" && !emailRegex.test(val))
            newErrors[f] = "Invalid Email";
          if (f === "business_mcc" && !textNumberRegex.test(val))
            newErrors[f] = "Invalid MCC";
          if (f === "company_pan_no" && !textNumberRegex.test(val))
            newErrors[f] = "Invalid PAN";
          if (f === "company_gst_no" && !textNumberRegex.test(val))
            newErrors[f] = "Invalid GST";
          if (f === "cin_llpin" && !textNumberRegex.test(val))
            newErrors[f] = "Invalid CIN/LLPIN";
        }
      });
      ["company_pan_no_doc", "company_gst_no_doc", "cancel_cheque_doc"].forEach(
        (f) => {
          if (!companyDocs[f]) newErrors[f] = "File required";
        }
      );
    }

    if (currentStep === 2) {
      ["account_holder_name", "bank_account_no"].forEach((f) => {
        if (!formData[f]) newErrors[f] = "Required";
      });
    }

    if (currentStep === 3) {
      ["city", "state", "district", "pin_code", "address"].forEach((f) => {
        const val = formData[f];
        if (!val) newErrors[f] = "Required";
        if (f === "pin_code" && val && !pinnumberRegex.test(val))
          newErrors[f] = "Invalid Pincode";
      });
    }

    if (currentStep === 4) {
      directors.forEach((d, i) => {
        ["director_name", "director_pan_no", "director_aadhar_no"].forEach(
          (f) => {
            const val = d[f];
            if (!val) newErrors[`${f}_${i}`] = "Required";
            if (f === "director_name" && val && !nameRegex.test(val))
              newErrors[`${f}_${i}`] = "Invalid Name";
            if (f === "director_aadhar_no" && val && !aadharRegex.test(val))
              newErrors[`${f}_${i}`] = "Invalid Aadhaar";
          }
        );
        if (!d.user_pan_doc)
          newErrors[`user_pan_doc_${i}`] = "PAN File required";
        if (!d.user_addhar_doc)
          newErrors[`user_addhar_doc_${i}`] = "Aadhaar File required";
      });
    }

    if (currentStep === 5) {
      if (!videoKYC) newErrors.videoKYC = "Video KYC required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((prev) => prev + 1);
  };
  const handlePrev = () => setStep((prev) => prev - 1);

  const handleChange = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));
  const handleFileChange = (key, file) =>
    setCompanyDocs((prev) => ({ ...prev, [key]: file }));
  const handleDirectorChange = (i, key, value) => {
    const updated = [...directors];
    updated[i][key] = value;
    setDirectors(updated);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    const fd = new FormData();
    Object.keys(formData).forEach((k) => fd.append(k, formData[k]));
    Object.keys(companyDocs).forEach(
      (k) => companyDocs[k] && fd.append(k, companyDocs[k])
    );
    directors.forEach((d, i) =>
      Object.entries(d).forEach(
        ([k, v]) => v && fd.append(`director_info[${i}][${k}]`, v)
      )
    );
    if (videoKYC) fd.append("video_kyc", videoKYC);

    const res = await executeMember(fd);
    console.log(res);
    if (res?.status === true) {
      alert("Merchant Registered Successfully.");
      navigate("/merchant-success");
    } else {
      alert("Failed: " + res?.message);
    }
  };

  const stepIndicator = [
    "Business",
    "Bank",
    "Address",
    "Director",
    "Video KYC",
    "Review",
  ];
  const input =
    "w-full px-3 py-3 text-sm bg-white border border-gray-300 rounded-xl text-gray-800 shadow-sm focus:outline-none focus:ring-0 focus:ring-[#C9A23F] focus:border-[#C9A23F]";

  const renderFilePreview = (file) => {
    if (!file) return <span className="text-gray-500">Not uploaded</span>;

    if (file.type?.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          onClick={() => {
            setPreviewFile(file);
            setPreviewType("image");
          }}
          className="w-32 h-24 object-cover rounded border cursor-pointer hover:opacity-80"
        />
      );
    }

    return (
      <span
        className="text-blue-600 text-sm cursor-pointer underline"
        onClick={() => window.open(URL.createObjectURL(file), "_blank")}
      >
        {file.name}
      </span>
    );
  };
  const renderVideoPreview = (file) => {
    if (!file) return <span className="text-gray-500">Not uploaded</span>;

    return (
      <video
        src={URL.createObjectURL(file)}
        onClick={() => {
          setPreviewFile(file);
          setPreviewType("video");
        }}
        className="w-48 rounded border cursor-pointer"
        muted
      />
    );
  };

  return (
    // <div className="mt-10 mb-10 max-w-4xl mx-auto p-8 bg-gradient-to-br from-[#FFF8E1] to-white shadow-2xl rounded-2xl border border-[#E5E7EB]">
    //   <h1 className="text-4xl font-extrabold mb-2 text-center text-[#9E7C19] tracking-wide">
    //     Complete Your KYC
    //   </h1>
    //   <p className="text-center text-gray-600 mb-6">
    //     Verify your business and personal details in a few simple steps
    //   </p>

    <div className="relative min-h-screen flex items-start justify-center py-10">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${paymentGatewayBg})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 w-full px-4">
        {/* ================= CARD ================= */}
        <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-[#FFF8E1] to-white shadow-2xl rounded-2xl border border-[#E5E7EB]">
          {/* Header */}
          <h1 className="text-2xl font-semibold text-center text-[#9E7C19] tracking-wide mb-1">
            Complete Your KYC
          </h1>
          <p className="text-sm text-gray-500 text-center mb-12">
            Verify your business and personal details
          </p>

          {/* Step Indicator */}
          {/* <div className="flex justify-between mb-12">
            {stepIndicator.map((label, index) => (
              <div key={index} className="flex-1">
                <div
                  className={`w-full h-2 rounded-full transition-all duration-300 ${
                    step - 1 >= index
                      ? "bg-gradient-to-r from-[#C9A23F] to-[#9E7C19]"
                      : "bg-gray-200"
                  }`}
                ></div>

                <p className="text-center text-sm mt-1 font-medium text-gray-700">
                  {label}
                </p>
              </div>
            ))}
          </div> */}

          {/* ================= SIGNATURE STEP INDICATOR ================= */}
<div className="mb-12 pl-5 pr-5">

  {/* Step Labels */}
  <div className="flex justify-between text-sm tracking-wide">
    {stepIndicator.map((label, index) => {
      const isActive = step === index + 1;
      const isCompleted = step > index + 1;

      return (
        <div
          key={index}
          className={`
            relative flex-1 text-center pb-4 transition-all duration-300
            ${
              isActive
                ? "text-gray-900 font-semibold"
                : isCompleted
                ? "text-gray-700"
                : "text-gray-400"
            }
          `}
        >
          {label}

          {/* Active Micro Marker */}
          {/* {isActive && (
            <span className="absolute left-1/2 -bottom-1 w-2 h-1.5 rounded-2x2 bg-[#C9A23F] -translate-x-1/2 transition-all duration-500 ease-out" />
          )} */}
        </div>
      );
    })}
  </div>

  {/* Progress Rail */}
  <div className="relative mt-1">
    {/* Base Thin Line */}
    <div className="h-px bg-gray-300" />

    {/* Completed Thick Line */}
    <div
      className="absolute top-0 left-0 h-0.5 bg-[#C9A23F] transition-all duration-500 ease-out"
      style={{
        // width: `${((step - 1) / (stepIndicator.length - 1)) * 100}%`,
        width: `calc(${((step - 1) / (stepIndicator.length - 1)) * 100}% - 20px)`,
      }}
    />
  </div>
</div>


          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#9E7C19] mb-2">
                 Business Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Locked fields from database */}
                {["name", "mobile_no", "email"].map((key, index) => (
                  <div key={index}>
                    <label className="block mb-1 pl-2 font-medium">
                      {key.replace(/_/g, " ")} *
                    </label>
                    <input
                      // className={`${input} bg-gray-100 cursor-not-allowed`}
                      className={`${input} bg-gray-300 text-gray-900 border-gray-300 cursor-not-allowed focus:border-gray-300 `}
                      value={formData[key]}
                      readOnly
                    />
                  </div>
                ))}

                {/* Editable fields */}
                {[
                  "business_mcc",
                  "company_type",
                  "company_pan_no",
                  "company_gst_no",
                  "cin_llpin",
                  "date_of_incorporation",
                  "website_url",
                ].map((key, index) => (
                  <div key={index}>
                    <label className="block mb-1 pl-2 font-medium">
                      {key.replace(/_/g, " ")}{" "}
                      {key !== "website_url" ? "*" : ""}
                    </label>
                    {key === "company_type" ? (
                      <select
                        className={input}
                        value={formData.company_type}
                        onChange={(e) =>
                          handleChange("company_type", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                      </select>
                    ) : key === "date_of_incorporation" ? (
                      <input
                        type="date"
                        className={input}
                        value={formData[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    ) : (
                      <input
                        className={input}
                        value={formData[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    )}
                    {errors[key] && (
                      <p className="text-red-600 text-sm">{errors[key]}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {[
                  "company_pan_no_doc",
                  "company_gst_no_doc",
                  "cancel_cheque_doc",
                ].map((key) => (
                  <div key={key}>
                    <label className="block mb-1 pl-2 font-medium">
                      {key.replace(/_/g, " ").replace("doc", "").trim()} *
                    </label>
                    <input
                      type="file"
                      className={input}
                      onChange={(e) => handleFileChange(key, e.target.files[0])}
                    />
                    {errors[key] && (
                      <p className="text-red-600 text-sm">{errors[key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#9E7C19] mb-2">
                 Bank Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Account_holder_name", "Bank_account_no", "ifsc_code"].map(
                  (key) => (
                    <div key={key}>
                      <label className="block mb-1 pl-2 font-medium">
                        {key.replace(/_/g, " ")}{" "}
                        {key !== "ifsc_code" ? "*" : ""}
                      </label>
                      <input
                        className={input}
                        value={formData[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                      {errors[key] && (
                        <p className="text-red-600 text-sm">{errors[key]}</p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#9E7C19] mb-2">
                 Address Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["City", "State", "District", "Pin_code", "address"].map(
                  (key) => (
                    <div key={key}>
                      <label className="block mb-1 font-medium">
                        {key.replace(/_/g, " ")} *
                      </label>
                      <input
                        className={input}
                        value={formData[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                      {errors[key] && (
                        <p className="text-red-600 text-sm">{errors[key]}</p>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#9E7C19] mb-2">
                 Director Information
              </h2>
              {directors.map((d, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-lg bg-white border border-gray-200 shadow-sm rounded-xl space-y-3"
                >
                  <h3 className="font-semibold text-gray-800">
                    Director {i + 1}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "director_name",
                      "director_pan_no",
                      "director_aadhar_no",
                      "director_gender",
                      "director_dob",
                    ].map((k) => (
                      <div key={k}>
                        {k === "director_gender" ? (
                          <select
                            className={input}
                            value={d[k]}
                            onChange={(e) =>
                              handleDirectorChange(i, k, e.target.value)
                            }
                          >
                            <option value="">Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        ) : k === "director_dob" ? (
                          <input
                            type="date"
                            className={input}
                            value={d[k]}
                            onChange={(e) =>
                              handleDirectorChange(i, k, e.target.value)
                            }
                          />
                        ) : (
                          <input
                            placeholder={k.replace(/_/g, " ")}
                            className={input}
                            value={d[k]}
                            onChange={(e) =>
                              handleDirectorChange(i, k, e.target.value)
                            }
                          />
                        )}
                        {errors[`${k}_${i}`] && (
                          <p className="text-red-600 text-sm">
                            {errors[`${k}_${i}`]}
                          </p>
                        )}
                      </div>
                    ))}
                    {["user_pan_doc", "user_addhar_doc"].map((k) => (
                      <div key={k}>
                        <input
                          type="file"
                          className={input}
                          onChange={(e) =>
                            handleDirectorChange(i, k, e.target.files[0])
                          }
                        />
                        {errors[`${k}_${i}`] && (
                          <p className="text-red-600 text-sm">
                            {errors[`${k}_${i}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setDirectors([
                    ...directors,
                    {
                      director_name: "",
                      director_pan_no: "",
                      director_aadhar_no: "",
                      director_gender: "",
                      director_dob: "",
                      user_pan_doc: null,
                      user_addhar_doc: null,
                    },
                  ])
                }
                className="bg-[#1F2937] hover:bg-black shadow-md text-white px-4 py-2 rounded"
              >
                + Add Director
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[#9E7C19] mb-2">
                🎥 Video KYC
              </h2>

              {/* Instructions */}
              <div className="bg-yellow-50 border-l-4 border-[#9E7C19] p-4 rounded space-y-2">
                <p className="font-medium">
                  Please record a short video following these steps:
                </p>
                <ol className="list-decimal list-inside text-gray-700 space-y-1">
                  <li>
                    Hold your face in front of the camera and clearly say your
                    full name.
                  </li>
                  <li>
                    Show your PAN card to the camera so it is clearly visible.
                  </li>
                  <li>
                    Optionally, show any other required documents if prompted.
                  </li>
                </ol>
                <p className="text-sm text-gray-500">
                  Ensure good lighting and no obstructions for clear
                  verification.
                </p>
              </div>

              {/* File input */}
              <input
                type="file"
                className={input}
                accept="video/*"
                onChange={(e) => setVideoKYC(e.target.files[0])}
              />
              {errors.videoKYC && (
                <p className="text-red-600 text-sm">{errors.videoKYC}</p>
              )}

              {/* Preview */}
              {videoKYC && (
                <video
                  src={URL.createObjectURL(videoKYC)}
                  controls
                  className="w-80 mt-2 rounded border"
                />
              )}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[#9E7C19] mb-4">
                📝 Review Information
              </h2>

              {/* Business Details */}
              <div className="border rounded-lg p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  🏢 Business Details
                </h3>
                <p>
                  <b>Name:</b> {formData.name}
                </p>
                <p>
                  <b>Mobile:</b> {formData.mobile_no}
                </p>
                <p>
                  <b>Email:</b> {formData.email}
                </p>
                <p>
                  <b>Business MCC:</b> {formData.business_mcc}
                </p>
                <p>
                  <b>Company Type:</b> {formData.company_type}
                </p>
                <p>
                  <b>PAN:</b> {formData.company_pan_no}
                </p>
                <p>
                  <b>GST:</b> {formData.company_gst_no}
                </p>
                <p>
                  <b>CIN / LLPIN:</b> {formData.cin_llpin}
                </p>
                <p>
                  <b>Date of Incorporation:</b> {formData.date_of_incorporation}
                </p>
                <p>
                  <b>Website:</b> {formData.website_url || "-"}
                </p>
              </div>

              {/* Bank Details */}
              <div className="border rounded-lg p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  💰 Bank Details
                </h3>
                <p>
                  <b>Account Holder:</b> {formData.account_holder_name}
                </p>
                <p>
                  <b>Account Number:</b> {formData.bank_account_no}
                </p>
                <p>
                  <b>IFSC Code:</b> {formData.ifsc_code || "-"}
                </p>
              </div>

              {/* Address Details */}
              <div className="border rounded-lg p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  📍 Address Details
                </h3>
                <p>
                  <b>City:</b> {formData.city}
                </p>
                <p>
                  <b>State:</b> {formData.state}
                </p>
                <p>
                  <b>District:</b> {formData.district}
                </p>
                <p>
                  <b>Pincode:</b> {formData.pin_code}
                </p>
                <p>
                  <b>Address:</b> {formData.address}
                </p>
              </div>

              {/* Company Documents */}
              <div className="border rounded-lg p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  📄 Company Documents
                </h3>
                <div className="flex gap-6 flex-wrap">
                  <div>
                    <p className="font-medium mb-1">PAN Document</p>
                    {renderFilePreview(companyDocs.company_pan_no_doc)}
                  </div>

                  <div>
                    <p className="font-medium mb-1">GST Document</p>
                    {renderFilePreview(companyDocs.company_gst_no_doc)}
                  </div>

                  <div>
                    <p className="font-medium mb-1">Cancel Cheque</p>
                    {renderFilePreview(companyDocs.cancel_cheque_doc)}
                  </div>
                </div>
              </div>

              {/* Directors */}
              <div className="border rounded-lg p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  👤 Directors
                </h3>

                {directors.map((d, i) => (
                  <div
                    key={i}
                    className="border-l-4 border-[#C9A23F] pl-3 mb-3"
                  >
                    <p>
                      <b>Director {i + 1}</b>
                    </p>
                    <p>Name: {d.director_name}</p>
                    <p>PAN: {d.director_pan_no}</p>
                    <p>Aadhaar: {d.director_aadhar_no}</p>
                    <p>Gender: {d.director_gender || "-"}</p>
                    <p>DOB: {d.director_dob || "-"}</p>
                    <div className="flex gap-6 mt-2 flex-wrap">
                      <div>
                        <p className="font-medium mb-1">PAN Doc</p>
                        {renderFilePreview(d.user_pan_doc)}
                      </div>

                      <div>
                        <p className="font-medium mb-1">Aadhaar Doc</p>
                        {renderFilePreview(d.user_addhar_doc)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Video KYC */}
              <div className="border rounded-lg p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  🎥 Video KYC
                </h3>
                <p>{renderVideoPreview(videoKYC)}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl0 text-[#9E7C19] rounded"
              >
                Previous
              </button>
            )}
            {step < 6 && (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-gradient-to-r from-[#C9A23F] to-[#9E7C19] hover:opacity-90 shadow-md text-white rounded"
              >
                Next
              </button>
            )}
            {step === 6 && (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-[#1F2937] hover:bg-black shadow-md text-white rounded"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
          {/* 🔍 Preview Modal */}
          {previewFile && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-4 max-w-3xl w-full relative">
                {/* ❌ Close Button */}
                <button
                  onClick={() => {
                    setPreviewFile(null);
                    setPreviewType("");
                  }}
                  className="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>

                {/* Preview Content */}
                <div className="flex justify-center items-center">
                  {previewType === "image" && (
                    <img
                      src={URL.createObjectURL(previewFile)}
                      alt="full preview"
                      className="max-h-[80vh] rounded"
                    />
                  )}

                  {previewType === "video" && (
                    <video
                      src={URL.createObjectURL(previewFile)}
                      controls
                      autoPlay
                      className="max-h-[80vh] rounded"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* ================= CARD END ================= */}
      </div>
    </div>
  );
};

export default MemberUserForm;
