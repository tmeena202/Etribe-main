import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/Layout/DashboardLayout";
import StatusCards from "../components/StatusCards/StatusCards";
import AnalyticsGraph from "../components/AnalyticsGraph/AnalyticsGraph";
import UpcomingEvents from "../components/UpcomingEvents/UpcomingEvents";
import ImportantContacts from "../components/ImportantContacts/ImportantContacts";
import PastEventCard from "../components/PastEventCard/PastEventCard";
import TotalEventCard from "../components/TotalEventCard/TotalEventCard";
import api from "../api/axiosConfig";

// Simplified Upcoming Events Card for Mobile/Tablet
function UpcomingEventsCard() {
  const [upcomingCount, setUpcomingCount] = React.useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchUpcomingCount = async () => {
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
        } else {
          backendEvents = [];
        }
        setUpcomingCount(backendEvents.length);
      } catch (err) {
        setUpcomingCount(0);
      }
    };

    fetchUpcomingCount();
  }, []);

  return (
    <div 
      className="relative h-32 rounded-2xl shadow-lg flex flex-col items-center justify-center p-3 gap-1 transition-transform duration-200 hover:scale-105 cursor-pointer overflow-hidden bg-gradient-to-br from-indigo-200 via-blue-100 to-white dark:from-indigo-800 dark:via-blue-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700"
      onClick={() => navigate("/event-management/upcoming")}
      title="Go to Upcoming Events"
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/30 dark:bg-gray-700/40 backdrop-blur-md border border-white/30 dark:border-gray-700 rounded-2xl pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
        <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-300 opacity-80 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Upcoming Events</div>
        <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 drop-shadow">{upcomingCount}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Mobile & Tablet Layout (xs to lg) - Image Layout */}
      <div className="block lg:hidden space-y-6 py-3 bg-transparent dark:bg-gray-800 transition-colors duration-300">
        {/* Dashboard Overview Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h2>
          <StatusCards />
        </div>
        
        {/* Event Statistics Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Event Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <PastEventCard />
            <TotalEventCard />
            <UpcomingEventsCard />
          </div>
        </div>
        
        {/* Member Analytics Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Member Analytics</h3>
          <div className="h-80">
            <AnalyticsGraph containerClass="h-full p-0 mb-0" chartHeight="100%" />
          </div>
        </div>
        
        {/* Important Contacts Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Important Contacts</h3>
          <div className="rounded-2xl shadow">
            <ImportantContacts />
          </div>
        </div>
      </div>

      {/* Desktop Layout (lg and above) - Original Layout */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6 py-3 bg-transparent dark:bg-gray-800 transition-colors duration-300">
        {/* Top Row: Status Cards */}
        <div className="col-span-3">
          <StatusCards />
        </div>
        
        {/* Middle Row: Past Event, Total Event, and Upcoming Events */}
        <div className="col-span-1">
          <PastEventCard />
        </div>
        
        <div className="col-span-1">
          <TotalEventCard />
        </div>
        
        {/* Upcoming Events - tall vertical card on the right */}
        <div className="col-span-1 row-span-2">
          <UpcomingEvents containerClass="h-full p-0 mb-0" chartHeight="100%" />
        </div>
        
        {/* Bottom Section: Analytics Graph - spans under Past Event + Total Event */}
        <div className="col-span-2">
          <div className="h-80">
            <AnalyticsGraph containerClass="h-full p-0 mb-0" chartHeight="100%" />
          </div>
        </div>
      </div>
      
      {/* Important Contacts - full width for desktop */}
      <div className="hidden lg:block mt-6">
        <div className="rounded-2xl shadow">
          <ImportantContacts />
        </div>
      </div>
    </DashboardLayout>
  );
}
