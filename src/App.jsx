import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GroupDataProvider } from "./context/GroupDataContext";

// Import all page components directly
import Dashboard from "./pages/Dashboard";
import Registration from "./pages/Registration";
import ImportantContactsPage from "./pages/ImportantContacts";
import MasterSettings from "./pages/MasterSettings";
import ActiveMembers from "./pages/ActiveMembers";
import PendingApproval from "./pages/PendingApproval";
import MembershipExpired from "./pages/MembershipExpired";
import MemberDetail from "./pages/MemberDetail";
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
import Calendar from "./pages/Calendar";
import PaymentDetails from "./pages/PaymentDetails";
import Resume from "./pages/Resume";
import Feedbacks from "./pages/Feedbacks";
import Circulars from "./pages/Circulars";
import GrievancesActive from "./pages/GrievancesActive";
import GrievancesPending from "./pages/GrievancesPending";
import GrievancesClosed from "./pages/GrievancesClosed";
import Login from "./pages/Login";

function isAuthenticated() {
  return !!localStorage.getItem("token");
}

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <GroupDataProvider>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={<Login />} 
          />
          <Route
            path="/"
            element={
              isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registration"
            element={
              <ProtectedRoute>
                <Registration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members-services/active"
            element={
              <ProtectedRoute>
                <ActiveMembers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members-services/pending-approval"
            element={
              <ProtectedRoute>
                <PendingApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members-services/expired"
            element={
              <ProtectedRoute>
                <MembershipExpired />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members-services/payment-details"
            element={
              <ProtectedRoute>
                <PaymentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-management/accounts"
            element={
              <ProtectedRoute>
                <AdminAccounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-management/user-roles"
            element={
              <ProtectedRoute>
                <UserRoles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-management/role-management"
            element={
              <ProtectedRoute>
                <RoleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event-management/all"
            element={
              <ProtectedRoute>
                <AllEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event-management/upcoming"
            element={
              <ProtectedRoute>
                <UpcomingEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event-management/past"
            element={
              <ProtectedRoute>
                <PastEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification/feedbacks"
            element={
              <ProtectedRoute>
                <Feedbacks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notification/circulars"
            element={
              <ProtectedRoute>
                <Circulars />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grievances/active"
            element={
              <ProtectedRoute>
                <GrievancesActive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grievances/pending"
            element={
              <ProtectedRoute>
                <GrievancesPending />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grievances/closed"
            element={
              <ProtectedRoute>
                <GrievancesClosed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/important-contacts"
            element={
              <ProtectedRoute>
                <ImportantContactsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <Resume />
              </ProtectedRoute>
            }
          />
          <Route
            path="/master-settings"
            element={
              <ProtectedRoute>
                <MasterSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group-data"
            element={
              <ProtectedRoute>
                <GroupData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/smtp-settings"
            element={
              <ProtectedRoute>
                <SMTPSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/message-settings"
            element={
              <ProtectedRoute>
                <MessageSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/master-settings/user-additional-fields"
            element={
              <ProtectedRoute>
                <UserAdditionalFields />
              </ProtectedRoute>
            }
          />
          <Route
            path="/master-settings/company-additional-fields"
            element={
              <ProtectedRoute>
                <CompanyAdditionalFields />
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership-plans"
            element={
              <ProtectedRoute>
                <MembershipPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member/:id"
            element={
              <ProtectedRoute>
                <MemberDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </GroupDataProvider>
  );
}

export default App;
