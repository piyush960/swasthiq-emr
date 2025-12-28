import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconBgClass?: string;
  iconClass?: string;
  showTrend?: boolean;
}

const StatsCard = ({
  title,
  value,
  change,
  icon: Icon,
  iconBgClass = "bg-status-info-bg",
  iconClass = "text-primary",
  showTrend = true,
}: StatsCardProps) => {
  const isPositive = change && change > 0;

  return (
    <div className="group rounded-2xl bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", iconBgClass)}>
          <Icon className={cn("h-6 w-6", iconClass)} />
        </div>
        {showTrend && change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              isPositive
                ? "bg-status-success-bg text-status-success"
                : "bg-status-danger-bg text-status-danger"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
