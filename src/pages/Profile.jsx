import { useEffect, useState } from "react";
import { useGet } from "../hooks/useGet";
import Button from "../components/Button";
import { useLocation } from "react-router-dom";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";
import ProfileSkeleton from "../components/ProfileSkeleton";

export const Profile = () => {
  const role = atob(localStorage.getItem("role"));
  const toast = useToast();
  const [userData, setUserData] = useState([]);
  const [activeTab, setActiveTab] = useState(
    role === "admin" ? "password" : "profile",
  );

  const [passwordFormData, setPasswordFormData] = useState({
    old_password: "",
    new_password: "",
  });

  const location = useLocation();
  const { id } = location.state || {};

  const apiEndpoint =
    role === "admin" ? `/show-merchant/${id}` : "/show-merchant";
  const { data: merchantData, loading } = useGet(apiEndpoint);

  const initialMerchantData = merchantData?.data;
  useEffect(() => {
    if (!initialMerchantData) return; // prevent crashing

    const formattedData = () => {
      return {
        id: initialMerchantData?.id,
        name: initialMerchantData?.name,
        email: initialMerchantData?.email,
        mobile_no: initialMerchantData?.mobile_no,
        company_type: initialMerchantData?.company_type,
        company_pan_no: initialMerchantData?.company_pan_no,
        company_gst_no: initialMerchantData?.company_gst_no,
        cin_llpin: initialMerchantData?.cin_llpin,
        date_of_incorporation: initialMerchantData?.date_of_incorporation
          ? initialMerchantData.date_of_incorporation.split("T")[0]
          : "",
        account_holder_name: initialMerchantData?.account_holder_name,
        bank_account_no: initialMerchantData?.bank_account_no,
        ifsc_code: initialMerchantData?.ifsc_code,
        address: initialMerchantData?.address,
        city: initialMerchantData?.city,
        district: initialMerchantData?.district,
        state: initialMerchantData?.state,
        pin_code: initialMerchantData?.pin_code,
        director_info: initialMerchantData?.director_info || [],
        website_url: initialMerchantData?.website_url,
      };
    };

    setUserData(formattedData() || []);
  }, [initialMerchantData]);

  //Change Password
  const { execute: changePassword, loading: passwordLoading } =
    usePost("/change-password");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await changePassword(passwordFormData);
      if (res) {
        toast.success("Password Changed Successfully!");
        setPasswordFormData({
          old_password: "",
          new_password: "",
        });
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.message);
    }
  };

  //Update Profile
  const { execute: updateProfile, loading: profileLoading } = usePost(
    `/update-merchant/${userData?.id}`,
  );

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleDirectorChange = (index, e) => {
    const { name, value, files } = e.target;

    setUserData((prev) => {
      const updatedDirectors = [...prev.director_info];

      updatedDirectors[index] = {
        ...updatedDirectors[index],
        [name]: files ? files[0] : value, // handle file inputs
      };

      return {
        ...prev,
        director_info: updatedDirectors,
      };
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile(userData);
      if (res) {
        toast.success("Profile Updated Successfully!");
      }
    } catch (err) {
      toast.error(err?.message);
      console.log(err);
    }
  };

  const tabs = [
    { key: "profile", label: "Profile Info", icon: "fa-user" },
    { key: "director", label: "Directors Info", icon: "fa-people-roof" },
    { key: "company", label: "Company Info", icon: "fa-building" },
    { key: "account", label: "Account Details", icon: "fa-folder-closed" },
    { key: "password", label: "Change Password", icon: "fa-rotate" },
  ];

  const visibleTabs =
    role === "admin" ? tabs.filter((tab) => tab.key === "password") : tabs;

  return (
    <div className="flex min-h-screen bg-[#fefcf9] p-6 lg:p-10 gap-6">
      {/* ================= SIDEBAR ================= */}
      {/* <div className="w-64 rounded-xl bg-white border border-[#CA935C] p-4 shadow-sm"> */}
      <div className="w-64 h-fit self-start rounded-xl bg-white border border-[#CA935C] p-4 shadow-sm">
        <ul className="space-y-2">
          {visibleTabs.map((tab) => (
            <li key={tab.key}>
              <a
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${
                  activeTab === tab.key
                    ? "bg-[#F2DBBC] text-[#3f2a20] font-semibold"
                    : "text-[#5c3d2e] hover:bg-[#FAF3E7]"
                }`}
              >
                <i className={`fa-solid ${tab.icon} text-[#CA935C]`}></i>
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <ProfileSkeleton />
          </div>
        ) : (
          <>
            {role !== "admin" && activeTab === "profile" && (
              <div className="rounded-xl bg-white shadow-sm">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-semibold text-[#3f2a20] border-b border-[#CA935C] pb-2 mb-4">
                    Profile Info
                  </h3>
                  <form>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="text"
                          name="name"
                          id="floating_outlined_name"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                            role !== "admin" ? "bg-gray-100" : ""
                          }`}
                          placeholder=""
                          value={userData?.name}
                          onChange={
                            role === "admin" ? handleInputChange : undefined
                          }
                          disabled={role !== "admin"}
                        />
                        <label
                          htmlFor="floating_outlined_name"
                          className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                            role !== "admin" ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          Name
                        </label>
                      </div>
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="text"
                          name="email"
                          id="floating_outlined_email"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                            role !== "admin" ? "bg-gray-100" : ""
                          }`}
                          placeholder=""
                          value={userData?.email}
                          onChange={
                            role === "admin" ? handleInputChange : undefined
                          }
                          disabled={role !== "admin"}
                        />
                        <label
                          htmlFor="floating_outlined_name"
                          className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                            role !== "admin" ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          Email
                        </label>
                      </div>
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="number"
                          name="mobile_no"
                          id="floating_outlined_mobile_no"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                            role !== "admin" ? "bg-gray-100" : ""
                          }`}
                          placeholder=""
                          value={userData?.mobile_no}
                          onChange={
                            role === "admin" ? handleInputChange : undefined
                          }
                          disabled={role !== "admin"}
                        />
                        <label
                          htmlFor="floating_outlined_mobile_no"
                          className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                            role !== "admin" ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          Phone Number
                        </label>
                      </div>
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="text"
                          name="address"
                          id="floating_outlined_address"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                            role !== "admin" ? "bg-gray-100" : ""
                          }`}
                          placeholder=""
                          value={userData?.address}
                          onChange={
                            role === "admin" ? handleInputChange : undefined
                          }
                          disabled={role !== "admin"}
                        />
                        <label
                          htmlFor="floating_outlined_address"
                          className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                            role !== "admin" ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          Address
                        </label>
                      </div>
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="text"
                          name="city"
                          id="floating_outlined_city"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                            role !== "admin" ? "bg-gray-100" : ""
                          }`}
                          placeholder=""
                          value={userData?.city}
                          onChange={
                            role === "admin" ? handleInputChange : undefined
                          }
                          disabled={role !== "admin"}
                        />
                        <label
                          htmlFor="floating_outlined_city"
                          className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                            role !== "admin" ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          City
                        </label>
                      </div>
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="text"
                          name="district"
                          id="floating_outlined_district"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                            role !== "admin" ? "bg-gray-100" : ""
                          }`}
                          placeholder=""
                          value={userData?.district}
                          onChange={
                            role === "admin" ? handleInputChange : undefined
                          }
                          disabled={role !== "admin"}
                        />
                        <label
                          htmlFor="floating_outlined_district"
                          className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                            role !== "admin" ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          District
                        </label>
                      </div>
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="text"
                          name="state"
                          id="floating_outlined_state"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                            role !== "admin" ? "bg-gray-100" : ""
                          }`}
                          placeholder=""
                          value={userData?.state}
                          onChange={
                            role === "admin" ? handleInputChange : undefined
                          }
                          disabled={role !== "admin"}
                        />
                        <label
                          htmlFor="floating_outlined_state"
                          className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                            role !== "admin" ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          State
                        </label>
                      </div>
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="number"
                          name="pin_code"
                          id="floating_outlined_pin"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                            role !== "admin" ? "bg-gray-100" : ""
                          }`}
                          placeholder=""
                          value={userData?.pin_code}
                          onChange={
                            role === "admin" ? handleInputChange : undefined
                          }
                          disabled={role !== "admin"}
                        />
                        <label
                          htmlFor="floating_outlined_pin"
                          className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                            role !== "admin" ? "bg-gray-100" : "bg-white"
                          }`}
                        >
                          Pin Code
                        </label>
                      </div>
                    </div>
                  </form>
                  {role === "admin" && (
                    <Button
                      type="submit"
                      onClick={handleUpdate}
                      className={`px-5 py-2 rounded-lg cursor-pointer text-white bg-[#615141] hover:bg-gray-700`}
                    >
                      {profileLoading ? "Updating..." : "Update"}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {role !== "admin" && activeTab === "director" && (
              <div className="rounded-xl bg-white shadow-sm">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-semibold text-[#3f2a20] border-b border-[#CA935C] pb-2 mb-4">
                    Directors Info
                  </h3>
                  {userData?.director_info.map((director, index) => (
                    <div key={index}>
                      <h6 className="text-md font-semibold text-gray-900 mb-2">
                        Director {index + 1}
                      </h6>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="relative z-0 w-full mb-2 group">
                          <input
                            type="text"
                            name="director_name"
                            id="floating_outlined_director_name"
                            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                              role !== "admin" ? "bg-gray-100" : ""
                            }`}
                            placeholder=""
                            value={director.director_name}
                            onChange={
                              role === "admin"
                                ? (e) => handleDirectorChange(index, e)
                                : undefined
                            }
                            disabled={role !== "admin"}
                          />
                          <label
                            htmlFor="floating_outlined_director_name"
                            className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                              role !== "admin" ? "bg-gray-100" : "bg-white"
                            }`}
                          >
                            Director Name
                          </label>
                        </div>
                        <div className="relative z-0 w-full mb-2 group">
                          <input
                            type="text"
                            name="director_pan_no"
                            id="floating_outlined_director_pan"
                            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                              role !== "admin" ? "bg-gray-100" : ""
                            }`}
                            placeholder=""
                            value={director.director_pan_no}
                            onChange={
                              role === "admin"
                                ? (e) => handleDirectorChange(index, e)
                                : undefined
                            }
                            disabled={role !== "admin"}
                          />
                          <label
                            htmlFor="floating_outlined_director_pan"
                            className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                              role !== "admin" ? "bg-gray-100" : "bg-white"
                            }`}
                          >
                            Director Pan Number
                          </label>
                        </div>
                        <div className="relative z-0 w-full mb-2 group">
                          <input
                            type="number"
                            name="director_aadhar_no"
                            id="floating_outlined_director_aadhar"
                            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                              role !== "admin" ? "bg-gray-100" : ""
                            }`}
                            placeholder=""
                            value={director.director_aadhar_no}
                            onChange={
                              role === "admin"
                                ? (e) => handleDirectorChange(index, e)
                                : undefined
                            }
                            disabled={role !== "admin"}
                          />
                          <label
                            htmlFor="floating_outlined_director_aadhar"
                            className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                              role !== "admin" ? "bg-gray-100" : "bg-white"
                            }`}
                          >
                            Director Aadhar Number
                          </label>
                        </div>
                        <div className="relative z-0 w-full mb-2 group">
                          <input
                            type="text"
                            name="director_gender"
                            id="floating_outlined_director_gender"
                            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                              role !== "admin" ? "bg-gray-100" : ""
                            }`}
                            placeholder=""
                            value={
                              director.director_gender.charAt(0).toUpperCase() +
                              director.director_gender.slice(1)
                            }
                            onChange={
                              role === "admin"
                                ? (e) => handleDirectorChange(index, e)
                                : undefined
                            }
                            disabled={role !== "admin"}
                          />
                          <label
                            htmlFor="floating_outlined_director_gender"
                            className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                              role !== "admin" ? "bg-gray-100" : "bg-white"
                            }`}
                          >
                            Director Gender
                          </label>
                        </div>
                        <div className="relative z-0 w-full mb-2 group">
                          <input
                            type="date"
                            name="director_dob"
                            id="floating_outlined_director_dob"
                            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                              role !== "admin" ? "bg-gray-100" : ""
                            }`}
                            placeholder=""
                            value={
                              new Date(director.director_dob)
                                .toISOString()
                                .split("T")[0]
                            }
                            onChange={
                              role === "admin"
                                ? (e) => handleDirectorChange(index, e)
                                : undefined
                            }
                            disabled={role !== "admin"}
                          />
                          <label
                            htmlFor="floating_outlined_director_dob"
                            className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                              role !== "admin" ? "bg-gray-100" : "bg-white"
                            }`}
                          >
                            Director DOB
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  {role === "admin" && (
                    <Button
                      type="submit"
                      onClick={handleUpdate}
                      className={`px-5 py-2 rounded-lg cursor-pointer text-white bg-[#615141] hover:bg-gray-700`}
                    >
                      {profileLoading ? "Updating..." : "Update"}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {role !== "admin" && activeTab === "company" && (
              <div className="rounded-xl bg-white shadow-sm">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-semibold text-[#3f2a20] border-b border-[#CA935C] pb-2 mb-4">
                    Company Info
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="relative z-0 w-full mb-2 group">
                      <input
                        type="text"
                        name="company_pan_no"
                        id="floating_outlined_company_pan_no"
                        className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                          role !== "admin" ? "bg-gray-100" : ""
                        }`}
                        placeholder=""
                        value={userData?.company_pan_no}
                        onChange={
                          role === "admin" ? handleInputChange : undefined
                        }
                        disabled={role !== "admin"}
                      />
                      <label
                        htmlFor="floating_outlined_company_pan_no"
                        className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                          role !== "admin" ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        Company Pan Number
                      </label>
                    </div>
                    <div className="relative z-0 w-full mb-2 group">
                      <input
                        type="text"
                        name="company_gst_no"
                        id="floating_outlined_company_gst_no"
                        className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                          role !== "admin" ? "bg-gray-100" : ""
                        }`}
                        placeholder=""
                        value={userData?.company_gst_no}
                        onChange={
                          role === "admin" ? handleInputChange : undefined
                        }
                        disabled={role !== "admin"}
                      />
                      <label
                        htmlFor="floating_outlined_company_gst_no"
                        className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                          role !== "admin" ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        Company GST Number
                      </label>
                    </div>
                    <div className="relative z-0 w-full mb-2 group">
                      <input
                        type="number"
                        name="cin_llpin"
                        id="floating_outlined_cin_llpin"
                        className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                          role !== "admin" ? "bg-gray-100" : ""
                        }`}
                        placeholder=""
                        value={userData?.cin_llpin}
                        onChange={
                          role === "admin" ? handleInputChange : undefined
                        }
                        disabled={role !== "admin"}
                      />
                      <label
                        htmlFor="floating_outlined_cin_llpin"
                        className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                          role !== "admin" ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        CIN Number
                      </label>
                    </div>
                    <div className="relative z-0 w-full mb-2 group">
                      <input
                        type="date"
                        name="date_of_incorporation"
                        id="floating_outlined_date_of_incorporation"
                        className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                          role !== "admin" ? "bg-gray-100" : ""
                        }`}
                        placeholder=""
                        value={userData?.date_of_incorporation}
                        onChange={
                          role === "admin" ? handleInputChange : undefined
                        }
                        disabled={role !== "admin"}
                      />
                      <label
                        htmlFor="floating_outlined_date_of_incorporation"
                        className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                          role !== "admin" ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        Date Of Incorporation
                      </label>
                    </div>
                    <div className="relative z-0 w-full mb-2 group">
                      <input
                        type="text"
                        name="website_url"
                        id="floating_outlined_website_url"
                        className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300 ${
                          role !== "admin" ? "bg-gray-100" : ""
                        }`}
                        placeholder=""
                        value={userData?.website_url}
                        onChange={
                          role === "admin" ? handleInputChange : undefined
                        }
                        disabled={role !== "admin"}
                      />
                      <label
                        htmlFor="floating_outlined_website_url"
                        className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${
                          role !== "admin" ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        Website Url
                      </label>
                    </div>
                  </div>
                  {role === "admin" && (
                    <Button
                      type="submit"
                      onClick={handleUpdate}
                      className={`px-5 py-2 rounded-lg cursor-pointer text-white bg-[#615141] hover:bg-gray-700`}
                    >
                      {profileLoading ? "Updating..." : "Update"}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {role !== "admin" && activeTab === "account" && (
              <>
                <div className="rounded-xl bg-white shadow-sm">
                  <div className="px-6 py-5">
                    <h3 className="text-lg font-semibold text-[#3f2a20] border-b border-[#CA935C] pb-2 mb-4">
                      Account Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="text"
                          name="account_holder_name"
                          id="floating_outlined_account_holder_name"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300`}
                          placeholder=""
                          value={userData?.account_holder_name}
                          onChange={handleInputChange}
                        />
                        <label
                          htmlFor="floating_outlined_account_holder_name"
                          className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 bg-white`}
                        >
                          Account Holder Name
                        </label>
                      </div>
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="text"
                          name="bank_account_no"
                          id="floating_outlined_bank_account_no"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300`}
                          placeholder=""
                          value={userData?.bank_account_no}
                          onChange={handleInputChange}
                        />
                        <label
                          htmlFor="floating_outlined_bank_account_no"
                          className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 bg-white`}
                        >
                          Bank Account Number
                        </label>
                      </div>
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="text"
                          name="ifsc_code"
                          id="floating_outlined_ifsc_code"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300`}
                          placeholder=""
                          value={userData?.ifsc_code}
                          onChange={handleInputChange}
                        />
                        <label
                          htmlFor="floating_outlined_ifsc_code"
                          className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 bg-white`}
                        >
                          IFSC Code
                        </label>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      onClick={handleUpdate}
                      className="cursor-pointer text-white bg-[#615141] hover:bg-gray-700 px-5 py-2 rounded-lg"
                    >
                      {profileLoading ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "password" && (
              <div className="rounded-xl bg-white shadow-sm">
                <div className="px-6 py-5">
                  <h3 className="text-lg font-semibold text-[#3f2a20] border-b border-[#CA935C] pb-2 mb-4">
                    Change Password
                  </h3>
                  <form onSubmit={handleChangePassword}>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="password"
                          name="old_password"
                          id="floating_outlined_old_password"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300`}
                          placeholder=""
                          value={passwordFormData.old_password}
                          onChange={(e) =>
                            setPasswordFormData({
                              ...passwordFormData,
                              [e.target.name]: e.target.value,
                            })
                          }
                        />
                        <label
                          htmlFor="floating_outlined_old_password"
                          className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 bg-white`}
                        >
                          Old Password
                        </label>
                      </div>
                      <div className="relative z-0 w-full mb-2 group">
                        <input
                          type="password"
                          name="new_password"
                          id="floating_outlined_new_password"
                          className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 rounded-lg border-1 appearance-none peer border-gray-300`}
                          placeholder=""
                          value={passwordFormData.new_password}
                          onChange={(e) =>
                            setPasswordFormData({
                              ...passwordFormData,
                              [e.target.name]: e.target.value,
                            })
                          }
                        />
                        <label
                          htmlFor="floating_outlined_new_password"
                          className={`absolute text-sm duration-300 text-gray-600 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:text-gray-600 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 bg-white`}
                        >
                          New Password
                        </label>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="cursor-pointer text-white bg-[#615141] hover:bg-gray-700 px-5 py-2 rounded-lg"
                    >
                      {passwordLoading ? "Changing" : "Change"}
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
