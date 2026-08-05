import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const response = await authApi.login(formData);
    
    if (response.error) {
      setError(response.error);
    } else {
      localStorage.setItem('access', response.access);
      localStorage.setItem('refresh', response.refresh);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">ورود به حساب</h2>
          <p className="text-gray-500 mt-2 text-sm">جهت رزرو بلیت وارد سامانه شوید</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">ایمیل یا شماره موبایل</label>
            <input 
              type="text" 
              name="identifier" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900"
              dir="ltr"
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">رمز عبور</label>
            <input 
              type="password" 
              name="password" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900" 
              dir="ltr"
              onChange={handleChange} 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md"
          >
            ورود به سامانه
          </button>
        </form>
      </div>
    </div>
  );
}