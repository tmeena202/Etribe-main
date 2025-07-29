import React, { useEffect, useState, useRef } from "react";
import { FiSun, FiMoon, FiUser, FiBell, FiClock, FiCalendar, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import api from "../../api/axiosConfig";

export default function TopBar() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef(null);
  const [groupLogo, setGroupLogo] = useState("");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Helper: Format event time string for past and future dates
  function formatEventTime(dateString) {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }

    const now = new Date();
    const diffSeconds = Math.round((date - now) / 1000);

    if (diffSeconds < 0) { // Event is in the past
        const absSeconds = Math.abs(diffSeconds);
        if (absSeconds < 60) return `${absSeconds} seconds ago`;
        if (absSeconds < 3600) return `${Math.floor(absSeconds / 60)} minutes ago`;
        if (absSeconds < 86400) return `${Math.floor(absSeconds / 3600)} hours ago`;
        return `${Math.floor(absSeconds / 86400)} days ago`;
    } else { // Event is in the future
        if (diffSeconds < 60) return `in a few seconds`;
        if (diffSeconds < 3600) return `in ${Math.floor(diffSeconds / 60)} minutes`;
        if (diffSeconds < 86400) return `in ${Math.floor(diffSeconds / 3600)} hours`;
        const diffDays = Math.ceil(diffSeconds / 86400);
        if (diffDays === 1) return `in 1 day`;
        if (diffDays <= 30) return `in ${diffDays} days`;
        // For dates far in the future, just show the date
        return `on ${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      if (!token || !uid) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      const { data } = await api.post('/event/future', {}, {
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
      if (data && data.events) {
        backendEvents = data.events;
      } else if (data && data.data && Array.isArray(data.data.events)) {
        backendEvents = data.data.events;
      } else if (data && data.data && Array.isArray(data.data.event)) {
        backendEvents = data.data.event;
      } else if (data && Array.isArray(data.data)) {
        backendEvents = data.data;
      }
      
      const readNotificationIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');

      // Map events to notification objects, preserve read state if possible
      setNotifications(prev => {
        const mapped = backendEvents.map((e, idx) => {
          const id = e.id || `event-${idx}`;
          return {
            id,
            name: e.event_title || e.event || e.title || e.name || "Untitled Event",
            date: e.event_date && e.event_time ? `${e.event_date}T${e.event_time}` : e.event_date || e.datetime || e.date_time || e.date,
            read: readNotificationIds.includes(id),
          };
        });
        setUnreadCount(mapped.filter(n => !n.read).length);
        return mapped;
      });
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsRef]);

  // Mark as read handler
  const markAsRead = (id) => {
    // Add to localStorage
    const readNotificationIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    if (!readNotificationIds.includes(id)) {
      readNotificationIds.push(id);
      localStorage.setItem('readNotifications', JSON.stringify(readNotificationIds));
    }

    setNotifications(notifications => {
      const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        if (!token) {
          setError('Please log in');
          return;
        }
        const response = await api.post('/groupSettings', {}, {
          headers: {
            'Client-Service': 'COHAPPRT',
            'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
            'uid': uid,
            'token': token,
            'rurl': 'login.etribes.in',
            'Content-Type': 'application/json',
          }
        });
        const backendData = response.data?.data || response.data || {};
        if (isMounted) {
          setProfile({
            name: backendData.name || "Admin",
            email: backendData.email || "admin@company.com"
          });
          setGroupLogo(backendData.logo ? (backendData.logo.startsWith('http') ? backendData.logo : `https://api.etribes.in/${backendData.logo}`) : "");
        }
      } catch (err) {
        if (isMounted) setError('Failed to fetch profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow px-6 py-3 mb-8 rounded-xl">
      <div className="font-bold text-xl text-gray-800 dark:text-gray-100">Dashboard Overview</div>
      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          title="Toggle theme"
          onClick={toggleTheme}
        >
          {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>
        {/* Notification Bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none relative"
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-96 max-w-xs bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-20">
              {/* Header */}
              <div className="px-6 pt-5 pb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="font-bold text-lg text-gray-900 dark:text-gray-100">Notification</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</div>
              </div>
              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.filter(n => !n.read).length > 0 ? (
                  notifications.filter(n => !n.read).map((event) => (
                    <div key={event.id} className="flex items-start gap-3 px-6 py-4 group bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <FiCalendar className="text-blue-500 dark:text-blue-300 text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">
                          {event.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-1">
                          <FiClock />
                          {formatEventTime(event.date)}
                        </div>
                      </div>
                      <button
                        onClick={() => markAsRead(event.id)}
                        className="ml-2 px-2 py-1 text-xs rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800 transition"
                      >
                        Mark as read
        </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <FiCheckCircle className="text-4xl text-green-400 mb-2" />
                    <div className="text-gray-500 dark:text-gray-400 font-medium">You're all caught up!</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">No new notifications.</div>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-center">
                <Link
                  to="/event-management/all"
                  onClick={() => setNotificationsOpen(false)}
                  className="inline-block px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow transition text-sm"
                >
                  View All Events
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex items-center gap-3">
          <div>
            {groupLogo ? (
              <img src={groupLogo} alt="Group Logo" className="h-8 w-8 rounded-full object-cover border border-gray-300 dark:border-gray-700" />
            ) : (
            <FiUser className="text-blue-500 dark:text-blue-300" size={20} />
            )}
          </div>
          <div className="hidden sm:block text-right">
            {loading ? (
              <div className="text-xs text-gray-400 dark:text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-xs text-red-500">{error}</div>
            ) : (
              <>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {profile.name}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-400">
                  {profile.email}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 