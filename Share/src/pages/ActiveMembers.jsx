import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiEdit2, FiPlus, FiKey, FiX, FiFileText, FiFile, FiEye, FiRefreshCw, FiTrash2, FiUser, FiUserX, FiMail, FiPhone, FiMapPin, FiShield, FiCheckCircle, FiAlertCircle, FiCopy, FiDownload, FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiSearch, FiUsers, FiHome, FiCalendar } from "react-icons/fi";
import api from "../api/axiosConfig";
import { toast } from 'react-toastify';
import { getAuthHeaders } from "../utils/apiHeaders";

import * as XLSX from 'xlsx';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Cache for additional fields to avoid repeated API calls
let additionalFieldsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch additional fields function
const fetchAdditionalFields = async () => {
  // Return cached data if still valid
  if (additionalFieldsCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return additionalFieldsCache;
  }

  try {
    const token = localStorage.getItem('token');
    const uid = localStorage.getItem('uid');
    
    if (!token || !uid) {
      throw new Error('Authentication required');
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
  const baseHeaders = [
    { key: 'sr', name: 'SR No', sortable: true, width: '60px' },
    { key: 'name', name: 'Name', sortable: true, width: '120px' },
    { key: 'contact', name: 'Contact', sortable: true, width: '120px' },
    { key: 'email', name: 'Email', sortable: true, width: '180px' },
  ];

  const endHeaders = [
    { key: 'company', name: 'Company Name', sortable: true, width: '150px' },
    { key: 'validUpto', name: 'Valid Upto', sortable: true, width: '120px' },
    { key: 'actions', name: 'Actions', sortable: false, width: '150px' }
  ];

  return [...baseHeaders, ...endHeaders];
};

// Get mobile card fields for member pages
const getMemberCardFields = (additionalFields = []) => {
  return additionalFields.map(field => ({
    key: field.key,
    name: field.name,
    backendKey: field.backendKey
  }));
};

export default function ActiveMembers() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
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

  // Fetch additional fields and set up headers
  useEffect(() => {
    const loadAdditionalFields = async () => {
      try {
        const fields = await fetchAdditionalFields();
        setAdditionalFields(fields);
        setTableHeaders(getMemberTableHeaders(fields));
        setCardFields(getMemberCardFields(fields));
      } catch (err) {
        console.error('Failed to load additional fields:', err);
        setTableHeaders(getMemberTableHeaders([]));
        setCardFields(getMemberCardFields([]));
      }
    };
    loadAdditionalFields();
  }, []);

  // Fetch active members from API
  const fetchActiveMembers = async () => {
    setLoading(true);
      try {
        const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
        if (!token) {
        toast.error('Please log in to view active members');
        window.location.href = '/login';
          return;
        }

      const response = await api.post('/userDetail/active_members', {}, {
          headers: {
            'token': token,
            'uid': uid,
          }
        });

        console.log('Active Members Response:', response.data);
      
      // Handle different response formats
      let membersData = [];
      if (Array.isArray(response.data)) {
        membersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        membersData = response.data.data;
      } else if (response.data?.members && Array.isArray(response.data.members)) {
        membersData = response.data.members;
      }
      
      setMembers(membersData);
    } catch (err) {
      console.error('Fetch active members error:', err);
      toast.error('Failed to fetch active members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Disable member function
  const handleDisableMember = async (member) => {
    if (!window.confirm(`Are you sure you want to disable ${member.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      if (!token || !uid) {
        toast.error('Please log in to perform this action');
        return;
      }

      // Call API to disable member
      const response = await api.post('/userDetail/disable_member', {
        company_detail_id: member.company_detail_id || member.id
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        toast.success(`${member.name} has been disabled successfully`);
        // Refresh the members list
        fetchActiveMembers();
      } else {
        toast.error(response.data.message || 'Failed to disable member');
      }
    } catch (error) {
      console.error('Disable member error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to disable member');
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

  // Filter by search
  const filtered = sortedData.filter(member => 
    member.name?.toLowerCase().includes(search.toLowerCase()) ||
    member.email?.toLowerCase().includes(search.toLowerCase()) ||
    member.contact?.toLowerCase().includes(search.toLowerCase()) ||
    member.company?.toLowerCase().includes(search.toLowerCase())
  );

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

  // Export handlers
  const handleExportCopy = () => {
    if (!members.length) {
      toast.error("No data to export!");
      return;
    }
    console.log("Copying data:", members);
    const data = members.map(member => 
      `${member.name}, ${member.phone_num || member.contact}, ${member.email}, ${member.company_name || member.company}, ${member.ad5 || member.valid_upto}`
    ).join('\n');
    navigator.clipboard.writeText(data);
    toast.success("All members copied to clipboard!");
  };

  const handleExportExcel = () => {
    if (!members.length) {
      toast.error("No data to export!");
      return;
    }
    console.log("Exporting Excel with data:", members);
    try {
      const exportData = members.map(member => ({
        Name: member.name || '',
        Contact: member.phone_num || member.contact || '',
        Email: member.email || '',
        Company: member.company_name || member.company || '',
        'Valid Upto': member.ad5 || member.valid_upto || '',
        Status: 'Active'
      }));
      console.log("Processed export data:", exportData);
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Active Members");
      XLSX.writeFile(wb, "active_members.xlsx");
      toast.success("Members exported to Excel!");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Excel export failed: " + error.message);
    }
  };

  const handleExportCSV = () => {
    if (!members.length) {
      toast.error("No data to export!");
      return;
    }
    console.log("Exporting CSV with data:", members);
    const headers = [
      "Name", "Contact", "Email", "Company", "Valid Upto", "Status"
    ];
    const rows = members.map(member => [
      member.name,
      member.phone_num || member.contact,
      member.email,
      member.company_name || member.company,
      member.ad5 || member.valid_upto,
      'Active'
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "active_members.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Fallback for older browsers
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "active_members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    }
    toast.success("Members exported to CSV!");
  };

  const handleExportPDF = () => {
    if (!members.length) {
      toast.error("No data to export!");
      return;
    }
    console.log("Exporting PDF with data:", members);
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    const headers = [[
      "Name", "Contact", "Email", "Company", "Valid Upto", "Status"
    ]];
    const rows = members.map(member => [
      member.name,
      member.phone_num || member.contact,
      member.email,
      member.company_name || member.company,
      member.ad5 || member.valid_upto,
      'Active'
    ]);
    try {
      console.log("PDF headers:", headers);
      console.log("PDF rows:", rows);
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      doc.save("active_members.pdf");
      toast.success("Members exported to PDF!");
    } catch (err) {
      console.error("autoTable failed:", err);
      toast.error("PDF export failed: " + err.message);
    }
  };

  const handleRefresh = () => {
    fetchActiveMembers();
    toast.info("Refreshing members...");
  };

  // Test download functionality
  const testDownload = () => {
    const testData = "Name,Contact,Email\nJohn Doe,1234567890,john@example.com\nJane Smith,0987654321,jane@example.com";
    const blob = new Blob([testData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "test.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.info("Test download initiated");
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchActiveMembers();
  }, []);

  if (loading && members.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700 dark:text-indigo-300">Loading active members...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Active Members</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiUsers className="text-indigo-600" />
            <span>Total Active Members: {members.length}</span>
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
                  placeholder="Search by name, email, contact, or company..."
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
                  onClick={handleExportCopy}
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
                      className={`p-3 font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap text-center ${
                        header.sortable ? '' : 'cursor-default'
                      }`}
                      onClick={() => header.sortable && handleSort(header.key)}
                      style={{ minWidth: header.width, width: header.width }}
                  >
                    <div className="flex items-center justify-center gap-1">
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
                {paginated.map((member, idx) => (
                  <tr 
                    key={member.id} 
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
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{member.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{member.phone_num || member.contact}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{member.email}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{member.company_name || member.company}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{member.ad5 || member.valid_upto}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors"
                          title="View Member"
                          onClick={() => navigate(`/member/${member.id || member.company_detail_id}`)}
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          className="text-red-600 dark:text-red-400 hover:text-red-900 p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-700 transition-colors"
                          title="Disable Member"
                          onClick={() => handleDisableMember(member)}
                        >
                          <FiUserX size={16} />
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
            {paginated.map((member, idx) => (
              <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{member.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Member #{startIdx + idx + 1}</p>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors p-1"
                      onClick={() => navigate(`/member/${member.id || member.company_detail_id}`)}
                      title="View Member"
                    >
                      <FiEye size={16} />
                    </button>
                    <button
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors p-1"
                      onClick={() => handleDisableMember(member)}
                      title="Disable Member"
                    >
                      <FiUserX size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{member.phone_num || member.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiHome className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{member.company_name || member.company}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-gray-700 dark:text-gray-300 text-xs">
                      <span className="font-medium">Valid Until:</span> {member.ad5 || member.valid_upto}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls - moved below content */}
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
        </div>
      </DashboardLayout>
    );
  } 