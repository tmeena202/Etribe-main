import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiEdit2, FiX, FiCalendar, FiFileText, FiFile, FiUsers, FiSearch, FiRefreshCw, FiAlertCircle, FiCopy, FiDownload, FiUserX } from "react-icons/fi";
import api from "../api/axiosConfig";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from 'react-toastify';

export default function InactiveMembers() {
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

  // Add the useMembershipPlans hook (from MembershipExpired.jsx):
  function useMembershipPlans() {
    const [plans, setPlans] = React.useState([]);
    React.useEffect(() => {
      const fetchPlans = async () => {
        try {
          const token = localStorage.getItem('token');
          const uid = localStorage.getItem('uid');
          const response = await api.get('/groupSettings/get_membership_plans', {
            headers: {
              'Client-Service': 'COHAPPRT',
              'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
              'uid': uid,
              'token': token,
              'rurl': 'login.etribes.in',
            }
          });
          const plansData = Array.isArray(response.data?.data) ? response.data.data : [];
          setPlans(plansData);
        } catch {}
      };
      fetchPlans();
    }, []);
    return plans;
  }

  const plans = useMembershipPlans();

  useEffect(() => {
    const fetchInactiveMembers = async (isFirst = false) => {
      if (isFirst) setLoading(true);
      // No need to clear error/success with toast
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        if (!token) {
          toast.error('Please log in to view inactive members');
          window.location.href = '/';
          return;
        }
        const response = await api.post('/userDetail/not_members', { uid }, {
          headers: {
            'token': token,
            'uid': uid,
          }
        });
        setMembers(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to fetch inactive members');
      } finally {
        if (isFirst) setLoading(false);
        if (isFirst) setFirstLoad(false);
      }
    };
    fetchInactiveMembers(true); // Initial load
    // Removed setInterval for auto-refresh
    // Only call fetchInactiveMembers after CRUD operations
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
  const filtered = sortedData.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()));
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
    setForm({ plan: member.plan || "", validUpto: member.validUpto || "" });
  };

  const closeModify = () => {
    setModifyMember(null);
    setForm({ plan: "", validUpto: "" });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e) => {
    setForm({ ...form, validUpto: e.target.value });
  };

  // Activate membership via API
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
      headers: {
        'Client-Service': 'COHAPPRT',
        'Auth-Key': '4F21zrjoAASqz25690Zpqf67UyY',
        'uid': uid,
        'token': token,
        'rurl': 'login.etribes.in',
        'Content-Type': 'application/json',
      },
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
      toast.success(`Member ${modifyMember.name} has been reactivated successfully!`);
      setMembers(prevMembers => prevMembers.filter(member => member.id !== modifyMember.id));
    closeModify();
    } catch (err) {
      if (err.response) {
        const errorMessage = err.response.data?.message || err.response.data?.error || 'Failed to activate membership';
        setUpdateError(errorMessage);
      } else if (err.request) {
        setUpdateError('Network error. Please check your connection.');
      } else {
        setUpdateError('Failed to activate membership. Please try again.');
      }
      closeModify();
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!members.length) return;
    const data = members.map(m => 
      `${m.name}, ${m.phone_num || m.contact}, ${m.email}, ${m.address}, ${m.ad1 || m.pan}, ${m.ad2 || m.aadhar}, ${m.ad3 || m.dl}, ${m.ad4 || m.dob}, ${m.company_name || m.company}, ${m.ad5 || m.validUpto}, ${m.plan || ""}`
    ).join('\n');
    navigator.clipboard.writeText(data);
  };

  // Export Handlers
  const handleExportCSV = () => {
    if (!members.length) return;
    const headers = [
      "Name", "Contact", "Email", "Address", "PAN Number", "Aadhar Number", "DL Number", "D.O.B", "Company Name", "Valid Upto", "Membership Plan"
    ];
    const rows = members.map(m => [
      m.name,
      m.phone_num || m.contact,
      m.email,
      m.address,
      m.ad1 || m.pan,
      m.ad2 || m.aadhar,
      m.ad3 || m.dl,
      m.ad4 || m.dob,
      m.company_name || m.company,
      m.ad5 || m.validUpto,
      m.plan || ""
    ]);
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inactive_members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (!members.length) return;
    const ws = XLSX.utils.json_to_sheet(
      members.map(m => ({
        Name: m.name,
        Contact: m.phone_num || m.contact,
        Email: m.email,
        Address: m.address,
        "PAN Number": m.ad1 || m.pan,
        "Aadhar Number": m.ad2 || m.aadhar,
        "DL Number": m.ad3 || m.dl,
        "D.O.B": m.ad4 || m.dob,
        "Company Name": m.company_name || m.company,
        "Valid Upto": m.ad5 || m.validUpto,
        "Membership Plan": m.plan || ""
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inactive Members");
    XLSX.writeFile(wb, "inactive_members.xlsx");
  };

  const handleExportPDF = () => {
    if (!members.length) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    const headers = [[
      "Name", "Contact", "Email", "Address", "PAN Number", "Aadhar Number", "DL Number", "D.O.B", "Company Name", "Valid Upto", "Membership Plan"
    ]];
    const rows = members.map(m => [
      m.name,
      m.phone_num || m.contact,
      m.email,
      m.address,
      m.ad1 || m.pan,
      m.ad2 || m.aadhar,
      m.ad3 || m.dl,
      m.ad4 || m.dob,
      m.company_name || m.company,
      m.ad5 || m.validUpto,
      m.plan || ""
    ]);
    try {
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      doc.save("inactive_members.pdf");
    } catch (err) {
      console.error("autoTable failed:", err);
      toast.error("PDF export failed: " + err.message);
    }
  };

  if (loading && firstLoad) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700 dark:text-indigo-300">Loading inactive members...</p>
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
      <div className="flex flex-col gap-4 py-3 px-2 sm:px-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Inactive Members</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiUserX className="text-indigo-600" />
            <span>Total Inactive Members: {members.length}</span>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 w-full mx-auto">
          {/* Controls */}
          <div className="flex flex-col gap-4 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
            {/* Search and Info Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="w-full sm:w-auto pl-10 pr-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ minWidth: '250px' }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-center sm:text-left">Showing {startIdx + 1} to {Math.min(startIdx + entriesPerPage, totalEntries)} of {totalEntries} entries</span>
              </div>
            </div>
            
            {/* Export Buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              <button 
                className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                onClick={() => window.location.reload()}
                title="Refresh Data"
              >
                <FiRefreshCw /> <span className="hidden sm:inline">Refresh</span>
              </button>
              <button 
                className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
                onClick={handleCopyToClipboard}
                title="Copy to Clipboard"
              >
                <FiCopy /> <span className="hidden sm:inline">Copy</span>
              </button>
              <button 
                className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                onClick={handleExportCSV}
                title="Export CSV"
              >
                <FiDownload /> <span className="hidden sm:inline">CSV</span>
              </button>
              <button 
                className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition"
                onClick={handleExportExcel}
                title="Export Excel"
              >
                <FiFile /> <span className="hidden sm:inline">Excel</span>
              </button>
              <button 
                className="flex items-center gap-1 bg-rose-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-rose-600 transition"
                onClick={handleExportPDF}
                title="Export PDF"
              >
                <FiFile /> <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="w-full text-sm border-collapse hidden lg:table">
              <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-gray-700 dark:text-gray-200 sticky top-0 z-10 shadow-sm">
                <tr className="border-b-2 border-indigo-200 dark:border-indigo-800">
                  <th 
                    className="p-3 text-center font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    style={{ minWidth: '80px', width: '80px' }}
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Sr No
                      {sortField === 'id' && (
                        <span className="text-indigo-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    style={{ minWidth: '150px', width: '150px' }}
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortField === 'name' && (
                        <span className="text-indigo-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    style={{ minWidth: '120px', width: '120px' }}
                    onClick={() => handleSort('phone_num')}
                  >
                    <div className="flex items-center gap-1">
                      Contact
                      {sortField === 'phone_num' && (
                        <span className="text-indigo-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    style={{ minWidth: '180px', width: '180px' }}
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-1">
                      Email
                      {sortField === 'email' && (
                        <span className="text-indigo-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    style={{ minWidth: '200px', width: '200px' }}
                    onClick={() => handleSort('address')}
                  >
                    <div className="flex items-center gap-1">
                      Address
                      {sortField === 'address' && (
                        <span className="text-indigo-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    style={{ minWidth: '120px', width: '120px' }}
                    onClick={() => handleSort('ad1')}
                  >
                    <div className="flex items-center gap-1">
                      PAN Number
                      {sortField === 'ad1' && (
                        <span className="text-indigo-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    style={{ minWidth: '130px', width: '130px' }}
                    onClick={() => handleSort('ad2')}
                  >
                    <div className="flex items-center gap-1">
                      Aadhar Number
                      {sortField === 'ad2' && (
                        <span className="text-indigo-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    style={{ minWidth: '120px', width: '120px' }}
                    onClick={() => handleSort('ad3')}
                  >
                    <div className="flex items-center gap-1">
                      DL Number
                      {sortField === 'ad3' && (
                        <span className="text-indigo-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    style={{ minWidth: '100px', width: '100px' }}
                    onClick={() => handleSort('ad4')}
                  >
                    <div className="flex items-center gap-1">
                      D.O.B
                      {sortField === 'ad4' && (
                        <span className="text-indigo-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    style={{ minWidth: '150px', width: '150px' }}
                    onClick={() => handleSort('company_name')}
                  >
                    <div className="flex items-center gap-1">
                      Company Name
                      {sortField === 'company_name' && (
                        <span className="text-indigo-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    style={{ minWidth: '120px', width: '120px' }}
                    onClick={() => handleSort('ad5')}
                  >
                    <div className="flex items-center gap-1">
                      Valid Upto
                      {sortField === 'ad5' && (
                        <span className="text-indigo-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    style={{ minWidth: '140px', width: '140px' }}
                    onClick={() => handleSort('plan')}
                  >
                    <div className="flex items-center gap-1">
                      Membership Plan
                      {sortField === 'plan' && (
                        <span className="text-indigo-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="p-3 text-center font-semibold whitespace-nowrap"
                    style={{ minWidth: '100px', width: '100px' }}
                  >
                    Actions
                  </th>
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
                    <td className="p-3 text-center font-semibold text-indigo-700 border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">
                      {startIdx + idx + 1}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{m.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.phone_num || m.contact}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.email}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.address}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.ad1 || m.pan}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.ad2 || m.aadhar}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.ad3 || m.dl}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.ad4 || m.dob}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.company_name || m.company}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.ad5 || m.validUpto}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">
                      <span className="px-2 py-1 bg-red-100 dark:bg-indigo-900 text-red-700 dark:text-gray-100 rounded-full text-xs font-medium">
                        {m.plan || "No Plan"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition-colors"
                        title="Modify Membership"
                        onClick={() => openModify(m)}
                      >
                        <FiEdit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {paginated.map((m, idx) => (
                <div 
                  key={m.id}
                  className={`border-b border-gray-200 dark:border-gray-700 p-4 ${
                    idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'
                  } hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{m.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Member #{startIdx + idx + 1}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition-colors"
                        title="Modify Membership"
                        onClick={() => openModify(m)}
                      >
                        <FiEdit2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Contact:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.phone_num || m.contact}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Email:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.email}</p>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">Address:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.address}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">PAN Number:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.ad1 || m.pan}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Aadhar Number:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.ad2 || m.aadhar}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">DL Number:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.ad3 || m.dl}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">D.O.B:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.ad4 || m.dob}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Company:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.company_name || m.company}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Valid Upto:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.ad5 || m.validUpto}</p>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">Membership Plan:</span>
                      <span className="inline-block px-2 py-1 bg-red-100 dark:bg-indigo-900 text-red-700 dark:text-gray-100 rounded-full text-xs font-medium ml-2">
                        {m.plan || "No Plan"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">Show</span>
                <select
                  className="border rounded-lg px-3 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 text-gray-700 focus:ring-2 focus:ring-indigo-400 transition-colors"
                  value={entriesPerPage}
                  onChange={handleEntriesChange}
                >
                  {[10, 25, 50, 100].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">entries per page</span>
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Previous"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Next"
                >
                  Next
                </button>
              </div>
            </div>
        </div>
        
        {/* Enhanced Modify Membership Modal */}
        {modifyMember && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-1 sm:p-4"
            onClick={closeModify}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-xs sm:max-w-lg mx-2 max-h-[98vh] flex flex-col p-2 sm:p-6 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 dark:text-gray-500 hover:text-rose-500 transition-colors z-10 p-1 sm:p-2"
                onClick={closeModify}
                title="Close"
              >
                <FiX size={18} className="sm:w-6 sm:h-6" />
              </button>
              <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6 pr-8 sm:pr-0">
                <div className="w-9 h-9 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-2xl">
                  {modifyMember.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Modify Membership</h2>
                  <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">Update membership for {modifyMember.name}</p>
                </div>
              </div>
              {updateError && (
                <div className="mb-4 text-red-600 bg-red-50 dark:bg-gray-800 border border-red-200 dark:border-red-400 rounded-lg px-4 py-2 flex items-center gap-2">
                  <FiAlertCircle /> {updateError}
                </div>
              )}
              {updateSuccess && (
                <div className="mb-4 text-green-600 bg-green-50 dark:bg-gray-800 border border-green-200 dark:border-green-400 rounded-lg px-4 py-2 flex items-center gap-2">
                  <FiCalendar /> {updateSuccess}
                </div>
              )}
              <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Membership Plan *</label>
                  <select
                    name="plan"
                    value={form.plan}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-400 transition-colors"
                    required
                  >
                    <option value="">Select Plan</option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>{plan.plan_name || plan.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Valid Upto *</label>
                  <input
                    type="date"
                    name="validUpto"
                    value={form.validUpto}
                    onChange={handleDateChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-400 transition-colors"
                    required
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={closeModify}
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className={`flex-1 flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${updateLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    onClick={handleUpdate}
                  >
                    {updateLoading ? (
                      <>
                        <FiRefreshCw className="animate-spin" size={14} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="text-sm">✔</span>
                        Save Changes
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