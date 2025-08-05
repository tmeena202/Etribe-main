import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import {
  FiSearch,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiCopy,
  FiFile,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Resume() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    fullName: "",
    emailAddress: "",
    contactNumber: "",
    qualification: "",
    skills: "",
    experience: "",
    resumeFile: null
  });

  useEffect(() => {
    fetchResumes();
  }, []);

  useEffect(() => {
    filterResumes();
  }, [resumes, searchTerm]);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      
      if (!token) {
        toast.error("Please log in to view resumes");
        window.location.href = "/";
        return;
      }

      console.log('Fetching resumes with credentials:', { uid, token });
      
      const response = await api.post("/resume", {}, {
        headers: {
          "Client-Service": "COHAPPRT",
          "Auth-Key": "4F21zrjoAASqz25690Zpqf67UyY",
          uid: uid || '1',
          token: token,
          rurl: "etribes.ezcrm.site",
          "Content-Type": "application/json",
        },
      });
      
      console.log('Resume API response:', response.data);
      
      // Debug: Log the structure of each resume object
      if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('Individual resume objects:');
        response.data.data.forEach((resume, index) => {
          console.log(`Resume ${index + 1}:`, {
            id: resume.id,
            name: resume.name,
            contact: resume.contact,
            email_id: resume.email_id,
            qualification: resume.qualification,
            skill: resume.skill,
            skills: resume.skills,
            experience: resume.experience,
            uploaded_on: resume.uploaded_on,
            resume_file: resume.resume_file,
            // Log all keys to see what's actually available
            allKeys: Object.keys(resume)
          });
        });
      }
      
      // Handle the API response data
      if (response.data?.data) {
        // If the API returns data in response.data.data format
        const apiResumes = response.data.data;
        const mappedResumes = Array.isArray(apiResumes) ? apiResumes.map((resume, index) => {
          // Debug each resume mapping
          console.log(`Mapping resume ${index + 1}:`, {
            original: resume,
            mappedSkills: resume.skill || resume.skills || resume.skill_set || resume.skill_set || ''
          });
          
          return {
            id: resume.id || index + 1,
            name: resume.name || resume.full_name || resume.fullName || '',
            contactNo: resume.contact_no || resume.contactNo || resume.contact || '',
            emailId: resume.email_id || resume.emailId || resume.email || '',
            qualification: resume.qualification || '',
            skills: (resume.skill || resume.skills || resume.skill_set || '') || '',  // Handle null values
            experience: resume.experience || '',
            uploadedOn: resume.uploaded_on || resume.uploadedOn || resume.created_at || new Date().toISOString().split('T')[0],
            resumeFile: resume.resume_file || resume.resumeFile || resume.file || ''
          };
        }) : [];
        
        setResumes(mappedResumes);
        console.log('Final mapped resumes:', mappedResumes);
      } else if (response.data) {
        // If the API returns data directly in response.data
        const apiResumes = Array.isArray(response.data) ? response.data : [response.data];
        const mappedResumes = apiResumes.map((resume, index) => {
          // Debug each resume mapping
          console.log(`Mapping resume ${index + 1}:`, {
            original: resume,
            mappedSkills: resume.skill || resume.skills || resume.skill_set || ''
          });
          
          return {
            id: resume.id || index + 1,
            name: resume.name || resume.full_name || resume.fullName || '',
            contactNo: resume.contact_no || resume.contactNo || resume.contact || '',
            emailId: resume.email_id || resume.emailId || resume.email || '',
            qualification: resume.qualification || '',
            skills: (resume.skill || resume.skills || resume.skill_set || '') || '',  // Handle null values
            experience: resume.experience || '',
            uploadedOn: resume.uploaded_on || resume.uploadedOn || resume.created_at || new Date().toISOString().split('T')[0],
            resumeFile: resume.resume_file || resume.resumeFile || resume.file || ''
          };
        });
        
        setResumes(mappedResumes);
        console.log('Final mapped resumes:', mappedResumes);
      } else {
        // No data found in API response
        console.log('No data found in API response');
        setResumes([]);
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      } else if (err.response?.status === 404) {
        toast.error("Resume endpoint not found. Please check the API configuration.");
      } else {
      toast.error(err.response?.data?.message || err.message || "Failed to fetch resumes");
      }
      
      // Set empty array on error instead of mock data
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const filterResumes = () => {
    const filtered = resumes.filter(
      (resume) =>
        resume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.contactNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.emailId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.qualification.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.experience.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResumes(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  const exportToExcel = () => {
    const exportData = filteredResumes.map((resume, index) => ({
      "Sr No": index + 1,
      Name: resume.name,
      "Contact No": resume.contactNo,
      "Email Id": resume.emailId,
      Qualification: resume.qualification,
      Skills: resume.skills,
      Experience: resume.experience,
      "Uploaded On": resume.uploadedOn,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resumes");
    XLSX.writeFile(wb, "resumes.xlsx");
    toast.success("Resumes exported to Excel!");
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Sr No", "Name", "Contact No", "Email Id", "Qualification", "Skills", "Experience", "Uploaded On"],
      ...filteredResumes.map((resume, index) => [
        index + 1,
        resume.name,
        resume.contactNo,
        resume.emailId,
        resume.qualification,
        resume.skills,
        resume.experience,
        resume.uploadedOn,
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "resumes.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Resumes exported to CSV!");
  };

  const copyToClipboard = () => {
    const text = filteredResumes.map((resume, index) => 
      `${index + 1}. ${resume.name} - ${resume.contactNo} - ${resume.emailId} - ${resume.qualification} - ${resume.skills} - ${resume.experience} - ${resume.uploadedOn}`
    ).join("\n");
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Resumes copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  const exportToPDF = () => {
    if (!filteredResumes.length) {
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
      doc.text("Resume Management Report", 40, 40);

      // Add date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 60);

      // Define headers
      const headers = [
        "Sr No", "Name", "Contact No", "Email Id", "Qualification", "Skills", "Experience", "Uploaded On"
      ];

      // Prepare data rows
      const rows = filteredResumes.map((resume, index) => [
        index + 1,
        resume.name,
        resume.contactNo,
        resume.emailId,
        resume.qualification,
        resume.skills,
        resume.experience,
        resume.uploadedOn
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
          1: { cellWidth: 50 }, // Name
          2: { cellWidth: 50 }, // Contact No
          3: { cellWidth: 60 }, // Email Id
          4: { cellWidth: 40 }, // Qualification
          5: { cellWidth: 40 }, // Skills
          6: { cellWidth: 40 }, // Experience
          7: { cellWidth: 40 }  // Uploaded On
        },
        margin: { top: 80, right: 40, bottom: 40, left: 40 }
      });

      // Add summary at the bottom
      const summaryY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Summary:", 40, summaryY);
      
      doc.setFont("helvetica", "normal");
      doc.text(`Total Resumes: ${filteredResumes.length}`, 40, summaryY + 15);
      doc.text(`Latest Upload: ${filteredResumes[0]?.uploadedOn || 'N/A'}`, 40, summaryY + 30);

      // Save the PDF
      doc.save("resumes.pdf");
      toast.success("Resumes exported to PDF!");
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("PDF export failed: " + err.message);
    }
  };

  const handleUploadResume = () => {
    setShowUploadForm(true);
  };

  const handleFormInputChange = (e) => {
    const { name, value, files } = e.target;
    setUploadFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['fullName', 'emailAddress', 'contactNumber', 'qualification', 'skills', 'experience'];
    const missingFields = requiredFields.filter(field => !uploadFormData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!uploadFormData.resumeFile) {
      toast.error("Please select a resume file");
      return;
    }

    // Additional validation for skills
    if (!uploadFormData.skills || uploadFormData.skills.trim() === '') {
      toast.error("Please enter your skills");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      
      if (!token || !uid) {
        toast.error("Please log in to upload resumes");
        return;
      }

      // Create FormData for file upload with correct field names
      const formData = new FormData();
      formData.append('resume_file', uploadFormData.resumeFile);
      formData.append('name', uploadFormData.fullName);
      formData.append('contact', uploadFormData.contactNumber);
      formData.append('email_id', uploadFormData.emailAddress);
      formData.append('qualification', uploadFormData.qualification);
      formData.append('skill', uploadFormData.skills);  // Make sure this is not empty
      formData.append('skills', uploadFormData.skills); // Try alternative field name
      formData.append('experience', uploadFormData.experience);

      const response = await api.post("/resume/add", formData, {
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

      if (response.data?.status === 'success' || response.data?.message || response.data?.data) {
        // Refresh the resume list to get the updated data
        await fetchResumes();
      
        // Reset form
        setUploadFormData({
          fullName: "",
          emailAddress: "",
          contactNumber: "",
          qualification: "",
          skills: "",
          experience: "",
          resumeFile: null
        });
        
        setShowUploadForm(false);
        toast.success("Resume uploaded successfully!");
      } else {
        toast.error("Upload completed but response format unexpected");
      }
    } catch (err) {
      console.error('Upload error:', err);
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (err.response?.status === 413) {
        toast.error("File too large. Please select a smaller file.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Failed to upload resume");
      }
    }
  };

  const handleFormCancel = () => {
    setShowUploadForm(false);
    setUploadFormData({
      fullName: "",
      emailAddress: "",
      contactNumber: "",
      qualification: "",
      skills: "",
      experience: "",
      resumeFile: null
    });
  };

  const handleViewResume = (resume) => {
    if (!resume.resumeFile) {
      toast.error("No resume file available to view");
      return;
    }

    try {
      const fileUrl = resume.resumeFile.startsWith('http') 
        ? resume.resumeFile 
        : `https://api.etribes.ezcrm.site/${resume.resumeFile}`;
      
      const fileExtension = resume.resumeFile.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'pdf') {
        window.open(fileUrl, '_blank');
        toast.success("Opening PDF resume...");
      } else if (['doc', 'docx'].includes(fileExtension)) {
        if (window.confirm("Word documents cannot be previewed in browser. Would you like to download the file?")) {
          downloadResumeFile(fileUrl, resume.name);
        }
      } else {
        window.open(fileUrl, '_blank');
        toast.success("Opening resume file...");
      }
    } catch (error) {
      console.error("Error opening resume file:", error);
      toast.error("Failed to open resume file. Please try again.");
    }
  };

  const handleViewResumeWithOptions = (resume, event) => {
    event.preventDefault();
    
    if (!resume.resumeFile) {
      toast.error("No resume file available to view");
      return;
    }

    const fileUrl = resume.resumeFile.startsWith('http') 
      ? resume.resumeFile 
      : `https://api.etribes.ezcrm.site/${resume.resumeFile}`;
    
    const fileExtension = resume.resumeFile.split('.').pop()?.toLowerCase();
    
    const options = [];
    
    if (fileExtension === 'pdf') {
      options.push('View in Browser');
    }
    options.push('Download File');
    
    const choice = window.confirm(
      `Choose an action for ${resume.name}'s resume:\n\n` +
      options.map((opt, index) => `${index + 1}. ${opt}`).join('\n') +
      '\n\nClick OK for first option, Cancel for second option.'
    );
    
    if (choice) {
      if (fileExtension === 'pdf') {
        window.open(fileUrl, '_blank');
        toast.success("Opening PDF resume...");
      } else {
        downloadResumeFile(fileUrl, resume.name);
      }
    } else {
      downloadResumeFile(fileUrl, resume.name);
    }
  };

  const downloadResumeFile = (fileUrl, fileName) => {
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'resume';
      link.target = '_blank';
      
      const token = localStorage.getItem("token");
      if (token) {
        link.setAttribute('data-token', token);
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Downloading resume file...");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resume?")) {
      try {
        const token = localStorage.getItem("token");
        const uid = localStorage.getItem("uid");
        
        if (!token || !uid) {
          toast.error("Please log in to delete resumes");
          return;
        }

        const response = await api.post(`/resume/delete`, { id }, {
          headers: {
            "Client-Service": "COHAPPRT",
            "Auth-Key": "4F21zrjoAASqz25690Zpqf67UyY",
            uid: uid,
            token: token,
            rurl: "etribes.ezcrm.site",
            "Content-Type": "application/json",
          },
        });

        if (response.data?.status === 'success' || response.data?.message) {
          setResumes(resumes.filter(resume => resume.id !== id));
          toast.success("Resume deleted successfully");
        } else {
          toast.error("Delete completed but response format unexpected");
        }
      } catch (err) {
        console.error('Delete error:', err);
        
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
        } else {
          toast.error("Failed to delete resume");
        }
      }
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchResumes();
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  // Sort resumes
  const sortedResumes = [...filteredResumes].sort((a, b) => {
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
  const currentEntries = sortedResumes.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(sortedResumes.length / entriesPerPage);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700 dark:text-indigo-300">Loading resumes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Resume</h1>
          <button
            onClick={handleUploadResume}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <FiUpload className="text-xs sm:text-sm" />
            <span className="text-xs sm:text-sm">Upload Resume</span>
          </button>
        </div>    

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 max-w-7xl w-full mx-auto">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Show
                </label>
                <select
                  value={entriesPerPage}
                  onChange={handleEntriesChange}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
              </div>
              <div className="flex items-center gap-2">
                <FiSearch className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
              
              {/* Desktop Export Buttons */}
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
                    className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    onClick={() => handleSort("id")}
                    style={{ minWidth: '60px', width: '60px' }}
                  >
                    <div className="flex items-center gap-1">
                      Sr No
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "id" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "id" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
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
                    className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    onClick={() => handleSort("contactNo")}
                    style={{ minWidth: '120px', width: '120px' }}
                  >
                    <div className="flex items-center gap-1">
                      Contact No
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "contactNo" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "contactNo" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    onClick={() => handleSort("emailId")}
                    style={{ minWidth: '150px', width: '150px' }}
                  >
                    <div className="flex items-center gap-1">
                      Email Id
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "emailId" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "emailId" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    onClick={() => handleSort("qualification")}
                    style={{ minWidth: '120px', width: '120px' }}
                  >
                    <div className="flex items-center gap-1">
                      Qualification
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "qualification" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "qualification" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    onClick={() => handleSort("skills")}
                    style={{ minWidth: '120px', width: '120px' }}
                  >
                    <div className="flex items-center gap-1">
                      Skills
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "skills" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "skills" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    onClick={() => handleSort("experience")}
                    style={{ minWidth: '100px', width: '100px' }}
                  >
                    <div className="flex items-center gap-1">
                      Experience
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "experience" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "experience" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    onClick={() => handleSort("uploadedOn")}
                    style={{ minWidth: '120px', width: '120px' }}
                  >
                    <div className="flex items-center gap-1">
                      Uploaded On
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortField === "uploadedOn" && sortDirection === "asc" ? "text-indigo-600" : "text-gray-400"}`}>▲</span>
                        <span className={`text-xs ${sortField === "uploadedOn" && sortDirection === "desc" ? "text-indigo-600" : "text-gray-400"}`}>▼</span>
                      </div>
                    </div>
                  </th>
                  <th className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap" style={{ minWidth: '80px', width: '80px' }}>
                    View
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.map((resume, idx) => (
                  <tr 
                    key={resume.id} 
                    className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${
                      idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'
                    } hover:bg-indigo-50 dark:hover:bg-gray-700 hover:shadow-sm`}
                  >
                    <td className="p-3 text-center font-semibold text-indigo-700 dark:text-indigo-300 border-r border-gray-200 dark:border-gray-700">
                      {indexOfFirstEntry + idx + 1}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {resume.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{resume.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      {resume.contactNo}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      {resume.emailId}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      {resume.qualification}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      {resume.skills}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      {resume.experience}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      {resume.uploadedOn}
                    </td>
                    <td className="p-3 text-center border-r border-gray-200 dark:border-gray-700">
                      <button
                        onClick={(e) => handleViewResumeWithOptions(resume, e)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="View Resume"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden p-4 space-y-4">
            {currentEntries.map((resume, idx) => (
              <div key={resume.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {resume.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{resume.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{resume.contactNo}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleViewResumeWithOptions(resume, e)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="View Resume"
                  >
                    <FiEye size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{resume.emailId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Qualification:</span>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{resume.qualification}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Skills:</span>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{resume.skills}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Experience:</span>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{resume.experience}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">Uploaded On:</span>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{resume.uploadedOn}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-row items-center justify-between gap-4 p-6 border-t border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, sortedResumes.length)} of {sortedResumes.length} entries
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

      {/* Upload Resume Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Resume</h2>
              <button
                onClick={handleFormCancel}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
           
            <form onSubmit={handleFormSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={uploadFormData.fullName}
                      onChange={handleFormInputChange}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Email Address
                    </label>
                    <input
                      type="email"
                      name="emailAddress"
                      value={uploadFormData.emailAddress}
                      onChange={handleFormInputChange}
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Skills
                    </label>
                    <textarea
                      name="skills"
                      value={uploadFormData.skills}
                      onChange={handleFormInputChange}
                      placeholder="Enter your skills"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Upload Resume
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        name="resumeFile"
                        onChange={handleFormInputChange}
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        id="resumeFile"
                        required
                      />
                      <label
                        htmlFor="resumeFile"
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                      >
                        Choose File
                      </label>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {uploadFormData.resumeFile ? uploadFormData.resumeFile.name : "No file chosen"}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={uploadFormData.contactNumber}
                      onChange={handleFormInputChange}
                      placeholder="Enter your contact number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Qualification
                    </label>
                    <textarea
                      name="qualification"
                      value={uploadFormData.qualification}
                      onChange={handleFormInputChange}
                      placeholder="Enter your qualification details"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      *Experience
                    </label>
                    <textarea
                      name="experience"
                      value={uploadFormData.experience}
                      onChange={handleFormInputChange}
                      placeholder="Enter your work experience"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleFormCancel}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 