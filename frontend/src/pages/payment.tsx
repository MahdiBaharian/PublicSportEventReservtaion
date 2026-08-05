// SECTION: PAYMENT SIMULATION PAGE
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketApi } from '../services/api';
import Feedback from '../components/Feedback';

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handlePay = async () => {
    if (!id) return;
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
        setSuccessMessage('پرداخت با موفقیت انجام شد. در حال بازگشت به پنل...');
        setTimeout(() => {
          navigate('/dashboard/reservations');
        }, 2000);
      }
    } catch (err) {
      setGeneralError('خطا در اتصال به درگاه پرداخت.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Feedback 
        type="toast" 
        status="error" 
        message={generalError} 
        isOpen={!!generalError} 
        onClose={() => setGeneralError('')} 
      />
      <Feedback 
        type="modal" 
        status="success" 
        message={successMessage} 
        isOpen={!!successMessage} 
      />

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">درگاه پرداخت امن</h2>
          <p className="text-gray-500 text-sm mt-1">تایید پرداخت شماره رزرو: {id}</p>
        </div>

        <div className="p-8">
          <p className="text-gray-600 text-center mb-8 leading-relaxed">
            این یک صفحه شبیه‌ساز پرداخت است. برای قطعی شدن بلیت خود، روی دکمه پرداخت کلیک کنید.
          </p>

          <div className="space-y-3">
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md flex justify-center items-center gap-2 ${isProcessing ? 'bg-blue-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال تایید پرداخت...
                </>
              ) : (
                'تایید پرداخت'
              )}
            </button>

            <button
              onClick={() => navigate('/dashboard/reservations')}
              disabled={isProcessing}
              className="w-full text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 font-bold py-3 px-4 rounded-xl transition-colors"
            >
              انصراف و بازگشت
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}