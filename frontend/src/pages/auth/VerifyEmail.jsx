import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, Send } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { api } from '@/lib/api';
import { ButtonSpinner } from '@/components/ui/Spinner';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await api.post('/userAuth/resent-verification', { email });
    setLoading(false);
    if (res.success || res.statusCode === 200) { setSent(true); }
    else { setError(res.message || 'Failed to resend verification email'); }
  };

  return (
    <AuthLayout title="Verify your email" subtitle="We sent a verification link to your email address">
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-error-50 text-error-700 text-sm mb-4">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /><span>{error}</span>
        </div>
      )}
      {sent && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-success-50 text-success-700 text-sm mb-4 animate-fade-in">
          <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /><span>Verification email sent. Please check your inbox.</span>
        </div>
      )}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
          <Mail className="h-8 w-8 text-primary-500" />
        </div>
        <p className="text-sm text-gray-500 text-center max-w-xs">Click the link in the email to verify your account, then sign in. The link expires in 20 minutes.</p>
      </div>
      <form onSubmit={handleResend} className="space-y-4 mt-2">
        <div>
          <label className="label">Email address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <ButtonSpinner /> : <><Send size={16} /> Resend verification email</>}</button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-5">Already verified? <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link></p>
    </AuthLayout>
  );
}
