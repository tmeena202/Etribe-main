import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiCalendar, FiPlus, FiClock, FiUsers, FiMapPin, FiSearch, FiFilter, FiRefreshCw, FiEye, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useCalendar } from "../hooks/useCalendar";

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
    <div className="h-full flex flex-col justify-center">
      {/* Calendar Header - Improved mobile layout */}
      <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 px-1">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
          aria-label="Previous month"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 text-center px-2">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
          aria-label="Next month"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Day Headers - Enhanced for mobile */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2 md:mb-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-[10px] xs:text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 py-1.5 sm:py-2 md:py-3 border-b-2 border-indigo-200 dark:border-indigo-600 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid - Enhanced for mobile */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg sm:rounded-xl p-0.5 sm:p-1 md:p-2 flex-1 border-2 border-indigo-200 dark:border-indigo-600 shadow-inner">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={index} className="aspect-square min-h-[2.5rem] sm:min-h-[3rem]"></div>;
          }
          const dayDate = new Date(currentYear, currentMonth, day);
          const eventsForDay = events.filter(event => isSameDay(new Date(event.date), dayDate));
          const isSelected = isSameDay(dayDate, selectedDate);
          const isToday = isSameDay(dayDate, today);
          const dotColor = getEventDotColor(eventsForDay);

          // Enhanced responsive classes with borders for mobile
          let cellClass = "aspect-square min-h-[2rem] xs:min-h-[2.5rem] sm:min-h-[3rem] p-0.5 sm:p-1 md:p-2 cursor-pointer rounded-md sm:rounded-lg md:rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg relative group touch-manipulation border border-indigo-100 dark:border-indigo-700 bg-white dark:bg-gray-800 shadow-sm ";
          
          // Selected date
          if (isSelected) {
            cellClass += "ring-2 ring-indigo-400 bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-900 dark:bg-gradient-to-br dark:from-indigo-700 dark:to-blue-700 dark:text-white shadow-md border-indigo-300 dark:border-indigo-500 ";
          } else {
            cellClass += "hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md ";
          }
          
          // TODAY - only if not selected date
          if (isToday && !isSelected) {
            cellClass += "bg-gradient-to-br from-amber-200 to-yellow-200 dark:bg-gradient-to-br dark:from-amber-500 dark:to-yellow-500 text-amber-900 dark:text-gray-900 ring-1 ring-amber-400 border-amber-300 dark:border-amber-400 shadow-md ";
          }
          
          return (
            <div
              key={index}
              onClick={() => onDateSelect(dayDate)}
              className={cellClass}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onDateSelect(dayDate);
                }
              }}
              aria-label={`${day} ${monthNames[currentMonth]} ${currentYear}${eventsForDay.length > 0 ? `, ${eventsForDay.length} events` : ''}`}
            >
              <div className="text-[10px] xs:text-xs sm:text-sm md:text-lg font-bold text-gray-800 dark:text-white text-center leading-tight">
                {day}
              </div>
              
              {/* Event indicators - Enhanced mobile visibility */}
              {eventsForDay.length > 0 && (
                <>
                  <div className={`absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 rounded-full shadow-lg ${dotColor} ${eventsForDay.some(ev => ev.type === 'past') ? '' : 'animate-pulse'}`} />
                  
                  {/* Event count badge - Enhanced for mobile */}
                  {eventsForDay.length > 1 && (
                    <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                      <span className="text-[6px] xs:text-[8px] sm:text-xs">{eventsForDay.length}</span>
                    </div>
                  )}
                  
                  {/* Enhanced tooltip for mobile */}
                  <div className="pointer-events-none absolute -top-6 xs:-top-8 sm:-top-10 md:-top-12 left-1/2 hidden w-max max-w-28 xs:max-w-32 sm:max-w-40 md:max-w-48 -translate-x-1/2 rounded-lg bg-gray-900 px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 sm:py-2 text-[10px] xs:text-xs text-white group-hover:block z-50 shadow-xl">
                    <div className="font-semibold mb-0.5 xs:mb-1">Events:</div>
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
  const {
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
  } = useCalendar();

  // Additional handlers for CKEditor
  const handleAgendaChange = (event, editor) => {
    const data = editor.getData();
    handleAddEventChange({
      target: { name: 'agenda', value: data }
    });
  };

  const handleEditAgendaChange = (event, editor) => {
    const data = editor.getData();
    handleEditEventChange({
      target: { name: 'agenda', value: data }
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-3 sm:gap-4 py-2 sm:py-3 px-2 sm:px-4">
        {/* Header Section - Enhanced mobile layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 md:gap-4">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-orange-600">Event Calendar</h1>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] xs:text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <FiCalendar className="text-indigo-600" />
            <span>Total Events: {events.length}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl shadow-2xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 w-full mx-auto border-2 border-indigo-200 dark:border-indigo-600">
          {/* Header Controls - Enhanced mobile responsiveness */}
          <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 border-b-2 border-indigo-100 dark:border-indigo-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
            {/* Title and Description - Better mobile stacking */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-indigo-600 text-lg sm:text-xl" />
                <span className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">Calendar Management</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <FiClock className="text-indigo-600" />
                <span>Manage events and schedules</span>
              </div>
            </div>

            {/* Stats and Add Button - Improved mobile layout */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 text-green-800 dark:text-green-100 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm border border-green-200 dark:border-green-600">{events.filter(ev => isSameDay(new Date(ev.date), new Date())).length} Today</span>
                <span className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-800 text-blue-800 dark:text-blue-100 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm border border-blue-200 dark:border-blue-600">{upcomingCount} Upcoming</span>
                <span className="bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 text-gray-800 dark:text-gray-100 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm border border-gray-200 dark:border-gray-600">{pastCount} Past</span>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <span className="text-gray-700 dark:text-gray-200 font-semibold">{time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{time.toLocaleTimeString([], { hour12: false })}</span>
                </div>
              </div>
              {!showAddEventForm && (
                <button
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 transition w-full sm:w-auto touch-manipulation"
                  onClick={handleShowAddEventForm}
                >
                  <FiPlus className="text-sm sm:text-base" />
                  Add Event
                </button>
              )}
            </div>
          </div>

          {/* Main Content: Two Columns - Enhanced mobile layout */}
          <div className="flex flex-col xl:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-6 p-2 sm:p-3 md:p-4 lg:p-6 min-h-[400px] xs:min-h-[450px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px] xl:min-h-[800px]">
            {/* Calendar Card - Now always first */}
            <div className="flex-1 min-w-0 flex flex-col">
                      <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl sm:rounded-2xl border-2 border-indigo-200 dark:border-indigo-600 relative flex-1 flex flex-col shadow-xl">
                          <div className="p-1 sm:p-2 md:p-3 lg:p-4 flex-1 flex flex-col">
            <SimpleCalendar 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              events={events}
            />
          </div>
        </div>
            </div>
            
            {/* Event Details Card - Enhanced for mobile */}
            <div className="w-full lg:w-72 xl:w-80 2xl:w-96 flex-shrink-0 flex flex-col">
              <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl sm:rounded-2xl border-2 border-indigo-200 dark:border-indigo-600 flex-1 flex flex-col shadow-xl">
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b-2 border-indigo-100 dark:border-indigo-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <FiEye className="text-indigo-600" />
                    Event Details
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mt-1">
                    Events for {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                {/* Event cards for selected date - Enhanced mobile layout */}
                <div className="p-2 sm:p-3 md:p-4 lg:p-6 space-y-2 sm:space-y-3 md:space-y-4 flex-1 overflow-y-auto">
                  {eventsForDate.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <FiCalendar className="text-gray-300 dark:text-gray-600 text-3xl sm:text-4xl mx-auto mb-2 sm:mb-3" />
                      <p className="text-gray-400 dark:text-gray-300 text-xs sm:text-sm">No events scheduled for this date</p>
                    </div>
                  ) : (
                    eventsForDate.map((ev, idx) => (
                      <div key={idx} className={`rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 shadow-md border-2 transition-all hover:shadow-lg ${
                        ev.type === 'today' 
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/60 dark:to-emerald-900/60 border-green-300 dark:border-green-600' 
                          : ev.type === 'upcoming' 
                            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/60 dark:to-indigo-900/60 border-blue-300 dark:border-blue-600' 
                            : 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/60 dark:to-slate-800/60 border-gray-300 dark:border-gray-600'
                      }`}>
                        <div className="flex items-start justify-between mb-1.5 sm:mb-2 md:mb-3">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                            <div className={`w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
                              ev.type === 'today' 
                                ? 'bg-green-500' 
                                : ev.type === 'upcoming' 
                                  ? 'bg-blue-500' 
                                  : 'bg-gray-500'
                            }`}></div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-xs sm:text-sm md:text-base">{ev.name}</h3>
                          </div>
                          <span className={`px-1 xs:px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs font-medium flex-shrink-0 ${
                            ev.type === 'today' 
                              ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200' 
                              : ev.type === 'upcoming' 
                                ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200' 
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                          }`}>
                            {ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}
                          </span>
                        </div>
                        
                        <div className="space-y-1 sm:space-y-1.5 md:space-y-2 text-[10px] xs:text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <FiCalendar className="text-gray-400 flex-shrink-0" size={10} />
                            <span>{ev.date.toLocaleDateString()}</span>
                          </div>
                          {stripHtml(ev.description) && (
                            <div className="break-words">
                              <span className="font-medium text-gray-800 dark:text-gray-100">Agenda:</span> 
                              <span className="line-clamp-2 text-[10px] xs:text-xs sm:text-sm">{stripHtml(ev.description)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 md:mt-3 pt-1.5 sm:pt-2 md:pt-3 border-t border-gray-200 dark:border-gray-700">
                          <button 
                            className="text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-400 transition-colors p-1.5 touch-manipulation" 
                            title="Edit Event" 
                            onClick={() => openEditEventModal(ev)} 
                            disabled={editLoading}
                          >
                            <FiEdit2 size={12} />
                          </button>
                          <button 
                            className="text-red-600 dark:text-red-300 hover:text-red-900 dark:hover:text-red-400 transition-colors p-1.5 touch-manipulation" 
                            title="Delete Event" 
                            onClick={() => handleDeleteEvent(ev.id)} 
                            disabled={deleteLoading}
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Event Modal - Enhanced mobile responsiveness */}
        {showAddEventForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4" onClick={handleHideAddEventForm}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm sm:max-w-md mx-auto max-h-[95vh] sm:max-h-[98vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10 p-1.5 touch-manipulation"
                onClick={handleHideAddEventForm}
                title="Close"
              >
                <FiX size={16} />
              </button>
              <div className="p-3 sm:p-4 pb-2 pr-10">
                <h2 className="text-base sm:text-lg font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <FiPlus className="text-indigo-600 dark:text-indigo-300" />
                  Add New Event
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">Create a new event with details</p>
              </div>
              <form className="flex-1 flex flex-col" onSubmit={handleAddEventSubmit}>
                <div className="flex-1 overflow-y-auto px-3 sm:px-4 space-y-3">
                    <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Event Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="event"
                        value={addEventForm.event}
                        onChange={handleAddEventChange}
                      className={`w-full px-2 py-2 sm:py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${formErrors.event ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
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
                      className={`w-full px-2 py-2 sm:py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${formErrors.venue ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                        placeholder="Enter venue"
                      />
                      {formErrors.venue && <div className="text-red-600 text-xs mt-1">{formErrors.venue}</div>}
                    </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={addEventForm.date}
                        onChange={handleAddEventChange}
                        className={`w-full px-2 py-2 sm:py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${formErrors.date ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
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
                        className={`w-full px-2 py-2 sm:py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${formErrors.time ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
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
                  {formErrors.api && (
                    <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 px-3 py-2 rounded-lg text-xs">
                      {formErrors.api}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 p-3 sm:p-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-manipulation"
                    onClick={handleHideAddEventForm}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors text-white touch-manipulation ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="animate-spin" size={14} />
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

        {/* Edit Event Modal - Enhanced mobile responsiveness */}
        {showEditEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4" onClick={closeEditEventModal}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm sm:max-w-md mx-auto max-h-[95vh] sm:max-h-[98vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10 p-1.5 touch-manipulation"
                onClick={closeEditEventModal}
                title="Close"
              >
                <FiX size={16} />
              </button>
              <div className="p-3 sm:p-4 pb-2 pr-10">
                <h2 className="text-base sm:text-lg font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <FiEdit2 className="text-indigo-600 dark:text-indigo-300" />
                  Edit Event
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">Modify the details of the event</p>
              </div>
              <form className="flex-1 flex flex-col" onSubmit={handleEditEventSubmit}>
                <div className="flex-1 overflow-y-auto px-3 sm:px-4 space-y-3">
                    <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Event Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="event"
                        value={editEventForm.event}
                        onChange={handleEditEventChange}
                      className={`w-full px-2 py-2 sm:py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${editFormErrors.event ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
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
                      className={`w-full px-2 py-2 sm:py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${editFormErrors.venue ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                        placeholder="Enter venue"
                      />
                      {editFormErrors.venue && <div className="text-red-600 text-xs mt-1">{editFormErrors.venue}</div>}
                    </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={editEventForm.date}
                        onChange={handleEditEventChange}
                        className={`w-full px-2 py-2 sm:py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${editFormErrors.date ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
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
                        className={`w-full px-2 py-2 sm:py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors ${editFormErrors.time ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'}`}
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
                      className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-300 focus:border-transparent transition-colors border-gray-200 dark:border-gray-600"
                      />
                  </div>
                  {editError && (
                    <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 px-3 py-2 rounded-lg text-xs">
                      {editError}
                    </div>
                  )}
                  {editSuccess && (
                    <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-200 px-3 py-2 rounded-lg text-xs">
                      {editSuccess}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 p-3 sm:p-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-manipulation"
                    onClick={closeEditEventModal}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors text-white touch-manipulation ${editLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {editLoading ? (
                      <>
                        <FiRefreshCw className="animate-spin" size={14} />
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
      </div>
      {/* Removed custom notification UI */}
    </DashboardLayout>
  );
} 