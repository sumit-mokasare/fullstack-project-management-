import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ButtonSpinner } from '@/components/ui/Spinner';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await api.get('/userAuth/forgotPassword');
    setLoading(false);
    if (res.success) { setSent(true); setTimeout(() => navigate('/login'), 4000); }
    else { setError(res.message || 'Failed to send reset email'); }
  };

  return (
    <AuthLayout title="Forgot password" subtitle="We'll send a reset link to your email">
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-error-50 text-error-700 text-sm mb-4">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /><span>{error}</span>
        </div>
      )}
      {sent && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-success-50 text-success-700 text-sm mb-4 animate-fade-in">
          <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /><span>Reset link sent to your email. Check your inbox.</span>
        </div>
      )}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-50">
          <Mail className="h-8 w-8 text-warning-500" />
        </div>
        <p className="text-sm text-gray-500 text-center max-w-xs">Enter your account email and we'll send you a link to reset your password.</p>
      </div>
      <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">{loading ? <ButtonSpinner /> : 'Send reset link'}</button>
      <p className="text-center text-sm text-gray-500 mt-5">Remember your password? <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link></p>
    </AuthLayout>
  );
}
