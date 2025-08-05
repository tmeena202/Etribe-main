import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiPlus, FiX, FiEdit2, FiTrash2, FiRefreshCw, FiSave, FiAlertCircle, FiCheckCircle, FiDollarSign, FiCalendar, FiPackage, FiSearch, FiFilter } from "react-icons/fi";
import { BiRupee } from "react-icons/bi";
import api from "../api/axiosConfig";
import { toast } from 'react-toastify';
import { getAuthHeaders } from "../utils/apiHeaders";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MembershipPlans() {
  const [plans, setPlans] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    validity: "",
    status: "active"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Fetch membership plans from API
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      if (!token || !uid) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await api.get('/groupSettings/get_membership_plans', {
        headers: getAuthHeaders()
      });

      console.log('Membership Plans Response:', response.data);
      
      // Map backend fields to frontend fields
      const plansData = Array.isArray(response.data?.data) ? response.data.data : [];
      const mappedPlans = plansData.map(plan => ({
        id: plan.id || plan.plan_id || Math.random().toString(36).substr(2, 9),
        name: plan.plan_name || plan.name || "",
        description: plan.plan_description || plan.description || "",
        price: plan.plan_price || plan.price || "",
        validity: plan.plan_validity || plan.validity || "",
        status: plan.status || "active",
        created_at: plan.created_at || new Date().toISOString(),
        updated_at: plan.updated_at || new Date().toISOString(),
      }));

      setPlans(mappedPlans);
    } catch (err) {
      console.error('Fetch membership plans error:', err);
      const errorMessage = err.message || 'Failed to fetch membership plans';
      
      if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('log in')) {
        localStorage.removeItem('token');
        localStorage.removeItem('uid');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate membership plan
  const validatePlan = (planData) => {
    const errors = [];

    if (!planData.name || planData.name.trim() === '') {
      errors.push('Plan name is required');
    } else if (planData.name.trim().length < 3) {
      errors.push('Plan name must be at least 3 characters long');
    }

    if (!planData.description || planData.description.trim() === '') {
      errors.push('Plan description is required');
    } else if (planData.description.trim().length < 10) {
      errors.push('Plan description must be at least 10 characters long');
    }

    if (!planData.price || planData.price <= 0) {
      errors.push('Plan price must be greater than 0');
    }

    if (!planData.validity || planData.validity <= 0) {
      errors.push('Plan validity must be greater than 0 months');
    }

    // Check for duplicate plan names
    const existingPlan = plans.find(plan => 
      plan.name.toLowerCase() === planData.name.toLowerCase() && 
      (!editMode || plan.id !== editingPlan?.id)
    );
    if (existingPlan) {
      errors.push('A plan with this name already exists');
    }

    return errors;
  };

  // Save membership plan to API
  const savePlan = async (planData) => {
    setSubmitting(true);
    try {
      // Validate plan before saving
      const validationErrors = validatePlan(planData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      if (!token || !uid) {
        throw new Error('Authentication required. Please log in.');
      }

      let response;
      if (editMode && editingPlan) {
        // Update existing plan using the same cURL structure as membership update
        const payload = {
          id: editingPlan.id,
          plan_name: planData.name,
          plan_description: planData.description,
          plan_price: planData.price,
          plan_validity: planData.validity,
          type: 'edit',
        };
        response = await api.post('/groupSettings/update_mem_plan', payload, {
          headers: getAuthHeaders()
        });
      } else {
        // Create new plan (unchanged)
        const payload = {
          plan_name: planData.name,
          plan_description: planData.description,
          plan_price: parseFloat(planData.price),
          plan_validity: parseInt(planData.validity),
          status: planData.status,
        };
        response = await api.post('/groupSettings/create_membership_plan', payload, {
          headers: getAuthHeaders()
        });
      }

      if (response.data?.status === 'success') {
        // Refresh plans after successful save
        await fetchPlans();
        toast.success('Membership plan saved successfully!');
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Failed to save membership plan');
      }
    } catch (err) {
      console.error('Save membership plan error:', err, err.response?.data);
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to save membership plan'
      );
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete membership plan
  const deletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this membership plan?')) {
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      if (!token || !uid) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await api.delete(`/groupSettings/delete_membership_plan/${planId}`, {
        headers: getAuthHeaders()
      });

      if (response.data?.status === 'success') {
        await fetchPlans();
        toast.success('Membership plan deleted successfully!');
      } else {
        throw new Error(response.data?.message || 'Failed to delete membership plan');
      }
    } catch (err) {
      console.error('Delete membership plan error:', err);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Load membership plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort data
  const sortedData = [...plans].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (sortDirection === 'asc') {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  // Filter and search plans
  const filteredPlans = sortedData.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || plan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalEntries = filteredPlans.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIdx = (currentPage - 1) * entriesPerPage;
  const paginated = filteredPlans.slice(startIdx, startIdx + entriesPerPage);

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handleEntriesChange = e => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setForm({ name: "", description: "", price: "", validity: "", status: "active" });
    setAddMode(true);
    setEditMode(false);
    setEditingPlan(null);
    // No need to clear error with toast
  };

  const handleEdit = (plan) => {
    setForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      validity: plan.validity,
      status: plan.status
    });
    setEditMode(true);
    setAddMode(false);
    setEditingPlan(plan);
    // No need to clear error with toast
  };

  const handleCancel = () => {
    setAddMode(false);
    setEditMode(false);
    setEditingPlan(null);
    // No need to clear error with toast
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Save Plan button clicked', form);
    try {
      // Attach cURL logic directly here for edit
      if (editMode && editingPlan) {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        const payload = {
          id: editingPlan.id,
          plan_name: form.name,
          plan_description: form.description,
          plan_price: form.price,
          plan_validity: form.validity,
          type: 'edit',
        };
        const response = await api.post('/groupSettings/update_mem_plan', payload, {
          headers: getAuthHeaders()
        });
        if (response.data?.status === 'success' || (response.data?.message && response.data.message.toLowerCase().includes('success'))) {
          await fetchPlans();
          toast.success(response.data?.message || 'Membership plan saved successfully!');
        } else {
          toast.error(response.data?.message || 'Failed to save membership plan');
        }
    setAddMode(false);
      setEditMode(false);
      setEditingPlan(null);
        setForm({ name: '', description: '', price: '', validity: '', status: 'active' });
      } else {
        // Add Plan using provided cURL
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        const payload = {
          id: form.id || '', // If you want to auto-generate or leave blank, adjust as needed
          plan_name: form.name,
          plan_description: form.description,
          plan_price: form.price,
          plan_validity: form.validity
        };
        const response = await api.post('/groupSettings/add_mem_plan', payload, {
          headers: getAuthHeaders()
        });
        if (response.data?.status === 'success' || (response.data?.message && response.data.message.toLowerCase().includes('success'))) {
          await fetchPlans();
          toast.success(response.data?.message || 'Membership plan added successfully!');
        } else {
          toast.error(response.data?.message || 'Failed to add membership plan');
        }
        setAddMode(false);
        setEditMode(false);
        setEditingPlan(null);
        setForm({ name: '', description: '', price: '', validity: '', status: 'active' });
      }
    } catch (err) {
      toast.error(err.message);
      setAddMode(false);
      setEditMode(false);
      setEditingPlan(null);
      setForm({ name: '', description: '', price: '', validity: '', status: 'active' });
    }
  };

  const handleRefresh = () => {
    fetchPlans();
  };

  if (loading && plans.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700">Loading membership plans...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Membership Plans</h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <FiPackage className="text-indigo-600" />
            <span>Total Plans: {plans.length}</span>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 max-w-7xl w-full mx-auto">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by plan name..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-xs sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors w-full sm:w-auto"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ minWidth: '200px' }}
                />
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span>Showing {startIdx + 1} to {Math.min(startIdx + entriesPerPage, totalEntries)} of {totalEntries} entries</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center justify-between sm:justify-end">
              <button className="flex items-center gap-1 bg-blue-500 text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600 transition" onClick={handleRefresh} disabled={loading} title="Refresh Plans">
                <FiRefreshCw className={loading ? "animate-spin" : ""} /> 
                <span>Refresh</span>
              </button>
              <button className="flex items-center gap-1 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 transition" onClick={handleAdd}>
                <FiPlus /> 
                <span>Add Plan</span>
              </button>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto hidden lg:block">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-gray-700 dark:text-gray-200 sticky top-0 z-10 shadow-sm">
                <tr className="border-b-2 border-indigo-200 dark:border-indigo-800">
                  <th className="p-3 text-center font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors" style={{ minWidth: '80px', width: '80px' }} onClick={() => handleSort('id')}>
                    <div className="flex items-center justify-center gap-1">
                      Sr No
                      {sortField === 'id' && (
                        <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors" style={{ minWidth: '150px', width: '150px' }} onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      Plan Name
                      {sortField === 'name' && (
                        <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors" style={{ minWidth: '200px', width: '200px' }} onClick={() => handleSort('description')}>
                    <div className="flex items-center gap-1">
                      Description
                      {sortField === 'description' && (
                        <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors" style={{ minWidth: '120px', width: '120px' }} onClick={() => handleSort('price')}>
                    <div className="flex items-center gap-1">
                      Price
                      {sortField === 'price' && (
                        <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors" style={{ minWidth: '120px', width: '120px' }} onClick={() => handleSort('validity')}>
                    <div className="flex items-center gap-1">
                      Validity
                      {sortField === 'validity' && (
                        <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors" style={{ minWidth: '100px', width: '100px' }} onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortField === 'status' && (
                        <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((plan, idx) => (
                  <tr key={plan.id} className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'} hover:bg-indigo-50 dark:hover:bg-gray-700 hover:shadow-sm`}>
                    <td className="p-3 text-center font-semibold text-indigo-700 dark:text-indigo-300 border-r border-gray-200 dark:border-gray-700">{startIdx + idx + 1}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900 rounded-full flex items-center justify-center text-white font-semibold text-xs">{plan.name.charAt(0).toUpperCase()}</div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{plan.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-100">{plan.description}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700">
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-300 font-medium">
                        <BiRupee size={14} />
                        {plan.price}
                      </span>
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700">
                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-300">
                        <FiCalendar size={14} />
                        {plan.validity} months
                      </span>
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${plan.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'}`}>{plan.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paginated.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-300">
                <FiPackage className="mx-auto text-4xl mb-2 text-gray-300 dark:text-gray-700" />
                <p>No membership plans found</p>
              </div>
            )}
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden p-4 sm:p-6">
            {paginated.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-300">
                <FiPackage className="mx-auto text-4xl mb-2 text-gray-300 dark:text-gray-700" />
                <p className="text-sm">No membership plans found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginated.map((plan, idx) => (
                  <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {plan.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{plan.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">#{startIdx + idx + 1}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${plan.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'}`}>
                        {plan.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{plan.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-300 font-medium text-sm">
                        <BiRupee size={12} />
                        <span>{plan.price}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-300 text-sm">
                        <FiCalendar size={12} />
                        <span>{plan.validity} months</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Pagination Controls - moved outside scrollable area */}
            {!addMode && !editMode && totalEntries > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Show</span>
                <select className="border rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 text-gray-700 focus:ring-2 focus:ring-indigo-400 transition-colors" value={entriesPerPage} onChange={handleEntriesChange}>
                    {[10, 25, 50, 100].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">entries per page</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handlePrev} disabled={currentPage === 1} className={`px-2 sm:px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`} title="Previous">&lt;</button>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">Page {currentPage} of {totalPages}</span>
                <button onClick={handleNext} disabled={currentPage === totalPages} className={`px-2 sm:px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`} title="Next">&gt;</button>
              </div>
              </div>
            )}
        </div>

        {/* Add/Edit Modal */}
        {(addMode || editMode) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-lg relative max-h-[95vh] overflow-y-auto">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-rose-500 dark:text-gray-300 dark:hover:text-rose-400"
                  onClick={handleCancel}
                  title="Close"
                >
                  <FiX size={22} />
                </button>
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">
                {editMode ? 'Edit Membership Plan' : 'Add Membership Plan'}
              </h2>
                <form className="grid grid-cols-1 gap-y-4 sm:gap-y-6" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1 text-sm sm:text-base">
                      Plan Name <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-sm"
                      placeholder="Enter plan name"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1 text-sm sm:text-base">
                      Plan Description <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-sm"
                      placeholder="Enter plan description"
                      rows={3}
                      required
                      disabled={submitting}
                    />
                  </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1 text-sm sm:text-base">
                      Plan Price <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-sm"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1 text-sm sm:text-base">
                      Validity (Months) <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="validity"
                      value={form.validity}
                      onChange={handleChange}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-sm"
                      placeholder="12"
                      min="1"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-gray-700 dark:text-gray-200 text-sm sm:text-base">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-sm"
                    disabled={submitting}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                    <button
                      type="button"
                      className="px-4 sm:px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm"
                      onClick={handleCancel}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
                      disabled={submitting}
                    >
                    {submitting ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        {editMode ? 'Update Plan' : 'Save Plan'}
                      </>
                    )}
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