import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [chartPeriod, setChartPeriod] = useState('30days');
  const [hoveredBar, setHoveredBar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      activeUsers: 0,
      activeVendors: 0,
      pendingApprovals: 0,
      flaggedReviews: 0
    },
    pendingVendors: [],
    weeklyGrowth: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/auth/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      title: 'Total', 
      subtitle: 'Users', 
      value: dashboardData.stats.totalUsers.toLocaleString(), 
      meta: `${dashboardData.stats.activeUsers} active`, 
      icon: 'group', 
      trend: 'up' 
    },
    { 
      title: 'Active', 
      subtitle: 'Vendors', 
      value: dashboardData.stats.activeVendors.toLocaleString(), 
      meta: 'Approved', 
      icon: 'store', 
      trend: 'up' 
    },
    { 
      title: 'Pending', 
      subtitle: 'Approvals', 
      value: dashboardData.stats.pendingApprovals.toString(), 
      meta: 'Awaiting review', 
      icon: 'schedule', 
      trend: dashboardData.stats.pendingApprovals > 0 ? 'down' : 'up' 
    },
    { 
      title: 'Flagged', 
      subtitle: 'Reviews', 
      value: dashboardData.stats.flaggedReviews.toString(), 
      meta: 'Need attention', 
      icon: 'flag', 
      trend: dashboardData.stats.flaggedReviews > 0 ? 'up' : 'down' 
    },
  ];

  const pending = dashboardData.pendingVendors.map(vendor => ({
    id: vendor._id,
    name: vendor.businessName,
    meta: `Category: ${vendor.category} | Submitted: ${new Date(vendor.createdAt).toLocaleDateString()}`
  }));

  const alerts = [
    { title: 'System maintenance scheduled', time: 'June 25, 2024 at 10:00 PM UTC', icon: '⚙️', color: 'bg-orange-100' },
    { title: 'New admin user added', time: 'June 23, 2024 at 02:15 PM UTC', icon: '👤', color: 'bg-purple-100' },
    { title: 'API performance degradation', time: 'June 23, 2024 at 09:30 AM UTC', icon: '⚠️', color: 'bg-blue-100' },
  ];

  const chartDataSets = {
    '30days': dashboardData.weeklyGrowth.map((week, index) => {
      const maxValue = Math.max(...dashboardData.weeklyGrowth.map(w => w.users), 1);
      return {
        week: week.week,
        height: `${(week.users / maxValue) * 100}%`,
        value: week.users,
        users: week.users
      };
    }),
    '3months': dashboardData.weeklyGrowth.map((week, index) => {
      const maxValue = Math.max(...dashboardData.weeklyGrowth.map(w => w.users), 1);
      return {
        week: week.week,
        height: `${(week.users / maxValue) * 100}%`,
        value: week.users,
        users: week.users
      };
    }),
    '6months': dashboardData.weeklyGrowth.map((week, index) => {
      const maxValue = Math.max(...dashboardData.weeklyGrowth.map(w => w.users), 1);
      return {
        week: week.week,
        height: `${(week.users / maxValue) * 100}%`,
        value: week.users,
        users: week.users
      };
    }),
  };

  const chartData = chartDataSets[chartPeriod];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="lg:ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <button 
              onClick={() => navigate('/admin/vendors')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Vendor</span>
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              {/* Stats Grid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.title} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">{stat.title}</p>
                        <p className="text-xs text-gray-400">{stat.subtitle}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {stat.icon === 'group' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
                        {stat.icon === 'store' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
                        {stat.icon === 'schedule' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        {stat.icon === 'flag' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />}
                      </svg>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className={`text-xs sm:text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.meta}
                    </p>
                  </div>
                ))}
              </section>

              {/* User Growth Chart */}
              <section className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">User Growth</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {chartPeriod === '30days' && 'New sign-ups in the last 30 days'}
                      {chartPeriod === '3months' && 'New sign-ups in the last 3 months'}
                      {chartPeriod === '6months' && 'New sign-ups in the last 6 months'}
                    </p>
                  </div>
                  <select 
                    value={chartPeriod}
                    onChange={(e) => setChartPeriod(e.target.value)}
                    className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
                  >
                    <option value="30days">Last 30 Days</option>
                    <option value="3months">Last 3 Months</option>
                    <option value="6months">Last 6 Months</option>
                  </select>
                </div>

                {/* Bar Chart */}
                <div className="relative">
                  <div className="flex items-end justify-between gap-3 sm:gap-6 h-40 sm:h-48 px-2">
                    {chartData.map((data, index) => (
                      <div 
                        key={data.week} 
                        className="flex-1 flex flex-col items-center gap-2 relative"
                        onMouseEnter={() => setHoveredBar(index)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {/* Tooltip */}
                        {hoveredBar === index && (
                          <div className="absolute -top-12 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg z-10 whitespace-nowrap">
                            <div className="text-center">
                              <div className="font-bold">{data.users.toLocaleString()} users</div>
                              <div className="text-gray-300 text-[10px]">{data.week}</div>
                            </div>
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                        )}
                        
                        <div className="w-full relative" style={{ height: '160px' }}>
                          <div 
                            className={`w-full absolute bottom-0 rounded-t-lg transition-all duration-300 cursor-pointer ${
                              hoveredBar === index 
                                ? 'opacity-100 scale-105' 
                                : hoveredBar !== null 
                                  ? 'opacity-60' 
                                  : 'opacity-100'
                            } ${
                              index === chartData.length - 1 
                                ? 'bg-indigo-600' 
                                : index === chartData.length - 2 
                                  ? 'bg-indigo-400' 
                                  : index === chartData.length - 3 
                                    ? 'bg-indigo-300' 
                                    : 'bg-indigo-200'
                            }`}
                            style={{ height: data.height }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">{data.week}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg font-bold text-gray-900">
                        {chartData.reduce((sum, item) => sum + item.users, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Average</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(chartData.reduce((sum, item) => sum + item.users, 0) / chartData.length).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center col-span-2 sm:col-span-1">
                      <p className="text-xs text-gray-500">Growth Rate</p>
                      <p className="text-lg font-bold text-green-600">+24.5%</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tabs and Pending Approvals */}
              <section>
                <div className="border-b border-gray-200">
                  <div className="flex gap-6 sm:gap-8">
                    <button
                      onClick={() => setActiveTab('pending')}
                      className={`pb-3 text-sm font-semibold transition-colors ${
                        activeTab === 'pending'
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Pending Approvals
                    </button>
                    <button
                      onClick={() => setActiveTab('flagged')}
                      className={`pb-3 text-sm font-semibold transition-colors ${
                        activeTab === 'flagged'
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Flagged Reviews
                    </button>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 space-y-4">
                  {pending.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No pending approvals</p>
                  ) : (
                    pending.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-4 border-b border-gray-100 last:border-0">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{item.meta}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button 
                            onClick={() => window.location.href = '/admin/vendors'}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Right Column - Alerts */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 lg:sticky lg:top-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Recent System Alerts</h2>
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${alert.color} flex items-center justify-center flex-shrink-0 text-base sm:text-lg`}>
                        {alert.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{alert.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
