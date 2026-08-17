import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import LeadDiscovery from './pages/LeadDiscovery';
import LeadDetail from './pages/LeadDetail';
import SavedLeads from './pages/SavedLeads';
import Projects from './pages/Projects';
import Outreach from './pages/Outreach';
import Analytics from './pages/Analytics';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import LinkedInCallback from './pages/LinkedInCallback';

function DashboardRoutes() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads" element={<LeadDiscovery />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="saved" element={<SavedLeads />} />
        <Route path="projects" element={<Projects />} />
        <Route path="outreach" element={<Outreach />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/app/*" element={<DashboardRoutes />} />
            <Route path="/linkedin-callback" element={<LinkedInCallback />} />
            <Route path="dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="leads" element={<Navigate to="/app/leads" replace />} />
            <Route path="projects" element={<Navigate to="/app/projects" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </HashRouter>
  );
}
