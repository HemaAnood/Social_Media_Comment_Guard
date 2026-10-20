export default function Loading({ label = "Loading..." }) {
  return (
    <div className="ks-loading-wrap">
      <div className="ks-spinner" />
      <span>{label}</span>
    </div>
  );
}