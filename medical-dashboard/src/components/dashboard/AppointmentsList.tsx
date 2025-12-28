import { useState } from "react";
import { Clock, User, Check, X, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Appointment } from "@/types";
import { parse, isToday, isFuture, isPast, isSameDay } from "date-fns";
import { appointmentService } from "@/services/appointmentService";

interface Props {
  appointments: Appointment[];
  onUpdate?: () => void; // Callback to refresh parent data after update
}

type TabType = "Upcoming" | "Today" | "Past";

const AppointmentsList = ({ appointments, onUpdate }: Props) => {
  const [activeTab, setActiveTab] = useState<TabType>("Today");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // --- Filtering Logic ---
  const filteredAppointments = appointments.filter((apt) => {
    // Combine date and time to get a full Date object
    const aptDateTime = parse(`${apt.date} ${apt.time}`, "yyyy-MM-dd HH:mm", new Date());
    const now = new Date();

    if (activeTab === "Today") {
      return isSameDay(aptDateTime, now);
    }
    if (activeTab === "Upcoming") {
      return isFuture(aptDateTime) && !isSameDay(aptDateTime, now);
    }
    if (activeTab === "Past") {
      return isPast(aptDateTime) && !isSameDay(aptDateTime, now);
    }
    return true;
  });

  // --- Status Update Logic ---
  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
      await appointmentService.updateStatus(id, newStatus);
      if (onUpdate) onUpdate(); // Trigger parent refresh
    } catch (error) {
      console.error("Failed to update", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card h-full flex flex-col">
      {/* Tabs Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Appointments</h3>
        
        <div className="flex rounded-lg bg-muted/50 p-1">
          {(["Today", "Upcoming", "Past"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-all",
                activeTab === tab
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List Content */}
      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No {activeTab.toLowerCase()} appointments found.
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="group relative animate-fade-in rounded-xl border border-border p-4 transition-all hover:border-primary/20 hover:bg-muted/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{apt.patientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.doctorName} • <Clock className="inline h-3 w-3" /> {apt.date} {apt.time}
                    </p>
                  </div>
                </div>
                
                <span className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  apt.status === 'Scheduled' ? "bg-blue-100 text-blue-700" : 
                  apt.status === 'Completed' ? "bg-green-100 text-green-700" : 
                  "bg-red-100 text-red-700"
                )}>
                  {apt.status}
                </span>
              </div>

              {/* Quick Actions (Appear on Hover) */}
              <div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                {apt.status === 'Scheduled' && (
                  <>
                    <button 
                      disabled={loadingId === apt.id}
                      onClick={() => handleStatusChange(apt.id, 'Completed')}
                      className="flex flex-1 items-center justify-center gap-1 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                    >
                      {loadingId === apt.id ? "..." : <><Check size={12} /> Complete</>}
                    </button>
                    <button 
                      disabled={loadingId === apt.id}
                      onClick={() => handleStatusChange(apt.id, 'Cancelled')}
                      className="flex flex-1 items-center justify-center gap-1 rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      {loadingId === apt.id ? "..." : <><X size={12} /> Cancel</>}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentsList;