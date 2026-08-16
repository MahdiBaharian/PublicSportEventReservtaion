import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import Feedback from '../components/Feedback';

export default function Profile() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    city: '',
    password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const pwd = formData.password;
  const isTyping = pwd.length > 0;
  const hasMinLen = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const isPasswordValid = hasMinLen && hasUpper && hasLower;

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const response = await userApi.getProfile();
        if (response && !response.error && response.data) {
          setFormData(prev => ({
            ...prev,
            first_name: response.data.first_name || '',
            last_name: response.data.last_name || '',
            email: response.data.email || '',
            phone_number: response.data.phone_number || '',
            city: response.data.city || '',
          }));
        } else {
          setGeneralError(response?.error || 'خطا در دریافت اطلاعات پروفایل');
        }
      } catch (err) {
        setGeneralError('امکان دریافت اطلاعات پروفایل وجود ندارد');
      } finally {
        setIsFetching(false);
      }
    };

    loadProfileData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^09\d{9}$/;

    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      newErrors.email = 'فرمت ایمیل نامعتبر است.';
    }

    if (formData.phone_number.trim() && !phoneRegex.test(formData.phone_number)) {
      newErrors.phone_number = 'شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد.';
    }

    if (isTyping) {
      if (!isPasswordValid) {
        newErrors.password = 'رمز عبور شرایط لازم را ندارد.';
      }
      if (!formData.confirm_password) {
        newErrors.confirm_password = 'تکرار رمز عبور الزامی است.';
      } else if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'رمز عبور و تکرار آن یکسان نیستند.';
      }
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
      const submitData: Record<string, string> = {};
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'confirm_password' && value.trim() !== '') {
          submitData[key] = value;
        }
      });

      if (Object.keys(submitData).length === 0) {
        setGeneralError('لطفا حداقل یک فیلد را برای بروزرسانی پر کنید.');
        setIsLoading(false);
        return;
      }

      const response = await userApi.updateProfile(submitData);
      
      if (response.error) {
        setGeneralError(response.error);
      } else {
        setSuccessMessage('اطلاعات پروفایل با موفقیت بروزرسانی شد.');
        setFormData(prev => ({
          ...prev,
          password: '',
          confirm_password: ''
        }));
      }
    } catch (err) {
      setGeneralError('ارتباط با سرور برقرار نشد. لطفا وضعیت اینترنت را بررسی کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
              <label className="block text-gray-700 text-sm font-bold mb-2">نام</label>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name}
                placeholder="نام خود را وارد کنید"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${errors.first_name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'}`}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Feedback type="inline" status="error" message={errors.first_name} />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">نام خانوادگی</label>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name}
                placeholder="نام خانوادگی خود را وارد کنید"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${errors.last_name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'}`}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Feedback type="inline" status="error" message={errors.last_name} />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">ایمیل</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email}
                placeholder="ایمیل خود را وارد کنید"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'}`}
                dir="ltr"
                onChange={handleChange}
                disabled={isLoading}
              />
              <Feedback type="inline" status="error" message={errors.email} />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">شماره موبایل</label>
              <input 
                type="text" 
                name="phone_number" 
                value={formData.phone_number}
                placeholder="09..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${errors.phone_number ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'}`}
                dir="ltr"
                onChange={handleChange}
                disabled={isLoading}
              />
              <Feedback type="inline" status="error" message={errors.phone_number} />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">شهر محل سکونت</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city}
                placeholder="نام شهر خود را وارد کنید"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${errors.city ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'}`}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Feedback type="inline" status="error" message={errors.city} />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">تغییر رمز عبور (اختیاری)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700 text-sm font-bold">رمز عبور جدید</label>
                  <div className="relative group flex items-center justify-center cursor-help">
                    {!isTyping ? (
                      <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : isPasswordValid ? (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-white border border-gray-200 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <div className="text-xs font-bold text-gray-700 mb-2">شرایط رمز عبور:</div>
                      <ul className="space-y-1 text-xs">
                        <li className={`flex items-center gap-1 ${hasMinLen ? 'text-green-600' : 'text-gray-500'}`}>
                          {hasMinLen ? '✓' : '✗'} حداقل ۸ کاراکتر
                        </li>
                        <li className={`flex items-center gap-1 ${hasUpper ? 'text-green-600' : 'text-gray-500'}`}>
                          {hasUpper ? '✓' : '✗'} حداقل یک حرف بزرگ (A-Z)
                        </li>
                        <li className={`flex items-center gap-1 ${hasLower ? 'text-green-600' : 'text-gray-500'}`}>
                          {hasLower ? '✓' : '✗'} حداقل یک حرف کوچک (a-z)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password}
                    className={`w-full pr-4 pl-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'}`}
                    dir="ltr"
                    onChange={handleChange} 
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 left-0 pl-4 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors z-10"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                <Feedback type="inline" status="error" message={errors.password} />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">تکرار رمز عبور جدید</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirm_password" 
                    value={formData.confirm_password}
                    className={`w-full pr-4 pl-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all bg-white text-gray-900 ${errors.confirm_password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'}`}
                    dir="ltr"
                    onChange={handleChange} 
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 left-0 pl-4 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors z-10"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                <Feedback type="inline" status="error" message={errors.confirm_password} />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full md:w-auto px-8 text-white font-bold py-3 rounded-lg transition-colors duration-200 shadow-md flex justify-center items-center gap-2 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
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