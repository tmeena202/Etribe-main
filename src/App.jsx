import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Lazy load all page components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminManagement = lazy(() => import("./pages/AdminManagement"));
const EventManagement = lazy(() => import("./pages/EventManagement"));
const ImportantContactsPage = lazy(() => import("./pages/ImportantContacts"));
const MasterSettings = lazy(() => import("./pages/MasterSettings"));
const ActiveMembers = lazy(() => import("./pages/ActiveMembers"));
const InactiveMembers = lazy(() => import("./pages/InactiveMembers"));
const MembershipExpired = lazy(() => import("./pages/MembershipExpired"));
const AdminAccounts = lazy(() => import("./pages/AdminAccounts"));
const UserRoles = lazy(() => import("./pages/UserRoles"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));
const GroupData = lazy(() => import("./pages/GroupData"));
const SMTPSettings = lazy(() => import("./pages/SMTPSettings"));
const MessageSettings = lazy(() => import("./pages/MessageSettings"));
const UserAdditionalFields = lazy(() => import("./pages/UserAdditionalFields"));
const CompanyAdditionalFields = lazy(() => import("./pages/CompanyAdditionalFields"));
const MembershipPlans = lazy(() => import("./pages/MembershipPlans"));
const AllEvents = lazy(() => import("./pages/AllEvents"));
const UpcomingEventsPage = lazy(() => import("./pages/UpcomingEventsPage"));
const PastEvents = lazy(() => import("./pages/PastEvents"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const OurServices = lazy(() => import("./pages/OurServices"));
const Contact = lazy(() => import("./pages/Contact"));
const Policy = lazy(() => import("./pages/Policy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Login = lazy(() => import("./pages/Login"));

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
      <Suspense fallback={<div className="w-full h-screen flex items-center justify-center text-xl font-semibold text-gray-600 dark:text-gray-200">Loading...</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/membership-management/active" element={<ProtectedRoute><ActiveMembers /></ProtectedRoute>} />
        <Route path="/membership-management/inactive" element={<ProtectedRoute><InactiveMembers /></ProtectedRoute>} />
        <Route path="/membership-management/expired" element={<ProtectedRoute><MembershipExpired /></ProtectedRoute>} />
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
      </Suspense>
    </Router>
  );
}

export default App;
