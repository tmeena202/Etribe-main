import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import etribeLogo from "../assets/Etribe-logo.jpg";
import defaultSignature from "../assets/company-logo/parent.jpg";
import { FiEdit2, FiX, FiUpload, FiCheckCircle } from "react-icons/fi";
import api from "../api/axiosConfig";
import { toast } from 'react-toastify';
import { getAuthHeaders } from "../utils/apiHeaders";
import { useGroupData } from "../context/GroupDataContext";

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
  
  // Use GroupDataContext for immediate updates
  const { fetchGroupData } = useGroupData();

  // Get API base URL from environment
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.etribes.ezcrm.site';

  // Test API connectivity
  const testAPI = async () => {
    try {
      const response = await api.post('/groupSettings', {}, {
        headers: getAuthHeaders()
      });
      console.log('API test successful:', response.data);
      return true;
    } catch (error) {
      console.error('API test failed:', error);
      return false;
    }
  };

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
        
        // Test API connectivity first
        const apiWorking = await testAPI();
        if (!apiWorking) {
          setError('Unable to connect to server. Please check your connection.');
          return;
        }
        
        const response = await api.post('/groupSettings', {}, {
          headers: getAuthHeaders()
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
          logo: backendData.logo ? `${API_BASE_URL}/${backendData.logo}` : '',
          signature: backendData.signature ? `${API_BASE_URL}/${backendData.signature}` : '',
        };
        if (isMounted) {
          setData(mappedData);
          setForm(mappedData);
          setLogoPreview(mappedData.logo);
          setSignaturePreview(mappedData.signature);
        }
      } catch (err) {
        if (isMounted) toast.error('Failed to fetch group data.');
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
      
      if (!token || !uid) {
        toast.error('Please log in to upload files.');
        return;
      }
      
      const formData = new FormData();
      formData.append('id', uid);
      formData.append('file', file);
      
      console.log('Uploading logo with data:', {
        id: uid,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      const response = await api.post('/GroupSettings/upload_logo', formData, {
        headers: {
          'Client-Service': import.meta.env.VITE_CLIENT_SERVICE || 'frontend-client',
          'Auth-Key': import.meta.env.VITE_AUTH_KEY || 'simplerestapi',
          'uid': uid,
          'token': token,
          'rurl': import.meta.env.VITE_RURL || 'https://api.etribes.ezcrm.site',
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        withCredentials: true,
      });
      
      console.log('Logo upload response:', response.data);
      console.log('Response structure:', {
        data: response.data,
        dataData: response.data?.data,
        logo: response.data?.logo,
        dataLogo: response.data?.data?.logo,
        message: response.data?.message,
        status: response.data?.status
      });
      
      // Try multiple possible paths for the logo
      let newLogo = '';
      if (response.data?.data?.logo) {
        newLogo = response.data.data.logo;
      } else if (response.data?.logo) {
        newLogo = response.data.logo;
      } else if (response.data?.data?.file) {
        newLogo = response.data.data.file;
      } else if (response.data?.file) {
        newLogo = response.data.file;
      } else if (response.data?.data?.path) {
        newLogo = response.data.data.path;
      } else if (response.data?.path) {
        newLogo = response.data.path;
      }
      
      console.log('Extracted logo path:', newLogo);
      
      if (newLogo) {
        const logoUrl = newLogo.startsWith('http') ? newLogo : `${API_BASE_URL}/${newLogo}`;
        setLogoPreview(logoUrl);
        setForm((prev) => ({ ...prev, logo: logoUrl }));
        setData((prev) => ({ ...prev, logo: logoUrl }));
        toast.success('Logo uploaded successfully!');
      } else {
        // If no logo path found, try to refresh the data
        console.log('No logo path found, refreshing data...');
        toast.info('Upload completed. Refreshing data...');
        
        // Refresh the group data to get updated logo
        try {
          const refreshResponse = await api.post('/groupSettings', {}, {
            headers: getAuthHeaders()
          });
          const backendData = refreshResponse.data?.data || refreshResponse.data || {};
          if (backendData.logo) {
            const logoUrl = backendData.logo.startsWith('http') ? backendData.logo : `${API_BASE_URL}/${backendData.logo}`;
            setLogoPreview(logoUrl);
            setForm((prev) => ({ ...prev, logo: logoUrl }));
            setData((prev) => ({ ...prev, logo: logoUrl }));
            toast.success('Logo uploaded and updated successfully!');
          } else {
            toast.error('Upload successful but logo not found in refreshed data.');
          }
        } catch (refreshErr) {
          console.error('Error refreshing data:', refreshErr);
          toast.error('Upload successful but could not refresh data.');
        }
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else if (err.response?.status === 413) {
        toast.error('File too large. Please select a smaller image.');
      } else {
        toast.error('Failed to upload logo. Please try again.');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  // Update handleLogoChange to upload the logo in real time
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB.');
        return;
      }
      
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
      
      if (!token || !uid) {
        toast.error('Please log in to upload files.');
        return;
      }
      
      const formData = new FormData();
      formData.append('id', uid);
      formData.append('file', file);
      
      console.log('Uploading signature with data:', {
        id: uid,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      const response = await api.post('/groupSettings/upload_signature', formData, {
        headers: {
          'Client-Service': import.meta.env.VITE_CLIENT_SERVICE || 'frontend-client',
          'Auth-Key': import.meta.env.VITE_AUTH_KEY || 'simplerestapi',
          'uid': uid,
          'token': token,
          'rurl': import.meta.env.VITE_RURL || 'https://api.etribes.ezcrm.site',
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        withCredentials: true,
      });
      
      console.log('Signature upload response:', response.data);
      console.log('Response structure:', {
        data: response.data,
        dataData: response.data?.data,
        signature: response.data?.signature,
        dataSignature: response.data?.data?.signature,
        message: response.data?.message,
        status: response.data?.status
      });
      
      // Try multiple possible paths for the signature
      let newSignature = '';
      if (response.data?.data?.signature) {
        newSignature = response.data.data.signature;
      } else if (response.data?.signature) {
        newSignature = response.data.signature;
      } else if (response.data?.data?.file) {
        newSignature = response.data.data.file;
      } else if (response.data?.file) {
        newSignature = response.data.file;
      } else if (response.data?.data?.path) {
        newSignature = response.data.data.path;
      } else if (response.data?.path) {
        newSignature = response.data.path;
      }
      
      console.log('Extracted signature path:', newSignature);
      
      if (newSignature) {
        const signatureUrl = newSignature.startsWith('https') ? newSignature : `${API_BASE_URL}/${newSignature}`;
        setSignaturePreview(signatureUrl);
        setForm((prev) => ({ ...prev, signature: signatureUrl }));
        setData((prev) => ({ ...prev, signature: signatureUrl }));
        toast.success('Signature uploaded successfully!');
      } else {
        // If no signature path found, try to refresh the data
        console.log('No signature path found, refreshing data...');
        toast.info('Upload completed. Refreshing data...');
        
        // Refresh the group data to get updated signature
        try {
          const refreshResponse = await api.post('/groupSettings', {}, {
            headers: getAuthHeaders()
          });
          const backendData = refreshResponse.data?.data || refreshResponse.data || {};
          if (backendData.signature) {
            const signatureUrl = backendData.signature.startsWith('https') ? backendData.signature : `${API_BASE_URL}/${backendData.signature}`;
            setSignaturePreview(signatureUrl);
            setForm((prev) => ({ ...prev, signature: signatureUrl }));
            setData((prev) => ({ ...prev, signature: signatureUrl }));
            toast.success('Signature uploaded and updated successfully!');
          } else {
            toast.error('Upload successful but signature not found in refreshed data.');
          }
        } catch (refreshErr) {
          console.error('Error refreshing data:', refreshErr);
          toast.error('Upload successful but could not refresh data.');
        }
      }
    } catch (err) {
      console.error('Signature upload error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else if (err.response?.status === 413) {
        toast.error('File too large. Please select a smaller image.');
      } else {
        toast.error('Failed to upload signature. Please try again.');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  // Update handleSignatureChange to upload the signature in real time
  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB.');
        return;
      }
      
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
    setSaveLoading(true);
    setSaveError(null);
    
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

      await api.post('/groupSettings/master_data', payload, {
        headers: getAuthHeaders()
      });

      setData(form);
      setEditMode(false);
      toast.success('Group data updated successfully!');
      
      // Refresh the GroupDataContext to update logo/signature in real-time
      await fetchGroupData();
      
    } catch (err) {
      console.error('Save group data error:', err);
      toast.error('Failed to update group data.');
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