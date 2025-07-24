import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import StatusCards from "../components/StatusCards/StatusCards";
import AnalyticsGraph from "../components/AnalyticsGraph/AnalyticsGraph";
import UpcomingEvents from "../components/UpcomingEvents/UpcomingEvents";
import ImportantContacts from "../components/ImportantContacts/ImportantContacts";
import PastEventCard from "../components/PastEventCard/PastEventCard";
import TotalEventCard from "../components/TotalEventCard/TotalEventCard";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-3 gap-6 py-3 bg-transparent dark:bg-gray-800 transition-colors duration-300">
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
      
      {/* Important Contacts - full width */}
      <div className="mt-6">
        <div className="rounded-2xl shadow">
          <ImportantContacts />
        </div>
      </div>
    </DashboardLayout>
  );
}
