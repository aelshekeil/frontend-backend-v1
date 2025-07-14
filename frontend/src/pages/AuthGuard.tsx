import React, { useState } from 'react';
import User from 'lucide-react/dist/esm/icons/user';
import Lock from 'lucide-react/dist/esm/icons/lock';
import AuthModal from './AuthModal';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallbackMessage?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  fallbackMessage = "Please log in to access this service." 
}) => {
  const { isLoggedIn } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (!requireAuth) {
    return <>{children}</>;
  }

  if (isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">{fallbackMessage}</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full btn-primary flex items-center justify-center"
            >
              <User className="w-5 h-5 mr-2" />
              Login / Register
            </button>
            
            <p className="text-sm text-gray-500">
              New to Tarim Tours? Registration is quick and easy!
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Why create an account?</h3>
            <ul className="text-left space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Track your visa applications in real-time
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Save your personal information for faster applications
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Access exclusive travel deals and packages
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Get personalized travel recommendations
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default AuthGuard;
