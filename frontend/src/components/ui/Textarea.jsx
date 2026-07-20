export function Textarea({
  label,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}

      <textarea
        {...props}
        className={`w-full rounded-xl border border-orbit-border bg-orbit-surface2 px-4 py-3 text-orbit-text-primary outline-none focus:border-orbit-primary ${className}`}
      />
    </div>
  );
}