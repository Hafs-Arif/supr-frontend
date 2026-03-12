import { useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bike,
  Gift,
  User,
  Bus,
  ShoppingCart,
  MapIcon,
  AlertTriangle,
  MessageCircle,
  ChevronDown,
  User2,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const MENU_ITEMS = [
  { path: "/admin/dashboard",        icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { path: "/admin/orders",           icon: <ShoppingCart size={18} />,    label: "Orders" },
  { path: "/admin/chat",             icon: <MessageCircle size={18} />,   label: "Chat" },
  {
    path: "#", icon: <Bus size={18} />, label: "Services",
    hasDropdown: true, dropdownName: "services",
    dropdownItems: [
      { path: "/admin/all-services", label: "Services" },
      { path: "/admin/all-addons",   label: "AddOns" },
    ],
  },
  {
    path: "#", icon: <User2 size={18} />, label: "Service Provider",
    hasDropdown: true, dropdownName: "providers",
    dropdownItems: [
      { path: "/admin/all-providers", label: "Service Providers" },
    ],
  },
  {
    path: "#", icon: <Bike size={18} />, label: "Users",
    hasDropdown: true, dropdownName: "users",
    dropdownItems: [
      { path: "/admin/all-users", label: "All Users" },
    ],
  },
  {
    path: "#", icon: <MapIcon size={18} />, label: "Zones",
    hasDropdown: true, dropdownName: "zones",
    dropdownItems: [
      { path: "/admin/all-zones", label: "All Zones" },
      { path: "/admin/map-view",  label: "Surge Map" },
    ],
  },
  { path: "/admin/banners-and-offers", icon: <Gift size={18} />, label: "Banners & Offers" },
  {
    path: "#", icon: <MapIcon size={18} />, label: "SOS",
    hasDropdown: true, dropdownName: "sos",
    dropdownItems: [
      { path: "/admin/sos",         label: "SOS List" },
      { path: "/admin/sos/active",  label: "Active SOS" },
      { path: "/admin/sos/trigger", label: "Trigger SOS" },
    ],
  },
  {
    path: "#", icon: <AlertTriangle size={18} />, label: "Fraud Detection",
    hasDropdown: true, dropdownName: "fraud",
    dropdownItems: [
      { path: "/admin/fraud/stats",    label: "Dashboard" },
      { path: "/admin/fraud/patterns", label: "Fraud Patterns" },
    ],
  },
  { path: "/admin/manage-admin", icon: <User size={18} />, label: "Manage Admins" },
];

const ACTIVE_CLS   = "bg-[#018a3e] text-white shadow-md";
const INACTIVE_CLS = "text-gray-300 hover:bg-[#00342C] hover:text-white";

// ─── Dropdown menu item ───────────────────────────────────────────────────────

function DropdownMenuItem({ item, isOpen, isActive, onToggle, onNavClick }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`flex items-center justify-between w-full px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          isActive || isOpen ? ACTIVE_CLS : INACTIVE_CLS
        }`}
      >
        <div className="flex items-center gap-3">
          {item.icon}
          <span>{item.label}</span>
        </div>
        <ChevronDown
          size={15}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {/* Animated dropdown panel */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-1 ml-4 pl-4 border-l border-gray-700 space-y-0.5 py-1">
          {item.dropdownItems.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={onNavClick}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                  isActive
                    ? "text-[#00E27F] bg-[#00342C]/60 border-l-2 border-[#00E27F] -ml-px pl-[11px]"
                    : "text-gray-400 hover:text-white hover:bg-[#00342C]/60"
                }`
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
              {child.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar({ isOpen, closeSidebar }) {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = useCallback((name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }, []);

  const handleNavClick = useCallback(() => {
    if (window.innerWidth < 1024) closeSidebar();
  }, [closeSidebar]);

  const isDropdownActive = useCallback(
    (items) => items.some((item) => location.pathname === item.path),
    [location.pathname]
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Sidebar navigation"
        className={`fixed left-0 w-64 bg-[#00342C] text-white z-50 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ top: 64, height: "calc(100vh - 64px)" }}
      >
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {MENU_ITEMS.map((item) =>
            item.hasDropdown ? (
              <DropdownMenuItem
                key={item.dropdownName}
                item={item}
                isOpen={openDropdown === item.dropdownName}
                isActive={isDropdownActive(item.dropdownItems)}
                onToggle={() => toggleDropdown(item.dropdownName)}
                onNavClick={handleNavClick}
              />
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition ${
                    isActive ? ACTIVE_CLS : INACTIVE_CLS
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 text-center text-xs text-gray-500">
          <div>Version 2.1.0</div>
          <div className="flex justify-center items-center gap-1 text-green-400 mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}