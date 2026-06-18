import { type ReactElement } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, type LoginFormValues } from '../schemas/authSchemas';

export const Login = (): ReactElement => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  // useForm is the brain of the form: it tracks every field's value, runs the
  // zod schema (via zodResolver) when we validate, and collects any errors.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched', // validate a field once the user has visited and left it
  });

  // handleSubmit only calls this AFTER the data passes the schema. So by the
  // time we reach the network call, we already know the input is valid.
  const onSubmit = async (values: LoginFormValues) => {
    const success = await login(values);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8" padding="large">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary hover:text-opacity-80">
              create a new account
            </Link>
          </p>
        </div>

        {/* noValidate turns off the browser's built-in popups so zod is the
            single source of truth for validation messages. */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          {error && (
            <div className="p-3 bg-red-50 text-red-500 rounded text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div>
            <Button type="submit" className="w-full flex justify-center py-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
