import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Feedback from '../components/Feedback';

export default function Profile() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <Feedback 
        type="confirm" 
        status="warning" 
        message="آیا از خروج از حساب کاربری خود اطمینان دارید؟" 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
        onConfirm={handleLogout}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b pb-4">پروفایل کاربری</h2>
        
        <div className="py-12 text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="font-medium text-lg">بخش مدیریت اطلاعات کاربری در حال توسعه است</p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-lg font-bold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            خروج از حساب کاربری
          </button>
        </div>
      </div>
    </div>
  );
}