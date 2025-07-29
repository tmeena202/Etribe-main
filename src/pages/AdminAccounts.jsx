import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiEdit2, FiPlus, FiKey, FiX, FiFileText, FiFile, FiEye, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiShield, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import ExportButtons from "../utils/ExportButtons";
import { useAdminAccounts } from "../hooks/useAdminAccounts";

export default function AdminAccounts() {
  const {
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
  } = useAdminAccounts();



  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin text-indigo-600 text-2xl">⏳</div>
            <p className="text-indigo-700">Loading system users...</p>
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
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">System Users</h1>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition w-full sm:w-auto"
            onClick={openAddUserModal}
          >
            <FiPlus /> Add System User
          </button>
        </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 w-full mx-auto">
          {/* Filter and Export Controls */}
          <div className="flex flex-col gap-4 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
            {/* Filter and Export Buttons in Single Line */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</label>
                  <div className="relative">
              <input
                type="text"
                      placeholder="Type to filter..."
                      className="w-full sm:w-auto pl-10 pr-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors"
                value={search}
                onChange={e => setSearch(e.target.value)}
                      style={{ minWidth: '200px' }}
                    />
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show:</label>
                  <select
                    className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors"
                    value={entriesPerPage}
                    onChange={handleEntriesChange}
                  >
                    {[10, 25, 50, 100].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Export Buttons */}
              <ExportButtons
                data={filtered}
                dataType="users"
                onRefresh={() => fetchSystemUsers(false)}
                filename="system_users"
                title="System Users Report"
                refreshMessage="System users refreshed successfully!"
                customConfig={{
                  headers: ["Name", "Contact No.", "Email Address", "Address", "City", "District", "State", "Country", "Role", "Status"],
                  fields: ["name", "contact", "email", "address", "city", "district", "state", "country", "role", "status"],
                  fieldMapping: {
                    "Name": "name",
                    "Contact No.": "contact",
                    "Email Address": "email",
                    "Address": "address",
                    "City": "city",
                    "District": "district",
                    "State": "state",
                    "Country": "country",
                    "Role": "role",
                    "Status": "status"
                  }
                }}
              />
            </div>
          </div>

          {/* System Users Table */}
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="w-full text-sm border-collapse hidden lg:table">
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
                      <div className="flex items-center justify-center gap-1">
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

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {paginated.map((user, idx) => (
                <div 
                  key={user.id}
                  className={`border-b border-gray-200 dark:border-gray-700 p-4 ${
                    idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'
                  } hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
          </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        onClick={() => openViewModal(user)}
                        title="View User"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 dark:text-green-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        onClick={() => openPasswordModal(user)}
                        title="Change Password"
                      >
                        <FiKey size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Contact:</span>
                      <p className="text-gray-900 dark:text-gray-100">{user.contact}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Role:</span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)} dark:bg-indigo-900 dark:text-gray-100 dark:border-indigo-800`}>
                        {user.role || "No Role"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">Address:</span>
                      <p className="text-gray-900 dark:text-gray-100">{user.address}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">City:</span>
                      <p className="text-gray-900 dark:text-gray-100">{user.city}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">District:</span>
                      <p className="text-gray-900 dark:text-gray-100">{user.district}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">State:</span>
                      <p className="text-gray-900 dark:text-gray-100">{user.state}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Country:</span>
                      <p className="text-gray-900 dark:text-gray-100">{user.country}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-center sm:text-left">Showing {startIdx + 1} to {Math.min(startIdx + entriesPerPage, totalEntries)} of {totalEntries} entries</span>
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-4">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Previous"
                >
                  &lt;
                </button>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Next"
                >
                  &gt;
                </button>
            </div>
          </div>
        </div>

        {/* Enhanced Change Password Modal */}
        {showPasswordModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md relative">
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
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Manage User</h2>
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
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6">
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
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 w-full max-w-sm sm:max-w-2xl relative my-2 sm:my-0">
              <button
                className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-red-500 transition-colors z-10"
                onClick={closeAddUserModal}
                title="Close"
              >
                <FiX size={18} className="sm:w-5 sm:h-5" />
              </button>
              <div className="flex items-center gap-2 mb-2 sm:mb-3 pr-8 sm:pr-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                  <FiPlus size={12} className="sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 dark:text-gray-100">Add System User</h2>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Create a new system user account</p>
                </div>
              </div>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3" onSubmit={handleAddUserSubmit}>
                <div className="md:col-span-2">
                  <label className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">User Role *</label>
                  <select
                    name="role_id"
                    value={addUserForm.role_id}
                    onChange={handleAddUserChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors text-xs sm:text-sm"
                    required
                  >
                    <option value="">Select Role</option>
                    {userRoles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={addUserForm.name}
                    onChange={handleAddUserChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors text-xs sm:text-sm"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Contact Number *</label>
                  <input
                    type="tel"
                    name="contact"
                    value={addUserForm.contact}
                    onChange={handleAddUserChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors text-xs sm:text-sm"
                    placeholder="Enter contact number"
                    required
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={addUserForm.email}
                    onChange={handleAddUserChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors text-xs sm:text-sm"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={addUserForm.password}
                    onChange={handleAddUserChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors text-xs sm:text-sm"
                    placeholder="Enter password"
                    required
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={addUserForm.confirmPassword}
                    onChange={handleAddUserChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors text-xs sm:text-sm"
                    placeholder="Confirm password"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={addUserForm.address}
                    onChange={handleAddUserChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors text-xs sm:text-sm"
                    placeholder="Enter address"
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">City</label>
                  <input
                    type="text"
                    name="city"
                    value={addUserForm.city}
                    onChange={handleAddUserChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors text-xs sm:text-sm"
                    placeholder="Enter city"
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">District</label>
                  <input
                    type="text"
                    name="district"
                    value={addUserForm.district}
                    onChange={handleAddUserChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors text-xs sm:text-sm"
                    placeholder="Enter district"
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={addUserForm.pincode}
                    onChange={handleAddUserChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors text-xs sm:text-sm"
                    placeholder="Enter Pincode"
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Country *</label>
                  <select
                    name="country"
                    value={addUserForm.country || ''}
                    onChange={handleAddUserChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors text-xs sm:text-sm"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country, idx) => (
                      <option key={country.country || idx} value={country.country}>{country.country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">State *</label>
                  <select
                    name="state"
                    value={addUserForm.state || ''}
                    onChange={handleAddUserChange}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors text-xs sm:text-sm"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((state, idx) => (
                      <option key={state.id || idx} value={state.id}>{state.state}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-xs sm:text-sm"
                    onClick={closeAddUserModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors text-xs sm:text-sm"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-lg relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                onClick={closeViewModal}
                title="Close"
              >
                <FiX size={24} />
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg sm:text-xl">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedUser.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">System User Profile</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 text-sm">
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