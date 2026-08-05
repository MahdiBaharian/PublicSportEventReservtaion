import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const email = searchParams.get('email');
  const action = searchParams.get('action');

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const response = await authApi.verifyOtp({ email, otp, action });
    
    if (response.error) {
      setError(response.error);
    } else {
      if (response.access) {
        localStorage.setItem('access', response.access);
        localStorage.setItem('refresh', response.refresh);
      }
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-2">تایید حساب کاربری</h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          کد ارسال شده به {email} را وارد کنید.
        </p>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            maxLength={6}
            placeholder="کد ۶ رقمی" 
            className="w-full border p-2 rounded text-center text-xl tracking-widest" 
            dir="ltr"
            onChange={(e) => setOtp(e.target.value)} 
            required 
          />
          
          <button 
            type="submit" 
            className="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 transition"
          >
            تایید و ادامه
          </button>
        </form>
      </div>
    </div>
  );
}