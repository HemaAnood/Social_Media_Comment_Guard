// Shows the user's profile picture, or their first letter if they have none.
const fileBase =
  import.meta.env.VITE_FILE_URL ||
  (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

export default function Avatar({ user, size = 40, style }) {
  const base = { width: size, height: size, fontSize: Math.round(size * 0.38), ...style };

  if (user?.avatar) {
    return (
      <img
        src={`${fileBase}${user.avatar}`}
        alt={user?.name || "avatar"}
        style={{ ...base, borderRadius: "50%", objectFit: "cover", flexShrink: 0, display: "block" }}
      />
    );
  }

  return (
    <div className="ks-avatar" style={base}>
      {user?.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}