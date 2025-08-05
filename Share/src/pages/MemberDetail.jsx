import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit2, FiArrowUp, FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiCalendar, FiShield, FiFileText, FiGlobe, FiAlertCircle, FiChevronLeft, FiRefreshCw, FiBriefcase, FiX } from "react-icons/fi";
import DashboardLayout from "../components/Layout/DashboardLayout";
import api from "../api/axiosConfig";
import { toast } from 'react-toastify';
import { getAuthHeaders } from "../utils/apiHeaders";

export default function MemberDetail() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('user-profile');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');

        if (!token || !uid) {
          toast.error('Please log in to view member details');
          navigate('/login');
          return;
        }

        let foundMember = null;

        // First try to fetch from active_members endpoint
        try {
          const activeResponse = await api.post('/userDetail/active_members', {}, {
            headers: {
              'Client-Service': 'COHAPPRT',
              'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
              'uid': uid,
              'token': token,
              'rurl': 'etribes.ezcrm.site',
              'Cookie': 'ci_session=58acfaaa7f04d584262928e64f5df496ece4fe3b',
              'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 second timeout
          });

          if (activeResponse.data.success || activeResponse.data) {
            const activeMembers = Array.isArray(activeResponse.data) ? activeResponse.data : activeResponse.data.data || [];
            foundMember = activeMembers.find(m => m.id === memberId || m.company_detail_id === memberId || m.user_detail_id === memberId);
          }
        } catch (err) {
          console.log('Active members fetch failed:', err.message);
          if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
            console.log('Network connection issue with active members endpoint');
          }
        }

        // If not found in active members, try not_members endpoint
        if (!foundMember) {
          try {
            const pendingResponse = await api.post('/userDetail/not_members', { uid }, {
              headers: {
                'Client-Service': 'COHAPPRT',
                'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
                'uid': uid,
                'token': token,
                'rurl': 'etribes.ezcrm.site',
                'Cookie': 'ci_session=58acfaaa7f04d584262928e64f5df496ece4fe3b',
                'Content-Type': 'application/json',
              },
              timeout: 10000 // 10 second timeout
            });
            
            const pendingMembers = Array.isArray(pendingResponse.data) ? pendingResponse.data : pendingResponse.data.data || [];
            foundMember = pendingMembers.find(m => m.id === memberId || m.company_detail_id === memberId || m.user_detail_id === memberId);
          } catch (err) {
            console.log('Pending members fetch failed:', err.message);
            if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
              console.log('Network connection issue with pending members endpoint');
            }
          }
        }
        
        if (foundMember) {
          console.log('Found member:', foundMember);
          console.log('Available fields:', Object.keys(foundMember));
          console.log('Profile image field:', foundMember.profile_image);
          console.log('Logo field:', foundMember.logo);
          console.log('Company logo field:', foundMember.company_logo);
          console.log('Business logo field:', foundMember.business_logo);
          console.log('User image field:', foundMember.user_image);
          console.log('Avatar field:', foundMember.avatar);
          setMember(foundMember);
        } else {
          setError('Member not found or network connection issue');
          toast.error('Member not found. Please check your connection and try again.');
        }
      } catch (err) {
        console.error('Fetch member details error:', err);
        if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
          setError('Network connection failed. Please check your internet connection.');
          toast.error('Network connection failed. Please try again later.');
        } else {
          setError('Failed to fetch member details');
          toast.error(err.response?.data?.message || err.message || 'Failed to fetch member details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchMemberDetails();
    }
  }, [memberId]);

  // Fetch countries from API
  const fetchCountries = async () => {
    try {
      const response = await api.post('/common/countries', {}, {
        headers: getAuthHeaders()
      });
      if (response.data && Array.isArray(response.data.data)) {
        setCountries(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    }
  };

  // Fetch states when country changes
  const fetchStates = async (country) => {
    try {
      const response = await api.post('/common/states', { country }, {
        headers: getAuthHeaders()
      });
      if (response.data && Array.isArray(response.data.data)) {
        setStates(response.data.data);
      } else {
        setStates([]);
      }
    } catch (err) {
      setStates([]);
    }
  };

  useEffect(() => {
    if (member) {
      fetchCountries();
      if (member.country) {
        fetchStates(member.country);
      }
    }
  }, [member]);

  const handleEditData = () => {
    setEditMode(true);
    setEditData({
      // User Profile fields
      name: member.name || '',
      email: member.email || '',
      phone_num: member.phone_num || '',
      address: member.address || '',
      country: member.country || '',
      city: member.city || '',
      district: member.district || '',
      state: member.state || '', // Added missing state field
      pincode: member.pincode || '',
      user_role_id: member.user_role_id || '2', // Added missing user_role_id field
      ad1: member.ad1 || '', // PAN Number
      ad2: member.ad2 || '', // Aadhaar Number
      ad3: member.ad3 || '', // Driving License
      ad4: member.ad4 || '', // Date of Birth
      ad5: member.ad5 || '', // Valid Until
      ad6: member.ad6 || '',
      ad7: member.ad7 || '',
      ad8: member.ad8 || '',
      ad9: member.ad9 || '',
      ad10: member.ad10 || '',
      // Business Profile fields
      company_name: member.company_name || '',
      company_email: member.company_email || '',
      company_contact: member.company_contact || '',
      company_address: member.company_address || '',
      company_pan: member.company_pan || '',
      company_gstn: member.company_gstn || '',
      company_iec: member.company_iec || '',
      website: member.website || '',
      cad1: member.cad1 || '',
      cad2: member.cad2 || '',
      cad3: member.cad3 || '',
      cad4: member.cad4 || '',
      cad5: member.cad5 || '',
      cad6: member.cad6 || '',
      cad7: member.cad7 || '',
      cad8: member.cad8 || '',
      cad9: member.cad9 || '',
      cad10: member.cad10 || '',
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditData({});
    setSaving(false);
  };

  const handleFormChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');

      if (!token || !uid) {
        toast.error('Please log in to save changes');
        return;
      }

      // Prepare the update payload
      const updatePayload = {
        id: member.id,
        user_detail_id: member.user_detail_id,
        company_detail_id: member.company_detail_id,
        ...editData
      };

      // Update user details using the exact curl format
      const userResponse = await api.post('/userDetail/update_user', updatePayload, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'etribes.ezcrm.site',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cookie': 'ci_session=0255e6ece92b880171e6c1f86b380ca462930973',
        }
      });

      if (userResponse.data.success) {
        // Update company details using the same format
        const companyResponse = await api.post('/userDetail/update_company', updatePayload, {
          headers: {
            'Client-Service': 'COHAPPRT',
            'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
            'uid': uid,
            'token': token,
            'rurl': 'etribes.ezcrm.site',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Cookie': 'ci_session=0255e6ece92b880171e6c1f86b380ca462930973',
          }
        });

        if (companyResponse.data.success) {
          toast.success('Member details updated successfully!');
          setEditMode(false);
          setEditData({});
          // Refresh member data
          fetchMemberDetails();
        } else {
          toast.error(companyResponse.data.message || 'Failed to update company details');
        }
      } else {
        toast.error(userResponse.data.message || 'Failed to update user details');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getUserRoleName = (roleId) => {
    const roles = {
      '1': 'Admin',
      '2': 'Member', 
      '3': 'Guest'
    };
    return roles[roleId] || 'Member';
  };

  const tabs = [
    { id: 'user-profile', label: 'User Profile' },
    { id: 'business-profile', label: 'Business Profile' },
    { id: 'company-documents', label: 'Company Documents' },
    { id: 'personal-documents', label: 'Personal Documents' },
    { id: 'payment-details', label: 'Payment Details' },
    { id: 'products', label: 'Products' }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700 dark:text-indigo-300">Loading member details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !member) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="text-center">
            <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Member Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'The requested member could not be found.'}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const renderUserProfile = () => (
    <div className="relative w-full flex flex-col md:flex-row gap-8 items-start">
      {/* Left: Profile Picture */}
      <div className="flex flex-col items-center gap-6 min-w-[220px] w-full md:w-[220px]">
        <div className="relative">
          {(member.profile_image || member.user_image || member.avatar) ? (
            <img
              src={`https://api.etribes.ezcrm.site/${member.profile_image || member.user_image || member.avatar}`}
              alt="User Profile"
              className="w-28 h-28 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-800"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-28 h-28 rounded-full border-2 border-gray-300 dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center" 
            style={{ display: (member.profile_image || member.user_image || member.avatar) ? 'none' : 'flex' }}
          >
            <div className="text-center text-gray-600 dark:text-gray-400">
              <div className="text-3xl font-bold mb-1">
                {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-xs">
                {member.name || 'User'}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-2">{member.name || 'User'}</h2>
          <div className="text-sm text-gray-500 dark:text-gray-300 font-medium">{member.email}</div>
          <div className="text-sm text-gray-400 dark:text-gray-400">{member.phone_num}</div>
        </div>
      </div>

      {/* Right: Details Table or Edit Form */}
      <div className="flex-1 w-full">
        {editMode ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Edit User Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editData.phone_num || ''}
                  onChange={(e) => handleFormChange('phone_num', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input
                  type="text"
                  value={editData.address || ''}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <select
                  value={editData.country || ''}
                  onChange={(e) => {
                    handleFormChange('country', e.target.value);
                    if (e.target.value) {
                      fetchStates(e.target.value);
                    } else {
                      setStates([]);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.country}>{country.country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  value={editData.city || ''}
                  onChange={(e) => handleFormChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                <input
                  type="text"
                  value={editData.district || ''}
                  onChange={(e) => handleFormChange('district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                <select
                  value={editData.state || ''}
                  onChange={(e) => handleFormChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state.id} value={state.state}>{state.state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Role</label>
                <select
                  value={editData.user_role_id || '2'}
                  onChange={(e) => handleFormChange('user_role_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="1">Admin</option>
                  <option value="2">Member</option>
                  <option value="3">Guest</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                <input
                  type="text"
                  value={editData.pincode || ''}
                  onChange={(e) => handleFormChange('pincode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PAN Number</label>
                <input
                  type="text"
                  value={editData.ad1 || ''}
                  onChange={(e) => handleFormChange('ad1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhaar Number</label>
                <input
                  type="text"
                  value={editData.ad2 || ''}
                  onChange={(e) => handleFormChange('ad2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Driving License Number</label>
                <input
                  type="text"
                  value={editData.ad3 || ''}
                  onChange={(e) => handleFormChange('ad3', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={editData.ad4 || ''}
                  onChange={(e) => handleFormChange('ad4', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valid Until</label>
                <input
                  type="date"
                  value={editData.ad5 || ''}
                  onChange={(e) => handleFormChange('ad5', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-xl">
              <tbody>
                {[
                  { label: 'Name', key: 'name' },
                  { label: 'Email', key: 'email' },
                  { label: 'Contact No', key: 'phone_num' },
                  { label: 'Address', key: 'address' },
                  { label: 'Country', key: 'country' },
                  { label: 'City', key: 'city' },
                  { label: 'District', key: 'district' },
                  { label: 'State', key: 'state' },
                  { label: 'User Role', key: 'user_role_id' },
                  { label: 'PAN Number', key: 'ad1' },
                  { label: 'Aadhaar Number', key: 'ad2' },
                  { label: 'Driving License Number', key: 'ad3' },
                  { label: 'Date Of Birth', key: 'ad4' },
                  ...(member.ad5 ? [{ label: 'Valid Until', key: 'ad5' }] : []),
                  ...(member.ad6 ? [{ label: 'Additional Field 6', key: 'ad6' }] : []),
                  ...(member.ad7 ? [{ label: 'Additional Field 7', key: 'ad7' }] : []),
                  ...(member.ad8 ? [{ label: 'Additional Field 8', key: 'ad8' }] : []),
                  ...(member.ad9 ? [{ label: 'Additional Field 9', key: 'ad9' }] : []),
                  ...(member.ad10 ? [{ label: 'Additional Field 10', key: 'ad10' }] : []),
                ].map(({ label, key, value }) => (
                  <tr key={key} className="border-b last:border-b-0 border-gray-200 dark:border-gray-700">
                    <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 w-48 align-top">{label}</td>
                    <td className="px-6 py-4 bg-white dark:bg-gray-800">
                      <span className="text-gray-900 dark:text-gray-100 text-base font-normal">
                        {key === 'user_role_id' ? getUserRoleName(member[key]) : (value || member[key] || '-')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderBusinessProfile = () => (
    <div className="relative w-full flex flex-col md:flex-row gap-8 items-start">
      {/* Left: Business Logo */}
      <div className="flex flex-col items-center gap-6 min-w-[220px] w-full md:w-[220px]">
        <div className="relative">
          {(member.logo || member.company_logo || member.business_logo) ? (
            <img
              src={`https://api.etribes.ezcrm.site/${member.logo || member.company_logo || member.business_logo}`}
              alt="Business Logo"
              className="w-28 h-28 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-800"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-28 h-28 rounded-full border-2 border-gray-300 dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center" 
            style={{ display: (member.logo || member.company_logo || member.business_logo) ? 'none' : 'flex' }}
          >
            <div className="text-center text-gray-600 dark:text-gray-400">
              <div className="text-3xl font-bold mb-1">
                {member.company_name ? member.company_name.charAt(0).toUpperCase() : 'B'}
              </div>
              <div className="text-xs">
                {member.company_name || 'Business'}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-2">{member.company_name || 'Business'}</h2>
          <div className="text-sm text-gray-500 dark:text-gray-300 font-medium">{member.company_email || member.email}</div>
          <div className="text-sm text-gray-400 dark:text-gray-400">{member.company_contact || member.phone_num}</div>
        </div>
      </div>

      {/* Right: Business Details Table or Edit Form */}
      <div className="flex-1 w-full">
        {editMode ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Edit Business Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                <input
                  type="text"
                  value={editData.company_name || ''}
                  onChange={(e) => handleFormChange('company_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Email</label>
                <input
                  type="email"
                  value={editData.company_email || ''}
                  onChange={(e) => handleFormChange('company_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Contact</label>
                <input
                  type="tel"
                  value={editData.company_contact || ''}
                  onChange={(e) => handleFormChange('company_contact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Address</label>
                <input
                  type="text"
                  value={editData.company_address || ''}
                  onChange={(e) => handleFormChange('company_address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  value={editData.city || ''}
                  onChange={(e) => handleFormChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                <input
                  type="text"
                  value={editData.district || ''}
                  onChange={(e) => handleFormChange('district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                <input
                  type="text"
                  value={editData.pincode || ''}
                  onChange={(e) => handleFormChange('pincode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GST Number</label>
                <input
                  type="text"
                  value={editData.company_gstn || ''}
                  onChange={(e) => handleFormChange('company_gstn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IEC Number</label>
                <input
                  type="text"
                  value={editData.company_iec || ''}
                  onChange={(e) => handleFormChange('company_iec', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PAN Number</label>
                <input
                  type="text"
                  value={editData.company_pan || ''}
                  onChange={(e) => handleFormChange('company_pan', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <input
                  type="url"
                  value={editData.website || ''}
                  onChange={(e) => handleFormChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CIN Number</label>
                <input
                  type="text"
                  value={editData.cad4 || ''}
                  onChange={(e) => handleFormChange('cad4', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Helpline</label>
                <input
                  type="text"
                  value={editData.cad5 || ''}
                  onChange={(e) => handleFormChange('cad5', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhaar Number</label>
                <input
                  type="text"
                  value={editData.cad6 || ''}
                  onChange={(e) => handleFormChange('cad6', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-xl">
              <tbody>
                {[
                  { label: 'Name', key: 'company_name' },
                  { label: 'Email', key: 'company_email', fallback: 'email' },
                  { label: 'Contact No', key: 'company_contact', fallback: 'phone_num' },
                  { label: 'Address', key: 'company_address', fallback: 'address' },
                  { label: 'City', key: 'city' },
                  { label: 'District', key: 'district' },
                  { label: 'State', key: 'district' },
                  { label: 'Country', key: 'country', value: 'India' },
                  { label: 'Pincode', key: 'pincode' },
                  { label: 'GST No', key: 'company_gstn', fallback: 'cad1' },
                  { label: 'IEC No', key: 'company_iec', fallback: 'cad2' },
                  { label: 'PAN Number', key: 'company_pan', fallback: 'cad3' },
                  { label: 'CIN No', key: 'cad4' },
                  { label: 'Website', key: 'website' },
                  { label: 'Helpline', key: 'cad5' },
                  { label: 'Aadhar No', key: 'cad6' },
                  ...(member.cad7 ? [{ label: 'Additional Field 7', key: 'cad7' }] : []),
                  ...(member.cad8 ? [{ label: 'Additional Field 8', key: 'cad8' }] : []),
                  ...(member.cad9 ? [{ label: 'Additional Field 9', key: 'cad9' }] : []),
                  ...(member.cad10 ? [{ label: 'Additional Field 10', key: 'cad10' }] : []),
                ].map(({ label, key, value, fallback }) => (
                  <tr key={key} className="border-b last:border-b-0 border-gray-200 dark:border-gray-700">
                    <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 w-48 align-top">{label}</td>
                    <td className="px-6 py-4 bg-white dark:bg-gray-800">
                      <span className="text-gray-900 dark:text-gray-100 text-base font-normal">
                        {value || member[key] || (fallback ? member[fallback] : null) || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'user-profile':
        return renderUserProfile();
      case 'business-profile':
        return renderBusinessProfile();
      case 'company-documents':
        return (
          <div className="text-center py-8">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Company Documents section will be implemented</p>
          </div>
        );
      case 'personal-documents':
        return (
          <div className="text-center py-8">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Personal Documents section will be implemented</p>
          </div>
        );
      case 'payment-details':
        return (
          <div className="text-center py-8">
            <FiShield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Payment Details section will be implemented</p>
          </div>
        );
      case 'products':
        return (
          <div className="text-center py-8">
            <FiBriefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Products section will be implemented</p>
          </div>
        );
      default:
        return renderUserProfile();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiChevronLeft size={20} />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-orange-600">
              {activeTab === 'user-profile' ? 'User Profile' : activeTab === 'business-profile' ? 'Business Profile' : 'Member Profile'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiUser className="text-indigo-600" />
            <span>Member ID: {memberId}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
              onClick={handleRefresh}
              title="Refresh Data"
            >
              <FiRefreshCw /> 
              <span>Refresh</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <FiRefreshCw className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiEdit2 size={16} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiX size={16} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEditData}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <FiEdit2 size={16} />
                Edit Data
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        {renderTabContent()}

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
          title="Scroll to top"
        >
          <FiArrowUp size={20} />
        </button>
      </div>
    </DashboardLayout>
  );
} 