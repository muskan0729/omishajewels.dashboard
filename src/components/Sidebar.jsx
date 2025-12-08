import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/sidebar.css";
import Logo from "../images/logo.jpg";

export const Sidebar = ({ open, setOpen }) => {
  const role = atob(localStorage.getItem("role")); // admin / user / crypto
  const [activeDropdown, setActiveDropdown] = useState(null);

  const location = useLocation();
  const currentPath = location.pathname;

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  // -----------------------------------------
  // MENU CONFIG WITH CRYPTO ROLE SUPPORT
  // -----------------------------------------
  const menu = [
    // DASHBOARD (visible to all)
    { label: "Dashboard", icon: "fa-chart-pie", link: "/dashboard" },

    // ---------------------- ADMIN MENUS ----------------------
    ...(role === "admin"
      ? [
          {
            label: "Scheme Manager",
            icon: "fa-money-check",
            dropdown: "scheme",
            items: [{ label: "Scheme", link: "/scheme" }],
          },
          {
            label: "Member",
            icon: "fa-user-group",
            dropdown: "member",
            items: [{ label: "Merchant Onboarding", link: "/member-list" }],
          },
          {
            label: "Fund",
            icon: "fa-piggy-bank",
            dropdown: "fund",
            items: [
              { label: "Load Wallet", link: "/load-wallet" },
              { label: "Payin Settlement", link: "/payin-settlement" },
            ],
          },
          {
            label: "Onboard Bank",
            icon: "fa-building-columns",
            dropdown: "bank",
            items: [{ label: "Bank", link: "/onboard-bank" }],
          },

          // ADMIN transaction history
          {
            label: "Transaction History",
            icon: "fa-clock-rotate-left",
            dropdown: "txn",
            items: [
              { label: "UPI Statement", link: "/upi-statement" },
              { label: "Payout Statement", link: "/payout-statement" },
             
            ],
          },

          // ADMIN account statement
          {
            label: "Account Statement",
            icon: "fa-layer-group",
            dropdown: "account",
            items: [
              { label: "Topup Statement", link: "/topup-statement" },
              { label: "Settlement Payin Statement", link: "/settlement-payin-statement" },
            ],
          },
        ]
      : []),

    // ---------------------- USER MENUS ----------------------
    ...(role === "user"
      ? [
          {
            label: "Payout",
            icon: "fa-credit-card",
            dropdown: "payout",
            items: [{ label: "Request", link: "/payout-request" }],
          },
          {
            label: "Payin",
            icon: "fa-money-bill-transfer",
            dropdown: "payin",
            items: [{ label: "Request", link: "/payin-request" }],
          },
          {
            label: "Transaction History",
            icon: "fa-clock-rotate-left",
            dropdown: "txn",
            items: [
              { label: "UPI Statement", link: "/upi-statement" },
              { label: "Payout Statement", link: "/payout-statement" },
            ],
          },
          {
            label: "Account Statement",
            icon: "fa-layer-group",
            dropdown: "account",
            items: [
              { label: "Topup Statement", link: "/topup-statement" },
              { label: "Settlement Payin Statement", link: "/settlement-payin-statement" },
            ],
          },
          {
            label: "Api Settings",
            icon: "fa-gears",
            dropdown: "api",
            items: [{ label: "Callback & Token", link: "/api-settings" }],
          },
          {
            label: "API Documents",
            icon: "fa-money-check",
            dropdown: "apidoc",
            items: [
              { label: "Payin Documents", link: "/payin-doc" },
              { label: "Payout Documents", link: "/payout-doc" },
            ],
          },
        ]
      : []),

    // ---------------------- CRYPTO ROLE ----------------------
    ...(role === "crypto"
      ? [
          {
            label: "Transaction History",
            icon: "fa-clock-rotate-left",
            dropdown: "txn",
            items: [
              { label: "Crypto Statement", link: "/crypto-statement" },
            ],
          },
        ]
      : []),

    // ---------------------- COMPLAINTS (all roles) ----------------------
    {
      label: "Complaints",
      icon: "fa-comment",
      dropdown: "tickets",
      items: [{ label: "View Complain", link: "/view-complain" }],
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 p-4 flex flex-col
          bg-[#615141] bg-cover bg-no-repeat bg-center bg-blend-soft-light 
          shadow-xl z-40 transform transition-transform duration-300 ease-in-out
          md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button mobile */}
        <button
          className="absolute top-4 right-4 text-2xl md:hidden"
          onClick={() => setOpen(false)}
        >
          <i className="fa-solid fa-xmark text-red-600"></i>
        </button>

        {/* Logo */}
        <div className="flex-shrink-0 p-4 ml-5">
          <div className="ml-6 rounded-full h-24 w-24 bg-white flex items-center justify-center">
            <Link to={"/dashboard"}>
              <img src={Logo} className="w-20" alt="Spay Logo" />
            </Link>
          </div>
        </div>

        {/* MENU LIST */}
        <ul className="space-y-2 font-medium sidebar flex-1 overflow-y-auto custom-scrollbar">
          {menu.map((item, i) => {
            const isParentActive =
              item.items?.some((sub) => sub.link === currentPath) ?? false;

            return (
              <li key={i}>
                {/* SIMPLE MENU */}
                {!item.dropdown ? (
                  <Link
                    to={item.link}
                    className={`flex items-center w-full p-3 rounded-xl transition-all duration-300
                      ${
                        currentPath === item.link
                          ? "bg-[#b58351] text-white shadow-md"
                          : "text-white hover:bg-[#b58351] hover:text-white hover:shadow-md"
                      }`}
                  >
                    <i className={`fa-solid ${item.icon} mr-3`}></i>
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <>
                    {/* DROPDOWN BUTTON */}
                    <button
                      className={`flex items-center w-full p-3 rounded-xl transition-all duration-300
                        ${
                          isParentActive
                            ? "bg-[#b58351] text-white shadow-md"
                            : "text-white hover:bg-[#b58351] hover:text-white hover:shadow-md"
                        }`}
                      onClick={() => toggleDropdown(item.dropdown)}
                    >
                      <i className={`fa-solid ${item.icon} mr-3`}></i>
                      <span>{item.label}</span>

                      <svg
                        className={`w-2.5 h-2.5 ml-auto transition-transform duration-300 ${
                          activeDropdown === item.dropdown ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </button>

                    {/* DROPDOWN MENU */}
                    <div
                      className={`ml-4 mt-1 rounded-lg p-2 transition-all duration-300 ease-in-out overflow-hidden ${
                        activeDropdown === item.dropdown
                          ? "max-h-40 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {item.items.map((sub, j) => {
                        const isActive = currentPath === sub.link;

                        return (
                          <Link key={j} to={sub.link}>
                            <div
                              className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300
                                ${
                                  isActive
                                    ? "bg-[#b58351] text-white shadow-sm scale-[1.01]"
                                    : "bg-transparent text-gray-100 hover:bg-[#b58351] hover:text-white hover:shadow-sm hover:scale-[1.01]"
                                }`}
                            >
                              <i
                                className={`fa-solid fa-circle text-[6px] ${
                                  isActive ? "text-white" : ""
                                }`}
                              ></i>

                              {sub.label}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};
