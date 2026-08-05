import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';
import Feedback from '../components/Feedback';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const email = searchParams.get('email') || '';
  const action = searchParams.get('action') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) return;
    
    const expiryKey = `otp_expiry_${email}`;
    const storedExpiry = sessionStorage.getItem(expiryKey);
    const now = Date.now();

    if (storedExpiry && Number(storedExpiry) > now) {
      setTimeLeft(Math.floor((Number(storedExpiry) - now) / 1000));
    } else {
      const newExpiry = now + 120000;
      sessionStorage.setItem(expiryKey, newExpiry.toString());
      setTimeLeft(120);
    }
  }, [email]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim().slice(0, 6).split('');
    
    if (pastedData.some(char => isNaN(Number(char)))) return;

    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };


  const handleResend = async () => {
    setGeneralError('');
    if (action === 'signup') {
      const savedForm = sessionStorage.getItem('signupFormData');
      if (savedForm) {
        const formData = JSON.parse(savedForm);
        const submitData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password,
          username: formData.phone_number
        };
        
        try {
          const response = await authApi.signup(submitData);
          if (response.error) {
            setGeneralError(response.error);
          } else {
            setSuccessMessage('کد تایید مجددا به ایمیل شما ارسال شد.');
            const newExpiry = Date.now() + 120000;
            sessionStorage.setItem(`otp_expiry_${email}`, newExpiry.toString());
            setTimeLeft(120);
          }
        } catch (err) {
          setGeneralError('ارتباط با سرور برقرار نشد.');
        }
      } else {
        setGeneralError('اطلاعات فرم منقضی شده است. لطفا مجددا ثبت‌نام کنید.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setGeneralError('لطفا کد ۶ رقمی را کامل وارد کنید.');
      return;
    }

    try {
      const response = await authApi.verifyOtp({ email, otp: otpString, action });
      
      if (response.error) {
        setGeneralError(response.error);
      } else {
        if (response.access) {
          localStorage.setItem('access', response.access);
          localStorage.setItem('refresh', response.refresh);
        }

        if (action === 'signup') {
          sessionStorage.removeItem('signupFormData');
          sessionStorage.removeItem(`otp_expiry_${email}`);
          setSuccessMessage('ثبت‌نام با موفقیت انجام شد. در حال انتقال به صفحه ورود...');
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        } else {
          sessionStorage.removeItem(`otp_expiry_${email}`);
          setSuccessMessage('تایید با موفقیت انجام شد. در حال انتقال به داشبورد...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      }
    } catch (err) {
      setGeneralError('ارتباط با سرور برقرار نشد. لطفا وضعیت اینترنت یا سرور را بررسی کنید.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
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

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">تایید کد</h2>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">
            کد ۶ رقمی ارسال شده به <br />
            <span className="font-bold text-gray-700" dir="ltr">{email}</span> <br />
            را وارد کنید.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between items-center gap-2" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => { inputRefs.current[index] = el; }}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent transition-all shadow-sm"
              />
            ))}
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md"
          >
            بررسی و تایید
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-5 border-t pt-6">
          <div className="text-gray-600 font-mono text-xl tracking-widest bg-gray-100 px-6 py-2 rounded-lg shadow-inner">
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex flex-col w-full gap-3 mt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={timeLeft > 0}
              className={`w-full py-3 px-4 rounded-lg font-bold transition-all flex justify-center items-center gap-2 ${
                timeLeft === 0 
                  ? 'bg-primary-light text-primary hover:bg-blue-100 border border-primary-light shadow-sm cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              ارسال مجدد کد تایید
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-full py-3 px-4 rounded-lg font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all flex justify-center items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              بازگشت و ویرایش اطلاعات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}