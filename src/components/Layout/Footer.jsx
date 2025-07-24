import React from "react";

export default function Footer() {
  return (
    <footer className="text-center text-gray-500 dark:text-gray-400 text-xs py-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
      <span className="text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Etribe. All rights reserved.
      </span>
    </footer>
  );
}