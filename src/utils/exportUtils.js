import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from 'react-toastify';

/**
 * Copy data to clipboard
 * @param {Array} data - Array of objects to copy
 * @param {Array} fields - Array of field names to include
 * @param {string} separator - Separator between fields (default: ', ')
 * @param {string} successMessage - Success message for toast
 */
export const copyToClipboard = (data, fields, separator = ', ', successMessage = 'Data copied to clipboard!') => {
  if (!data || !data.length) {
    toast.warning('No data to copy');
    return;
  }

  try {
    const textData = data.map(item => 
      fields.map(field => item[field] || '').join(separator)
    ).join('\n');
    
    navigator.clipboard.writeText(textData);
    toast.success(successMessage);
  } catch (error) {
    console.error('Copy failed:', error);
    toast.error('Failed to copy data');
  }
};

/**
 * Refresh page data
 * @param {Function} fetchFunction - Function to fetch data
 * @param {string} successMessage - Success message for toast
 */
export const refreshData = async (fetchFunction, successMessage = 'Data refreshed successfully!') => {
  try {
    await fetchFunction();
    toast.success(successMessage);
  } catch (error) {
    console.error('Refresh failed:', error);
    toast.error('Failed to refresh data');
  }
};

/**
 * Export data to CSV
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header names
 * @param {Array} fields - Array of field names corresponding to headers
 * @param {string} filename - Name of the file (without extension)
 */
export const exportToCSV = (data, headers, fields, filename = 'export') => {
  if (!data || !data.length) {
    toast.warning('No data to export');
    return;
  }

  try {
    const rows = data.map(item => 
      fields.map(field => item[field] || '')
    );
    
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV exported successfully!');
  } catch (error) {
    console.error('CSV export failed:', error);
    toast.error('Failed to export CSV');
  }
};

/**
 * Export data to Excel
 * @param {Array} data - Array of objects to export
 * @param {Object} fieldMapping - Object mapping display names to field names
 * @param {string} filename - Name of the file (without extension)
 * @param {string} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, fieldMapping, filename = 'export', sheetName = 'Sheet1') => {
  if (!data || !data.length) {
    toast.warning('No data to export');
    return;
  }

  try {
    const ws = XLSX.utils.json_to_sheet(
      data.map(item => {
        const row = {};
        Object.keys(fieldMapping).forEach(displayName => {
          row[displayName] = item[fieldMapping[displayName]] || '';
        });
        return row;
      })
    );
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}.xlsx`);
    
    toast.success('Excel file exported successfully!');
  } catch (error) {
    console.error('Excel export failed:', error);
    toast.error('Failed to export Excel file');
  }
};

/**
 * Export data to PDF
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header names
 * @param {Array} fields - Array of field names corresponding to headers
 * @param {string} filename - Name of the file (without extension)
 * @param {string} title - Title for the PDF
 * @param {Object} options - Additional options for PDF generation
 */
export const exportToPDF = (data, headers, fields, filename = 'export', title = 'Data Export', options = {}) => {
  if (!data || !data.length) {
    toast.warning('No data to export');
    return;
  }

  try {
    const doc = new jsPDF({
      orientation: options.orientation || "portrait",
      unit: options.unit || "pt",
      format: options.format || "a4"
    });

    // Add title if provided
    if (title) {
      doc.setFontSize(16);
      doc.text(title, 40, 40);
    }

    const rows = data.map(item => 
      fields.map(field => item[field] || '')
    );

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: title ? 60 : 20,
      styles: { 
        fontSize: options.fontSize || 8,
        cellPadding: options.cellPadding || 2
      },
      headStyles: { 
        fillColor: options.headFillColor || [41, 128, 185],
        textColor: options.headTextColor || [255, 255, 255]
      },
      alternateRowStyles: options.alternateRowStyles || {
        fillColor: [245, 245, 245]
      },
      margin: options.margin || { top: 20, right: 20, bottom: 20, left: 20 }
    });

    doc.save(`${filename}.pdf`);
    toast.success('PDF exported successfully!');
  } catch (error) {
    console.error('PDF export failed:', error);
    toast.error('Failed to export PDF');
  }
};

/**
 * Generic export function that handles all export types
 * @param {string} type - Export type ('csv', 'excel', 'pdf', 'copy')
 * @param {Array} data - Array of objects to export
 * @param {Object} config - Configuration object with headers, fields, etc.
 */
export const exportData = (type, data, config) => {
  const { headers, fields, fieldMapping, filename, title, options } = config;

  switch (type.toLowerCase()) {
    case 'csv':
      exportToCSV(data, headers, fields, filename);
      break;
    case 'excel':
      exportToExcel(data, fieldMapping, filename);
      break;
    case 'pdf':
      exportToPDF(data, headers, fields, filename, title, options);
      break;
    case 'copy':
      copyToClipboard(data, fields);
      break;
    default:
      toast.error('Invalid export type');
  }
};

/**
 * Create export configuration for common data types
 * @param {string} dataType - Type of data ('members', 'events', 'users', etc.)
 * @param {Array} customHeaders - Custom headers (optional)
 * @param {Array} customFields - Custom fields (optional)
 */
export const createExportConfig = (dataType, customHeaders = null, customFields = null) => {
  const configs = {
    members: {
      headers: ["Name", "Contact", "Email", "Address", "PAN Number", "Aadhar Number", "DL Number", "D.O.B", "Company Name", "Valid Upto"],
      fields: ["name", "phone_num", "email", "address", "ad1", "ad2", "ad3", "ad4", "company_name", "ad5"],
      fieldMapping: {
        "Name": "name",
        "Contact": "phone_num",
        "Email": "email",
        "Address": "address",
        "PAN Number": "ad1",
        "Aadhar Number": "ad2",
        "DL Number": "ad3",
        "D.O.B": "ad4",
        "Company Name": "company_name",
        "Valid Upto": "ad5"
      }
    },
    events: {
      headers: ["Event Title", "Description", "Venue", "Date", "Time", "Status"],
      fields: ["event_title", "event_description", "event_venue", "event_date", "event_time", "status"],
      fieldMapping: {
        "Event Title": "event_title",
        "Description": "event_description",
        "Venue": "event_venue",
        "Date": "event_date",
        "Time": "event_time",
        "Status": "status"
      }
    },
    users: {
      headers: ["Name", "Email", "Role", "Status", "Created Date"],
      fields: ["name", "email", "role", "status", "created_at"],
      fieldMapping: {
        "Name": "name",
        "Email": "email",
        "Role": "role",
        "Status": "status",
        "Created Date": "created_at"
      }
    }
  };

  const defaultConfig = configs[dataType] || {
    headers: customHeaders || ["Name", "Value"],
    fields: customFields || ["name", "value"],
    fieldMapping: customHeaders?.reduce((acc, header, index) => {
      acc[header] = customFields?.[index] || header.toLowerCase();
      return acc;
    }, {}) || { "Name": "name", "Value": "value" }
  };

  return defaultConfig;
}; 