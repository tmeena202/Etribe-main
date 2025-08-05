import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { FiDownload, FiFilter, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiFileText, FiFile, FiX, FiCopy, FiPlus, FiUser, FiMail, FiPhone, FiMapPin, FiRefreshCw, FiSearch } from "react-icons/fi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useContacts } from "../context/ContactsContext";
import { toast } from "react-toastify";

export default function ImportantContactsPage() {
  const { contactsData, loading, error, addContact, editContact: editContactAPI, deleteContact: deleteContactAPI, fetchContacts } = useContacts();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [editContact, setEditContact] = useState(null);
  const [deleteContact, setDeleteContact] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [addContactForm, setAddContactForm] = useState({ dept: "", name: "", contact: "", email: "", address: "" });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Handle click outside for export dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  const departments = ["All", ...Array.from(new Set(contactsData.map(c => c.dept)))];

  const filteredContacts = contactsData.filter(c => {
    const matchesFilter = filter === "All" || c.dept === filter;
    const matchesSearch = search === "" || 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.includes(search) ||
      c.dept.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortAsc) {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  // Pagination logic
  const totalEntries = sortedContacts.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIdx = (currentPage - 1) * entriesPerPage;
  const endIdx = startIdx + entriesPerPage;
  const paginatedContacts = sortedContacts.slice(startIdx, endIdx);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Handlers for edit form
  const [editForm, setEditForm] = useState({ id: '', dept: '', name: '', contact: '', email: '', address: '' });
  React.useEffect(() => {
    if (editContact) {
      setEditForm(editContact);
    }
  }, [editContact]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    setFormError(null);
    try {
      await editContactAPI(editForm);
      toast.success("Contact updated successfully!");
    setEditContact(null);
    } catch (err) {
      setFormError(err.toString());
      toast.error("Failed to update contact: " + err.message);
      setEditContact(null);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm.trim().toLowerCase() === "delete") {
      setDeleteLoading(true);
      setFormError(null);
      try {
        await deleteContactAPI(deleteContact.id);
    setDeleteContact(null);
    setDeleteConfirm("");
        toast.success("Contact deleted successfully!");
      } catch (err) {
        setFormError(err.toString());
        toast.error("Failed to delete contact: " + err.message);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Add contact handlers
  const handleAddContactChange = (e) => {
    setAddContactForm({ ...addContactForm, [e.target.name]: e.target.value });
  };

  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await addContact(addContactForm);
      setAddContactForm({ dept: "", name: "", contact: "", email: "", address: "" });
      toast.success("Contact added successfully!");
    setShowAddContactModal(false);
    } catch (err) {
      setFormError(err.toString());
      toast.error("Failed to add contact: " + err.message);
      setShowAddContactModal(false);
    }
  };

  // Copy handler
  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
    toast.success("Contact details copied to clipboard!");
  };

  // Export handlers
  const handleExportCSV = () => {
    const headers = ["Department", "Name", "Contact", "Email", "Address"];
    const rows = contactsData.map(c => [c.dept, c.name, c.contact, c.email, c.address]);
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "important_contacts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Contacts exported to CSV!");
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      contactsData.map(c => ({
        Department: c.dept,
        Name: c.name,
        Contact: c.contact,
        Email: c.email,
        Address: c.address,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Important Contacts");
    XLSX.writeFile(wb, "important_contacts.xlsx");
    toast.success("Contacts exported to Excel!");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });
    const headers = [[
      "Department", "Name", "Contact", "Email", "Address"
    ]];
    const rows = contactsData.map(c => [
      c.dept,
      c.name,
      c.contact,
      c.email,
      c.address,
    ]);
    try {
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      doc.save("important_contacts.pdf");
      toast.success("Contacts exported to PDF!");
    } catch (err) {
      toast.error("PDF export failed: " + err.message);
    }
  };

  const handleCopyToClipboard = () => {
    const data = contactsData.map(c => 
      `${c.dept},${c.name},${c.contact},${c.email},${c.address}`
    ).join('\n');
    navigator.clipboard.writeText(data);
    toast.success("All contacts copied to clipboard!");
  };

  const handleRefresh = () => {
    fetchContacts();
    toast.info("Refreshing contacts...");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-orange-600">Important Contacts</h1>
          </div>
          <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 max-w-7xl w-full mx-auto p-8">
            <div className="flex items-center justify-center">
              <div className="text-center text-gray-600">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p>Loading contacts...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Important Contacts</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiUser className="text-indigo-600" />
            <span>Total Contacts: {contactsData.length}</span>
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
                  placeholder="Search by name..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ minWidth: '100%', maxWidth: '100%' }}
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                <span>Showing {startIdx + 1} to {Math.min(startIdx + entriesPerPage, totalEntries)} of {totalEntries} entries</span>
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
                  onClick={handleCopyToClipboard}
                  title="Copy to Clipboard"
                >
                  <FiCopy /> 
                  Copy
                </button>
                
                <button 
                  className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                  onClick={handleExportCSV}
                  title="Export CSV"
                >
                  <FiDownload /> 
                  CSV
                </button>
                
                <button 
                  className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition"
                  onClick={handleExportExcel}
                  title="Export Excel"
                >
                  <FiFile /> 
                  Excel
                </button>
                
                <button 
                  className="flex items-center gap-1 bg-rose-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-rose-600 transition"
                  onClick={handleExportPDF}
                  title="Export PDF"
                >
                  <FiFile /> 
                  PDF
                </button>
              </div>
              
              {/* Mobile/Tablet Export Dropdown - Show on smaller screens */}
              <div className="relative xl:hidden flex-1 flex justify-center">
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
                        handleCopyToClipboard();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiCopy className="text-gray-500" />
                      Copy
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        handleExportCSV();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiDownload className="text-green-500" />
                      CSV
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        handleExportExcel();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiFile className="text-emerald-500" />
                      Excel
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                      onClick={() => {
                        handleExportPDF();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiFile className="text-rose-500" />
                      PDF
                    </button>
                  </div>
                )}
              </div>
              
              <button
                className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                onClick={() => setShowAddContactModal(true)}
              >
                <FiPlus />
                <span className="hidden sm:inline">Add Contact</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
          {/* Table - Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-gray-700 dark:text-gray-200 sticky top-0 z-10 shadow-sm">
                <tr className="border-b-2 border-indigo-200 dark:border-indigo-800">
                  <th className="p-3 text-center font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap">Sr No</th>
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap">Department</th>
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap">Name</th>
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap">Contact</th>
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap">Email</th>
                  <th className="p-3 text-left font-semibold border-r border-indigo-200 dark:border-indigo-800 whitespace-nowrap">Address</th>
                  <th className="p-3 text-center font-semibold whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContacts.map((c, idx) => (
                  <tr key={c.id} className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'} hover:bg-indigo-50 dark:hover:bg-gray-700 hover:shadow-sm`}>
                    <td className="p-3 text-center font-semibold text-indigo-700 dark:text-indigo-300 border-r border-gray-200 dark:border-gray-700">{startIdx + idx + 1}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{c.dept}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900 rounded-full flex items-center justify-center text-white font-semibold text-xs">{c.name.charAt(0).toUpperCase()}</div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{c.contact}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{c.email}</td>
                    <td className="p-3 text-left border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">{c.address}</td>
                    <td className="p-3 text-center">
                      <button className="text-yellow-600 hover:text-yellow-900 p-2 rounded-full hover:bg-yellow-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setEditContact(c)} title="Edit Contact"><FiEdit2 size={18} /></button>
                      <button className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setDeleteContact(c)} title="Delete Contact"><FiTrash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden p-4 sm:p-6 space-y-4">
            {paginatedContacts.map((c, idx) => (
              <div key={c.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-800 dark:to-purple-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-white">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{c.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Contact #{startIdx + idx + 1}</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{c.dept}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 transition-colors p-1" 
                      onClick={() => setEditContact(c)}
                      title="Edit Contact"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors p-1" 
                      onClick={() => setDeleteContact(c)}
                      title="Delete Contact"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{c.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{c.email}</span>
                  </div>
                  {c.address && (
                    <div className="flex items-start gap-2">
                      <FiMapPin className="text-gray-400 flex-shrink-0 mt-0.5" size={14} />
                      <span className="text-gray-700 dark:text-gray-300 text-xs line-clamp-2">
                        {c.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-400">Show</span>
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
                    &lt;
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
                    &gt;
                </button>
                </div>
            </div>
          </div>
        </div>

        {/* Add Contact Modal */}
        {showAddContactModal && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 w-full max-w-md relative h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col">
              <button
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-red-500 transition-colors z-10"
                onClick={() => setShowAddContactModal(false)}
                title="Close"
              >
                <FiX size={20} className="sm:w-6 sm:h-6" />
              </button>
              
              <div className="mb-4 sm:mb-6 pr-8 sm:pr-0">
                <h2 className="text-lg sm:text-xl font-bold text-indigo-700 dark:text-indigo-200 flex items-center gap-2">
                  <FiPlus className="text-indigo-600 dark:text-indigo-300" />
                  Add New Contact
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Create a new important contact</p>
              </div>
              
               {formError && <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900 p-2 rounded-lg">{formError}</p>}
              
              <form className="flex-1 flex flex-col" onSubmit={handleAddContactSubmit}>
                <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 sm:mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dept"
                    value={addContactForm.dept}
                    onChange={handleAddContactChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                    placeholder="Enter department"
                    required
                  />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 sm:mb-2">
                    Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={addContactForm.name}
                    onChange={handleAddContactChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                    placeholder="Enter person name"
                    required
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 sm:mb-2">
                    Contact <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={addContactForm.contact}
                    onChange={handleAddContactChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                    placeholder="Enter contact number"
                    required
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 sm:mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={addContactForm.email}
                    onChange={handleAddContactChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 sm:mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={addContactForm.address}
                    onChange={handleAddContactChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                    placeholder="Enter address"
                  />
                </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setShowAddContactModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-700 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
                  >
                    <FiPlus />
                    Add Contact
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Contact Modal */}
        {editContact && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 w-full max-w-md relative h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col">
              <button
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-red-500 transition-colors z-10"
                onClick={() => setEditContact(null)}
                title="Close"
              >
                <FiX size={20} className="sm:w-6 sm:h-6" />
              </button>
              
              <div className="mb-4 sm:mb-6 pr-8 sm:pr-0">
                <h2 className="text-lg sm:text-xl font-bold text-indigo-700 dark:text-indigo-200 flex items-center gap-2">
                  <FiEdit2 className="text-indigo-600 dark:text-indigo-300" />
                  Edit Contact
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Update contact information</p>
              </div>
              
               {formError && <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900 p-2 rounded-lg">{formError}</p>}
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="dept"
                    value={editForm.dept}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Person Name <span className="text-red-500">*</span>
                </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Contact <span className="text-red-500">*</span>
                </label>
                  <input
                    type="text"
                    name="contact"
                    value={editForm.contact}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Email ID <span className="text-red-500">*</span>
                </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Address
                </label>
                  <input
                    type="text"
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setEditContact(null)}
                  >
                    Cancel
                  </button>
                <button
                  type="button"
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-700 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
                  onClick={handleEditSave}
                >
                    <FiEdit2 />
                    Save Changes
                </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Contact Modal */}
        {deleteContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4 relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                onClick={() => setDeleteContact(null)}
                title="Close"
              >
                <FiX size={24} />
              </button>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
                  <FiTrash2 className="text-red-600" />
                  Delete Contact
                </h2>
                <p className="text-gray-600 text-sm mt-1">This action cannot be undone</p>
              </div>
              
               {formError && <p className="text-red-500 text-sm bg-red-100 p-2 rounded-lg">{formError}</p>}
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">
                    Type <span className="font-mono bg-red-100 px-2 py-1 rounded">Delete</span> to confirm deletion of <span className="font-semibold">{deleteContact.name}</span>.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmation
                  </label>
              <input
                type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent transition-colors"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="Type 'Delete' to confirm"
              />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                    onClick={() => setDeleteContact(null)}
                  >
                    Cancel
                  </button>
              <button
                type="button"
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                      deleteConfirm.trim().toLowerCase() === 'delete' 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                onClick={handleDelete}
                disabled={deleteConfirm.trim().toLowerCase() !== 'delete' || deleteLoading}
              >
                    {deleteLoading ? 'Deleting...' : <><FiTrash2 /> Delete Contact</>}
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