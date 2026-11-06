import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  const isSessionAuth = sessionStorage.getItem('gma-super-admin-authenticated') === 'true';
  const isSuperAdminUser = user && user.email === 'simao@neurogrowthlabs.co.za';
  const isAuthorized = isSessionAuth || isSuperAdminUser;

  // If super admin session token already exists in sessionStorage, pass through immediately with zero lag
  if (isAuthorized) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0c]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#cca568] mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-mono">Verifying administration signature...</p>
        </div>
      </div>
    );
  }

  // If a standard fellow (user exists but is not Simao) attempts to access /admin
  if (user && user.email !== 'simao@neurogrowthlabs.co.za') {
    // Prevent standard fellows from seeing admin dashboard
    toast.error("Unauthorized Access: Super Admin credentials required.");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
