import React, { useState, useEffect } from 'react';
import { FiUpload, FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiCalendar, FiFileText, FiGlobe, FiShield } from "react-icons/fi";
import DashboardLayout from '../components/Layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../api/axiosConfig';
import { getAuthHeaders } from '../utils/apiHeaders';

export default function Registration() {
  const [formData, setFormData] = useState({
    // Company Details
    companyName: '',
    companyAddress: '',
    companyPincode: '',
    companyEmail: '',
    companyCity: '',
    companyContactNo: '',
    companyDistrict: '',
    companyState: '',
    companyGstNo: '',
    companyCinNo: '',
    companyAadharNo: '',
    companyIecNo: '',
    companyWebsite: '',
    companyPanNumber: '',
    companyHelpline: '',
    companyTushar10: '',
    
    // Applicant Details
    applicantName: '',
    address: '',
    pincode: '',
    aadhaarNumber: '',
    contactNo: '',
    city: '',
    state: '',
    email: '',
    district: '',
    panNumber: '',
    dateOfBirth: '',
    dlNumber: '',
    tushar5: '',
    tushar6: '',
    tushar10: '',
    
    // Default values
    country: 'India'
  });

  const [loading, setLoading] = useState(false);
  const [userAdditionalFields, setUserAdditionalFields] = useState({});
  const [companyAdditionalFields, setCompanyAdditionalFields] = useState({});
  const [fieldsLoading, setFieldsLoading] = useState(true);

  // Fetch additional fields from API
  const fetchAdditionalFields = async () => {
    setFieldsLoading(true);
    try {
      // Fetch user additional fields
      const userResponse = await api.post('/groupSettings/get_user_additional_fields', {}, {
        headers: getAuthHeaders()
      });

      const userBackendData = userResponse.data?.data || userResponse.data || {};
      let userMappedData = {};
      
      if (Array.isArray(userBackendData)) {
        userMappedData = {
          additionalField1: userBackendData[0] || '',
          additionalField2: userBackendData[1] || '',
          additionalField3: userBackendData[2] || '',
          additionalField4: userBackendData[3] || '',
          additionalField5: userBackendData[4] || '',
          additionalField6: userBackendData[5] || '',
          additionalField7: userBackendData[6] || '',
          additionalField8: userBackendData[7] || '',
          additionalField9: userBackendData[8] || '',
          additionalField10: userBackendData[9] || '',
        };
      } else if (userBackendData && Object.keys(userBackendData).length > 0) {
        userMappedData = {
          additionalField1: userBackendData.ad1 || '',
          additionalField2: userBackendData.ad2 || '',
          additionalField3: userBackendData.ad3 || '',
          additionalField4: userBackendData.ad4 || '',
          additionalField5: userBackendData.ad5 || '',
          additionalField6: userBackendData.ad6 || '',
          additionalField7: userBackendData.ad7 || '',
          additionalField8: userBackendData.ad8 || '',
          additionalField9: userBackendData.ad9 || '',
          additionalField10: userBackendData.ad10 || '',
        };
      }

      // Fetch company additional fields
      const companyResponse = await api.post('/groupSettings/get_company_additional_fields', {}, {
        headers: getAuthHeaders()
      });

      const companyBackendData = companyResponse.data?.data || companyResponse.data || {};
      let companyMappedData = {};
      
      if (Array.isArray(companyBackendData)) {
        companyMappedData = {
          companyField1: companyBackendData[0] || '',
          companyField2: companyBackendData[1] || '',
          companyField3: companyBackendData[2] || '',
          companyField4: companyBackendData[3] || '',
          companyField5: companyBackendData[4] || '',
          companyField6: companyBackendData[5] || '',
          companyField7: companyBackendData[6] || '',
          companyField8: companyBackendData[7] || '',
          companyField9: companyBackendData[8] || '',
          companyField10: companyBackendData[9] || '',
        };
      } else if (companyBackendData && Object.keys(companyBackendData).length > 0) {
        companyMappedData = {
          companyField1: companyBackendData.ad1 || '',
          companyField2: companyBackendData.ad2 || '',
          companyField3: companyBackendData.ad3 || '',
          companyField4: companyBackendData.ad4 || '',
          companyField5: companyBackendData.ad5 || '',
          companyField6: companyBackendData.ad6 || '',
          companyField7: companyBackendData.ad7 || '',
          companyField8: companyBackendData.ad8 || '',
          companyField9: companyBackendData.ad9 || '',
          companyField10: companyBackendData.ad10 || '',
        };
      }

      setUserAdditionalFields(userMappedData);
      setCompanyAdditionalFields(companyMappedData);

      // Initialize form data with additional fields
      const additionalFormData = {};
      
      // Add user additional fields to form data
      Object.keys(userMappedData).forEach(key => {
        if (userMappedData[key]) {
          additionalFormData[key] = '';
        }
      });

      // Add company additional fields to form data
      Object.keys(companyMappedData).forEach(key => {
        if (companyMappedData[key]) {
          additionalFormData[key] = '';
        }
      });

      setFormData(prev => ({
        ...prev,
        ...additionalFormData
      }));

    } catch (error) {
      console.error('Failed to fetch additional fields:', error);
      toast.error('Failed to load additional fields. Using default fields.');
    } finally {
      setFieldsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdditionalFields();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      const requiredFields = [
        'companyName', 'companyAddress', 'companyEmail', 'companyContactNo', 
        'companyState', 'applicantName', 'address', 'contactNo', 'state', 'email'
      ];

      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      // TODO: Add API call here
      console.log('Registration data:', formData);
      
      toast.success('Registration submitted successfully!');
      
      // Reset form
      const resetData = {
        companyName: '',
        companyAddress: '',
        companyPincode: '',
        companyEmail: '',
        companyCity: '',
        companyContactNo: '',
        companyDistrict: '',
        companyState: '',
        companyGstNo: '',
        companyCinNo: '',
        companyAadharNo: '',
        companyIecNo: '',
        companyWebsite: '',
        companyPanNumber: '',
        companyHelpline: '',
        companyTushar10: '',
        applicantName: '',
        address: '',
        pincode: '',
        aadhaarNumber: '',
        contactNo: '',
        city: '',
        state: '',
        email: '',
        district: '',
        panNumber: '',
        dateOfBirth: '',
        dlNumber: '',
        tushar5: '',
        tushar6: '',
        tushar10: '',
        country: 'India'
      };

      // Reset additional fields
      Object.keys(userAdditionalFields).forEach(key => {
        if (userAdditionalFields[key]) {
          resetData[key] = '';
        }
      });

      Object.keys(companyAdditionalFields).forEach(key => {
        if (companyAdditionalFields[key]) {
          resetData[key] = '';
        }
      });

      setFormData(resetData);

    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = () => {
    // TODO: Implement Excel upload functionality
    toast.info('Excel upload functionality coming soon!');
  };

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  // Render dynamic field based on field name
  const renderDynamicField = (fieldName, fieldLabel, isCompany = false) => {
    const fieldType = getFieldType(fieldLabel);
    
    return (
      <div key={fieldName}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {fieldLabel}
        </label>
        {fieldType === 'date' ? (
          <input
            type="date"
            name={fieldName}
            value={formData[fieldName] || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
          />
        ) : fieldType === 'textarea' ? (
          <textarea
            name={fieldName}
            value={formData[fieldName] || ''}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100 resize-none"
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
          />
        ) : (
          <input
            type="text"
            name={fieldName}
            value={formData[fieldName] || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
          />
        )}
      </div>
    );
  };

  // Determine field type based on label
  const getFieldType = (label) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('date') || lowerLabel.includes('dob') || lowerLabel.includes('birth')) {
      return 'date';
    }
    if (lowerLabel.includes('address') || lowerLabel.includes('description') || lowerLabel.includes('details')) {
      return 'textarea';
    }
    return 'text';
  };

  if (fieldsLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading registration form...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Registration
          </h1>
          <button
            onClick={handleExcelUpload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiUpload size={16} />
            Upload Via Excel
          </button>
        </div>

        {/* Registration Form */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1 - Company Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FiHome className="text-blue-600" />
                Company Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter company address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Pincode
                </label>
                <input
                  type="text"
                  name="companyPincode"
                  value={formData.companyPincode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter pincode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company GST No.
                </label>
                <input
                  type="text"
                  name="companyGstNo"
                  value={formData.companyGstNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter GST number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company CIN No.
                </label>
                <input
                  type="text"
                  name="companyCinNo"
                  value={formData.companyCinNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter CIN number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Aadhar No.
                </label>
                <input
                  type="text"
                  name="companyAadharNo"
                  value={formData.companyAadharNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter Aadhar number"
                />
              </div>

              {/* Dynamic Company Additional Fields */}
              {Object.keys(companyAdditionalFields).map(fieldName => {
                const fieldLabel = companyAdditionalFields[fieldName];
                if (fieldLabel) {
                  return renderDynamicField(fieldName, fieldLabel, true);
                }
                return null;
              })}
            </div>

            {/* Column 2 - Contact & Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FiMail className="text-green-600" />
                Contact & Location
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter company email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company City
                </label>
                <input
                  type="text"
                  name="companyCity"
                  value={formData.companyCity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter country"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Contact No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="companyContactNo"
                  value={formData.companyContactNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter contact number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company District
                </label>
                <input
                  type="text"
                  name="companyDistrict"
                  value={formData.companyDistrict}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter district"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company State <span className="text-red-500">*</span>
                </label>
                <select
                  name="companyState"
                  value={formData.companyState}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  required
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company IEC No.
                </label>
                <input
                  type="text"
                  name="companyIecNo"
                  value={formData.companyIecNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter IEC number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Website
                </label>
                <input
                  type="url"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter website URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company PAN Number
                </label>
                <input
                  type="text"
                  name="companyPanNumber"
                  value={formData.companyPanNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter PAN number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Helpline
                </label>
                <input
                  type="tel"
                  name="companyHelpline"
                  value={formData.companyHelpline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter helpline number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Tushar10
                </label>
                <input
                  type="text"
                  name="companyTushar10"
                  value={formData.companyTushar10}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter Tushar10"
                />
              </div>
            </div>

            {/* Column 3 - Applicant Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FiUser className="text-purple-600" />
                Applicant Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Applicant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="applicantName"
                  value={formData.applicantName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter applicant name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100 resize-none"
                  placeholder="Enter address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter pincode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter Aadhaar number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter contact number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  required
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter district"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter PAN number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  DL Number
                </label>
                <input
                  type="text"
                  name="dlNumber"
                  value={formData.dlNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter DL number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tushar 5
                </label>
                <input
                  type="text"
                  name="tushar5"
                  value={formData.tushar5}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter Tushar 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tushar 6
                </label>
                <input
                  type="text"
                  name="tushar6"
                  value={formData.tushar6}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter Tushar 6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tushar 10
                </label>
                <input
                  type="text"
                  name="tushar10"
                  value={formData.tushar10}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter Tushar 10"
                />
              </div>

              {/* Dynamic User Additional Fields */}
              {Object.keys(userAdditionalFields).map(fieldName => {
                const fieldLabel = userAdditionalFields[fieldName];
                if (fieldLabel) {
                  return renderDynamicField(fieldName, fieldLabel, false);
                }
                return null;
              })}
            </div>
          </form>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                'Register'
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 