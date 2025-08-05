import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiSearch, FiRefreshCw, FiDownload, FiEye, FiEdit2, FiFilter, FiCopy, FiFile, FiChevronDown, FiChevronLeft, FiChevronRight, FiUsers, FiArrowUp, FiArrowDown, FiPhone, FiMail, FiHome } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import { getAuthHeaders } from "../utils/apiHeaders";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Cache for additional fields to avoid repeated API calls
let additionalFieldsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch additional fields from backend
const fetchAdditionalFields = async () => {
  try {
    const token = localStorage.getItem('token');
    const uid = localStorage.getItem('uid');

    if (!token || !uid) {
      console.error('No token or uid found');
      return [];
    }

    const response = await api.post('/groupSettings/get_user_additional_fields', {}, {
      headers: getAuthHeaders()
    });

    console.log('Additional Fields Response:', response.data);
    
    // Map backend data to frontend format
    const backendData = response.data?.data || response.data || {};
    
    let mappedFields = [];
    
    if (Array.isArray(backendData)) {
      // Handle array response
      mappedFields = backendData
        .filter(field => field && (field.name || field.label || field.value || field))
        .map((field, index) => ({
          id: index + 1,
          name: field.name || field.label || field.value || field || `Field ${index + 1}`,
          key: `additionalField${index + 1}`,
          backendKey: `ad${index + 1}` || `field${index + 1}`
        }));
    } else {
      // Handle object response
      mappedFields = Object.keys(backendData)
        .filter(key => backendData[key] && backendData[key].trim() !== '')
        .map((key, index) => ({
          id: index + 1,
          name: backendData[key],
          key: key,
          backendKey: key
        }));
    }

    // Cache the result
    additionalFieldsCache = mappedFields;
    cacheTimestamp = Date.now();
    
    return mappedFields;
  } catch (err) {
    console.error('Fetch additional fields error:', err);
    // Return empty array on error
    return [];
  }
};

// Get table headers for member pages
const getMemberTableHeaders = (additionalFields = []) => {
  return [
    { key: 'sr', name: 'SR No', sortable: true, width: '60px' },
    { key: 'name', name: 'Name', sortable: true, width: '120px' },
    { key: 'contact', name: 'Contact', sortable: true, width: '120px' },
    { key: 'email', name: 'Email', sortable: true, width: '180px' },
    { key: 'company', name: 'Company Name', sortable: true, width: '150px' },
    { key: 'actions', name: 'Actions', sortable: false, width: '120px' }
  ];
};

// Get mobile card fields for member pages
const getMemberCardFields = (additionalFields = []) => {
  return additionalFields.map(field => ({
    key: field.key,
    name: field.name,
    backendKey: field.backendKey
  }));
};

