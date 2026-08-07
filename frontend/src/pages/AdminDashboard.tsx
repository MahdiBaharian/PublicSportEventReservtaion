// Admin Dashboard Component
import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'reports' | 'cancellations' | 'users' | 'addTicket'>('reports');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [ticketData, setTicketData] = useState({
    sport_type: 'football',
    home_team: '',
    away_team: '',
    ticket_date_time: '',
    venue_city: '',
    price: '',
    total_capacity: '',
    remaining_capacity: '',
    category: 'Regular'
  });

  // Fetch Data Function
  const fetchData = async () => {
    if (activeTab === 'addTicket') return;
    
    setLoading(true);
    setError('');
    try {
      let res;
      if (activeTab === 'reports') {
        res = await adminApi.getReports();
      } else if (activeTab === 'cancellations') {
        res = await adminApi.getCancellations();
      } else if (activeTab === 'users') {
        res = await adminApi.getUsers(); 
      }
      
      if (res && !res.error) {
        setData(res);
      } else {
        setError(res?.error || 'خطا در دریافت اطلاعات از سرور');
      }
    } catch (err) {
      setError('ارتباط با سرور برقرار نشد');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleUpdateReport = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
    try {
      await adminApi.updateReport(id, newStatus);
      fetchData();
    } catch (err) {
      setError('خطا در به‌روزرسانی وضعیت گزارش');
    }
  };

  // Create Ticket Submit
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await adminApi.createTicket({
        ...ticketData,
        price: parseFloat(ticketData.price),
        total_capacity: parseInt(ticketData.total_capacity),
        remaining_capacity: parseInt(ticketData.remaining_capacity)
      });

      if (res.error) {
        setError(res.error);
      } else {
        setMessage('بلیت با موفقیت ایجاد شد و در سیستم ثبت گردید.');
        setTicketData({
          sport_type: 'football', home_team: '', away_team: '', ticket_date_time: '', 
          venue_city: '', price: '', total_capacity: '', remaining_capacity: '', category: 'Regular'
        });
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور برای ساخت بلیت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12" dir="rtl">
      <div className="bg-gray-900 text-white p-5 shadow-md">
        <h1 className="text-2xl font-black max-w-7xl mx-auto">داشبورد مدیریت کل</h1>
      </div>

      <div className="max-w-7xl mx-auto mt-8 flex flex-col md:flex-row gap-6 px-4">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-1/4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-fit">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActiveTab('reports')}
                className={`w-full text-right px-4 py-3 rounded-lg font-bold transition-colors ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                گزارش‌ها و مشکلات
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('cancellations')}
                className={`w-full text-right px-4 py-3 rounded-lg font-bold transition-colors ${activeTab === 'cancellations' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                بلیت‌های لغو شده
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full text-right px-4 py-3 rounded-lg font-bold transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                مدیریت کاربران
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('addTicket')}
                className={`w-full text-right px-4 py-3 rounded-lg font-bold transition-colors ${activeTab === 'addTicket' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                افزودن بلیت جدید
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-3/4 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 font-bold">{error}</div>}
          {message && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 font-bold">{message}</div>}

          {loading && activeTab !== 'addTicket' ? (
            <div className="flex justify-center items-center h-64">
               <span className="text-gray-500 font-bold">در حال بارگذاری اطلاعات...</span>
            </div>
          ) : (
            <>
              {/* Reports Section */}
              {activeTab === 'reports' && (
                <div>
                  <h2 className="text-xl font-bold mb-6 border-b border-gray-100 pb-3">مدیریت گزارش‌ها</h2>
                  <div className="space-y-4">
                    {data.length === 0 ? <p className="text-gray-500 text-center py-10">هیچ گزارشی در سیستم ثبت نشده است.</p> : data.map((item: any, index: number) => (
                      <div key={`report-${item.report_id}-${index}`} className="border border-gray-200 p-5 rounded-lg bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex gap-2 items-center mb-2">
                            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold">رزرو: {item.reservation_id}</span>
                            <span className="font-bold text-gray-900">{item.report_type}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{item.description}</p>
                        </div>
                        <button 
                          onClick={() => handleUpdateReport(item.report_id, item.report_status)}
                          className={`px-6 py-2 rounded-lg text-sm font-bold w-full sm:w-auto ${item.report_status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                        >
                          {item.report_status === 'pending' ? 'در انتظار بررسی' : 'بررسی شده'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellations Section */}
              {activeTab === 'cancellations' && (
                <div>
                  <h2 className="text-xl font-bold mb-6 border-b border-gray-100 pb-3">بلیت‌های لغو شده سیستم</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-4 font-bold text-sm text-gray-700 border-b">کد رزرو</th>
                          <th className="p-4 font-bold text-sm text-gray-700 border-b">شناسه کاربر</th>
                          <th className="p-4 font-bold text-sm text-gray-700 border-b">شناسه مسابقه</th>
                          <th className="p-4 font-bold text-sm text-gray-700 border-b">زمان رزرو</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.length === 0 ? (
                          <tr><td colSpan={4} className="p-8 text-center text-gray-500 border-b">اطلاعاتی یافت نشد.</td></tr>
                        ) : data.map((item: any, index: number) => (
                          <tr key={`cancel-${item.reservation_id}-${item.ticket_id}-${index}`} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                            <td className="p-4 font-mono font-bold text-gray-900">{item.reservation_id}</td>
                            <td className="p-4 text-gray-600">{item.user_id}</td>
                            <td className="p-4 text-gray-600">{item.ticket_id}</td>
                            <td className="p-4 text-sm text-gray-500" dir="ltr">{item.reserved_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Users Section */}
              {activeTab === 'users' && (
                <div>
                  <h2 className="text-xl font-bold mb-6 border-b border-gray-100 pb-3">لیست کاربران سیستم</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-4 font-bold text-sm text-gray-700 border-b">شناسه</th>
                          <th className="p-4 font-bold text-sm text-gray-700 border-b">نام کاربری</th>
                          <th className="p-4 font-bold text-sm text-gray-700 border-b">نقش</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.length === 0 ? (
                          <tr><td colSpan={3} className="p-8 text-center text-gray-500 border-b">کاربری یافت نشد یا اندپوینت API متصل نیست.</td></tr>
                        ) : data.map((user: any, index: number) => (
                          <tr key={`user-${user.user_id}-${index}`} className="hover:bg-gray-50 border-b border-gray-100">
                            <td className="p-4 font-mono">{user.user_id}</td>
                            <td className="p-4">{user.username}</td>
                            <td className="p-4">{user.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Add Ticket Section */}
              {activeTab === 'addTicket' && (
                <div>
                  <h2 className="text-xl font-bold mb-6 border-b border-gray-100 pb-3">ثبت رویداد ورزشی جدید</h2>
                  <form onSubmit={handleCreateTicket} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">رشته ورزشی</label>
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={ticketData.sport_type}
                        onChange={(e) => setTicketData({...ticketData, sport_type: e.target.value})}
                      >
                        <option value="football">فوتبال</option>
                        <option value="volleyball">والیبال</option>
                        <option value="basketball">بسکتبال</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">دسته‌بندی (VIP/Regular)</label>
                      <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={ticketData.category} onChange={(e) => setTicketData({...ticketData, category: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">نام تیم میزبان</label>
                      <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={ticketData.home_team} onChange={(e) => setTicketData({...ticketData, home_team: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">نام تیم مهمان</label>
                      <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={ticketData.away_team} onChange={(e) => setTicketData({...ticketData, away_team: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">شهر محل برگزاری</label>
                      <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={ticketData.venue_city} onChange={(e) => setTicketData({...ticketData, venue_city: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">تاریخ و ساعت (فرمت میلادی)</label>
                      <input type="datetime-local" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={ticketData.ticket_date_time} onChange={(e) => setTicketData({...ticketData, ticket_date_time: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">قیمت بلیت (تومان)</label>
                      <input type="number" min="0" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={ticketData.price} onChange={(e) => setTicketData({...ticketData, price: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 text-gray-700">ظرفیت کل</label>
                        <input type="number" min="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={ticketData.total_capacity} onChange={(e) => setTicketData({...ticketData, total_capacity: e.target.value})} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 text-gray-700">ظرفیت فعلی</label>
                        <input type="number" min="1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={ticketData.remaining_capacity} onChange={(e) => setTicketData({...ticketData, remaining_capacity: e.target.value})} required />
                      </div>
                    </div>
                    
                    <div className="col-span-1 sm:col-span-2 mt-6 pt-4 border-t border-gray-100">
                      <button type="submit" disabled={loading} className="bg-gray-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-black transition-colors w-full sm:w-auto shadow-md">
                        {loading ? 'در حال ثبت در دیتابیس...' : 'ثبت نهایی بلیت در سیستم'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}