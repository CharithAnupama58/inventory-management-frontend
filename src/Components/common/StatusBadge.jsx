const CONFIG = {
  instore:  { label: "In Store",  cls: "badge-instore"  },
  borrowed: { label: "Borrowed",  cls: "badge-borrowed" },
  damaged:  { label: "Damaged",   cls: "badge-damaged"  },
  missing:  { label: "Missing",   cls: "badge-missing"  },
};

export default function StatusBadge({ status }) {
  const { label, cls } = CONFIG[status] || { label: status, cls: "" };
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}