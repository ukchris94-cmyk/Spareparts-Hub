# SpareParts Hub

A comprehensive spare parts marketplace platform for Port Harcourt, connecting auto mechanics, vendors, and dispatchers.

## 🚀 Features

- **Multi-role Authentication**: Client, Vendor, Dispatcher, and Admin roles
- **Real-time Inventory Management**: Vendors can manage their spare parts inventory
- **Order Management**: Complete order lifecycle from creation to delivery
- **Payment Integration**: Paystack payment gateway integration
- **Live Tracking**: Real-time dispatcher location tracking on Google Maps
- **Notifications**: In-app notifications for order updates
- **Admin Dashboard**: Comprehensive admin panel for system management

## 📋 Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB (local or remote)
- npm or yarn

## 🛠️ Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd app/backend
```

2. Create and activate a virtual environment:
```bash
python3 -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
   - Create `.env` file in `app/backend/` (already created)
   - Update the following variables:
     ```
     MONGO_URL=mongodb://localhost:27017
     DB_NAME=spareparts_hub
     SECRET_KEY=your-secret-key-change-in-production
     PAYSTACK_SECRET_KEY=your-paystack-secret-key
     PAYSTACK_PUBLIC_KEY=your-paystack-public-key
     CORS_ORIGINS=http://localhost:3000
     ```

5. Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in MONGO_URL
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd app/frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
   - Create `.env` file in `app/frontend/` (already created)
   - Update the following:
     ```
     REACT_APP_BACKEND_URL=http://localhost:8000
     REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
     ```

## ▶️ Running the Application

### Backend

In the `app/backend` directory with virtual environment activated:

```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Or using Python directly:
```bash
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### Frontend

In the `app/frontend` directory:

```bash
npm run dev
# or
yarn dev
```

The app will be available at: `http://localhost:3000` (or the port shown in terminal)

## 📁 Project Structure

```
Sparepart-Hub/
├── app/
│   ├── backend/
│   │   ├── server.py          # FastAPI main application
│   │   ├── requirements.txt   # Python dependencies
│   │   └── .env              # Backend environment variables
│   └── frontend/
│       ├── src/
│       │   ├── components/    # Reusable UI components
│       │   ├── context/       # React contexts (Auth, Cart)
│       │   ├── lib/          # API clients and utilities
│       │   ├── pages/        # Page components
│       │   └── App.js        # Main app component
│       ├── package.json      # Node dependencies
│       └── .env             # Frontend environment variables
└── README.md
```

## 🔧 Improvements Made

### Backend Improvements

1. **Fixed Missing Imports**: Added FastAPI, APIRouter, Depends, and HTTPException imports
2. **Proper requirements.txt**: Created a clean requirements file with all necessary dependencies
3. **Better Error Handling**: Improved error messages and validation

### Frontend Improvements

1. **Fixed Missing Imports**: Added React hooks and axios imports where missing
2. **Updated package.json**: Added all required dependencies (React, React Router, Axios, etc.)
3. **Fixed Import Paths**: Corrected component import paths in App.js
4. **Added Missing React Hooks**: Added useState, useEffect, useContext imports

## 🎯 Recommended Future Improvements

### Backend

1. **Input Validation**: Add more robust Pydantic validators for all endpoints
2. **Error Handling**: Implement global exception handlers
3. **Database Indexes**: Add MongoDB indexes for better query performance
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Caching**: Implement Redis caching for frequently accessed data
6. **Pagination**: Add pagination to list endpoints (currently limited to 100 items)
7. **Transaction Support**: Add transaction handling for order creation to ensure data consistency
8. **Logging**: Enhanced logging with structured logging (e.g., using structlog)
9. **API Versioning**: Implement API versioning for future changes
10. **Webhook Support**: Add webhooks for payment verification

### Frontend

1. **UI Component Library**: Create/use a proper UI component library
2. **State Management**: Consider using Redux or Zustand for complex state
3. **Error Boundaries**: Add React error boundaries for better error handling
4. **Loading States**: Improve loading states and skeleton screens
5. **Form Validation**: Add comprehensive form validation (e.g., react-hook-form)
6. **Image Upload**: Implement image upload for spare parts
7. **Search Functionality**: Enhance search with filters and sorting
8. **Responsive Design**: Ensure all pages are mobile-responsive
9. **Accessibility**: Add ARIA labels and keyboard navigation
10. **PWA Support**: Make it a Progressive Web App for mobile users
11. **Real-time Updates**: Add WebSocket support for real-time notifications
12. **Offline Support**: Implement service workers for offline functionality

### General

1. **Testing**: Add unit and integration tests (Jest, React Testing Library, pytest)
2. **CI/CD**: Set up GitHub Actions for automated testing and deployment
3. **Docker**: Dockerize both backend and frontend for easier deployment
4. **Documentation**: Add API documentation and component documentation
5. **Security**: 
   - Add rate limiting
   - Implement CSRF protection
   - Add input sanitization
   - Use HTTPS in production
6. **Monitoring**: Add error tracking (Sentry) and analytics
7. **Database Backup**: Implement automated database backups

## 🔐 Security Notes

- Always change the `SECRET_KEY` in production
- Use strong passwords for MongoDB
- Never commit `.env` files to version control
- Use HTTPS in production
- Validate and sanitize all user inputs
- Implement proper CORS policies for production

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Spare Parts
- `GET /api/parts` - List all parts (with filters)
- `GET /api/parts/{id}` - Get part details
- `POST /api/parts` - Create part (Vendor/Admin only)
- `PUT /api/parts/{id}` - Update part (Vendor/Admin only)
- `DELETE /api/parts/{id}` - Delete part (Vendor/Admin only)
- `GET /api/categories` - Get all categories

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders (role-based)
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status
- `PUT /api/orders/{id}/assign` - Assign dispatcher

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `GET /api/payments/verify/{reference}` - Verify payment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/stats` - Get system statistics
- `PUT /api/admin/users/{id}/status` - Toggle user status

## 🐛 Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**: 
   - Ensure MongoDB is running
   - Check MONGO_URL in .env file
   - Verify network connectivity if using remote MongoDB

2. **Import Errors**:
   - Ensure virtual environment is activated
   - Reinstall requirements: `pip install -r requirements.txt`

3. **Port Already in Use**:
   - Change port: `uvicorn server:app --port 8001`
   - Or kill the process using port 8000

### Frontend Issues

1. **Module Not Found**:
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

2. **Backend Connection Failed**:
   - Verify backend is running
   - Check REACT_APP_BACKEND_URL in .env
   - Check CORS settings in backend

3. **Build Errors**:
   - Clear cache: `npm cache clean --force`
   - Reinstall dependencies

## 📄 License

This project is private and proprietary.

## 👥 Contributing

This is a private project. For improvements and suggestions, contact the project maintainer.

---

**Happy Coding! 🚀**

