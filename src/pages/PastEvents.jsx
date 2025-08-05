import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiPlus, FiFileText, FiFile, FiEye, FiX, FiCalendar, FiMapPin, FiClock, FiSearch, FiFilter, FiDownload, FiCopy, FiEdit2, FiTrash2, FiRefreshCw, FiImage, FiArchive, FiAlertCircle } from "react-icons/fi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../api/axiosConfig";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { toast } from 'react-toastify';


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

export default function PastEvents() {
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
  const [imageError, setImageError] = useState(false);
  const [sortField, setSortField] = useState("datetime");
  const [sortDirection, setSortDirection] = useState("desc");
  const [formErrors, setFormErrors] = useState({});
  const [showAddEventForm, setShowAddEventForm] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      // toast.dismiss();
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        const response = await api.post('/event/past', {}, {
          headers: {
            'Client-Service': 'COHAPPRT',
            'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
            'uid': uid,
            'token': token,
            'rurl': 'etribes.ezcrm.site',
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
        const BASE_URL = "https://api.etribes.ezcrm.site";
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
        toast.error('Failed to fetch past events');
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
          'rurl': 'etribes.ezcrm.site',
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
    } catch (err) {
      toast.error('Failed to add event');
      setShowAddEventForm(false);
    } finally {
      setSaveLoading(false);
    }
  };
  const handleShowAddEventForm = () => setShowAddEventForm(true);
  const handleHideAddEventForm = () => setShowAddEventForm(false);

  // View Event Modal
  const openViewEventModal = (idx) => {
    setSelectedEventIdx(idx);
    setImageError(false);
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
      e.datetime ? new Date(e.datetime).toLocaleString() : "",
    ]);
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "past_events.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Events exported to CSV!');
  };

  const handleExportExcel = () => {
    if (!events.length) return;
    const ws = XLSX.utils.json_to_sheet(
      events.map(e => ({
        Event: e.event,
        Agenda: e.agenda,
        Venue: e.venue,
        "Date & Time": e.datetime ? new Date(e.datetime).toLocaleString() : "",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Past Events");
    XLSX.writeFile(wb, "past_events.xlsx");
    toast.success('Events exported to Excel!');
  };

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
      e.datetime ? new Date(e.datetime).toLocaleString() : "",
    ]);
    try {
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      doc.save("past_events.pdf");
      toast.success('Events exported to PDF!');
    } catch (err) {
      alert("PDF export failed: " + err.message);
    }
  };

  const handleCopyToClipboard = () => {
    const data = events.map(e => 
      `${e.event},${e.agenda},${e.venue},${e.datetime ? new Date(e.datetime).toLocaleString() : ""}`
    ).join('\n');
    navigator.clipboard.writeText(data);
    toast.success('Event copied to clipboard!');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
          <p className="text-indigo-700">Loading past events...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-orange-600">Past Events</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiAlertCircle className="text-indigo-600" />
            <span>Total Past Events: {events.length}</span>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 max-w-7xl w-full mx-auto border border-gray-200 dark:border-gray-700">
          {/* Header Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FiFileText />
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Past Event Management</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FiCalendar className="text-indigo-600" />
                <span>Manage completed events and history</span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <button
                className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                onClick={handleExportCSV}
                title="Export to CSV"
              >
                <FiFileText />
                CSV
              </button>
              <button
                className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition"
                onClick={handleExportExcel}
                title="Export to Excel"
              >
                <FiFile />
                Excel
              </button>
              <button
                className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                onClick={handleExportPDF}
                title="Export to PDF"
              >
                <FiFile />
                PDF
              </button>
              <button
                className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
                onClick={handleCopyToClipboard}
                title="Copy to Clipboard"
              >
                <FiCopy />
                Copy
              </button>
              <button
                className="flex items-center gap-1 bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition"
                onClick={handleRefresh}
                title="Refresh Events"
              >
                <FiRefreshCw />
                Refresh
              </button>
            <button
                className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                onClick={handleShowAddEventForm}
            >
                <FiPlus />
                Add Event
            </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search past events, agenda, or venue..."
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-gray-700 dark:text-gray-200 sticky top-0 z-10 shadow-sm">
                <tr className="border-b-2 border-indigo-200 dark:border-indigo-800">
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors" style={{ minWidth: '150px', width: '150px' }} onClick={() => handleSort('event')}>
                    <div className="flex items-center gap-1">
                      Event Name {getSortIcon('event')}
                    </div>
                  </th>
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors" style={{ minWidth: '180px', width: '180px' }} onClick={() => handleSort('agenda')}>
                    <div className="flex items-center gap-1">
                      Agenda {getSortIcon('agenda')}
                    </div>
                  </th>
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors" style={{ minWidth: '150px', width: '150px' }} onClick={() => handleSort('venue')}>
                    <div className="flex items-center gap-1">
                      <FiMapPin /> Venue {getSortIcon('venue')}
                    </div>
                  </th>
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors" style={{ minWidth: '120px', width: '120px' }} onClick={() => handleSort('datetime')}>
                    <div className="flex items-center gap-1">
                      <FiClock /> Date & Time {getSortIcon('datetime')}
                    </div>
                  </th>
                  <th className="p-3 text-center font-semibold whitespace-nowrap" style={{ minWidth: '80px', width: '80px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((event, idx) => (
                  <tr key={event.id || idx} className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'} hover:bg-indigo-50 dark:hover:bg-gray-700 hover:shadow-sm`}>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 dark:from-indigo-800 dark:to-purple-900 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {event.event.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{event.event}</span>
                      </div>
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{stripHtml(event.agenda)}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          <FiMapPin className="mr-1" />
                          {event.venue}
                        </span>
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                          <FiClock className="mr-1" />
                          {event.datetime ? new Date(event.datetime).toLocaleString() : "TBD"}
                        </span>
                    </td>
                    <td className="p-3 text-center">
                      <button className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors" title="View Event" onClick={() => openViewEventModal(idx)}>
                        <FiEye size={18} />
                      </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
                <select
                className="border rounded-lg px-3 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 text-gray-700 focus:ring-2 focus:ring-indigo-400 transition-colors"
                  value={entriesPerPage}
                  onChange={handleEntriesChange}
                >
                  {[5, 10, 25, 50, 100].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">entries per page</span>
              </div>
                
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  title="Previous"
                  >
                    Previous
                </button>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Page {currentPage} of {totalPages}
                  </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  title="Next"
                  >
                    Next
                </button>
            </div>
          </div>
        </div>

        {/* Add Event Modal */}
        {showAddEventForm && (
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
                <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                  <FiPlus className="text-indigo-600" />
                  Add New Event
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Create a new past event with details, venue, and schedule</p>
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
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors ${formErrors.event ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Enter event name"
                    />
                    {formErrors.event && (
                      <div className="text-red-600 text-xs mt-1">{formErrors.event}</div>
                    )}
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
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors ${formErrors.venue ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Enter venue"
                    />
                    {formErrors.venue && (
                      <div className="text-red-600 text-xs mt-1">{formErrors.venue}</div>
                    )}
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
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors ${formErrors.date ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Select date"
                    />
                    {formErrors.date && (
                      <div className="text-red-600 text-xs mt-1">{formErrors.date}</div>
                    )}
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
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors ${formErrors.time ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Select time"
                    />
                    {formErrors.time && (
                      <div className="text-red-600 text-xs mt-1">{formErrors.time}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image URL
                    </label>
                    <input
                      type="file"
                      name="invitationImage"
                      onChange={handleAddEventChange}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                      accept="image/*"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Agenda <span className="text-red-500">*</span>
                    </label>
                    <div className={`rounded-lg p-1 bg-white dark:bg-gray-700 ${formErrors.agenda ? 'border border-red-500' : ''}`}>
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
                    {formErrors.agenda && (
                      <div className="text-red-600 text-xs mt-1">{formErrors.agenda}</div>
                    )}
                  </div>
                </div>
                
                {/* Removed saveError and saveSuccess messages */}
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={handleHideAddEventForm}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                      saveLoading 
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {saveLoading ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <FiPlus />
                        Add Event
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
                  Past Event Details
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">View complete past event information</p>
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
                    <div><span className="font-medium text-gray-800 dark:text-gray-100">Date & Time:</span> {paginated[selectedEventIdx]?.datetime && new Date(paginated[selectedEventIdx]?.datetime).toLocaleString()}</div>
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
                
                {paginated[selectedEventIdx]?.imageUrl && paginated[selectedEventIdx]?.imageUrl.trim() !== "" && !imageError ? (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                      <FiImage className="text-indigo-600" />
                      Event Image
                    </h3>
                    <img
                      src={paginated[selectedEventIdx]?.imageUrl}
                      alt="Event"
                      className="rounded-lg border border-gray-200 dark:border-gray-700 shadow max-w-full max-h-48 object-cover"
                      onError={() => setImageError(true)}
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
      {/* Removed custom notification UI */}
    </DashboardLayout>
  );
}
