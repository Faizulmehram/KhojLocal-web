# Vendor Approval Workflow

## Overview
This document explains the complete vendor registration and approval workflow implemented in the KhoojLocal platform.

## Workflow Steps

### 1. Vendor Registration
**File:** `frontend/pages/Vendor Pages/VendorReg.jsx`
- Vendor fills out registration form with:
  - Owner name
  - Email
  - Password
  - Phone
  - Business name
  - Category
  - Address (street, city, state, zip code, country)
  - Description
  - Services offered
- Form submits POST request to `/api/auth/vendor/register`
- Backend saves vendor with `status: "Pending"` in MongoDB
- Vendor receives success message

### 2. Admin Reviews Pending Applications
**File:** `frontend/pages/Admin Pages/VendorApplicationReview.jsx`
- Admin logs into admin panel
- Navigates to "Vendor Application Review" page
- Page fetches pending vendors via GET `/api/admin/vendors/pending`
- Displays list of pending vendors with:
  - Business Name
  - Category
  - Registration Date
  - Status badge
- Admin can click on any vendor to view detailed information

### 3. Vendor Detail View
**Features:**
- Owner Name
- Contact Email
- Contact Phone
- Category
- Business Address (formatted)
- Description
- Services Offered (if any)

### 4. Approval/Rejection Actions
**Approve:**
- Admin clicks "Approve" button
- Sends PUT request to `/api/admin/vendors/:id` with `{status: 'Approved'}`
- Backend updates:
  - `status: "Approved"`
  - `isActive: true`
  - `approvedAt: Date.now()`
  - `approvedBy: adminId`
- Success alert shown
- Vendor list refreshes automatically

**Reject:**
- Admin clicks "Reject" button
- Sends PUT request to `/api/admin/vendors/:id` with `{status: 'Rejected'}`
- Backend updates `status: "Rejected"`
- Success alert shown
- Vendor list refreshes automatically

### 5. Vendor Appears on User Main Page
**File:** `frontend/pages/User Pages/MainPage.jsx`
- Once vendor is approved, it becomes visible to users
- Main page fetches approved vendors via GET `/api/vendors`
- Displays top 5 approved vendors in "Recommended For You" section
- Each vendor card shows:
  - Business name initial (as avatar)
  - Category
  - Business name
  - Description
  - Rating (placeholder: 4.5)
  - Review count
  - City location
  - "View Details" button
- Users can click "View Details" to see full business information

## API Endpoints Used

### Authentication
- `POST /api/auth/vendor/register` - Register new vendor (status: Pending)
- `POST /api/auth/vendor/login` - Vendor login (requires Approved status)
- `POST /api/auth/admin/login` - Admin login

### Admin Management (Protected - Admin Only)
- `GET /api/admin/vendors/pending` - Get all pending vendor applications
- `PUT /api/admin/vendors/:id` - Update vendor status (Approve/Reject)
- `GET /api/admin/vendors` - Get all vendors (any status)

### Public Access
- `GET /api/vendors` - Get all approved and active vendors
- `GET /api/vendors/:id` - Get single vendor details

## Database Schema

### Vendor Model
```javascript
{
  ownerName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  businessName: String,
  category: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  description: String,
  services: [String],
  status: String (Pending/Approved/Rejected),
  isActive: Boolean,
  approvedAt: Date,
  approvedBy: ObjectId (ref: Admin),
  rating: Number,
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing the Workflow

1. **Register a New Vendor:**
   - Go to `/VendorReg`
   - Fill all required fields
   - Submit form
   - Verify vendor saved in MongoDB with status: "Pending"

2. **Admin Login:**
   - Go to `/AdminLogin`
   - Login with admin credentials
   - Navigate to "Vendor Application Review"

3. **Review and Approve:**
   - See newly registered vendor in pending list
   - Click on vendor to view details
   - Click "Approve" button
   - Verify success message
   - Check MongoDB - vendor status should be "Approved"

4. **Verify on User Page:**
   - Go to `/MainPage` (user main page)
   - Scroll to "Recommended For You" section
   - Newly approved vendor should appear in the list

## Notes

- Only approved vendors with `status: "Approved"` and `isActive: true` appear on user pages
- Admin must be logged in to access approval functionality (JWT authentication)
- Vendors cannot login until they are approved
- Pending vendors list refreshes automatically after approval/rejection
- User main page shows top 5 approved vendors (can be modified in code)

## Files Modified

### Backend:
- `server/controllers/adminManagementController.js`
- `server/controllers/publicController.js`
- `server/routes/adminManagementRoutes.js`
- `server/routes/publicRoutes.js`
- `server/index.js`

### Frontend:
- `frontend/pages/Admin Pages/VendorApplicationReview.jsx`
- `frontend/pages/User Pages/MainPage.jsx`
