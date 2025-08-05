import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";

export default function GrievancesActive() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Active Grievances</h1>
        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-6">
          <p className="text-gray-600 dark:text-gray-400">Active Grievances content will be implemented here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
} 