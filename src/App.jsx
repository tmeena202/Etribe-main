import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AdminManagement from "./pages/AdminManagement";
import EventManagement from "./pages/EventManagement";
import ImportantContactsPage from "./pages/ImportantContacts";
import MasterSettings from "./pages/MasterSettings";
import ActiveMembers from "./pages/ActiveMembers";
import InactiveMembers from "./pages/InactiveMembers";
import MembershipExpired from "./pages/MembershipExpired";
import AdminAccounts from "./pages/AdminAccounts";
import UserRoles from "./pages/UserRoles";
import RoleManagement from "./pages/RoleManagement";
import GroupData from "./pages/GroupData";
import SMTPSettings from "./pages/SMTPSettings";
import MessageSettings from "./pages/MessageSettings";
import UserAdditionalFields from "./pages/UserAdditionalFields";
import CompanyAdditionalFields from "./pages/CompanyAdditionalFields";
import MembershipPlans from "./pages/MembershipPlans";
import AllEvents from "./pages/AllEvents";
import UpcomingEventsPage from "./pages/UpcomingEventsPage";
import PastEvents from "./pages/PastEvents";
import AboutUs from "./pages/AboutUs";
import OurServices from "./pages/OurServices";
import Contact from "./pages/Contact";
import Policy from "./pages/Policy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Calendar from "./pages/Calendar";
import Login from "./pages/Login";
import DashboardLayout from "./components/Layout/DashboardLayout";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function isAuthenticated() {
  return !!localStorage.getItem('token');
}

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/members-services/active" element={<ProtectedRoute><ActiveMembers /></ProtectedRoute>} />
        <Route path="/members-services/inactive" element={<ProtectedRoute><InactiveMembers /></ProtectedRoute>} />
        <Route path="/members-services/expired" element={<ProtectedRoute><MembershipExpired /></ProtectedRoute>} />
        <Route path="/admin-management" element={<ProtectedRoute><AdminManagement /></ProtectedRoute>} />
        <Route path="/admin-management/accounts" element={<ProtectedRoute><AdminAccounts /></ProtectedRoute>} />
        <Route path="/admin-management/user-roles" element={<ProtectedRoute><UserRoles /></ProtectedRoute>} />
        <Route path="/admin-management/role-management" element={<ProtectedRoute><RoleManagement /></ProtectedRoute>} />
        <Route path="/event-management" element={<ProtectedRoute><EventManagement /></ProtectedRoute>} />
        <Route path="/event-management/all" element={<ProtectedRoute><AllEvents /></ProtectedRoute>} />
        <Route path="/event-management/upcoming" element={<ProtectedRoute><UpcomingEventsPage /></ProtectedRoute>} />
        <Route path="/event-management/past" element={<ProtectedRoute><PastEvents /></ProtectedRoute>} />
        <Route path="/important-contacts" element={<ProtectedRoute><ImportantContactsPage /></ProtectedRoute>} />
        <Route path="/master-settings" element={<ProtectedRoute><MasterSettings /></ProtectedRoute>} />
        <Route path="/master-settings/group-data" element={<ProtectedRoute><GroupData /></ProtectedRoute>} />
        <Route path="/master-settings/smtp-settings" element={<ProtectedRoute><SMTPSettings /></ProtectedRoute>} />
        <Route path="/master-settings/message-settings" element={<ProtectedRoute><MessageSettings /></ProtectedRoute>} />
        <Route path="/master-settings/user-additional-fields" element={<ProtectedRoute><UserAdditionalFields /></ProtectedRoute>} />
        <Route path="/master-settings/company-additional-fields" element={<ProtectedRoute><CompanyAdditionalFields /></ProtectedRoute>} />
        <Route path="/master-settings/membership-plans" element={<ProtectedRoute><MembershipPlans /></ProtectedRoute>} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/services" element={<OurServices />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
