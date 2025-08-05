import React, { useState, useEffect } from "react";
import { FiCalendar, FiMapPin, FiClock, FiUsers } from "react-icons/fi";
import api from "../../api/axiosConfig";
import { getAuthHeaders } from "../../utils/apiHeaders";

export default function EventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      const response = await api.post('/event/future', {}, {
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
      setEvents(backendEvents);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const eventsStats = [
    {
      label: "Past Events",
      count: 0, // Placeholder, needs actual data fetching
      color: "bg-gradient-to-br from-violet-400 to-indigo-500 text-white",
      icon: <FiClock size={28} className="text-white opacity-80" />,
    },
    {
      label: "Total Events",
      count: 0, // Placeholder, needs actual data fetching
      color: "bg-gradient-to-br from-blue-400 to-indigo-400 text-white",
      icon: <FiUsers size={28} className="text-white opacity-80" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      {eventsStats.map((stat) => (
        <div
          key={stat.label}
          className={`