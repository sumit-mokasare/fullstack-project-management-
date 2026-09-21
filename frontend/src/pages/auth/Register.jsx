import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Upload } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { api } from '@/lib/api';
import { ButtonSpinner } from '@/components/ui/Spinner';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullname: '', email: '', username: '', password: '' });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };
  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) { setAvatar(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData();
    formData.append('fullname', form.fullname);
    formData.append('email', form.email);
    formData.append('username', form.username);
    formData.append('password', form.password);
    if (avatar) formData.append('avatar', avatar);
    const res = await api.post('/userAuth/register', formData, true);
    setLoading(false);
    if (res.success) { navigate('/verify-email', { state: { email: form.email } }); }
    else { setError(res.message || 'Registration failed'); }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Sign up to start managing your projects">
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-error-50 text-error-700 text-sm mb-4 animate-fade-in">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /><span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center mb-2">
          <label className="relative cursor-pointer group">
            <div className="h-20 w-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group-hover:border-primary-400 transition-colors">
              {preview ? <img src={preview} alt="avatar" className="h-full w-full object-cover" /> : <Upload size={20} className="text-gray-400" />}
            </div>
            <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </label>
        </div>
        <p className="text-center text-xs text-gray-500 -mt-2">Click to upload avatar (optional)</p>
        <div>
          <label className="label">Full name</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input name="fullname" value={form.fullname} onChange={handleChange} placeholder="John Doe" className="input pl-10" required />
          </div>
        </div>
        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input pl-10" required />
          </div>
        </div>
        <div>
          <label className="label">Username</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input name="username" value={form.username} onChange={handleChange} placeholder="johndoe" className="input pl-10" required minLength={3} maxLength={13} />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="At least 8 characters" className="input pl-10 pr-10" required minLength={8} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? <ButtonSpinner /> : 'Create account'}</button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-5">Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link></p>
    </AuthLayout>
  );
}
