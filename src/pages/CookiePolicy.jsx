import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import policyImg from "../assets/privacy-policy.jpg";

export default function CookiePolicy() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 py-3">
        {/* Hero/Intro Section */}
        <div className="rounded-2xl shadow-lg bg-white p-0 overflow-hidden flex flex-col md:flex-row items-stretch justify-between">
          <div className="p-8 flex items-start text-left w-full md:w-auto">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-4">Cookie Policy</h1>
              <p className="text-lg text-gray-700 mb-6 max-w-xl">
                Learn how Etribe uses cookies and similar technologies to enhance your experience and protect your privacy.
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <img src={policyImg} alt="Cookie Policy" className="w-80 h-64 object-cover rounded-2xl shadow-xl border-4 border-white" />
          </div>
        </div>

        {/* Cookie Policy Content Section */}
        <div className="rounded-2xl bg-white shadow-lg p-10 text-gray-800">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">1. What Are Cookies?</h2>
          <p className="mb-4">
            Cookies are small text files stored on your device by your web browser. They help websites remember information about your visit, such as your preferences and settings, to improve your experience.
          </p>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 mt-8">2. How We Use Cookies</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>To remember your preferences and settings</li>
            <li>To keep you signed in</li>
            <li>To analyze site usage and improve our services</li>
            <li>To personalize content and ads</li>
            <li>To ensure security and prevent fraud</li>
          </ul>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 mt-8">3. Types of Cookies We Use</h2>
          <ul className="list-disc pl-6 mb-4">
            <li><span className="font-semibold">Essential Cookies:</span> Necessary for the website to function properly.</li>
            <li><span className="font-semibold">Performance Cookies:</span> Help us understand how visitors interact with our site.</li>
            <li><span className="font-semibold">Functional Cookies:</span> Remember your preferences and choices.</li>
            <li><span className="font-semibold">Advertising Cookies:</span> Used to deliver relevant ads and track ad performance.</li>
          </ul>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 mt-8">4. Managing Your Cookies</h2>
          <p className="mb-4">
            You can control and manage cookies through your browser settings. Most browsers allow you to block or delete cookies, but this may affect your experience on our site.
          </p>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 mt-8">5. Third-Party Cookies</h2>
          <p className="mb-4">
            Some cookies may be set by third-party services that appear on our pages. We do not control these cookies and recommend checking the respective privacy policies for more information.
          </p>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 mt-8">6. Updates to This Policy</h2>
          <p className="mb-4">
            We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated effective date.
          </p>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 mt-8">7. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our use of cookies, please contact us at <a href="mailto:support@etribe.com" className="text-blue-700 underline">support@etribe.com</a>.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
} 