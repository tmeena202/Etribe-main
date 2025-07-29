import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiPlus, FiFileText, FiFile, FiEye, FiX, FiCalendar, FiMapPin, FiClock, FiSearch, FiFilter, FiEdit2, FiTrash2, FiImage, FiTrendingUp } from "react-icons/fi";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import ExportButtons from "../utils/ExportButtons";
import { useUpcomingEvents } from "../hooks/useUpcomingEvents";

export default function UpcomingEventsPage() {
  const {
    // State
    events,
    search,
    currentPage,
    entriesPerPage,
    showAddEventModal,
    showViewEventModal,
    selectedEventIdx,
    addEventForm,
    formErrors,
    showAddEventForm,
    loading,
    sortField,
    sortDirection,
    saveLoading,
    showEditEventModal,
    editEventForm,
    editLoading,
    editFormErrors,
    deleteLoading,
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
    handleShowAddEventForm,
    handleHideAddEventForm,
    openViewEventModal,
    closeViewEventModal,
    handleDeleteEvent,
    openEditEventModal,
    closeEditEventModal,
    handleEditEventChange,
    handleEditAgendaChange,
    validateEditForm,
    handleEditEventSubmit,
    decodeHtml,
    stripHtml,
    getCKEditorContentsCss,
  } = useUpcomingEvents();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin text-indigo-600 text-2xl">⏳</div>
            <p className="text-indigo-700">Loading upcoming events...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3 px-2 sm:px-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Upcoming Events</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiTrendingUp className="text-indigo-600" />
            <span>Total Upcoming Events: {events.length}</span>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 w-full mx-auto border border-gray-200 dark:border-gray-700">
          {/* Header Controls and Search in Single Line */}
          <div className="flex flex-col gap-4 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
            {/* Title, Description, Search, and Action Buttons in Single Line */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="text-indigo-600 text-xl" />
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Upcoming Event Management</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiCalendar className="text-indigo-600" />
                  <span>Manage future events and schedules</span>
                </div>
              </div>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search upcoming events, agenda, or venue..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors"
                    style={{ minWidth: '250px' }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FiFilter className="text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Filtered: {filtered.length} of {events.length}</span>
                </div>
              </div>
            </div>
            
            {/* Export and Action Buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              <ExportButtons
                data={events}
                dataType="events"
                onRefresh={() => fetchEvents(false)}
                filename="upcoming_events"
                title="Upcoming Events Report"
                refreshMessage="Upcoming events refreshed successfully!"
                customConfig={{
                  headers: ["Event", "Agenda", "Venue", "Date & Time"],
                  fields: ["event", "agenda", "venue", "datetime"],
                  fieldMapping: {
                    "Event": "event",
                    "Agenda": "agenda",
                    "Venue": "venue",
                    "Date & Time": "datetime"
                  }
                }}
              />
              <button
                className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition w-full sm:w-auto justify-center"
                onClick={handleShowAddEventForm}
              >
                <FiPlus />
                Add Event
              </button>
            </div>
          </div>

          {/* Table - Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-white sticky top-0 z-10 shadow-sm">
                <tr className="border-b-2 border-indigo-200 dark:border-indigo-800">
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors" onClick={() => handleSort("event")}>
                    <div className="flex items-center gap-2">
                      Event Name {getSortIcon("event")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors" onClick={() => handleSort("agenda")}>
                    <div className="flex items-center gap-2">
                      Agenda {getSortIcon("agenda")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors" onClick={() => handleSort("venue")}>
                    <div className="flex items-center gap-2">
                      <FiMapPin />
                      Venue {getSortIcon("venue")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors" onClick={() => handleSort("datetime")}>
                    <div className="flex items-center gap-2">
                      <FiClock />
                      Date & Time {getSortIcon("datetime")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
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
                          <FiMapPin className="mr-1" />
                          {event.venue}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          <FiClock className="mr-1" />
                          {event.datetime && !isNaN(new Date(event.datetime)) && event.datetime.includes('T')
                            ? new Date(event.datetime).toLocaleString()
                            : 'TBD'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-sm font-medium">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <button
                          className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors p-1" 
                          onClick={() => openViewEventModal(idx)}
                          title="View Event Details"
                        >
                          <FiEye size={14} />
                        </button>
                        <button className="text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-400 transition-colors p-1" title="Edit Event" onClick={() => openEditEventModal(event)}>
                          <FiEdit2 size={14} />
                        </button>
                        <button className="text-red-600 dark:text-red-300 hover:text-red-900 dark:hover:text-red-400 transition-colors p-1" title="Delete Event" onClick={() => handleDeleteEvent(event.id)} disabled={saveLoading}>
                          <FiTrash2 size={14} />
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
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 dark:from-indigo-800 dark:to-purple-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-white">
                        {event.event.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{event.event}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming Event #{startIdx + idx + 1}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors p-1.5" 
                      onClick={() => openViewEventModal(idx)}
                      title="View Event Details"
                    >
                      <FiEye size={14} />
                    </button>
                    <button 
                      className="text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-400 transition-colors p-1.5" 
                      title="Edit Event" 
                      onClick={() => openEditEventModal(event)}
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button 
                      className="text-red-600 dark:text-red-300 hover:text-red-900 dark:hover:text-red-400 transition-colors p-1.5" 
                      title="Delete Event" 
                      onClick={() => handleDeleteEvent(event.id)} 
                      disabled={saveLoading}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-gray-700 dark:text-gray-300">
                      {event.datetime && !isNaN(new Date(event.datetime)) && event.datetime.includes('T')
                        ? new Date(event.datetime).toLocaleString()
                        : 'TBD'}
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">
                      {stripHtml(event.agenda).slice(0, 100)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400">
                <span>Showing {startIdx + 1} to {Math.min(startIdx + entriesPerPage, filtered.length)} of {filtered.length} results</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
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
                    className={`px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors ${
                      currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
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
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAddEventForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-1" onClick={handleHideAddEventForm}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm mx-2 max-h-[98vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10 p-1"
                onClick={handleHideAddEventForm}
                title="Close"
              >
                <FiX size={18} />
              </button>
              <div className="p-4 pb-2 pr-10">
                <h2 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <FiPlus className="text-indigo-600 dark:text-indigo-300" />
                  Add New Event
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">Create a new event with details</p>
              </div>
              <form className="flex-1 flex flex-col" onSubmit={handleAddEventSubmit}>
                <div className="flex-1 overflow-y-auto px-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="event"
                      value={addEventForm.event}
                      onChange={handleAddEventChange}
                      className={`w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${formErrors.event ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Enter event name"
                    />
                    {formErrors.event && <div className="text-red-600 text-xs mt-1">{formErrors.event}</div>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Venue <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={addEventForm.venue}
                      onChange={handleAddEventChange}
                      className={`w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${formErrors.venue ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Enter venue"
                    />
                    {formErrors.venue && <div className="text-red-600 text-xs mt-1">{formErrors.venue}</div>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={addEventForm.date}
                        onChange={handleAddEventChange}
                        className={`w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${formErrors.date ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                        placeholder="Select date"
                      />
                      {formErrors.date && <div className="text-red-600 text-xs mt-1">{formErrors.date}</div>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={addEventForm.time}
                        onChange={handleAddEventChange}
                        className={`w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${formErrors.time ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                        placeholder="Select time"
                      />
                      {formErrors.time && <div className="text-red-600 text-xs mt-1">{formErrors.time}</div>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                          toolbar: ['bold', 'italic', 'bulletedList', 'numberedList'],
                          height: '120px',
                        }}
                      />
                    </div>
                    {formErrors.agenda && <div className="text-red-600 text-xs mt-1">{formErrors.agenda}</div>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Invitation Image
                    </label>
                    <input
                      type="file"
                      name="invitationImage"
                      accept="image/*"
                      onChange={handleAddEventChange}
                      className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div className="flex gap-2 p-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={handleHideAddEventForm}
                    disabled={saveLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className={`flex-1 flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${saveLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {saveLoading ? (
                      <>
                        <div className="animate-spin">⏳</div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="text-sm">✔</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-1" onClick={closeEditEventModal}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm mx-2 max-h-[98vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10 p-1"
                onClick={closeEditEventModal}
                title="Close"
                disabled={editLoading}
              >
                <FiX size={18} />
              </button>
              <div className="p-4 pb-2 pr-10">
                <h2 className="text-lg font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <FiEdit2 className="text-blue-600 dark:text-blue-300" />
                  Edit Event
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">Update event details</p>
              </div>
              <form className="flex-1 flex flex-col" onSubmit={handleEditEventSubmit}>
                <div className="flex-1 overflow-y-auto px-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="event"
                      value={editEventForm.event}
                      onChange={handleEditEventChange}
                      className={`w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-transparent transition-colors ${editFormErrors.event ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Enter event name"
                    />
                    {editFormErrors.event && <div className="text-red-600 text-xs mt-1">{editFormErrors.event}</div>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Venue <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={editEventForm.venue}
                      onChange={handleEditEventChange}
                      className={`w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-transparent transition-colors ${editFormErrors.venue ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                      placeholder="Enter venue"
                    />
                    {editFormErrors.venue && <div className="text-red-600 text-xs mt-1">{editFormErrors.venue}</div>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={editEventForm.date}
                        onChange={handleEditEventChange}
                        className={`w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-transparent transition-colors ${editFormErrors.date ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                        placeholder="Select date"
                      />
                      {editFormErrors.date && <div className="text-red-600 text-xs mt-1">{editFormErrors.date}</div>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={editEventForm.time}
                        onChange={handleEditEventChange}
                        className={`w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-transparent transition-colors ${editFormErrors.time ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                        placeholder="Select time"
                      />
                      {editFormErrors.time && <div className="text-red-600 text-xs mt-1">{editFormErrors.time}</div>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Agenda <span className="text-red-500">*</span>
                    </label>
                    <div className={`rounded-lg p-1 bg-white dark:bg-gray-700 dark:text-gray-700 ${editFormErrors.agenda ? 'border border-red-500' : ''}`}>
                      <CKEditor
                        editor={ClassicEditor}
                        data={editEventForm.agenda}
                        onChange={handleEditAgendaChange}
                        config={{
                          placeholder: 'Describe the event agenda and details',
                          contentsCss: getCKEditorContentsCss(),
                          toolbar: ['bold', 'italic', 'bulletedList', 'numberedList'],
                          height: '120px',
                        }}
                      />
                    </div>
                    {editFormErrors.agenda && <div className="text-red-600 text-xs mt-1">{editFormErrors.agenda}</div>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Invitation Image
                    </label>
                    <input
                      type="file"
                      name="invitationImage"
                      accept="image/*"
                      onChange={handleEditEventChange}
                      className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 focus:border-transparent transition-colors border-gray-200 dark:border-gray-600"
                    />
                    {editEventForm.imageUrl && (
                      <div className="mt-2">
                        <img src={editEventForm.imageUrl} alt="Current" className="h-16 rounded-lg border dark:border-gray-600" />
                        <span className="block text-xs text-gray-500 dark:text-gray-400">Current image</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 p-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={closeEditEventModal}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className={`flex-1 flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${editLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {editLoading ? (
                      <>
                        <div className="animate-spin">⏳</div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="text-sm">✔</span>
                        Save Changes
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
    </DashboardLayout>
  );
}