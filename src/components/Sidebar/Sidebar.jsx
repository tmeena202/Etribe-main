import React, { useState, useEffect } from "react";
import {
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiBookOpen,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiChevronDown,
} from "react-icons/fi";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";

// Menu structure
const menuItems = [
  {
    label: "Dashboard",
    icon: <FiGrid size={20} />,
    path: "/dashboard",
    dropdown: false,
  },
  {
    label: "Membership Management",
    icon: <FiUsers size={20} />,
    path: "#",
    basePath: "/membership-management",
    dropdown: true,
    subItems: [
      { label: "Active Members", path: "/membership-management/active" },
      { label: "Inactive Members", path: "/membership-management/inactive" },
      { label: "Membership Expired", path: "/membership-management/expired" },
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
    label: "Important Contacts",
    icon: <FiBookOpen size={20} />,
    path: "/important-contacts",
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
            headers: {
              "Client-Service": "COHAPPRT",
              "Auth-Key": "4F21zrjoAASqz25690Zpqf67UyY",
              uid,
              token,
              rurl: "login.etribes.in",
              "Content-Type": "application/json",
            },
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
      item.subItems?.some((sub) => sub.path === location.pathname)
    );
    if (activeItem) {
      setOpenDropdown(activeItem.label);
    }
  }, [location.pathname]);

  return (
    <aside
      className={`bg-blue-50 dark:bg-gray-800 flex flex-col transition-all duration-200 ${
        collapsed ? "w-20" : "w-72"
      } shadow-lg ${className}`}
    >
      {/* Top bar with logo */}
      <div className="flex items-center gap-3 p-4 border-b border-blue-100 dark:border-gray-700">
        {signatureUrl && (
          <img
            src={signatureUrl}
            alt="Signature Logo"
            className={`object-contain ${collapsed ? "w-16 h-6" : "w-32 h-8"}`}
          />
        )}
        <button
          className="ml-auto text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-500 transition-colors"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <FiMenu size={20} />
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-2 pt-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isParentActive = item.subItems?.some(
              (sub) => location.pathname === sub.path
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
      <div className="p-4 border-t border-blue-100 dark:border-gray-700">
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
  );
}
