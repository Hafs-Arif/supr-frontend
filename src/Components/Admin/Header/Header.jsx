import React, { useState, useEffect } from "react";
import {
  Bell,
  MessageSquare,
  Search,
  User,
  Settings,
  HelpCircle,
  LogOut, 
  Menu,
  X,
  Building2
} from "lucide-react";
import { useAuth } from '../../../Components/Auth/AuthContext';
import { useNavigate } from 'react-router-dom';

function Header({ toggleSidebar, isSidebarOpen }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 1024);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#004036] text-white shadow-lg z-50">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-white/10 transition-colors"
            >
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
              <Building2 className="text-[#018a3e]" size={18} />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg">Supr Admin</span>
              <span className="block text-xs text-white/80">
                Management System
              </span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search */}
          {/* <div className="hidden sm:block relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-4 pr-10 py-2 bg-white/20 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all w-48 md:w-64"
            />
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70"
            />
          </div> */}

          {/* <button className="sm:hidden p-2 hover:bg-white/10 rounded-full transition">
            <Search size={20} />
          </button> */}

          {/* Notifications */}
          {/* <button className="relative p-2 hover:bg-white/10 rounded-full transition">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button> */}

          {/* Messages */}
          {/* <button className="relative p-2 hover:bg-white/10 rounded-full transition hidden md:block">
            <MessageSquare size={20} />
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              5
            </span>
          </button> */}

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-1 sm:p-2 transition border border-transparent"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <User className="text-indigo-600" size={18} />
              </div>
              <div className="hidden lg:block text-left">
                <span className="font-medium block">{user?.name || 'Admin User'}</span>
                <span className="text-xs text-white/80">{user?.role || 'Admin'}</span>
              </div>
              <span className="hidden lg:block text-sm">
                {isProfileOpen ? "▲" : "▼"}
              </span>
            </button>

            {/* Dropdown */}
            {isProfileOpen && (
              <>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-800">{user?.name || 'Admin User'}</p>
                    <p className="text-sm text-gray-600 truncate">{user?.email || ''}</p>
                  </div>

                  <button
                    onClick={() => { navigate('/admin/manage-admin'); setIsProfileOpen(false); }}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-indigo-50 transition w-full text-left"
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => { navigate('/admin/settings'); setIsProfileOpen(false); }}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-indigo-50 transition w-full text-left"
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => { navigate('/admin/help'); setIsProfileOpen(false); }}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-indigo-50 transition w-full text-left"
                  >
                    <HelpCircle size={18} />
                    <span>Help & Support</span>
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={async () => { setIsProfileOpen(false); await logout(); navigate('/login'); }}
                    className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition w-full text-left"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>

                {/* Overlay */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                ></div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
