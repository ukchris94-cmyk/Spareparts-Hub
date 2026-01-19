import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import { LoginPage, RegisterPage } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Parts from "./pages/Parts";
import Cart from "./lib/Cart";
import { OrdersList, OrderDetail } from "./lib/Orders";
import { TrackingMap, DispatcherMap } from "./lib/Map";
import Inventory from "./lib/Inventory";
import { VendorOrders, Deliveries } from "./lib/VendorOrders";
import { AdminUsers, AdminOrders } from "./lib/Admin";

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B]">
        <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Public Route (redirect if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B]">
        <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><Landing /></Layout>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      
      {/* Parts (public browsing, but cart requires auth) */}
      <Route path="/parts" element={<Layout><Parts /></Layout>} />

      {/* Protected Routes - All Users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Layout><OrdersList /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <ProtectedRoute>
            <Layout><OrderDetail /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Client Routes */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <Layout><Cart /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/track"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin']}>
            <Layout><TrackingMap /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Vendor Routes */}
      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={['vendor', 'admin']}>
            <Layout><Inventory /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor-orders"
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <Layout><VendorOrders /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Dispatcher Routes */}
      <Route
        path="/deliveries"
        element={
          <ProtectedRoute allowedRoles={['dispatcher']}>
            <Layout><Deliveries /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute allowedRoles={['dispatcher']}>
            <Layout><DispatcherMap /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminUsers /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><AdminOrders /></Layout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: '#18181B',
                border: '1px solid #27272A',
                color: '#FAFAFA',
              },
            }}
          />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
