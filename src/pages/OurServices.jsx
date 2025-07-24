import React, { useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import erpImg from "../assets/erp.jpg";
import hrmImg from "../assets/hrm.jpg";
import startupImg from "../assets/startup.jpg";
import ourServicesHero from "../assets/ourservices-hero.jpg";
import { FiDatabase, FiUsers, FiBarChart2, FiShield, FiLifeBuoy, FiZap, FiCheckCircle } from "react-icons/fi";

const services = [
  {
    title: "ERP Solutions",
    img: erpImg,
    desc: "Streamline your business operations with our powerful, customizable ERP platform. Manage finance, inventory, sales, and more—all in one place.",
  },
  {
    title: "HRM Platform",
    img: hrmImg,
    desc: "Empower your HR team with tools for recruitment, payroll, attendance, and employee engagement. Designed for modern organizations.",
  },
  {
    title: "Startup Suite",
    img: startupImg,
    desc: "Affordable, scalable solutions for small startups. Get up and running fast with essential tools for growth and collaboration.",
  },
];

const whyChooseUsData = [
  { icon: <FiZap size={32} className="text-indigo-500" />, title: "Rapid Deployment", desc: "Get up and running in days, not months, with our efficient onboarding process." },
  { icon: <FiBarChart2 size={32} className="text-indigo-500" />, title: "Scalable Architecture", desc: "Our solutions grow with your business, from startup to enterprise." },
  { icon: <FiShield size={32} className="text-indigo-500" />, title: "Enterprise-Grade Security", desc: "Your data is protected with state-of-the-art security and compliance." },
  { icon: <FiLifeBuoy size={32} className="text-indigo-500" />, title: "24/7 Expert Support", desc: "Our dedicated support team is always here to help you succeed." }
];

const featureData = {
  "ERP Solutions": ["Financial Management", "Inventory Control", "Sales & CRM", "Supply Chain", "Automated Reporting"],
  "HRM Platform": ["Recruitment & Onboarding", "Payroll Processing", "Time & Attendance", "Performance Reviews", "Employee Self-Service"],
  "Startup Suite": ["Lightweight CRM", "Project Management", "Team Collaboration Tools", "Basic Invoicing", "Cloud Storage"]
};

const testimonials = [
    {
        quote: "Etribe's ERP solution transformed our operations. We're more efficient and profitable than ever before.",
        name: "Priya Sharma",
        company: "CEO, InnovateNow",
        avatar: "https://randomuser.me/api/portraits/women/47.jpg"
    },
    {
        quote: "The HRM platform is incredibly user-friendly. It has saved our HR team countless hours every week.",
        name: "Amit Kumar",
        company: "HR Manager, TechCorp",
        avatar: "https://randomuser.me/api/portraits/men/34.jpg"
    }
];

export default function OurServices() {
  const [activeTab, setActiveTab] = useState("ERP Solutions");

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 py-3">
        {/* Hero Section */}
        <div className="rounded-2xl shadow-lg bg-white p-0 overflow-hidden flex flex-col md:flex-row items-stretch">
          <div className="flex flex-1 flex-col items-start justify-start p-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-4">Our Services</h1>
            <p className="text-lg text-gray-700 mb-6 max-w-xl">
              Discover our suite of modern solutions designed to help your business grow, automate, and succeed—no matter your size or industry.
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <img src={ourServicesHero} alt="Our Services Hero" className="w-80 h-64 object-cover rounded-2xl shadow-xl border-4 border-white" />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.title} className="rounded-2xl bg-white shadow-lg p-6 flex flex-col items-center text-center">
              <img src={service.img} alt={service.title} className="w-32 h-32 object-cover rounded-xl shadow mb-4 border-2 border-indigo-100" />
              <h2 className="text-xl font-bold text-indigo-700 mb-2">{service.title}</h2>
              <p className="text-gray-700 text-base">{service.desc}</p>
            </div>
          ))}
        </div>
        
        {/* Why Choose Us Section */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-blue-100 shadow-lg p-8 mt-8">
            <h2 className="text-3xl font-bold text-indigo-700 mb-8 text-center">Why Choose Etribe?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {whyChooseUsData.map(item => (
                    <div key={item.title} className="flex items-start gap-4">
                        <div className="flex-shrink-0">{item.icon}</div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Feature Breakdown Section */}
        <div className="rounded-2xl bg-white shadow-lg p-8 mt-8">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">Detailed Features</h2>
            <div className="flex justify-center border-b border-gray-200 mb-6">
                {Object.keys(featureData).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 text-lg font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {featureData[activeTab].map(feature => (
                    <div key={feature} className="bg-indigo-50 text-indigo-700 p-3 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2">
                        <FiCheckCircle size={16} /> {feature}
                    </div>
                ))}
            </div>
        </div>

        {/* Testimonials Section */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-blue-100 shadow-lg p-8 mt-8">
            <h2 className="text-3xl font-bold text-indigo-700 mb-8 text-center">What Our Clients Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {testimonials.map(t => (
                    <div key={t.name} className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                        <p className="text-gray-600 italic mb-4">"{t.quote}"</p>
                        <div className="flex items-center">
                            <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full mr-4"/>
                            <div>
                                <h4 className="font-semibold text-gray-800">{t.name}</h4>
                                <p className="text-sm text-gray-500">{t.company}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* How It Works Section */}
        <div className="rounded-2xl bg-white shadow-lg p-8 mt-8">
            <h2 className="text-3xl font-bold text-indigo-700 mb-8 text-center">Get Started in 3 Easy Steps</h2>
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1 flex flex-col items-center text-center">
                      <div className="w-16 h-16 flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-2xl rounded-full mb-4">1</div>
                      <h3 className="text-xl font-semibold mb-2">Request a Demo</h3>
                      <p className="text-gray-600">Contact us to schedule a personalized demo of our platform.</p>
                </div>
                  <div className="flex-1 flex flex-col items-center text-center">
                      <div className="w-16 h-16 flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-2xl rounded-full mb-4">2</div>
                      <h3 className="text-xl font-semibold mb-2">Tailor Your Plan</h3>
                      <p className="text-gray-600">We'll help you choose the right features and pricing for your needs.</p>
                </div>
                  <div className="flex-1 flex flex-col items-center text-center">
                      <div className="w-16 h-16 flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-2xl rounded-full mb-4">3</div>
                      <h3 className="text-xl font-semibold mb-2">Onboard & Launch</h3>
                      <p className="text-gray-600">Our team will guide you through a seamless setup and launch process.</p>
                </div>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
} 