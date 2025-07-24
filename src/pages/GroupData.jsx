import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import etribeLogo from "../assets/Etribe-logo.jpg";
import defaultSignature from "../assets/company-logo/parent.jpg";
import { FiEdit2, FiX, FiUpload, FiCheckCircle } from "react-icons/fi";
import api from "../api/axiosConfig";

const initialData = {};

export default function GroupData() {
  const [data, setData] = useState(initialData);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialData);
  const [logoPreview, setLogoPreview] = useState(initialData.logo);
  const [signaturePreview, setSignaturePreview] = useState(initialData.signature);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const logoInputRef = useRef();
  const signatureInputRef = useRef();

  useEffect(() => {
    let isMounted = true;
    const fetchGroupData = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        if (!token) {
          setError('Please log in to view group data');
          return;
        }
        const response = await api.post('/groupSettings', {}, {
          headers: {
            'Client-Service': 'COHAPPRT',
            'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
            'uid': uid,
            'token': token,
            'rurl': 'login.etribes.in',
            'Content-Type': 'application/json',
          }
        });
        const backendData = response.data?.data || response.data || {};
        const mappedData = {
          name: backendData.name || '',
          email: backendData.email || '',
          contact: backendData.contact || '',
          address: backendData.address || '',
          city: backendData.city || '',
          state: backendData.state || '',
          pincode: backendData.pincode || '',
          country: backendData.country || '',
          signatureName: backendData.signatory_name || '',
          signatureDesignation: backendData.signatory_designation || '',
          logo: backendData.logo ? `https://api.etribes.in/${backendData.logo}` : '',
          signature: backendData.signature ? `https://api.etribes.in/${backendData.signature}` : '',
        };
        if (isMounted) {
          setData(mappedData);
          setForm(mappedData);
          setLogoPreview(mappedData.logo);
          setSignaturePreview(mappedData.signature);
        }
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Failed to fetch group data');
      } finally {
        if (showLoading && isMounted) setLoading(false);
      }
    };
    fetchGroupData(true); // Initial load with spinner
    return () => { isMounted = false; };
  }, []);

  // Manual refresh button handler
  const handleManualRefresh = () => {
    setLoading(true);
    setError(null);
    // Call fetchGroupData with spinner
    // (re-use the effect's fetchGroupData logic)
    // For this, move fetchGroupData to useRef or out of useEffect if needed
    window.location.reload(); // Simple way for now, or refactor for better
  };

  const handleEdit = () => {
    setForm(data);
    setLogoPreview(data.logo);
    setSignaturePreview(data.signature);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add uploadLogo function
  const uploadLogo = async (file) => {
    setSaveLoading(true);
    setSaveError(null);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      const formData = new FormData();
      formData.append('id', uid || '1');
      formData.append('file', file);
      const response = await api.post('/GroupSettings/upload_logo', formData, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      // The backend should return the new logo path
      const newLogo = response.data?.data?.logo || response.data?.logo || '';
      if (newLogo) {
        const logoUrl = newLogo.startsWith('http') ? newLogo : `https://api.etribes.in/${newLogo}`;
        setLogoPreview(logoUrl);
        setForm((prev) => ({ ...prev, logo: logoUrl }));
        setData((prev) => ({ ...prev, logo: logoUrl }));
      }
      setSaveSuccess('Logo updated successfully!');
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setSaveLoading(false);
    }
  };

  // Update handleLogoChange to upload the logo in real time
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      // Upload to backend
      uploadLogo(file);
    }
  };

  // Add uploadSignature function
  const uploadSignature = async (file) => {
    setSaveLoading(true);
    setSaveError(null);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      const formData = new FormData();
      formData.append('id', uid || '1');
      formData.append('file', file);
      const response = await api.post('/groupSettings/upload_signature', formData, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      // The backend should return the new signature path
      const newSignature = response.data?.data?.signature || response.data?.signature || '';
      if (newSignature) {
        const signatureUrl = newSignature.startsWith('http') ? newSignature : `https://api.etribes.in/${newSignature}`;
        setSignaturePreview(signatureUrl);
        setForm((prev) => ({ ...prev, signature: signatureUrl }));
        setData((prev) => ({ ...prev, signature: signatureUrl }));
      }
      setSaveSuccess('Signature updated successfully!');
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to upload signature');
    } finally {
      setSaveLoading(false);
    }
  };

  // Update handleSignatureChange to upload the signature in real time
  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result);
      };
      reader.readAsDataURL(file);
      // Upload to backend
      uploadSignature(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Save button clicked', form);
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(null);
    
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      // Prepare payload for backend (as per working Postman example)
      const payload = {
        name: form.name,
        email: form.email,
        contact: form.contact,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        area_id: form.area_id && form.area_id !== '' ? form.area_id : '13',
        country: form.country,
        signatory_name: form.signatureName,
        signatory_designation: form.signatureDesignation,
      };

      console.log('Saving group data (cURL):', payload);
      
      await api.post('/groupSettings/master_data', payload, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
          'Content-Type': 'application/json',
        }
      });

    setData(form);
    setEditMode(false);
      setSaveSuccess('Group data updated successfully!');
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Save group data error:', err);
      setSaveError(err.response?.data?.message || 'Failed to save group data');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="relative w-full flex flex-col md:flex-row gap-8 items-start">
          {/* Floating Edit Button */}
          {!editMode && (
              <button
            className="absolute top-0 right-0 p-2 rounded-full bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-gray-600 hover:text-indigo-800 dark:hover:text-indigo-100 shadow transition"
                onClick={handleEdit}
              disabled={loading}
              title="Edit Profile"
              >
              <FiEdit2 size={22} />
              </button>
          )}

          {/* Left: Logo and Signature */}
        <div className="flex flex-col items-center gap-6 min-w-[220px] w-full md:w-[220px]">
            <div className="relative">
              <img
                src={logoPreview}
                alt="Admin Logo"
              className="w-28 h-28 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-800"
              />
        {editMode && (
                      <button
                        type="button"
                  className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full shadow hover:bg-indigo-700"
                        onClick={() => logoInputRef.current.click()}
                  title="Change Logo"
                      >
                        <FiUpload size={16} />
                      </button>
              )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={logoInputRef}
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </div>
            <div className="relative">
                      <img
                        src={signaturePreview}
                alt="Signature"
              className="w-40 h-14 object-contain rounded-lg border-2 border-gray-300 dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-800"
                      />
              {editMode && (
                      <button
                        type="button"
                  className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full shadow hover:bg-indigo-700"
                        onClick={() => signatureInputRef.current.click()}
                  title="Change Signature"
                      >
                        <FiUpload size={16} />
                      </button>
              )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={signatureInputRef}
                        className="hidden"
                        onChange={handleSignatureChange}
                      />
                    </div>
            <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-2">{data.name}</h2>
            <div className="text-sm text-gray-500 dark:text-gray-300 font-medium">{data.signatureDesignation || 'Administrator'}</div>
            <div className="text-sm text-gray-400 dark:text-gray-400">{data.email}</div>
            <span className="text-xs text-gray-400 dark:text-gray-400 italic mt-1 block">{data.signatureName}, {data.signatureDesignation}</span>
            </div>
                  </div>

          {/* Right: Details Table or Edit Form */}
          <div className="flex-1 w-full">
            {/* Loading/Error/Success Banners */}
            {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center rounded-2xl z-20">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-200">
                <svg className="animate-spin h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-200" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" /></svg>
                  Loading profile...
                </div>
              </div>
            )}
            {error && (
            <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/40 dark:text-red-200 rounded-lg px-4 py-2">
                <FiX /> {error}
              </div>
            )}
            {saveSuccess && (
            <div className="mb-4 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/40 dark:text-green-200 rounded-lg px-4 py-2">
                <FiCheckCircle /> {saveSuccess}
              </div>
            )}
            {/* Floating Toast Notification */}
            {(saveSuccess || saveError) && (
              <div
                style={{
                  position: 'fixed',
                  bottom: 24,
                  right: 24,
                  zIndex: 9999,
                  minWidth: 240,
                  maxWidth: 360,
                  padding: '16px 24px',
                  borderRadius: 8,
                  background: saveSuccess ? '#22c55e' : '#ef4444',
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 2px 16px 0 rgba(0,0,0,0.15)',
                  letterSpacing: 0.2,
                  fontSize: 16,
                  textAlign: 'center',
                  transition: 'opacity 0.3s',
                }}
                role="alert"
              >
                {saveSuccess || saveError}
              </div>
            )}
            <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-xl">
                <tbody>
                  {[
                    { label: 'Contact No', key: 'contact' },
                    { label: 'Address', key: 'address' },
                    { label: 'City', key: 'city' },
                    { label: 'Pincode', key: 'pincode' },
                    { label: 'Country', key: 'country' },
                  { label: 'State', key: 'state' },
                    { label: 'Signature Name', key: 'signatureName' },
                    { label: 'Signature Designation', key: 'signatureDesignation' },
                  ].map(({ label, key }) => (
                  <tr key={key} className="border-b last:border-b-0 border-gray-200 dark:border-gray-700">
                    <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 w-48 align-top">{label}</td>
                    <td className="px-6 py-4 bg-white dark:bg-gray-800">
                        {!editMode ? (
                        <span className="text-gray-900 dark:text-gray-100 text-base font-normal">{data[key]}</span>
                        ) : (
                          <input
                            type="text"
                            name={key}
                            value={form[key]}
                            onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400"
                            required
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Save/Cancel Buttons in Edit Mode */}
            {editMode && (
            <form onSubmit={handleSubmit} className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                className="px-6 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                  <button
                    type="submit"
                  className="px-8 py-2 rounded-lg font-semibold bg-indigo-600 text-white shadow hover:bg-indigo-700 transition"
                disabled={saveLoading}
                  >
                    Save
                  </button>
            </form>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
} 