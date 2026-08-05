import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'داشبورد', path: '/dashboard' },
    { name: 'جستجوی بلیت', path: '/dashboard/search' },
    { name: 'بلیت‌های من', path: '/dashboard/reservations' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex-1 flex items-center gap-4">
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-sm">
                  S
                </div>
                <span className="font-extrabold text-xl text-gray-900 hidden sm:block">
                  اسپورت تیکت
                </span>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 justify-center">
              <nav className="flex space-x-4 space-x-reverse">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                      location.pathname === link.path
                        ? 'bg-primary-light text-primary'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex-1 flex items-center justify-end gap-3 sm:gap-5">
              <Link
                to="/dashboard/reservations"
                className="relative p-2 text-gray-400 hover:text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
              </Link>

              <Link to="/dashboard/profile" className="flex items-center gap-2 p-1 border border-transparent rounded-full hover:border-gray-200 focus:outline-none transition-all">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden transition-colors ${location.pathname === '/dashboard/profile' ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'}`}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} border-t border-gray-100 bg-white absolute w-full z-40`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-primary-light text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}