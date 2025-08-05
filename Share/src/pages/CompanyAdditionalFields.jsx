import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import {
  FiEdit2,
  FiRefreshCw,
  FiSave,
  FiHome,
  FiAlertCircle,
  FiSettings,
  FiBriefcase,
} from "react-icons/fi";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";
import { getAuthHeaders } from "../utils/apiHeaders";

const initialData = {
  companyField1: "",
  companyField2: "",
  companyField3: "",
  companyField4: "",
  companyField5: "",
  companyField6: "",
  companyField7: "",
  companyField8: "",
  companyField9: "",
  companyField10: "",
};

export default function CompanyAdditionalFields() {
  const [data, setData] = useState(initialData);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch company additional fields from API
  const fetchCompanyAdditionalFields = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");

      if (!token || !uid) {
        throw new Error("Authentication required. Please log in.");
      }

      const response = await api.post(
        "/groupSettings/get_company_additional_fields",
        {},
        {
          headers: getAuthHeaders(),
        }
      );

      const backendData = response.data?.data || response.data || {};

      // Map backend data to frontend format
      let mappedData = initialData;
      if (Array.isArray(backendData)) {
        mappedData = { ...initialData };
        backendData.forEach((field, index) => {
          if (index < 10) {
            mappedData[`companyField${index + 1}`] =
              field.name || field.label || field.value || field || initialData[`companyField${index + 1}`];
          }
        });
      } else if (backendData && Object.keys(backendData).length > 0) {
        mappedData = {
          companyField1: backendData.ad1 || "",
          companyField2: backendData.ad2 || "",
          companyField3: backendData.ad3 || "",
          companyField4: backendData.ad4 || "",
          companyField5: backendData.ad5 || "",
          companyField6: backendData.ad6 || "",
          companyField7: backendData.ad7 || "",
          companyField8: backendData.ad8 || "",
          companyField9: backendData.ad9 || "",
          companyField10: backendData.ad10 || "",
        };
      }

      setData(mappedData);
      setForm(mappedData);
    } catch (err) {
      console.error("Fetch company additional fields error:", err);
      const message = err.message || "Failed to fetch company additional fields";
      toast.error(message);

      if (
        message.toLowerCase().includes("token") ||
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("log in")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("uid");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  // Validation function
  const validateFields = (fieldsData) => {
    const errors = [];

    // Required first 5 fields validation
    for (let i = 1; i <= 5; i++) {
      const fieldName = `companyField${i}`;
      if (!fieldsData[fieldName] || fieldsData[fieldName].trim() === "") {
        errors.push(`Company Field ${i} is required`);
      }
    }

    // Check for duplicate fields
    const filled = Object.values(fieldsData).filter((v) => v && v.trim() !== "");
    const unique = new Set(filled);
    if (filled.length !== unique.size) {
      errors.push("Field names must be unique");
    }

    // Length checks
    Object.entries(fieldsData).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        if (value.trim().length < 2) {
          errors.push(`${key.replace("companyField", "Company Field ")} must be at least 2 characters long`);
        }
        if (value.trim().length > 50) {
          errors.push(`${key.replace("companyField", "Company Field ")} must be less than 50 characters`);
        }
      }
    });

    return errors;
  };

  // Save company additional fields
  const saveCompanyAdditionalFields = async (fieldsData) => {
    setSubmitting(true);
    try {
      const validationErrors = validateFields(fieldsData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");
      if (!token || !uid) {
        throw new Error("Authentication required. Please log in.");
      }

      const payload = {
        ad1: fieldsData.companyField1,
        ad2: fieldsData.companyField2,
        ad3: fieldsData.companyField3,
        ad4: fieldsData.companyField4,
        ad5: fieldsData.companyField5,
        ad6: fieldsData.companyField6,
        ad7: fieldsData.companyField7,
        ad8: fieldsData.companyField8,
        ad9: fieldsData.companyField9,
        ad10: fieldsData.companyField10,
      };

      const response = await api.post(
        "/GroupSettings/company_additional_fields_setting",
        payload,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.data?.status === "success") {
        setData(fieldsData);
        toast.success("Company additional fields saved successfully!");
        return { success: true };
      } else {
        toast.error(response.data?.message || "Failed to save company additional fields");
      }
    } catch (err) {
      console.error("Save company additional fields error:", err);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCompanyAdditionalFields();
    const interval = setInterval(fetchCompanyAdditionalFields, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleEdit = () => {
    setForm(data);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm(data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveCompanyAdditionalFields(form);
      setEditMode(false);
    } catch {
      // Errors handled inside saveCompanyAdditionalFields
    }
  };

  const handleRefresh = () => {
    fetchCompanyAdditionalFields();
  };

  const configuredFields = Object.values(data).filter((f) => f && f.trim() !== "").length;

  if (loading && Object.values(data).every((val) => val === "")) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="animate-spin text-indigo-600 text-2xl" />
            <p className="text-indigo-700">Loading company additional fields...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-orange-600">Company Additional Fields</h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <FiHome className="text-indigo-600" />
            <span>Configured: {configuredFields}/10 fields</span>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 max-w-7xl w-full mx-auto border border-gray-200 dark:border-gray-700">
          {/* Header Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <FiHome className="text-indigo-600 text-lg sm:text-xl" />
                <span className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Company Fields Configuration
                </span>
              </div>
              {!editMode && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <FiSettings className="text-indigo-600" />
                  <span>Custom company profile fields</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center justify-between sm:justify-end">
              {!editMode && (
                <>
                  <button
                    className="flex items-center gap-1 bg-blue-500 text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600 transition"
                    onClick={handleRefresh}
                    disabled={loading}
                    title="Refresh Fields"
                  >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} /> 
                    <span>Refresh</span>
                  </button>
                  <button
                    className="flex items-center gap-1 bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-indigo-700 transition"
                    onClick={handleEdit}
                  >
                    <FiEdit2 /> 
                    <span>Edit Fields</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-indigo-700 dark:text-indigo-300">
                <FiRefreshCw className="animate-spin text-indigo-600 dark:text-indigo-300 text-xl mr-2" />
                Loading company additional fields...
              </div>
            ) : !editMode ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Status Card */}
                <div
                  className={`p-3 sm:p-4 rounded-lg border ${
                    configuredFields >= 5
                      ? "bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700"
                      : "bg-yellow-50 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-700"
                  }`}
                >
                  <h3
                    className={`font-semibold mb-2 flex items-center gap-2 ${
                      configuredFields >= 5
                        ? "text-green-700 dark:text-green-200"
                        : "text-yellow-700 dark:text-yellow-200"
                    }`}
                  >
                    <FiSettings
                      className={
                        configuredFields >= 5
                          ? "text-green-600 dark:text-green-200"
                          : "text-yellow-600 dark:text-yellow-200"
                      }
                    />
                    Configuration Status
                  </h3>
                  <p
                    className={`text-xs sm:text-sm ${
                      configuredFields >= 5
                        ? "text-green-600 dark:text-green-200"
                        : "text-yellow-600 dark:text-yellow-200"
                    }`}
                  >
                    {configuredFields >= 5
                      ? `${configuredFields} company fields are configured and ready for use.`
                      : `${configuredFields} fields configured. At least 5 fields are recommended for better company profile management.`}
                  </p>
                </div>

                {/* Fields Display */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const fieldKey = `companyField${i + 1}`;
                    const fieldValue = data[fieldKey];
                    const isConfigured = fieldValue && fieldValue.trim() !== "";
                    return (
                      <div
                        key={i}
                        className={`p-3 sm:p-4 rounded-lg border ${
                          isConfigured
                            ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 text-sm sm:text-base">
                            <FiBriefcase className="text-indigo-600" />
                            Company Field {i + 1}
                          </h4>
                          {isConfigured && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded text-xs font-medium">
                              Configured
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs sm:text-sm ${
                            isConfigured ? "text-gray-800 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {isConfigured ? fieldValue : "Not configured"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                {/* Form Header */}
                <div className="bg-yellow-50 dark:bg-yellow-900/40 p-3 sm:p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <h3 className="font-semibold text-yellow-700 dark:text-yellow-200 mb-2 flex items-center gap-2">
                    <FiAlertCircle className="text-yellow-600 dark:text-yellow-200" />
                    Company Fields Configuration
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-200 text-xs sm:text-sm">
                    Configure custom fields for company profiles. At least the first 5 fields are required. Field names
                    must be unique.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const fieldKey = `companyField${i + 1}`;
                    const isRequired = i < 5;
                    return (
                      <div key={i} className="space-y-2">
                        <label className="block text-gray-700 dark:text-gray-200 font-medium text-sm sm:text-base">
                          Company Field {i + 1}
                          {isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                          type="text"
                          name={fieldKey}
                          value={form[fieldKey]}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 transition-colors text-sm"
                          placeholder={`Enter company field name ${i + 1}`}
                          required={isRequired}
                          disabled={submitting}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isRequired ? "Required field" : "Optional field"}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    className="px-4 sm:px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm"
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        Save Fields
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
