import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiEdit2, FiPlus, FiKey, FiX, FiFileText, FiFile, FiEye, FiRefreshCw, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiShield, FiCheckCircle, FiAlertCircle, FiCopy, FiDownload, FiChevronDown, FiChevronUp } from "react-icons/fi";
import api from "../api/axiosConfig";
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAuthHeaders } from "../utils/apiHeaders";

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

export default function AdminAccounts() {
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
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const isCountriesFetched = useRef(false);

  // Handle click outside for export dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

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
  const fetchSystemUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || '1';
      if (!token) {
        toast.error('Please log in to view system users');
        window.location.href = '/login';
        return;
      }
      const response = await api.post('/userDetail', {}, {
        headers: getAuthHeaders()
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
      setLoading(false);
    }
  };

  // Fetch countries from API
  const fetchCountries = async () => {
    try {
      const token = localStorage.getItem('token');
      // You may need to use the correct token/header for Authorization
      const response = await api.post('/common/countries', {}, {
        headers: getAuthHeaders()
      });
      if (response.data && Array.isArray(response.data.data)) {
        setCountries(response.data.data);
        console.log('Fetched countries:', response.data.data);
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchSystemUsers();
    if (!isCountriesFetched.current) {
      fetchCountries();
      isCountriesFetched.current = true;
    }
    const interval = setInterval(() => {
      fetchRoles();
      fetchSystemUsers();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort data
  const sortedData = [...systemUsers].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    
    if (sortDirection === "asc") {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  // Filtered and paginated data
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
        headers: getAuthHeaders()
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
        headers: getAuthHeaders()
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

  // Export functions
  const handleExportCopy = () => {
    const tableData = filtered.map(user => 
      `${user.name}\t${user.contact}\t${user.email}\t${user.address}\t${user.city}\t${user.district}\t${user.state}\t${user.country}`
    ).join('\n');
    
    const headers = "Name\tContact No.\tEmail Address\tAddress\tCity\tDistrict\tState\tCountry";
    const fullData = headers + '\n' + tableData;
    
    navigator.clipboard.writeText(fullData).then(() => {
      toast.success("Data copied to clipboard!");
    });
  };

  const handleExportExcel = () => {
    // Excel export logic
    toast.info("Excel export functionality would be implemented here!");
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Contact No.", "Email Address", "Address", "City", "District", "State", "Country"];
    const csvData = filtered.map(user => [
      user.name,
      user.contact,
      user.email,
      user.address,
      user.city,
      user.district,
      user.state,
      user.country
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...csvData].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "system_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV exported successfully!");
  };

  const handleExportPDF = () => {
    if (!systemUsers.length) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    const headers = [[
      "Name", "Contact", "Email", "Address", "Role", "Status"
    ]];
    const rows = systemUsers.map(user => [
      user.name,
      user.contact,
      user.email,
      user.address,
      user.role,
      user.status || 'Active'
    ]);
    try {
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      doc.save("system_users.pdf");
      toast.success("System users exported to PDF!");
    } catch (err) {
      console.error("autoTable failed:", err);
      toast.error("PDF export failed: " + err.message);
    }
  };

  // Fetch states when country changes
  useEffect(() => {
    if (addUserForm.country) {
      const fetchStates = async () => {
        try {
          const response = await api.post('/common/states', { country: addUserForm.country }, {
            headers: getAuthHeaders()
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
      fetchStates();
    } else {
      setStates([]);
    }
  }, [addUserForm.country]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700">Loading system users...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-orange-600">System Users</h1>
        </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 max-w-7xl w-full mx-auto">
          {/* Filter and Export Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, contact..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ minWidth: '100%', maxWidth: '100%' }}
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                <span>Showing {startIdx + 1} to {Math.min(startIdx + entriesPerPage, totalEntries)} of {totalEntries} entries</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Export Buttons - Left Side */}
              <div className="flex items-center gap-2">
                {/* Desktop Export Buttons - Show on larger screens */}
                <div className="hidden xl:flex gap-2">
                  <button 
                    className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                    onClick={handleExportCopy}
                    title="Copy to Clipboard"
                  >
                    <FiCopy /> Copy
                  </button>
                  <button 
                    className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition"
                    onClick={handleExportExcel}
                    title="Export to Excel"
                  >
                    <FiFile /> Excel
                  </button>
                  <button 
                    className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                    onClick={handleExportCSV}
                    title="Export to CSV"
                  >
                    <FiDownload /> CSV
                  </button>
                  <button
                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                    onClick={handleExportPDF}
                    title="Export to PDF"
                  >
                    <FiFile /> PDF
                  </button>
                </div>
                
                {/* Mobile/Tablet Export Dropdown - Show on smaller screens */}
                <div className="relative xl:hidden">
                  <button
                    className="flex items-center gap-1 bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition"
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                  >
                    <FiDownload />
                    <span>Export</span>
                    <FiChevronDown className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showExportDropdown && (
                    <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 min-w-32">
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                        onClick={() => {
                          handleExportCopy();
                          setShowExportDropdown(false);
                        }}
                      >
                        <FiCopy className="text-gray-500" />
                        Copy
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          handleExportCSV();
                          setShowExportDropdown(false);
                        }}
                      >
                        <FiDownload className="text-green-500" />
                        CSV
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          handleExportExcel();
                          setShowExportDropdown(false);
                        }}
                      >
                        <FiFile className="text-emerald-500" />
                        Excel
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                        onClick={() => {
                          handleExportPDF();
                          setShowExportDropdown(false);
                        }}
                      >
                        <FiFile className="text-red-500" />
                        PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Add System User Button - Right Side */}
              <button
                className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex-shrink-0"
                onClick={openAddUserModal}
                title="Add System User"
              >
                <FiPlus /> Add
              </button>
            </div>
          </div>

          {/* System Users Table - Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-gray-700 dark:text-gray-200 sticky top-0 z-10 shadow-sm">
                <tr className="border-b-2 border-indigo-200 dark:border-indigo-800">
                  <th 
                    className="p-3 text-center font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                    onClick={() => handleSort("id")}
                    style={{ minWidth: '60px', width: '60px' }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      SN
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "id" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "id" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                    onClick={() => handleSort("name")}
                    style={{ minWidth: '120px', width: '120px' }}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "name" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "name" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                    onClick={() => handleSort("contact")}
                    style={{ minWidth: '120px', width: '120px' }}
                  >
                    <div className="flex items-center gap-1">
                      Contact
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "contact" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "contact" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                    onClick={() => handleSort("email")}
                    style={{ minWidth: '180px', width: '180px' }}
                  >
                    <div className="flex items-center gap-1">
                      Email
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "email" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "email" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                    onClick={() => handleSort("address")}
                    style={{ minWidth: '200px', width: '200px' }}
                  >
                    <div className="flex items-center gap-1">
                      Address
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "address" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "address" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                    onClick={() => handleSort("city")}
                    style={{ minWidth: '100px', width: '100px' }}
                  >
                    <div className="flex items-center gap-1">
                      City
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "city" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "city" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                    onClick={() => handleSort("district")}
                    style={{ minWidth: '120px', width: '120px' }}
                  >
                    <div className="flex items-center gap-1">
                      District
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "district" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "district" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                    onClick={() => handleSort("state")}
                    style={{ minWidth: '120px', width: '120px' }}
                  >
                    <div className="flex items-center gap-1">
                      State
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "state" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "state" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                    onClick={() => handleSort("country")}
                    style={{ minWidth: '100px', width: '100px' }}
                  >
                    <div className="flex items-center gap-1">
                      Country
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "country" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "country" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                    onClick={() => handleSort("role")}
                    style={{ minWidth: '120px', width: '120px' }}
                  >
                    <div className="flex items-center gap-1">
                      Role
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "role" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "role" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-center font-semibold whitespace-nowrap"
                    style={{ minWidth: '80px', width: '80px' }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Action
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">▲</span>
                        <span className="text-xs text-gray-400">▼</span>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((user, idx) => (
                  <tr 
                    key={user.id} 
                    className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${
                      idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'
                    } hover:bg-indigo-50 dark:hover:bg-gray-700 hover:shadow-sm`}
                  >
                    <td className="p-3 text-center font-semibold text-indigo-700 dark:text-indigo-300 border-r border-gray-200 dark:border-gray-700">
                      {startIdx + idx + 1}
                    </td>
                    <td className="p-3 font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                      {user.name}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      {user.contact}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      {user.email}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300 max-w-xs truncate border-r border-gray-200 dark:border-gray-700">
                      {user.address}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      {user.city}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      {user.district}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      {user.state}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      {user.country}
                    </td>
                    <td className="p-3 text-center border-r border-gray-200 dark:border-gray-700">
                      <span className={
                        `px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)} dark:bg-indigo-900 dark:text-gray-100 dark:border-indigo-800`
                      }>
                        {user.role || "No Role"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center">
                      <button
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-gray-700 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                          onClick={() => openViewModal(user)}
                          title="View User"
                        >
                          <FiEye size={18} />
                      </button>
                      <button
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 dark:text-green-300 dark:hover:bg-gray-700 rounded-lg transition-colors border border-green-200 hover:border-green-300"
                          onClick={() => openPasswordModal(user)}
                          title="Change Password"
                        >
                          <FiKey size={18} />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden p-4 sm:p-6 space-y-4">
            {paginated.map((user, idx) => (
              <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">User #{startIdx + idx + 1}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)} dark:bg-indigo-900 dark:text-gray-100 dark:border-indigo-800`}>
                        {user.role || "No Role"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors p-1"
                      onClick={() => openViewModal(user)}
                      title="View User"
                    >
                      <FiEye size={16} />
                    </button>
                    <button
                      className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors p-1"
                      onClick={() => openPasswordModal(user)}
                      title="Change Password"
                    >
                      <FiKey size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{user.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{user.email}</span>
                  </div>
                  {user.address && (
                    <div className="flex items-start gap-2">
                      <FiMapPin className="text-gray-400 flex-shrink-0 mt-0.5" size={14} />
                      <span className="text-gray-700 dark:text-gray-300 text-xs line-clamp-2">
                        {user.address}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <FiMapPin className="text-gray-400 flex-shrink-0" size={12} />
                      <span className="text-gray-600 dark:text-gray-400">{user.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiMapPin className="text-gray-400 flex-shrink-0" size={12} />
                      <span className="text-gray-600 dark:text-gray-400">{user.district}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiMapPin className="text-gray-400 flex-shrink-0" size={12} />
                      <span className="text-gray-600 dark:text-gray-400">{user.state}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiMapPin className="text-gray-400 flex-shrink-0" size={12} />
                      <span className="text-gray-600 dark:text-gray-400">{user.country}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-400">Show</span>
                <select
                className="border rounded-lg px-3 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 text-gray-700 focus:ring-2 focus:ring-indigo-400 transition-colors"
                  value={entriesPerPage}
                  onChange={handleEntriesChange}
                >
                {[5, 10, 25, 50, 100].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400">entries per page</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                title="Previous"
                  >
                    &lt;
                </button>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Page {currentPage} of {totalPages}
                  </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                title="Next"
                  >
                    &gt;
                </button>
                </div>
            </div>
          </div>
        </div>

        {/* Enhanced Change Password Modal */}
        {showPasswordModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                onClick={closePasswordModal}
                title="Close"
              >
                <FiX size={24} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Manage User</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{selectedUser.name}</p>
                </div>
              </div>
              <form className="flex flex-col gap-6" onSubmit={handlePasswordSave}>
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-gray-700 dark:text-gray-300">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={passwordForm.password}
                    onChange={handlePasswordChange}
                    className="px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                    onClick={closePasswordModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Add System User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                onClick={closeAddUserModal}
                title="Close"
              >
                <FiX size={24} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                  <FiPlus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add System User</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Create a new system user account</p>
                </div>
              </div>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleAddUserSubmit}>
                <div className="md:col-span-2">
                  <label className="font-medium text-gray-700 dark:text-gray-300">User Role *</label>
                  <select
                    name="role_id"
                    value={addUserForm.role_id}
                    onChange={handleAddUserChange}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    required
                  >
                    <option value="">Select Role</option>
                    {userRoles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={addUserForm.name}
                    onChange={handleAddUserChange}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Contact Number *</label>
                  <input
                    type="tel"
                    name="contact"
                    value={addUserForm.contact}
                    onChange={handleAddUserChange}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    placeholder="Enter contact number"
                    required
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={addUserForm.email}
                    onChange={handleAddUserChange}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={addUserForm.password}
                    onChange={handleAddUserChange}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    placeholder="Enter password"
                    required
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={addUserForm.confirmPassword}
                    onChange={handleAddUserChange}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    placeholder="Confirm password"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="font-medium text-gray-700 dark:text-gray-300">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={addUserForm.address}
                    onChange={handleAddUserChange}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    placeholder="Enter address"
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">City</label>
                  <input
                    type="text"
                    name="city"
                    value={addUserForm.city}
                    onChange={handleAddUserChange}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    placeholder="Enter city"
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">District</label>
                  <input
                    type="text"
                    name="district"
                    value={addUserForm.district}
                    onChange={handleAddUserChange}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    placeholder="Enter district"
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={addUserForm.pincode}
                    onChange={handleAddUserChange}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    placeholder="Enter Pincode"
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">Country *</label>
                  <select
                    name="country"
                    value={addUserForm.country || ''}
                    onChange={handleAddUserChange}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country, idx) => (
                      <option key={country.country || idx} value={country.country}>{country.country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300">State *</label>
                  <select
                    name="state"
                    value={addUserForm.state || ''}
                    onChange={handleAddUserChange}
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((state, idx) => (
                      <option key={state.id || idx} value={state.id}>{state.state}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2 flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                    onClick={closeAddUserModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-lg relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                onClick={closeViewModal}
                title="Close"
              >
                <FiX size={24} />
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedUser.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">System User Profile</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b dark:border-gray-600 pb-2">User Details</h3>
                  <p><strong className="text-gray-600 dark:text-gray-300">Contact:</strong> <span className="text-gray-800 dark:text-gray-100">{selectedUser.contact}</span></p>
                  <p><strong className="text-gray-600 dark:text-gray-300">Email:</strong> <span className="text-gray-800 dark:text-gray-100">{selectedUser.email}</span></p>
                  <p><strong className="text-gray-600 dark:text-gray-300">Role:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(selectedUser.role)} dark:bg-indigo-900 dark:text-gray-100 dark:border-indigo-800`}>
                      {selectedUser.role}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b dark:border-gray-600 pb-2">Location</h3>
                  <p><strong className="text-gray-600 dark:text-gray-300">Address:</strong> <span className="text-gray-800 dark:text-gray-100">{selectedUser.address}</span></p>
                  <p><strong className="text-gray-600 dark:text-gray-300">City:</strong> <span className="text-gray-800 dark:text-gray-100">{selectedUser.city}</span></p>
                  <p><strong className="text-gray-600 dark:text-gray-300">District:</strong> <span className="text-gray-800 dark:text-gray-100">{selectedUser.district}</span></p>
                  <p><strong className="text-gray-600 dark:text-gray-300">State:</strong> <span className="text-gray-800 dark:text-gray-100">{selectedUser.state}</span></p>
                  <p><strong className="text-gray-600 dark:text-gray-300">Country:</strong> <span className="text-gray-800 dark:text-gray-100">{selectedUser.country}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 