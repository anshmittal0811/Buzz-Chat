import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gold rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy via-navy-deep to-navy-light relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-burgundy rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <img src="/bee-logo.svg" alt="Buzz Chat" className="w-16 h-16" />
            <span className="font-display text-4xl font-bold text-ivory">Buzz Chat</span>
          </div>
          
          <h1 className="font-display text-5xl font-bold text-ivory leading-tight mb-6">
            Connect with
            <br />
            <span className="text-gold-light">elegance</span>
          </h1>
          
          <p className="text-lg text-cream/80 max-w-md leading-relaxed">
            Experience seamless communication with a touch of royal sophistication. 
            Where every conversation feels refined.
          </p>

          {/* Features */}
          <div className="mt-12 space-y-4">
            {[
              'Real-time messaging',
              'Group conversations',
              'Secure & private',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gold rounded-full" />
                <span className="text-cream/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/bee-logo.svg" alt="Buzz Chat" className="w-12 h-12" />
            <span className="font-display text-2xl font-bold text-navy-deep">Buzz Chat</span>
          </div>

          <Card variant="elevated" className="bg-ivory/50 backdrop-blur">
            <CardContent className="p-8">
              {isLogin ? (
                <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
              ) : (
                <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-graphite mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

