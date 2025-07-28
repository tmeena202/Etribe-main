import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { Link } from "react-router-dom";
import etribeLogo from "../assets/Etribe-logo.jpg";
import bharatBillLogo from "../assets/Bharat-BillPay.png";
import toyota from "../assets/toyota.png";
import hr from "../assets/HR.png";
import msme from "../assets/MSME.png";
import aashish from "../assets/Aashish.png";
import parveen from "../assets/Parveen.jpg";
import rohit from "../assets/Rohit.jpg";
import { toast } from "react-toastify";

const partners = [
  { name: "BharatBill", logo: bharatBillLogo },
  { name: "Toyota", logo: toyota },
  { name: "HR", logo: hr},
  { name: "MSME", logo: msme },
];

const values = [
  { icon: "💡", title: "Innovation", desc: "We embrace new ideas and technology to deliver the best solutions." },
  { icon: "🤝", title: "Collaboration", desc: "We believe in the power of teamwork and partnerships." },
  { icon: "🌱", title: "Growth", desc: "We help communities and individuals grow and thrive." },
  { icon: "🎉", title: "Celebration", desc: "We make every event and milestone memorable." },
];

const timeline = [
  { year: "2019", title: "First 100 Clients", desc: "We reached our first 100 clients and launched our event management platform." },
  { year: "2021", title: "Major Platform Upgrade", desc: "Introduced advanced analytics and mobile support." },
  { year: "2023", title: "Global Expansion", desc: "Etribe expanded to serve clients in over 10 countries." },
  { year: "2025", title: "Leading the Future", desc: "Continuing to innovate and empower communities worldwide with cutting-edge solutions." },
];

export default function AboutUs() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        {/* Hero Section */}
        <div className="relative rounded-2xl shadow-lg bg-white p-0 overflow-hidden flex flex-col md:flex-row items-center justify-between">
          <div className="p-8 flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-4">About Etribe</h1>
            <p className="text-lg text-gray-700 mb-6 max-w-xl">
              Empowering communities through innovative event management and membership solutions. We help organizations connect, engage, and grow with modern technology and a human touch.
            </p>
            <div className="flex gap-4">
              <Link to="/services" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-indigo-700 transition">Our Services</Link>
              <Link to="/contact" className="bg-white border border-indigo-200 text-indigo-700 px-6 py-2 rounded-lg font-semibold shadow hover:bg-indigo-50 transition">Contact Us</Link>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <img src={etribeLogo} alt="Etribe Logo" className="w-64 h-64 object-cover rounded-2xl shadow-xl border-4 border-white" />
          </div>
        </div>

        {/* Timeline / History Section */}
        <div className="rounded-2xl shadow-lg bg-gradient-to-r from-indigo-50 via-blue-50 to-blue-100 p-8 mt-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Our Journey</h2>
          <div className="flex items-start justify-between w-full">
            {timeline.map((item) => (
              <div key={item.year} className="flex flex-col items-center text-center w-1/4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-200 to-blue-200 flex items-center justify-center text-base font-bold text-indigo-700 shadow-lg border-2 border-white mb-2">
                  {item.year}
                </div>
                <h3 className="text-lg font-semibold text-indigo-600">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="rounded-2xl bg-white shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-2">Our Mission</h2>
            <p className="text-gray-700 text-lg">
              To foster vibrant communities by providing seamless, tech-driven solutions for event management and member engagement.
            </p>
          </div>
          <div className="rounded-2xl bg-white shadow-lg p-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-2">Our Vision</h2>
            <p className="text-gray-700 text-lg">
              To be the leading platform for community empowerment, making every event and membership experience meaningful and memorable.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-blue-100 shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {values.map((val) => (
              <div key={val.title} className="flex flex-col items-center text-center p-4">
                <div className="text-4xl mb-2">{val.icon}</div>
                <h3 className="text-lg font-semibold text-indigo-600 mb-1">{val.title}</h3>
                <p className="text-gray-600 text-sm">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="rounded-2xl bg-white shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
            {/* Team Member 1 */}
            <div className="flex flex-col items-center">
              <img src={parveen} alt="Team Member" className="w-24 h-24 rounded-full shadow-lg mb-3 border-4 border-indigo-100" />
              <h3 className="text-lg font-semibold text-gray-800">Parveen Mittal</h3>
              <p className="text-indigo-500 font-medium">Founder</p>
            </div>
            {/* Team Member 2 */}
            <div className="flex flex-col items-center">
              <img src={rohit} alt="Team Member" className="w-24 h-24 rounded-full shadow-lg mb-3 border-4 border-indigo-100" />
              <h3 className="text-lg font-semibold text-gray-800">Rohit Arya</h3>
              <p className="text-indigo-500 font-medium">CEO</p>
            </div>
            {/* Team Member 3 */}
            <div className="flex flex-col items-center">
              <img src={aashish} alt="Team Member" className="w-24 h-24 rounded-full shadow-lg mb-3 border-4 border-indigo-100" />
              <h3 className="text-lg font-semibold text-gray-800">Aashish Jangra</h3>
              <p className="text-indigo-500 font-medium">UI/UX Designer</p>
            </div>
          </div>
        </div>

        {/* Partners/Clients Section */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-blue-100 shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Our Partners & Clients</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 justify-items-center">
            {partners.map((p) => (
              <div key={p.name} className="flex flex-col items-center">
                <div className="w-32 h-20 bg-white rounded-xl shadow flex items-center justify-center p-2 border border-gray-100">
                  <img src={p.logo} alt={p.name} className="max-h-full max-w-full object-contain" />
                </div>
                <span className="text-gray-600 text-sm font-medium mt-2">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="rounded-2xl bg-white shadow-lg p-8 mt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-indigo-700 mb-2">Ready to join our community?</h2>
            <p className="text-gray-700 text-lg mb-4 md:mb-0">Contact us today and discover how Etribe can help your organization thrive.</p>
          </div>
          <Link to="/contact" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-indigo-700 transition">Get in Touch</Link>
        </div>
      </div>
    </DashboardLayout>
  );
} 