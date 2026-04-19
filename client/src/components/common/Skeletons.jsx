/**
 * Reusable skeleton loading components for shimmer placeholders.
 */

export function WordCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line h-lg w-40" />
      <div className="skeleton-line h-sm w-60" />
      <div style={{ height: 4 }} />
      <div className="skeleton-line w-full" />
      <div className="skeleton-line w-80" />
      <div style={{ height: 4 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton-line w-40 h-sm" />
        <div className="skeleton-line" style={{ width: 80, height: 28, borderRadius: 100 }} />
      </div>
    </div>
  );
}

export function WordCardSkeletonGrid({ count = 6 }) {
  return (
    <div className="word-grid">
      {Array.from({ length: count }, (_, i) => (
        <WordCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="skeleton-card" style={{ height: 100, justifyContent: 'center', alignItems: 'center' }}>
      <div className="skeleton-circle" style={{ width: 40, height: 40 }} />
      <div className="skeleton-line h-lg" style={{ width: 50 }} />
      <div className="skeleton-line h-sm w-60" />
    </div>
  );
}

export function StatCardSkeletonGrid({ count = 4 }) {
  return (
    <div className="stats-grid">
      {Array.from({ length: count }, (_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}
