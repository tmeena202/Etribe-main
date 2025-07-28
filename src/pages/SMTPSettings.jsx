import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiEdit2, FiX, FiRefreshCw, FiSave, FiMail, FiAlertCircle, FiCheckCircle, FiSettings, FiServer } from "react-icons/fi";
import api from "../api/axiosConfig";
import { toast } from 'react-toastify';

const initialData = {
  smtpHost: "",
  smtpUser: "",
  smtpPassword: "",
  smtpProtocol: "TLS",
  smtpPort: "587",
  senderEmail: "",
  senderName: "",
  replyToEmail: "",
};

export default function SMTPSettings() {
  const [data, setData] = useState(initialData);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch SMTP settings from API
  const fetchSMTP = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      if (!token || !uid) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await api.post('/groupSettings/get_smtp_setting', {}, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
        }
      });

      const smtp = response.data?.data || {};
      
      // Return both view data (with masked password) and edit data (with real password)
      const viewData = {
        smtpHost: smtp.smtp_host || "",
        smtpUser: smtp.smtp_user || "",
        smtpPassword: "********", // Always masked in view
        smtpProtocol: smtp.smtp_protocol || "TLS",
        smtpPort: smtp.smtp_port || "",
        senderEmail: smtp.sender_email || "",
        senderName: smtp.sender_name || "",
        replyToEmail: smtp.reply_to || "",
      };

      const editData = {
        smtpHost: smtp.smtp_host || "",
        smtpUser: smtp.smtp_user || "",
        smtpPassword: smtp.smtp_pass || "", // Real password for editing
        smtpProtocol: smtp.smtp_protocol || "TLS",
        smtpPort: smtp.smtp_port || "",
        senderEmail: smtp.sender_email || "",
        senderName: smtp.sender_name || "",
        replyToEmail: smtp.reply_to || "",
      };

      setData(viewData);
      setForm(editData);
    } catch (err) {
      console.error('Fetch SMTP error:', err);
      const errorMessage = err.message || 'Failed to fetch SMTP settings';
      toast.error(errorMessage);
      
      if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('log in')) {
        localStorage.removeItem('token');
        localStorage.removeItem('uid');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate SMTP settings
  const validateSMTP = (smtpData) => {
    const errors = [];

    // Required fields validation
    if (!smtpData.smtpHost || smtpData.smtpHost.trim() === '') {
      errors.push('SMTP Host is required');
    }

    if (!smtpData.smtpUser || smtpData.smtpUser.trim() === '') {
      errors.push('SMTP User is required');
    }

    if (!smtpData.smtpPassword || smtpData.smtpPassword.trim() === '') {
      errors.push('SMTP Password is required');
    }

    if (!smtpData.smtpPort || smtpData.smtpPort.trim() === '') {
      errors.push('SMTP Port is required');
    }

    if (!smtpData.senderEmail || smtpData.senderEmail.trim() === '') {
      errors.push('Sender Email is required');
    }

    if (!smtpData.senderName || smtpData.senderName.trim() === '') {
      errors.push('Sender Name is required');
    }

    if (!smtpData.replyToEmail || smtpData.replyToEmail.trim() === '') {
      errors.push('Reply To Email is required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (smtpData.senderEmail && !emailRegex.test(smtpData.senderEmail)) {
      errors.push('Sender Email must be a valid email address');
    }

    if (smtpData.replyToEmail && !emailRegex.test(smtpData.replyToEmail)) {
      errors.push('Reply To Email must be a valid email address');
    }

    if (smtpData.smtpUser && !emailRegex.test(smtpData.smtpUser)) {
      errors.push('SMTP User must be a valid email address');
    }

    // Port validation
    const port = parseInt(smtpData.smtpPort);
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.push('SMTP Port must be a valid port number (1-65535)');
    }

    // Protocol validation
    const validProtocols = ['TLS', 'SSL', 'None'];
    if (smtpData.smtpProtocol && !validProtocols.includes(smtpData.smtpProtocol)) {
      errors.push('SMTP Protocol must be TLS, SSL, or None');
    }

    // Host validation
    if (smtpData.smtpHost && smtpData.smtpHost.length < 3) {
      errors.push('SMTP Host must be at least 3 characters long');
    }

    return errors;
  };

  // Save SMTP settings to API
  const saveSMTP = async (smtpData) => {
    setSubmitting(true);
    try {
      // Validate SMTP settings before saving
      const validationErrors = validateSMTP(smtpData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      if (!token || !uid) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await api.post('/groupSettings/update_smtp_setting', {
        smtp_host: smtpData.smtpHost,
        smtp_user: smtpData.smtpUser,
        smtp_pass: smtpData.smtpPassword,
        smtp_protocol: smtpData.smtpProtocol,
        smtp_port: smtpData.smtpPort,
        sender_email: smtpData.senderEmail,
        sender_name: smtpData.senderName,
        reply_to: smtpData.replyToEmail,
      }, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
        }
      });

      if (response.data?.status === 'success') {
        // Update the data with new values
        setData({
          ...smtpData,
          smtpPassword: "********", // Mask password in view
        });
        toast.success('SMTP settings saved successfully!');
        return { success: true };
      } else {
        toast.error(response.data?.message || 'Failed to save SMTP settings');
      }
    } catch (err) {
      console.error('Save SMTP error:', err);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Load SMTP settings on component mount
  useEffect(() => {
    fetchSMTP();
    
    // Set up polling every 60 seconds to keep data fresh
    const interval = setInterval(fetchSMTP, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleEdit = () => {
    setForm({
      ...data,
      smtpPassword: form.smtpPassword, // Keep the real password value
    });
    setEditMode(true);
    // No need to clear error with toast
  };

  const handleCancel = () => {
    setEditMode(false);
    // No need to clear error with toast
    // Reset form to current data
    setForm({
      ...data,
      smtpPassword: form.smtpPassword, // Keep the real password value
    });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use the provided cURL logic for saving SMTP settings
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      if (!token || !uid) {
        throw new Error('Authentication required. Please log in.');
      }
      const payload = {
        smtp_host: form.smtpHost,
        smtp_user: form.smtpUser,
        smtp_pass: form.smtpPassword,
        smtp_protocol: form.smtpProtocol,
        smtp_port: form.smtpPort,
        sender_email: form.senderEmail,
        sender_name: form.senderName,
        reply_to: form.replyToEmail,
      };
      const response = await api.post('/groupSettings/smtp_setting', payload, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
          'Content-Type': 'application/json',
        }
      });
      if (response.data?.status === 'success') {
        setData({ ...form, smtpPassword: "********" });
        toast.success('SMTP settings saved successfully!');
        setEditMode(false);
      } else {
        toast.error(response.data?.message || 'Failed to save SMTP settings');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = () => {
    fetchSMTP();
  };

  if (loading && Object.values(data).every(val => val === "" || val === "********")) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700">Loading SMTP settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3 px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">SMTP Settings</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiMail className="text-indigo-600" />
            <span>Email Configuration</span>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 w-full mx-auto border border-gray-200 dark:border-gray-700">
          {/* Header Controls */}
          <div className="flex flex-col gap-4 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <FiServer className="text-indigo-600 text-lg sm:text-xl" />
                <span className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">SMTP Configuration</span>
              </div>
              {!editMode && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiSettings className="text-indigo-600" />
                  <span>Email server settings</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
            {!editMode && (
                <>
                  <button className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition" onClick={handleRefresh} disabled={loading} title="Refresh Settings">
                    <FiRefreshCw className={loading ? "animate-spin" : ""} /> 
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  <button className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition w-full sm:w-auto justify-center" onClick={handleEdit}>
                    <FiEdit2 /> 
                    <span className="hidden sm:inline">Edit Settings</span>
                    <span className="sm:hidden">Edit</span>
                  </button>
                </>
            )}
            </div>
          </div>
          {/* Content */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-indigo-700 dark:text-indigo-300">
                <FiRefreshCw className="animate-spin text-indigo-600 dark:text-indigo-300 text-xl mr-2" />
                Loading SMTP settings...
              </div>
            ) : !editMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <FiServer className="text-indigo-600" />
                        Server Configuration
                      </h3>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="font-medium text-gray-600 dark:text-gray-300 text-sm sm:text-base">SMTP Host</span>
                          <span className="text-gray-800 dark:text-gray-100 font-mono text-xs sm:text-sm break-all">{data.smtpHost || "-"}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="font-medium text-gray-600 dark:text-gray-300 text-sm sm:text-base">SMTP Port</span>
                          <span className="text-gray-800 dark:text-gray-100 font-mono text-xs sm:text-sm">{data.smtpPort || "-"}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="font-medium text-gray-600 dark:text-gray-300 text-sm sm:text-base">Protocol</span>
                          <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded text-xs font-medium w-fit">{data.smtpProtocol || "-"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <FiMail className="text-indigo-600" />
                        Authentication
                      </h3>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="font-medium text-gray-600 dark:text-gray-300 text-sm sm:text-base">SMTP User</span>
                          <span className="text-gray-800 dark:text-gray-100 font-mono text-xs sm:text-sm break-all">{data.smtpUser || "-"}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <span className="font-medium text-gray-600 dark:text-gray-300 text-sm sm:text-base">SMTP Password</span>
                          <span className="text-gray-800 dark:text-gray-100 font-mono text-xs sm:text-sm">{data.smtpPassword}</span>
                        </div>
                      </div>
                </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                      <FiMail className="text-indigo-600" />
                      Sender Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="font-medium text-gray-600 dark:text-gray-300 text-sm sm:text-base">Sender Email</span>
                        <span className="text-gray-800 dark:text-gray-100 font-mono text-xs sm:text-sm break-all">{data.senderEmail || "-"}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="font-medium text-gray-600 dark:text-gray-300 text-sm sm:text-base">Sender Name</span>
                        <span className="text-gray-800 dark:text-gray-100 font-mono text-xs sm:text-sm break-all">{data.senderName || "-"}</span>
                </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="font-medium text-gray-600 dark:text-gray-300 text-sm sm:text-base">Reply To Email</span>
                        <span className="text-gray-800 dark:text-gray-100 font-mono text-xs sm:text-sm break-all">{data.replyToEmail || "-"}</span>
                </div>
                </div>
                </div>
                  <div className="bg-blue-50 dark:bg-blue-900/40 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <FiSettings className="text-blue-600 dark:text-blue-200" />
                      Status
                    </h3>
                    <p className="text-blue-600 dark:text-blue-200 text-sm">SMTP settings are configured and ready for email operations.</p>
                </div>
                </div>
              </div>
            ) : (
              <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <FiServer className="text-indigo-600" />
                        Server Configuration
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1 sm:mb-2 text-sm sm:text-base">SMTP Host</label>
                          <input type="text" name="smtpHost" value={form.smtpHost} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors text-sm" placeholder="e.g., smtp.gmail.com" required disabled={submitting} />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1 sm:mb-2 text-sm sm:text-base">SMTP Port</label>
                          <input type="text" name="smtpPort" value={form.smtpPort} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors text-sm" placeholder="e.g., 587, 465, 25" required disabled={submitting} />
                </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1 sm:mb-2 text-sm sm:text-base">SMTP Protocol</label>
                          <select name="smtpProtocol" value={form.smtpProtocol} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors text-sm" required disabled={submitting}>
                            <option value="TLS">TLS</option>
                            <option value="SSL">SSL</option>
                            <option value="None">None</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <FiMail className="text-indigo-600" />
                        Authentication
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1 sm:mb-2 text-sm sm:text-base">SMTP User</label>
                          <input type="text" name="smtpUser" value={form.smtpUser} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors text-sm" placeholder="e.g., user@example.com" required disabled={submitting} />
                </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1 sm:mb-2 text-sm sm:text-base">SMTP Password</label>
                          <input type="password" name="smtpPassword" value={form.smtpPassword} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors text-sm" placeholder="Enter SMTP password" required disabled={submitting} />
                </div>
                      </div>
                </div>
                </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <FiMail className="text-indigo-600" />
                        Sender Information
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Sender Email</label>
                          <input type="email" name="senderEmail" value={form.senderEmail} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors text-sm" placeholder="e.g., noreply@example.com" required disabled={submitting} />
                </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Sender Name</label>
                          <input type="text" name="senderName" value={form.senderName} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors text-sm" placeholder="e.g., Company Name" required disabled={submitting} />
                </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Reply To Email</label>
                          <input type="email" name="replyToEmail" value={form.replyToEmail} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors text-sm" placeholder="e.g., support@example.com" required disabled={submitting} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/40 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                      <h3 className="font-semibold text-yellow-700 dark:text-yellow-200 mb-2 flex items-center gap-2">
                        <FiAlertCircle className="text-yellow-600 dark:text-yellow-200" />
                        Important Notes
                      </h3>
                      <ul className="text-yellow-700 dark:text-yellow-200 text-sm space-y-1">
                        <li>• Ensure SMTP credentials are correct</li>
                        <li>• Test settings before saving</li>
                        <li>• Keep password secure</li>
                      </ul>
                    </div>
                  </div>
                </div>
                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button type="button" className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50" onClick={handleCancel} disabled={submitting}>Cancel</button>
                  <button type="submit" className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-colors disabled:opacity-50" disabled={submitting}>{submitting ? (<><FiRefreshCw className="animate-spin" />Saving...</>) : (<><FiSave />Save Settings</>)}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 