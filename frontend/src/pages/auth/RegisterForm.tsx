import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: () => authService.register({ firstName, lastName, email, password }),
    onSuccess: (response) => {
      // API returns user fields directly in data along with tokens
      const { accessToken, refreshToken, _id, firstName: fName, lastName: lName, email: userEmail, profileUrl } = response.data;
      const user = { _id, firstName: fName, lastName: lName, email: userEmail, profileUrl };
      login(user, accessToken, refreshToken);
      navigate('/chat');
    },
    onError: (err: unknown) => {
      console.error('Register error:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    registerMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-navy-deep">Create Account</h2>
        <p className="text-graphite mt-2">Join Buzz Chat today</p>
      </div>

      {error && (
        <div className="bg-rose/10 border border-rose/30 text-burgundy px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="firstName"
          type="text"
          label="First Name"
          placeholder="John"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          id="lastName"
          type="text"
          label="Last Name"
          placeholder="Doe"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

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

      <Input
        id="confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={registerMutation.isPending}
      >
        Create Account
      </Button>

      <p className="text-center text-sm text-graphite">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-navy font-medium hover:text-navy-deep transition-colors"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};

