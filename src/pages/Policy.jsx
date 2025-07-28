import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import privacyPolicyImg from "../assets/privacy-policy.jpg";
import { toast } from 'react-toastify';

export default function Policy() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 py-3">
        {/* Hero Section */}
        <div className="rounded-2xl shadow-lg bg-white p-0 overflow-hidden flex flex-col md:flex-row items-stretch">
          <div className="flex flex-1 flex-col items-start justify-start p-8">
            <h1 className="text-4xl font-extrabold text-indigo-700 mb-2">Privacy Policy</h1>
            <h2 className="text-lg font-semibold text-indigo-500 mb-2">Your Data, Your Trust, Our Responsibility</h2>
            <div className="text-sm text-gray-500 mb-2">Last Updated: April 2024</div>
            <p className="text-base text-indigo-700 mb-2 font-medium">We are committed to protecting your privacy and ensuring transparency in how your information is handled.</p>
            <ul className="list-disc pl-5 text-gray-700 text-base mb-3 space-y-1">
              <li>Clear explanation of what data we collect</li>
              <li>How your information is used and protected</li>
              <li>Your rights and choices regarding your data</li>
              <li>Easy ways to contact us for privacy concerns</li>
            </ul>
            <p className="text-lg text-gray-700 max-w-2xl">
              This Privacy Policy explains how Etribe collects, uses, discloses, and safeguards your information when you use our platform. Please read this policy carefully.
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <img src={privacyPolicyImg} alt="Privacy Policy" className="w-80 h-64 object-cover rounded-2xl shadow-xl border-4 border-white" />
          </div>
        </div>

        {/* Table of Contents */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-blue-100 shadow-lg p-6">
          <h2 className="text-xl font-bold text-indigo-700 mb-2">Table of Contents</h2>
          <ul className="list-decimal pl-6 text-gray-700 space-y-1">
            <li><a href="#information" className="text-indigo-600 hover:underline">1. Information We Collect</a></li>
            <li><a href="#use" className="text-indigo-600 hover:underline">2. How We Use Your Information</a></li>
            <li><a href="#cookies" className="text-indigo-600 hover:underline">3. Cookies & Tracking Technologies</a></li>
            <li><a href="#security" className="text-indigo-600 hover:underline">4. Data Security</a></li>
            <li><a href="#rights" className="text-indigo-600 hover:underline">5. Your Rights & Choices</a></li>
            <li><a href="#contact" className="text-indigo-600 hover:underline">6. Contact Us</a></li>
          </ul>
        </div>

        {/* Information We Collect */}
        <div id="information" className="rounded-2xl bg-white shadow-lg p-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-2">1. Information We Collect</h2>
          <p className="text-gray-700 mb-2">We may collect information about you in a variety of ways. The information we may collect includes:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li><span className="font-semibold">Personal Data:</span> Name, email address, phone number, and other contact information.</li>
            <li><span className="font-semibold">Usage Data:</span> Information about how you use our platform, such as pages viewed and features used.</li>
            <li><span className="font-semibold">Device Data:</span> IP address, browser type, operating system, and device identifiers.</li>
          </ul>
        </div>

        {/* How We Use Your Information */}
        <div id="use" className="rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-blue-100 shadow-lg p-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>To provide, operate, and maintain our services.</li>
            <li>To improve, personalize, and expand our platform.</li>
            <li>To communicate with you, including customer service and updates.</li>
            <li>To process transactions and send related information.</li>
            <li>To detect and prevent fraud or other illegal activities.</li>
          </ul>
        </div>

        {/* Cookies & Tracking Technologies */}
        <div id="cookies" className="rounded-2xl bg-white shadow-lg p-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-2">3. Cookies & Tracking Technologies</h2>
          <p className="text-gray-700 mb-2">We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Cookies help us understand how you use our site and improve your experience.</li>
            <li>You can manage your cookie preferences in your browser settings.</li>
          </ul>
        </div>

        {/* Data Security */}
        <div id="security" className="rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-blue-100 shadow-lg p-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-2">4. Data Security</h2>
          <p className="text-gray-700 mb-2">We use administrative, technical, and physical security measures to help protect your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>We regularly review our security procedures to ensure your data is safe.</li>
            <li>Access to your personal data is restricted to authorized personnel only.</li>
          </ul>
        </div>

        {/* Your Rights & Choices */}
        <div id="rights" className="rounded-2xl bg-white shadow-lg p-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-2">5. Your Rights & Choices</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>You have the right to access, correct, or delete your personal information.</li>
            <li>You may opt out of marketing communications at any time.</li>
            <li>To exercise your rights, please contact us using the information below.</li>
          </ul>
        </div>

        {/* Contact Us */}
        <div id="contact" className="rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-blue-100 shadow-lg p-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-2">6. Contact Us</h2>
          <p className="text-gray-700 mb-2">If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
          <ul className="text-gray-700">
            <li>Email: <a href="mailto:info@etribe.com" className="text-indigo-600 hover:underline">info@etribe.com</a></li>
            <li>Address: 123 Business Ave, Tech City, TC 12345</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
} 