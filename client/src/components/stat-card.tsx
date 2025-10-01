interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  trend?: string;
}

export default function StatCard({ value, label, icon, trend }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-4">
        {icon && <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">{icon}</div>}
        {trend && <span className="text-xs text-secondary font-semibold" data-testid="stat-trend">{trend}</span>}
      </div>
      <div className="text-3xl font-bold text-foreground mb-1" data-testid="stat-value">{value}</div>
      <div className="text-sm text-muted-foreground" data-testid="stat-label">{label}</div>
    </div>
  );
}
