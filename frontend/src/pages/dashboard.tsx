import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketApi } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ active: 0, paid: 0, cancelled: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await ticketApi.getReservations();
        if (Array.isArray(res)) {
          let active = 0, paid = 0, cancelled = 0;
          res.forEach((r) => {
            const s = String(r.reservation_status || '').toLowerCase();
            if (s === 'paid' || s.includes('success')) {
              paid += 1;
            } else if (s === 'cancelled' || s.includes('fail')) {
              cancelled += 1;
            } else if (s === 'reserved' || s === 'pending') {
              active += 1;
            }
          });
          setStats({ active, paid, cancelled });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">به سامانه اسپورت تیکت خوش آمدید</h1>
          <p className="text-gray-600">برای مشاهده مسابقات ورزشی و رزرو بلیت از بخش جستجو استفاده کنید.</p>
        </div>
        <Link 
          to="/dashboard/search" 
          className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          جستجوی بلیت
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">بلیت‌های فعال</h3>
            <p className="text-2xl font-black text-primary">{stats.active.toLocaleString('fa-IR')}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">پرداخت‌های موفق</h3>
            <p className="text-2xl font-black text-green-600">{stats.paid.toLocaleString('fa-IR')}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">بلیت‌های لغوشده</h3>
            <p className="text-2xl font-black text-red-600">{stats.cancelled.toLocaleString('fa-IR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}