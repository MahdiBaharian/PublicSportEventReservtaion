import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ticketApi } from '../services/api';
import Feedback from '../components/Feedback';

export default function Reservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const response = await ticketApi.getReservations();
      if (Array.isArray(response)) {
        setReservations(response);
      } else if (response.error) {
        setGeneralError(response.error);
      }
    } catch (err) {
      setGeneralError('خطا در دریافت لیست بلیت‌ها.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // بروزرسانی خودکار هر یک دقیقه برای بررسی انقضای 10 دقیقه‌ای
    const interval = setInterval(() => {
      setReservations([...reservations]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const translateSportType = (type: string) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('football')) return 'فوتبال';
    if (t.includes('volleyball')) return 'والیبال';
    if (t.includes('basketball')) return 'بسکتبال';
    return type || 'ورزشی';
  };

  const getStatusInfo = (statusStr: string, isExpired: boolean) => {
    const s = String(statusStr || 'pending').toLowerCase();
    
    if (s.includes('confirm') || s.includes('paid') || s.includes('success')) {
      return { label: 'پرداخت شده', color: 'bg-green-100 text-green-800 border-green-200', type: 'confirmed' };
    }
    if (s.includes('cancel') || s.includes('fail') || s.includes('refund')) {
      return { label: 'لغو شده', color: 'bg-red-100 text-red-800 border-red-200', type: 'cancelled' };
    }
    
    // اگر در انتظار پرداخت باشد و زمانش گذشته باشد
    if (isExpired) {
      return { label: 'منقضی شده (پایان مهلت پرداخت)', color: 'bg-gray-200 text-gray-700 border-gray-300', type: 'expired' };
    }

    return { label: 'در انتظار پرداخت', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', type: 'pending' };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('fa-IR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setIsProcessing(true);
    setGeneralError('');

    try {
      const response = await ticketApi.cancelReservation(cancelId);
      if (response.error) {
        let errorMsg = response.error;
        if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('cancelled')) {
          errorMsg = 'این بلیت قبلاً لغو شده است.';
        }
        setGeneralError(errorMsg);
        fetchReservations();
      } else {
        setSuccessMessage('بلیت با موفقیت لغو شد.');
        fetchReservations();
      }
    } catch (err) {
      setGeneralError('خطا در ارتباط با سرور.');
    } finally {
      setIsProcessing(false);
      setCancelId(null);
    }
  };

  const sortedReservations = [...reservations].sort((a, b) => {
    const statusOrder: Record<string, number> = { pending: 1, confirmed: 2, expired: 3, cancelled: 4, unknown: 5 };
    
    const isExpA = a.reservation_time ? (Date.now() - new Date(a.reservation_time).getTime() > 10 * 60 * 1000) : false;
    const isExpB = b.reservation_time ? (Date.now() - new Date(b.reservation_time).getTime() > 10 * 60 * 1000) : false;

    const orderA = statusOrder[getStatusInfo(a.status || a.state || a.payment_status, isExpA).type] || 5;
    const orderB = statusOrder[getStatusInfo(b.status || b.state || b.payment_status, isExpB).type] || 5;
    return orderA - orderB;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Feedback type="toast" status="error" message={generalError} isOpen={!!generalError} onClose={() => setGeneralError('')} />
      <Feedback type="toast" status="success" message={successMessage} isOpen={!!successMessage} onClose={() => setSuccessMessage('')} />
      <Feedback type="confirm" status="warning" message="آیا از لغو این بلیت اطمینان دارید؟" isOpen={cancelId !== null} onClose={() => setCancelId(null)} onConfirm={handleCancel} />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="text-xl font-extrabold text-gray-900">تاریخچه بلیت‌ها و رزروهای من</h2>
          <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
            {reservations.length} مورد
          </span>
        </div>

        {isLoading ? (
           <div className="flex justify-center py-10">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           </div>
        ) : sortedReservations.length > 0 ? (
          <div className="space-y-4">
            {sortedReservations.map((res) => {
              const resId = res.reservation_id || res.id;
              const sportType = translateSportType(res.sport_type || res.sport || res.category);
              const totalPrice = Number(res.total_price || res.total_amount || res.amount || res.price || 0);
              const matchTitle = `${res.home_team || 'تیم میزبان'} VS ${res.away_team || 'تیم مهمان'}`;
              
              const resTime = res.reservation_time ? new Date(res.reservation_time).getTime() : Date.now();
              const isExpired10Mins = (Date.now() - resTime) > (10 * 60 * 1000);
              
              const statusInfo = getStatusInfo(res.status || res.state || res.payment_status, isExpired10Mins);
              
              const isPending = statusInfo.type === 'pending';
              const isConfirmed = statusInfo.type === 'confirmed';
              
              const matchTime = new Date(res.ticket_date_time).getTime();
              const isMoreThanOneHourLeft = isNaN(matchTime) ? true : ((matchTime - Date.now()) / (1000 * 60 * 60) > 1);

              const showPayButton = isPending;
              const showCancelButton = (isPending || isConfirmed) && isMoreThanOneHourLeft;
              const showActionsBlock = showPayButton || showCancelButton;

              return (
                <div key={resId} className={`bg-white border rounded-xl overflow-hidden transition-shadow ${showActionsBlock ? 'border-gray-200 hover:shadow-md' : 'border-gray-100 opacity-80'}`}>
                  <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                    
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {sportType}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-black text-gray-900" dir="rtl">
                        {res.home_team || 'تیم میزبان'} <span className="text-gray-400 mx-1 text-sm font-sans">VS</span> {res.away_team || 'تیم مهمان'}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span dir="rtl">{formatDate(res.ticket_date_time)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{res.venue_city || 'شهر نامشخص'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col justify-center min-w-[220px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500 text-sm">تعداد:</span>
                        <span className="font-bold text-gray-900">{res.quantity || 1} عدد</span>
                      </div>
                      {res.seat_info && res.seat_info.trim() !== '' && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-500 text-sm">موقعیت:</span>
                          <span className="font-bold text-gray-900 text-sm">{res.seat_info}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
                        <span className="text-gray-500 text-sm">مبلغ کل:</span>
                        <span className="font-black text-green-600">
                          {totalPrice.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    </div>
                  </div>

                  {showActionsBlock && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end items-center">
                      {showPayButton && (
                        <button
                          onClick={() => navigate(`/dashboard/payment/${resId}`, { state: { amount: totalPrice, title: matchTitle } })}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-sm"
                        >
                          تکمیل پرداخت
                        </button>
                      )}
                      
                      {showCancelButton && (
                        <button
                          onClick={() => setCancelId(resId)}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-6 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors shadow-sm"
                        >
                          {isConfirmed ? 'لغو بلیت' : 'انصراف از خرید'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 mb-2">هنوز هیچ رزروی ثبت نکرده‌اید</h3>
            <p className="text-gray-500 mb-6">شما می‌توانید از بخش جستجو، مسابقات مورد علاقه خود را پیدا و بلیت تهیه کنید.</p>
            <Link to="/dashboard/search" className="inline-block bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-md">
              جستجوی مسابقات
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}