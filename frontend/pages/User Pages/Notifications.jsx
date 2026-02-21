import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, Filter, RefreshCw } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'order', 'booking'
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.token) {
        navigate('/');
        return;
      }

      let url = 'http://localhost:5000/api/notifications?limit=50';
      if (filter === 'unread') {
        url += '&unread=true';
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        let filteredNotifications = data.notifications;

        // Apply type filter
        if (filter === 'order' || filter === 'booking') {
          filteredNotifications = filteredNotifications.filter(
            n => n.type === filter
          );
        }

        setNotifications(filteredNotifications);
        setUnreadCount(data.unreadCount);
      } else if (response.status === 401) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.token) return;

      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.token) return;

      const response = await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.token) return;

      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const deletedNotif = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearReadNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.token) return;

      const response = await fetch('http://localhost:5000/api/notifications/clear-read', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => !notif.isRead));
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTypeIcon = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="order">Orders</option>
                <option value="booking">Bookings</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchNotifications}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-md font-medium"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={clearReadNotifications}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md font-medium"
              >
                Clear read
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-teal-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Unread indicator */}
                    <div className="flex-shrink-0 mt-1">
                      {!notification.isRead ? (
                        <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                      ) : (
                        <div className="w-3 h-3"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div
                      onClick={() => handleNotificationClick(notification)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                          {getTypeIcon(notification.type)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">{getTimeAgo(notification.createdAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4 text-gray-600" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
