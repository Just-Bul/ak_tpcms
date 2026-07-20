export function Switch({
  checked,
  onCheckedChange,
}) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${
        checked
          ? "bg-orbit-primary"
          : "bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          checked
            ? "left-6"
            : "left-1"
        }`}
      />
    </button>
  );
}