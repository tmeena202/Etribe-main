import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import api from "../../api/axiosConfig";
import { getAuthHeaders } from "../../utils/apiHeaders";

export default function TotalEventCard() {
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTotalCount();
  }, []);

  const fetchTotalCount = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      // Try to get total count by combining future and past events
      const [futureResponse, pastResponse] = await Promise.all([
        api.post('/event/future', {}, {
          headers: getAuthHeaders()
        }),
        api.post('/event/past', {}, {
          headers: getAuthHeaders()
        })
      ]);

      let futureEvents = [];
      let pastEvents = [];

      // Parse future events
      if (Array.isArray(futureResponse.data?.data?.event)) {
        futureEvents = futureResponse.data.data.event;
      } else if (Array.isArray(futureResponse.data?.data?.events)) {
        futureEvents = futureResponse.data.data.events;
      } else if (Array.isArray(futureResponse.data?.data)) {
        futureEvents = futureResponse.data.data;
      } else if (Array.isArray(futureResponse.data)) {
        futureEvents = futureResponse.data;
      } else if (futureResponse.data?.data && typeof futureResponse.data.data === 'object') {
        futureEvents = Object.values(futureResponse.data.data);
      }

      // Parse past events
      if (Array.isArray(pastResponse.data?.data?.event)) {
        pastEvents = pastResponse.data.data.event;
      } else if (Array.isArray(pastResponse.data?.data?.events)) {
        pastEvents = pastResponse.data.data.events;
      } else if (Array.isArray(pastResponse.data?.data)) {
        pastEvents = pastResponse.data.data;
      } else if (Array.isArray(pastResponse.data)) {
        pastEvents = pastResponse.data;
      } else if (pastResponse.data?.data && typeof pastResponse.data.data === 'object') {
        pastEvents = Object.values(pastResponse.data.data);
      }

      // Combine both arrays for total count
      const totalEvents = [...futureEvents, ...pastEvents];
      setTotalCount(totalEvents.length);
    } catch (err) {
      console.error('Error fetching total events:', err);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative h-32 rounded-2xl shadow-lg flex flex-col items-center justify-center p-3 gap-1 transition-transform duration-200 hover:scale-105 cursor-pointer overflow-hidden bg-gradient-to-br from-blue-200 via-blue-100 to-white dark:from-blue-800 dark:via-blue-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700"
      onClick={() => navigate("/event-management/all")}
      title="Go to All Events"
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/30 dark:bg-gray-700/40 backdrop-blur-md border border-white/30 dark:border-gray-700 rounded-2xl pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
        <FiCalendar size={32} className="text-blue-500 opacity-80 mb-1" />
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total Event</div>
        <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 drop-shadow">
          {loading ? '...' : totalCount}
        </div>
      </div>
    </div>
  );
} 