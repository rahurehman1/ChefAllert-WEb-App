import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Profile } from './pages/Profile';
import { BrowseChefs } from './pages/BrowseChefs';
import { ChefDetail } from './pages/ChefDetail';
import { ClientBookings } from './pages/ClientBookings';
import { ChefProfile } from './pages/ChefProfile';
import { ChefBookings } from './pages/ChefBookings';
import { Chat } from './pages/Chat';
import { AdminDashboard } from './pages/AdminDashboard';
import { Subscriptions } from './pages/Subscriptions';
import { SupportChat } from './pages/SupportChat';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/browse-chefs" element={<ProtectedRoute requiredRole="client"><BrowseChefs /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute requiredRole="client"><Subscriptions /></ProtectedRoute>} />
        <Route path="/support/subscription/:requestId" element={<ProtectedRoute><SupportChat /></ProtectedRoute>} />
        <Route path="/chef/:chefId" element={<ProtectedRoute requiredRole="client"><ChefDetail /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute requiredRole="client"><ClientBookings /></ProtectedRoute>} />
        <Route path="/chef-profile" element={<ProtectedRoute requiredRole="chef"><ChefProfile /></ProtectedRoute>} />
        <Route path="/chef-bookings" element={<ProtectedRoute requiredRole="chef"><ChefBookings /></ProtectedRoute>} />
        <Route path="/chat/:bookingId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
