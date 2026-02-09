'use client';

interface MetricBadgeProps {
  label: string;
  value: number;
}

export default function MetricBadge({ label, value }: MetricBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-dark-border/50 text-xs">
      <span className="text-light-muted">{label}</span>
      <span className="text-light font-medium">{value}</span>
    </div>
  );
}
