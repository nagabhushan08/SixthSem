import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AmbulanceRequest from './pages/AmbulanceRequest';
import HospitalSearch from './pages/HospitalSearch';
import BloodSearch from './pages/BloodSearch';
import AdminDashboard from './pages/AdminDashboard';
import DriverDashboard from './pages/DriverDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import BloodBankDashboard from './pages/BloodBankDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f',
    },
    secondary: {
      main: '#1976d2',
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ambulance-request"
        element={
          <ProtectedRoute>
            <AmbulanceRequest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospitals"
        element={
          <ProtectedRoute>
            <HospitalSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blood-banks"
        element={
          <ProtectedRoute>
            <BloodSearch />
          </ProtectedRoute>
        }
      />
      {user?.role === 'SUPER_ADMIN' && (
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      )}
      {user?.role === 'AMBULANCE_DRIVER' && (
        <Route
          path="/driver"
          element={
            <ProtectedRoute>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
      )}
      {user?.role === 'HOSPITAL_ADMIN' && (
        <Route
          path="/hospital"
          element={
            <ProtectedRoute>
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />
      )}
      {user?.role === 'BLOOD_BANK_ADMIN' && (
        <Route
          path="/blood-bank"
          element={
            <ProtectedRoute>
              <BloodBankDashboard />
            </ProtectedRoute>
          }
        />
      )}
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
