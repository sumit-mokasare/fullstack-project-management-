export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      <div>
        <h3 className="text-gray-900 font-semibold text-lg">{title}</h3>
        {description && <p className="text-gray-500 text-sm mt-1 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