export default function PendingApproval() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [modifyMember, setModifyMember] = useState(null);
  const [form, setForm] = useState({ plan: "", validUpto: "" });
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [additionalFields, setAdditionalFields] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [cardFields, setCardFields] = useState([]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportDropdown]);

  // Load additional fields for dynamic headers
  const loadAdditionalFields = async () => {
    try {
      setTableHeaders(getMemberTableHeaders());
    } catch (error) {
      console.error('Failed to load table headers:', error);
    }
  };

  // Fetch plans for dropdown with real-time functionality
  function useMembershipPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    
      const fetchPlans = async () => {
        try {
        setLoading(true);
          const token = localStorage.getItem('token');
          const uid = localStorage.getItem('uid');
        
        if (!token || !uid) {
          console.error('Authentication required for fetching plans');
          return;
        }
        
          const response = await api.get('/groupSettings/get_membership_plans', {
            headers: getAuthHeaders()
          });
        
        console.log('Membership Plans Response:', response.data);
        
          const plansData = Array.isArray(response.data?.data) ? response.data.data : [];
          setPlans(plansData);
        console.log('Plans loaded:', plansData);
      } catch (error) {
        console.error('Failed to fetch membership plans:', error);
        toast.error('Failed to load membership plans');
      } finally {
        setLoading(false);
      }
    };
    
    useEffect(() => {
      fetchPlans();
    }, []);
    
    return { plans, loading, refetch: fetchPlans };
  }

  const { plans, loading: plansLoading, refetch: refetchPlans } = useMembershipPlans();

  // Load additional fields on component mount
  useEffect(() => {
    loadAdditionalFields();
  }, []);

  useEffect(() => {
    const fetchPendingApprovalMembers = async (isFirst = false) => {
      if (isFirst) setLoading(true);
      // No need to clear error/success with toast
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        if (!token) {
          toast.error('Please log in to view pending approval members');
          window.location.href = '/';
          return;
        }
        const response = await api.post('/userDetail/not_members', { uid }, {
          headers: {
            'token': token,
            'uid': uid,
          }
        });
        const membersData = Array.isArray(response.data) ? response.data : response.data.data || [];
        console.log('Pending Approval Members Data:', membersData);
        if (membersData.length > 0) {
          console.log('Sample member fields:', Object.keys(membersData[0]));
        }
        setMembers(membersData);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to fetch pending approval members');
      } finally {
        if (isFirst) setLoading(false);
        if (isFirst) setFirstLoad(false);
      }
    };
    fetchPendingApprovalMembers(true); // Initial load
    // Removed setInterval for auto-refresh
    // Only call fetchPendingApprovalMembers after CRUD operations
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
  const sortedData = [...members].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (sortDirection === 'asc') {
      return aValue.toString().localeCompare(bValue.toString());
    } else {
      return bValue.toString().localeCompare(aValue.toString());
    }
  });

  // Filter by name
  const filtered = sortedData.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
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

  const openModify = (member) => {
    setModifyMember(member);
    setForm({
      plan: "",
      validUpto: ""
    });
  };

  const closeModify = () => {
    setModifyMember(null);
    setForm({ plan: "", validUpto: "" });
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    setForm({ ...form, validUpto: e.target.value });
  };

  const activateMembership = async ({ company_detail_id, membership_plan_id, valid_upto }) => {
    const token = localStorage.getItem('token');
    const uid = localStorage.getItem('uid');
    if (!token || !uid) {
      throw new Error('Authentication required');
    }
    const payload = {
      company_detail_id: String(company_detail_id),
      membership_plan_id: String(membership_plan_id),
      valid_upto: valid_upto,
    };
    const response = await api.post('/UserDetail/activate_membership', payload, {
      headers: getAuthHeaders(),
      timeout: 15000,
    });
    return response.data;
  };

  const handleUpdate = async () => {
    if (!modifyMember) return;
    // Validation
    if (!form.plan) {
      setUpdateError('Please select a membership plan.');
      closeModify();
      return;
    }
    if (!form.validUpto) {
      setUpdateError('Please select a valid until date.');
      closeModify();
      return;
    }
    // Check if date is in future
    const selectedDate = new Date(form.validUpto);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate <= today) {
      setUpdateError('Please select a future date for membership validity.');
      closeModify();
      return;
    }
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    try {
      await activateMembership({
        company_detail_id: modifyMember.company_detail_id || modifyMember.id,
        membership_plan_id: form.plan, // Use the selected plan's ID
        valid_upto: form.validUpto,
      });
      toast.success('Membership activated successfully!');
      setMembers(prevMembers => prevMembers.filter(member => member.id !== modifyMember.id));
    closeModify();
    } catch (err) {
      if (err.response) {
        const errorMessage = err.response.data?.message || err.response.data?.error || 'Failed to activate membership';
        setUpdateError(errorMessage);
        toast.error(errorMessage);
      } else if (err.request) {
        setUpdateError('Network error. Please check your connection.');
        toast.error('Network error. Please check your connection.');
      } else {
        setUpdateError('Failed to activate membership. Please try again.');
        toast.error('Failed to activate membership.');
      }
      closeModify();
    } finally {
      setUpdateLoading(false);
    }
  };

  // Export Handlers
  const handleExportCSV = () => {
    if (!members.length) return;
    const headers = ['SR No', 'Name', 'Contact', 'Email', 'Company Name'];
    const rows = members.map((m, index) => [
      index + 1,
      m.name,
      m.phone_num || m.contact,
      m.email,
      m.company_name || m.company
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
            link.setAttribute("download", "pending_approval_members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Members exported to CSV!");
  };

  const handleExportExcel = () => {
    if (!members.length) return;
    const exportData = members.map((m, index) => ({
      'SR No': index + 1,
      'Name': m.name,
      'Contact': m.phone_num || m.contact,
      'Email': m.email,
      'Company Name': m.company_name || m.company
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Pending Approval Members");
      XLSX.writeFile(wb, "pending_approval_members.xlsx");
    toast.success("Members exported to Excel!");
  };

  const handleExportPDF = () => {
    if (!members.length) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    const headers = [['SR No', 'Name', 'Contact', 'Email', 'Company Name']];
    const rows = members.map((m, index) => [
      index + 1,
      m.name,
      m.phone_num || m.contact,
      m.email,
      m.company_name || m.company
    ]);
    try {
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      doc.save("pending_approval_members.pdf");
      toast.success("Members exported to PDF!");
    } catch (err) {
      console.error("autoTable failed:", err);
      toast.error("PDF export failed: " + err.message);
    }
  };

  const handleCopyToClipboard = () => {
    if (!members.length) return;
    const data = members.map((m, index) => 
      `${index + 1}. ${m.name}, ${m.phone_num || m.contact}, ${m.email}, ${m.company_name || m.company}`
    ).join('\n');
    navigator.clipboard.writeText(data);
    toast.success("All members copied to clipboard!");
  };

  const handleRefresh = () => {
    window.location.reload();
    toast.info("Refreshing members...");
  };

  if (loading && firstLoad) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700 dark:text-indigo-300">Loading pending approval members...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (updateError) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2 text-red-500">
            <FiAlertCircle />
            <p className="dark:text-red-300">{updateError}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Pending Approval</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiUsers className="text-indigo-600" />
            <span>Total Pending Approval: {members.length}</span>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 max-w-7xl w-full mx-auto">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
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
            
            <div className="flex flex-wrap gap-2 items-center justify-between xl:justify-start">
              <button 
                className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                onClick={handleRefresh}
                title="Refresh Data"
              >
                <FiRefreshCw /> 
                <span>Refresh</span>
              </button>
              
              {/* Desktop Export Buttons - Show on larger screens */}
              <div className="hidden xl:flex gap-2">
              <button 
                className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
                onClick={handleCopyToClipboard}
                title="Copy to Clipboard"
              >
                  <FiCopy /> 
                  Copy
              </button>
                
              <button 
                className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                onClick={handleExportCSV}
                title="Export CSV"
              >
                  <FiDownload /> 
                  CSV
              </button>
                
              <button 
                className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition"
                onClick={handleExportExcel}
                title="Export Excel"
              >
                  <FiFile /> 
                  Excel
              </button>
                
              <button 
                className="flex items-center gap-1 bg-rose-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-rose-600 transition"
                onClick={handleExportPDF}
                title="Export PDF"
              >
                  <FiFile /> 
                  PDF
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
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 min-w-32 export-dropdown">
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                      onClick={() => {
                        handleCopyToClipboard();
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
                      <FiFile className="text-rose-500" />
                      PDF
                    </button>
                    </div>
                      )}
                    </div>
                    </div>
                    </div>
          
          {/* Table - Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-gray-700 dark:text-gray-200 sticky top-0 z-10 shadow-sm">
                <tr className="border-b-2 border-indigo-200 dark:border-indigo-800">
                  {tableHeaders.map((header, index) => (
                    <th 
                      key={header.key}
                      className={`p-3 font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap ${
                        header.sortable ? '' : 'cursor-default'
                      }`}
                      onClick={() => header.sortable && handleSort(header.key)}
                      style={{ minWidth: header.width, width: header.width }}
                  >
                    <div className="flex items-center gap-1">
                        {header.name}
                        {header.sortable && (
                          <div className="flex flex-col">
                            <span className={`text-xs ${sortField === header.key && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                            <span className={`text-xs ${sortField === header.key && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                    </div>
                      )}
                    </div>
                  </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((m, idx) => (
                  <tr 
                    key={m.id} 
                    className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${
                      idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'
                    } hover:bg-indigo-50 dark:hover:bg-gray-700 hover:shadow-sm`}
                  >
                    <td className="p-3 text-center font-semibold text-indigo-700 dark:text-indigo-300 border-r border-gray-200 dark:border-gray-700">
                      {startIdx + idx + 1}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{m.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{m.phone_num || m.contact}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{m.email}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{m.company_name || m.company}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors"
                          title="View Member"
                          onClick={() => navigate(`/member/${m.id || m.user_detail_id || m.company_detail_id}`)}
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors"
                          title="Activate Membership"
                          onClick={() => openModify(m)}
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
            {paginated.map((m, idx) => (
              <div key={m.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-white">
                        {m.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{m.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Member #{startIdx + idx + 1}</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{m.company_name || m.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors p-1"
                      onClick={() => navigate(`/member/${m.id || m.user_detail_id || m.company_detail_id}`)}
                      title="View Member"
                    >
                      <FiEye size={16} />
                    </button>
                    <button
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors p-1"
                      onClick={() => openModify(m)}
                      title="Activate Membership"
                    >
                      <FiEdit2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{m.phone_num || m.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{m.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls - moved outside scrollable area */}
          <div className="flex flex-row items-center justify-between gap-4 p-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
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
                className={`p-2 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Previous"
                >
                  <FiChevronLeft size={16} />
                </button>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                className={`p-2 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Next"
                >
                  <FiChevronRight size={16} />
                </button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Modify Membership Modal */}
        {modifyMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl p-8 w-full max-w-lg relative">
              <button
                className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-rose-500 transition-colors"
                onClick={closeModify}
                title="Close"
              >
                <FiX size={24} />
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {modifyMember.name ? modifyMember.name.charAt(0).toUpperCase() : 'N'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Activate Membership</h2>
                  <p className="text-gray-600 dark:text-gray-400">Activate membership for {modifyMember.name || 'Unknown Member'}</p>
                </div>
              </div>
              <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-700 font-semibold">
                      Membership Plan <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={refetchPlans}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
                      title="Refresh plans"
                    >
                      <FiRefreshCw size={12} />
                      Refresh
                    </button>
                  </div>
                  <select
                    name="plan"
                    value={form.plan}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-400 transition-colors"
                    required
                    disabled={plansLoading}
                  >
                    <option value="">
                      {plansLoading ? 'Loading plans...' : 'Select Plan'}
                    </option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.plan_name || plan.name}
                      </option>
                    ))}
                  </select>
                  {plansLoading && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Loading membership plans...
                    </p>
                  )}
                  {!plansLoading && plans.length === 0 && (
                    <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                      No membership plans available
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Valid Until <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="validUpto"
                      value={form.validUpto}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-400 transition-colors"
                      required
                    />
                  </div>
                </div>
                {updateError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiAlertCircle />
                      <span>{updateError}</span>
                    </div>
                  </div>
                )}
                {updateSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiUsers />
                      <span>{updateSuccess}</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                    onClick={closeModify}
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    onClick={handleUpdate}
                    disabled={updateLoading || !form.plan || !form.validUpto}
                  >
                    {updateLoading && <FiRefreshCw className="animate-spin" size={16} />}
                    {updateLoading ? 'Activating...' : 'Activate Membership'}
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