import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiMapPin, FiClock, FiUsers, FiX, FiChevronLeft, FiChevronRight, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/Layout/DashboardLayout';
import api from '../api/axiosConfig';
import { getAuthHeaders } from '../utils/apiHeaders';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Helper functions
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
function getEventDotColor(events) {
  if (events.some((ev) => ev.type === "past")) return "bg-red-500";
  if (events.some((ev) => ev.type === "today")) return "bg-green-400";
  if (events.some((ev) => ev.type === "upcoming")) return "bg-blue-400";
  return "bg-pink-400";
}

// Helper to strip HTML tags
function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

// Helper to get CKEditor contentsCss based on dark mode
function getCKEditorContentsCss() {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark
    ? [
        'https://ckeditor.com/ckeditor5/39.0.1/classic/styles.css',
        `
        .ck-editor__editable {
          background: #ffffff !important;
          color: #000000 !important;
        }
        .ck-editor__editable.ck-placeholder::before {
          color: #6b7280 !important;
        }
        `
      ]
    : [
        'https://ckeditor.com/ckeditor5/39.0.1/classic/styles.css',
        `
        .ck-editor__editable {
          background: #fff !important;
          color: #111827 !important;
        }
        .ck-editor__editable.ck-placeholder::before {
          color: #6b7280 !important;
        }
        `
      ];
}

// SimpleCalendar component
// Helper functions remain unchanged...

