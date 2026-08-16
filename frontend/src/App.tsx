// App Router Configuration
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import VerifyOtp from './pages/verify-otp';
import ForgotPassword from './pages/forgot-password';
import Layout from './components/Layout';
import Dashboard from './pages/dashboard';
import Profile from './pages/profile';
import Search from './pages/search';
import TicketDetail from './pages/ticket-detail';
import Reservations from './pages/reservations';
import Payment from './pages/payment';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        // Auth Routes
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        // Admin Routes
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        // User Dashboard Routes
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="search" element={<Search />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="profile" element={<Profile />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="payment/:id" element={<Payment />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;