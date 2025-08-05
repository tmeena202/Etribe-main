import React, { useState, useEffect } from "react";
import { FiDownload, FiFilter, FiEdit2, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiRefreshCw, FiSearch, FiCopy, FiPlus, FiFileText, FiFile, FiX, FiChevronDown } from "react-icons/fi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useContacts } from "../../context/ContactsContext";
import { toast } from "react-toastify";

export default function ImportantContacts() {
  const { contactsData, loading, error, editContact: editContactAPI, deleteContact: deleteContactAPI, fetchContacts } = useContacts();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editContact, setEditContact] = useState(null);
  const [deleteContact, setDeleteContact] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [addContactForm, setAddContactForm] = useState({
    dept: "",
    name: "",
    contact: "",
    email: "",
    address: ""
  });
  const [formError, setFormError] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Close dropdown when clicking outside
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
    setEditContact(null);
      toast.success("Contact updated successfully!");
    } catch (err) {
      setFormError(err.toString());
      toast.error("Failed to update contact.");
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm.trim().toLowerCase() === "delete") {
      setFormError(null);
      try {
        await deleteContactAPI(deleteContact.id);
      setDeleteContact(null);
      setDeleteConfirm("");
        toast.success("Contact deleted successfully!");
      } catch (err) {
        setFormError(err.toString());
        toast.error("Failed to delete contact.");
      }
    }
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
    toast.success("Contacts copied to clipboard!");
  };

  const handleRefresh = () => {
    fetchContacts();
    toast.info("Refreshing contacts...");
  };

  if (loading) {
    return (
      <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-900">
        <div className="rounded-t-2xl inset-0 bg-gradient-to-r from-indigo-300 via-blue-200 to-blue-300 dark:from-indigo-900 dark:via-blue-900 dark:to-gray-900 px-6 py-4">
          <h2 className="text-xl font-bold text-white tracking-wide">Important Contacts</h2>
        </div>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p>Loading contacts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="rounded-t-2xl inset-0 bg-gradient-to-r from-indigo-300 via-blue-200 to-blue-300 dark:from-indigo-900 dark:via-blue-900 dark:to-gray-900 px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 relative">
        <div className="flex flex-col gap-3 w-full">
          {/* First Row - Title */}
          <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-wide">
            Important Contacts
          </h2>
          
          {/* Second Row - Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <FiFilter className="text-white" />
                <label htmlFor="dept-filter" className="text-sm font-medium text-white">Dept:</label>
                <select
                  id="dept-filter"
                  className="border-none rounded-lg px-3 py-1 text-sm bg-indigo-100 dark:bg-gray-800 text-indigo-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <span className="flex items-center gap-1 text-xs font-medium bg-indigo-500/80 text-white px-2 py-0.5 rounded-lg">
                <FiUser className="text-white text-base" />
                Total: {contactsData.length}
              </span>
            </div>
            
            <div className="flex gap-2 items-center flex-shrink-0">
              {/* Desktop Export Buttons */}
              <div className="hidden lg:flex gap-2">
                <button 
                  className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                  onClick={handleExportCSV}
                  title="Export to CSV"
                >
                  <FiFileText />
                  CSV
                </button>
                <button 
                  className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition"
                  onClick={handleExportExcel}
                  title="Export to Excel"
                >
                  <FiFile />
                  Excel
                </button>
                <button 
                  className="flex items-center gap-1 bg-rose-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-rose-600 transition"
                  onClick={handleExportPDF}
                  title="Export to PDF"
                >
                  <FiFile />
                  PDF
                </button>
                <button 
                  className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
                  onClick={handleCopyToClipboard}
                  title="Copy to Clipboard"
                >
                  <FiCopy />
                  Copy
                </button>
                <button 
                  className="flex items-center gap-1 bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-600 transition"
                  onClick={handleRefresh}
                  title="Refresh Contacts"
                >
                  <FiRefreshCw />
                  Refresh
                </button>
              </div>

              {/* Mobile Export Dropdown */}
              <div className="lg:hidden relative export-dropdown">
                <button
                  className="flex items-center gap-1 bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-600 transition"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                >
                  <FiDownload />
                  Export
                  <FiChevronDown className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showExportDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 min-w-32">
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                      onClick={() => {
                        handleExportCSV();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiFileText className="text-blue-500" />
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
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        handleExportPDF();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiFile className="text-rose-500" />
                      PDF
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        handleCopyToClipboard();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiCopy className="text-gray-500" />
                      Copy
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                      onClick={() => {
                        handleRefresh();
                        setShowExportDropdown(false);
                      }}
                    >
                      <FiRefreshCw className="text-indigo-500" />
                      Refresh
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto p-6">
        <div className="max-h-96 overflow-y-auto min-w-full">
          <table className="min-w-full text-sm bg-white dark:bg-gray-800 whitespace-nowrap">
            <thead className="bg-indigo-50 dark:bg-gray-800 text-indigo-700 dark:text-indigo-200 sticky top-0 z-10">
              <tr>
                <th className="p-3 rounded-l-xl text-left min-w-[60px]">Sr No</th>
                <th className="p-3 text-left min-w-[120px]">Department</th>
                <th className="p-3 text-left min-w-[120px]">Person Name</th>
                <th className="p-3 text-left min-w-[100px]">Contact</th>
                <th className="p-3 text-left min-w-[150px]">Email</th>
                <th className="p-3 text-left min-w-[120px]">Address</th>
                <th className="p-3 rounded-r-xl text-center min-w-[120px]">Action</th>
              </tr>
            </thead>
            <tbody className="border-separate border-spacing-y-2">
              {filteredContacts.map((c, idx) => (
                <tr key={c.id} className="bg-white dark:bg-gray-900 shadow rounded-xl">
                  <td className="p-3 text-center font-semibold text-indigo-700 dark:text-indigo-300 min-w-[60px]">{idx + 1}</td>
                  <td className="p-3 text-gray-900 dark:text-gray-100 min-w-[120px]">{c.dept}</td>
                  <td className="p-3 text-gray-900 dark:text-gray-100 min-w-[120px]">{c.name}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-200 min-w-[100px]">{c.contact}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-200 min-w-[150px]">{c.email}</td>
                  <td className="p-3 text-gray-500 dark:text-gray-400 min-w-[120px]">{c.address}</td>
                  <td className="p-3 flex gap-2 justify-center min-w-[120px]">
                    <button 
                      className="flex items-center gap-1 bg-yellow-400 text-white px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-500 transition"
                      onClick={() => setEditContact(c)}
                    >
                      <FiEdit2 />
                      Modify
                    </button>
                    <button 
                      className="flex items-center gap-1 bg-rose-500 text-white px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-rose-600 transition"
                      onClick={() => setDeleteContact(c)}
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
       {editContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md mx-4 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
              onClick={() => setEditContact(null)}
              title="Close"
            >
              <FiX size={24} />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-200 flex items-center gap-2">
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
                  Type <span className="font-mono bg-red-100 px-2 py-1 rounded">delete</span> to confirm deletion of <span className="font-semibold">{deleteContact.name}</span>.
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
                  placeholder="Type 'delete' to confirm"
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
                  disabled={deleteConfirm.trim().toLowerCase() !== 'delete'}
                >
                  <FiTrash2 />
                  Delete Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md mx-4 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
              onClick={() => setShowAddContactModal(false)}
              title="Close"
            >
              <FiX size={24} />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-indigo-700 dark:text-indigo-200 flex items-center gap-2">
                <FiPlus className="text-indigo-600 dark:text-indigo-300" />
                Add Contact
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Enter new contact information</p>
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
                  value={addContactForm.dept}
                  onChange={e => setAddContactForm({ ...addContactForm, dept: e.target.value })}
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
                  value={addContactForm.name}
                  onChange={e => setAddContactForm({ ...addContactForm, name: e.target.value })}
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
                  value={addContactForm.contact}
                  onChange={e => setAddContactForm({ ...addContactForm, contact: e.target.value })}
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
                  value={addContactForm.email}
                  onChange={e => setAddContactForm({ ...addContactForm, email: e.target.value })}
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
                  value={addContactForm.address}
                  onChange={e => setAddContactForm({ ...addContactForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setShowAddContactModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-700 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
                >
                  <FiPlus />
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 