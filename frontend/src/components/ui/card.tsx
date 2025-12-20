import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated';
}

export const Card = ({ children, className = '', variant = 'default', ...props }: CardProps) => {
  const variants = {
    default: 'bg-cream border border-stone',
    elevated: 'bg-cream shadow-lg shadow-stone/20',
  };

  return (
    <div
      className={`rounded-xl ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardHeader = ({ children, className = '', ...props }: CardHeaderProps) => {
  return (
    <div className={`px-6 py-4 border-b border-stone ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardContent = ({ children, className = '', ...props }: CardContentProps) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

