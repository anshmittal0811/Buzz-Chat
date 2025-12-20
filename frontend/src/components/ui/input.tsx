import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-charcoal mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-2.5 
            bg-ivory border border-stone rounded-lg
            text-ink placeholder:text-graphite
            focus:outline-none focus:ring-2 focus:ring-navy-light focus:border-navy-light
            transition-colors duration-200
            disabled:bg-cream disabled:cursor-not-allowed
            ${error ? 'border-burgundy focus:ring-burgundy' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-burgundy">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

