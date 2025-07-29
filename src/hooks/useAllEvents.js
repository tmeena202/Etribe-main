import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { toast } from 'react-toastify';

// Helper to get CKEditor contentsCss based on dark mode
function getCKEditorContentsCss() {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark
    ? [
        'https://cdn.ckeditor.com/ckeditor5/39.0.1/classic/styles.css',
        `
        body, .ck-editor__editable, .ck-content {
          background: #1a2233 !important;
          color: #000 !important;
        }
        .ck.ck-editor__main > .ck-editor__editable:not(.ck-focused) {
          background: #1a2233 !important;
          color: #000 !important;
        }
        .ck-placeholder, .ck-content ::placeholder {
          color: #000 !important;
          opacity: 1 !important;
        }
        `
      ]
    : [
        'https://cdn.ckeditor.com/ckeditor5/39.0.1/classic/styles.css',
        `
        body, .ck-editor__editable, .ck-content {
          background: #fff !important;
          color: #111827 !important;
        }
        .ck-placeholder, .ck-content ::placeholder {
          color: #111827 !important;
          opacity: 1 !important;
        }
        `
      ];
}

export const useAllEvents = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showViewEventModal, setShowViewEventModal] = useState(false);
  const [selectedEventIdx, setSelectedEventIdx] = useState(null);
  const [addEventForm, setAddEventForm] = useState({
    event: "",
    agenda: "",
    venue: "",
    date: "",
    time: "",
    reminder: "Yes",
    sendReminderTo: "Only Approved Members",
    invitationImage: null
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showAddEventForm, setShowAddEventForm] = useState(false);
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
  const [editFormErrors, setEditFormErrors] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortField, setSortField] = useState('event');
  const [sortDirection, setSortDirection] = useState('asc');
  const [imageError, setImageError] = useState(false);

  const fetchEvents = async (isFirst = false) => {
    if (isFirst) setLoading(true);
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
      const BASE_URL = "https://api.etribes.in";
      const mappedEvents = backendEvents.map((e, idx) => ({
        id: e.id || idx,
        event: e.event_title || e.event || e.title || e.name || "",
        agenda: e.event_description || e.agenda || e.description || "",
        venue: e.event_venue || e.venue || e.location || "",
        datetime: e.event_date && e.event_time
          ? `${e.event_date}T${e.event_time}`
          : e.datetime || e.date_time || e.date || "",
        imageUrl: e.event_image
          ? (e.event_image.startsWith("http") ? e.event_image : BASE_URL + e.event_image)
          : (e.image || e.imageUrl || ""),
      }));
      setEvents(mappedEvents);
    } catch (err) {
      toast.error('Failed to fetch all events');
    } finally {
      if (isFirst) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(true);
  }, []);

  // Filtered, sorted and paginated data
  const filtered = events.filter(e => 
    e.event.toLowerCase().includes(search.toLowerCase()) ||
    e.agenda.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === "datetime") {
      aVal = new Date(aVal || 0);
      bVal = new Date(bVal || 0);
    } else {
      aVal = aVal?.toLowerCase() || "";
      bVal = bVal?.toLowerCase() || "";
    }
    
    if (sortDirection === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const totalEntries = sorted.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIdx = (currentPage - 1) * entriesPerPage;
  const paginated = sorted.slice(startIdx, startIdx + entriesPerPage);

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handleEntriesChange = e => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const openAddEventModal = () => {
    setAddEventForm({ event: "", agenda: "", venue: "", datetime: "", imageUrl: "" });
    setFormErrors({});
    setShowAddEventModal(true);
  };

  const closeAddEventModal = () => setShowAddEventModal(false);

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
    setSaveLoading(true);
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
      toast.success('Event added successfully!');
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
      setShowAddEventForm(false);
      setTimeout(() => toast.dismiss(), 3000);
      await fetchEvents(false);
    } catch (err) {
      toast.error('Failed to add event');
      setShowAddEventForm(false);
    } finally {
      setSaveLoading(false);
    }
  };

  const openViewEventModal = (idx) => {
    setSelectedEventIdx(idx);
    setImageError(false);
    setShowViewEventModal(true);
  };

  const closeViewEventModal = () => setShowViewEventModal(false);

  const handleShowAddEventForm = () => setShowAddEventForm(true);
  const handleHideAddEventForm = () => setShowAddEventForm(false);

  const openEditEventModal = (event) => {
    setEditEventForm({
      id: event.id,
      event: event.event,
      agenda: event.agenda,
      venue: event.venue,
      date: event.datetime ? event.datetime.split('T')[0] : '',
      time: event.datetime ? event.datetime.split('T')[1]?.slice(0,5) : '',
      invitationImage: null,
      imageUrl: event.imageUrl || '',
    });
    setEditFormErrors({});
    setShowEditEventModal(true);
  };

  const closeEditEventModal = () => setShowEditEventModal(false);

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
      toast.error(Object.values(errors).join('\n'));
      setShowEditEventModal(false);
      return;
    }
    setEditLoading(true);
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
      setShowEditEventModal(false);
      setTimeout(() => toast.dismiss(), 2000);
      await fetchEvents(false);
    } catch (err) {
      toast.error('Failed to update event');
      setShowEditEventModal(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setDeleteLoading(true);
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
    } catch (err) {
      toast.error('Failed to delete event.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    // State
    events,
    search,
    currentPage,
    entriesPerPage,
    showAddEventModal,
    showViewEventModal,
    selectedEventIdx,
    addEventForm,
    loading,
    saveLoading,
    formErrors,
    showAddEventForm,
    showEditEventModal,
    editEventForm,
    editLoading,
    editFormErrors,
    deleteLoading,
    sortField,
    sortDirection,
    imageError,
    filtered,
    sorted,
    totalEntries,
    totalPages,
    startIdx,
    paginated,
    
    // Actions
    setSearch,
    setCurrentPage,
    setEntriesPerPage,
    setAddEventForm,
    setFormErrors,
    setEditEventForm,
    setEditFormErrors,
    setImageError,
    
    // Functions
    fetchEvents,
    handlePrev,
    handleNext,
    handleEntriesChange,
    handleSort,
    getSortIcon,
    openAddEventModal,
    closeAddEventModal,
    handleAddEventChange,
    handleAgendaChange,
    validateForm,
    handleAddEventSubmit,
    openViewEventModal,
    closeViewEventModal,
    handleShowAddEventForm,
    handleHideAddEventForm,
    openEditEventModal,
    closeEditEventModal,
    handleEditEventChange,
    handleEditAgendaChange,
    validateEditForm,
    handleEditEventSubmit,
    handleDeleteEvent,
    getCKEditorContentsCss,
  };
}; 