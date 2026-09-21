import { AlertCircle } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error-50">
        <AlertCircle className="h-7 w-7 text-error-500" />
      </div>
      <p className="text-gray-600 text-sm text-center max-w-sm">{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-secondary text-sm">Try again</button>}
    </div>
  );
}
