import { useState, useEffect, useRef } from "react";
import api from "../api/axiosConfig";
import { toast } from 'react-toastify';

// Role color mapping
const getRoleColor = (role) => {
  const roleColors = {
    "Super Admin": "bg-red-100 text-red-800 border-red-200",
    "Admin": "bg-purple-100 text-purple-800 border-purple-200",
    "Manager": "bg-blue-100 text-blue-800 border-blue-200",
    "Support": "bg-green-100 text-green-800 border-green-200",
    "Finance": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "HR": "bg-pink-100 text-pink-800 border-pink-200",
    "IT": "bg-indigo-100 text-indigo-800 border-indigo-200",
  };
  return roleColors[role] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const useAdminAccounts = () => {
  const [systemUsers, setSystemUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [addUserForm, setAddUserForm] = useState({
    role_id: '',
    pincode: '',
    country: '',
    name: "",
    contact: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    district: "",
    state: "",
  });
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const isCountriesFetched = useRef(false);

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || '1';
      
      if (!token) {
        toast.error('Please log in to view system users');
        window.location.href = '/login';
        return;
      }

      const response = await api.post('/userRole', {}, {
        headers: {
          'token': token,
          'uid': uid,
        }
      });

      console.log('System Users - Roles Response:', response.data);
      
      // Handle different response formats
      let rolesData = [];
      if (Array.isArray(response.data)) {
        rolesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        rolesData = response.data.data;
      } else if (response.data?.roles && Array.isArray(response.data.roles)) {
        rolesData = response.data.roles;
      }
      // Transform data to match expected format (id and name)
      const transformedRoles = rolesData.map((role, index) => ({
        id: role.id || role.role_id,
        name: role.role || role.role_name || role.name || `Role ${index + 1}`
      }));
      setUserRoles(transformedRoles);
      // Update addUserForm role_id if current role_id is not in new list
      if (addUserForm.role_id && !transformedRoles.some(r => r.id === addUserForm.role_id)) {
        setAddUserForm(prev => ({ ...prev, role_id: transformedRoles[0]?.id || '' }));
      }
    } catch (err) {
      console.error('Fetch roles error:', err);
      // Use default roles on error
      setUserRoles([]); // Clear roles on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch system users from API
  const fetchSystemUsers = async (isFirst = false) => {
    if (isFirst) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || '1';
      if (!token) {
        toast.error('Please log in to view system users');
        window.location.href = '/login';
        return;
      }
      const response = await api.post('/userDetail', {}, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
          'Content-Type': 'application/json',
        }
      });
      let usersData = [];
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      } else if (response.data?.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      }
      // Map backend fields to frontend expected fields
      const mappedUsers = usersData.map(user => ({
        id: user.id,
        name: user.name,
        contact: user.phone_num || user.contact || '',
        email: user.email,
        address: user.address,
        city: user.city,
        district: user.district,
        state: user.state,
        country: user.country,
        role: user.role_name || user.role || '',
        status: user.is_active === '1' ? 'active' : 'inactive',
        profile_image: user.profile_image,
      }));
      setSystemUsers(mappedUsers);
    } catch (err) {
      toast.error('Failed to fetch system users.');
    } finally {
      if (isFirst) setLoading(false);
    }
  };

  // Fetch countries from API
  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem('token');
      // You may need to use the correct token/header for Authorization
      const response = await api.post('/common/countries', {}, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'rurl': 'login.etribes.in',
          // 'Authorization': 'Bearer ' + token, // Uncomment if needed
        }
      });
      if (response.data && Array.isArray(response.data.data)) {
        setCountries(response.data.data);
        console.log('Fetched countries:', response.data.data);
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  // Fetch states when country changes
  const fetchStates = async (country) => {
    if (!country) {
      setStates([]);
      return;
    }
    try {
      const response = await api.post('/common/states', { country }, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'rurl': 'login.etribes.in',
          'Content-Type': 'application/json',
        }
      });
      if (response.data && Array.isArray(response.data.data)) {
        setStates(response.data.data); // [{ id, state }]
      } else {
        setStates([]);
      }
    } catch (err) {
      setStates([]);
    }
  };

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Pagination handlers
  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handleEntriesChange = e => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Change Password Modal
  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setPasswordForm({ password: "", confirmPassword: "" });
    setShowPasswordModal(true);
  };
  const closePasswordModal = () => setShowPasswordModal(false);
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || (selectedUser && selectedUser.id);
      if (!token || !uid) {
        toast.error('Authentication required. Please log in.');
        return;
      }
      const response = await api.post('/userDetail/update_password', {
        id: selectedUser.id,
        password: passwordForm.password,
        confirm_password: passwordForm.confirmPassword
      }, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'Content-Type': 'application/json',
        }
      });
      if (response.data?.status === 'success' || response.data?.message?.toLowerCase().includes('success')) {
        toast.success('Password updated successfully!');
        setTimeout(() => toast.dismiss(), 3000);
        setShowPasswordModal(false);
      } else {
        toast.error(response.data?.message || 'Failed to update password.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update password.');
    }
  };

  // View User Modal
  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };
  const closeViewModal = () => setShowViewModal(false);

  // Delete User
  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this system user?")) {
      setSystemUsers(systemUsers.filter(user => user.id !== userId));
      toast.success("System user deleted successfully!");
      setTimeout(() => toast.dismiss(), 3000);
    }
  };

  // Add System User Modal
  const openAddUserModal = () => {
    setAddUserForm({
      role_id: userRoles[0]?.id || '',
      pincode: '',
      country: '',
      name: "",
      contact: "",
      email: "",
      password: "",
      confirmPassword: "",
      address: "",
      city: "",
      district: "",
      state: "",
    });
    setShowAddUserModal(true);
  };
  const closeAddUserModal = () => setShowAddUserModal(false);
  const handleAddUserChange = (e) => setAddUserForm({ ...addUserForm, [e.target.name]: e.target.value });
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (addUserForm.password !== addUserForm.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || '1';
      if (!token) {
        toast.error('Please log in to add a system user');
        window.location.href = '/login';
        return;
      }
      const payload = {
        role_id: addUserForm.role_id,
        name: addUserForm.name,
        phone_num: addUserForm.contact,
        email: addUserForm.email,
        password: addUserForm.password,
        confirm_password: addUserForm.confirmPassword,
        address: addUserForm.address,
        city: addUserForm.city,
        district: addUserForm.district,
        pincode: addUserForm.pincode,
        country: addUserForm.country,
        area_id: addUserForm.state, // state id
      };
      const response = await api.post('/userDetail/add_user', payload, {
        headers: {
          'Client-Service': 'COHAPPRT',
          'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': 'login.etribes.in',
          'Content-Type': 'application/json',
        }
      });
      if (response.data?.status === 'success' || response.data?.message?.toLowerCase().includes('success')) {
        toast.success('System user created successfully!');
        setShowAddUserModal(false);
        await fetchSystemUsers();
      } else {
        toast.error(response.data?.message || 'Failed to create system user.');
        setShowAddUserModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create system user.');
      setShowAddUserModal(false);
    }
  };

  // Computed values
  const sortedData = [...systemUsers].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    
    if (sortDirection === "asc") {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  const filtered = sortedData.filter(user => {
    return user.name.toLowerCase().includes(search.toLowerCase()) ||
           user.email.toLowerCase().includes(search.toLowerCase()) ||
           user.contact.includes(search) ||
           user.city.toLowerCase().includes(search.toLowerCase()) ||
           user.district.toLowerCase().includes(search.toLowerCase()) ||
           user.state.toLowerCase().includes(search.toLowerCase());
  });
  
  const totalEntries = filtered.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIdx = (currentPage - 1) * entriesPerPage;
  const paginated = filtered.slice(startIdx, startIdx + entriesPerPage);

  // Initialize data
  useEffect(() => {
    fetchRoles();
    fetchSystemUsers(true);
    if (!isCountriesFetched.current) {
      fetchCountries();
      isCountriesFetched.current = true;
    }
    const interval = setInterval(() => {
      fetchRoles();
      fetchSystemUsers(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (addUserForm.country) {
      fetchStates(addUserForm.country);
    } else {
      setStates([]);
    }
  }, [addUserForm.country]);

  return {
    // State
    systemUsers,
    userRoles,
    search,
    setSearch,
    currentPage,
    entriesPerPage,
    showPasswordModal,
    showAddUserModal,
    showViewModal,
    selectedUser,
    passwordForm,
    addUserForm,
    loading,
    sortField,
    sortDirection,
    countries,
    states,
    
    // Computed values
    filtered,
    paginated,
    totalEntries,
    totalPages,
    startIdx,
    
    // Functions
    fetchSystemUsers,
    fetchRoles,
    fetchCountries,
    fetchStates,
    handleSort,
    handlePrev,
    handleNext,
    handleEntriesChange,
    openPasswordModal,
    closePasswordModal,
    handlePasswordChange,
    handlePasswordSave,
    openViewModal,
    closeViewModal,
    handleDeleteUser,
    openAddUserModal,
    closeAddUserModal,
    handleAddUserChange,
    handleAddUserSubmit,
    getRoleColor,
  };
}; 