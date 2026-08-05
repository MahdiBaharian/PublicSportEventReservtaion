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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">ورود به حساب کاربری</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            name="identifier" 
            placeholder="ایمیل یا شماره موبایل" 
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
            ورود
          </button>
        </form>
      </div>
    </div>
  );
}