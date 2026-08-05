// SECTION: SIGNUP PAGE
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const response = await authApi.signup(formData);
    
    if (response.error) {
      setError(response.error);
    } else {
      navigate(`/verify-otp?email=${formData.email}&action=signup`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">ثبت‌نام در سامانه</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              name="first_name" 
              placeholder="نام" 
              className="w-full border p-2 rounded" 
              onChange={handleChange} 
              required 
            />
            <input 
              type="text" 
              name="last_name" 
              placeholder="نام خانوادگی" 
              className="w-full border p-2 rounded" 
              onChange={handleChange} 
              required 
            />
          </div>
          <input 
            type="text" 
            name="username" 
            placeholder="نام کاربری" 
            className="w-full border p-2 rounded text-left" 
            dir="ltr"
            onChange={handleChange} 
            required 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="ایمیل" 
            className="w-full border p-2 rounded text-left" 
            dir="ltr"
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="phone_number" 
            placeholder="شماره موبایل" 
            className="w-full border p-2 rounded text-left" 
            dir="ltr"
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="رمز عبور" 
            className="w-full border p-2 rounded text-left" 
            dir="ltr"
            onChange={handleChange} 
            required 
          />
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
          >
            ثبت‌نام
          </button>
        </form>
      </div>
    </div>
  );
}