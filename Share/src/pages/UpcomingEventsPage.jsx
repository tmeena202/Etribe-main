import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiPlus, FiFileText, FiFile, FiEye, FiX, FiCalendar, FiMapPin, FiClock, FiSearch, FiFilter, FiDownload, FiCopy, FiEdit2, FiTrash2, FiRefreshCw, FiImage, FiTrendingUp, FiChevronDown, FiChevronUp } from "react-icons/fi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../api/axiosConfig";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { toast } from 'react-toastify';
import { getAuthHeaders } from "../utils/apiHeaders";


// Helper to decode HTML entities
function decodeHtml(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
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
        'https://cdn.ckeditor.com/ckeditor5/39.0.1/classic/styles.css',
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
        'https://cdn.ckeditor.com/ckeditor5/39.0.1/classic/styles.css',
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

export default function UpcomingEventsPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showViewEventModal, setShowViewEventModal] = useState(false);
  const [selectedEventIdx, setSelectedEventIdx] = useState(null);
  const [imageError, setImageError] = useState(false);
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
  const [sortField, setSortField] = useState('event');
  const [sortDirection, setSortDirection] = useState('asc');

  // Edit Event State
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
  const [showExportDropdown, setShowExportDropdown] = useState(false);


  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      // toast.dismiss();
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        if (!token) {
          toast.error("Please log in to view upcoming events");
          window.location.href = "/";
          return;
        }
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
        const BASE_URL = "https://api.etribes.in"; // Change to your backend's base URL
        const mappedEvents = backendEvents.map((e, idx) => {
          let datetime = '';
          if (e.event_date && e.event_time) {
            const dt = `${e.event_date}T${e.event_time}`;
            datetime = !isNaN(new Date(dt)) && dt.includes('T') ? dt : '';
          }
          return {
            id: e.id || idx,
            event: e.event_title || e.event || e.title || e.name || "",
            agenda: e.event_description || e.agenda || e.description || "",
            venue: e.event_venue || e.venue || e.location || "",
            datetime,
            imageUrl: e.event_image
              ? (e.event_image.startsWith("http") ? e.event_image : BASE_URL + e.event_image)
              : (e.image || e.imageUrl || ""),
          };
        });
        setEvents(mappedEvents);
      } catch (err) {
        toast.error('Failed to fetch upcoming events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
    // Removed setInterval polling
    // Only call fetchEvents after CRUD operations
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

  // Add Event Modal
  const openAddEventModal = () => {
    setAddEventForm({ event: "", agenda: "", venue: "", datetime: "", imageUrl: "" });
    setFormErrors({}); // Clear previous errors
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
        headers: getAuthHeaders(),
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
      // Refresh events after adding
      setLoading(true);
      try {
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
        const BASE_URL = "https://api.etribes.in";
        const mappedEvents = backendEvents.map((e, idx) => {
          let datetime = '';
          if (e.event_date && e.event_time) {
            const dt = `${e.event_date}T${e.event_time}`;
            datetime = !isNaN(new Date(dt)) && dt.includes('T') ? dt : '';
          }
          return {
            id: e.id || idx,
            event: e.event_title || e.event || e.title || e.name || "",
            agenda: e.event_description || e.agenda || e.description || "",
            venue: e.event_venue || e.venue || e.location || "",
            datetime,
            imageUrl: e.event_image
              ? (e.event_image.startsWith("http") ? e.event_image : BASE_URL + e.event_image)
              : (e.image || e.imageUrl || ""),
          };
        });
        setEvents(mappedEvents);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      toast.error('Failed to add event');
    } finally {
      setSaveLoading(false);
    }
  };
  const handleShowAddEventForm = () => setShowAddEventModal(true);
  const handleHideAddEventForm = () => setShowAddEventModal(false);

  // View Event Modal
  const openViewEventModal = (idx) => {
    setSelectedEventIdx(idx);
    setShowViewEventModal(true);
  };
  const closeViewEventModal = () => setShowViewEventModal(false);

  // Export Handlers (CSV, Excel, PDF)
  const handleExportCSV = () => {
    if (!events.length) return;
    const headers = ["Event", "Agenda", "Venue", "Date & Time"];
    const rows = events.map(e => [
      e.event,
      e.agenda,
      e.venue,
      e.datetime && !isNaN(new Date(e.datetime)) && e.datetime.includes('T') ? new Date(e.datetime).toLocaleString() : "TBD",
    ]);
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "upcoming_events.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Events exported to CSV!');
  };

  // Excel Export
  const handleExportExcel = () => {
    if (!events.length) return;
    const ws = XLSX.utils.json_to_sheet(
      events.map(e => ({
        Event: e.event,
        Agenda: e.agenda,
        Venue: e.venue,
        "Date & Time": e.datetime && !isNaN(new Date(e.datetime)) && e.datetime.includes('T') ? new Date(e.datetime).toLocaleString() : "TBD",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Upcoming Events");
    XLSX.writeFile(wb, "upcoming_events.xlsx");
    toast.success('Events exported to Excel!');
  };

  // PDF Export
  const handleExportPDF = () => {
    if (!events.length) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    const headers = [[
      "Event", "Agenda", "Venue", "Date & Time"
    ]];
    const rows = events.map(e => [
      e.event,
      e.agenda,
      e.venue,
      e.datetime && !isNaN(new Date(e.datetime)) && e.datetime.includes('T') ? new Date(e.datetime).toLocaleString() : "TBD",
    ]);
    try {
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      doc.save("upcoming_events.pdf");
      toast.success('Events exported to PDF!');
    } catch (err) {
      alert("PDF export failed: " + err.message);
    }
  };

  const handleCopyToClipboard = () => {
    const data = events.map(e => 
      `${e.event},${e.agenda},${e.venue},${e.datetime && !isNaN(new Date(e.datetime)) && e.datetime.includes('T') ? new Date(e.datetime).toLocaleString() : "TBD"}`
    ).join('\n');
    navigator.clipboard.writeText(data);
    toast.success('Event copied to clipboard!');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Delete event handler
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setSaveLoading(true);
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
      // Refresh events after deleting
      setLoading(true);
      try {
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
        const BASE_URL = "https://api.etribes.in";
        const mappedEvents = backendEvents.map((e, idx) => {
          let datetime = '';
          if (e.event_date && e.event_time) {
            const dt = `${e.event_date}T${e.event_time}`;
            datetime = !isNaN(new Date(dt)) && dt.includes('T') ? dt : '';
          }
          return {
            id: e.id || idx,
            event: e.event_title || e.event || e.title || e.name || "",
            agenda: e.event_description || e.agenda || e.description || "",
            venue: e.event_venue || e.venue || e.location || "",
            datetime,
            imageUrl: e.event_image
              ? (e.event_image.startsWith("http") ? e.event_image : BASE_URL + e.event_image)
              : (e.image || e.imageUrl || ""),
          };
        });
        setEvents(mappedEvents);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      toast.error('Failed to delete event.');
      setTimeout(() => toast.dismiss(), 3000);
    } finally {
      setSaveLoading(false);
    }
  };

  // Open Edit Modal
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

  // Edit form change handlers
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

  // Edit form validation
  const validateEditForm = () => {
    const errors = {};
    if (!editEventForm.event.trim()) errors.event = 'The Event Title field is required.';
    if (!editEventForm.agenda || !editEventForm.agenda.replace(/<[^>]*>/g, '').trim()) errors.agenda = 'The Agenda field is required.';
    if (!editEventForm.venue.trim()) errors.venue = 'The Venue field is required.';
    if (!editEventForm.date.trim()) errors.date = 'The Date field is required.';
    if (!editEventForm.time.trim()) errors.time = 'The Time field is required.';
    return errors;
  };

  // Edit Event API call
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
        headers: getAuthHeaders(),
        credentials: 'include',
        body: formData,
      });
      toast.success('Event updated successfully!');
      setShowEditEventModal(false);
      setTimeout(() => toast.dismiss(), 2000);
      // Refresh events after editing
      setLoading(true);
      try {
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
        const BASE_URL = "https://api.etribes.in";
        const mappedEvents = backendEvents.map((e, idx) => {
          let datetime = '';
          if (e.event_date && e.event_time) {
            const dt = `${e.event_date}T${e.event_time}`;
            datetime = !isNaN(new Date(dt)) && dt.includes('T') ? dt : '';
          }
          return {
            id: e.id || idx,
            event: e.event_title || e.event || e.title || e.name || "",
            agenda: e.event_description || e.agenda || e.description || "",
            venue: e.event_venue || e.venue || e.location || "",
            datetime,
            imageUrl: e.event_image
              ? (e.event_image.startsWith("http") ? e.event_image : BASE_URL + e.event_image)
              : (e.image || e.imageUrl || ""),
          };
        });
        setEvents(mappedEvents);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      toast.error('Failed to update event');
      setShowEditEventModal(false);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
          <p className="text-indigo-700">Loading upcoming events...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
              <div className="flex flex-col gap-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Upcoming Events</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiTrendingUp className="text-indigo-600" />
              <span>Total Upcoming Events: {events.length}</span>
            </div>
          </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 max-w-7xl w-full mx-auto border border-gray-200 dark:border-gray-700">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search upcoming events, agenda, or venue..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors w-full"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                <span>Showing {startIdx + 1} to {Math.min(startIdx + entriesPerPage, totalEntries)} of {totalEntries} entries</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!showAddEventModal && (
                  <button
                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                    onClick={handleShowAddEventForm}
                    title="Add Event"
                  >
                    <FiPlus />
                    <span>Add Event</span>
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                  onClick={handleRefresh}
                  title="Refresh Data"
                >
                  <FiRefreshCw /> 
                  <span>Refresh</span>
                </button>
              </div>
              
              {/* Desktop Export Buttons - Show only on desktop */}
              <div className="hidden lg:flex items-center gap-2">
                <button 
                  className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
                  onClick={handleCopyToClipboard}
                  title="Copy to Clipboard"
                >
                  <FiCopy /> 
                  Copy
                </button>
                
                <button 
                  className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                  onClick={handleExportCSV}
                  title="Export CSV"
                >
                  <FiDownload /> 
                  CSV
                </button>
                
                <button 
                  className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition"
                  onClick={handleExportExcel}
                  title="Export Excel"
                >
                  <FiFile /> 
                  Excel
                </button>
                
                <button 
                  className="flex items-center gap-1 bg-rose-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-rose-600 transition"
                  onClick={handleExportPDF}
                  title="Export PDF"
                >
                  <FiFile /> 
                  PDF
                </button>
              </div>
              
              {/* Export Dropdown - Show on all responsive devices (tablet, mobile) */}
              <div className="relative lg:hidden">
                <button
                  className="flex items-center gap-1 bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                >
                  <FiDownload />
                  <span>Export</span>
                  <FiChevronDown className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showExportDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 min-w-32 export-dropdown">
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                      onClick={() => {
                        handleCopyToClipboard();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiCopy className="text-gray-500" />
                      Copy
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        handleExportCSV();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiDownload className="text-green-500" />
                      CSV
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        handleExportExcel();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiFile className="text-emerald-500" />
                      Excel
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                      onClick={() => {
                        handleExportPDF();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiFile className="text-rose-500" />
                      PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search upcoming events, agenda, or venue..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Filtered: {filtered.length} of {events.length}</span>
              </div>
            </div>
          </div>

          {/* Table - Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-gray-700 dark:text-gray-200 sticky top-0 z-10 shadow-sm">
                <tr className="border-b-2 border-indigo-200 dark:border-indigo-800">
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors" onClick={() => handleSort("event")}>
                    <div className="flex items-center gap-2">
                      Event Name {getSortIcon("event")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors" onClick={() => handleSort("agenda")}>
                    <div className="flex items-center gap-2">
                      Agenda {getSortIcon("agenda")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors" onClick={() => handleSort("venue")}>
                    <div className="flex items-center gap-2">
                      Venue {getSortIcon("venue")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors" onClick={() => handleSort("datetime")}>
                    <div className="flex items-center gap-2">
                      Date & Time {getSortIcon("datetime")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((event, idx) => (
                  <tr key={event.id || idx} className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'} hover:bg-indigo-50 dark:hover:bg-gray-700 hover:shadow-sm`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 dark:from-indigo-800 dark:to-purple-900 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {event.event.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.event}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Upcoming Event #{startIdx + idx + 1}</div>
        </div>
      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={stripHtml(event.agenda)}>
                        {stripHtml(event.agenda)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          <FiMapPin className="mr-1" size={10} />
                          {event.venue || 'No venue'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          <FiClock className="mr-1" size={10} />
                          {event.datetime ? new Date(event.datetime).toLocaleDateString() : 'TBD'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                      <button
                          className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors" 
                          onClick={() => openViewEventModal(idx)}
                          title="View Event Details"
                      >
                          <FiEye size={16} />
                        </button>
                        <button className="text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-400 transition-colors" title="Edit Event" onClick={() => openEditEventModal(event)}>
                          <FiEdit2 size={16} />
                        </button>
                        <button className="text-red-600 dark:text-red-300 hover:text-red-900 dark:hover:text-red-400 transition-colors" title="Delete Event" onClick={() => handleDeleteEvent(event.id)} disabled={saveLoading}>
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden p-4 sm:p-6 space-y-4">
            {paginated.map((event, idx) => (
              <div key={event.id || idx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 dark:from-indigo-800 dark:to-purple-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-white">
                        {event.event.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{event.event}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming Event #{startIdx + idx + 1}</p>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          <FiMapPin className="mr-1" size={10} />
                          <span className="truncate">{event.venue}</span>
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          <FiClock className="mr-1" size={10} />
                          <span className="truncate">{event.datetime ? new Date(event.datetime).toLocaleDateString() : "TBD"}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors p-1"
                      onClick={() => openViewEventModal(idx)}
                      title="View Event Details"
                    >
                      <FiEye size={14} />
                    </button>
                    <button
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors p-1"
                      title="Edit Event"
                      onClick={() => openEditEventModal(event)}
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors p-1"
                      title="Delete Event"
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={saveLoading}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <FiCalendar className="text-gray-400 flex-shrink-0 mt-0.5" size={14} />
                    <div className="text-gray-700 dark:text-gray-300 text-xs line-clamp-3">
                      {stripHtml(event.agenda).slice(0, 100)}
                      {stripHtml(event.agenda).length > 100 && "..."}
                    </div>
                  </div>
                  {event.datetime && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <FiClock className="text-gray-400 flex-shrink-0" size={12} />
                      <span>{new Date(event.datetime).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls - moved outside scrollable area */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400">
                <span>Showing {startIdx + 1} to {Math.min(startIdx + entriesPerPage, filtered.length)} of {filtered.length} results</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-400">Show</span>
                <select
                    className="border rounded-lg px-3 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 text-gray-700 focus:ring-2 focus:ring-indigo-400 transition-colors"
                  value={entriesPerPage}
                  onChange={handleEntriesChange}
                >
                    {[5, 10, 20, 50].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                  <span className="text-sm text-gray-700 dark:text-gray-400">entries</span>
    </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Previous"
                >
                  &lt;
                </button>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 px-1 sm:px-2">
                  {currentPage}/{totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Next"
                >
                  &gt;
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAddEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
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
                    <div className={`rounded-lg p-1 bg-white dark:bg-gray-700 ${formErrors.agenda ? 'border border-red-500' : ''}`}>
                      <CKEditor
                        editor={ClassicEditor}
                        data={addEventForm.agenda}
                        onReady={editor => {
                          // You can store the "editor" and use it later to do something with it.
                          // For example, we can set the data in it when it's ready.
                          // editor.setData(addEventForm.agenda);
                        }}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setAddEventForm({ ...addEventForm, agenda: data });
                          setFormErrors({ ...formErrors, agenda: undefined });
                        }}
                        onBlur={(event, editor) => {
                          const data = editor.getData();
                          setAddEventForm({ ...addEventForm, agenda: data });
                          setFormErrors({ ...formErrors, agenda: undefined });
                        }}
                        onFocus={(event, editor) => {
                          // The editor is ready to accept commands.
                        }}
                        config={{
                          // This is optional, but if you want to add any specific CKEditor config,
                          // you can add it here.
                          // For example, if you want to add a toolbar, you can add it here.
                          // toolbar: [ 'bold', 'italic', 'underline', 'link' ],
                          // This is for CKEditor 5 Classic Editor.
                          // For CKEditor 5 Balloon Editor, you would use:
                          // balloonToolbar: [ 'bold', 'italic', 'underline', 'link' ],
                        }}
                        onError={(error, t) => {
                          console.error("CKEditor error:", error);
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
                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={handleHideAddEventForm}
                    disabled={saveLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className={`flex items-center gap-2 px-8 py-2 rounded-lg font-medium transition-colors text-white ${saveLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {saveLoading ? (
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

        {showEditEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                onClick={closeEditEventModal}
                title="Close"
                disabled={editLoading}
              >
                <FiX size={24} />
              </button>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <FiEdit2 className="text-blue-600 dark:text-blue-300" />
                  Edit Event
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Update event details, venue, and schedule</p>
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
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-transparent transition-colors ${editFormErrors.event ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
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
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-transparent transition-colors ${editFormErrors.venue ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
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
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-transparent transition-colors ${editFormErrors.date ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
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
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-transparent transition-colors ${editFormErrors.time ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
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
                        onReady={editor => {
                          // You can store the "editor" and use it later to do something with it.
                          // For example, we can set the data in it when it's ready.
                          // editor.setData(editEventForm.agenda);
                        }}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setEditEventForm({ ...editEventForm, agenda: data });
                          setEditFormErrors({ ...editFormErrors, agenda: undefined });
                        }}
                        onBlur={(event, editor) => {
                          const data = editor.getData();
                          setEditEventForm({ ...editEventForm, agenda: data });
                          setEditFormErrors({ ...editFormErrors, agenda: undefined });
                        }}
                        onFocus={(event, editor) => {
                          // The editor is ready to accept commands.
                        }}
                        config={{
                          // This is optional, but if you want to add any specific CKEditor config,
                          // you can add it here.
                          // For example, if you want to add a toolbar, you can add it here.
                          // toolbar: [ 'bold', 'italic', 'underline', 'link' ],
                          // This is for CKEditor 5 Classic Editor.
                          // For CKEditor 5 Balloon Editor, you would use:
                          // balloonToolbar: [ 'bold', 'italic', 'underline', 'link' ],
                        }}
                        onError={(error, t) => {
                          console.error("CKEditor error:", error);
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
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-transparent transition-colors border-gray-200 dark:border-gray-600"
                    />
                    {editEventForm.imageUrl && (
                      <div className="mt-2">
                        <img src={editEventForm.imageUrl} alt="Current" className="h-20 rounded-lg border dark:border-gray-600" />
                        <span className="block text-xs text-gray-500 dark:text-gray-400">Current image</span>
                      </div>
                    )}
                  </div>
                </div>
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
                        Save
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Event Modal */}
        {showViewEventModal && selectedEventIdx !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-lg mx-4 relative">
            <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                onClick={closeViewEventModal}
                title="Close"
                aria-label="Close modal"
              >
                <FiX size={24} />
            </button>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                  <FiEye className="text-indigo-600" />
                  Upcoming Event Details
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">View complete upcoming event information</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <FiCalendar className="text-indigo-600" />
                    Event Information
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div><span className="font-medium text-gray-800 dark:text-gray-100">Event:</span> {paginated[selectedEventIdx]?.event}</div>
                    <div><span className="font-medium text-gray-800 dark:text-gray-100">Venue:</span> {paginated[selectedEventIdx]?.venue}</div>
                    <div><span className="font-medium text-gray-800 dark:text-gray-100">Date & Time:</span> {paginated[selectedEventIdx]?.datetime && !isNaN(new Date(paginated[selectedEventIdx]?.datetime)) && paginated[selectedEventIdx]?.datetime.includes('T')
  ? new Date(paginated[selectedEventIdx]?.datetime).toLocaleString()
  : 'TBD'}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Agenda</h3>
                  <div 
                    className="text-sm text-gray-600 dark:text-gray-300"
                    dangerouslySetInnerHTML={{
                      __html: decodeHtml(paginated[selectedEventIdx]?.agenda || ""),
                    }}
                  />
          </div>
                
                {paginated[selectedEventIdx]?.imageUrl && paginated[selectedEventIdx]?.imageUrl.trim() !== "" ? (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <FiImage className="text-indigo-600" />
                      Event Image
                    </h3>
                    <img
                      src={paginated[selectedEventIdx]?.imageUrl}
                      alt="Event"
                      className="rounded-lg border border-gray-200 dark:border-gray-700 shadow max-w-full max-h-48 object-cover"
                    />
                      </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <FiImage className="text-gray-400" />
                      Event Image
                    </h3>
                    <div className="text-gray-400 dark:text-gray-300 italic text-sm">No image available</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
