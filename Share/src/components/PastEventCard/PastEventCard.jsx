import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import api from "../../api/axiosConfig";
import { getAuthHeaders } from "../../utils/apiHeaders";

export default function PastEventCard() {
  const [pastCount, setPastCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPastCount();
  }, []);

  const fetchPastCount = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      const response = await api.post('/event/past', {}, {
        headers: getAuthHeaders()
      });
      let backendEvents = [];
      if (Array.isArray(response.data?.data?.event)) {
        backendEvents = response.data.data.event;
      } else if (Array.isArray(response.data?.data?.events)) {
        backendEvents = response.data.data.events;
      } else if (Array.isArray(response.data?.data)) {
        backendEvents = response.data.data;
      } else if (Array.isArray(response.data)) {
        backendEvents = response.data;
      } else if (response.data?.data && typeof response.data.data === 'object') {
        backendEvents = Object.values(response.data.data);
      } else {
        backendEvents = [];
      }
      setPastCount(backendEvents.length);
    } catch (err) {
      console.error('Error fetching past events:', err);
      setPastCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative h-32 rounded-2xl shadow-lg flex flex-col items-center justify-center p-3 gap-1 transition-transform duration-200 hover:scale-105 cursor-pointer overflow-hidden bg-gradient-to-br from-violet-200 via-indigo-100 to-white dark:from-violet-800 dark:via-indigo-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700"
      onClick={() => navigate("/event-management/past")}
      title="Go to Past Events"
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/30 dark:bg-gray-700/40 backdrop-blur-md border border-white/30 dark:border-gray-700 rounded-2xl pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
        <FiCalendar size={32} className="text-violet-500 dark:text-violet-300 opacity-80 mb-1" />
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Past Event</div>
        <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 drop-shadow">
          {loading ? '...' : pastCount}
        </div>
      </div>
    </div>
  );
} 