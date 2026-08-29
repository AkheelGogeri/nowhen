export default function AdminSkeleton({ rows = 5, className = "" }) {
  return (
    <div className={`flex flex-col gap-3 max-w-2xl ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 rounded animate-pulse"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #222" }}
        />
      ))}
    </div>
  );
}
