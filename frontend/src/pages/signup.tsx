import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

export default function Signup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const pwd = formData.password;
  const isTyping = pwd.length > 0;
  const hasMinLen = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const isPasswordValid = hasMinLen && hasUpper && hasLower;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isPasswordValid) {
      setError('لطفا تمامی شرایط رمز عبور را رعایت کنید.');
      return;
    }

    const response = await authApi.signup(formData);
    
    if (response.error) {
      setError(response.error);
    } else {
      navigate(`/verify-otp?email=${formData.email}&action=signup`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">ثبت‌نام در سامانه</h2>
          <p className="text-gray-500 mt-2 text-sm">حساب کاربری جدید ایجاد کنید</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">نام</label>
              <input 
                type="text" 
                name="first_name" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-gray-900" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">نام خانوادگی</label>
              <input 
                type="text" 
                name="last_name" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-gray-900" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">نام کاربری</label>
            <input 
              type="text" 
              name="username" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-gray-900" 
              dir="ltr"
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">ایمیل</label>
            <input 
              type="email" 
              name="email" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-gray-900" 
              dir="ltr"
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">شماره موبایل</label>
            <input 
              type="text" 
              name="phone_number" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-gray-900" 
              dir="ltr"
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-700 text-sm font-bold">رمز عبور</label>
              
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white text-gray-900" 
                dir="ltr"
                onChange={handleChange} 
                required 
              />
              <button
                type="button"
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 hover:text-primary transition-colors"
                onClick={() => setShowPassword(!showPassword)}
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
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md mt-4"
          >
            ایجاد حساب
          </button>
        </form>
      </div>
    </div>
  );
}