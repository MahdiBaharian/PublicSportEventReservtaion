import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import VerifyOtp from './pages/verify-otp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/dashboard" element={<div className="p-4 text-center mt-10 text-xl font-bold">پنل کاربری (به زودی)</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;