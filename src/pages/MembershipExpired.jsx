import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiEdit2, FiX, FiCalendar, FiFileText, FiFile, FiUsers, FiSearch, FiRefreshCw, FiAlertCircle, FiCopy, FiDownload, FiClock } from "react-icons/fi";
import api from "../api/axiosConfig";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Fetch plans for dropdown
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

// Get plan ID from plan name
const getPlanId = (planName) => {
  const planMapping = {
    "Basic": "1",
    "Standard": "2",
    "Premium": "3",
    "Platinum": "4",
    "Diamond": "5",
    "Gold": "6",
    "Voice over plan": "7",
  };
  return planMapping[planName] || "1";
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

export default function MembershipExpired() {
  const plans = useMembershipPlans();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [modifyMember, setModifyMember] = useState(null);
  const [form, setForm] = useState({ plan: "", validUpto: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    const fetchExpiredMembers = async (isFirst = false) => {
      if (isFirst) setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        if (!token) {
          setError('Please log in to view expired members');
          window.location.href = '/';
          return;
        }
        const response = await api.post('/userDetail/membership_expired', { uid }, {
          headers: {
            'token': token,
            'uid': uid,
          }
        });
        setMembers(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch expired members');
      } finally {
        if (isFirst) setLoading(false);
        if (isFirst) setFirstLoad(false);
      }
    };
    fetchExpiredMembers(true); // Initial load
    const interval = setInterval(() => fetchExpiredMembers(false), 10000);
    return () => clearInterval(interval);
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

  const handleUpdate = async () => {
    if (!modifyMember) return;
    // Validation
    if (!form.plan) {
      setUpdateError('Please select a membership plan.');
      return;
    }
    if (!form.validUpto) {
      setUpdateError('Please select a valid until date.');
      return;
    }
    // Check if date is in future
    const selectedDate = new Date(form.validUpto);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate <= today) {
      setUpdateError('Please select a future date for membership validity.');
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
      setUpdateSuccess(`Member ${modifyMember.name} has been reactivated successfully!`);
      setMembers(prevMembers => prevMembers.filter(member => member.id !== modifyMember.id));
      setTimeout(() => {
    closeModify();
      }, 2000);
    } catch (err) {
      if (err.response) {
        const errorMessage = err.response.data?.message || err.response.data?.error || 'Failed to activate membership';
        setUpdateError(errorMessage);
      } else if (err.request) {
        setUpdateError('Network error. Please check your connection.');
      } else {
        setUpdateError('Failed to activate membership. Please try again.');
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!members.length) return;
    const data = members.map(m => 
      `${m.name}, ${m.phone_num || m.contact}, ${m.email}, ${m.address}, ${m.ad1 || m.pan}, ${m.ad2 || m.aadhar}, ${m.ad3 || m.dl}, ${m.ad4 || m.dob}, ${m.company_name || m.company}, ${m.membershipExpired || m.membership_expired || ""}`
    ).join('\n');
    navigator.clipboard.writeText(data);
  };

  // Export Handlers
  const handleExportCSV = () => {
    if (!members.length) return;
    const headers = [
      "Name", "Contact", "Email", "Address", "PAN Number", "Aadhar Number", "DL Number", "D.O.B", "Company Name", "Membership Expiry Date"
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
      m.membershipExpired || m.membership_expired || ""
    ]);
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "membership_expired.csv");
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
        "Membership Expiry Date": m.membershipExpired || m.membership_expired || ""
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Membership Expired");
    XLSX.writeFile(wb, "membership_expired.xlsx");
  };

  const handleExportPDF = () => {
    if (!members.length) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    const headers = [[
      "Name", "Contact", "Email", "Address", "PAN Number", "Aadhar Number", "DL Number", "D.O.B", "Company Name", "Membership Expiry Date"
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
      m.membershipExpired || m.membership_expired || ""
    ]);
    try {
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      doc.save("membership_expired.pdf");
    } catch (err) {
      console.error("autoTable failed:", err);
      alert("PDF export failed: " + err.message);
    }
  };

  if (loading && firstLoad) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700 dark:text-indigo-300">Loading expired members...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2 text-red-500">
            <FiAlertCircle />
            <p className="dark:text-red-300">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-orange-600">Membership Expired</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiClock className="text-orange-600" />
            <span>Total Expired Members: {members.length}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <FiX size={16} />
            </button>
          </div>
        )}

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 max-w-7xl w-full mx-auto">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors"
              value={search}
              onChange={e => setSearch(e.target.value)}
                  style={{ minWidth: 250 }}
            />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Showing {startIdx + 1} to {Math.min(startIdx + entriesPerPage, totalEntries)} of {totalEntries} entries</span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button 
                className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                onClick={() => window.location.reload()}
                title="Refresh Data"
              >
                <FiRefreshCw /> Refresh
              </button>
              <button 
                className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
                onClick={handleCopyToClipboard}
                title="Copy to Clipboard"
              >
                <FiCopy /> Copy
              </button>
              <button 
                className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                onClick={handleExportCSV}
                title="Export CSV"
              >
                <FiDownload /> CSV
              </button>
              <button 
                className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition"
                onClick={handleExportExcel}
                title="Export Excel"
              >
                <FiFile /> Excel
              </button>
              <button 
                className="flex items-center gap-1 bg-rose-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-rose-600 transition"
                onClick={handleExportPDF}
                title="Export PDF"
              >
                <FiFile /> PDF
              </button>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-gray-700 dark:text-gray-200 sticky top-0 z-10 shadow-sm">
                <tr className="border-b-2 border-indigo-200 dark:border-indigo-800">
                  <th 
                    className="p-3 text-center font-semibold border-r border-indigo-200 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
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
                    className="p-3 text-left font-semibold border-r border-indigo-200 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
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
                    className="p-3 text-left font-semibold border-r border-indigo-200 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
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
                    className="p-3 text-left font-semibold border-r border-indigo-200 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
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
                    className="p-3 text-left font-semibold border-r border-indigo-200 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
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
                    className="p-3 text-left font-semibold border-r border-indigo-200 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
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
                    className="p-3 text-left font-semibold border-r border-indigo-200 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
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
                    className="p-3 text-left font-semibold border-r border-indigo-200 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
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
                    className="p-3 text-left font-semibold border-r border-indigo-200 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
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
                    className="p-3 text-left font-semibold border-r border-indigo-200 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
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
                    className="p-3 text-left font-semibold border-r border-indigo-200 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                    style={{ minWidth: '160px', width: '160px' }}
                    onClick={() => handleSort('membershipExpired')}
                  >
                    <div className="flex items-center gap-1">
                      Expiry Date
                      {sortField === 'membershipExpired' && (
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
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{m.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.phone_num || m.contact}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.email}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100 whitespace-pre-line break-words max-w-xs">{m.address}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.ad1 || m.pan}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.ad2 || m.aadhar}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.ad3 || m.dl}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.ad4 || m.dob}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">{m.company_name || m.company}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 dark:text-gray-100">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium dark:bg-indigo-900 dark:text-gray-100">
                        {m.membershipExpired || m.membership_expired || "Expired"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
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
          </div>
            {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-t border-gray-100 dark:border-gray-700">
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
                className={`px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Previous"
                >
                  Previous
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
                  Next
                </button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Modify Membership Modal */}
        {modifyMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-lg relative border border-gray-200 dark:border-gray-700">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                onClick={closeModify}
                title="Close"
              >
                <FiX size={24} />
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {modifyMember.name ? modifyMember.name.charAt(0).toUpperCase() : 'N'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Renew Membership</h2>
                  <p className="text-gray-600 dark:text-gray-300">Update membership for {modifyMember.name || 'Unknown Member'}</p>
                </div>
              </div>
              <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Membership Plan *</label>
                  <select
                    name="plan"
                    value={form.plan}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 transition-colors"
                    required
                  >
                    <option value="">Select Plan</option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>{plan.plan_name || plan.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Valid Until *</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="validUpto"
                      value={form.validUpto}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                {updateError && (
                  <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiAlertCircle />
                      <span>{updateError}</span>
                    </div>
                  </div>
                )}
                {updateSuccess && (
                  <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiUsers />
                      <span>{updateSuccess}</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-4 justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={closeModify}
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    onClick={handleUpdate}
                    disabled={updateLoading || !form.plan || !form.validUpto}
                  >
                    {updateLoading && <FiRefreshCw className="animate-spin" size={16} />}
                    {updateLoading ? 'Updating...' : 'Update Membership'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};