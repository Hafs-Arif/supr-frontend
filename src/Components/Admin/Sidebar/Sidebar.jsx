import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bike,
  Gift,
  User,
  UserPlus,
  ChevronDown,
  ChevronRight,
  User2,
  Bus,
  ShoppingCart,
  MapIcon,
  CreditCard
} from "lucide-react";
import { TrendingUp } from "lucide-react";
import { GiRank1 } from "react-icons/gi";

function Sidebar({ isOpen, toggleSidebar, closeSidebar }) {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { path: "/admin/orders", icon: <ShoppingCart size={18} />, label: "Orders" },
  
    {
      path: "#",
      icon: <Bus size={18} />,
      label: "Services",
      hasDropdown: true,
      dropdownName: "services",
      dropdownItems: [
        { path: "/admin/all-services", label: "Services" },
        { path: "/admin/all-addons", label: "AddOns" },
      ]
    },
    {
      path: "#",
      icon: <User2 size={18} />,
      label: "Service Provider",
      hasDropdown: true,
      dropdownName: "providers",
      dropdownItems: [
        { path: "/admin/all-providers", label: "Service Providers" },
       //  { path: "/admin/pending-verification", label: "Pending Verification" },
      ]
    },
    {
      path: "#",
      icon: <Bike size={18} />,
      label: "Users",
      hasDropdown: true,
      dropdownName: "users",
      dropdownItems: [
        { path: "/admin/all-users", label: "All Users" },
      ]
    },
    // {
    //   path: "#",
    //   icon: <MapIcon size={18} />,
    //   label: "Pricing & Zones",
    //   hasDropdown: true,
    //   dropdownName: "zones",
    //   dropdownItems: [
    //     { path: "/admin/all-zones", label: "All Zones" },
    //     { path: "/admin/map-view", label: "Map View" },
    //     { path: "/admin/create-zone", label: "Create Zone" },
    //   ]
    // },
    // { path: "/admin/payments", icon: <CreditCard size={18} />, label: "Payments" },
    // { path: "/admin/analytics", icon: <GiRank1 size={18} />, label: "Analytics" }, // Fixed spelling
    // { path: "/admin/dashboard/stats", icon: <TrendingUp size={18} />, label: "Admin Stats" },

    { path: "/admin/banners-and-offers", icon: <Gift size={18} />, label: "Banners & Offers" },
    { path: "/admin/manage-admin", icon: <User size={18} />, label: "Manage Admins" },
  ];

  // Check if any dropdown item is active for highlighting parent
  const isDropdownActive = (dropdownItems) => {
    return dropdownItems.some(item => location.pathname === item.path);
  };

  return (
    <div className="">
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-20 left-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out z-50 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ top: '64px', height: 'calc(100vh - 64px)' }}
      >
        <div className="flex flex-col h-full">
          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.hasDropdown ? (
                  <>
                    {/* Dropdown Trigger */}
                    <button
                      onClick={() => toggleDropdown(item.dropdownName)}
                      className={`flex items-center justify-between w-full px-4 py-2 rounded-md text-sm font-medium transition ${
                        isDropdownActive(item.dropdownItems)
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {openDropdown === item.dropdownName ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>

                    {/* Dropdown Content */}
                    {openDropdown === item.dropdownName && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                          <NavLink
                            key={dropdownIndex}
                            to={dropdownItem.path}
                            className={({ isActive }) =>
                              `flex items-center space-x-3 px-4 py-2 rounded-md text-sm font-medium transition ${
                                isActive
                                  ? "bg-indigo-600 text-white shadow-md"
                                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
                              }`
                            }
                            onClick={() => window.innerWidth < 1024 && closeSidebar()}
                          >
                            <span>{dropdownItem.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-2 rounded-md text-sm font-medium transition ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`
                    }
                    onClick={() => window.innerWidth < 1024 && closeSidebar()}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 text-center text-xs text-gray-500">
            <div>Version 2.1.0</div>
            <div className="flex justify-center items-center space-x-1 text-green-400 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Sidebar;