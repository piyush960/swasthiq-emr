export const GET_APPOINTMENTS = `
  query GetAppointments($date: String, $status: String, $doctorName: String) {
    getAppointments(date: $date, status: $status, doctorName: $doctorName) {
      id
      patientName
      doctorName
      date
      time
      duration
      status
      mode
    }
  }
`;