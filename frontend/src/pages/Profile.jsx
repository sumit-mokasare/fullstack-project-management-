import { useEffect, useState } from 'react';
import { User as UserIcon, Mail, UserCircle, BadgeCheck, Calendar, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { FullPageSpinner } from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Badge from '@/components/ui/Badge';

export default function Profile() {
  const { user, fetchProfile } = useAuth();
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { fetchProfile().finally(() => setLoading(false)); }
    else { setLoading(false); }
  }, []);

  if (loading) return <FullPageSpinner label="Loading profile..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProfile} />;
  if (!user) return <ErrorState message="Could not load profile" />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Profile</h1><p className="text-gray-500 mt-1">Your account information</p></div>
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="h-24 w-24 rounded-2xl bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.avatar?.url ? <img src={user.avatar.url} alt="" className="h-full w-full object-cover" /> : <UserCircle className="h-12 w-12 text-primary-500" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2"><h2 className="text-xl font-bold text-gray-900">{user.fullname}</h2>{user.isEmailVerified && <BadgeCheck className="h-5 w-5 text-success-500" />}</div>
            <p className="text-gray-500">@{user.username}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="primary"><Shield size={12} /> {user.role}</Badge>
              <Badge variant={user.isEmailVerified ? 'success' : 'warning'}>{user.isEmailVerified ? 'Email Verified' : 'Email Unverified'}</Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Account Details</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 py-3 border-b border-gray-100"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 flex-shrink-0"><UserIcon size={16} className="text-gray-500" /></div><div className="flex-1"><p className="text-xs text-gray-500">Full Name</p><p className="text-sm font-medium text-gray-900">{user.fullname}</p></div></div>
          <div className="flex items-center gap-3 py-3 border-b border-gray-100"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 flex-shrink-0"><Mail size={16} className="text-gray-500" /></div><div className="flex-1"><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium text-gray-900">{user.email}</p></div></div>
          <div className="flex items-center gap-3 py-3 border-b border-gray-100"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 flex-shrink-0"><UserCircle size={16} className="text-gray-500" /></div><div className="flex-1"><p className="text-xs text-gray-500">Username</p><p className="text-sm font-medium text-gray-900">{user.username}</p></div></div>
          <div className="flex items-center gap-3 py-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 flex-shrink-0"><Calendar size={16} className="text-gray-500" /></div><div className="flex-1"><p className="text-xs text-gray-500">Member Since</p><p className="text-sm font-medium text-gray-900">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p></div></div>
        </div>
      </div>
    </div>
  );
}
