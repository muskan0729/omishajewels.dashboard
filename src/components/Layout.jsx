import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      {/* Sidebar — visible fixed on desktop, overlay on mobile */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 
        ${sidebarOpen ? "md:ml-64" : "ml-0 md:ml-64"}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Main Body */}
        <main className="flex-1 px-6 py-6 fixed md:relative top-[80px] w-full h-[calc(100vh-80px)] md:h-auto md:static md:overflow-y-visible overflow-y-auto overflow-x-hidden md:overflow-x-visible">
         
            <Outlet />
       
        </main>
      </div>
    </div>
  );
};

export default Layout;
