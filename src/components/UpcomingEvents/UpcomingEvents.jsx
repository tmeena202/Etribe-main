import React, { useState, useEffect } from "react";
import api from "../../api/axiosConfig";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        const response = await api.post('/event/future', {}, {
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
        }

        const BASE_URL = "https://api.etribes.in";
        const mappedEvents = backendEvents.map((e, idx) => {
          const eventDate = e.event_date && e.event_time
            ? new Date(`${e.event_date}T${e.event_time}`)
            : e.datetime ? new Date(e.datetime) : new Date();

          return {
            id: e.id || idx,
            day: eventDate.toLocaleDateString('en-US', { weekday: 'short' }),
            date: eventDate.getDate().toString(),
            month: eventDate.toLocaleDateString('en-US', { month: 'short' }),
            year: eventDate.getFullYear().toString(),
            title: e.event_title || e.event || e.title || e.name || `Event ${idx + 1}`,
            time: e.event_time || '12:00 PM',
            venue: e.event_venue || e.venue || e.location || 'TBD',
            description: e.event_description || e.agenda || e.description || 'No description available.',
            imageUrl: e.event_image
              ? (e.event_image.startsWith("http") ? e.event_image : BASE_URL + e.event_image)
              : (e.image || e.imageUrl || ""),
          };
        });

        setEvents(mappedEvents);
        if (mappedEvents.length > 0 && !selected) {
          setSelected(mappedEvents[0]);
        }
      } catch (err) {
        console.error('Fetch upcoming events error:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
    // Auto-refresh removed
  }, [selected]);

  if (loading) {
    return (
      <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 h-full w-full flex flex-col">
        <div className="relative rounded-t-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-blue-100 to-blue-200 dark:from-indigo-900 dark:via-blue-900 dark:to-gray-900" />
          <div className="absolute inset-0 bg-white/30 dark:bg-gray-800/40 backdrop-blur-md border-b border-white/30 dark:border-gray-700" />
          <h2 className="relative z-10 text-lg font-bold text-gray-900 dark:text-gray-100 tracking-wide px-5 py-3">
            Upcoming Events
          </h2>
        </div>
        <div className="p-5 flex-1 flex items-center justify-center">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p>Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 h-full w-full flex flex-col">
        <div className="relative rounded-t-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-blue-100 to-blue-200 dark:from-indigo-900 dark:via-blue-900 dark:to-gray-900" />
          <div className="absolute inset-0 bg-white/30 dark:bg-gray-800/40 backdrop-blur-md border-b border-white/30 dark:border-gray-700" />
          <h2 className="relative z-10 text-lg font-bold text-gray-900 dark:text-gray-100 tracking-wide px-5 py-3">
            Upcoming Events
          </h2>
        </div>
        <div className="p-5 flex-1 flex items-center justify-center">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>No upcoming events</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 h-full w-full flex flex-col border border-gray-200 dark:border-gray-700">
      <div className="relative rounded-t-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-blue-100 to-blue-200 dark:from-indigo-900 dark:via-blue-900 dark:to-gray-900" />
        <div className="absolute inset-0 bg-white/30 dark:bg-gray-800/40 backdrop-blur-md border-b border-white/30 dark:border-gray-700" />
        <h2 className="relative z-10 text-lg font-bold text-gray-900 dark:text-gray-100 tracking-wide px-5 py-3">
          Upcoming Events
        </h2>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        {/* Horizontal Scroll Date Row */}
        <div className="rounded-xl overflow-x-auto bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex-nowrap flex gap-3 px-2 py-2 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-indigo-900">
          {events.map((event) => (
            <button
              key={event.id}
              className={`flex flex-col items-center min-w-[72px] px-3 py-2 rounded-xl border-2 transition-all duration-150 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400/60
                ${
                  selected?.id === event.id
                    ? "bg-gradient-to-br from-indigo-100 via-blue-50 to-blue-100 dark:from-indigo-900 dark:via-blue-900 dark:to-gray-900 border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-md"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-700 hover:border-indigo-400"
                }`}
              onClick={() => setSelected(event)}
            >
              <span className="font-bold text-sm">{event.day}</span>
              <span className="text-xl font-bold">{event.date}</span>
              <span className="text-xs">{event.month}</span>
            </button>
          ))}
        </div>

        {/* Description Box — full height width */}
        <div className="flex-1 w-full min-h-[200px] rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-gray-900 border border-gray-100 dark:border-gray-700 shadow-inner text-sm p-4 overflow-auto flex flex-col justify-start">
          <h3 className="text-base font-bold mb-2 text-indigo-700 dark:text-indigo-300">{selected.title}</h3>

          <div className="mb-1 text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Date:</span> {selected.day}, {selected.date} {selected.month} {selected.year}
          </div>

          <div className="mb-1 text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Time:</span> {selected.time}
          </div>

          <div className="mb-1 text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Venue:</span> {selected.venue}
          </div>

          <div className="mt-2 overflow-x-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Description:</span>{" "}
            {selected.description}
          </div>
        </div>
      </div>
    </div>
  );
}
