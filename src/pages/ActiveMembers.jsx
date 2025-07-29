import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiFileText, FiFile, FiEye, FiX, FiUsers, FiSearch } from "react-icons/fi";
import api from "../api/axiosConfig";
import { toast } from 'react-toastify';
import ExportButtons from "../utils/ExportButtons";

export default function ActiveMembers() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [viewMember, setViewMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    fetchActiveMembers(true); // Initial load
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

  // Fetch function for refresh
  const fetchActiveMembers = async (isFirst = false) => {
    if (isFirst) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || '1';
      console.log('Token:', token);
      console.log('UID:', uid);
      if (!token) {
        toast.error('Please log in to view active members');
        window.location.href = '/';
        return;
      }
      const response = await api.post('/userDetail/active_members', { uid }, {
        headers: {
          'token': token,
          'uid': uid,
        }
      });
      console.log('Active Members Response:', response.data);
      setMembers(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      console.error('Fetch error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch active members';
      toast.error(errorMessage);
      if (errorMessage.toLowerCase().includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('uid');
        window.location.href = '/';
      }
    } finally {
      if (isFirst) setLoading(false);
      if (isFirst) setFirstLoad(false);
    }
  };

  if (loading && firstLoad) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin text-indigo-600 text-2xl">⏳</div>
            <p className="text-indigo-700">Loading active members...</p>
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
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Active Members</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiUsers className="text-indigo-600" />
            <span>Total Members: {members.length}</span>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 w-full mx-auto">
          {/* Controls */}
          <div className="flex flex-col gap-4 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
            {/* Search, Info, and Export Buttons in Single Line */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              <ExportButtons
                data={members}
                dataType="members"
                onRefresh={() => fetchActiveMembers(false)}
                filename="active_members"
                title="Active Members Report"
                refreshMessage="Active members refreshed successfully!"
              />
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
                    className="p-3 text-center font-semibold whitespace-nowrap"
                    style={{ minWidth: '80px', width: '80px' }}
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
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{m.phone_num}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{m.email}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{m.address}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{m.ad1}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{m.ad2}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{m.ad3}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{m.ad4}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{m.company_name}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{m.ad5}</td>
                    <td className="p-3 text-center">
                      <button
                        className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors"
                        title="View Profile"
                        onClick={() => setViewMember(m)}
                      >
                        <FiEye size={18} />
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
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{m.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Member #{startIdx + idx + 1}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors"
                        title="View Profile"
                        onClick={() => setViewMember(m)}
                      >
                        <FiEye size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Contact:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.phone_num}</p>
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
                      <p className="text-gray-900 dark:text-gray-100">{m.ad1}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Aadhar Number:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.ad2}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">DL Number:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.ad3}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">D.O.B:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.ad4}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Company:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.company_name}</p>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">Valid Upto:</span>
                      <p className="text-gray-900 dark:text-gray-100">{m.ad5}</p>
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
                {[5, 10, 25, 50, 100].map(num => (
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
        
        {/* Enhanced View Profile Modal */}
        {viewMember && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg lg:max-w-2xl relative h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col">
              <button
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 dark:text-gray-500 hover:text-rose-500 transition-colors z-10"
                onClick={() => setViewMember(null)}
                title="Close"
              >
                <FiX size={20} className="sm:w-6 sm:h-6" />
              </button>
              
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pr-8 sm:pr-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg lg:text-xl">
                  {viewMember.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100">{viewMember.name}</h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Active Member Profile</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-sm sm:text-base">Contact Information</h3>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <div><span className="font-medium text-gray-800 dark:text-gray-100">Phone:</span> {viewMember.phone_num}</div>
                    <div><span className="font-medium text-gray-800 dark:text-gray-100">Email:</span> {viewMember.email}</div>
                    <div><span className="font-medium text-gray-800 dark:text-gray-100">Address:</span> {viewMember.address}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-sm sm:text-base">Company Details</h3>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <div><span className="font-medium text-gray-800 dark:text-gray-100">Company:</span> {viewMember.company_name}</div>
                    <div><span className="font-medium text-gray-800 dark:text-gray-100">Valid Until:</span> {viewMember.ad5}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-sm sm:text-base">Identity Documents</h3>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <div><span className="font-medium text-gray-800 dark:text-gray-100">PAN Number:</span> {viewMember.ad1}</div>
                    <div><span className="font-medium text-gray-800 dark:text-gray-100">Aadhar Number:</span> {viewMember.ad2}</div>
                    <div><span className="font-medium text-gray-800 dark:text-gray-100">DL Number:</span> {viewMember.ad3}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-sm sm:text-base">Personal Information</h3>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <div><span className="font-medium text-gray-800 dark:text-gray-100">Date of Birth:</span> {viewMember.ad4}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 