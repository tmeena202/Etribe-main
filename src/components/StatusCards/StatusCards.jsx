import React, { useEffect, useState } from "react";
import { FiUserCheck, FiUserX, FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";

export default function StatusCards() {
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        const response = await api.post('/userDetail/active_members', { uid }, {
          headers: {
            'token': token,
            'uid': uid,
          }
        });
        const members = Array.isArray(response.data) ? response.data : response.data.data || [];
        setActiveCount(members.length);
      } catch (err) {
        setActiveCount(0);
      }
    };
    const fetchInactiveCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        const response = await api.post('/userDetail/not_members', { uid }, {
          headers: {
            'token': token,
            'uid': uid,
          }
        });
        const members = Array.isArray(response.data) ? response.data : response.data.data || [];
        setInactiveCount(members.length);
      } catch (err) {
        setInactiveCount(0);
      }
    };
    const fetchExpiredCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        const response = await api.post('/userDetail/membership_expired', { uid }, {
          headers: {
            'token': token,
            'uid': uid,
          }
        });
        const members = Array.isArray(response.data) ? response.data : response.data.data || [];
        setExpiredCount(members.length);
      } catch (err) {
        setExpiredCount(0);
      }
    };
    fetchActiveCount();
    fetchInactiveCount();
    fetchExpiredCount();
    // Auto-refresh removed
  }, []);

const statusData = [
  {
    label: "Active",
      count: activeCount, // Real value
    gradient: "bg-gradient-to-br from-emerald-200 via-green-100 to-white dark:from-emerald-800 dark:via-green-900 dark:to-gray-800",
    icon: <FiUserCheck size={32} className="text-blue-600 dark:text-emerald-300 opacity-80" />, // Adjust icon color for contrast
    path: "/members-services/active",
  },
  {
    label: "Inactive",
      count: inactiveCount, // Real value
    gradient: "bg-gradient-to-br from-blue-200 via-indigo-200 to-white dark:from-blue-900 dark:via-indigo-900 dark:to-gray-900 ",
    icon: <FiUserX size={32} className="text-emerald-600 dark:text-blue-300 opacity-80" />, // Adjust icon color for contrast
    path: "/members-services/inactive",
  },
  {
    label: "Membership Expired",
      count: expiredCount, // Real value
    gradient: "bg-gradient-to-br from-rose-200 via-pink-100 to-white dark:from-rose-900 dark:via-pink-900 dark:to-gray-900",
    icon: <FiAlertCircle size={32} className="text-rose-600 dark:text-rose-300 opacity-80" />, // Adjust icon color for contrast
    path: "/members-services/expired",
  },
];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
      {statusData.map((status) => (
        <div
          key={status.label}
          className={
            `relative rounded-2xl shadow-lg h-32 p-4 flex flex-col items-center justify-center gap-2 overflow-hidden transition-transform duration-200 hover:scale-105 cursor-pointer ${status.gradient} dark:shadow-gray-900 border border-gray-200 dark:border-gray-700`
          }
          onClick={() => navigate(status.path)}
          title={`Go to ${status.label} Members`}
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-white/30 dark:bg-gray-700/40 backdrop-blur-md border border-white/30 dark:border-gray-700 rounded-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
            <div className="flex-shrink-0">{status.icon}</div>
            <span className="text-sm font-semibold tracking-wide text-center leading-tight text-gray-900 dark:text-gray-100">{status.label}</span>
            <span className="text-2xl font-extrabold tracking-tight drop-shadow text-gray-900 dark:text-gray-100">{status.count}</span>
          </div>
        </div>
      ))}
    </div>
  );
} 