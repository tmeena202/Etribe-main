import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import {
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiFile,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiUser,
  FiCalendar,
  FiTag,
  FiMessageSquare,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function GrievancesActive() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [filteredGrievances, setFilteredGrievances] = useState([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const toastShownRef = useRef(false);

  useEffect(() => {
    fetchGrievances();
  }, []);

  useEffect(() => {
    filterGrievances();
  }, [grievances, searchTerm]);

  const fetchGrievances = async () => {
    try {
      // Reset toast flag at the start of each fetch
      toastShownRef.current = false;
      
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      
      if (!token) {
        toast.error("Please log in to view grievances");
        window.location.href = "/";
        return;
      }

      console.log('Fetching active grievances with credentials:', { uid, token });
      
      const response = await api.get("/grievances/activegrievances", {
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
      
      console.log('Active Grievances API response:', response.data);
      console.log('Response status:', response.status);
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', Object.keys(response.data || {}));
      
      // Handle the API response data
      console.log('Full API response structure:', response.data);
      
      let mappedGrievances = [];
      let grievancesFound = false;
      
      // Based on your console logs, the structure is {status: 200, grievances: Array(1)}
      if (response.data && response.data.grievances && Array.isArray(response.data.grievances)) {
        const apiGrievances = response.data.grievances;
        console.log('Found grievances array with', apiGrievances.length, 'items');
        
        mappedGrievances = apiGrievances.map((grievance, index) => {
          console.log(`Mapping grievance ${index + 1}:`, grievance);
          
          return {
            id: grievance.id || index + 1,
            title: grievance.subject || '',
            description: grievance.description || '',
            status: grievance.status || '',
            submittedBy: grievance.posted_by || '',
            submittedDate: grievance.created_at || '',
            lastUpdated: grievance.updated_at || '',
            file: grievance.file || ''
          };
        });
        grievancesFound = true;
      } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        console.log('Response is a single object:', response.data);
        const grievance = response.data;
        mappedGrievances = [{
          id: grievance.id || 1,
          title: grievance.subject || '',
          description: grievance.description || '',
          status: grievance.status || '',
          submittedBy: grievance.posted_by || '',
          submittedDate: grievance.created_at || '',
          lastUpdated: grievance.updated_at || '',
          file: grievance.file || ''
        }];
        grievancesFound = true;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        const apiGrievances = response.data.data;
        console.log('Found grievances array with', apiGrievances.length, 'items');
        
        mappedGrievances = apiGrievances.map((grievance, index) => {
          console.log(`Mapping grievance ${index + 1}:`, grievance);
          
          return {
            id: grievance.id || index + 1,
            title: grievance.subject || '',
            description: grievance.description || '',
            status: grievance.status || '',
            submittedBy: grievance.posted_by || '',
            submittedDate: grievance.created_at || '',
            lastUpdated: grievance.updated_at || '',
            file: grievance.file || ''
          };
        });
        grievancesFound = true;
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback: if data is directly in response.data
        const apiGrievances = response.data;
        console.log('Found grievances array with', apiGrievances.length, 'items');
        
        mappedGrievances = apiGrievances.map((grievance, index) => {
          console.log(`Mapping grievance ${index + 1}:`, grievance);
          
          return {
            id: grievance.id || index + 1,
            title: grievance.subject || '',
            description: grievance.description || '',
            status: grievance.status || '',
            submittedBy: grievance.posted_by || '',
            submittedDate: grievance.created_at || '',
            lastUpdated: grievance.updated_at || '',
            file: grievance.file || ''
          };
        });
        grievancesFound = true;
      } else if (response.data && typeof response.data === 'object') {
        // Check if data is nested differently
        console.log('Response data is an object, checking for nested arrays...');
        console.log('All keys in response.data:', Object.keys(response.data));
        
        // Look for any array in the response
        const allKeys = Object.keys(response.data);
        let foundArray = null;
        
        for (const key of allKeys) {
          if (Array.isArray(response.data[key])) {
            console.log(`Found array in key: ${key} with ${response.data[key].length} items`);
            foundArray = response.data[key];
            break;
          }
        }
        
        if (foundArray) {
          console.log('Processing found array:', foundArray);
          mappedGrievances = foundArray.map((grievance, index) => {
            console.log(`Mapping grievance ${index + 1}:`, grievance);
            
            return {
              id: grievance.id || index + 1,
              title: grievance.subject || '',
              description: grievance.description || '',
              status: grievance.status || '',
              submittedBy: grievance.posted_by || '',
              submittedDate: grievance.created_at || '',
              lastUpdated: grievance.updated_at || '',
              file: grievance.file || ''
            };
          });
          grievancesFound = true;
        } else {
          // No data found in API response
          console.log('No array found in response.data');
          console.log('Available keys in response.data:', Object.keys(response.data || {}));
          setGrievances([]);
          if (!toastShownRef.current) {
            toast.info("No active grievances found in the system.");
            toastShownRef.current = true;
          }
        }
      } else {
        // No data found in API response
        console.log('No data found in API response');
        console.log('Available keys in response.data:', Object.keys(response.data || {}));
        setGrievances([]);
        if (!toastShownRef.current) {
          toast.info("No active grievances found in the system.");
          toastShownRef.current = true;
        }
      }
      
      // Set grievances and show success message only once
      if (grievancesFound && !toastShownRef.current) {
        setGrievances(mappedGrievances);
        console.log('Final mapped active grievances:', mappedGrievances);
        toast.success(`Loaded ${mappedGrievances.length} active grievances successfully`);
        toastShownRef.current = true;
      }
    } catch (err) {
      console.error('Error fetching active grievances:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      } else if (err.response?.status === 404) {
        toast.error("Active grievances endpoint not found. Please check the API configuration.");
        setGrievances([]);
      } else {
        toast.error(err.response?.data?.message || err.message || "Failed to fetch active grievances");
        setGrievances([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterGrievances = () => {
    const filtered = grievances.filter(
      (grievance) =>
        (grievance.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (grievance.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (grievance.submittedBy || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (grievance.status || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGrievances(filtered);
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Pending: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full ${
          statusClasses[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {status}
      </span>
    );
  };

  const handleView = (grievance) => {
    setSelectedGrievance(grievance);
    setShowViewModal(true);
  };

  const handleEdit = (grievance) => {
    console.log("Edit grievance:", grievance);
    toast.info("Edit functionality to be implemented");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this grievance?")) {
      try {
        setGrievances(grievances.filter(grievance => grievance.id !== id));
        toast.success("Grievance deleted successfully");
      } catch (err) {
        toast.error("Failed to delete grievance");
      }
    }
  };

  const handleStatusUpdate = async (grievanceId, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      
      console.log('Status Update - Starting with:', { grievanceId, newStatus, token, uid });
      
      if (!token) {
        toast.error("Please log in to update grievance status");
        return;
      }

      // Format the request body as a JSON string to match the curl command format
      const requestBody = JSON.stringify({
        id: grievanceId.toString(),
        status: newStatus
      });

      const requestHeaders = {
        "Client-Service": "COHAPPRT",
        "Auth-Key": "4F21zrjoAASqz25690Zpqf67UyY",
        uid: uid || '1',
        token: token,
        rurl: "etribes.ezcrm.site",
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain",
      };

      console.log('Status Update - Request body (string):', requestBody);
      console.log('Status Update - Request headers:', requestHeaders);

      const response = await api.post("grievances/update_status", requestBody, {
        headers: requestHeaders,
      });

      console.log('Status Update - Full response:', response);
      console.log('Status Update - Response status:', response.status);
      console.log('Status Update - Response data:', response.data);

      if (response.data?.status === 'success') {
        // Close the modal first
        setShowViewModal(false);
        setSelectedGrievance(null);
        
        // Refresh the data to get the latest state from backend
        await fetchGrievances();
        
        toast.success(`Status updated to ${newStatus} successfully`);
      } else {
        console.log('Status Update - Response status not success:', response.data);
        toast.error(response.data?.message || "Failed to update status");
      }
    } catch (err) {
      console.error('Status Update - Error details:', err);
      console.error('Status Update - Error response:', err.response);
      console.error('Status Update - Error message:', err.message);
      
      if (err.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else if (err.response?.status === 404) {
        toast.error("Grievance not found or update endpoint not available.");
      } else if (err.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(err.response?.data?.message || "Failed to update status. Please check your connection.");
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchGrievances();
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  const exportToExcel = () => {
    const exportData = filteredGrievances.map((grievance, index) => ({
      "S.No": index + 1,
      Title: grievance.title || 'N/A',
      Status: grievance.status || 'N/A',
      "Submitted By": grievance.submittedBy || 'N/A',
      "Submitted Date": grievance.submittedDate || 'N/A',
      "Last Updated": grievance.lastUpdated || 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Active Grievances");
    XLSX.writeFile(wb, "active_grievances.xlsx");
    toast.success("Active grievances exported to Excel!");
  };

  const exportToCSV = () => {
    const csvContent = [
      ["S.No", "Title", "Status", "Submitted By", "Submitted Date", "Last Updated"],
      ...filteredGrievances.map((grievance, index) => [
        index + 1,
        grievance.title || 'N/A',
        grievance.status || 'N/A',
        grievance.submittedBy || 'N/A',
        grievance.submittedDate || 'N/A',
        grievance.lastUpdated || 'N/A',
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "active_grievances.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Active grievances exported to CSV!");
  };

  const copyToClipboard = () => {
    const text = filteredGrievances.map((grievance, index) => 
      `${index + 1}. ${grievance.title || 'N/A'} - ${grievance.status || 'N/A'} - ${grievance.submittedBy || 'N/A'}`
    ).join("\n");
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Active grievances copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  const exportToPDF = () => {
    if (!filteredGrievances.length) {
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
      doc.text("Active Grievances Report", 40, 40);

      // Add date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 60);

      // Define headers
      const headers = [
        "S.No", "Title", "Status", "Submitted By", "Submitted Date", "Last Updated"
      ];

      // Prepare data rows
      const rows = filteredGrievances.map((grievance, index) => [
        index + 1,
        grievance.title || 'N/A',
        grievance.status || 'N/A',
        grievance.submittedBy || 'N/A',
        grievance.submittedDate || 'N/A',
        grievance.lastUpdated || 'N/A'
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
          0: { cellWidth: 30 }, // S.No
          1: { cellWidth: 80 }, // Title
          2: { cellWidth: 40 }, // Status
          3: { cellWidth: 60 }, // Submitted By
          4: { cellWidth: 50 }, // Submitted Date
          5: { cellWidth: 50 }  // Last Updated
        },
        margin: { top: 80, right: 40, bottom: 40, left: 40 }
      });

      // Add summary at the bottom
      const summaryY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Summary:", 40, summaryY);
      
      doc.setFont("helvetica", "normal");
      doc.text(`Total Active Grievances: ${filteredGrievances.length}`, 40, summaryY + 15);
      doc.text(`Active: ${filteredGrievances.filter(g => g.status === 'Active').length}`, 40, summaryY + 30);
      doc.text(`Pending: ${filteredGrievances.filter(g => g.status === 'Pending').length}`, 40, summaryY + 45);
      doc.text(`Closed: ${filteredGrievances.filter(g => g.status === 'Closed').length}`, 40, summaryY + 60);

      // Save the PDF
      doc.save("active_grievances.pdf");
      toast.success("Active grievances exported to PDF!");
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("PDF export failed: " + err.message);
    }
  };

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredGrievances.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredGrievances.length / entriesPerPage);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700 dark:text-indigo-300">Loading active grievances...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 py-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-green-600">Active Grievances</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track all active grievance complaints</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FiAlertTriangle className="text-green-600" />
              <span>Total Active: {grievances.length}</span>
            </div>
            <button 
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
              onClick={handleRefresh}
              title="Refresh Data"
            >
              <FiRefreshCw /> 
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search and Export Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search grievances by title, description, category..."
                  className="pl-10 pr-4 py-3 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-green-400 transition-colors w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredGrievances.length)} of {filteredGrievances.length} entries</span>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap gap-2 items-center">
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
              
              {/* Mobile Export Dropdown */}
              <div className="relative xl:hidden">
                <button
                  className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
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
        </div>

        {/* Grievances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentEntries.map((grievance, idx) => (
            <div key={grievance.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
              {/* Compact Header */}
              <div className="p-4 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2 line-clamp-2 leading-tight">
                      {grievance.title || 'Untitled Grievance'}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(grievance.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <button
                      onClick={() => handleView(grievance)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="View Details"
                    >
                      <FiEye size={14} />
                    </button>
                    <button
                      onClick={() => handleEdit(grievance)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                      title="Edit"
                    >
                      <FiEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(grievance.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                
                {/* Brief Description */}
                <div className="mb-3">
                  <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed">
                    {grievance.description ? 
                      grievance.description.replace(/<[^>]*>/g, '').trim().substring(0, 80) + (grievance.description.length > 80 ? '...' : '') || 'No description' 
                      : 'No description'}
                  </p>
                </div>
                
                {/* File Attachment Indicator */}
                {grievance.file && (
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">📎 Attachment</span>
                  </div>
                )}
              </div>

              {/* Compact Details - Always at bottom */}
              <div className="px-4 pb-4 space-y-2 mt-auto">
                <div className="flex items-center gap-2 text-xs">
                  <FiUser className="text-gray-400 flex-shrink-0 w-3 h-3" />
                  <span className="text-gray-600 dark:text-gray-400">By:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate flex-1">{grievance.submittedBy || 'N/A'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <FiCalendar className="text-gray-400 flex-shrink-0 w-3 h-3" />
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate flex-1">
                    {grievance.submittedDate ? new Date(grievance.submittedDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {currentEntries.length === 0 && !loading && (
          <div className="text-center py-12">
            <FiAlertTriangle className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No grievances found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'No grievances match your search criteria.' : 'No active grievances at the moment.'}
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredGrievances.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
                <select
                  className="border rounded-lg px-3 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 text-gray-700 focus:ring-2 focus:ring-green-400 transition-colors"
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
                  className={`p-2 rounded-lg text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-gray-700 transition-colors ${
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
                  className={`p-2 rounded-lg text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-gray-700 transition-colors ${
                    currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Next"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Grievance Modal */}
        {showViewModal && selectedGrievance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Grievance Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Grievance Information */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Grievance Information
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Title:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 break-words max-w-xs text-right">
                          {selectedGrievance.title || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedGrievance.status}
                            onChange={(e) => handleStatusUpdate(selectedGrievance.id, e.target.value)}
                            disabled={isUpdatingStatus}
                            className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="Active">🟢 Active</option>
                            <option value="Pending">🟡 Pending</option>
                            <option value="Closed">🔴 Closed</option>
                          </select>
                          {isUpdatingStatus && (
                            <FiRefreshCw className="animate-spin text-green-600 text-xs" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted By:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100 break-words max-w-xs text-right">
                          {selectedGrievance.submittedBy || 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted Date:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedGrievance.submittedDate ? 
                            new Date(selectedGrievance.submittedDate).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {selectedGrievance.lastUpdated ? 
                            new Date(selectedGrievance.lastUpdated).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attachment Image */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Attachment
                    </h4>
                    
                    {selectedGrievance.file ? (
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <img 
                          src={`https://api.etribes.ezcrm.site/${selectedGrievance.file}`} 
                          alt="Grievance Attachment" 
                          className="w-full h-auto max-h-96 object-contain bg-gray-50 dark:bg-gray-700"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="items-center justify-center h-48 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400" style={{ display: 'none' }}>
                          <div className="text-center">
                            <FiFile className="mx-auto text-4xl mb-2" />
                            <p>Image not available</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <FiFile className="mx-auto text-4xl mb-2" />
                          <p>No attachment available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Description Section */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Description
                  </h4>
                  <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-60 overflow-y-auto">
                    {selectedGrievance.description ? 
                      selectedGrievance.description
                        .replace(/<[^>]*>/g, '') // Remove HTML tags
                        .replace(/\n/g, '<br />') // Convert newlines to HTML breaks
                        .split('<br />')
                        .map((line, index) => (
                          <p key={index} className="mb-2 last:mb-0">
                            {line.trim() || '\u00A0'} {/* Use non-breaking space for empty lines */}
                          </p>
                        ))
                      : 'No description available'}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 