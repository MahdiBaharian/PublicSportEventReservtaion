import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import VerifyOtp from './pages/verify-otp';
import Layout from './components/Layout';
import Dashboard from './pages/dashboard';
import Profile from './pages/profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="search" element={<div className="p-8 text-center font-bold">بخش جستجوی بلیت (به زودی)</div>} />
          <Route path="reservations" element={<div className="p-8 text-center font-bold">بلیت‌های من (به زودی)</div>} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;