import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle, AlertCircle } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { api } from "@/lib/api";
import { ButtonSpinner } from "@/components/ui/Spinner";

export default function VerifyEmailSuccess() {
  const { token } = useParams();
  const navigate = useNavigate();
  const calledRef = useRef(false); // stops the double call in React StrictMode

  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  // 1. Call the backend once
  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const verify = async () => {
      try {
        const res = await api.get(`/userAuth/verify/${token}`);
        if (res.success) {
          setStatus("success");
          setMessage(res.message || "Email verified successfully.");
        } else {
          setStatus("error");
          setMessage(res.message || "Invalid or expired verification link.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(err?.response?.data?.message || err?.message || "Verification failed.");
      }
    };

    verify();
  }, [token]);

  // 2. After success, go to login
  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => {
      navigate("/login", { replace: true, state: { verified: true } });
    }, 2500);
    return () => clearTimeout(timer);
  }, [status, navigate]);

  return (
    <AuthLayout title="Email verification" subtitle="We're confirming your email address">
      {status === "loading" && (
        <div role="status" className="flex items-center justify-center gap-2 py-6 text-gray-600 text-sm">
          <ButtonSpinner />
          <span>Verifying your email...</span>
        </div>
      )}

      {status === "success" && (
        <div role="status" className="text-center py-4 animate-fade-in">
          <CheckCircle size={40} className="mx-auto text-green-600 mb-3" />
          <p className="text-green-700 font-medium">{message}</p>
          <p className="text-sm text-gray-500 mt-1">Redirecting you to sign in...</p>
          <Link to="/login" replace className="btn-primary w-full mt-5 inline-block">
            Go to sign in
          </Link>
        </div>
      )}

      {status === "error" && (
        <div role="alert" className="text-center py-4 animate-fade-in">
          <AlertCircle size={40} className="mx-auto text-error-600 mb-3" />
          <p className="text-error-700 font-medium">{message}</p>
          <p className="text-sm text-gray-500 mt-1">The link may have expired. Sign in to request a new one.</p>
          <Link to="/login" replace className="btn-primary w-full mt-5 inline-block">
            Back to sign in
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
