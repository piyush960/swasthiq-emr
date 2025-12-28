import { Appointment } from "@/types";

interface Props {
  appointments: Appointment[];
}

const ActiveDoctors = ({ appointments }: Props) => {
  // Extract unique doctors from today's appointments
  const uniqueDoctors = Array.from(new Set(appointments.map(a => a.doctorName)));
  const count = uniqueDoctors.length;

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-elevated">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-primary-foreground/80">Active Doctors</p>
          <p className="mt-1 text-sm text-primary-foreground/60">Based on Today's Schedule</p>
        </div>
      </div>

      <div className="my-4">
        <span className="text-5xl font-bold">{count}</span>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {uniqueDoctors.map((docName, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg bg-primary-foreground/10 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary-foreground/20" />
              <span className="text-sm font-medium">{docName}</span>
            </div>
          </div>
        ))}
        {count === 0 && <div className="text-sm opacity-60">No active doctors scheduled.</div>}
      </div>
    </div>
  );
};

export default ActiveDoctors;