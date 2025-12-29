import React, { useState } from "react";
import Header from "../../Components/Admin/Header/Header";
import Sidebar from "../../Components/Admin/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for Desktop - Fixed positioning */}
      <div className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] z-30">
        <Sidebar 
          isOpen={true} 
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        <Header 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={sidebarOpen} 
        />

        {/* Scrollable main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 mt-16">
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;