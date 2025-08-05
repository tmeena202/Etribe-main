import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiSearch, FiRefreshCw, FiDownload, FiCopy, FiFile, FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiFileText, FiEye, FiEdit2, FiTrash2, FiX, FiCalendar, FiSettings } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



export default function Circulars() {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [filteredCirculars, setFilteredCirculars] = useState([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    circularNumber: '',
    subject: '',
    body: '',
    date: '',
    file: null
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    circularNumber: '',
    subject: '',
    body: '',
    date: '',
    file: null
  });

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCircular, setSelectedCircular] = useState(null);

  useEffect(() => {
    fetchCirculars();
  }, []);

  useEffect(() => {
    filterCirculars();
  }, [circulars, search]);

  // Helper function to map circular data with comprehensive fallbacks
  const mapCircularData = (circular, index) => {
    const mappedCircular = {
      id: circular.id || index + 1,
      circularNo: circular.circular_no || circular.circularNo || circular.circular_number || '',
      subject: circular.subject || circular.title || circular.name || circular.circular_subject || circular.subject_title || '',
      date: circular.date || circular.created_at || circular.uploaded_on || new Date().toISOString().split('T')[0],
      description: circular.body || circular.description || circular.content || circular.body_content || circular.message || circular.text || circular.circular_body || circular.circular_content || circular.notification_body || '',
      body: circular.body || circular.description || circular.content || circular.body_content || circular.message || circular.text || circular.circular_body || circular.circular_content || circular.notification_body || '',
      file: circular.file || circular.file_path || circular.document || circular.attachment || '',
      file_path: circular.file_path || circular.file || circular.document || circular.attachment || '',
      document: circular.document || circular.file || circular.file_path || circular.attachment || ''
    };
    
    console.log(`Mapping circular ${index + 1}:`, {
      original: circular,
      mappedSubject: mappedCircular.subject,
      mappedBody: mappedCircular.body,
      mappedDescription: mappedCircular.description
    });
    
    return mappedCircular;
  };

  const fetchCirculars = async () => {
    try {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      
      if (!token) {
        toast.error("Please log in to view circulars");
        window.location.href = "/";
        return;
      }

      console.log('Fetching circulars with credentials:', { uid, token });
      
      const response = await api.post("/notifications/get_all_circulars", {}, {
        headers: {
          "Client-Service": "COHAPPRT",
          "Auth-Key": "4F21zrjoAASqz25690Zpqf67UyY",
          uid: uid || '1',
          token: token,
          rurl: "etribes.ezcrm.site",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      console.log('Circulars API response:', response.data);
      
      // Debug: Log the structure of each circular object
      if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('Individual circular objects:');
        response.data.data.forEach((circular, index) => {
          console.log(`Circular ${index + 1}:`, {
            id: circular.id,
            circular_no: circular.circular_no,
            circularNo: circular.circularNo,
            circular_number: circular.circular_number,
            subject: circular.subject,
            title: circular.title,
            name: circular.name,
            date: circular.date,
            created_at: circular.created_at,
            uploaded_on: circular.uploaded_on,
            description: circular.description,
            content: circular.content,
            body: circular.body,
            body_content: circular.body_content,
            message: circular.message,
            text: circular.text,
            file: circular.file,
            file_path: circular.file_path,
            document: circular.document,
            attachment: circular.attachment,
            // Log all keys to see what's actually available
            allKeys: Object.keys(circular),
            // Log all values to see what's actually in the data
            allValues: Object.values(circular)
          });
        });
      }
      
      // Handle the API response data
      if (response.data?.data) {
        // If the API returns data in response.data.data format
        const apiCirculars = response.data.data;
        const mappedCirculars = Array.isArray(apiCirculars) ? apiCirculars.map((circular, index) => mapCircularData(circular, index)) : [];
        
        setCirculars(mappedCirculars);
        console.log('Final mapped circulars:', mappedCirculars);
      } else if (response.data) {
        // If the API returns data directly in response.data
        const apiCirculars = Array.isArray(response.data) ? response.data : [response.data];
        const mappedCirculars = apiCirculars.map((circular, index) => mapCircularData(circular, index));
        
        setCirculars(mappedCirculars);
        console.log('Final mapped circulars:', mappedCirculars);
      } else {
        // No data found in API response
        console.log('No data found in API response');
        setCirculars([]);
      }
    } catch (err) {
      console.error('Error fetching circulars:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      } else if (err.response?.status === 404) {
        toast.error("Circulars endpoint not found. Please check the API configuration.");
      } else {
      toast.error(err.response?.data?.message || err.message || "Failed to fetch circulars");
      }
      
      // Set empty array on error instead of mock data
      setCirculars([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCirculars = () => {
    const filtered = circulars.filter(
      (circular) =>
        circular.circularNo.toString().toLowerCase().includes(search.toLowerCase()) ||
        circular.subject.toLowerCase().includes(search.toLowerCase()) ||
        circular.date.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCirculars(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  const handleView = (id) => {
    console.log(`View circular ${id}`);
    
    // Find the circular by ID
    const circular = circulars.find(c => c.id === id);
    if (!circular) {
      toast.error("Circular not found");
      return;
    }

    console.log("Circular data for view:", circular);
    console.log("Circular description:", circular.description);
    console.log("Circular body:", circular.body);
    console.log("Circular file fields:", {
      file: circular.file,
      file_path: circular.file_path,
      document: circular.document,
      attachment: circular.attachment
    });
    console.log("All circular properties:", Object.keys(circular));
    console.log("Circular values:", Object.values(circular));

    // Always show the modal first, regardless of whether there's a file or not
    setSelectedCircular(circular);
    setShowViewModal(true);
  };

  const downloadCircularFile = async (fileUrl, fileName) => {
    try {
      console.log("Attempting to download file:", fileUrl);
      console.log("File name:", fileName);
      
      // Get authentication token
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      
      if (!token || !uid) {
        toast.error("Authentication required to download files");
        return;
      }

      // Try to fetch the file with authentication headers
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Service': import.meta.env.VITE_CLIENT_SERVICE || 'COHAPPRT',
          'Auth-Key': import.meta.env.VITE_AUTH_KEY || '4F21zrjoAASqz25690Zpqf67UyY',
          'uid': uid,
          'token': token,
          'rurl': import.meta.env.VITE_RURL || 'etribes.ezcrm.site'
        }
      });

      if (!response.ok) {
        console.error("File download failed:", response.status, response.statusText);
        toast.error(`Failed to download file: ${response.status} ${response.statusText}`);
        return;
      }

      // Get the file blob
      const blob = await response.blob();
      console.log("File blob received:", blob.size, "bytes");

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'circular';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(url);
      
      toast.success("File downloaded successfully!");
    } catch (error) {
      console.error("Error downloading file:", error);
      
      // Fallback: try direct link approach
      try {
        console.log("Trying fallback download method...");
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName || 'circular';
        link.target = '_blank';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Download initiated...");
      } catch (fallbackError) {
        console.error("Fallback download also failed:", fallbackError);
        toast.error("Failed to download file. Please try again or contact support.");
      }
    }
  };

  const openCircularFile = async (circular) => {
    const filePath = circular.file || circular.file_path || circular.document || circular.attachment;
    if (!filePath) {
      toast.error("No file available for this circular");
      return;
    }

    try {
      console.log("Attempting to open circular file:", filePath);
      
      // Construct the full URL for the circular file
      const fileUrl = filePath.startsWith('http') 
        ? filePath 
        : `https://api.etribes.ezcrm.site/${filePath}`;
      
      console.log("Full file URL:", fileUrl);
      
      // Get authentication token
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      
      if (!token || !uid) {
        toast.error("Authentication required to open files");
        return;
      }
      
      // Check file extension to determine how to handle it
      const fileExtension = filePath.split('.').pop()?.toLowerCase();
      console.log("File extension:", fileExtension);
      
      if (fileExtension === 'pdf') {
        // For PDF files, try to open in new tab with authentication
        try {
          const response = await fetch(fileUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Client-Service': import.meta.env.VITE_CLIENT_SERVICE || 'COHAPPRT',
              'Auth-Key': import.meta.env.VITE_AUTH_KEY || '4F21zrjoAASqz25690Zpqf67UyY',
              'uid': uid,
              'token': token,
              'rurl': import.meta.env.VITE_RURL || 'etribes.ezcrm.site'
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            toast.success("Opening PDF circular...");
          } else {
            console.error("Failed to fetch PDF:", response.status);
            // Fallback to direct URL
            window.open(fileUrl, '_blank');
            toast.success("Opening PDF circular...");
          }
        } catch (error) {
          console.error("Error opening PDF:", error);
          // Fallback to direct URL
          window.open(fileUrl, '_blank');
          toast.success("Opening PDF circular...");
        }
      } else if (['doc', 'docx'].includes(fileExtension)) {
        // For Word documents, offer download option
        if (window.confirm("Word documents cannot be previewed in browser. Would you like to download the file?")) {
          await downloadCircularFile(fileUrl, circular.subject);
        }
      } else {
        // For other file types, try to open in new tab
        try {
          const response = await fetch(fileUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Client-Service': import.meta.env.VITE_CLIENT_SERVICE || 'COHAPPRT',
              'Auth-Key': import.meta.env.VITE_AUTH_KEY || '4F21zrjoAASqz25690Zpqf67UyY',
              'uid': uid,
              'token': token,
              'rurl': import.meta.env.VITE_RURL || 'etribes.ezcrm.site'
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            toast.success("Opening circular file...");
          } else {
            console.error("Failed to fetch file:", response.status);
            // Fallback to direct URL
            window.open(fileUrl, '_blank');
            toast.success("Opening circular file...");
          }
        } catch (error) {
          console.error("Error opening file:", error);
          // Fallback to direct URL
          window.open(fileUrl, '_blank');
          toast.success("Opening circular file...");
        }
      }
    } catch (error) {
      console.error("Error opening circular file:", error);
      toast.error("Failed to open circular file. Please try again.");
    }
  };

  const handleEdit = (id) => {
    console.log(`Edit circular ${id}`);
    
    // Find the circular by ID
    const circular = circulars.find(c => c.id === id);
    if (!circular) {
      toast.error("Circular not found");
      return;
    }

    // Populate the edit form with current data
    setEditFormData({
      id: circular.id,
      circularNumber: circular.circularNo || '',
      subject: circular.subject || '',
      body: circular.description || '',
      date: circular.date || new Date().toISOString().split('T')[0],
      file: null
    });

    setShowEditForm(true);
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['circularNumber', 'subject', 'body', 'date'];
    const missingFields = requiredFields.filter(field => !editFormData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      
      if (!token || !uid) {
        toast.error("Please log in to edit circulars");
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('id', editFormData.id);
      formData.append('circular_number', editFormData.circularNumber);
      formData.append('circular_subject', editFormData.subject);
      formData.append('circular_body', editFormData.body);
      formData.append('date', editFormData.date);
      
      // Add file if selected
      if (editFormData.file) {
        formData.append('file', editFormData.file);
      }

      console.log('Editing circular with data:', {
        id: editFormData.id,
        circular_number: editFormData.circularNumber,
        circular_subject: editFormData.subject,
        circular_body: editFormData.body,
        date: editFormData.date,
        fileName: editFormData.file?.name
      });

      const response = await api.post("/notifications/edit_circular", formData, {
        headers: {
          "Client-Service": "COHAPPRT",
          "Auth-Key": "4F21zrjoAASqz25690Zpqf67UyY",
          uid: uid,
          token: token,
          rurl: "etribes.ezcrm.site",
          "Authorization": `Bearer ${token}`,
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        withCredentials: true,
      });

      console.log('Edit response:', response.data);

      if (response.data?.status === 'success' || response.data?.message || response.data?.data) {
        // Refresh the circulars list to get the updated data
        await fetchCirculars();
        
        // Reset form
        setEditFormData({
          id: '',
          circularNumber: '',
          subject: '',
          body: '',
          date: '',
          file: null
        });
        
        setShowEditForm(false);
        toast.success("Circular updated successfully!");
      } else {
        toast.error("Update completed but response format unexpected");
      }
    } catch (err) {
      console.error('Edit error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Handle specific file size error
      if (err.response?.data?.message && err.response.data.message.includes('larger than the permitted size')) {
        toast.error("File size exceeds the server limit. Please choose a smaller file (max 10MB).");
      } else if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (err.response?.status === 413) {
        toast.error("File too large. Please select a smaller file.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Failed to update circular");
      }
    }
  };

  const handleEditFormCancel = () => {
    setShowEditForm(false);
    setEditFormData({
      id: '',
      circularNumber: '',
      subject: '',
      body: '',
      date: '',
      file: null
    });
  };

  const handleEditFormInputChange = (e) => {
    const { name, value, files } = e.target;
    
    // Handle file input with size validation
    if (files && files[0]) {
      const file = files[0];
      const maxSizeInMB = 10; // 10MB limit
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      
      if (file.size > maxSizeInBytes) {
        toast.error(`File size must be less than ${maxSizeInMB}MB. Current file size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        e.target.value = ''; // Clear the file input
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid file type (PDF, DOC, DOCX, or TXT)');
        e.target.value = ''; // Clear the file input
        return;
      }
      
      setEditFormData(prev => ({
        ...prev,
        [name]: file
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddCircular = () => {
    setShowAddForm(true);
  };

  const handleAddFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      
      if (!token || !uid) {
        toast.error("Please log in to add circular");
        return;
      }

      // Validate required fields
      if (!addFormData.circularNumber || !addFormData.subject || !addFormData.body || !addFormData.date) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('circular_subject', addFormData.subject);
      formData.append('circular_body', addFormData.body);
      formData.append('circular_number', addFormData.circularNumber);
      formData.append('date', addFormData.date);
      
      if (addFormData.file) {
        formData.append('file', addFormData.file);
      }

      console.log('Adding circular with data:', {
        subject: addFormData.subject,
        body: addFormData.body,
        circularNumber: addFormData.circularNumber,
        date: addFormData.date,
        hasFile: !!addFormData.file
      });

      const response = await api.post("/notifications/add_circular", formData, {
        headers: {
          "Client-Service": "COHAPPRT",
          "Auth-Key": "4F21zrjoAASqz25690Zpqf67UyY",
          uid: uid,
          token: token,
          rurl: "etribes.ezcrm.site",
          "Authorization": `Bearer ${token}`,
        },
        withCredentials: true,
      });

      console.log('Add circular response:', response.data);

      if (response.data.success || response.data.status === 'success') {
        toast.success("Circular added successfully!");
        setShowAddForm(false);
        setAddFormData({
          circularNumber: '',
          subject: '',
          body: '',
          date: '',
          file: null
        });
        fetchCirculars(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to add circular");
      }
    } catch (err) {
      console.error('Error adding circular:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle specific file size error
      if (err.response?.data?.message && err.response.data.message.includes('larger than the permitted size')) {
        toast.error("File size exceeds the server limit. Please choose a smaller file (max 10MB).");
      } else {
        toast.error(err.response?.data?.message || "Failed to add circular");
      }
    }
  };

  const handleAddFormCancel = () => {
    setShowAddForm(false);
    setAddFormData({
      circularNumber: '',
      subject: '',
      body: '',
      date: '',
      file: null
    });
  };

  const handleAddFormInputChange = (e) => {
    const { name, value, files } = e.target;
    
    // Handle file input with size validation
    if (files && files[0]) {
      const file = files[0];
      const maxSizeInMB = 10; // 10MB limit
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      
      if (file.size > maxSizeInBytes) {
        toast.error(`File size must be less than ${maxSizeInMB}MB. Current file size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        e.target.value = ''; // Clear the file input
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid file type (PDF, DOC, DOCX, or TXT)');
        e.target.value = ''; // Clear the file input
        return;
      }
      
      setAddFormData(prev => ({
        ...prev,
        [name]: file
      }));
    } else {
      setAddFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDelete = async (id) => {
    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to delete circular ${id}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      
      if (!token || !uid) {
        toast.error("Please log in to delete circulars");
        return;
      }

      console.log('=== DELETE CIRCULAR API CALL ===');
      console.log('Deleting circular ID:', id);
      console.log('Headers being sent:', {
        "Client-Service": "COHAPPRT",
        "Auth-Key": "4F21zrjoAASqz25690Zpqf67UyY",
        uid: uid,
        token: token,
        rurl: "etribes.ezcrm.site",
        "Authorization": `Bearer ${token}`,
      });

      // Try DELETE method first (standard REST approach)
      let response;
      try {
        response = await api.delete(`/notifications/delete_circular/${id}`, {
          headers: {
            "Client-Service": "COHAPPRT",
            "Auth-Key": "4F21zrjoAASqz25690Zpqf67UyY",
            uid: uid,
            token: token,
            rurl: "etribes.ezcrm.site",
            "Authorization": `Bearer ${token}`,
          },
          withCredentials: true,
        });
      } catch (deleteError) {
        console.log('DELETE method failed, trying POST with form data...');
        
        // If DELETE fails, try POST with form data (as shown in curl)
        const formData = new FormData();
        formData.append('circular_subject', 'Delete Request');
        formData.append('circular_body', 'Delete Request');
        formData.append('circular_number', 'DELETE');
        formData.append('date', new Date().toISOString().split('T')[0]);
        
        response = await api.post(`/notifications/delete_circular/${id}`, formData, {
          headers: {
            "Client-Service": "COHAPPRT",
            "Auth-Key": "4F21zrjoAASqz25690Zpqf67UyY",
            uid: uid,
            token: token,
            rurl: "etribes.ezcrm.site",
            "Authorization": `Bearer ${token}`,
          },
          withCredentials: true,
        });
      }

      console.log('=== DELETE CIRCULAR RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Response headers:', response.headers);

      if (response.data?.status === 'success' || response.data?.message || response.status === 200 || response.status === 204) {
        // Remove the circular from the local state
        setCirculars(prev => prev.filter(circular => circular.id !== id));
        setFilteredCirculars(prev => prev.filter(circular => circular.id !== id));
        
        toast.success("Circular deleted successfully!");
        
        // Optionally refresh the list from server
        await fetchCirculars();
      } else {
        console.log('Unexpected delete response format:', response.data);
        toast.error("Delete completed but response format unexpected");
      }
    } catch (err) {
      console.error('=== DELETE CIRCULAR ERROR ===');
      console.error('Error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (err.response?.status === 404) {
        toast.error("Circular not found or already deleted.");
      } else if (err.response?.status === 403) {
        toast.error("You don't have permission to delete this circular.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Failed to delete circular");
      }
    }
  };

  const exportToExcel = () => {
    const exportData = filteredCirculars.map((circular, index) => ({
      "Sr No": index + 1,
      "Circular No": circular.circularNo,
      Subject: circular.subject,
      Date: circular.date,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Circulars");
    XLSX.writeFile(wb, "circulars.xlsx");
    toast.success("Circulars exported to Excel!");
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Sr No", "Circular No", "Subject", "Date"],
      ...filteredCirculars.map((circular, index) => [
        index + 1,
        circular.circularNo,
        circular.subject,
        circular.date,
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "circulars.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Circulars exported to CSV!");
  };

  const copyToClipboard = () => {
    const text = filteredCirculars.map((circular, index) => 
      `${index + 1}. ${circular.circularNo} - ${circular.subject} - ${circular.date}`
    ).join("\n");
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Circulars copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  const exportToPDF = () => {
    if (!filteredCirculars.length) {
      toast.error("No data to export!");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });

      // Add title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Circulars Report", 40, 40);

      // Add date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 60);

      // Define headers
      const headers = [
        "Sr No", "Circular No", "Subject", "Date"
      ];

      // Prepare data rows
      const rows = filteredCirculars.map((circular, index) => [
        index + 1,
        circular.circularNo,
        circular.subject,
        circular.date
      ]);

      // Generate table
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 80,
        styles: { 
          fontSize: 8,
          cellPadding: 3
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Sr No
          1: { cellWidth: 50 }, // Circular No
          2: { cellWidth: 80 }, // Subject
          3: { cellWidth: 40 }  // Date
        },
        margin: { top: 80, right: 40, bottom: 40, left: 40 }
      });

      // Add summary at the bottom
      const summaryY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Summary:", 40, summaryY);
      
      doc.setFont("helvetica", "normal");
      doc.text(`Total Circulars: ${filteredCirculars.length}`, 40, summaryY + 15);
      doc.text(`Latest Circular: ${filteredCirculars[0]?.date || 'N/A'}`, 40, summaryY + 30);

      // Save the PDF
      doc.save("circulars.pdf");
      toast.success("Circulars exported to PDF!");
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("PDF export failed: " + err.message);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchCirculars();
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  // Sort circulars
  const sortedCirculars = [...filteredCirculars].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = sortedCirculars.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(sortedCirculars.length / entriesPerPage);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700 dark:text-indigo-300">Loading circulars...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Circulars</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddCircular}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
            >
              <FiFileText size={16} />
              <span>Add Circular</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiFileText className="text-indigo-600" />
              <span>Total Circulars: {circulars.length}</span>
            </div>
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
                  placeholder="Search by circular no, subject, or date..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ minWidth: '100%', maxWidth: '100%' }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                <span>Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, sortedCirculars.length)} of {sortedCirculars.length} entries</span>
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
                  onClick={copyToClipboard}
                  title="Copy to Clipboard"
                >
                  <FiCopy /> 
                  Copy
                </button>
                
                <button 
                  className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                  onClick={exportToCSV}
                  title="Export CSV"
                >
                  <FiDownload /> 
                  CSV
                </button>
                
                <button 
                  className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition"
                  onClick={exportToExcel}
                  title="Export Excel"
                >
                  <FiFile /> 
                  Excel
                </button>
                
                <button 
                  className="flex items-center gap-1 bg-rose-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-rose-600 transition"
                  onClick={exportToPDF}
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
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 min-w-32">
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                      onClick={() => {
                        copyToClipboard();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiCopy className="text-gray-500" />
                      Copy
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        exportToCSV();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiDownload className="text-green-500" />
                      CSV
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        exportToExcel();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiFile className="text-emerald-500" />
                      Excel
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                      onClick={() => {
                        exportToPDF();
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
                  <th 
                    className="p-3 font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap text-center"
                    onClick={() => handleSort("id")}
                    style={{ minWidth: '60px', width: '60px' }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Sr No
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "id" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "id" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap text-center"
                    onClick={() => handleSort("circularNo")}
                    style={{ minWidth: '120px', width: '120px' }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Circular No
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "circularNo" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "circularNo" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap text-center"
                    onClick={() => handleSort("subject")}
                    style={{ minWidth: '150px', width: '150px' }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Subject
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "subject" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "subject" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 font-semibold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap text-center"
                    onClick={() => handleSort("date")}
                    style={{ minWidth: '120px', width: '120px' }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Date
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "date" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "date" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap text-center"
                    style={{ minWidth: '120px', width: '120px' }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.map((circular, idx) => (
                  <tr 
                    key={circular.id} 
                    className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${
                      idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'
                    } hover:bg-indigo-50 dark:hover:bg-gray-700 hover:shadow-sm`}
                  >
                    <td className="p-3 text-center font-semibold text-indigo-700 dark:text-indigo-300 border-r border-gray-200 dark:border-gray-700">
                      {indexOfFirstEntry + idx + 1}
                    </td>
                    <td className="p-3 text-center border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      {circular.circularNo || 'N/A'}
                    </td>
                    <td className="p-3 text-center border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      {circular.subject || 'N/A'}
                    </td>
                    <td className="p-3 text-center border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      {circular.date || 'N/A'}
                    </td>
                    <td className="p-3 text-center border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleView(circular.id)}
                          className="p-2 text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors"
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(circular.id)}
                          className="p-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-100 rounded-full hover:bg-yellow-100 dark:hover:bg-gray-700 transition-colors"
                          title="Edit Circular"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(circular.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-100 rounded-full hover:bg-red-100 dark:hover:bg-gray-700 transition-colors"
                          title="Delete Circular"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden p-4 space-y-4">
            {currentEntries.map((circular, idx) => (
              <div key={circular.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {(circular.circularNo || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{circular.circularNo || 'N/A'}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{circular.subject || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{circular.subject || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{circular.date || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-row items-center justify-between gap-4 p-6 border-t border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, sortedCirculars.length)} of {sortedCirculars.length} entries
              </p>
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

      {/* Edit Circular Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Circular</h2>
              <button
                onClick={handleEditFormCancel}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditFormSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Circular Number
                    </label>
                    <input
                      type="text"
                      name="circularNumber"
                      value={editFormData.circularNumber}
                      onChange={handleEditFormInputChange}
                      placeholder="Enter circular number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={editFormData.subject}
                      onChange={handleEditFormInputChange}
                      placeholder="Enter circular subject"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={editFormData.date}
                      onChange={handleEditFormInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Body/Content
                    </label>
                    <textarea
                      name="body"
                      value={editFormData.body}
                      onChange={handleEditFormInputChange}
                      placeholder="Enter circular content"
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload File (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        name="file"
                        onChange={handleEditFormInputChange}
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        id="editCircularFile"
                      />
                      <label
                        htmlFor="editCircularFile"
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                      >
                        Choose File
                      </label>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {editFormData.file ? editFormData.file.name : "No file chosen"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, TXT
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleEditFormCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Circular Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Circular</h2>
              <button
                onClick={handleAddFormCancel}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddFormSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Circular Number
                    </label>
                    <input
                      type="text"
                      name="circularNumber"
                      value={addFormData.circularNumber}
                      onChange={handleAddFormInputChange}
                      placeholder="Enter circular number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={addFormData.subject}
                      onChange={handleAddFormInputChange}
                      placeholder="Enter circular subject"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={addFormData.date}
                      onChange={handleAddFormInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Body/Content
                    </label>
                    <textarea
                      name="body"
                      value={addFormData.body}
                      onChange={handleAddFormInputChange}
                      placeholder="Enter circular content"
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload File (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        name="file"
                        onChange={handleAddFormInputChange}
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        id="addCircularFile"
                      />
                      <label
                        htmlFor="addCircularFile"
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                      >
                        Choose File
                      </label>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {addFormData.file ? addFormData.file.name : "No file chosen"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, TXT
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleAddFormCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Circular Details Modal */}
      {showViewModal && selectedCircular && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  <FiFileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Circular Details</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View complete circular information</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCircular(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    <FiFileText className="inline mr-2" />
                    Circular Number
                  </label>
                  <p className="text-blue-900 dark:text-blue-100 font-semibold text-lg">
                    #{selectedCircular.circularNo}
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                    <FiCalendar className="inline mr-2" />
                    Date
                  </label>
                  <p className="text-green-900 dark:text-green-100 font-semibold text-lg">
                    {new Date(selectedCircular.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              {/* Subject */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                  <FiFileText className="inline mr-2" />
                  Subject
                </label>
                <p className="text-purple-900 dark:text-purple-100 font-semibold text-lg">
                  {selectedCircular.subject}
                </p>
              </div>
              
              {/* Description */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiFileText className="inline mr-2" />
                  Description
                </label>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                    {(() => {
                      console.log("Modal rendering - selectedCircular:", selectedCircular);
                      console.log("Modal rendering - description:", selectedCircular.description);
                      console.log("Modal rendering - body:", selectedCircular.body);
                      return selectedCircular.description || selectedCircular.body || 'No description available';
                    })()}
                  </p>
                </div>
              </div>
              
              {/* File Attachment Section */}
              {(() => {
                const filePath = selectedCircular.file || selectedCircular.file_path || selectedCircular.document || selectedCircular.attachment;
                console.log("Modal file attachment check:", {
                  file: selectedCircular.file,
                  file_path: selectedCircular.file_path,
                  document: selectedCircular.document,
                  attachment: selectedCircular.attachment,
                  finalPath: filePath
                });
                return filePath;
              })() ? (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white">
                      <FiFile size={20} />
                    </div>
                    <div>
                      <span className="text-blue-800 dark:text-blue-200 font-semibold text-lg">
                        File Attachment Available
                      </span>
                      <p className="text-blue-600 dark:text-blue-300 text-sm">
                        Click to open the attached document
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={async () => await openCircularFile(selectedCircular)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FiEye size={18} />
                    Open File
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
                      <FiFileText size={20} />
                    </div>
                    <div>
                      <span className="text-yellow-800 dark:text-yellow-200 font-semibold text-lg">
                        Text-Only Circular
                      </span>
                      <p className="text-yellow-600 dark:text-yellow-300 text-sm">
                        This circular contains only text content. No downloadable file is attached.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {(() => {
                const filePath = selectedCircular.file || selectedCircular.file_path || selectedCircular.document || selectedCircular.attachment;
                return filePath;
              })() && (
                <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                    File: {selectedCircular.file || selectedCircular.file_path || selectedCircular.document || selectedCircular.attachment}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCircular(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 