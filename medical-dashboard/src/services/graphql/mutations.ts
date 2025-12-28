export const CREATE_APPOINTMENT = `
  mutation CreateAppointment($input: CreateAppointmentInput!) {
    createAppointment(input: $input) {
      id
      patientName
      date
      status
    }
  }
`;

export const UPDATE_STATUS = `
  mutation UpdateAppointmentStatus($id: ID!, $new_status: String!) {
    updateAppointmentStatus(id: $id, new_status: $new_status) {
      id
      status
    }
  }
`;

export const DELETE_APPOINTMENT = `
  mutation DeleteAppointment($id: ID!) {
    deleteAppointment(id: $id)
  }
`;