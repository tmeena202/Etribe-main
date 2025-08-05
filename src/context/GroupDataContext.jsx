import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { getAuthHeaders } from '../utils/apiHeaders';

const GroupDataContext = createContext();

export const useGroupData = () => useContext(GroupDataContext);

export const GroupDataProvider = ({ children }) => {
  const [groupData, setGroupData] = useState({
    name: '',
    email: '',
    logo: '',
    signature: '',
    address: '',
    contact: '',
    website: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get API base URL from environment (same as GroupData page)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.etribes.ezcrm.site';

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      if (!token) {
        setError('Please log in');
        return;
      }

      const response = await api.post('/groupSettings', {}, {
        headers: getAuthHeaders()
      });

      const backendData = response.data?.data || response.data || {};
      
      // Process logo and signature URLs with correct API base URL
      const processedData = {
        name: backendData.name || '',
        email: backendData.email || '',
        logo: backendData.logo ? (backendData.logo.startsWith('http') ? backendData.logo : `${API_BASE_URL}/${backendData.logo}`) : '',
        signature: backendData.signature ? (backendData.signature.startsWith('http') ? backendData.signature : `${API_BASE_URL}/${backendData.signature}`) : '',
        address: backendData.address || '',
        contact: backendData.contact || '',
        website: backendData.website || ''
      };

      setGroupData(processedData);
    } catch (err) {
      setError('Failed to fetch group data');
      console.error('Group data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
    
    // Removed auto-refresh interval to prevent repeated API calls
    // const interval = setInterval(fetchGroupData, 30000);
    // return () => clearInterval(interval);
  }, []);

  const updateGroupData = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const uid = localStorage.getItem('uid');
      
      if (!token) {
        throw new Error('Please log in');
      }

      const response = await api.post('/groupSettings/update', updatedData, {
        headers: getAuthHeaders()
      });

      if (response.data?.success || response.data?.status === 'success') {
        // Refresh the group data immediately after update
        await fetchGroupData();
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Failed to update group data');
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to update group data');
    }
  };

  return (
    <GroupDataContext.Provider value={{ 
      groupData, 
      loading, 
      error, 
      fetchGroupData, 
      updateGroupData 
    }}>
      {children}
    </GroupDataContext.Provider>
  );
}; 