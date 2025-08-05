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
  FiX,
  FiCalendar,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../api/axiosConfig";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PaymentDetails() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editForm, setEditForm] = useState({
    chequeNo: '',
    chequeAmount: '',
    depositBank: '',
    chequeStatus: '',
    statusUpdateDate: ''
  });

  // Bank details state
  const [bankDetails, setBankDetails] = useState([]);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);


  useEffect(() => {
    fetchPayments();
    fetchBankDetails();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      
      if (!token) {
        toast.error("Please log in to view payment details");
        window.location.href = "/";
        return;
      }

      console.log('Fetching payment details with credentials:', { uid, token });
      
      const response = await api.post("/payment_detail", {}, {
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
      
      console.log('Payment details API response:', response.data);
      
      // Handle the API response data
      console.log('Full API response structure:', response.data);
      
      // Check for payment_detail array in the response
      if (response.data?.data?.payment_detail && Array.isArray(response.data.data.payment_detail)) {
        const apiPayments = response.data.data.payment_detail;
        console.log('Found payment_detail array with', apiPayments.length, 'items');
        
        const mappedPayments = apiPayments.map((payment, index) => {
          console.log(`Mapping payment ${index + 1}:`, payment);
          
          return {
            id: payment.id || index + 1,
            company: payment.company_name || payment.company || '',
            name: payment.pname || payment.name || '',
            paymentMode: payment.received_through || payment.payment_mode || '',
            bank: payment.name || payment.bank_name || '',
            amount: parseFloat(payment.cheque_amount) || 0,
            date: payment.bank_status_date || payment.updated_date || payment.date || '',
            status: payment.cheque_status || payment.status || 'Unknown',
            chequeNo: payment.cheque_no || '',
            chequeDate: payment.cheque_date || '',
            chequeImg: payment.cheque_img || '',
            depositingBank: payment.depositing_bank || '',
            updatedDate: payment.updated_date || '',
            updatedBy: payment.updated_by || '',
            validUpto: payment.valid_upto || ''
          };
        });
        
        setPayments(mappedPayments);
        console.log('Final mapped payments:', mappedPayments);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Fallback: if data is directly in response.data.data
        const apiPayments = response.data.data;
        console.log('Found data array with', apiPayments.length, 'items');
        
        const mappedPayments = apiPayments.map((payment, index) => {
          console.log(`Mapping payment ${index + 1}:`, payment);
          
          return {
            id: payment.id || index + 1,
            company: payment.company_name || payment.company || '',
            name: payment.pname || payment.name || '',
            paymentMode: payment.received_through || payment.payment_mode || '',
            bank: payment.name || payment.bank_name || '',
            amount: parseFloat(payment.cheque_amount) || 0,
            date: payment.bank_status_date || payment.updated_date || payment.date || '',
            status: payment.cheque_status || payment.status || 'Unknown',
            chequeNo: payment.cheque_no || '',
            chequeDate: payment.cheque_date || '',
            chequeImg: payment.cheque_img || '',
            depositingBank: payment.depositing_bank || '',
            updatedDate: payment.updated_date || '',
            updatedBy: payment.updated_by || '',
            validUpto: payment.valid_upto || ''
          };
        });
        
        setPayments(mappedPayments);
        console.log('Final mapped payments:', mappedPayments);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback: if data is directly in response.data
        const apiPayments = response.data;
        console.log('Found data array with', apiPayments.length, 'items');
        
        const mappedPayments = apiPayments.map((payment, index) => {
          console.log(`Mapping payment ${index + 1}:`, payment);
          
          return {
            id: payment.id || index + 1,
            company: payment.company_name || payment.company || '',
            name: payment.pname || payment.name || '',
            paymentMode: payment.received_through || payment.payment_mode || '',
            bank: payment.name || payment.bank_name || '',
            amount: parseFloat(payment.cheque_amount) || 0,
            date: payment.bank_status_date || payment.updated_date || payment.date || '',
            status: payment.cheque_status || payment.status || 'Unknown',
            chequeNo: payment.cheque_no || '',
            chequeDate: payment.cheque_date || '',
            chequeImg: payment.cheque_img || '',
            depositingBank: payment.depositing_bank || '',
            updatedDate: payment.updated_date || '',
            updatedBy: payment.updated_by || '',
            validUpto: payment.valid_upto || ''
          };
        });
        
        setPayments(mappedPayments);
        console.log('Final mapped payments:', mappedPayments);
      } else {
        // No data found in API response
        console.log('No data found in API response');
        console.log('Available keys in response.data:', Object.keys(response.data || {}));
        if (response.data?.data) {
          console.log('Available keys in response.data.data:', Object.keys(response.data.data || {}));
        }
        setPayments([]);
      }
    } catch (err) {
      console.error('Error fetching payment details:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      } else if (err.response?.status === 404) {
        toast.error("Payment details endpoint not found. Please check the API configuration.");
      } else {
        toast.error(err.response?.data?.message || err.message || "Failed to fetch payment details");
      }
      
      // Set empty array on error
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async () => {
    try {
      setBankDetailsLoading(true);
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      
      if (!token) {
        console.log("No token found for bank details fetch");
        return;
      }

      console.log('Fetching bank details with credentials:', { uid, token });
      
      const response = await api.post("/payment_detail/getbankdetails", {}, {
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
      
      console.log('Bank details API response:', response.data);
      
      // Handle the API response data
      let bankData = [];
      
      if (response.data?.data && Array.isArray(response.data.data)) {
        bankData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        bankData = response.data;
      } else if (response.data?.data && typeof response.data.data === 'object') {
        // Handle object format like {ad1: "Bank1", ad2: "Bank2"}
        bankData = Object.values(response.data.data).filter(value => value);
      }
      
      console.log('Processed bank data:', bankData);
      setBankDetails(bankData);
      
    } catch (error) {
      console.error("Error fetching bank details:", error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        console.error("Session expired for bank details fetch");
      } else {
        console.error("Failed to fetch bank details:", error.response?.data?.message || error.message);
      }
      
      // Set empty array on error
      setBankDetails([]);
    } finally {
      setBankDetailsLoading(false);
    }
  };

  const filterPayments = () => {
    const filtered = payments.filter(
      (payment) =>
        (payment.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.paymentMode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.bank || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.chequeNo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPayments(filtered);
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    const exportData = filteredPayments.map((payment, index) => ({
      "S.No": index + 1,
      Company: payment.company || 'N/A',
      Name: payment.name || 'N/A',
      "Payment Mode": payment.paymentMode || 'N/A',
      Bank: payment.bank || 'N/A',
      Amount: payment.amount || 0,
      Date: payment.date || 'N/A',
      Status: payment.status || 'N/A',
      "Cheque No": payment.chequeNo || 'N/A',
      "Cheque Date": payment.chequeDate || 'N/A',
      "Updated Date": payment.updatedDate || 'N/A',
      "Valid Upto": payment.validUpto || 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payment Details");
    XLSX.writeFile(wb, "payment_details.xlsx");
    toast.success("Payment details exported to Excel!");
  };

  const exportToCSV = () => {
    const csvContent = [
      ["S.No", "Company", "Name", "Payment Mode", "Bank", "Amount", "Date", "Status", "Cheque No", "Cheque Date", "Updated Date", "Valid Upto"],
      ...filteredPayments.map((payment, index) => [
        index + 1,
        payment.company || 'N/A',
        payment.name || 'N/A',
        payment.paymentMode || 'N/A',
        payment.bank || 'N/A',
        payment.amount || 0,
        payment.date || 'N/A',
        payment.status || 'N/A',
        payment.chequeNo || 'N/A',
        payment.chequeDate || 'N/A',
        payment.updatedDate || 'N/A',
        payment.validUpto || 'N/A',
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "payment_details.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Payment details exported to CSV!");
  };

  const copyToClipboard = () => {
    const text = filteredPayments.map((payment, index) => 
      `${index + 1}. ${payment.company || 'N/A'} - ${payment.name || 'N/A'} - ${payment.paymentMode || 'N/A'} - ${payment.bank || 'N/A'} - ₹${payment.amount || 0} - ${payment.date || 'N/A'} - ${payment.status || 'N/A'}`
    ).join("\n");
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Payment details copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  const exportToPDF = () => {
    if (!filteredPayments.length) {
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
      doc.text("Payment Details Report", 40, 40);

      // Add date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 60);

      // Define headers
      const headers = [
        "S.No", "Company", "Name", "Payment Mode", "Bank", "Amount", "Date", "Status", "Cheque No"
      ];

      // Prepare data rows
      const rows = filteredPayments.map((payment, index) => [
        index + 1,
        payment.company || 'N/A',
        payment.name || 'N/A',
        payment.paymentMode || 'N/A',
        payment.bank || 'N/A',
        `₹${(payment.amount || 0).toLocaleString()}`,
        payment.date || 'N/A',
        payment.status || 'N/A',
        payment.chequeNo || 'N/A'
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
          1: { cellWidth: 50 }, // Company
          2: { cellWidth: 50 }, // Name
          3: { cellWidth: 40 }, // Payment Mode
          4: { cellWidth: 60 }, // Bank
          5: { cellWidth: 40 }, // Amount
          6: { cellWidth: 40 }, // Date
          7: { cellWidth: 30 }  // Status
        },
        margin: { top: 80, right: 40, bottom: 40, left: 40 }
      });

      // Add summary at the bottom
      const totalAmount = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const clearedCount = filteredPayments.filter(p => p.status === 'Cleared').length;
      const processingCount = filteredPayments.filter(p => p.status === 'Processing').length;
      const bouncedCount = filteredPayments.filter(p => p.status === 'Bounced').length;

      const summaryY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Summary:", 40, summaryY);
      
      doc.setFont("helvetica", "normal");
      doc.text(`Total Payments: ${filteredPayments.length}`, 40, summaryY + 15);
      doc.text(`Total Amount: ₹${totalAmount.toLocaleString()}`, 40, summaryY + 30);
      doc.text(`Cleared: ${clearedCount} | Processing: ${processingCount} | Bounced: ${bouncedCount}`, 40, summaryY + 45);

      // Save the PDF
      doc.save("payment_details.pdf");
      toast.success("Payment details exported to PDF!");
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("PDF export failed: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Cleared: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Processing: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Bounced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusClasses[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {status}
      </span>
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment record?")) {
      try {
        const token = localStorage.getItem("token");
        const uid = localStorage.getItem("uid");
        
        if (!token) {
          toast.error("Please log in to delete payment records");
          window.location.href = "/";
          return;
        }

        console.log('Deleting payment with ID:', id);
        
        const response = await api.post("/payment_detail/delete", {
          id: id.toString()
        }, {
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
        
        console.log('Delete API response:', response.data);
        
        if (response.data?.status === 'success' || response.status === 200) {
          // Remove the deleted payment from the local state
          setPayments(payments.filter(payment => payment.id !== id));
          toast.success("Payment record deleted successfully");
        } else {
          toast.error(response.data?.message || "Failed to delete payment record");
        }
      } catch (err) {
        console.error('Error deleting payment:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        } else if (err.response?.status === 404) {
          toast.error("Delete endpoint not found. Please check the API configuration.");
        } else {
          toast.error(err.response?.data?.message || err.message || "Failed to delete payment record");
        }
      }
    }
  };

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  // Bank name to ID mapping using dynamic bank data
  const getBankId = (bankName) => {
    if (!bankName) return '';
    
    // First try to find by exact name match
    const exactMatch = bankDetails.find(bank => {
      const bankNameFromData = bank.name || bank.bank_name || bank.mode_name || bank.toString();
      return bankNameFromData === bankName;
    });
    
    if (exactMatch) {
      return exactMatch.id || exactMatch.bank_id || '';
    }
    
    // If no exact match, try partial match
    const partialMatch = bankDetails.find(bank => {
      const bankNameFromData = bank.name || bank.bank_name || bank.mode_name || bank.toString();
      return bankNameFromData.toLowerCase().includes(bankName.toLowerCase()) || 
             bankName.toLowerCase().includes(bankNameFromData.toLowerCase());
    });
    
    if (partialMatch) {
      return partialMatch.id || partialMatch.bank_id || '';
    }
    
    // Fallback to original hardcoded mapping if dynamic data is not available
    const bankMapping = {
      'HDFC Bank': '1',
      'ICICI Bank': '2',
      'State Bank of India': '3',
      'Axis Bank': '4',
      'Kotak Mahindra Bank': '5',
      'Yes Bank': '6',
      'Punjab National Bank': '7',
      'Bank of Baroda': '8',
      'Canara Bank': '9',
      'Union Bank of India': '10'
    };
    return bankMapping[bankName] || '';
  };

  const handleEdit = (payment) => {
    console.log('Opening edit modal for payment:', payment);
    
    // Format date for input field (YYYY-MM-DD)
    let formattedDate = '';
    if (payment.updatedDate) {
      try {
        const date = new Date(payment.updatedDate);
        formattedDate = date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formatting date:', error);
        formattedDate = payment.updatedDate || '';
      }
    }
    
    // Get bank ID
    const bankId = getBankId(payment.depositingBank);
    console.log('Bank mapping:', {
      originalBank: payment.depositingBank,
      mappedBankId: bankId,
      availableBanks: bankDetails
    });
    
    setSelectedPayment(payment);
    setEditForm({
      chequeNo: payment.chequeNo || '',
      chequeAmount: payment.amount?.toString() || '',
      depositBank: bankId || '',
      chequeStatus: payment.status || '',
      statusUpdateDate: formattedDate
    });
    
    console.log('Edit form initialized:', {
      chequeNo: payment.chequeNo || '',
      chequeAmount: payment.amount?.toString() || '',
      depositBank: bankId || '',
      chequeStatus: payment.status || '',
      statusUpdateDate: formattedDate
    });
    
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      
      if (!token) {
        toast.error("Please log in to update payment records");
        window.location.href = "/";
        return;
      }

      console.log('Updating payment with ID:', selectedPayment.id);
      console.log('Current edit form data:', editForm);
      
      // Prepare the update data according to the API specification
      const updateData = {
        payment_id: selectedPayment.id.toString(),
        cheque_no: editForm.chequeNo,
        cheque_amount: editForm.chequeAmount,
        bank_id: editForm.depositBank, // Assuming bank_id is the bank selection
        cheque_status: editForm.chequeStatus,
        status_update_date: editForm.statusUpdateDate
      };
      
      console.log('Sending update data to API:', updateData);

      // Make API call to update payment details using the correct endpoint
      const response = await api.post("/payment_detail/edit", updateData, {
        headers: {
          "Client-Service": "COHAPPRT",
          "Auth-Key": "4F21zrjoAASqz25690Zpqf67UyY",
          uid: uid || '1',
          token: token,
          rurl: "etribes.ezcrm.site",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
      });
      
      console.log('Update API response:', response.data);
      
      if (response.data?.status === 'success' || response.status === 200) {
        // Update the local state with the new data
        const updatedPayments = payments.map(payment => 
          payment.id === selectedPayment.id 
            ? {
                ...payment,
                chequeNo: editForm.chequeNo,
                amount: parseFloat(editForm.chequeAmount) || 0,
                depositingBank: editForm.depositBank,
                status: editForm.chequeStatus,
                updatedDate: editForm.statusUpdateDate
              }
            : payment
        );
        
        setPayments(updatedPayments);
        setShowEditModal(false);
        setSelectedPayment(null);
        toast.success("Payment details updated successfully!");
      } else {
        toast.error(response.data?.message || "Failed to update payment details");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      } else if (error.response?.status === 404) {
        toast.error("Update endpoint not found. Please check the API configuration.");
      } else {
        toast.error(error.response?.data?.message || error.message || "Failed to update payment details");
      }
    }
  };

  const handleEditFormChange = (field, value) => {
    console.log('Form field change:', { field, value });
    setEditForm(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      console.log('Updated edit form:', updated);
      return updated;
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchPayments();
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredPayments.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredPayments.length / entriesPerPage);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700 dark:text-indigo-300">Loading payment details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Payment Details</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiUsers className="text-indigo-600" />
            <span>Total Payments: {payments.length}</span>
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
                  placeholder="Search by company, name, payment mode, bank, or status..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ minWidth: '100%', maxWidth: '100%' }}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                <span>Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredPayments.length)} of {filteredPayments.length} entries</span>
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
                  <th className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap" style={{ minWidth: '60px', width: '60px' }}>
                    S.No
                  </th>
                  <th className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap" style={{ minWidth: '120px', width: '120px' }}>
                    Company
                  </th>
                  <th className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap" style={{ minWidth: '120px', width: '120px' }}>
                    Name
                  </th>
                  <th className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap" style={{ minWidth: '120px', width: '120px' }}>
                    Payment Mode
                  </th>
                  <th className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap" style={{ minWidth: '150px', width: '150px' }}>
                    Bank
                  </th>
                  <th className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap" style={{ minWidth: '100px', width: '100px' }}>
                    Amount
                  </th>
                  <th className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap" style={{ minWidth: '100px', width: '100px' }}>
                    Date
                  </th>
                  <th className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap" style={{ minWidth: '100px', width: '100px' }}>
                    Status
                  </th>
                  <th className="p-3 font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap" style={{ minWidth: '120px', width: '120px' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.map((payment, idx) => (
                  <tr 
                    key={payment.id} 
                    className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${
                      idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'
                    } hover:bg-indigo-50 dark:hover:bg-gray-700 hover:shadow-sm`}
                  >
                    <td className="p-3 text-center font-semibold text-indigo-700 dark:text-indigo-300 border-r border-gray-200 dark:border-gray-700">
                      {indexOfFirstEntry + idx + 1}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      {payment.company || 'N/A'}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {(payment.name || 'N').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{payment.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      {payment.paymentMode || 'N/A'}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      {payment.bank || 'N/A'}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 font-medium">
                      ₹{(payment.amount || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                      {payment.date || 'N/A'}
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700">
                      {getStatusBadge(payment.status)}
                    </td>
                                         <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700">
                       <div className="flex items-center gap-2">
                         {/* Show all actions for Processing or Bounced status */}
                         {payment.status === 'Processing' || payment.status === 'Bounced' ? (
                           <>
                             <button
                               onClick={() => handleView(payment)}
                               className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                               title="View"
                             >
                               <FiEye size={16} />
                             </button>
                             <button
                               onClick={() => handleEdit(payment)}
                               className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                               title="Edit"
                             >
                               <FiEdit size={16} />
                             </button>
                             <button
                               onClick={() => handleDelete(payment.id)}
                               className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                               title="Delete"
                             >
                               <FiTrash2 size={16} />
                             </button>
                           </>
                         ) : (
                           /* Show only delete action for Cleared status */
                           <button
                             onClick={() => handleDelete(payment.id)}
                             className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                             title="Delete"
                           >
                             <FiTrash2 size={16} />
                           </button>
                         )}
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden p-4 space-y-4">
            {currentEntries.map((payment, idx) => (
              <div key={payment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {payment.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{payment.name || 'N/A'}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{payment.company || 'N/A'}</p>
                    </div>
                  </div>
                                     <div className="flex items-center gap-2">
                     {/* Show all actions for Processing or Bounced status */}
                     {payment.status === 'Processing' || payment.status === 'Bounced' ? (
                       <>
                         <button
                           onClick={() => handleView(payment)}
                           className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                           title="View"
                         >
                           <FiEye size={16} />
                         </button>
                         <button
                           onClick={() => handleEdit(payment)}
                           className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                           title="Edit"
                         >
                           <FiEdit size={16} />
                         </button>
                         <button
                           onClick={() => handleDelete(payment.id)}
                           className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                           title="Delete"
                         >
                           <FiTrash2 size={16} />
                         </button>
                       </>
                     ) : (
                       /* Show only delete action for Cleared status */
                       <button
                         onClick={() => handleDelete(payment.id)}
                         className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                         title="Delete"
                       >
                         <FiTrash2 size={16} />
                       </button>
                     )}
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Payment Mode:</span>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{payment.paymentMode || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Bank:</span>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{payment.bank || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <p className="font-medium text-gray-800 dark:text-gray-100">₹{(payment.amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{payment.date || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <div className="mt-1">{getStatusBadge(payment.status)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
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

        {/* Edit Payment Modal */}
        {showEditModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Edit Cheque Details
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cheque No
                  </label>
                  <input
                    type="text"
                    value={editForm.chequeNo}
                    onChange={(e) => handleEditFormChange('chequeNo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Enter cheque number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cheque Amount
                  </label>
                  <input
                    type="number"
                    value={editForm.chequeAmount}
                    onChange={(e) => handleEditFormChange('chequeAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deposit Bank
                  </label>
                  <select
                    value={editForm.depositBank}
                    onChange={(e) => handleEditFormChange('depositBank', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 dark:bg-gray-700 dark:text-gray-100"
                    disabled={bankDetailsLoading}
                  >
                    <option value="">
                      {bankDetailsLoading ? "Loading banks..." : "Select Bank"}
                    </option>
                    {bankDetails.map((bank, index) => {
                      // Handle different bank data formats
                      const bankId = bank.id || bank.bank_id || (index + 1).toString();
                      const bankName = bank.name || bank.bank_name || bank.mode_name || bank.toString();
                      
                      return (
                        <option key={bankId} value={bankId}>
                          {bankName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cheque Status
                  </label>
                  <select
                    value={editForm.chequeStatus}
                    onChange={(e) => handleEditFormChange('chequeStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">Select Status</option>
                    <option value="Processing">Processing</option>
                    <option value="Cleared">Cleared</option>
                    <option value="Bounced">Bounced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status Update Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={editForm.statusUpdateDate}
                      onChange={(e) => handleEditFormChange('statusUpdateDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 dark:bg-gray-700 dark:text-gray-100 pr-10"
                    />
                    <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Payment Modal */}
        {showViewModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Payment Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Information */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Payment Information
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Company:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPayment.company || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPayment.name || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Mode:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPayment.paymentMode || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bank:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPayment.bank || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount:</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">₹{(selectedPayment.amount || 0).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPayment.date || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                        <div>{getStatusBadge(selectedPayment.status)}</div>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Cheque No:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPayment.chequeNo || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Cheque Date:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPayment.chequeDate || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Depositing Bank:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPayment.depositingBank || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Updated Date:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPayment.updatedDate || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Updated By:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPayment.updatedBy || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Valid Upto:</span>
                        <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPayment.validUpto || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cheque Image */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Cheque Image
                    </h4>
                    
                    {selectedPayment.chequeImg ? (
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <img 
                          src={`https://api.etribes.ezcrm.site/${selectedPayment.chequeImg}`} 
                          alt="Cheque Image" 
                          className="w-full h-auto max-h-96 object-contain bg-gray-50 dark:bg-gray-700"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
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
                          <p>No cheque image available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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