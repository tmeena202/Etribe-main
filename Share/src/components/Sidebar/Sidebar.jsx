import React, { useState, useEffect } from "react";
import {
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiBell,
  FiAlertTriangle,
  FiBookOpen,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { getAuthHeaders } from "../../utils/apiHeaders";

// Menu structure
const menuItems = [
  {
    label: "Dashboard",
    icon: <FiGrid size={20} />,
    path: "/dashboard",
    dropdown: false,
  },
  {
    label: "Members Services",
    icon: <FiUsers size={20} />,
    path: "#",
    basePath: "/members-services",
    dropdown: true,
    subItems: [
      { label: "Active Members", path: "/members-services/active" },
      { label: "Pending Approval", path: "/members-services/pending-approval" },
      { label: "Membership Expired", path: "/members-services/expired" },
      { label: "Payment Details", path: "/members-services/payment-details" },
    ],
  },
  {
    label: "Admin Management",
    icon: <FiUserCheck size={20} />,
    path: "#",
    basePath: "/admin-management",
    dropdown: true,
    subItems: [
      { label: "Admin Accounts", path: "/admin-management/accounts" },
      { label: "User Roles", path: "/admin-management/user-roles" },
      { label: "Role Management", path: "/admin-management/role-management" },
    ],
  },
  {
    label: "Event Management",
    icon: <FiCalendar size={20} />,
    path: "#",
    basePath: "/event-management",
    dropdown: true,
    subItems: [
      { label: "Calendar", path: "/calendar" },
      { label: "All Events", path: "/event-management/all" },
      { label: "Upcoming Events", path: "/event-management/upcoming" },
      { label: "Past Events", path: "/event-management/past" },
    ],
  },
  {
    label: "Notification",
    icon: <FiBell size={20} />,
    path: "#",
    basePath: "/notification",
    dropdown: true,
    subItems: [
      { label: "Feedbacks", path: "/notification/feedbacks" },
      { label: "Circulars", path: "/notification/circulars" },
    ],
  },
  {
    label: "Grievances",
    icon: <FiAlertTriangle size={20} />,
    path: "#",
    basePath: "/grievances",
    dropdown: true,
    subItems: [
      { label: "Active", path: "/grievances/active" },
      { label: "Pending", path: "/grievances/pending" },
      { label: "Closed", path: "/grievances/closed" },
    ],
  },
  {
    label: "Important Contacts",
    icon: <FiBookOpen size={20} />,
    path: "/important-contacts",
    dropdown: false,
  },
  {
    label: "Resume",
    icon: <FiFileText size={20} />,
    path: "/resume",
    dropdown: false,
  },
  {
    label: "Master Settings",
    icon: <FiSettings size={20} />,
    path: "#",
    basePath: "/master-settings",
    dropdown: true,
    subItems: [
      { label: "Group Data", path: "/master-settings/group-data" },
      { label: "SMTP Settings", path: "/master-settings/smtp-settings" },
      { label: "Message Settings", path: "/master-settings/message-settings" },
      { label: "User Additional Fields", path: "/master-settings/user-additional-fields" },
      { label: "Company Additional Fields", path: "/master-settings/company-additional-fields" },
      { label: "Membership Plans", path: "/master-settings/membership-plans" },
    ],
  },
];

export default function Sidebar({ className = "", collapsed, setCollapsed }) {
  const [openDropdown, setOpenDropdown] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [signatureUrl, setSignatureUrl] = useState("");

  // Fetch logo URL
  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const token = localStorage.getItem("token");
        const uid = localStorage.getItem("uid");
        if (!token) return;
        const response = await api.post(
          "/groupSettings",
          {},
          {
                      headers: getAuthHeaders(),
          }
        );
        const backendData = response.data?.data || response.data || {};
        if (backendData.signature) {
          setSignatureUrl(
            backendData.signature.startsWith("http")
              ? backendData.signature
              : `https://api.etribes.in/${backendData.signature}`
          );
        }
      } catch {
        setSignatureUrl("");
      }
    };
    fetchSignature();
  }, []);

  // Open the relevant dropdown if inside a nested path
  useEffect(() => {
    const activeItem = menuItems.find((item) =>
      item.subItems?.some((sub) => {
        // Check exact match first
        if (sub.path === location.pathname) return true;
        
        // Special case for member detail pages - they should open "Members Services" dropdown
        if (sub.path === "/members-services/active" && location.pathname.startsWith("/member/")) {
          return true;
        }
        
        return false;
      })
    );
    if (activeItem) {
      setOpenDropdown(activeItem.label);
    }
  }, [location.pathname]);

  return (
    <>
                {/* Mobile/Tablet Toggle Button - Always visible on small, medium, and large screens */}
              <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 dark:bg-gray-700 text-white rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label={mobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={mobileSidebarOpen}
        >
          {mobileSidebarOpen ? (
            <FiChevronLeft size={20} />
          ) : (
            <FiChevronRight size={20} />
          )}
        </button>

      {/* Mobile/Tablet Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`bg-blue-50 dark:bg-gray-800 flex flex-col transition-all duration-200 shadow-lg h-screen max-h-screen ${
          collapsed ? "w-20" : "w-72"
        } hidden lg:flex ${className}`}
      >
      {/* Top bar with logo */}
      <div className="flex items-center gap-3 p-4 border-b border-blue-100 dark:border-gray-700 flex-shrink-0">
        {signatureUrl ? (
          <img
            src={signatureUrl}
            alt="Signature Logo"
            className={`object-contain ${collapsed ? "w-16 h-6" : "w-32 h-8"}`}
          />
        ) : (
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/Etribe-logo.jpg"
              alt="Etribe Logo"
              className={`rounded-lg ${collapsed ? "w-8 h-8" : "w-8 h-8"}`}
            />
            {!collapsed && (
              <span className="text-lg font-bold text-gray-800 dark:text-white">
                Etribe
              </span>
            )}
          </div>
        )}
        <button
          className="ml-auto p-2 bg-blue-600 dark:bg-gray-700 text-white rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <FiChevronRight size={20} />
          ) : (
            <FiChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-2 pt-4 pb-4 overflow-y-auto min-h-0 max-h-full">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isParentActive = item.subItems?.some(
              (sub) => {
                // Check exact match first
                if (location.pathname === sub.path) return true;
                
                // Special case for member detail pages - they should highlight "Active Members"
                if (sub.path === "/members-services/active" && location.pathname.startsWith("/member/")) {
                  return true;
                }
                
                return false;
              }
            );

            if (item.dropdown) {
              return (
                <li key={item.label}>
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === item.label ? "" : item.label
                      )
                    }
                    className={`w-full flex items-center gap-3 px-4 py-2 font-medium text-left whitespace-nowrap rounded-lg transition-colors
                      ${
                        collapsed ? "justify-center" : ""
                      }
                      ${
                        isParentActive
                          ? "text-blue-800 dark:text-blue-300"
                          : "text-gray-500 dark:text-gray-400"
                      } hover:text-blue-900 dark:hover:text-blue-400`}
                  >
                    <span>{item.icon}</span>
                    <span className={`${collapsed ? "hidden" : "flex-1"}`}>
                      {item.label}
                    </span>
                    {!collapsed && (
                      <span className="ml-auto">
                        <FiChevronDown
                          size={20}
                          className={`transition-transform ${
                            openDropdown === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </span>
                    )}
                  </button>
                  {openDropdown === item.label && !collapsed && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((sub) => (
                        <li key={sub.path}>
                          <NavLink
                            to={sub.path}
                            className={({ isActive }) => {
                              // Special case for member detail pages - they should highlight "Active Members"
                              let shouldBeActive = isActive;
                              if (sub.path === "/members-services/active" && location.pathname.startsWith("/member/")) {
                                shouldBeActive = true;
                              }
                              
                              return `block text-sm px-3 py-1 rounded whitespace-nowrap transition-colors
                                ${
                                  shouldBeActive
                                    ? "text-blue-800 dark:text-blue-300"
                                    : "text-gray-500 dark:text-gray-400"
                                } hover:text-blue-900 dark:hover:text-blue-400`;
                            }}
                          >
                            {sub.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.label}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap
                      ${
                        collapsed ? "justify-center" : ""
                      }
                      ${
                        isActive
                          ? "text-blue-800 dark:text-blue-300"
                          : "text-gray-500 dark:text-gray-400"
                      } hover:text-blue-900 dark:hover:text-blue-400`
                  }
                  end={item.path === "/dashboard"}
                >
                  <span>{item.icon}</span>
                  <span className={`${collapsed ? "hidden" : ""}`}>
                    {item.label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-100 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
          }}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <FiLogOut size={20} />
          {!collapsed && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </aside>

    {/* Mobile/Tablet Sidebar - Full width with icons and text */}
    <aside
      className={`lg:hidden fixed top-0 left-0 h-screen max-h-screen bg-blue-50 dark:bg-gray-800 flex flex-col transition-all duration-200 shadow-lg z-50 ${
        mobileSidebarOpen ? "w-72 md:w-80" : "-translate-x-full"
      }`}
    >
      {/* Mobile Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-blue-100 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/Etribe-logo.jpg"
            alt="Etribe Logo"
            className="w-8 h-8 rounded-lg"
          />
          <span className="text-lg font-bold text-gray-800 dark:text-white">
            Etribe
          </span>
        </div>
        <button
          className="p-2 bg-blue-600 dark:bg-gray-700 text-white rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <FiChevronLeft size={20} />
        </button>
      </div>

      {/* Mobile Nav Menu - Icons and Text */}
      <nav className="flex-1 px-2 pt-4 overflow-y-auto min-h-0 max-h-full pb-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isParentActive = item.subItems?.some(
              (sub) => location.pathname === sub.path
            );

            if (item.dropdown) {
              return (
                <li key={item.label}>
                  <button
                    onClick={() => {
                      setOpenDropdown(
                        openDropdown === item.label ? "" : item.label
                      );
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 font-medium text-left whitespace-nowrap rounded-lg transition-colors
                      ${
                        isParentActive
                          ? "text-blue-800 dark:text-blue-300"
                          : "text-gray-500 dark:text-gray-400"
                      } hover:text-blue-900 dark:hover:text-blue-400`}
                  >
                    <span>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    <span className="ml-auto">
                      <FiChevronDown
                        size={20}
                        className={`transition-transform ${
                          openDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>
                  {openDropdown === item.label && (
                    <ul className="mt-1 space-y-1">
                      {item.subItems.map((sub) => (
                        <li key={sub.path}>
                          <NavLink
                            to={sub.path}
                            onClick={() => setMobileSidebarOpen(false)}
                            className={({ isActive }) =>
                              `block text-sm px-3 py-1 rounded whitespace-nowrap transition-colors
                                ${
                                  isActive
                                    ? "text-blue-800 dark:text-blue-300"
                                    : "text-gray-500 dark:text-gray-400"
                                } hover:text-blue-900 dark:hover:text-blue-400`
                            }
                          >
                            {sub.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.label}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap
                      ${
                        isActive
                          ? "text-blue-800 dark:text-blue-300"
                          : "text-gray-500 dark:text-gray-400"
                      } hover:text-blue-900 dark:hover:text-blue-400`
                  }
                  end={item.path === "/dashboard"}
                >
                  <span>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile Logout */}
      <div className="p-4 border-t border-blue-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-800 flex-shrink-0">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
          }}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <FiLogOut size={20} />
          <span className="whitespace-nowrap">Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
} 
