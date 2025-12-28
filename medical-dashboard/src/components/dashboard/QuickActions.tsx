import { UserPlus, CalendarPlus, FileEdit, TestTube } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    icon: UserPlus,
    label: "New Patient",
    bgClass: "bg-status-info-bg",
    iconClass: "text-primary",
  },
  {
    icon: CalendarPlus,
    label: "Book Appointment",
    bgClass: "bg-status-success-bg",
    iconClass: "text-status-success",
  },
  {
    icon: FileEdit,
    label: "New Prescription",
    bgClass: "bg-status-warning-bg",
    iconClass: "text-status-warning",
  },
  {
    icon: TestTube,
    label: "Lab Results",
    bgClass: "bg-status-purple-bg",
    iconClass: "text-status-purple",
  },
];

const QuickActions = () => {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className="group flex flex-col items-center gap-2 rounded-xl p-4 transition-all duration-200 hover:bg-muted"
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                action.bgClass
              )}
            >
              <action.icon className={cn("h-5 w-5", action.iconClass)} />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
