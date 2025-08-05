import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiEdit2, FiPlus, FiFileText, FiFile, FiX, FiTrash2, FiRefreshCw, FiUser, FiShield, FiCheckCircle, FiAlertCircle, FiCopy, FiDownload, FiChevronDown, FiChevronUp } from "react-icons/fi";
import api from "../api/axiosConfig";
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAuthHeaders } from "../utils/apiHeaders";

export default function UserRoles() {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRoleIdx, setSelectedRoleIdx] = useState(null);
  const [editForm, setEditForm] = useState({ role: "" });
  const [addForm, setAddForm] = useState({ role: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortField, setSortField] = useState("role");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showExportDropdown, setShowExportDropdown] = useState(false);

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
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || '1';
      if (!token) {
        throw new Error('Please log in to view user roles');
      }
      const response = await api.post('/userRole', {}, {
        headers: getAuthHeaders()
      });
      let rolesData = [];
      if (Array.isArray(response.data)) {
        rolesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        rolesData = response.data.data;
      } else if (response.data?.roles && Array.isArray(response.data.roles)) {
        rolesData = response.data.roles;
      } else {
        rolesData = [];
      }
      const transformedRoles = rolesData.map((role, index) => ({
        id: role.id || role.role_id || index,
        role: role.name || role.role_name || role.role || `Role ${index + 1}`
      }));
      setRoles(transformedRoles);
    } catch (err) {
      console.error('Fetch roles error:', err);
      const errorMessage = err.message || 'Failed to fetch user roles';
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

  // Add new role
  const addRole = async (roleData) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || '1';
      if (!token) {
        throw new Error('Please log in to add user roles');
      }
      const payload = {
        name: roleData.role
      };
      const response = await api.post('/userRole/add_role', payload, {
        headers: getAuthHeaders()
      });
      if (response.data?.status === 'success' || response.data?.message?.toLowerCase().includes('success')) {
        await fetchRoles();
        toast.success("Role added successfully!");
        setTimeout(() => toast.dismiss(), 3000);
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Failed to add role');
      }
    } catch (err) {
      console.error('Add role error:', err);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Update existing role
  const updateRole = async (roleId, roleData) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || '1';
      
      if (!token) {
        throw new Error('Please log in to update user roles');
      }

      const payload = {
        role_id: roleId,
        name: roleData.role
      };

      const response = await api.post('/userRole/update_role', payload, {
        headers: getAuthHeaders()
      });

      if (response.data?.success || response.data?.status === 'success') {
        toast.success('Role updated successfully!');
        fetchRoles();
        setEditMode(false);
        setEditData({});
      } else {
        toast.error('Failed to update role');
      }
    } catch (err) {
      console.error('Update role error:', err);
      toast.error('Failed to update role');
    }
  };

  // Delete role
  const deleteRole = async (roleId) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || '1';
      
      if (!token) {
        throw new Error('Please log in to delete user roles');
      }

      const payload = {
        role_id: roleId
      };

      const response = await api.post('/userRole/delete', payload, {
        headers: getAuthHeaders()
      });

      if (response.data?.status === 'success' || response.data?.message?.includes('success')) {
        // Refresh the roles list
        await fetchRoles();
        toast.success("Role deleted successfully!");
        setTimeout(() => toast.dismiss(), 3000);
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Failed to delete role');
      }
    } catch (err) {
      console.error('Delete role error:', err);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Load roles on component mount
  useEffect(() => {
    fetchRoles();
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
  const sortedData = [...roles].sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";
    
    if (sortDirection === "asc") {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  // Filtered and paginated data
  const filtered = sortedData.filter(r => r.role.toLowerCase().includes(search.toLowerCase()));
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

  // Edit Role Modal
  const openEditModal = (idx) => {
    const role = roles[startIdx + idx];
    setSelectedRoleIdx(idx);
    setEditForm({ role: role.role });
    setShowEditModal(true);
  };
  
  const closeEditModal = () => setShowEditModal(false);
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const role = roles[startIdx + selectedRoleIdx];
      await updateRole(role.id, editForm);
    setShowEditModal(false);
    } catch (err) {
      toast.error(err.message);
      setShowEditModal(false);
    }
  };

  // Add Role Modal
  const openAddModal = () => {
    setAddForm({ role: "" });
    setShowAddModal(true);
  };
  
  const closeAddModal = () => setShowAddModal(false);
  const handleAddChange = (e) => setAddForm({ ...addForm, [e.target.name]: e.target.value });
  
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await addRole(addForm);
    setShowAddModal(false);
    } catch (err) {
      toast.error(err.message);
      setShowAddModal(false);
    }
  };

  // Delete role handler
  const handleDeleteRole = async (idx) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        const role = roles[startIdx + idx];
        await deleteRole(role.id);
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  // Export handlers
  const handleExportCopy = () => {
    const tableData = filtered.map(role => role.role).join('\n');
    const headers = "Role";
    const fullData = headers + '\n' + tableData;
    
    navigator.clipboard.writeText(fullData).then(() => {
      toast.success("Data copied to clipboard!");
      setTimeout(() => toast.dismiss(), 3000);
    });
  };

  const handleExportCSV = () => {
    const headers = ["Role"];
    const csvData = filtered.map(role => [role.role]);
    
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...csvData].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_roles.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV exported successfully!");
    setTimeout(() => toast.dismiss(), 3000);
  };

  const handleExportExcel = () => {
    toast.info("Excel export functionality would be implemented here!");
    setTimeout(() => toast.dismiss(), 3000);
  };

  const handleExportPDF = () => {
    if (!roles.length) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    const headers = [[
      "Role ID", "Role Name"
    ]];
    const rows = roles.map(role => [
      role.id,
      role.role
    ]);
    try {
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      doc.save("user_roles.pdf");
      toast.success("User roles exported to PDF!");
    } catch (err) {
      console.error("autoTable failed:", err);
      toast.error("PDF export failed: " + err.message);
    }
  };

  if (loading && roles.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700">Loading user roles...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-orange-600">User Roles</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiUser className="text-indigo-600" />
            <span>Total Roles: {roles.length}</span>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 max-w-7xl w-full mx-auto">
          {/* Filter and Export Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1">
                <FiFileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by role name..."
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
              
              {/* Add Role Button - Right Side */}
              <button
                className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex-shrink-0"
                onClick={openAddModal}
                disabled={submitting}
                title="Add Role"
              >
                <FiPlus /> Add
              </button>
            </div>
          </div>

          {/* User Roles Table - Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-gray-700 dark:text-gray-200 sticky top-0 z-10 shadow-sm">
                <tr className="border-b-2 border-indigo-200">
                  <th 
                    className="p-3 text-center font-semibold cursor-pointer hover:bg-indigo-200 transition-colors border-r border-indigo-200 whitespace-nowrap"
                    onClick={() => handleSort("id")}
                    style={{ minWidth: '80px', width: '80px' }}
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
                    className="p-3 text-left font-semibold cursor-pointer hover:bg-indigo-200 transition-colors border-r border-indigo-200 whitespace-nowrap"
                    onClick={() => handleSort("role")}
                    style={{ minWidth: '300px', width: '300px' }}
                  >
                    <div className="flex items-center gap-1">
                      Role Name
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "role" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "role" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-center font-semibold whitespace-nowrap"
                    style={{ minWidth: '120px', width: '120px' }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Actions
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">▲</span>
                        <span className="text-xs text-gray-400">▼</span>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((role, idx) => (
                  <tr 
                    key={role.id || idx} 
                    className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${
                      idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'
                    } hover:bg-indigo-50 dark:hover:bg-gray-700 hover:shadow-sm`}
                  >
                    <td className="p-3 text-center font-semibold text-indigo-700 border-r border-gray-200 dark:border-gray-700">
                      {startIdx + idx + 1}
                    </td>
                    <td className="p-3 font-medium text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {role.role.charAt(0).toUpperCase()}
                        </div>
                        <span>{role.role}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                      <button
                          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-700 hover:border-indigo-300"
                        onClick={() => openEditModal(idx)}
                        title="Edit Role"
                          disabled={submitting}
                      >
                          <FiEdit2 size={16} />
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
            {paginated.map((role, idx) => (
              <div key={role.id || idx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-white">
                        {role.role.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{role.role}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Role #{startIdx + idx + 1}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors p-1"
                      onClick={() => openEditModal(idx)}
                      title="Edit Role"
                      disabled={submitting}
                    >
                      <FiEdit2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {paginated.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <FiUser className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-lg font-medium">
                {search ? 'No roles found matching your search.' : 'No user roles found.'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {search ? 'Try adjusting your search terms.' : 'Add your first role to get started.'}
              </p>
            </div>
          )}

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

        {/* Enhanced Edit Role Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                onClick={closeEditModal}
                title="Close"
                disabled={submitting}
              >
                <FiX size={24} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  <FiEdit2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Update Role</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Modify role information</p>
                </div>
              </div>
              <form className="flex flex-col gap-6" onSubmit={handleEditSubmit}>
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-gray-700 dark:text-gray-200">Role Name</label>
                  <input
                    type="text"
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                    className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    placeholder="Enter role name"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={closeEditModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Updating...' : 'Update Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Add Role Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                onClick={closeAddModal}
                title="Close"
                disabled={submitting}
              >
                <FiX size={24} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                  <FiPlus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add New Role</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Create a new user role</p>
                </div>
              </div>
              <form className="flex flex-col gap-6" onSubmit={handleAddSubmit}>
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-gray-700 dark:text-gray-200">Role Name</label>
                  <input
                    type="text"
                    name="role"
                    value={addForm.role}
                    onChange={handleAddChange}
                    className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors"
                    placeholder="Enter role name"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={closeAddModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Adding...' : 'Create Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 