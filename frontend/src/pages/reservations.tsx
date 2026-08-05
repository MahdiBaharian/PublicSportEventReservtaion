// SECTION: RESERVATIONS PAGE
// Handles displaying, paying, and canceling user reservations

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketApi } from '../services/api';
import Feedback from '../components/Feedback';

interface Reservation {
  reservation_id: number;
  ticket_id: number;
  home_team: string;
  away_team: string;
  sport_type: string;
  ticket_date_time: string;
  venue_city: string;
  quantity: number;
  total_price: string;
  status: string;
  seat_info: string;
  reservation_time: string;
}

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
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
  }, []);

  const translateSportType = (type: string) => {
    const types: Record<string, string> = {
      football: 'فوتبال',
      volleyball: 'والیبال',
      basketball: 'بسکتبال',
    };
    return types[type?.toLowerCase()] || type;
  };

  const translateStatus = (status: string) => {
    const statuses: Record<string, { label: string, color: string }> = {
      pending: { label: 'در انتظار پرداخت', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'پرداخت شده / قطعی', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'لغو شده', color: 'bg-red-100 text-red-800' },
    };
    return statuses[status?.toLowerCase()] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
        setGeneralError(response.error);
      } else {
        setSuccessMessage('بلیت با موفقیت لغو شد و وجه آن مسترد می‌گردد.');
        fetchReservations();
      }
    } catch (err) {
      setGeneralError('خطا در ارتباط با سرور.');
    } finally {
      setIsProcessing(false);
      setCancelId(null);
    }
  };

  const handlePay = async (reservationId: number) => {
    setIsProcessing(true);
    setGeneralError('');

    try {
      const response = await ticketApi.payReservation(reservationId);
      if (response.error) {
        setGeneralError(response.error);
      } else {
        setSuccessMessage('پرداخت با موفقیت انجام شد. بلیت شما قطعی است.');
        fetchReservations();
      }
    } catch (err) {
      setGeneralError('خطا در اتصال به درگاه پرداخت.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
      
      <Feedback 
        type="confirm" 
        status="warning" 
        message="آیا از لغو این بلیت و استرداد وجه اطمینان دارید؟ این عمل غیرقابل بازگشت است." 
        isOpen={cancelId !== null} 
        onClose={() => setCancelId(null)} 
        onConfirm={handleCancel}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="text-xl font-extrabold text-gray-900">تاریخچه بلیت‌ها و رزروهای من</h2>
          <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
            {reservations.length} مورد
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-gray-50 border border-gray-100 rounded-xl p-6 animate-pulse flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.map((res) => {
              const statusInfo = translateStatus(res.status);
              return (
                <div key={res.reservation_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {translateSportType(res.sport_type)}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-black text-gray-900">
                        {res.home_team || 'تیم میزبان'} <span className="text-gray-400 mx-1">VS</span> {res.away_team || 'تیم مهمان'}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span dir="ltr">{formatDate(res.ticket_date_time)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{res.venue_city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col justify-center min-w-[200px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500 text-sm">تعداد:</span>
                        <span className="font-bold text-gray-900">{res.quantity} عدد</span>
                      </div>
                      {res.seat_info && (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-500 text-sm">موقعیت:</span>
                          <span className="font-bold text-gray-900 text-sm">{res.seat_info}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
                        <span className="text-gray-500 text-sm">مبلغ کل:</span>
                        <span className="font-black text-green-600">{Number(res.total_price).toLocaleString('fa-IR')} تومان</span>
                      </div>
                    </div>
                  </div>

                  {res.status !== 'cancelled' && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end items-center">
                      {res.status === 'pending' && (
                        <button
                          onClick={() => handlePay(res.reservation_id)}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-sm"
                        >
                          پرداخت و قطعی کردن
                        </button>
                      )}
                      <button
                        onClick={() => setCancelId(res.reservation_id)}
                        disabled={isProcessing}
                        className="w-full sm:w-auto px-6 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors shadow-sm"
                      >
                        لغو بلیت و استرداد وجه
                      </button>
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
            <Link 
              to="/dashboard/search" 
              className="inline-block bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-md"
            >
              جستجوی مسابقات
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}