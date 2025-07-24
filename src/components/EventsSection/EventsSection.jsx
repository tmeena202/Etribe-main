import React, { useEffect, useState } from "react";
import { FiClock, FiHash } from "react-icons/fi";
import api from "../../api/axiosConfig";

export default function EventsSection() {
  const [pastEventsCount, setPastEventsCount] = useState(0);
  const [totalEventsCount, setTotalEventsCount] = useState(0);

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        const response = await api.post('/event/past', {}, {
          headers: {
            'Client-Service': 'COHAPPRT',
            'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
            'uid': uid,
            'token': token,
            'rurl': 'login.etribes.in',
            'Content-Type': 'application/json',
          }
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
        setPastEventsCount(backendEvents.length);
      } catch (err) {
        setPastEventsCount(0);
      }
    };

    const fetchTotalEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        const response = await api.post('/event/index', {}, {
          headers: {
            'Client-Service': 'COHAPPRT',
            'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
            'uid': uid,
            'token': token,
            'rurl': 'login.etribes.in',
            'Content-Type': 'application/json',
          }
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
        setTotalEventsCount(backendEvents.length);
      } catch (err) {
        setTotalEventsCount(0);
      }
    };

    fetchPastEvents();
    fetchTotalEvents();
    return () => {};
  }, []);

const eventsStats = [
  {
    label: "Past Events",
      count: pastEventsCount,
    color: "bg-gradient-to-br from-violet-400 to-indigo-500 text-white",
    icon: <FiClock size={28} className="text-white opacity-80" />,
  },
  {
    label: "Total Events",
      count: totalEventsCount,
    color: "bg-gradient-to-br from-blue-400 to-indigo-400 text-white",
    icon: <FiHash size={28} className="text-white opacity-80" />,
  },
];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      {eventsStats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-2xl shadow-lg p-7 flex flex-col items-center gap-2 ${stat.color} transition-transform duration-200 hover:scale-105`}
        >
          <div className="mb-2">{stat.icon}</div>
          <span className="text-lg font-semibold tracking-wide">{stat.label}</span>
          <span className="text-3xl font-extrabold tracking-tight drop-shadow">{stat.count}</span>
        </div>
      ))}
    </div>
  );
} 