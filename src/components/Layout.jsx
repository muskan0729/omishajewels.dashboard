import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  // LEFT MAIN SIDEBAR (☰ menu)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // RIGHT PROFILE SIDEBAR (avatar click)
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#FEFCF9]">
      {/* ================= LEFT SIDEBAR ================= */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        profileOpen={profileOpen} // 👈 IMPORTANT (blur control)
      />

      {/* ================= RIGHT PROFILE BACKDROP ================= */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-md"
          onClick={() => setProfileOpen(false)}
        />
      )}

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div
        className={`
          flex flex-col min-h-screen transition-all duration-300
          ${sidebarOpen ? "md:ml-64" : "ml-0 md:ml-64"}
        `}
      >
        {/* ================= HEADER ================= */}
        <div className="sticky top-0 z-20 bg-white">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            profileOpen={profileOpen}
            setProfileOpen={setProfileOpen}
          />
        </div>

        {/* ================= PAGE CONTENT ================= */}
        <main
          className="
            flex-1 px-6 py-6
            fixed md:relative
            top-[80px]
            w-full
            h-[calc(100vh-80px)]
            md:h-auto
            md:static
            overflow-y-auto
            overflow-x-hidden
            md:overflow-visible
            transition-all duration-300
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
