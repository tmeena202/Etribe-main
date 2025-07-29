import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

// Helper functions
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Helper to map backend events to calendar structure
function mapBackendEvents(backendEvents) {
  return backendEvents.map((e, idx) => {
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
      id: e.id || idx,
      name: e.event_title || e.event || e.title || e.name || '',
      date: eventDate,
      attendees: e.attendees || e.attendee_count || e.count || 0,
      description: e.event_description || e.agenda || e.description || '',
      type,
      imageUrl: e.event_image || '',
    };
  });
}

// Helper to parse backend response
function parseBackendResponse(response) {
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
  return backendEvents;
}

// Main calendar hook
export function useCalendar() {
  // Core state
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Stats state
  const [todayCount, setTodayCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [pastCount, setPastCount] = useState(0);

  // Add Event state
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

  // Edit Event state
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

  // API headers helper
  const getApiHeaders = () => {
    const token = localStorage.getItem('token');
    const uid = localStorage.getItem('uid');
    return {
      'Client-Service': 'COHAPPRT',
      'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
      'uid': uid,
      'token': token,
      'rurl': 'login.etribes.in',
      'Content-Type': 'application/json',
    };
  };

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/event/index', {}, {
        headers: getApiHeaders()
      });
      const backendEvents = parseBackendResponse(response);
      const mappedEvents = mapBackendEvents(backendEvents);
      setEvents(mappedEvents);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // Fetch event counts
  const fetchCounts = async () => {
    try {
      // Upcoming events count
      const futureRes = await api.post('/event/future', {}, {
        headers: getApiHeaders()
      });
      const futureEvents = parseBackendResponse(futureRes);
      setUpcomingCount(futureEvents.length);

      // Past events count
      const pastRes = await api.post('/event/past', {}, {
        headers: getApiHeaders()
      });
      const pastEvents = parseBackendResponse(pastRes);
      setPastCount(pastEvents.length);

      // Today events count
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

  // Add event handlers
  const handleAddEventChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'invitationImage') {
      setAddEventForm({ ...addEventForm, invitationImage: files[0] });
    } else {
      setAddEventForm({ ...addEventForm, [name]: value });
      setFormErrors({ ...formErrors, [name]: undefined });
    }
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
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
          'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || ''),
        },
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
      await fetchEvents(); // Refresh events
    } catch (err) {
      setShowAddEventForm(false);
      toast.error('Failed to add event');
      setTimeout(() => toast.dismiss(), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Edit event handlers
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

  const handleEditEventChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'invitationImage') {
      setEditEventForm({ ...editEventForm, invitationImage: files[0] });
    } else {
      setEditEventForm({ ...editEventForm, [name]: value });
      setEditFormErrors({ ...editFormErrors, [name]: undefined });
    }
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editEventForm.event.trim()) errors.event = 'The Event Title field is required.';
    if (!editEventForm.agenda || !editEventForm.agenda.replace(/<[^>]*>/g, '').trim()) errors.agenda = 'The Agenda field is required.';
    if (!editEventForm.venue.trim()) errors.venue = 'The Venue field is required.';
    if (!editEventForm.date.trim()) errors.date = 'The Date field is required.';
    if (!editEventForm.time.trim()) errors.time = 'The Time field is required.';
    return errors;
  };

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
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
          'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || ''),
        },
        credentials: 'include',
        body: formData,
      });
      toast.success('Event updated successfully!');
      setTimeout(() => toast.dismiss(), 2000);
      setShowEditEventModal(false);
      await fetchEvents(); // Refresh events
    } catch (err) {
      toast.error('Failed to update event');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete event handler
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      await fetch('/api/event/remove', {
        method: 'POST',
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
          'Content-Type': 'text/plain',
          'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || ''),
        },
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

  // Modal handlers
  const handleShowAddEventForm = () => setShowAddEventForm(true);
  const handleHideAddEventForm = () => setShowAddEventForm(false);
  const closeEditEventModal = () => setShowEditEventModal(false);

  // Effects
  useEffect(() => {
    fetchEvents();
    fetchCounts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Computed values
  const eventsForDate = events.filter(ev => isSameDay(ev.date, selectedDate));

  return {
    // State
    events,
    loading,
    error,
    time,
    selectedDate,
    todayCount,
    upcomingCount,
    pastCount,
    showAddEventForm,
    addEventForm,
    formErrors,
    showEditEventModal,
    editEventForm,
    editLoading,
    editError,
    editSuccess,
    editFormErrors,
    deleteLoading,
    deleteError,
    eventsForDate,

    // Actions
    setSelectedDate,
    handleAddEventChange,
    handleAddEventSubmit,
    handleShowAddEventForm,
    handleHideAddEventForm,
    openEditEventModal,
    handleEditEventChange,
    handleEditEventSubmit,
    closeEditEventModal,
    handleDeleteEvent,
    fetchEvents,
    fetchCounts,
  };
} 