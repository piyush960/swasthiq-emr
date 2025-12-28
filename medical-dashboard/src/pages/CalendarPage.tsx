import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon, X, Clock, User, Mail, Phone, Shield, Stethoscope, Trash2, CheckCircle, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, subDays, parse, addMinutes } from "date-fns";
import { appointmentService } from "@/services/appointmentService";
import { CalendarEvent } from "@/types";
import { calculateLayout } from "@/lib/layoutUtils"; 

// ... keep your original static data for dropdowns ...
const doctors = [
  { id: "Dr. Sarah Johnson", name: "Dr. Sarah Johnson", specialty: "Cardiologist" },
  { id: "Dr. Michael Chen", name: "Dr. Michael Chen", specialty: "Neurologist" },
  { id: "Dr. Emily White", name: "Dr. Emily White", specialty: "Pediatrician" },
  { id: "Dr. David Lee", name: "Dr. David Lee", specialty: "Orthopedist" },
];
const timeSlots = Array.from({ length: 11 }, (_, i) => i + 7); 

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<CalendarEvent[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState<"view" | "create">("create");
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false);
  // --- Form State (Matches your original design) ---
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0].id);
  const [patientName, setPatientName] = useState("");
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("09:30");
  const [purpose, setPurpose] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [abhaId, setAbhaId] = useState("");

  const doctorColors: Record<string, string> = {
    "Dr. Sarah Johnson": "#22c55e",   // green
    "Dr. Michael Chen": "#3b82f6",   // blue
    "Dr. Emily White": "#a855f7",    // purple
    "Dr. David Lee": "#f97316",      // orange
  };
  
  const getDoctorColor = (name: string) => {
    return doctorColors[name] || "#0ea5e9"; // fallback cyan
  };

  // --- Data Fetching ---
  const fetchAppointments = async () => {
    // For Calendar Grid, we usually only care about the currently viewed month/day
    // But to simplify, we can fetch all or filter by the specific date string
    const dateStr = format(currentDate, "yyyy-MM-dd");
    try {
      setLoading(true);
      const data = await appointmentService.getAppointments(dateStr);
      
      const processed: CalendarEvent[] = data.map(apt => {
        // Safe parsing of time
        const start = parse(apt.time, "HH:mm", new Date());
        const end = addMinutes(start, apt.duration);
        return {
          ...apt,
          startHour: start.getHours(),
          startMinute: start.getMinutes(),
          endHour: end.getHours(),
          endMinute: end.getMinutes(),
        };
      });
      setAppointments(processed);
    } catch (err) {
      console.error(err);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const layoutEvents = useMemo(() => calculateLayout(appointments), [appointments]);

  // --- Navigation ---
  const goToToday = () => setCurrentDate(new Date());
  const goToPrev = () => setCurrentDate(subDays(currentDate, 1));
  const goToNext = () => setCurrentDate(addDays(currentDate, 1));
  const formatHour = (hour: number) => hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`;

  // --- Actions ---
  const handleEmptyCellClick = (hour: number) => {
    setPanelMode("create");
    setSelectedAppointment(null);
    setStartTime(`${hour.toString().padStart(2, '0')}:00`);
    setEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
    // Reset form
    setPatientName(""); setPurpose(""); setPhone(""); setEmail(""); setAbhaId("");
    setShowPanel(true);
  };

  const handleCreateNew = () => {
    setPanelMode("create");
    setSelectedAppointment(null);
    setShowPanel(true);
  };

  const handleSave = async () => {
    // Calculate duration from start/end times
    const start = parse(startTime, "HH:mm", new Date());
    const end = parse(endTime, "HH:mm", new Date());
    const durationMin = (end.getTime() - start.getTime()) / 60000;

    try {
      await appointmentService.createAppointment({
        date: format(currentDate, "yyyy-MM-dd"),
        time: startTime,
        duration: durationMin > 0 ? durationMin : 30,
        patientName,
        doctorName: selectedDoctor, // Mapping ID to Name is simplified here
        mode: "In-Person",
        status: "Scheduled"
      });
      setShowPanel(false);
      fetchAppointments();
    } catch (error) {
      alert("Failed to save");
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedAppointment) return;
    try {
      await appointmentService.updateStatus(selectedAppointment.id, newStatus);
      fetchAppointments(); // Refresh grid
      setShowPanel(false);
    } catch (error) {
      alert("Failed to update status");
    }
  };

  return (
      <div className="flex h-screen flex-col overflow-hidden">
        {/* --- Header (Your Original Code) --- */}
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <CalendarIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Calendar</h1>
            
            <div className="ml-6 flex items-center gap-2">
              <button onClick={goToToday} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">Today</button>
              <button onClick={goToPrev} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={goToNext} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
            </div>

            <span className="ml-4 text-lg font-semibold text-foreground">
              {format(currentDate, "EEEE, MMMM d, yyyy")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleCreateNew} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Create
            </button>
          </div>
        </header>

        {/* --- Body --- */}
        <div className="flex flex-1 overflow-hidden relative">
          <div className="flex-1 overflow-y-auto bg-card relative">
            {loading && <div className="absolute top-2 left-20 z-20 text-xs text-primary">Syncing...</div>}
            {/* Time Grid */}
            {timeSlots.map((hour) => (
              <div key={hour} className="flex h-20 border-b border-border/50 odd:bg-muted/10">
                <div className="w-20 flex-shrink-0 flex justify-end pr-4 pt-2 text-xs text-muted-foreground border-r border-border">
                  {formatHour(hour)}
                </div>
                <div 
                  className="flex-1 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => handleEmptyCellClick(hour)}
                />
              </div>
            ))}

            {/* Appointments (Using Calculated Layout) */}
            <div className="absolute top-0 left-20 right-0 pointer-events-none h-full">
              {layoutEvents.map((apt) => {
                 if (apt.status === "Cancelled") return null;
                 return (
                  <div
                    key={apt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAppointment(apt);
                      setPanelMode("view");
                      setShowPanel(true);
                    }}
                    style={{
                      ...apt.style,
                      background: `${getDoctorColor(apt.doctorName)}20`,
                      borderLeft: `6px solid ${getDoctorColor(apt.doctorName)}`,
                    }}
                    className={cn(
                      "absolute rounded-xl px-2 py-1 shadow-sm cursor-pointer pointer-events-auto overflow-hidden hover:shadow-md hover:scale-[1.01] transition-all border border-border/40 flex flex-start justify-between"
                    )}
                  > 
                    <div>
                      <p className="text-xs font-bold text-foreground">{apt.patientName}</p>
                      <p
                        className="text-[10px] font-medium mt-1"
                        style={{ color: getDoctorColor(apt.doctorName) }}
                      >
                        {apt.doctorName}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">
                      {apt.time} • {apt.duration} mins
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- Side Panel --- */}
          {showPanel && (
            <div className="w-96 animate-slide-in-right border-l border-border bg-card/95 backdrop-blur-sm shadow-2xl absolute right-0 top-0 bottom-0 z-50 flex flex-col">
 
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {panelMode === "view" ? "Appointment Details" : "New Event"}
                </h2>
                <button
                  onClick={() => setShowPanel(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {panelMode === "view" && selectedAppointment ? (
                  // --- VIEW MODE (With New Action Buttons) ---
                  <div>
                    {/* Badge */}
                    <div className="mb-6">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm",
                        selectedAppointment.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : selectedAppointment.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {selectedAppointment.status}
                    </span>
                    </div>

                    {/* Details */}
                    <div className="mb-6 space-y-3">
                       <h3 className="text-xl font-bold">{selectedAppointment.patientName}</h3>
                       <div className="flex items-center gap-3 text-sm text-muted-foreground">
                         <Clock className="h-4 w-4" />
                         {selectedAppointment.time} ({selectedAppointment.duration} mins)
                       </div>
                       <div className="inline-flex px-3 py-1 rounded-lg text-xs font-medium mt-2"
                          style={{ background: `${getDoctorColor(selectedAppointment.doctorName)}20`,
                                    color: getDoctorColor(selectedAppointment.doctorName) }}>
                        {selectedAppointment.doctorName}
                      </div>
                    </div>

                    {/* ACTION BUTTONS (The New Feature) */}
                    <div className="mt-8 pt-6 border-t border-border space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Actions</p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleStatusUpdate('Completed')}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition-colors"
                            >
                                <CheckCircle size={16} /> Complete
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('Cancelled')}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-600 py-2 rounded-xl hover:bg-red-200 transition-colors"
                            >
                                <Ban size={16} /> Cancel
                            </button>
                        </div>
                    </div>
                  </div>
                ) : (
                  // --- CREATE MODE (Your Original Form EXACTLY) ---
                  <div>
                    {/* Title Input */}
                    <div className="mb-6">
                      <input
                        type="text"
                        placeholder="New Event"
                        className="w-full rounded-xl border border-primary bg-card px-4 py-3 text-center text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Date & Time */}
                    <div className="mb-6 space-y-4">
                      <div className="flex items-center gap-3 text-sm text-foreground">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{format(currentDate, "EEEE, MMMM d, yyyy")}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <select
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = Math.floor(i / 2) + 7;
                            const min = (i % 2) * 30;
                            const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
                            return <option key={time} value={time}>{time}</option>;
                          })}
                        </select>
                        <span className="text-muted-foreground">-</span>
                        <select
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                           {Array.from({ length: 24 }, (_, i) => {
                            const hour = Math.floor(i / 2) + 7;
                            const min = (i % 2) * 30;
                            const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
                            return <option key={time} value={time}>{time}</option>;
                          })}
                        </select>
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="mb-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="Patient Name"
                          className="flex-1 border-b border-border bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Phone"
                            className="w-24 border-b border-border bg-transparent py-2 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email"
                          className="flex-1 border-b border-border bg-transparent py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                         <Shield className="h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={abhaId}
                            onChange={(e) => setAbhaId(e.target.value)}
                            placeholder="ABHA ID (Optional)"
                            className="flex-1 border-b border-border bg-transparent py-2 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className="mb-6">
                      <textarea
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Add Purpose"
                        rows={4}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Doctor Selection */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <select
                          value={selectedDoctor}
                          onChange={(e) => setSelectedDoctor(e.target.value)}
                          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                        >
                          {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                              {doctor.name} - {doctor.specialty}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border p-4">
                {panelMode === "create" ? (
                  <button
                    onClick={handleSave}
                    className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
                  >
                    Save
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPanel(false)}
                      className="flex-1 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default CalendarPage;