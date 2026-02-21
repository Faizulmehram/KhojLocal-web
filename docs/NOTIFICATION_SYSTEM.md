# Notification System Documentation

## Overview
The KhoojLocal application now has a comprehensive notification system that keeps users informed about their orders, bookings, and other important events.

## Features

### User Notifications
Users receive notifications for:
- **Order Created**: When they place a new order
- **Order Confirmed**: When vendor accepts their order
- **Order Rejected**: When vendor rejects their order with reason
- **Order Status Updates**: When order status changes (In Progress, Out for Delivery, Delivered, etc.)
- **Order Cancelled**: When they cancel their order
- **Booking Created**: When they create a new booking
- **Booking Confirmed**: When vendor accepts their booking
- **Booking Rejected**: When vendor rejects their booking with reason
- **Booking Status Updates**: When booking status changes (In Progress, Completed, etc.)

### Notification Features
- **Real-time Badge**: Shows unread count on bell icon in navbar
- **Dropdown View**: Quick access to recent notifications from navbar
- **Full Page View**: Comprehensive notifications page at `/notifications`
- **Filtering**: Filter by all, unread, orders, or bookings
- **Mark as Read**: Individual or bulk mark as read
- **Delete**: Remove individual notifications
- **Clear Read**: Bulk delete all read notifications
- **Auto-expire**: Notifications automatically delete after 30 days
- **Priority Levels**: Low, Medium, High priority notifications
- **Clickable**: Click notification to navigate to related order/booking

## Backend Architecture

### Models
**Location**: `server/models/Notification.js`

Schema includes:
- `user`: Reference to User model
- `type`: Enum (order, booking, payment, vendor, system, review)
- `title`: Notification title
- `message`: Notification message
- `link`: Optional navigation link
- `relatedOrder`: Optional Order reference
- `relatedBooking`: Optional Booking reference
- `isRead`: Boolean flag
- `priority`: Enum (low, medium, high)
- `createdAt`, `updatedAt`: Timestamps

### Controller
**Location**: `server/controllers/notificationController.js`

Functions:
- `createNotification()`: Helper to create notifications
- `getNotifications()`: Get user's notifications with pagination
- `getUnreadCount()`: Get count of unread notifications
- `markAsRead()`: Mark single notification as read
- `markAllAsRead()`: Mark all notifications as read
- `deleteNotification()`: Delete single notification
- `clearReadNotifications()`: Delete all read notifications

### Routes
**Location**: `server/routes/notificationRoutes.js`

Endpoints:
- `GET /api/notifications` - Get notifications (with pagination & filters)
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/clear-read` - Clear all read
- `PUT /api/notifications/:id/read` - Mark single as read
- `DELETE /api/notifications/:id` - Delete single notification

All routes require authentication via `protect` middleware.

### Notification Triggers
Notifications are automatically created in:

1. **Order Controller** (`server/controllers/orderController.js`)
   - Order creation
   - Order cancellation

2. **Booking Controller** (`server/controllers/bookingController.js`)
   - Booking creation

3. **Vendor Request Controller** (`server/routes/controllers/vendorRequestController.js`)
   - Order acceptance/rejection by vendor
   - Booking acceptance/rejection by vendor

4. **Status Controller** (`server/routes/controllers/statusController.js`)
   - Order status updates
   - Booking status updates

## Frontend Components

### NotificationDropdown
**Location**: `frontend/components/NotificationDropdown.jsx`

Features:
- Bell icon with unread badge
- Dropdown panel with recent 20 notifications
- Mark as read/delete buttons
- Auto-refresh every 30 seconds
- Click to navigate to related item
- "View all" link to full page

### Notifications Page
**Location**: `frontend/pages/User Pages/Notifications.jsx`

Features:
- Full list of up to 50 notifications
- Filter options (All, Unread, Orders, Bookings)
- Bulk actions (Mark all read, Clear read)
- Refresh button
- Individual notification actions
- Empty states for no notifications

### Navbar Integration
**Location**: `frontend/components/Navbar.jsx`

The notification dropdown is integrated into the main navbar, replacing the simple bell icon.

## Usage

### For Users
1. Click bell icon in navbar to view recent notifications
2. Click "View all notifications" for full page
3. Click notification to navigate to related order/booking
4. Use checkmark to mark as read
5. Use trash icon to delete
6. Use filters on full page to find specific notifications

### For Developers

#### Creating a Notification
```javascript
import { createNotification } from './controllers/notificationController';

await createNotification({
  user: userId,
  type: 'order', // or 'booking', 'payment', etc.
  title: 'Order Confirmed',
  message: 'Your order has been confirmed by the vendor.',
  link: `/my-orders/${orderId}`,
  relatedOrder: orderId,
  priority: 'high', // 'low', 'medium', or 'high'
});
```

#### Fetching Notifications (Frontend)
```javascript
const response = await fetch('http://localhost:5000/api/notifications', {
  headers: {
    'Authorization': `Bearer ${user.token}`,
  },
});
const data = await response.json();
```

## Database Indexes
The Notification model includes optimized indexes for:
- User ID + Read status + Created date (compound index)
- Auto-expiration after 30 days (TTL index)

## Security
- All notification endpoints require authentication
- Users can only access their own notifications
- Notifications are user-scoped in all queries

## Future Enhancements
Possible improvements:
- Real-time notifications via WebSockets
- Email notifications for important events
- Push notifications for mobile
- Notification preferences/settings
- Group notifications by type
- Archive functionality
- Search within notifications

## API Examples

### Get Unread Count
```bash
GET /api/notifications/unread-count
Authorization: Bearer <token>

Response:
{
  "count": 5
}
```

### Get Notifications
```bash
GET /api/notifications?page=1&limit=20&unread=true
Authorization: Bearer <token>

Response:
{
  "notifications": [...],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 3,
    "limit": 20
  },
  "unreadCount": 5
}
```

### Mark as Read
```bash
PUT /api/notifications/:id/read
Authorization: Bearer <token>

Response:
{
  "message": "Notification marked as read",
  "notification": {...}
}
```

## Troubleshooting

### Notifications not showing
1. Verify user is authenticated
2. Check browser console for API errors
3. Verify notification routes are registered in `server/app.js`
4. Check MongoDB connection

### Unread count not updating
1. Verify frontend is polling `/unread-count` endpoint
2. Check notification creation in backend logs
3. Verify `isRead` field is being updated correctly

## Testing
To test notifications:
1. Create an order as a user
2. Accept/reject the order as a vendor
3. Update order status as vendor
4. Check user's notification dropdown and page
5. Verify all notification actions work (read, delete, clear)
