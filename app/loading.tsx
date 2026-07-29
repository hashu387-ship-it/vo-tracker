export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading the register">
      <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-80 animate-pulse rounded-lg bg-muted xl:col-span-2" />
        <div className="h-80 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
