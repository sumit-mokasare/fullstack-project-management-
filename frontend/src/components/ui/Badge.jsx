export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-50 text-primary-700',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    error: 'bg-error-50 text-error-700',
    accent: 'bg-accent-50 text-accent-700',
    info: 'bg-blue-50 text-blue-700',
  };
  return <span className={`badge ${variants[variant]} ${className}`}>{children}</span>;
}
