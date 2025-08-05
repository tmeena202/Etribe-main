import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiFileText, FiFile, FiRefreshCw, FiX, FiShield, FiCheckCircle, FiAlertCircle, FiSave, FiSettings } from "react-icons/fi";
import api from "../api/axiosConfig";
import { toast } from 'react-toastify';
import { getAuthHeaders } from "../utils/apiHeaders";

const modules = [
  "Group Settings",
  "SMTP Settings",
  "User Roles",
  "Role Management",
  "System Accounts",
  "Account Password Change",
  "Message Settings",
  "Membership Plans",
  "Members Services",
  "Contacts Management",
  "Events Management",
];

const defaultPermissions = modules.map((mod) => ({
  module: mod,
  view: false,
  add: false,
  edit: false,
  delete: false,
}));

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Fetch roles from API
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || '1';
      
      if (!token) {
        toast.error('Please log in to view role management');
        window.location.href = '/login';
        return;
      }

      const response = await api.post('/userRole', {}, {
        headers: {
          'token': token,
          'uid': uid,
        }
      });

      console.log('Role Management - Roles Response:', response.data);
      
      // Handle different response formats
      let rolesData = [];
      if (Array.isArray(response.data)) {
        rolesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        rolesData = response.data.data;
      } else if (response.data?.roles && Array.isArray(response.data.roles)) {
        rolesData = response.data.roles;
      } else {
        // If no roles found, use empty array
        rolesData = [];
      }

      // Transform data to match expected format
      const transformedRoles = rolesData.map((role, index) => ({
        id: role.id || role.role_id || index + 1,
        role: role.role || role.role_name || role.name || `Role ${index + 1}`,
        ...role
      }));

      setRoles(transformedRoles);
      
      // Don't auto-select first role - let user choose
      // if (transformedRoles.length > 0 && !selectedRole) {
      //   setSelectedRole(transformedRoles[0].role);
      // }
    } catch (err) {
      console.error('Fetch roles error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch roles';
      toast.error(errorMessage);
      
      if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('unauthorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('uid');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch permissions for a specific role
  const fetchRolePermissions = async (roleName) => {
    if (!roleName) return;
    
    setLoadingPermissions(true);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || '1';
      
      console.log('Fetching permissions for role:', roleName);
      
      // Find the role ID for the selected role
      const selectedRoleObj = roles.find(role => role.role === roleName);
      const roleId = selectedRoleObj?.id || '1';
      
      console.log('Using role ID:', roleId);
      
      const response = await api.post('/userRole/get_modules', {
        role_id: roleId.toString()
      }, {
        headers: getAuthHeaders()
      });

      console.log('Role Permissions Response:', response.data);
      
      // Handle the current API response format with actual permission states
      let permissionsData = [];
      if (response.data?.status === true && Array.isArray(response.data?.data)) {
        permissionsData = response.data.data;
        console.log('Found permissions data with actual states:', permissionsData);
      } else if (Array.isArray(response.data)) {
        permissionsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        permissionsData = response.data.data;
      } else {
        console.log('No permissions data found, using default (all disabled)');
        permissionsData = [];
      }

      console.log('Processed permissions data:', permissionsData);

      // Transform permissions data to match our modules
      const transformedPermissions = modules.map(module => {
        // Find permission by module name (case-insensitive)
        const foundPermission = permissionsData.find(p => 
          p.name?.toLowerCase() === module.toLowerCase() ||
          p.module_name?.toLowerCase() === module.toLowerCase() ||
          p.name === module ||
          p.module_name === module
        );
        
        console.log(`Module: ${module}, Found permission:`, foundPermission);
        
        // If permission found, use actual values; otherwise default to false
        return {
          module: module,
          view: foundPermission ? (foundPermission.is_view === "1" || foundPermission.is_view === 1) : false,
          add: foundPermission ? (foundPermission.is_add === "1" || foundPermission.is_add === 1) : false,
          edit: foundPermission ? (foundPermission.is_edit === "1" || foundPermission.is_edit === 1) : false,
          delete: foundPermission ? (foundPermission.is_delete === "1" || foundPermission.is_delete === 1) : false,
        };
      });

      console.log('Final transformed permissions:', transformedPermissions);
      setPermissions(transformedPermissions);
    } catch (err) {
      console.error('Fetch permissions error:', err);
      // If permissions fetch fails, use default permissions (all false)
      console.log('Using default permissions due to error');
      setPermissions(modules.map(module => ({
        module: module,
        view: false,
        add: false,
        edit: false,
        delete: false,
      })));
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Save role permissions
  const saveRolePermissions = async (roleName, permissionsData) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid') || '1';
      
      // Find the role ID for the selected role
      const selectedRoleObj = roles.find(role => role.role === roleName);
      const roleId = selectedRoleObj?.id || '1';
      
      console.log('Saving permissions for role ID:', roleId);
      
      // Transform permissions data to match API format
      // Convert permissions to module IDs based on their position in the modules array
      const viewModules = [];
      const addModules = [];
      const editModules = [];
      const deleteModules = [];
      
      permissionsData.forEach((permission, index) => {
        const moduleId = index + 1; // Module IDs start from 1
        if (permission.view) viewModules.push(moduleId);
        if (permission.add) addModules.push(moduleId);
        if (permission.edit) editModules.push(moduleId);
        if (permission.delete) deleteModules.push(moduleId);
      });
      
      const payload = {
        role: parseInt(roleId),
        view: viewModules,
        add: addModules,
        edit: editModules,
        delete: deleteModules
      };
      
      console.log('Saving permissions payload:', payload);
      
      const response = await api.post('/userRole/assign_roles', payload, {
        headers: getAuthHeaders()
      });

      console.log('Save permissions response:', response.data);
      
      if (response.data?.success || response.data?.status === 'success') {
        toast.success('Permissions saved successfully!');
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Failed to save permissions');
      }
    } catch (err) {
      console.error('Save permissions error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save permissions';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Load roles on component mount
  useEffect(() => {
    fetchRoles();
    
    // Set up polling every 30 seconds to keep data fresh
    const interval = setInterval(fetchRoles, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load permissions when role changes
  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handlePermissionChange = (idx, perm) => {
    setPermissions((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, [perm]: !row[perm] } : row
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveRolePermissions(selectedRole, permissions);
      // No need to clear error/success with toast
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSuccessClose = () => {
    // No need to clear error/success with toast
  };

  if (loading && roles.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700">Loading role management...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-orange-600">Role Management</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiShield className="text-indigo-600" />
            <span>Total Roles: {roles.length}</span>
          </div>
        </div>

        {/* Success/Error Messages */}
        {/* No need to clear error/success with toast */}

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 max-w-7xl w-full mx-auto">
          {/* Role Selection Controls */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Select Role:</label>
                <select
                  className="px-2 sm:px-4 py-1 sm:py-2 border rounded-lg text-xs sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors"
                  style={{ minWidth: '150px', maxWidth: '200px' }}
                  value={selectedRole}
                  onChange={handleRoleChange}
                  disabled={roles.length === 0 || submitting}
                >
                  <option value="">Select Role</option>
                  {roles.length === 0 ? (
                    <option value="">No roles available</option>
                  ) : (
                    roles.map((role, idx) => (
                      <option key={role.id || idx} value={role.role}>{role.role}</option>
                    ))
                  )}
                </select>
              </div>
              
              {selectedRole && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <FiSettings className="text-indigo-600 flex-shrink-0" size={14} />
                  <span className="text-xs sm:text-sm">Managing: <strong>{selectedRole}</strong></span>
                  {loadingPermissions && (
                    <div className="flex items-center gap-1 text-indigo-600">
                      <FiRefreshCw className="animate-spin text-xs sm:text-sm" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Refresh Button - Always in right corner for all screen sizes */}
            <div className="flex gap-2 items-center">
              <button 
                className="flex items-center gap-1 bg-blue-500 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600 transition"
                onClick={() => window.location.reload()}
                title="Refresh Data"
              >
                <FiRefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Permissions Table */}
          {roles.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FiShield className="mx-auto text-4xl text-gray-300 dark:text-gray-500 mb-4" />
              <p className="text-lg font-medium">No roles found</p>
              <p className="text-sm text-gray-400 mt-2">Please add roles in the User Roles section first.</p>
            </div>
          ) : !selectedRole ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FiShield className="mx-auto text-4xl text-gray-300 dark:text-gray-500 mb-4" />
              <p className="text-lg font-medium">Select a Role</p>
              <p className="text-sm text-gray-400 mt-2">Please select a role from the dropdown above to view and manage its permissions.</p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-gray-700 dark:text-gray-200 sticky top-0 z-10 shadow-sm">
                  <tr className="border-b-2 border-indigo-200 dark:border-indigo-800">
                    <th 
                      className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                      style={{ minWidth: '250px', width: '250px' }}
                    >
                      Module
                    </th>
                    <th 
                      className="p-3 text-center font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                      style={{ minWidth: '100px', width: '100px' }}
                    >
                      View
                    </th>
                    <th 
                      className="p-3 text-center font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                      style={{ minWidth: '100px', width: '100px' }}
                    >
                      Add
                    </th>
                    <th 
                      className="p-3 text-center font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap"
                      style={{ minWidth: '100px', width: '100px' }}
                    >
                      Edit
                    </th>
                    <th 
                      className="p-3 text-center font-semibold whitespace-nowrap"
                      style={{ minWidth: '100px', width: '100px' }}
                    >
                      Delete
                    </th>
                </tr>
              </thead>
                <tbody>
                {permissions.map((row, idx) => (
                    <tr 
                      key={row.module} 
                      className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${
                        idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'
                      } hover:bg-indigo-50 dark:hover:bg-gray-700 hover:shadow-sm`}
                    >
                      <td className="p-3 text-left font-semibold text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            {row.module.charAt(0).toUpperCase()}
                          </div>
                          <span className="dark:text-gray-100">{row.module}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center border-r border-gray-200 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={row.view}
                        onChange={() => handlePermissionChange(idx, "view")}
                          className="h-5 w-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:ring-indigo-500 focus:ring-2 transition-colors"
                          disabled={submitting}
                      />
                    </td>
                      <td className="p-3 text-center border-r border-gray-200 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={row.add}
                        onChange={() => handlePermissionChange(idx, "add")}
                          className="h-5 w-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:ring-indigo-500 focus:ring-2 transition-colors"
                          disabled={submitting}
                      />
                    </td>
                      <td className="p-3 text-center border-r border-gray-200 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={row.edit}
                        onChange={() => handlePermissionChange(idx, "edit")}
                          className="h-5 w-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:ring-indigo-500 focus:ring-2 transition-colors"
                          disabled={submitting}
                      />
                    </td>
                      <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={row.delete}
                        onChange={() => handlePermissionChange(idx, "delete")}
                          className="h-5 w-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:ring-indigo-500 focus:ring-2 transition-colors"
                          disabled={submitting}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              
              {/* Save Button */}
              <div className="flex justify-end p-6 border-t border-gray-100 dark:border-gray-700">
              <button
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg"
                onClick={handleSubmit}
                  disabled={submitting || !selectedRole}
                >
                  {submitting ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Save Permissions
                    </>
                  )}
              </button>
            </div>
          </div>

          {/* Mobile Permissions Cards View */}
          <div className="lg:hidden p-4 sm:p-6 space-y-4">
            {permissions.map((row, idx) => (
              <div key={row.module} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white">
                      {row.module.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{row.module}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Module #{idx + 1}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View</span>
                    <input
                      type="checkbox"
                      checked={row.view}
                      onChange={() => handlePermissionChange(idx, "view")}
                      className="h-5 w-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:ring-indigo-500 focus:ring-2 transition-colors"
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add</span>
                    <input
                      type="checkbox"
                      checked={row.add}
                      onChange={() => handlePermissionChange(idx, "add")}
                      className="h-5 w-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:ring-indigo-500 focus:ring-2 transition-colors"
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Edit</span>
                    <input
                      type="checkbox"
                      checked={row.edit}
                      onChange={() => handlePermissionChange(idx, "edit")}
                      className="h-5 w-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:ring-indigo-500 focus:ring-2 transition-colors"
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Delete</span>
                    <input
                      type="checkbox"
                      checked={row.delete}
                      onChange={() => handlePermissionChange(idx, "delete")}
                      className="h-5 w-5 text-indigo-600 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:ring-indigo-500 focus:ring-2 transition-colors"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Mobile Save Button */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 shadow-lg"
                onClick={handleSubmit}
                disabled={submitting || !selectedRole}
              >
                {submitting ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave />
                    Save Permissions
                  </>
                )}
              </button>
            </div>
          </div>
            </>
          )}
        </div>
        
        {/* Enhanced Success Modal */}
        {/* No need to clear error/success with toast */}
      </div>
    </DashboardLayout>
  );
} 