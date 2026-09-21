import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { api } from '@/lib/api';
import { ButtonSpinner } from '@/components/ui/Spinner';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await api.post(`/userAuth/changePassword/${token}`, { password });
    setLoading(false);
    if (res.success) { setSuccess(true); setTimeout(() => navigate('/login'), 3000); }
    else { setError(res.message || 'Failed to reset password'); }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Enter your new password">
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-error-50 text-error-700 text-sm mb-4">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /><span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-success-50 text-success-700 text-sm mb-4 animate-fade-in">
          <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /><span>Password changed successfully. Redirecting to login...</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">New password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="input pl-10 pr-10" required minLength={8} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <ButtonSpinner /> : 'Reset password'}</button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-5"><Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Back to sign in</Link></p>
    </AuthLayout>
  );
}
