import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { usePost } from "../hooks/usePost";
import useAutoFetch from "../hooks/useAutoFetch";
import { useGet } from "../hooks/useGet";
import profile from "../images/2.png";
import Logo from "../images/logo.png";

export const Header = ({
  onMenuClick,
  currentPath: propCurrentPath,
  role: propRole,
  onRoleChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const currentPath = propCurrentPath || location.pathname;
  const role =
    propRole ||
    (typeof window !== "undefined"
      ? atob(localStorage.getItem("role") || "")
      : "user");

  const { execute: logout } = usePost("/logout");
  const { data } = useAutoFetch("/collection-record");
  const { data: merchantData } = useGet("/show-merchant");

  /* ===== STATE ===== */
  const [open, setOpen] = useState(false); // SIDEBAR STATE
  const [activeStat, setActiveStat] = useState(null);

  const sidebarRef = useRef(null);

  const email = localStorage.getItem("email");
  const showButton =
    email === "saad.sayyed@example.com" && currentPath === "/dashboard";

  /* ===== HEADER STATS (UNCHANGED) ===== */
  const userStats = [
    {
      id: 1,
      icon: "fa-solid fa-arrow-trend-up text-green-400",
      label: "Payin Rolling Amount",
      value: Number(data?.PayinRollingAmount ?? 0).toFixed(2),
    },
    {
      id: 2,
      icon: "fa-solid fa-arrow-trend-up text-green-400",
      label: "Payin Total Charges",
      value: Number(data?.PayinProfitAmount ?? 0).toFixed(2),
    },
    {
      id: 3,
      icon: "fa-solid fa-wallet text-red-400",
      label: "Payout Wallet",
      value: Number(data?.payout_wallet ?? 0).toFixed(2),
    },
    {
      id: 4,
      icon: "fa-solid fa-wallet text-green-400",
      label: "Payin Wallet",
      value: Number(data?.PayingAmount ?? 0).toFixed(2),
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      // ⛔ If logout modal is open → DO NOTHING
      if (showLogoutModal) return;

      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, showLogoutModal]);

  const handleLogout = async () => {
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
    const newRole = role === "admin" ? "user" : "admin";
    localStorage.setItem("role", btoa(newRole));
    onRoleChange?.(newRole);
  };

  return (
    <>
      {/* ================= HEADER (100% OLD LOOK) ================= */}
      <nav className="flex items-center justify-between w-full px-4 py-3 bg-white shadow-lg shadow-[#5d4534]-500/60">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden text-2xl"
            aria-label="Toggle menu"
          >
            ☰
          </button>

          {/* STATS – DESKTOP */}
          {role !== "admin" && (
            <>
              <div className="hidden md:flex items-center gap-6">
                {userStats.map((item) => (
                  <div key={item.id}>
                    <i className={`${item.icon} me-2 fa-lg`} />
                    <span>{item.label}: </span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* STATS – MOBILE ICON MODE */}
              <div className="flex items-center gap-6 md:hidden relative">
                {userStats.map((item) => (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setActiveStat(item.id)}
                    onMouseLeave={() => setActiveStat(null)}
                  >
                    <button
                      onClick={() =>
                        setActiveStat(activeStat === item.id ? null : item.id)
                      }
                      className="flex flex-col items-center"
                      aria-label={item.label}
                    >
                      <i className={`${item.icon} fa-xl`} />
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

        {/* PROFILE → SIDEBAR OPEN */}
        <button onClick={() => setOpen(true)}>
          <img
            className="w-10 h-10 rounded-full border cursor-pointer"
            src={profile}
            alt="profile"
          />
        </button>
      </nav>

      {/* ================= BACKDROP ================= */}
      <div
        className={`fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]
          transition-opacity duration-300 ${
            open && !showLogoutModal
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          }`}
        onClick={() => {
          if (!showLogoutModal) setOpen(false);
        }}
      />
      {/* ================= RIGHT SIDEBAR ================= */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-[260px] z-50
        bg-white border border-gray-200 shadow-2xl
        rounded-l-3xl
        transform transition-transform duration-500 ease-in-out
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Accent strip */}
        <div className="absolute left-0 top-10 h-53 w-[4px] bg-[#cb997e] rounded-r-full" />

        {/* SIDEBAR HEADER */}
        <div
          className="px-6 py-8 border-b border-[#cb997e]/30
          bg-gradient-to-b from-[#cb997e]/15 to-transparent
          rounded-tl-3xl text-center relative"
        >
          {/* CLOSE */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 w-8 h-8
            flex items-center justify-center
            rounded-full border border-gray-300
            text-gray-500 hover:bg-gray-100 transition cursor-pointer"
          >
            ✕
          </button>

          {/* AVATAR */}
          <div
            className="mx-auto w-20 h-20 rounded-full overflow-hidden
            ring-2 ring-[#cb997e]/60
            shadow-lg shadow-[#cb997e]/40
            transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #cb997e 0%, #ddbea9 100%)",
            }}
          >
            <img
              src={profile}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* NAME & EMAIL */}
          <div className="mt-4">
            <p className="text-lg font-bold text-gray-900 tracking-tight">
              {merchantData?.data?.name || "Admin"}
            </p>
            <p className="text-sm text-gray-600 mt-1 truncate max-w-[220px] mx-auto">
              {merchantData?.data?.email}
            </p>
          </div>
        </div>

        {/* SIDEBAR BODY – ENHANCED UI */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* ACTIONS */}
          <div className="px-4 py-5 space-y-3 flex-1 overflow-y-auto">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="group flex items-center justify-between
              px-4 py-3.5 rounded-xl border border-gray-200
              bg-white
              hover:bg-[#cb997e]/10
              hover:border-[#cb997e]
              hover:shadow-sm
              transition"
            >
              <span className="text-sm font-medium text-gray-800">
                {role === "admin" ? "Change Password" : "Profile"}
              </span>
              <span className="text-xs text-gray-400 group-hover:text-[#cb997e]">
                →
              </span>
            </Link>

            {showButton && (
              <button
                onClick={handleToggleRole}
                className="group w-full flex items-center justify-between
                px-4 py-3 rounded-xl border border-gray-200
                bg-white
                hover:bg-[#6b705c]/10
                hover:border-[#6b705c]
                hover:shadow-sm
                transition"
              >
                <span className="text-sm font-medium text-gray-800">
                  Switch Role
                </span>
                <span className="text-xs text-gray-400 group-hover:text-[#6b705c]">
                  →
                </span>
              </button>
            )}
          </div>

          {/* SPACER – 70px like before */}
          <div className="h-[240px] shrink-0 flex items-center justify-center">
            <img
              src={Logo}
              alt="Omisha Jewels"
              className="
                w-200
                opacity-40
                select-none
                pointer-events-none
                -rotate-15
                -translate-x-[-1px]
                -translate-y-[-25px]
                drop-shadow-[0_10px_18px_rgba(203,153,126,0.35)]
              "
            />
          </div>

          {/* DIVIDER */}
          <div className="px-4">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>

          {/* LOGOUT */}
          <div className="px-4 py-4 bg-white shrink-0">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-between
              px-4 py-3 rounded-xl
              border border-red-200
              text-red-600
              bg-red-50
              hover:bg-red-100
              hover:shadow-sm
              transition cursor-pointer"
            >
              <span className="text-sm font-semibold">Logout</span>
              <span className="text-xs">⎋</span>
            </button>
          </div>
        </div>
        <div
          className="mt-13 px-7 py-5 text-center text-xs text-[#3C3C3C]/70
          border-t border-gray-300/40 shrink-0"
        >
          Omisha Jewels OPC Pvt Ltd Dashboard • © 2026
        </div>
      </div>

      {/* ================= LOGOUT CONFIRM MODAL ================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* BACKDROP */}
          <div
            // className="absolute inset-0"
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]
             opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]"
            onClick={() => setShowLogoutModal(false)}
          />

          {/* MODAL */}
          <div
            onClick={(e) => e.stopPropagation()} // 👈 ADD THIS LINE
            className="relative w-[92%] max-w-sm rounded-3xl
            bg-white border border-[#cb997e]/40
            shadow-2xl shadow-[#cb997e]/30
            z-[61] overflow-hidden"
          >
            {/* TOP ACCENT */}
            <div className="h-1 bg-gradient-to-r from-[#cb997e] via-[#ddbea9] to-[#cb997e]" />

            <div className="px-6 py-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                Confirm Logout
              </h3>

              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Are you sure you want to logout?
              </p>

              {/* ACTIONS */}
              <div className="flex gap-3 mt-6">
                {/* CANCEL */}
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl
                  border border-gray-300
                  text-gray-700 cursor-pointer
                  hover:bg-gray-100
                  transition"
                >
                  Cancel
                </button>

                {/* CONFIRM */}
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    handleLogout();
                  }}
                  className="flex-1 py-2.5 rounded-xl
                  bg-gradient-to-r from-[#cb997e] to-[#ddbea9]
                  text-gray-800 font-semibold cursor-pointer
                  hover:opacity-90
                  shadow-md
                  transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
