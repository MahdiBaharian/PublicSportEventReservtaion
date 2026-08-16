import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ticketApi } from '../services/api';
import Feedback from '../components/Feedback';

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { amount, title } = location.state || { amount: 0, title: 'بلیت مسابقه ورزشی' };

  const [isProcessing, setIsProcessing] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Captcha State
  const [captchaValue, setCaptchaValue] = useState('');
  
  // Show PIN State
  const [showPin, setShowPin] = useState(false);

  const [cardData, setCardData] = useState({
    cardNumberFormatted: '',
    cardNumberRaw: '',
    cvv2: '',
    month: '',
    year: '',
    captcha: '',
    pin: ''
  });

  const [timeLeft, setTimeLeft] = useState(600);

  // Refs for Auto-focus
  const cvv2Ref = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const captchaRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);

  // Generate Captcha Function
  const generateCaptcha = () => {
    setCaptchaValue(Math.floor(Math.random() * 90000 + 10000).toString());
  };

  // Initial Mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setGeneralError('زمان پرداخت به پایان رسید.');
      setTimeout(() => navigate('/dashboard/reservations'), 3000);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formattedValue = rawValue.replace(/(.{4})/g, '$1 ').trim();
    setCardData({ ...cardData, cardNumberRaw: rawValue, cardNumberFormatted: formattedValue });
    
    // Auto-focus to CVV2
    if (rawValue.length === 16) {
      cvv2Ref.current?.focus();
    }
  };

  // Handle Payment Submission
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (cardData.cardNumberRaw.length < 16 || !cardData.cvv2 || !cardData.pin) {
      setGeneralError('لطفا اطلاعات کارت بانکی را کامل وارد کنید.');
      setCardData({ ...cardData, captcha: '' });
      generateCaptcha();
      return;
    }

    if (cardData.captcha !== captchaValue) {
      setGeneralError('کد امنیتی اشتباه است.');
      setCardData({ ...cardData, captcha: '' });
      generateCaptcha();
      return;
    }

    setIsProcessing(true);
    setGeneralError('');

    try {
      const response = await ticketApi.payReservation(Number(id));
      if (response.error) {
        let errorMsg = response.error;
        if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('confirmed') || errorMsg.toLowerCase().includes('paid')) {
          errorMsg = 'این بلیت قبلاً پرداخت شده است.';
        } else if (errorMsg.toLowerCase().includes('cancelled') || errorMsg.toLowerCase().includes('منقضی')) {
          errorMsg = 'این بلیت لغو شده و یا زمان پرداخت آن به پایان رسیده است.';
        }
        setGeneralError(errorMsg);
        setCardData({ ...cardData, captcha: '' });
        generateCaptcha();
      } else {
        setSuccessMessage('پرداخت با موفقیت انجام شد. کد پیگیری: ' + Math.floor(Math.random() * 900000 + 100000));
        setTimeout(() => {
          navigate('/dashboard/reservations');
        }, 3000);
      }
    } catch (err) {
      setGeneralError('خطا در اتصال به درگاه پرداخت.');
      setCardData({ ...cardData, captcha: '' });
      generateCaptcha();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-4 px-4 pb-12" dir="rtl">
      <Feedback type="toast" status="error" message={generalError} isOpen={!!generalError} onClose={() => setGeneralError('')} />
      <Feedback type="modal" status="success" message={successMessage} isOpen={!!successMessage} />

      <div className="bg-white rounded-t-2xl shadow-sm border border-gray-200 border-b-4 border-b-blue-600 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
            شاپرک
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">درگاه پرداخت اینترنتی</h1>
            <p className="text-sm text-gray-500">پرداخت امن شاپرک</p>
          </div>
        </div>
        <div className="text-left">
          <div className="text-gray-500 text-sm mb-1">زمان باقی‌مانده</div>
          <div className="font-mono text-2xl font-bold text-red-600 tracking-widest bg-red-50 px-4 py-1 rounded-lg">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row bg-white rounded-b-2xl shadow-sm border border-gray-200 border-t-0 overflow-hidden">

        <div className="lg:w-1/3 bg-gray-50 p-6 sm:p-8 border-b lg:border-b-0 lg:border-l border-gray-200">
          <h2 className="font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">اطلاعات پذیرنده</h2>

          <div className="space-y-5">
            <div>
              <span className="block text-xs text-gray-500 mb-1">نام پذیرنده</span>
              <span className="font-bold text-gray-900">سامانه اسپورت تیکت</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">شماره پذیرنده</span>
              <span className="font-mono text-gray-900" dir="ltr">789456123</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">بابت</span>
              <span className="font-bold text-gray-900 text-sm leading-relaxed">{title} (شماره رزرو: {id})</span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <span className="block text-sm text-gray-500 mb-2">مبلغ قابل پرداخت</span>
              <div className="text-left text-green-600">
                <span className="text-3xl font-black">{Number(amount || 0).toLocaleString('fa-IR')}</span>
                <span className="text-sm font-bold mr-1">تومان</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-2/3 p-6 sm:p-8">
          <form onSubmit={handlePay} className="space-y-6">

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">شماره کارت</label>
              <input
                type="text"
                maxLength={19}
                value={cardData.cardNumberFormatted}
                onChange={handleCardChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl font-mono tracking-widest transition-all"
                dir="ltr"
                placeholder="---- ---- ---- ----"
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">شماره شناسایی دوم (CVV2)</label>
                <input
                  type="text"
                  maxLength={4}
                  ref={cvv2Ref}
                  value={cardData.cvv2}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCardData({ ...cardData, cvv2: val });
                    // Auto-focus to Year
                    if (val.length === 4) yearRef.current?.focus();
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono tracking-widest transition-all"
                  dir="ltr"
                  placeholder="3 یا 4 رقم"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">تاریخ انقضای کارت</label>
                <div className="flex items-center gap-2" dir="ltr">
                  <input
                    type="text"
                    maxLength={2}
                    ref={monthRef}
                    value={cardData.month}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setCardData({ ...cardData, month: val });
                      // Auto-focus to Captcha
                      if (val.length === 2) captchaRef.current?.focus();
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono transition-all"
                    placeholder="ماه"
                    disabled={isProcessing}
                  />
                  <span className="text-gray-400 font-bold">/</span>
                  <input
                    type="text"
                    maxLength={2}
                    ref={yearRef}
                    value={cardData.year}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setCardData({ ...cardData, year: val });
                      // Auto-focus to Month
                      if (val.length === 2) monthRef.current?.focus();
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono transition-all"
                    placeholder="سال"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">کد امنیتی</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={5}
                  ref={captchaRef}
                  value={cardData.captcha}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCardData({ ...cardData, captcha: val });
                    // Auto-focus to PIN
                    if (val.length === 5) pinRef.current?.focus();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono tracking-widest transition-all"
                  dir="ltr"
                  disabled={isProcessing}
                />
                <div className="w-32 bg-gray-200 rounded-lg flex items-center justify-center font-mono text-xl font-bold tracking-widest text-gray-700 italic select-none">
                  {captchaValue}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">رمز اینترنتی (رمز دوم)</label>
              <div className="relative flex w-full">
                <input
                  type={showPin ? "text" : "password"}
                  ref={pinRef}
                  value={cardData.pin}
                  onChange={e => setCardData({ ...cardData, pin: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono tracking-widest transition-all"
                  dir="ltr"
                  placeholder="رمز دوم"
                  disabled={isProcessing}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  tabIndex={-1}
                >
                  {showPin ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200 mt-8">
              <button
                type="submit"
                disabled={isProcessing}
                className={`flex-1 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md flex justify-center items-center gap-2 ${isProcessing ? 'bg-blue-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isProcessing ? 'در حال پردازش...' : 'پرداخت'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard/reservations')}
                disabled={isProcessing}
                className="w-1/3 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 font-bold py-3 px-4 rounded-xl transition-colors"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}