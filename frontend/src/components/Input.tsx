import { type InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// forwardRef lets a parent (here: react-hook-form) reach the real <input>
// element hidden inside this wrapper component, so the form library can read
// the field's value and focus it when validation fails.
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-dark">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-border'
          }`}
          {...props}
        />
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
