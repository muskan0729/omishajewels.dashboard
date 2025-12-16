import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../images/logo.png";
import "../css/sidebar.css"; // keep your existing css or add below styles here

export const Sidebar = ({ open, setOpen }) => {
  const role = atob(localStorage.getItem("role") || "user");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const location = useLocation();
  const currentPath = location.pathname;

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const menu = [
    { label: "Dashboard", icon: "fa-chart-pie", link: "/dashboard" },

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
        ]
      : []),

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

    ...(role === "crypto"
      ? [
          {
            label: "Transaction History",
            icon: "fa-clock-rotate-left",
            dropdown: "txn",
            items: [{ label: "Crypto Statement", link: "/crypto-statement" }],
          },
        ]
      : []),

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
      className={`fixed inset-0 bg-black/30 z-30 md:hidden transition-opacity duration-300 ${
        open ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={() => setOpen(false)}
    />

    {/* Sidebar */}
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out
      md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* Mobile close button */}
      <button
        className="md:hidden absolute top-4 right-4 text-2xl text-gray-600 hover:text-gray-800"
        onClick={() => setOpen(false)}
        aria-label="Close sidebar"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>

      {/* Logo */}
      <div className="flex justify-start items-center py-6 px-6 border-b border-gray-200 gap-3">
        <div
          className="flex justify-center items-center rounded-full overflow-hidden"
          style={{
            width: 44,
            height: 44,
            boxShadow: "0 0 8px rgba(181,131,81,0.6)",
            userSelect: "none",
          }}
        >
          <img
            src={Logo}
            alt="Logo"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <span
          className="text-xl font-semibold text-[#b58351] select-none"
          style={{ letterSpacing: "0.03em" }}
        >
          Omisha Jewels
        </span>
      </div>

      {/* Menu */}
      <nav
        className="mt-4 flex-1 overflow-y-auto"
        style={{
          paddingLeft: "24px",
          paddingRight: "24px",
          scrollbarWidth: "none",
        }}
      >
        <style>
          {`
            nav::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        <ul className="space-y-3 font-sans text-base text-[#4a3f35]">
          {menu.map((item, i) => {
            // TRUE if this menu link matches currentPath
            const isSimpleActive = currentPath === item.link;

            // TRUE if any submenu item matches currentPath
            const isSubActive = item.items?.some(
              (sub) => currentPath === sub.link
            );

            // TRUE if current menu is active (simple OR dropdown)
            const isMenuActive = isSimpleActive || isSubActive;

            return (
              <li key={i}>
                {/* SIMPLE MENU */}
                {!item.dropdown ? (
                  <Link
                    to={item.link}
                    className={`flex items-center gap-4 py-3 px-4 rounded-lg cursor-pointer
                      ${
                        isMenuActive
                          ? "bg-gradient-to-r from-[#f4e1c1] to-[#e6b35a] text-[#b58351] font-semibold"
                          : "hover:bg-[#f9f4e9] hover:text-[#b58351]"
                      }
                    `}
                  >
                    <i
                      className={`fa-solid ${item.icon} w-6 text-center text-[#b58351]`}
                      style={{ fontSize: "20px" }}
                    ></i>
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <>
                    {/* DROPDOWN BUTTON */}
                    <button
                      onClick={() => toggleDropdown(item.dropdown)}
                      className={`flex items-center gap-4 w-full py-3 px-4 rounded-lg cursor-pointer
                        ${
                          isMenuActive
                            ? "bg-gradient-to-r from-[#f4e1c1] to-[#e6b35a] text-[#b58351] font-semibold"
                            : "hover:bg-[#f9f4e9] hover:text-[#b58351]"
                        }
                      `}
                      aria-expanded={activeDropdown === item.dropdown}
                    >
                      <i
                        className={`fa-solid ${item.icon} w-6 text-center text-[#b58351]`}
                        style={{ fontSize: "20px" }}
                      ></i>
                      <span>{item.label}</span>
                      <i
                        className={`fa-solid fa-chevron-down ml-auto transition-transform duration-300 ${
                          activeDropdown === item.dropdown ? "rotate-180" : ""
                        } text-[#b58351]`}
                      />
                    </button>

                    {/* SUBMENU */}
                    <ul
                      className={`ml-8 mt-2 border-l-2 border-[#e6d8b5] transition-all duration-300 overflow-hidden
                        ${
                          activeDropdown === item.dropdown
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                        }
                      `}
                    >
                      {item.items.map((sub, j) => {
                        const isSubItemActive = currentPath === sub.link;

                        return (
                          <li key={j}>
                            <Link
                              to={sub.link}
                              className={`flex items-center gap-3 py-2 px-4 rounded-md cursor-pointer
                                ${
                                  isSubItemActive
                                    ? "bg-[#f9f4e9] text-[#b58351] font-semibold shadow-inner"
                                    : "hover:bg-[#f9f4e9] hover:text-[#b58351]"
                                }
                              `}
                            >
                              <span className="w-3 h-3 rounded-full bg-[#c5a880] block mt-1"></span>
                              <span>{sub.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  </>
);


};
