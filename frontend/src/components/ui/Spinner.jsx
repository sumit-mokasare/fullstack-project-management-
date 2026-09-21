import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 24, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-primary-500 ${className}`} aria-label="Loading" />;
}

export function FullPageSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Spinner size={40} />
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  );
}

export function ButtonSpinner() {
  return <Loader2 size={18} className="animate-spin" />;
}
