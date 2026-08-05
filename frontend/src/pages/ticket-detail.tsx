import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketApi } from '../services/api';
import Feedback from '../components/Feedback';

interface TicketDetails {
  ticket_id: number;
  sport_type: string;
  home_team: string;
  away_team: string;
  ticket_date_time: string;
  venue_city: string;
  price: string;
  remaining_capacity: number;
  category: string;
  organizer: string;
  tournament_name: string;
  venue_name: string;
  facilities: string;
}

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [reserveData, setReserveData] = useState({
    quantity: 1,
    row: '',
    seat: '',
  });

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const response = await ticketApi.getDetails(id);
        if (response.error) {
          setGeneralError(response.error);
        } else {
          setTicket(response);
        }
      } catch (err) {
        setGeneralError('خطا در دریافت اطلاعات بلیت.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const translateSportType = (type: string) => {
    const types: Record<string, string> = {
      football: 'فوتبال',
      volleyball: 'والیبال',
      basketball: 'بسکتبال',
    };
    return types[type.toLowerCase()] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    if (reserveData.quantity < 1 || reserveData.quantity > ticket.remaining_capacity) {
      setGeneralError('تعداد بلیت نامعتبر است.');
      return;
    }

    setIsReserving(true);
    setGeneralError('');

    let seatInfo = '';
    if (reserveData.row || reserveData.seat) {
      const rowStr = reserveData.row ? `ردیف ${reserveData.row}` : '';
      const seatStr = reserveData.seat ? `صندلی ${reserveData.seat}` : '';
      seatInfo = [rowStr, seatStr].filter(Boolean).join(' - ');
    }

    try {
      const response = await ticketApi.reserve({
        ticket_id: ticket.ticket_id,
        quantity: reserveData.quantity,
        seat_info: seatInfo,
      });

      if (response.error) {
        setGeneralError(response.error);
      } else {
        setSuccessMessage('رزرو موقت با موفقیت انجام شد. در حال انتقال به لیست بلیت‌های من...');
        setTimeout(() => {
          navigate('/dashboard/reservations');
        }, 2000);
      }
    } catch (err) {
      setGeneralError('خطا در ارتباط با سرور.');
    } finally {
      setIsReserving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-2">بلیت یافت نشد</h3>
        <button onClick={() => navigate('/dashboard/search')} className="mt-4 text-primary font-bold hover:underline">
          بازگشت به جستجو
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-white text-sm font-bold px-4 py-2 rounded-bl-xl z-10">
            {translateSportType(ticket.sport_type)}
          </div>
          
          <div className="relative z-10">
            <div className="text-center text-gray-400 text-sm font-bold mb-6 tracking-wider">
              {ticket.tournament_name}
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-black truncate">{ticket.home_team}</h1>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <span className="text-gray-500 font-black text-xl mb-2">VS</span>
              </div>
              
              <div className="flex-1 text-center md:text-right">
                <h1 className="text-3xl md:text-5xl font-black truncate">{ticket.away_team}</h1>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-300">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span dir="rtl" className="font-mono text-sm">{formatDate(ticket.ticket_date_time)}</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{ticket.venue_city}، {ticket.venue_name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-4">اطلاعات تکمیلی</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="block text-gray-500 text-sm mb-1">برگزارکننده</span>
                <span className="font-bold text-gray-900">{ticket.organizer || 'نامشخص'}</span>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="block text-gray-500 text-sm mb-1">نوع بلیت / جایگاه</span>
                <span className="font-bold text-gray-900">{ticket.category || 'عادی'}</span>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 sm:col-span-2">
                <span className="block text-gray-500 text-sm mb-1">امکانات ویژه</span>
                <span className="font-bold text-gray-900 leading-relaxed">{ticket.facilities || 'ندارد'}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-end mb-6">
                <span className="text-gray-600 font-bold">مبلغ بلیت</span>
                <span className="text-2xl font-black text-green-600">{Number(ticket.price).toLocaleString('fa-IR')} <span className="text-sm font-bold">تومان</span></span>
              </div>
              
              <div className="flex justify-between items-center mb-8 border-t border-gray-200 pt-4">
                <span className="text-gray-600 text-sm">ظرفیت باقی‌مانده</span>
                <span className={`font-bold px-2 py-1 rounded-md text-sm ${ticket.remaining_capacity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {ticket.remaining_capacity.toLocaleString('fa-IR')} نفر
                </span>
              </div>

              {ticket.remaining_capacity > 0 ? (
                <form onSubmit={handleReserve} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">تعداد بلیت</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={ticket.remaining_capacity}
                      value={reserveData.quantity}
                      onChange={(e) => setReserveData({...reserveData, quantity: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-gray-900 text-center font-bold text-lg"
                      disabled={isReserving}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">ردیف (اختیاری)</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        value={reserveData.row}
                        onChange={(e) => setReserveData({...reserveData, row: e.target.value.replace(/\D/g, '')})}
                        placeholder="مثلا: 2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-gray-900 text-center font-bold"
                        disabled={isReserving}
                        dir="ltr"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">صندلی (اختیاری)</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        value={reserveData.seat}
                        onChange={(e) => setReserveData({...reserveData, seat: e.target.value.replace(/\D/g, '')})}
                        placeholder="مثلا: 10"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-gray-900 text-center font-bold"
                        disabled={isReserving}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isReserving}
                    className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md flex justify-center items-center gap-2 mt-6 ${isReserving ? 'bg-blue-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'}`}
                  >
                    {isReserving ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        در حال رزرو...
                      </>
                    ) : (
                      'تایید و رزرو موقت'
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center leading-relaxed mt-2">
                    پس از رزرو، ۱۰ دقیقه برای پرداخت فرصت دارید.
                  </p>
                </form>
              ) : (
                <div className="bg-red-50 text-red-600 text-center font-bold py-4 rounded-xl border border-red-100">
                  ظرفیت این مسابقه تکمیل شده است
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}