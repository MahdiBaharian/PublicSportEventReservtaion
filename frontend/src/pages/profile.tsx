// SECTION: PROFILE PAGE
// Manages user profile information editing with strict client-side validation

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import Feedback from '../components/Feedback';

export default function Profile() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    city: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const phoneRegex = /^09\d{9}$/;

    if (formData.phone_number.trim() && !phoneRegex.test(formData.phone_number)) {
      newErrors.phone_number = 'شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setGeneralError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const filteredData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value.trim() !== '')
      );

      if (Object.keys(filteredData).length === 0) {
        setGeneralError('لطفا حداقل یک فیلد را برای بروزرسانی پر کنید.');
        setIsLoading(false);
        return;
      }

      const response = await userApi.updateProfile(filteredData);
      
      if (response.error) {
        setGeneralError(response.error);
      } else {
        setSuccessMessage('اطلاعات پروفایل با موفقیت بروزرسانی شد.');
        setFormData({
          first_name: '',
          last_name: '',
          phone_number: '',
          city: '',
        });
      }
    } catch (err) {
      setGeneralError('ارتباط با سرور برقرار نشد. لطفا وضعیت اینترنت را بررسی کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Feedback 
        type="toast" 
        status="error" 
        message={generalError} 
        isOpen={!!generalError} 
        onClose={() => setGeneralError('')} 
      />
      <Feedback 
        type="toast" 
        status="success" 
        message={successMessage} 
        isOpen={!!successMessage} 
        onClose={() => setSuccessMessage('')} 
      />
      <Feedback 
        type="confirm" 
        status="warning" 
        message="آیا از خروج از حساب کاربری خود اطمینان دارید؟" 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
        onConfirm={handleLogout}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b pb-4">تنظیمات پروفایل</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">نام جدید</label>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name}
                placeholder="نام خود را وارد کنید"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${errors.first_name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary focus:border-transparent'}`}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Feedback type="inline" status="error" message={errors.first_name} />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">نام خانوادگی جدید</label>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name}
                placeholder="نام خانوادگی خود را وارد کنید"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${errors.last_name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary focus:border-transparent'}`}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Feedback type="inline" status="error" message={errors.last_name} />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">شماره موبایل جدید</label>
              <input 
                type="text" 
                name="phone_number" 
                value={formData.phone_number}
                placeholder="09..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${errors.phone_number ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary focus:border-transparent'}`}
                dir="ltr"
                onChange={handleChange}
                disabled={isLoading}
              />
              <Feedback type="inline" status="error" message={errors.phone_number} />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">شهر محل سکونت</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city}
                placeholder="نام شهر خود را وارد کنید"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${errors.city ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary focus:border-transparent'}`}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Feedback type="inline" status="error" message={errors.city} />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full md:w-auto px-8 text-white font-bold py-3 rounded-lg transition-colors duration-200 shadow-md flex justify-center items-center gap-2 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال ثبت...
                </>
              ) : (
                'ذخیره تغییرات'
              )}
            </button>
          </div>
        </form>

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-red-600 font-bold mb-1">منطقه خطر</h3>
            <p className="text-gray-500 text-sm">با خروج از حساب برای رزرو مجدد نیاز به ورود خواهید داشت.</p>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center justify-center gap-2 text-red-600 border border-red-200 hover:text-white hover:bg-red-600 px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm"
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