import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ButtonSpinner } from "@/components/ui/Spinner";
import { loginSchema } from "../../lib/velidetorSchema";

// Backend rejects unverified users with "Please verify your email"
const isUnverified = (res) => res?.statusCode === 403 || /verify your email/i.test(res?.message || "");

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const justVerified = location.state?.verified === true; // set by VerifyEmailSuccess page

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");

  // Resend verification fallback
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const clearFieldError = (field) => setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    setResendMsg("");
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const errors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (!errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await login(result.data.email, result.data.password);
      if (res?.success) {
        navigate(from, { replace: true });
      } else {
        setError(res?.message || "Login failed");
        if (isUnverified(res)) setNeedsVerification(true);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg("");
    try {
      const res = await api.post("/userAuth/resent-verification", { email: email.trim() });
      setResendMsg(
        res?.success || res?.statusCode === 200
          ? "Verification email sent. Check your inbox."
          : res?.message || "Could not send the email. Try again.",
      );
    } catch (err) {
      setResendMsg(err?.response?.data?.message || err?.message || "Could not send the email. Try again.");
    } finally {
      setResending(false);
    }
  };

  const inputErrorClass = "border-error-500 focus:ring-error-500";

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
      {justVerified && !error && (
        <div
          role="status"
          className="flex items-start gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm mb-4 animate-fade-in"
        >
          <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>Email verified successfully. You can now sign in.</span>
        </div>
      )}

      {error && (
        <div role="alert" className="p-3 rounded-lg bg-error-50 text-error-700 text-sm mb-4 animate-fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>

          {needsVerification && (
            <div className="mt-3 pl-6">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-medium underline hover:no-underline disabled:opacity-60"
              >
                {resending ? "Sending..." : "Resend verification email"}
              </button>
              {resendMsg && <p className="mt-2 text-gray-700">{resendMsg}</p>}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
              placeholder="you@example.com"
              className={`input pl-10 ${fieldErrors.email ? inputErrorClass : ""}`}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              autoComplete="email"
            />
          </div>
          {fieldErrors.email && (
            <p id="email-error" className="mt-1 text-xs text-error-600 animate-fade-in">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">
              Password
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-600 font-medium hover:text-primary-700">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
              placeholder="Enter your password"
              className={`input pl-10 pr-10 ${fieldErrors.password ? inputErrorClass : ""}`}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password && (
            <p id="password-error" className="mt-1 text-xs text-error-600 animate-fade-in">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <ButtonSpinner /> : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
