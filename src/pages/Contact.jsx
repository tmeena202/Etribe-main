import React, { useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import contactImg from "../assets/contact-hero.jpg"; // Use your own image or replace with a placeholder
import contactFormImg from "../assets/contact-form.jpg";
import { toast } from "react-toastify";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Here you would send the data to your backend or API
    console.log(form);
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 py-3">
        {/* Hero/Intro Section */}
        <div className="rounded-2xl shadow-lg bg-white p-0 overflow-hidden flex flex-col md:flex-row items-center justify-between">
          <div className="p-8 flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-700 mb-6 max-w-xl">
              We’d love to hear from you! Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.
            </p>
            <ul className="text-gray-600 text-base space-y-2 mb-4">
              <li><span className="font-semibold text-indigo-600">Email:</span> info@etribe.com</li>
              <li><span className="font-semibold text-indigo-600">Phone:</span> +1 (555) 123-4567</li>
              <li><span className="font-semibold text-indigo-600">Address:</span> 123 Business Ave, Tech City, TC 12345</li>
            </ul>
          </div>
          <div className="flex-1 flex items-center justify-center p-8">
            <img src={contactImg} alt="Contact" className="w-80 h-64 object-cover rounded-2xl shadow-xl border-4 border-white" />
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="relative rounded-2xl bg-white shadow-lg p-8 flex flex-col md:flex-row gap-8 items-center overflow-hidden">
          {/* Background image */}
          <img src={contactFormImg} alt="Contact Background" className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none select-none" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">Send Us a Message</h2>
            {submitted && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">Thank you for contacting us! We'll get back to you soon.</div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-400"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-400"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-400"
                  placeholder="Type your message here..."
                />
              </div>
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-indigo-700 transition">Send Message</button>
            </form>
          </div>
        </div>

        {/* Location/Map Section */}
        <div className="rounded-2xl bg-white shadow-lg p-0 overflow-hidden flex flex-col md:flex-row items-stretch mt-8">
          <div className="flex flex-1 flex-col items-start justify-start p-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-2">Our Location</h2>
            <p className="text-gray-700 mb-2">30 Days Technology</p>
            <p className="text-gray-600">Open: Mon - Fri, 9:00am - 6:00pm</p>
          </div>
          <div className="flex-1 w-full h-64 rounded-2xl overflow-hidden shadow-lg border-4 border-white m-0 md:m-8">
            <iframe
              title="Etribe Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d33298.23889084382!2d76.9521781072993!3d28.68826412524933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d0974e3650841%3A0xafa091d27bb886c0!2s30Days%20Technologies%20Pvt%20Ltd%20-%20Bahadurgarh!5e0!3m2!1sen!2sin!4v1752662526914!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 