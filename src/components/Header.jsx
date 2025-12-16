import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { usePost } from "../hooks/usePost";
import useAutoFetch from "../hooks/useAutoFetch";
import { useGet } from "../hooks/useGet";
import profile from "../images/2.png";

export const Header = ({ onMenuClick, currentPath: propCurrentPath, role: propRole, onRoleChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = propCurrentPath || location.pathname; // fallback if no prop
  const role = propRole || (typeof window !== "undefined" ? atob(localStorage.getItem("role") || "") : "user");

  const { execute: logout } = usePost("/logout");
  const { data } = useAutoFetch("/collection-record");
  const { data: merchantData } = useGet("/show-merchant");

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [activeStat, setActiveStat] = useState(null);

  const email = localStorage.getItem("email");

  // Show button only for specific email AND only on dashboard page
  const showButton = email === "saad.sayyed@example.com" && currentPath === "/dashboard";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userStats = [
    {
      id: 1,
      icon: "fa-solid fa-arrow-trend-up text-green-400",
      label: "Payin Rolling Amount",
      value: `${Number(data?.PayinRollingAmount ?? 0).toFixed(2)}`,
    },
    {
      id: 2,
      icon: "fa-solid fa-arrow-trend-up text-green-400",
      label: "Payin Total Charges",
      value: `${Number(data?.PayinProfitAmount ?? 0).toFixed(2)}`,
    },
    {
      id: 3,
      icon: "fa-solid fa-wallet text-red-400",
      label: "Payout Wallet",
      value: `${Number(data?.payout_wallet ?? 0).toFixed(2)}`,
    },
    {
      id: 4,
      icon: "fa-solid fa-wallet text-green-400",
      label: "Payin Wallet",
      value: `${Number(data?.PayingAmount ?? 0).toFixed(2)}`,
    },
  ];

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleToggleRole = () => {
    // Toggle between "admin" and "user"
    const newRole = role === "admin" ? "user" : "admin";
    localStorage.setItem("role", btoa(newRole));
    if (onRoleChange) {
      onRoleChange(newRole);
    }
  };

  return (
    <nav className="flex items-center justify-between w-full px-4 py-3 bg-white shadow-lg shadow-[#5d4534]-500/60">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-2xl" aria-label="Toggle menu">
          ☰
        </button>

        {/* Stats */}
        {role !== "admin" && (
          <>
            <div className="hidden md:flex items-center gap-6">
              {userStats.map((item) => (
                <div key={item.id}>
                  <i className={`${item.icon} me-2 fa-lg`}></i>
                  <span>{item.label}: </span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-6 md:hidden relative">
              {userStats.map((item) => (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setActiveStat(item.id)}
                  onMouseLeave={() => setActiveStat(null)}
                >
                  <button
                    onClick={() => setActiveStat(activeStat === item.id ? null : item.id)}
                    className="flex flex-col items-center"
                    aria-label={item.label}
                  >
                    <i className={`${item.icon} fa-xl`}></i>
                  </button>

                  {activeStat === item.id && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-white shadow-lg rounded-lg p-2 text-sm text-gray-700 w-40 text-center z-50">
                      <div>{item.label}</div>
                      <div className="font-semibold">{item.value}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setOpen(!open)} className="flex items-center focus:outline-none" aria-haspopup="true" aria-expanded={open}>
          <img className="w-10 h-10 rounded-full border" src={profile} alt="profile" />
        </button>

        {open && (
          <ul
            className="absolute right-0 mt-3 w-60 shadow-xl/30 z-50 px-4 py-4 rounded-lg"
            style={{ backgroundColor: "#A7B7F1" }}
            role="menu"
          >
            <div className="bg-gray-100 rounded-lg">
              <div className="text-center text-gray-700 py-2">
                <h6 className="font-semibold">{merchantData?.data?.name || "Admin"}</h6>
                <h6 className="text-sm">{merchantData?.data?.email}</h6>
                <hr className="my-2" />
              </div>

              <li>
                <Link to={"/profile"} className="block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded" role="menuitem">
                  Profile
                </Link>
              </li>

              <li>
                <button
                  onClick={handleLogout}
                  className="cursor-pointer block px-4 py-2 text-gray-700 hover:bg-gray-200 rounded w-full text-left"
                  role="menuitem"
                >
                  Logout
                </button>
              </li>
            </div>
          </ul>
        )}
      </div>
    </nav>
  );
};
