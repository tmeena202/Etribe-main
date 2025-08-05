import React, { useState, useEffect, useRef } from "react";
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
  const [editUserMode, setEditUserMode] = useState(false);
  const [editBusinessMode, setEditBusinessMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [userAdditionalFields, setUserAdditionalFields] = useState({});
  const [companyAdditionalFields, setCompanyAdditionalFields] = useState({});
  const [userRoles, setUserRoles] = useState([]);
  const [stateCountryLoading, setStateCountryLoading] = useState(false);
  const isUserRolesFetched = useRef(false);
  const isAdditionalFieldsFetched = useRef(false);
  const isUserRolesLoading = useRef(false);

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
            'Content-Type': 'application/json',
          },
          timeout: 10000 // 10 second timeout
        });

        if (activeResponse.data.success || activeResponse.data) {
          const activeMembers = Array.isArray(activeResponse.data) ? activeResponse.data : activeResponse.data.data || [];
          foundMember = activeMembers.find(m => m.id === memberId || m.company_detail_id === memberId || m.user_detail_id === memberId);
        }
      } catch (err) {
        if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
          // Network connection issue
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
              'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 second timeout
          });
          
          const pendingMembers = Array.isArray(pendingResponse.data) ? pendingResponse.data : pendingResponse.data.data || [];
          foundMember = pendingMembers.find(m => m.id === memberId || m.company_detail_id === memberId || m.user_detail_id === memberId);
        } catch (err) {
          if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
            // Network connection issue
          }
        }
      }
      
      if (foundMember) {
        setMember(foundMember);
      } else {
        setError('Member not found');
      }
    } catch (err) {
      console.error('Error fetching member details:', err);
      setError('Failed to fetch member details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      fetchMemberDetails();
    }
  }, [memberId, navigate]);

  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      const response = await api.post('/common/countries', {}, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'etribes.ezcrm.site',
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        setCountries(response.data.data);
      } else {
        setCountries([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch countries:', err);
      console.error('❌ Error details:', err.response?.data);
      setCountries([]);
    }
  };

  const fetchStates = async (country) => {
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      const response = await api.post('/common/states', { country }, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'etribes.ezcrm.site',
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        setStates(response.data.data);
      } else {
        setStates([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch states:', err);
      console.error('❌ Error details:', err.response?.data);
      setStates([]);
    }
  };

  const fetchAllStates = async () => {
    try {
      setStateCountryLoading(true);
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      const response = await api.post('/common/states', { country: 'India' }, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'etribes.ezcrm.site',
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        const allStates = response.data.data;
        setStates(allStates); // Store all states for later use
        console.log('🔍 All states loaded:', allStates.length, 'states');
        
        // Find the state that matches the area_id
        if (member && member.area_id) {
          const memberState = allStates.find(state => state.id === member.area_id);
          
          if (memberState) {
            // Update the member object with the found state and country
            const updatedMember = {
              ...member,
              country: memberState.country,
              state: memberState.state
            };
            console.log('🔍 Updated member with state/country:', updatedMember.state, updatedMember.country);
            setMember(updatedMember);
          }
        }
      }
    } catch (err) {
      console.error('❌ Failed to fetch all states:', err);
      console.error('❌ Error details:', err.response?.data);
    } finally {
      setStateCountryLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    // Prevent multiple simultaneous calls
    if (isUserRolesLoading.current) {
      console.log('🔍 User roles already being fetched, skipping...');
      return;
    }

    try {
      isUserRolesLoading.current = true;
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      console.log('🔍 Fetching user roles...');
      
      const response = await api.post('/userRole', {}, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'etribes.ezcrm.site',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🔍 User roles response:', response.data);
      
      if (response.data && Array.isArray(response.data.data)) {
        setUserRoles(response.data.data);
        console.log('🔍 User roles set:', response.data.data);
      } else {
        setUserRoles([]);
        console.log('🔍 No user roles found, setting empty array');
      }
    } catch (err) {
      console.error('❌ Failed to fetch user roles:', err);
      console.error('❌ Error details:', err.response?.data);
      setUserRoles([]);
    } finally {
      isUserRolesLoading.current = false;
    }
  };

  // Fetch user additional fields from API
  const fetchUserAdditionalFields = async () => {
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      const response = await api.post('/groupSettings/get_user_additional_fields', {}, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'etribes.ezcrm.site',
          'Content-Type': 'application/json',
        }
      });

      const backendData = response.data?.data || response.data || {};
      
      // Map backend data to frontend format
      let mappedData = {};
      if (Array.isArray(backendData)) {
        backendData.forEach((field, index) => {
          if (index < 10) {
            mappedData[`ad${index + 1}`] = field.name || field.label || field.value || field || '';
          }
        });
      } else if (backendData && Object.keys(backendData).length > 0) {
        mappedData = {
          ad1: backendData.ad1 || '',
          ad2: backendData.ad2 || '',
          ad3: backendData.ad3 || '',
          ad4: backendData.ad4 || '',
          ad5: backendData.ad5 || '',
          ad6: backendData.ad6 || '',
          ad7: backendData.ad7 || '',
          ad8: backendData.ad8 || '',
          ad9: backendData.ad9 || '',
          ad10: backendData.ad10 || '',
        };
      }
      
      setUserAdditionalFields(mappedData);
    } catch (err) {
      console.error('Failed to fetch user additional fields:', err);
    }
  };

  // Fetch company additional fields from API
  const fetchCompanyAdditionalFields = async () => {
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      const response = await api.post('/groupSettings/get_company_additional_fields', {}, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'etribes.ezcrm.site',
          'Content-Type': 'application/json',
        }
      });

      const backendData = response.data?.data || response.data || {};
      
      // Map backend data to frontend format
      let mappedData = {};
      if (Array.isArray(backendData)) {
        backendData.forEach((field, index) => {
          if (index < 10) {
            mappedData[`cad${index + 1}`] = field.name || field.label || field.value || field || '';
          }
        });
      } else if (backendData && Object.keys(backendData).length > 0) {
        mappedData = {
          cad1: backendData.ad1 || '',
          cad2: backendData.ad2 || '',
          cad3: backendData.ad3 || '',
          cad4: backendData.ad4 || '',
          cad5: backendData.ad5 || '',
          cad6: backendData.ad6 || '',
          cad7: backendData.ad7 || '',
          cad8: backendData.ad8 || '',
          cad9: backendData.ad9 || '',
          cad10: backendData.ad10 || '',
        };
      }
      
      setCompanyAdditionalFields(mappedData);
    } catch (err) {
      console.error('Failed to fetch company additional fields:', err);
    }
  };

  useEffect(() => {
    if (member && !isUserRolesFetched.current) {
      console.log('🔍 Member loaded, fetching user roles...');
      fetchUserRoles();
      isUserRolesFetched.current = true;
    }

    // Cleanup function to reset ref when member changes
    return () => {
      if (member?.id) {
        isUserRolesFetched.current = false;
      }
    };
  }, [member?.id]); // Only depend on member ID, not the entire member object

  useEffect(() => {
    if (member && !isAdditionalFieldsFetched.current) {
      console.log('🔍 Member loaded, fetching additional fields...');
      fetchUserAdditionalFields();
      fetchCompanyAdditionalFields();
      isAdditionalFieldsFetched.current = true;
    }

    // Cleanup function to reset ref when member changes
    return () => {
      if (member?.id) {
        isAdditionalFieldsFetched.current = false;
      }
    };
  }, [member?.id]); // Only depend on member ID

  useEffect(() => {
    if (member) {
      console.log('🔍 Member loaded, fetching countries and states...');
      fetchCountries();
      fetchAllStates();
    }
  }, [member?.id]); // Only depend on member ID

  // Fetch states when country changes (similar to AdminAccounts pattern)
  useEffect(() => {
    if (editData.country && editData.country !== member?.country) {
      fetchStates(editData.country);
    }
  }, [editData.country]);

  // Update member data when states and user roles are loaded
  useEffect(() => {
    if (member && states.length > 0 && userRoles.length > 0) {
      // Map area_id to state
      let updatedMember = { ...member };
      let hasChanges = false;
      
      if (member.area_id) {
        const memberState = states.find(state => state.id === member.area_id);
        if (memberState) {
          updatedMember.state = memberState.state;
          updatedMember.country = memberState.country;
          hasChanges = true;
          console.log('🔍 Mapped state:', memberState.state, 'country:', memberState.country);
        }
      }
      
      // Ensure user_role_id is set
      if (member.user_role_id) {
        const userRole = userRoles.find(role => role.id === member.user_role_id);
        if (userRole) {
          updatedMember.user_role_id = userRole.id;
          hasChanges = true;
        }
      }
      
      // Only update if there are actual changes
      if (hasChanges && JSON.stringify(updatedMember) !== JSON.stringify(member)) {
        console.log('🔍 Updating member with mapped data:', updatedMember);
        setMember(updatedMember);
      }
    }
  }, [member?.id, states.length, userRoles.length]); // Only depend on specific values, not entire objects

  const handleEditData = () => {
    console.log('🔍 handleEditData called');
    console.log('🔍 Active tab:', activeTab);
    console.log('🔍 Member data:', member);
    console.log('🔍 States:', states);
    console.log('🔍 User roles:', userRoles);

    if (!member) {
      console.error('❌ No member data available');
      return;
    }

    // Map area_id to state and user_role_id to role
    let mappedStateId = '';
    if (member.area_id && states.length > 0) {
      const memberState = states.find(state => state.id === member.area_id);
      if (memberState) {
        mappedStateId = memberState.id; // Use state ID, not state name
      }
    }

    let mappedUserRoleId = member.user_role_id || '2';
    if (member.user_role_id && userRoles.length > 0) {
      const userRole = userRoles.find(role => role.id === member.user_role_id);
      if (userRole) {
        mappedUserRoleId = userRole.id;
      }
    }

    const editDataToSet = {
      // User profile fields
      name: member.name || '',
      phone_num: member.phone_num || '',
      address: member.address || '',
      district: member.district || '',
      city: member.city || '',
      pincode: member.pincode || '',
      country: member.country || '',
      state: mappedStateId,
      user_role_id: mappedUserRoleId,
      // Company profile fields
      company_name: member.company_name || '',
      company_email: member.company_email || '',
      company_contact: member.company_contact || '',
      company_address: member.company_address || '',
      company_pan: member.company_pan || '',
      company_gstn: member.company_gstn || '',
      company_iec: member.company_iec || '',
      website: member.website || '',
      // Additional fields
      ad1: member.ad1 || '',
      ad2: member.ad2 || '',
      ad3: member.ad3 || '',
      ad4: member.ad4 || '',
      ad5: member.ad5 || '',
      ad6: member.ad6 || '',
      ad7: member.ad7 || '',
      ad8: member.ad8 || '',
      ad9: member.ad9 || '',
      ad10: member.ad10 || '',
      // Company additional fields (cad1-cad10)
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
    };

    console.log('🔍 Setting edit data:', editDataToSet);
    setEditData(editDataToSet);

    // Set appropriate edit mode based on active tab
    if (activeTab === 'user-profile') {
      setEditUserMode(true);
      setEditBusinessMode(false);
    } else if (activeTab === 'business-profile') {
      setEditBusinessMode(true);
      setEditUserMode(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({});
    setEditMode(false);
    setEditUserMode(false);
    setEditBusinessMode(false);
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

      // Ensure required fields are present
      const finalEditData = {
        ...editData,
        state: editData.state || member.state || '',
        user_role_id: editData.user_role_id || member.user_role_id || '2' // Always ensure user_role_id is set
      };

      console.log('🔍 Saving with editData:', editData);
      console.log('🔍 Final editData with required fields:', finalEditData);
      console.log('🔍 User role ID check:', finalEditData.user_role_id);

      // Prepare user update payload (user fields only)
      const userPayload = {
        id: member.id,
        role_id: String(finalEditData.user_role_id || member.user_role_id || '2'), // Use role_id instead of user_role_id
        name: finalEditData.name,
        email: member.email, // Keep original email (read-only)
        password: member.password, // Keep original password (read-only)
        temp_password: member.temp_password || "",
        phone_num: finalEditData.phone_num,
        address: finalEditData.address,
        area_id: finalEditData.state, // Send state ID as area_id
        district: finalEditData.district,
        city: finalEditData.city,
        pincode: finalEditData.pincode,
        is_active: member.is_active || "1",
        profile_image: member.profile_image || "",
        ad1: finalEditData.ad1 || "",
        ad2: finalEditData.ad2 || "",
        ad3: finalEditData.ad3 || "",
        ad4: finalEditData.ad4 || "",
        ad5: finalEditData.ad5 || "",
        ad6: finalEditData.ad6 || "",
        ad7: finalEditData.ad7 || "",
        ad8: finalEditData.ad8 || "",
        ad9: finalEditData.ad9 || "",
        ad10: finalEditData.ad10 || "",
        lct: member.lct || "",
        company_detail_id: member.company_detail_id,
        user_detail_id: member.user_detail_id,
      };

      console.log('🔍 User payload (exact curl format):', userPayload);
      console.log('🔍 Role ID in payload:', userPayload.role_id);
      console.log('🔍 Final editData user_role_id:', finalEditData.user_role_id);
      console.log('🔍 Member user_role_id:', member.user_role_id);
      console.log('🔍 Role ID type:', typeof userPayload.role_id);
      console.log('🔍 Role ID value:', userPayload.role_id);

      // Prepare company update payload (exact curl format for company only)
      const companyPayload = {
        company_name: finalEditData.company_name || "",
        user_detail_id: member.user_detail_id,
        company_contact: finalEditData.company_contact || "",
        company_email: finalEditData.company_email || "",
        company_address: finalEditData.company_address || "",
        city: finalEditData.city || "",
        district: finalEditData.district || "",
        pincode: finalEditData.pincode || "",
        country: finalEditData.country || "",
        area_id: finalEditData.state || member.area_id || "",
        // Use ad1-ad10 for update API (not cad1-cad10)
        ad1: finalEditData.cad1 || "", // Map cad1 to ad1 for update
        ad2: finalEditData.cad2 || "", // Map cad2 to ad2 for update
        ad3: finalEditData.cad3 || "", // Map cad3 to ad3 for update
        ad4: finalEditData.cad4 || "", // Map cad4 to ad4 for update
        ad5: finalEditData.cad5 || "", // Map cad5 to ad5 for update
        ad6: finalEditData.cad6 || "", // Map cad6 to ad6 for update
        ad7: finalEditData.cad7 || "", // Map cad7 to ad7 for update
        ad8: finalEditData.cad8 || "", // Map cad8 to ad8 for update
        ad9: finalEditData.cad9 || "", // Map cad9 to ad9 for update
        ad10: finalEditData.cad10 || "", // Map cad10 to ad10 for update
      };

      console.log('🔍 Company payload (exact curl format):', companyPayload);
      console.log('🔍 Company payload keys:', Object.keys(companyPayload));
      console.log('🔍 Company payload values:', Object.values(companyPayload));
      console.log('🔍 Company payload JSON:', JSON.stringify(companyPayload, null, 2));
      
      // Update user details using the update endpoint
      const userResponse = await api.post('/userDetail/update_user', userPayload, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'etribes.ezcrm.site',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      console.log('🔍 User update response:', userResponse.data);
      console.log('🔍 User update status:', userResponse.status);
      console.log('🔍 User update success field:', userResponse.data.success);
      console.log('🔍 User update message:', userResponse.data.message);

      // Check if the API actually succeeded
      const userSuccess = userResponse.data.success === true || 
                         userResponse.data.status === 'success' || 
                         userResponse.data.status === true ||
                         userResponse.data.status === 200 ||
                         userResponse.data.message?.toLowerCase().includes('success') ||
                         userResponse.data.message?.toLowerCase().includes('updated');

      // Update company details independently (not conditional on user success)
      let companySuccess = false;
      try {
        const companyResponse = await api.post('/userDetail/add_company', companyPayload, {
          headers: {
            'Client-Service': 'COHAPPRT',
            'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
            'uid': uid,
            'token': token,
            'rurl': 'etribes.ezcrm.site',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });

        console.log('🔍 Company update response:', companyResponse.data);
        console.log('🔍 Company update status:', companyResponse.status);
        console.log('🔍 Company update success field:', companyResponse.data.success);
        console.log('🔍 Company update message:', companyResponse.data.message);
        console.log('🔍 Company update full response:', companyResponse);
        console.log('🔍 Company payload sent:', companyPayload);

        companySuccess = companyResponse.data.success === true || 
                        companyResponse.data.status === 'success' || 
                        companyResponse.data.status === true ||
                        companyResponse.data.status === 200 ||
                        companyResponse.data.message?.toLowerCase().includes('success') ||
                        companyResponse.data.message?.toLowerCase().includes('updated') ||
                        companyResponse.data.message?.toLowerCase().includes('added');

        if (companySuccess) {
          console.log('✅ Company update succeeded');
        } else {
          console.error('🔍 Company update failed:', companyResponse.data);
        }
      } catch (companyError) {
        console.error('🔍 Company API call failed:', companyError);
        console.error('🔍 Company error response:', companyError.response?.data);
        console.error('🔍 Company error status:', companyError.response?.status);
      }

      // Show appropriate success/error messages
      if (userSuccess && companySuccess) {
        toast.success('Member details updated successfully!');
      } else if (userSuccess && !companySuccess) {
        toast.success('User details updated successfully!');
        toast.error('Failed to update company details');
      } else if (!userSuccess && companySuccess) {
        toast.success('Company details updated successfully!');
        toast.error('Failed to update user details');
      } else {
        toast.error('Failed to update member details');
      }

      // Reset edit modes and refresh data if any update succeeded
      if (userSuccess || companySuccess) {
        setEditMode(false);
        setEditUserMode(false);
        setEditBusinessMode(false);
        setEditData({});
        // Refresh member data
        fetchMemberDetails();
      }
    } catch (err) {
      console.error('🔍 Save error:', err);
      console.error('🔍 Error response:', err.response?.data);
      console.error('🔍 Error status:', err.response?.status);
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
        {editUserMode ? (
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact No.</label>
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
                  {countries.map((country, index) => (
                    <option key={index} value={country.country}>{country.country}</option>
                  ))}
                </select>
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
                    <option key={state.id} value={state.id}>{state.state}</option>
                  ))}
                </select>
              </div>
              {/* Hidden field for user_role_id */}
              <input
                type="hidden"
                value={editData.user_role_id || ''}
                onChange={(e) => handleFormChange('user_role_id', e.target.value)}
              />
              {/* Dynamic User Additional Fields (all ad fields from API) */}
              {Object.keys(userAdditionalFields).map((fieldKey, index) => {
                const fieldName = userAdditionalFields[fieldKey];
                if (!fieldName) return null;
                
                return (
                  <div key={fieldKey}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {fieldName}
                    </label>
                    <input
                      type={fieldKey === 'ad5' ? 'date' : 'text'}
                      value={editData[fieldKey] || ''}
                      onChange={(e) => handleFormChange(fieldKey, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-xl">
              <tbody>
                {[
                  { label: 'Name', key: 'name' },
                  { label: 'Email', key: 'email' },
                  { label: 'Contact No.', key: 'phone_num' },
                  { label: 'Address', key: 'address' },
                  { label: 'City', key: 'city' },
                  { label: 'District', key: 'district' },
                  { label: 'Country', key: 'country' },
                  { label: 'State', key: 'state' },
                  // Dynamic User Additional Fields (all ad fields from API)
                  ...Object.keys(userAdditionalFields).map(fieldKey => ({
                    label: userAdditionalFields[fieldKey],
                    key: fieldKey
                  })).filter(item => item.label) // Show all fields that have labels, regardless of values
                ].map(({ label, key, value }) => {
                  return (
                    <tr key={key} className="border-b last:border-b-0 border-gray-200 dark:border-gray-700">
                      <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 w-48 align-top">{label}</td>
                      <td className="px-6 py-4 bg-white dark:bg-gray-800">
                        <span className="text-gray-900 dark:text-gray-100 text-base font-normal">
                          {key === 'state' || key === 'country' ? 
                            (stateCountryLoading ? 
                              <span className="text-gray-500">Loading...</span> : 
                              (value || member[key] || '-')
                            ) : 
                            (value || member[key] || '-')
                          }
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
        {editBusinessMode ? (
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
                  {countries.map((country, index) => (
                    <option key={index} value={country.country}>{country.country}</option>
                  ))}
                </select>
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
                    <option key={state.id} value={state.id}>{state.state}</option>
                  ))}
                </select>
              </div>
              {/* Hidden field for user_role_id */}
              <input
                type="hidden"
                value={editData.user_role_id || ''}
                onChange={(e) => handleFormChange('user_role_id', e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                <input
                  type="text"
                  value={editData.pincode || ''}
                  onChange={(e) => handleFormChange('pincode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              {/* Dynamic Company Additional Fields (all cad fields from API) */}
              {Object.keys(companyAdditionalFields).map((fieldKey, index) => {
                const fieldName = companyAdditionalFields[fieldKey];
                if (!fieldName) return null;
                
                return (
                  <div key={fieldKey}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {fieldName}
                    </label>
                    <input
                      type="text"
                      value={editData[fieldKey] || ''}
                      onChange={(e) => handleFormChange(fieldKey, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                );
              })}
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
                  { label: 'Country', key: 'country' },
                  { label: 'State', key: 'state' },
                  { label: 'Pincode', key: 'pincode' },
                  // Dynamic Company Additional Fields (all cad fields from API)
                  ...Object.keys(companyAdditionalFields).map(fieldKey => ({
                    label: companyAdditionalFields[fieldKey],
                    key: fieldKey
                  })).filter(item => item.label) // Show all fields that have labels, regardless of values
                ].map(({ label, key, value, fallback }) => {
                  return (
                    <tr key={key} className="border-b last:border-b-0 border-gray-200 dark:border-gray-700">
                      <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 w-48 align-top">{label}</td>
                      <td className="px-6 py-4 bg-white dark:bg-gray-800">
                        <span className="text-gray-900 dark:text-gray-100 text-base font-normal">
                          {key === 'state' || key === 'country' ? 
                            (stateCountryLoading ? 
                              <span className="text-gray-500">Loading...</span> : 
                              (value || member[key] || (fallback ? member[fallback] : null) || '-')
                            ) : 
                            (value || member[key] || (fallback ? member[fallback] : null) || '-')
                          }
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
            {/* User Profile Tab - Show buttons only when editing user profile */}
            {activeTab === 'user-profile' && editUserMode ? (
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
            ) : activeTab === 'business-profile' && editBusinessMode ? (
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