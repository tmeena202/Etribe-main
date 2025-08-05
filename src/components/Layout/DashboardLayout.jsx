import React, { useState } from "react";
import Sidebar from "../Sidebar/Sidebar";
import TopBar from "./TopBar";
import Footer from "./Footer";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="bg-gray-50 dark:bg-gray-900 font-sans h-screen overflow-hidden flex transition-colors duration-300">
      {/* Fixed Sidebar */}
      <Sidebar className="fixed left-0 top-0 h-screen z-30" collapsed={collapsed} setCollapsed={setCollapsed} />
      {/* Main content area with responsive padding */}
      <div className={`flex flex-col flex-1 h-screen overflow-y-auto transition-all duration-200 ${
        // Always collapsed by default, expand only on user action
        collapsed ? 'pl-0 lg:pl-20' : 'pl-0 lg:pl-72'
      }`}>
        {/* TopBar and content centered */}
        <div className="max-w-7xl mx-auto w-full px-4 pt-8 flex flex-col flex-1">
          <div className="mt-4">
          <TopBar />
          </div>
          <div className="flex-1 py-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            {children}
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="max-w-7xl mx-auto w-full px-4 pb-4 mb-4">
          <Footer />
        </div>
      </div>
    </div>
  );
}