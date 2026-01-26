type RouteSkeletonProps = {
  label?: string;
};

const RouteSkeleton = ({ label = "Loading" }: RouteSkeletonProps) => (
  <div className="route-skeleton" role="status" aria-live="polite">
    <span className="route-skeleton__label">{label}</span>
    <div className="route-skeleton__panel">
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-line--short" />
      <div className="skeleton-line" />
      <div className="skeleton-pill-row">
        <span className="skeleton-pill" />
        <span className="skeleton-pill" />
        <span className="skeleton-pill" />
      </div>
      <div className="skeleton-line" />
    </div>
  </div>
);

export default RouteSkeleton;
