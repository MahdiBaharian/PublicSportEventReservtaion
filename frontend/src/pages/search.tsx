import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketApi } from '../services/api';
import Feedback from '../components/Feedback';

interface Ticket {
  ticket_id: number;
  sport_type: string;
  home_team: string;
  away_team: string;
  venue_city: string;
  price: number;
  ticket_date_time: string;
}

export default function Search() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  const [filters, setFilters] = useState({
    sport_type: '',
    city: '',
    team: '',
    min_price: '',
    max_price: '',
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await ticketApi.getLocations();
        if (!response.error && typeof response === 'object') {
          setCities(Object.keys(response));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchLocations();
    handleSearch();
  }, []);

  const parseJalaliDateTime = (jalaliStr: string) => {
    if (!jalaliStr) return new Date(NaN);
    
    if (jalaliStr.includes('T') || jalaliStr.includes('-')) {
      return new Date(jalaliStr);
    }

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

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setGeneralError('');

    try {
      const response = await ticketApi.search(filters);
      if (Array.isArray(response)) {
        const validTickets = response.filter((t: Ticket) => {
          const matchDate = parseJalaliDateTime(t.ticket_date_time);
          return matchDate.getTime() > Date.now();
        });
        setTickets(validTickets);
      } else if (response.error) {
        setGeneralError(response.error);
      }
    } catch (err) {
      setGeneralError('خطا در دریافت اطلاعات. لطفا وضعیت اینترنت را بررسی کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters({
      sport_type: '',
      city: '',
      team: '',
      min_price: '',
      max_price: '',
    });
  };

  const translateSportType = (type: string) => {
    const types: Record<string, string> = {
      football: 'فوتبال',
      volleyball: 'والیبال',
      basketball: 'بسکتبال',
    };
    return types[type.toLowerCase()] || type;
  };

  return (
    <div className="space-y-6">
      <Feedback 
        type="toast" 
        status="error" 
        message={generalError} 
        isOpen={!!generalError} 
        onClose={() => setGeneralError('')} 
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-extrabold text-gray-900 mb-6 border-b pb-4">جستجوی پیشرفته بلیت</h2>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">نوع مسابقه</label>
              <select
                name="sport_type"
                value={filters.sport_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-gray-900"
              >
                <option value="">همه مسابقات</option>
                <option value="football">فوتبال</option>
                <option value="volleyball">والیبال</option>
                <option value="basketball">بسکتبال</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">شهر برگزاری</label>
              <select
                name="city"
                value={filters.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-gray-900"
              >
                <option value="">همه شهرها</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">نام تیم (میزبان یا مهمان)</label>
              <input
                type="text"
                name="team"
                value={filters.team}
                onChange={handleChange}
                placeholder="مثلا: پرسپولیس"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">حداقل قیمت (تومان)</label>
              <input
                type="number"
                name="min_price"
                value={filters.min_price}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">حداکثر قیمت (تومان)</label>
              <input
                type="number"
                name="max_price"
                value={filters.max_price}
                onChange={handleChange}
                placeholder="بدون محدودیت"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all bg-white text-gray-900"
              />
            </div>
            
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md flex justify-center items-center h-[50px] ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'}`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'جستجو'
                )}
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors shadow-sm h-[50px]"
                title="پاک کردن فیلترها"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">نتایج جستجو ({tickets.length} بلیت)</h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="flex justify-between items-center mb-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
              </div>
            ))}
          </div>
        ) : tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket.ticket_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {translateSportType(ticket.sport_type)}
                </div>
                
                <div className="flex items-center justify-between mt-4 mb-6">
                  <div className="text-center flex-1">
                    <p className="font-extrabold text-lg text-gray-900 truncate">{ticket.home_team}</p>
                  </div>
                  <div className="px-3">
                    <span className="text-gray-400 font-bold text-sm bg-gray-50 px-2 py-1 rounded-md">VS</span>
                  </div>
                  <div className="text-center flex-1">
                    <p className="font-extrabold text-lg text-gray-900 truncate">{ticket.away_team}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>شهر برگزاری: <span className="font-bold text-gray-900">{ticket.venue_city}</span></span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>قیمت پایه: <span className="font-bold text-green-600">{Number(ticket.price).toLocaleString('fa-IR')} تومان</span></span>
                  </div>
                </div>

                <Link 
                  to={`/dashboard/tickets/${ticket.ticket_id}`}
                  className="block w-full text-center bg-gray-50 hover:bg-primary hover:text-white text-primary font-bold py-3 rounded-lg transition-colors border border-gray-100 group-hover:border-primary"
                >
                  مشاهده جزئیات و رزرو
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 mb-2">نتیجه‌ای یافت نشد</h3>
            <p className="text-gray-500">با تغییر فیلترهای جستجو، مجددا تلاش کنید.</p>
            <button 
              onClick={resetFilters}
              className="mt-6 text-primary font-bold hover:underline"
            >
              پاک کردن تمام فیلترها
            </button>
          </div>
        )}
      </div>
    </div>
  );
}