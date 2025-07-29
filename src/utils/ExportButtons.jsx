import React from 'react';
import { FiRefreshCw, FiCopy, FiDownload, FiFile } from 'react-icons/fi';
import { exportData, createExportConfig, refreshData } from './exportUtils';

/**
 * Reusable Export Buttons Component
 * @param {Object} props
 * @param {Array} props.data - Data to export
 * @param {string} props.dataType - Type of data ('members', 'events', 'users', etc.)
 * @param {Function} props.onRefresh - Function to refresh data
 * @param {string} props.filename - Base filename for exports
 * @param {string} props.title - Title for PDF export
 * @param {Object} props.customConfig - Custom export configuration
 * @param {boolean} props.showRefresh - Whether to show refresh button
 * @param {boolean} props.showCopy - Whether to show copy button
 * @param {boolean} props.showCSV - Whether to show CSV export
 * @param {boolean} props.showExcel - Whether to show Excel export
 * @param {boolean} props.showPDF - Whether to show PDF export
 * @param {string} props.className - Additional CSS classes
 */
const ExportButtons = ({
  data,
  dataType = 'members',
  onRefresh,
  filename = 'export',
  title = 'Data Export',
  customConfig = null,
  showRefresh = true,
  showCopy = true,
  showCSV = true,
  showExcel = true,
  showPDF = true,
  className = '',
  refreshMessage = 'Data refreshed successfully!'
}) => {
  const config = customConfig || createExportConfig(dataType);

  const handleExport = (type) => {
    const exportConfig = {
      ...config,
      filename: `${filename}_${new Date().toISOString().split('T')[0]}`,
      title: title
    };
    exportData(type, data, exportConfig);
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      await refreshData(onRefresh, refreshMessage);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      {showRefresh && (
        <button 
          className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          onClick={handleRefresh}
          title="Refresh Data"
        >
          <FiRefreshCw className="text-sm" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      )}
      
      {showCopy && (
        <button 
          className="flex items-center gap-1 bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
          onClick={() => handleExport('copy')}
          title="Copy to Clipboard"
        >
          <FiCopy className="text-sm" />
          <span className="hidden sm:inline">Copy</span>
        </button>
      )}
      
      {showCSV && (
        <button 
          className="flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          onClick={() => handleExport('csv')}
          title="Export CSV"
        >
          <FiDownload className="text-sm" />
          <span className="hidden sm:inline">CSV</span>
        </button>
      )}
      
      {showExcel && (
        <button 
          className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
          onClick={() => handleExport('excel')}
          title="Export Excel"
        >
          <FiFile className="text-sm" />
          <span className="hidden sm:inline">Excel</span>
        </button>
      )}
      
      {showPDF && (
        <button 
          className="flex items-center gap-1 bg-rose-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors"
          onClick={() => handleExport('pdf')}
          title="Export PDF"
        >
          <FiFile className="text-sm" />
          <span className="hidden sm:inline">PDF</span>
        </button>
      )}
    </div>
  );
};

export default ExportButtons; 