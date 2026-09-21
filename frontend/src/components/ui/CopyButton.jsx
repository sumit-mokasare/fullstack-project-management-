import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
      {copied ? <Check size={16} className="text-success-500" /> : <Copy size={16} />}
    </button>
  );
}
