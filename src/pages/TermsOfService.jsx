import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import termsImg from "../assets/terms.jpg";

export default function TermsOfService() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 py-3">
        {/* Hero/Intro Section */}
        <div className="rounded-2xl shadow-lg bg-white p-0 overflow-hidden flex flex-col md:flex-row items-stretch justify-between">
          <div className="p-8 flex items-start text-left w-full md:w-auto">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-4">Terms of Service</h1>
              <p className="text-lg text-gray-700 mb-6 max-w-xl">
                Please read our Terms of Service carefully before using Etribe. By accessing or using our services, you agree to be bound by these terms.
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <img src={termsImg} alt="Terms of Service" className="w-80 h-64 object-cover rounded-2xl shadow-xl border-4 border-white" />
          </div>
        </div>

        {/* Terms Content Section */}
        <div className="rounded-2xl bg-white shadow-lg p-10 text-gray-800">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By using our website and services, you acknowledge that you have read, understood, and agree to comply with these Terms of Service. If you do not agree, please do not use our services.
          </p>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 mt-8">2. Modifications</h2>
          <p className="mb-4">
            We reserve the right to update or modify these terms at any time. Changes will be effective immediately upon posting. Continued use of our services constitutes acceptance of the revised terms.
          </p>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 mt-8">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate and up-to-date information.</li>
            <li>Maintain the confidentiality of your account credentials.</li>
            <li>Comply with all applicable laws and regulations.</li>
            <li>Do not misuse or attempt to disrupt our services.</li>
          </ul>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 mt-8">4. Intellectual Property</h2>
          <p className="mb-4">
            All content, trademarks, and data on this site are the property of Etribe or its licensors. Unauthorized use is strictly prohibited.
          </p>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 mt-8">5. Limitation of Liability</h2>
          <p className="mb-4">
            Etribe is not liable for any direct, indirect, incidental, or consequential damages arising from your use of our services.
          </p>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 mt-8">6. Termination</h2>
          <p className="mb-4">
            We reserve the right to suspend or terminate your access to our services at our discretion, without notice, for conduct that we believe violates these terms or is harmful to other users.
          </p>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 mt-8">7. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms of Service, please contact us at <a href="mailto:support@etribe.com" className="text-blue-700 underline">support@etribe.com</a>.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
} 