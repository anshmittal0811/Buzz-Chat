import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { setTokens } from '@/lib/api';

// Decode JWT token to get user ID
const decodeToken = (token: string): { sub: string; email: string } | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Login to get tokens
      const loginResponse = await authService.login({ email, password });
      const { accessToken, refreshToken } = loginResponse.data;
      
      // Step 2: Set tokens so we can make authenticated requests
      setTokens(accessToken, refreshToken);
      
      // Step 3: Decode token to get user ID
      const decoded = decodeToken(accessToken);
      if (!decoded) {
        throw new Error('Invalid token received');
      }
      
      // Step 4: Fetch user details
      const userResponse = await userService.getUser(decoded.sub);
      
      return {
        user: userResponse.data,
        accessToken,
        refreshToken,
      };
    },
    onSuccess: ({ user, accessToken, refreshToken }) => {
      login(user, accessToken, refreshToken);
      navigate('/chat');
    },
    onError: (err: unknown) => {
      console.error('Login error:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-navy-deep">Welcome Back</h2>
        <p className="text-graphite mt-2">Sign in to continue your conversations</p>
      </div>

      {error && (
        <div className="bg-rose/10 border border-rose/30 text-burgundy px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Input
        id="email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        id="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={loginMutation.isPending}
      >
        Sign In
      </Button>

      <p className="text-center text-sm text-graphite">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-navy font-medium hover:text-navy-deep transition-colors"
        >
          Create one
        </button>
      </p>
    </form>
  );
};

