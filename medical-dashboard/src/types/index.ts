export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  mode: 'In-Person' | 'Video' | 'Phone';
}

export interface CreateAppointmentInput {
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number;
  mode: string;
  status?: string;
}

export interface CalendarEvent extends Appointment {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}