const SimpleCalendar = ({ selectedDate, onDateSelect, events }) => {
  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) days.push(day);

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(currentMonth + direction);
    onDateSelect(newDate);
  };

  return (
    <div className="h-full flex flex-col justify-center min-h-[400px] lg:min-h-0">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-700 dark:text-white py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 dark:bg-gray-700 rounded-xl p-2 flex-1 border border-gray-200 dark:border-gray-600">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="aspect-square"></div>;
          }
          const dayDate = new Date(currentYear, currentMonth, day);
          const eventsForDay = events.filter(event => isSameDay(new Date(event.date), dayDate));
          const isSelected = isSameDay(dayDate, selectedDate);
          const isToday = isSameDay(dayDate, today);
          const dotColor = getEventDotColor(eventsForDay);

          // --- CORRECTED CLASSES ---
          let cellClass = "aspect-square p-2 cursor-pointer rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg relative group border border-gray-200 dark:border-gray-600 ";
          // Selected date
          if (isSelected) {
            cellClass +=
              "ring-2 ring-emerald-400 bg-emerald-100 text-black dark:bg-emerald-700 dark:text-white shadow-md ";
          } else {
            cellClass +=
              "hover:bg-gradient-to-br hover:from-emerald-50 hover:to-blue-50 dark:hover:from-gray-600 dark:hover:to-gray-700 ";
          }
          // TODAY - only if not selected date
          if (isToday && !isSelected) {
            cellClass +=
              "bg-yellow-300 dark:bg-yellow-500 text-black dark:text-white ring-1 ring-yellow-400 ";
          }
          return (
            <div
              key={index}
              onClick={() => onDateSelect(dayDate)}
              className={cellClass}
            >
              <div className="text-lg font-bold text-gray-800 dark:text-white text-center">
                {day}
              </div>
              {eventsForDay.length > 0 && (
                <>
                  <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-lg ${dotColor} ${eventsForDay.some(ev => ev.type === 'past') ? '' : 'animate-pulse'}`} />
                  {eventsForDay.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                      {eventsForDay.length}
                    </div>
                  )}
                  <div className="pointer-events-none absolute -top-12 left-1/2 hidden w-max max-w-48 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white group-hover:block z-50 shadow-xl">
                    <div className="font-semibold mb-1">Events:</div>
                    {eventsForDay.slice(0, 3).map((ev, idx) => (
                      <div key={idx} className="truncate">{ev.name}</div>
                    ))}
                    {eventsForDay.length > 3 && (
                      <div className="text-gray-300">+{eventsForDay.length - 3} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [addEventForm, setAddEventForm] = useState({
    event: "",
    agenda: "",
    venue: "",
    date: selectedDate.toISOString().slice(0, 10),
    time: "",
    reminder: "Yes",
    sendReminderTo: "Only Approved Members",
    invitationImage: null
  });
  const [formErrors, setFormErrors] = useState({});
  // Stats for pills (use backend endpoints for counts to match Dashboard)
  const [todayCount, setTodayCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [pastCount, setPastCount] = useState(0);

  // Add AllEvents-style Add Event form state and logic
  const handleAddEventChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'invitationImage') {
      setAddEventForm({ ...addEventForm, invitationImage: files[0] });
    } else {
      setAddEventForm({ ...addEventForm, [name]: value });
      setFormErrors({ ...formErrors, [name]: undefined });
    }
  };
  const handleAgendaChange = (event, editor) => {
    const data = editor.getData();
    setAddEventForm({ ...addEventForm, agenda: data });
    setFormErrors({ ...formErrors, agenda: undefined });
  };
  const validateForm = () => {
    const errors = {};
    if (!addEventForm.event.trim()) errors.event = 'The Event Title field is required.';
    if (!addEventForm.agenda || !addEventForm.agenda.replace(/<[^>]*>/g, '').trim()) errors.agenda = 'The Agenda field is required.';
    if (!addEventForm.venue.trim()) errors.venue = 'The Venue field is required.';
    if (!addEventForm.date.trim()) errors.date = 'The Date field is required.';
    if (!addEventForm.time.trim()) errors.time = 'The Time field is required.';
    return errors;
  };
  const handleAddEventSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error(Object.values(errors).join('\n'));
      setShowAddEventForm(false);
      setTimeout(() => toast.dismiss(), 3000);
      return;
    }
    setLoading(true);
    setFormErrors({});
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      const formData = new FormData();
      formData.append('event_title', addEventForm.event);
      formData.append('event_description', addEventForm.agenda);
      formData.append('event_venue', addEventForm.venue);
      formData.append('event_time', addEventForm.time);
      formData.append('event_date', addEventForm.date);
      if (addEventForm.invitationImage) {
        formData.append('event_image', addEventForm.invitationImage);
      }
      await fetch('/api/event/add', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: formData,
      });
      setAddEventForm({
        event: "",
        agenda: "",
        venue: "",
        date: "",
        time: "",
        reminder: "Yes",
        sendReminderTo: "Only Approved Members",
        invitationImage: null
      });
      toast.success('Event added successfully!');
      setShowAddEventForm(false);
      setTimeout(() => toast.dismiss(), 3000);
    } catch (err) {
      setShowAddEventForm(false);
      toast.error('Failed to add event');
      setTimeout(() => toast.dismiss(), 3000);
    } finally {
      setLoading(false);
    }
  };
  const handleShowAddEventForm = () => setShowAddEventForm(true);
  const handleHideAddEventForm = () => setShowAddEventForm(false);

  // 1. Add state for Edit Event modal and form
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editEventForm, setEditEventForm] = useState({
    id: '',
    event: '',
    agenda: '',
    venue: '',
    date: '',
    time: '',
    invitationImage: null,
    imageUrl: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // 2. Handler to open Edit modal with event data
  const openEditEventModal = (event) => {
    setEditEventForm({
      id: event.id,
      event: event.name,
      agenda: event.description,
      venue: event.venue || '',
      date: event.date ? event.date.toISOString().slice(0, 10) : '',
      time: event.date ? event.date.toTimeString().slice(0,5) : '',
      invitationImage: null,
      imageUrl: event.imageUrl || '',
    });
    setEditFormErrors({});
    setEditError(null);
    setEditSuccess(null);
    setShowEditEventModal(true);
  };
  const closeEditEventModal = () => setShowEditEventModal(false);

  // 3. Edit form change handlers
  const handleEditEventChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'invitationImage') {
      setEditEventForm({ ...editEventForm, invitationImage: files[0] });
    } else {
      setEditEventForm({ ...editEventForm, [name]: value });
      setEditFormErrors({ ...editFormErrors, [name]: undefined });
    }
  };
  const handleEditAgendaChange = (event, editor) => {
    const data = editor.getData();
    setEditEventForm({ ...editEventForm, agenda: data });
    setEditFormErrors({ ...editFormErrors, agenda: undefined });
  };

  // 4. Edit form validation
  const validateEditForm = () => {
    const errors = {};
    if (!editEventForm.event.trim()) errors.event = 'The Event Title field is required.';
    if (!editEventForm.agenda || !editEventForm.agenda.replace(/<[^>]*>/g, '').trim()) errors.agenda = 'The Agenda field is required.';
    if (!editEventForm.venue.trim()) errors.venue = 'The Venue field is required.';
    if (!editEventForm.date.trim()) errors.date = 'The Date field is required.';
    if (!editEventForm.time.trim()) errors.time = 'The Time field is required.';
    return errors;
  };

  // 5. Edit Event API call
  const handleEditEventSubmit = async (e) => {
    e.preventDefault();
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      const formData = new FormData();
      formData.append('id', editEventForm.id);
      formData.append('event_title', editEventForm.event);
      formData.append('event_description', editEventForm.agenda);
      formData.append('event_venue', editEventForm.venue);
      formData.append('event_time', editEventForm.time);
      formData.append('event_date', editEventForm.date);
      if (editEventForm.invitationImage) {
        formData.append('event_image', editEventForm.invitationImage);
      }
      await fetch('/api/event/edit', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || ''),
        },
        credentials: 'include',
        body: formData,
      });
      toast.success('Event updated successfully!');
      setTimeout(() => toast.dismiss(), 2000);
      setShowEditEventModal(false);
      // Refresh events after adding/editing/deleting
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        const response = await api.post('/event/index', {}, {
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
        // Map backend fields to calendar event structure
        const mappedEvents = backendEvents.map((e, idx) => {
          // Always parse date as a JS Date object
          let eventDate = null;
          if (e.event_date && e.event_time) {
            eventDate = new Date(`${e.event_date}T${e.event_time}`);
          } else if (e.event_date) {
            eventDate = new Date(e.event_date);
          } else if (e.datetime) {
            eventDate = new Date(e.datetime);
          } else if (e.date_time) {
            eventDate = new Date(e.date_time);
          } else if (e.date) {
            eventDate = new Date(e.date);
          } else {
            eventDate = new Date();
          }
          // Defensive: if eventDate is a string, convert to Date
          if (!(eventDate instanceof Date) || isNaN(eventDate)) {
            eventDate = new Date(eventDate);
          }
          // Determine type
          const today = new Date();
          today.setHours(0,0,0,0);
          const eventDay = new Date(eventDate);
          eventDay.setHours(0,0,0,0);
          let type = 'upcoming';
          if (eventDay < today) type = 'past';
          else if (eventDay.getTime() === today.getTime()) type = 'today';
          return {
            id: e.id || idx, // Assuming 'id' is available in backend
            name: e.event_title || e.event || e.title || e.name || '',
            date: eventDate,
            attendees: e.attendees || e.attendee_count || e.count || 0,
            description: e.event_description || e.agenda || e.description || '',
            type,
            imageUrl: e.event_image || '', // Assuming 'event_image' is available
          };
        });
        setEvents(mappedEvents);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    } catch (err) {
      toast.error('Failed to update event');
    } finally {
      setEditLoading(false);
    }
  };

  // 6. Delete event handler
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      await fetch('/api/event/remove', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ id: eventId }),
      });
      setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
      toast.success('Event deleted successfully!');
      setTimeout(() => toast.dismiss(), 3000);
    } catch (err) {
      toast.error('Failed to delete event');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fetch event counts from backend endpoints
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        // Upcoming events count
        const futureRes = await api.post('/event/future', {}, {
          headers: getAuthHeaders()
        });
        let futureEvents = [];
        if (Array.isArray(futureRes.data?.data?.event)) {
          futureEvents = futureRes.data.data.event;
        } else if (Array.isArray(futureRes.data?.data?.events)) {
          futureEvents = futureRes.data.data.events;
        } else if (Array.isArray(futureRes.data?.data)) {
          futureEvents = futureRes.data.data;
        } else if (Array.isArray(futureRes.data)) {
          futureEvents = futureRes.data;
        } else if (futureRes.data?.data && typeof futureRes.data.data === 'object') {
          futureEvents = Object.values(futureRes.data.data);
        } else {
          futureEvents = [];
        }
        setUpcomingCount(futureEvents.length);

        // Past events count
        const pastRes = await api.post('/event/past', {}, {
          headers: getAuthHeaders()
        });
        let pastEvents = [];
        if (Array.isArray(pastRes.data?.data?.event)) {
          pastEvents = pastRes.data.data.event;
        } else if (Array.isArray(pastRes.data?.data?.events)) {
          pastEvents = pastRes.data.data.events;
        } else if (Array.isArray(pastRes.data?.data)) {
          pastEvents = pastRes.data.data;
        } else if (Array.isArray(pastRes.data)) {
          pastEvents = pastRes.data;
        } else if (pastRes.data?.data && typeof pastRes.data.data === 'object') {
          pastEvents = Object.values(pastRes.data.data);
        } else {
          pastEvents = [];
        }
        setPastCount(pastEvents.length);

        // Today events count (from all events, filter for today)
        const today = new Date();
        today.setHours(0,0,0,0);
        const allToday = [...futureEvents, ...pastEvents].filter(e => {
          let eventDate;
          if (e.event_date && e.event_time) {
            eventDate = new Date(`${e.event_date}T${e.event_time}`);
          } else if (e.datetime) {
            eventDate = new Date(e.datetime);
          } else if (e.date_time) {
            eventDate = new Date(e.date_time);
          } else if (e.date) {
            eventDate = new Date(e.date);
          } else {
            eventDate = new Date();
          }
          eventDate.setHours(0,0,0,0);
          return eventDate.getTime() === today.getTime();
        });
        setTodayCount(allToday.length);
      } catch (err) {
        setUpcomingCount(0);
        setPastCount(0);
        setTodayCount(0);
      }
    };
    fetchCounts();
    // Removed setInterval polling
    // Only call fetchCounts after CRUD operations
    return () => {};
  }, []);

  // Fetch events from backend and poll every 10 seconds
  useEffect(() => {
    let interval;
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        const response = await api.post('/event/index', {}, {
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
        // Map backend fields to calendar event structure
        const mappedEvents = backendEvents.map((e, idx) => {
          // Always parse date as a JS Date object
          let eventDate = null;
          if (e.event_date && e.event_time) {
            eventDate = new Date(`${e.event_date}T${e.event_time}`);
          } else if (e.event_date) {
            eventDate = new Date(e.event_date);
          } else if (e.datetime) {
            eventDate = new Date(e.datetime);
          } else if (e.date_time) {
            eventDate = new Date(e.date_time);
          } else if (e.date) {
            eventDate = new Date(e.date);
          } else {
            eventDate = new Date();
          }
          // Defensive: if eventDate is a string, convert to Date
          if (!(eventDate instanceof Date) || isNaN(eventDate)) {
            eventDate = new Date(eventDate);
          }
          // Determine type
          const today = new Date();
          today.setHours(0,0,0,0);
          const eventDay = new Date(eventDate);
          eventDay.setHours(0,0,0,0);
          let type = 'upcoming';
          if (eventDay < today) type = 'past';
          else if (eventDay.getTime() === today.getTime()) type = 'today';
          return {
            id: e.id || idx, // Assuming 'id' is available in backend
            name: e.event_title || e.event || e.title || e.name || '',
            date: eventDate,
            attendees: e.attendees || e.attendee_count || e.count || 0,
            description: e.event_description || e.agenda || e.description || '',
            type,
            imageUrl: e.event_image || '', // Assuming 'event_image' is available
          };
        });
        setEvents(mappedEvents);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
    return () => {};
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Events for selected date
  const eventsForDate = events.filter(ev => isSameDay(ev.date, selectedDate));

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-orange-600">Event Calendar</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiCalendar className="text-indigo-600" />
            <span>Total Events: {events.length}</span>
                </div>
                </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 max-w-7xl w-full mx-auto">
          {/* Header Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-indigo-600 text-xl" />
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Calendar Management</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FiClock className="text-indigo-600" />
                <span>Manage events and schedules</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">{events.filter(ev => isSameDay(new Date(ev.date), new Date())).length} Today</span>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">{upcomingCount} Upcoming</span>
                <span className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">{pastCount} Past</span>
                <span className="text-gray-700 dark:text-gray-200 font-semibold text-xs sm:text-sm">{time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{time.toLocaleTimeString([], { hour12: false })}</span>
              </div>
              {!showAddEventForm && (
                <button
                  className="flex items-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 transition flex-shrink-0"
                  onClick={handleShowAddEventForm}
                >
                  <FiPlus size={14} />
                  <span>Add Event</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Content: Two Columns */}
          <div className="flex flex-col lg:flex-row gap-6 p-6 h-auto lg:h-[800px]">
            {/* Left: Calendar Card */}
            <div className="flex-1 min-w-0 h-auto lg:h-full flex flex-col">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 relative h-auto lg:h-full flex flex-col">
                 <div className="p-4 flex-1 flex flex-col">
                  <SimpleCalendar 
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    events={events}
                  />
                </div>
              </div>
            </div>
            
            {/* Right: Event Details Card - Desktop Only */}
            <div className="hidden lg:block w-full lg:w-96 flex-shrink-0 h-full flex-col">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <FiEye className="text-indigo-600" />
                    Event Details
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                    Events for {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  </div>
                {/* Event cards for selected date */}
                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                  {eventsForDate.length === 0 ? (
                    <div className="text-center py-8">
                      <FiCalendar className="text-gray-300 dark:text-gray-600 text-4xl mx-auto mb-3" />
                      <p className="text-gray-400 dark:text-gray-300 text-sm">No events scheduled for this date</p>
                    </div>
                  ) : (
                    eventsForDate.map((ev, idx) => (
                      <div key={idx} className={`rounded-xl p-4 shadow-sm border transition-all hover:shadow-md ${
                        ev.type === 'today' 
                          ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700' 
                          : ev.type === 'upcoming' 
                            ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700' 
                            : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              ev.type === 'today' 
                                ? 'bg-green-500' 
                                : ev.type === 'upcoming' 
                                  ? 'bg-blue-500' 
                                  : 'bg-gray-500'
                            }`}></div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{ev.name}</h3>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ev.type === 'today' 
                              ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200' 
                              : ev.type === 'upcoming' 
                                ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200' 
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                          }`}>
                                {ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}
                              </span>
                            </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-2">
                            <FiCalendar className="text-gray-400" size={14} />
                            <span>{ev.date.toLocaleDateString()}</span>
                              </div>
                         {stripHtml(ev.description) && (
                           <div className="overflow-x-auto whitespace-nowrap"><span className="font-medium text-gray-800 dark:text-gray-100">Agenda:</span> {stripHtml(ev.description)}</div>
                         )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <button className="text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-400 transition-colors" title="Edit Event" onClick={() => openEditEventModal(ev)} disabled={editLoading}>
                            <FiEdit2 size={16} />
                          </button>
                          <button className="text-red-600 dark:text-red-300 hover:text-red-900 dark:hover:text-red-400 transition-colors" title="Delete Event" onClick={() => handleDeleteEvent(ev.id)} disabled={deleteLoading}>
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                    </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Events Cards View */}
          <div className="lg:hidden p-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <FiEye className="text-indigo-600" />
                  Events for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
              </div>
              
              <div className="p-4 space-y-3">
                {eventsForDate.length === 0 ? (
                  <div className="text-center py-8">
                    <FiCalendar className="text-gray-300 dark:text-gray-600 text-3xl mx-auto mb-3" />
                    <p className="text-gray-400 dark:text-gray-300 text-sm">No events scheduled for this date</p>
                  </div>
                ) : (
                  eventsForDate.map((ev, idx) => (
                    <div key={idx} className={`rounded-xl p-4 shadow-sm border transition-all hover:shadow-md ${
                      ev.type === 'today' 
                        ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700' 
                        : ev.type === 'upcoming' 
                          ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700' 
                          : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            ev.type === 'today' 
                              ? 'bg-green-500' 
                              : ev.type === 'upcoming' 
                                ? 'bg-blue-500' 
                                : 'bg-gray-500'
                          }`}></div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{ev.name}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          ev.type === 'today' 
                            ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200' 
                            : ev.type === 'upcoming' 
                              ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200' 
                              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                        }`}>
                          {ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-gray-400" size={12} />
                          <span>{ev.date.toLocaleDateString()}</span>
                        </div>
                        {stripHtml(ev.description) && (
                          <div className="text-xs">
                            <span className="font-medium text-gray-800 dark:text-gray-100">Agenda:</span> 
                            <span className="ml-1">{stripHtml(ev.description).substring(0, 100)}{stripHtml(ev.description).length > 100 ? '...' : ''}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button className="text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-400 transition-colors" title="Edit Event" onClick={() => openEditEventModal(ev)} disabled={editLoading}>
                          <FiEdit2 size={14} />
                        </button>
                        <button className="text-red-600 dark:text-red-300 hover:text-red-900 dark:hover:text-red-400 transition-colors" title="Delete Event" onClick={() => handleDeleteEvent(ev.id)} disabled={deleteLoading}>
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Event Modal */}
        {showAddEventForm && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-2xl relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                onClick={handleHideAddEventForm}
                title="Close"
              >
                <FiX size={24} />
              </button>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <FiPlus className="text-indigo-600 dark:text-indigo-300" />
                  Add New Event
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Create a new event with details, venue, and schedule</p>
              </div>
              <form className="space-y-6" onSubmit={handleAddEventSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="event"
                      value={addEventForm.event}
                      onChange={handleAddEventChange}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${formErrors.event ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Enter event name"
                    />
                    {formErrors.event && <div className="text-red-600 text-xs mt-1">{formErrors.event}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Venue <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={addEventForm.venue}
                      onChange={handleAddEventChange}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${formErrors.venue ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Enter venue"
                    />
                    {formErrors.venue && <div className="text-red-600 text-xs mt-1">{formErrors.venue}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={addEventForm.date}
                      onChange={handleAddEventChange}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${formErrors.date ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Select date"
                    />
                    {formErrors.date && <div className="text-red-600 text-xs mt-1">{formErrors.date}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={addEventForm.time}
                      onChange={handleAddEventChange}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${formErrors.time ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Select time"
                    />
                    {formErrors.time && <div className="text-red-600 text-xs mt-1">{formErrors.time}</div>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Agenda <span className="text-red-500">*</span>
                    </label>
                    <div className={`rounded-lg p-1 bg-white dark:bg-gray-700 dark:text-gray-700 ${formErrors.agenda ? 'border border-red-500' : ''}`}>
                      <CKEditor
                        editor={ClassicEditor}
                        data={addEventForm.agenda}
                        onChange={handleAgendaChange}
                        config={{
                          placeholder: 'Describe the event agenda and details',
                          contentsCss: getCKEditorContentsCss(),
                        }}
                      />
                    </div>
                    {formErrors.agenda && <div className="text-red-600 text-xs mt-1">{formErrors.agenda}</div>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Invitation Image
                    </label>
                    <input
                      type="file"
                      name="invitationImage"
                      accept="image/*"
                      onChange={handleAddEventChange}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
                {formErrors.api && (
                  <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
                    {formErrors.api}
                  </div>
                )}
                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={handleHideAddEventForm}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-2 px-8 py-2 rounded-lg font-medium transition-colors text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="text-lg">✔</span>
                        Save
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Event Modal */}
        {showEditEventModal && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-2xl relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                onClick={closeEditEventModal}
                title="Close"
              >
                <FiX size={24} />
              </button>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <FiEdit2 className="text-indigo-600 dark:text-indigo-300" />
                  Edit Event
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Modify the details of the event</p>
      </div>
              <form className="space-y-6" onSubmit={handleEditEventSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="event"
                      value={editEventForm.event}
                      onChange={handleEditEventChange}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${editFormErrors.event ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Enter event name"
                    />
                    {editFormErrors.event && <div className="text-red-600 text-xs mt-1">{editFormErrors.event}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Venue <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={editEventForm.venue}
                      onChange={handleEditEventChange}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${editFormErrors.venue ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Enter venue"
                    />
                    {editFormErrors.venue && <div className="text-red-600 text-xs mt-1">{editFormErrors.venue}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={editEventForm.date}
                      onChange={handleEditEventChange}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${editFormErrors.date ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Select date"
                    />
                    {editFormErrors.date && <div className="text-red-600 text-xs mt-1">{editFormErrors.date}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={editEventForm.time}
                      onChange={handleEditEventChange}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${editFormErrors.time ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Select time"
                    />
                    {editFormErrors.time && <div className="text-red-600 text-xs mt-1">{editFormErrors.time}</div>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Agenda <span className="text-red-500">*</span>
                    </label>
                    <div className={`rounded-lg p-1 bg-white dark:bg-gray-700 ${editFormErrors.agenda ? 'border border-red-500' : ''}`}>
                      <CKEditor
                        editor={ClassicEditor}
                        data={editEventForm.agenda}
                        onChange={handleEditAgendaChange}
                        config={{
                          placeholder: 'Describe the event agenda and details',
                          contentsCss: getCKEditorContentsCss(),
                        }}
                      />
                    </div>
                    {editFormErrors.agenda && <div className="text-red-600 text-xs mt-1">{editFormErrors.agenda}</div>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Invitation Image
                    </label>
                    <input
                      type="file"
                      name="invitationImage"
                      accept="image/*"
                      onChange={handleEditEventChange}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
                {editError && (
                  <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
                    {editError}
                  </div>
                )}
                {editSuccess && (
                  <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg">
                    {editSuccess}
                  </div>
                )}
                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={closeEditEventModal}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className={`flex items-center gap-2 px-8 py-2 rounded-lg font-medium transition-colors text-white ${editLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {editLoading ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="text-lg">✔</span>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* Removed custom notification UI */}
    </DashboardLayout>
  );
} 