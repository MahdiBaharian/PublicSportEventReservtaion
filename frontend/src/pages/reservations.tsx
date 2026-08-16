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
  const [penaltyInfo, setPenaltyInfo] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState({ reservation_id: null, report_type: 'technical_issue', description: '' });

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
    const interval = setInterval(() => {
      setReservations(prev => [...prev]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const parseJalaliDateTime = (jalaliStr: string) => {
    if (!jalaliStr) return new Date(NaN);
    if (jalaliStr.includes('T') || jalaliStr.includes('-')) return new Date(jalaliStr);
    try {
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      const englishStr = jalaliStr.replace(/[۰-۹]/g, (w) => persianDigits.indexOf(w).toString());
      const dateMatch = englishStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
      const timeMatch = englishStr.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
      if (!dateMatch) return new Date(NaN);
      const jy = parseInt(dateMatch[1]);
      const jm = parseInt(dateMatch[2]);
      const jd = parseInt(dateMatch[3]);
      const h = timeMatch ? parseInt(timeMatch[1]) : 0;
      const m = timeMatch ? parseInt(timeMatch[2]) : 0;
      const s = timeMatch && timeMatch[3] ? parseInt(timeMatch[3]) : 0;
      let jyAdjusted = jy + 1595;
      let days = -355668 + (365 * jyAdjusted) + Math.floor((jyAdjusted / 33) * 8) + Math.floor(((jyAdjusted % 33) + 3) / 4) + jd;
      if (jm < 7) days += (jm - 1) * 31;
      else days += 186 + (jm - 7) * 30;
      let gy = 400 * Math.floor(days / 146097);
      days %= 146097;
      if (days > 36524) {
        gy += 100 * Math.floor(--days / 36524);
        days %= 36524;
        if (days >= 365) days++;
      }
      gy += 4 * Math.floor(days / 1461);
      days %= 1461;
      if (days > 365) {
        gy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
      }
      let gd = days + 1;
      const isLeap = ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0));
      const sal_a = [0, 31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      let gm;
      for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
      const pad = (n: number) => String(n).padStart(2, '0');
      const isoString = `${gy}-${pad(gm)}-${pad(gd)}T${pad(h)}:${pad(m)}:${pad(s)}+03:30`;
      return new Date(isoString);
    } catch (e) {
      return new Date(NaN);
    }
  };

  const translateSportType = (type: string) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('football')) return 'فوتبال';
    if (t.includes('volleyball')) return 'والیبال';
    if (t.includes('basketball')) return 'بسکتبال';
    return type || 'ورزشی';
  };

  const getStatusInfo = (statusStr: string, isExpired: boolean) => {
    const s = String(statusStr || '').toLowerCase();
    if (s === 'paid' || s.includes('success')) return { label: 'پرداخت شده', color: 'bg-green-100 text-green-800 border-green-200', type: 'confirmed' };
    if (s === 'cancelled' || s.includes('fail')) return { label: 'لغو شده', color: 'bg-red-100 text-red-800 border-red-200', type: 'cancelled' };
    if (s === 'reserved' || s === 'pending') {
      if (isExpired) return { label: 'منقضی شده (پایان مهلت پرداخت)', color: 'bg-gray-200 text-gray-700 border-gray-300', type: 'expired' };
      return { label: 'در انتظار پرداخت', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', type: 'pending' };
    }
    return { label: 'نامشخص', color: 'bg-gray-100 text-gray-800 border-gray-200', type: 'unknown' };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return dateString.replace(/:\d{2}$/, '');
  };

  const handleCancelClick = async (res: any) => {
    if (res.reservation_status === 'paid') {
      setIsProcessing(true);
      try {
        const response = await ticketApi.checkPenalty(res.reservation_id);
        if (response.error) {
          setGeneralError(response.error);
        } else {
          setPenaltyInfo({ id: res.reservation_id, ...response });
        }
      } catch (err) {
        setGeneralError('خطا در ارتباط با سرور.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      setCancelId(res.reservation_id);
    }
  };

  const handleConfirmCancel = async () => {
    const idToCancel = penaltyInfo ? penaltyInfo.id : cancelId;
    if (!idToCancel) return;
    setIsProcessing(true);
    setGeneralError('');
    try {
      const isPaid = penaltyInfo !== null;
      const response = isPaid 
        ? await ticketApi.cancelPaidReservation(idToCancel)
        : await ticketApi.cancelReservation(idToCancel);
      if (response.error) {
        setGeneralError(response.error);
      } else {
        setSuccessMessage(response.message || 'بلیت با موفقیت لغو شد.');
      }
      fetchReservations();
    } catch (err) {
      setGeneralError('خطا در ارتباط با سرور.');
    } finally {
      setIsProcessing(false);
      setCancelId(null);
      setPenaltyInfo(null);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportData.reservation_id) return;
    setIsProcessing(true);
    try {
      const res = await ticketApi.submitReport(reportData.reservation_id, reportData.report_type, reportData.description);
      if (res.error) setGeneralError(res.error);
      else setSuccessMessage('گزارش شما با موفقیت ثبت شد.');
    } catch (err) {
      setGeneralError('خطا در ثبت گزارش');
    } finally {
      setIsProcessing(false);
      setReportModalOpen(false);
      setReportData({ reservation_id: null, report_type: 'technical_issue', description: '' });
    }
  };

  const sortedReservations = [...reservations].sort((a, b) => {
    const statusOrder: Record<string, number> = { pending: 1, confirmed: 2, expired: 3, cancelled: 3, unknown: 4 };
    const aResDate = parseJalaliDateTime(a.reserved_at);
    const bResDate = parseJalaliDateTime(b.reserved_at);
    const isExpA = aResDate.getTime() ? (Date.now() - aResDate.getTime() > 10 * 60 * 1000) : false;
    const isExpB = bResDate.getTime() ? (Date.now() - bResDate.getTime() > 10 * 60 * 1000) : false;
    const orderA = statusOrder[getStatusInfo(a.reservation_status, isExpA).type] || 5;
    const orderB = statusOrder[getStatusInfo(b.reservation_status, isExpB).type] || 5;
    if (orderA !== orderB) return orderA - orderB;
    return bResDate.getTime() - aResDate.getTime();
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Feedback type="toast" status="error" message={generalError} isOpen={!!generalError} onClose={() => setGeneralError('')} />
      <Feedback type="toast" status="success" message={successMessage} isOpen={!!successMessage} onClose={() => setSuccessMessage('')} />
      
      <Feedback 
        type="confirm" 
        status="warning" 
        message={penaltyInfo ? `مبلغ جریمه: ${penaltyInfo.penalty_amount?.toLocaleString('fa-IR')} تومان. مبلغ قابل استرداد: ${penaltyInfo.refund_amount?.toLocaleString('fa-IR')} تومان. آیا از لغو بلیت اطمینان دارید؟` : "آیا از لغو این بلیت اطمینان دارید؟"} 
        isOpen={cancelId !== null || penaltyInfo !== null} 
        onClose={() => { setCancelId(null); setPenaltyInfo(null); }} 
        onConfirm={handleConfirmCancel} 
      />

      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">ثبت گزارش مشکل</h3>
            <form onSubmit={handleReportSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">نوع مشکل</label>
                <select 
                  className="w-full p-2 border rounded" 
                  value={reportData.report_type} 
                  onChange={e => setReportData({...reportData, report_type: e.target.value})}
                >
                  <option value="technical_issue">مشکل فنی</option>
                  <option value="payment_issue">مشکل پرداخت</option>
                  <option value="seat_issue">مشکل صندلی</option>
                  <option value="venue_issue">مشکل ورزشگاه</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">توضیحات</label>
                <textarea 
                  required
                  className="w-full p-2 border rounded" 
                  rows={4}
                  value={reportData.description} 
                  onChange={e => setReportData({...reportData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReportModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">انصراف</button>
                <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-blue-600 text-white rounded">ثبت گزارش</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="text-xl font-extrabold text-gray-900">تاریخچه بلیت‌ها و رزروهای من</h2>
          <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-sm">
            {reservations.length} مورد
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        ) : sortedReservations.length > 0 ? (
          <div className="space-y-4">
            {sortedReservations.map((res) => {
              const resId = res.reservation_id;
              const sportType = translateSportType(res.sport_type || res.sport || res.category);
              const unitPrice = Number(res.price || 0);
              const quantity = Number(res.quantity || 1);
              const totalPrice = unitPrice * quantity;
              const matchTitle = `${res.home_team || 'تیم میزبان'} VS ${res.away_team || 'تیم مهمان'}`;
              const resDate = parseJalaliDateTime(res.reserved_at);
              const matchDate = parseJalaliDateTime(res.ticket_date_time);
              const isExpired10Mins = resDate.getTime() ? (Date.now() - resDate.getTime() > 10 * 60 * 1000) : false;
              const statusInfo = getStatusInfo(res.reservation_status, isExpired10Mins); 
              const isPending = statusInfo.type === 'pending';
              const isConfirmed = statusInfo.type === 'confirmed';
              const isCanceledOrExpired = statusInfo.type === 'cancelled' || statusInfo.type === 'expired';
              const isMatchTimeValid = matchDate.getTime() ? (matchDate.getTime() > Date.now()) : false;

              const showPayButton = isMatchTimeValid && isPending;
              const showCancelButton = isMatchTimeValid && (isPending || isConfirmed);
              const showReReserveButton = isMatchTimeValid && isCanceledOrExpired;
              const showReportButton = isConfirmed;

              const showActionsBlock = showPayButton || showCancelButton || showReReserveButton || showReportButton;

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
                        {res.venue_city && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span>{res.venue_city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full md:w-auto bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col justify-center min-w-[220px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-500 text-sm">تعداد:</span>
                        <span className="font-bold text-gray-900">{quantity} عدد</span>
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
                      {showReReserveButton && (
                        <button
                          onClick={() => navigate(`/dashboard/tickets/${res.ticket_id}`)}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-sm"
                        >
                          رزرو مجدد
                        </button>
                      )}
                      {showCancelButton && (
                        <button
                          onClick={() => handleCancelClick(res)}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-6 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors shadow-sm"
                        >
                          {isConfirmed ? 'لغو بلیت' : 'انصراف از خرید'}
                        </button>
                      )}
                      {showReportButton && (
                        <button
                          onClick={() => {
                            setReportData({ ...reportData, reservation_id: resId });
                            setReportModalOpen(true);
                          }}
                          disabled={isProcessing}
                          className="w-full sm:w-auto px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors shadow-sm"
                        >
                          ثبت گزارش
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
            <Link to="/dashboard/search" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-md">
              جستجوی مسابقات
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}