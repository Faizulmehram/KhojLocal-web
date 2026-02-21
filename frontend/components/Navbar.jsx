import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X, MapPin, MessageSquare } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = (searchQuery || '').trim();
    if (q.length > 0) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Search */}
          <div className="flex items-center gap-4 flex-1">
            <a onClick={() => navigate('/main')} className="flex items-center gap-2 cursor-pointer">
              <MapPin className="h-6 w-6 text-teal-600" />
              <span className="text-lg font-bold">KhoojLocal</span>
            </a>

            {/* Desktop Search */}
            <form className="hidden md:flex items-center gap-2 flex-1 max-w-xl" onSubmit={handleSearch}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for services, food, or products..."
                  className="w-full rounded-lg border-0 bg-gray-100 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right Nav */}
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-6">
              <a onClick={() => navigate('/my-bookings')} className="text-sm font-medium hover:text-teal-600 cursor-pointer">My Bookings</a>
              <a onClick={() => navigate('/my-orders')} className="text-sm font-medium hover:text-teal-600 cursor-pointer">My Orders</a>
              <a onClick={() => navigate('/messages')} className="text-sm font-medium hover:text-teal-600 cursor-pointer">Messages</a>
            </nav>

            <NotificationDropdown />

            <button onClick={() => navigate('/messages')} className="md:hidden p-2 rounded-md hover:bg-gray-100" aria-label="Messages">
              <MessageSquare className="h-5 w-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md md:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <button
              onClick={handleLogout}
              className="hidden md:block px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3">
            <form className="flex items-center gap-2" onSubmit={handleSearch}>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, food or products..."
                className="flex-1 rounded-lg border-0 bg-gray-100 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
              >
                Search
              </button>
            </form>
          </div>
          <div className="px-4 pb-4 flex flex-col gap-2">
            <a onClick={() => { navigate('/my-bookings'); setMobileMenuOpen(false); }} className="text-sm font-medium py-2 hover:text-teal-600 cursor-pointer">My Bookings</a>
            <a onClick={() => { navigate('/my-orders'); setMobileMenuOpen(false); }} className="text-sm font-medium py-2 hover:text-teal-600 cursor-pointer">My Orders</a>
            <a onClick={() => { navigate('/messages'); setMobileMenuOpen(false); }} className="text-sm font-medium py-2 hover:text-teal-600 cursor-pointer">Messages</a>
            <button
              onClick={handleLogout}
              className="text-sm font-medium py-2 text-left hover:text-teal-600"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
