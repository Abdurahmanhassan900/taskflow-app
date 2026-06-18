import { type ReactElement } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { registerSchema, type RegisterFormValues } from '../schemas/authSchemas';

export const Register = (): ReactElement => {
  const { register: registerUser, loading, error } = useAuth();
  const navigate = useNavigate();

  // register() (from react-hook-form) is renamed to registerField here so it
  // doesn't clash with our own registerUser() auth function below.
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (values: RegisterFormValues) => {
    const success = await registerUser(values);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8" padding="large">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary hover:text-opacity-80">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          {error && (
            <div className="p-3 bg-red-50 text-red-500 rounded text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Jane Doe"
              error={errors.fullName?.message}
              {...registerField('fullName')}
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...registerField('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...registerField('password')}
            />
          </div>

          <div>
            <Button type="submit" className="w-full flex justify-center py-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
