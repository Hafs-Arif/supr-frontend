import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./Components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "./Layouts/AdminLayout/AdminLayout";
import Dashboard from "./Pages/Admin/Dashboard/Dashboard";
import BannersANDoffers from "./Pages/Admin/BannersANDoffers/BannersANDoffers";
import LoginComponent from "./Components/Auth/Login";
import ManageAdmin from "./Pages/Admin/ManageAdmin/ManageAdmin";
import AddAdmin from "./Pages/Admin/ManageAdmin/AddAdmin";
import Users from "./Pages/Admin/Users/Users";
import ActiveUsers from "./Pages/Admin/Users/ActiveUsers";
import Earning from "./Pages/Admin/ServiceProviders/Earning";
import ServiceProviders from "./Pages/Admin/ServiceProviders/ServiceProviders";
import PendingVarification from "./Pages/Admin/ServiceProviders/PendingVarification";
import Zone from "./Pages/Admin/Pricing&Zone/Zone";
import CreatyeZone from "./Pages/Admin/Pricing&Zone/CreateZone";
import SurgePricingMap from "./Pages/Admin/Pricing&Zone/SurgePricingMap";
import Services from "./Pages/Admin/Trip/Services";
import Addons from "./Pages/Admin/Trip/Addons";
import Analytics from "./Pages/Admin/Analytics/Analytics";
import Orders from "./Pages/Admin/Orders/Orders";
import SOSList from "./Pages/Admin/SOS/SOSList";
import SOSActive from "./Pages/Admin/SOS/SOSActive";
import SOSTrigger from "./Pages/Admin/SOS/SOSTrigger";
import SOSDetails from "./Pages/Admin/SOS/SOSDetails";
import FraudStats from "./Pages/Admin/Fraud/FraudStats";
import FraudPatterns from "./Pages/Admin/Fraud/FraudPatterns";
import FraudDetails from "./Pages/Admin/Fraud/FraudDetails";
import { AuthProvider, useAuth } from "./Components/Auth/AuthContext";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";

function App() {
  function LoginWrapper() {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null;
    return isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <LoginComponent />;
  }
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/signup" />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard/stats" element={<Dashboard />} />
            <Route path="all-services" element={<Services />} />
            <Route path="all-addons" element={<Addons />} />
            <Route path="all-users" element={<Users />} />
            <Route path="active-users" element={<ActiveUsers />} />
            <Route path="all-providers" element={<ServiceProviders />} /> 
            <Route path="pending-verification" element={<PendingVarification />} />
            <Route path="providers/earning" element={<Earning />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="orders" element={<Orders />} />
            <Route path="all-zones" element={<Zone />} />
            <Route path="map-view" element={<SurgePricingMap />} />
            <Route path="create-zone" element={<CreatyeZone />} />
            <Route path="banners-and-offers" element={<BannersANDoffers />} />
            <Route path="manage-admin" element={<ManageAdmin />} />
            <Route path="add-admin" element={<AddAdmin />} />
            <Route path="sos" element={<SOSList />} />
            <Route path="sos/active" element={<SOSActive />} />
            <Route path="sos/trigger" element={<SOSTrigger />} />
            <Route path="sos/:id" element={<SOSDetails />} />
            <Route path="fraud/stats" element={<FraudStats />} />
            <Route path="fraud/patterns" element={<FraudPatterns />} />
            <Route path="fraud/patterns/:id" element={<FraudDetails />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;