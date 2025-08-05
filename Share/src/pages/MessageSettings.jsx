import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiEdit2, FiX, FiRefreshCw, FiSave, FiMessageSquare, FiAlertCircle, FiCheckCircle, FiSettings, FiLink } from "react-icons/fi";
import api from "../api/axiosConfig";
import { toast } from 'react-toastify';
import { getAuthHeaders } from "../utils/apiHeaders";

const initialData = {
  messageUrl: "",
  mobileNoKey: "",
  messageKey: "",
};

export default function MessageSettings() {
  const [data, setData] = useState(initialData);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch message settings from API
  const fetchMessageSettings = async () => {
    setLoading(true);
    // No need to clear error with toast
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      if (!token || !uid) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await api.post('/groupSettings/get_message_setting', {}, {
        headers: getAuthHeaders()
      });

      const backendData = response.data?.data || response.data || {};
      
      // Map backend fields to frontend fields
      const mappedData = {
        messageUrl: backendData.message_url || backendData.url || backendData.api_url || "",
        mobileNoKey: backendData.mobile_no_key || backendData.mobile_key || backendData.phone_key || "",
        messageKey: backendData.message_key || backendData.msg_key || backendData.key || "",
      };

      setData(mappedData);
      setForm(mappedData);
    } catch (err) {
      console.error('Fetch message settings error:', err);
      const errorMessage = err.message || 'Failed to fetch message settings';
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

  // Validate message settings
  const validateSettings = (settingsData) => {
    const errors = [];

    // Required fields validation
    if (!settingsData.messageUrl || settingsData.messageUrl.trim() === '') {
      errors.push('Message URL is required');
    }

    if (!settingsData.mobileNoKey || settingsData.mobileNoKey.trim() === '') {
      errors.push('Mobile No. Key is required');
    }

    if (!settingsData.messageKey || settingsData.messageKey.trim() === '') {
      errors.push('Message Key is required');
    }

    // URL validation
    if (settingsData.messageUrl) {
      try {
        new URL(settingsData.messageUrl);
      } catch (e) {
        errors.push('Message URL must be a valid URL');
      }
    }

    // Key validation - should not contain spaces or special characters
    const keyRegex = /^[a-zA-Z0-9_-]+$/;
    if (settingsData.mobileNoKey && !keyRegex.test(settingsData.mobileNoKey)) {
      errors.push('Mobile No. Key should only contain letters, numbers, hyphens, and underscores');
    }

    if (settingsData.messageKey && !keyRegex.test(settingsData.messageKey)) {
      errors.push('Message Key should only contain letters, numbers, hyphens, and underscores');
    }

    // Length validation
    if (settingsData.mobileNoKey && settingsData.mobileNoKey.length < 2) {
      errors.push('Mobile No. Key must be at least 2 characters long');
    }

    if (settingsData.messageKey && settingsData.messageKey.length < 2) {
      errors.push('Message Key must be at least 2 characters long');
    }

    if (settingsData.messageUrl && settingsData.messageUrl.length < 10) {
      errors.push('Message URL must be at least 10 characters long');
    }

    return errors;
  };

  // Save message settings to API
  const saveMessageSettings = async (settingsData) => {
    setSubmitting(true);
    // No need to clear error with toast
    try {
      // Validate settings before saving
      const validationErrors = validateSettings(settingsData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      if (!token || !uid) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await api.post('/GroupSettings/message_setting', {
        message_url: settingsData.messageUrl,
        mobile_key: settingsData.mobileNoKey,
        message_key: settingsData.messageKey,
      }, {
        headers: getAuthHeaders()
      });

      if (response.data?.status === 'success') {
        // Update the data with new values
        setData(settingsData);
        toast.success('Message settings saved successfully!');
        return { success: true };
      } else {
        toast.error(response.data?.message || 'Failed to save message settings');
      }
    } catch (err) {
      console.error('Save message settings error:', err);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Remove testMessageSettings function

  // Load message settings on component mount
  useEffect(() => {
    fetchMessageSettings();
    
    // Set up polling every 60 seconds to keep data fresh
    const interval = setInterval(fetchMessageSettings, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleEdit = () => {
    setForm(data);
    setEditMode(true);
    // No need to clear error with toast
  };

  const handleCancel = () => {
    setEditMode(false);
    // No need to clear error with toast
    // Reset form to current data
    setForm(data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveMessageSettings(form);
    setEditMode(false);
      // No need to clear error with toast
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRefresh = () => {
    fetchMessageSettings();
  };

  // Check if settings are configured
  const isConfigured = data.messageUrl && data.mobileNoKey && data.messageKey;

  if (loading && Object.values(data).every(val => val === "")) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700">Loading message settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Message Settings</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiMessageSquare className="text-indigo-600" />
            <span>Status: {isConfigured ? 'Configured' : 'Not Configured'}</span>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 max-w-7xl w-full mx-auto border border-gray-200 dark:border-gray-700">
          {/* Header Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <FiMessageSquare className="text-indigo-600 text-xl" />
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">Message Configuration</span>
              </div>
              {!editMode && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiSettings className="text-indigo-600" />
                  <span>SMS/WhatsApp API settings</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
            {!editMode && (
                <>
                  <button className="flex items-center gap-1 bg-blue-500 text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600 transition" onClick={handleRefresh} disabled={loading} title="Refresh Settings">
                    <FiRefreshCw className={loading ? "animate-spin" : ""} /> 
                    <span>Refresh</span>
                  </button>
                  <button className="flex items-center gap-1 bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-indigo-700 transition" onClick={handleEdit}>
                    <FiEdit2 /> 
                    <span>Edit Settings</span>
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
                Loading message settings...
                </div>
            ) : !editMode ? (
              <div className="space-y-6">
                {/* Status Card */}
                <div className={`p-4 rounded-lg border ${isConfigured ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700' : 'bg-yellow-50 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-700'}`}>
                  <h3 className={`font-semibold mb-2 flex items-center gap-2 ${isConfigured ? 'text-green-700 dark:text-green-200' : 'text-yellow-700 dark:text-yellow-200'}`}>
                    <FiSettings className={isConfigured ? 'text-green-600 dark:text-green-200' : 'text-yellow-600 dark:text-yellow-200'} />
                    Configuration Status
                  </h3>
                  <p className={`text-sm ${isConfigured ? 'text-green-600 dark:text-green-200' : 'text-yellow-600 dark:text-yellow-200'}`}>
                    {isConfigured ? "Message settings are configured and ready for use." : "Message settings are not fully configured. Please configure all required fields."}
                  </p>
                </div>
                {/* Settings Display */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                      <FiLink className="text-indigo-600" />
                      API Configuration
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Message URL</span>
                        <span className="text-gray-800 dark:text-gray-100 font-mono text-sm text-right max-w-xs break-all">{data.messageUrl || "Not configured"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                      <FiMessageSquare className="text-indigo-600" />
                      Message Parameters
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Mobile No. Key</span>
                        <span className="text-gray-800 dark:text-gray-100 font-mono text-sm">{data.mobileNoKey || "Not configured"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Message Key</span>
                        <span className="text-gray-800 dark:text-gray-100 font-mono text-sm">{data.messageKey || "Not configured"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Remove Test Results section */}
                {isConfigured && (
                  <div className="bg-blue-50 dark:bg-blue-900/40 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <FiSettings className="text-blue-600 dark:text-blue-200" />
                      Configuration Status
                    </h3>
                    <p className="text-blue-600 dark:text-blue-200 text-sm">Your message settings are configured and ready to use.</p>
                  </div>
                )}
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Form Header */}
                <div className="bg-yellow-50 dark:bg-yellow-900/40 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <h3 className="font-semibold text-yellow-700 dark:text-yellow-200 mb-2 flex items-center gap-2">
                    <FiAlertCircle className="text-yellow-600 dark:text-yellow-200" />
                    Message API Configuration
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-200 text-sm">Configure your SMS/WhatsApp API settings. Ensure all fields are properly configured for message functionality.</p>
                </div>
                {/* Form Fields */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <FiLink className="text-indigo-600" />
                        API Configuration
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">Message URL</label>
                          <input type="url" name="messageUrl" value={form.messageUrl} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors" placeholder="https://api.example.com/send-message" required disabled={submitting} />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The API endpoint URL for sending messages</p>
                        </div>
                      </div>
                    </div>
                </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <FiMessageSquare className="text-indigo-600" />
                        Message Parameters
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">Mobile No. Key</label>
                          <input type="text" name="mobileNoKey" value={form.mobileNoKey} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors" placeholder="mobile_number" required disabled={submitting} />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The parameter name for mobile number in API requests</p>
                </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">Message Key</label>
                          <input type="text" name="messageKey" value={form.messageKey} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors" placeholder="msg_key_123456" required disabled={submitting} />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">The parameter name for message content in API requests</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button type="button" className="px-4 sm:px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm sm:text-base" onClick={handleCancel} disabled={submitting}>Cancel</button>
                  <button type="submit" className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base" disabled={submitting}>{submitting ? (<><FiRefreshCw className="animate-spin" />Saving...</>) : (<><FiSave />Save Settings</>)}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}