import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ticketApi } from '../services/api';
import Feedback from '../components/Feedback';

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // اطلاعات پاس داده شده از صفحه رزرو
  const { amount, title } = location.state || { amount: 0, title: 'بلیت مسابقه ورزشی' };

  const [isProcessing, setIsProcessing] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // فیلدهای فرم پرداخت (صرفا نمایشی)
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cvv2: '',
    month: '',
    year: '',
    captcha: '',
    pin: ''
  });

  const [timeLeft, setTimeLeft] = useState(600); // 10 دقیقه

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

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    // اعتبارسنجی ساده کلاینت
    if (cardData.cardNumber.length < 16 || !cardData.cvv2 || !cardData.pin) {
      setGeneralError('لطفا اطلاعات کارت بانکی را کامل وارد کنید.');
      return;
    }

    setIsProcessing(true);
    setGeneralError('');

    try {
      const response = await ticketApi.payReservation(Number(id));
      if (response.error) {
        let errorMsg = response.error;
        if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('confirmed')) {
          errorMsg = 'این بلیت قبلاً پرداخت شده است.';
        } else if (errorMsg.toLowerCase().includes('cancelled')) {
          errorMsg = 'این بلیت لغو شده و قابل پرداخت نیست.';
        }
        setGeneralError(errorMsg);
      } else {
        setSuccessMessage('پرداخت با موفقیت انجام شد. کد پیگیری: ' + Math.floor(Math.random() * 900000 + 100000));
        setTimeout(() => {
          navigate('/dashboard/reservations');
        }, 3000);
      }
    } catch (err) {
      setGeneralError('خطا در اتصال به درگاه پرداخت.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-4 px-4 pb-12" dir="rtl">
      <Feedback type="toast" status="error" message={generalError} isOpen={!!generalError} onClose={() => setGeneralError('')} />
      <Feedback type="modal" status="success" message={successMessage} isOpen={!!successMessage} />

      {/* هدر درگاه */}
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
        
        {/* اطلاعات فاکتور */}
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

        {/* فرم پرداخت */}
        <div className="lg:w-2/3 p-6 sm:p-8">
          <form onSubmit={handlePay} className="space-y-6">
            
            {/* شماره کارت */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">شماره کارت</label>
              <input 
                type="text" 
                maxLength={16}
                value={cardData.cardNumber}
                onChange={e => setCardData({...cardData, cardNumber: e.target.value.replace(/\D/g, '')})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl font-mono tracking-[0.2em] transition-all"
                dir="ltr"
                placeholder="---- ---- ---- ----"
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CVV2 */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">شماره شناسایی دوم (CVV2)</label>
                <input 
                  type="text" 
                  maxLength={4}
                  value={cardData.cvv2}
                  onChange={e => setCardData({...cardData, cvv2: e.target.value.replace(/\D/g, '')})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono tracking-widest transition-all"
                  dir="ltr"
                  placeholder="3 یا 4 رقم"
                  disabled={isProcessing}
                />
              </div>

              {/* تاریخ انقضا */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">تاریخ انقضای کارت</label>
                <div className="flex items-center gap-2" dir="ltr">
                  <input 
                    type="text" 
                    maxLength={2}
                    value={cardData.month}
                    onChange={e => setCardData({...cardData, month: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono transition-all"
                    placeholder="ماه"
                    disabled={isProcessing}
                  />
                  <span className="text-gray-400 font-bold">/</span>
                  <input 
                    type="text" 
                    maxLength={2}
                    value={cardData.year}
                    onChange={e => setCardData({...cardData, year: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono transition-all"
                    placeholder="سال"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>

            {/* کد امنیتی */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">کد امنیتی</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  maxLength={5}
                  value={cardData.captcha}
                  onChange={e => setCardData({...cardData, captcha: e.target.value.replace(/\D/g, '')})}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono tracking-widest transition-all"
                  dir="ltr"
                  disabled={isProcessing}
                />
                <div className="w-32 bg-gray-200 rounded-lg flex items-center justify-center font-mono text-xl font-bold tracking-widest text-gray-700 italic select-none">
                  {Math.floor(Math.random() * 90000 + 10000)}
                </div>
              </div>
            </div>

            {/* رمز پویا */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">رمز اینترنتی (رمز دوم)</label>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value={cardData.pin}
                  onChange={e => setCardData({...cardData, pin: e.target.value.replace(/\D/g, '')})}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono tracking-widest transition-all"
                  dir="ltr"
                  placeholder="رمز پویا"
                  disabled={isProcessing}
                />
                <button 
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-3 rounded-lg transition-colors border border-gray-300 whitespace-nowrap text-sm"
                >
                  درخواست رمز پویا
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