import { type ReactElement, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { getMe, changePassword, type MeResponse } from '../services/authService';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../schemas/authSchemas';

export const Profile = (): ReactElement => {
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    getMe()
      .then(setProfile)
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success('Password changed');
      reset();
    } catch (err: unknown) {
      const status =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 400 || status === 401) {
        setError('currentPassword', { message: 'Current password is incorrect' });
      } else {
        toast.error('Failed to change password');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <p className="text-gray-500 mt-1">Your account details and security settings.</p>
      </div>

      <Card padding="large">
        {loading ? (
          <p className="text-gray-500">Loading profile...</p>
        ) : profile ? (
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Full name</span>
              <p className="font-medium text-gray-900">{profile.fullName}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Email</span>
              <p className="font-medium text-gray-900">{profile.email}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Role</span>
              <div>
                <span className="inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-light text-primary">
                  {profile.role}
                </span>
              </div>
            </div>
            {profile.createdAt && (
              <div>
                <span className="text-sm text-gray-500">Member since</span>
                <p className="font-medium text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Could not load profile.</p>
        )}
      </Card>

      <Card padding="large">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change password</h3>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Current password"
            type="password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            label="New password"
            type="password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label="Confirm new password"
            type="password"
            error={errors.confirmNewPassword?.message}
            {...register('confirmNewPassword')}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Change password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
