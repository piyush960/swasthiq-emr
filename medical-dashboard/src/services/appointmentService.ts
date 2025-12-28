import { client } from '@/lib/amplify';
import { GET_APPOINTMENTS } from './graphql/queries';
import { CREATE_APPOINTMENT, UPDATE_STATUS, DELETE_APPOINTMENT } from './graphql/mutations';
import { Appointment, CreateAppointmentInput } from '@/types';

export const appointmentService = {
  // Fetch appointments (filtered by date usually)
  async getAppointments(date?: string): Promise<Appointment[]> {
    try {
      const variables = date ? { date } : {}; 
      const response: any = await client.graphql({
        query: GET_APPOINTMENTS,
        variables: variables,
      });
      return response.data.getAppointments || [];
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return [];
    }
  },

  async createAppointment(input: CreateAppointmentInput): Promise<Appointment | null> {
    try {
      const response: any = await client.graphql({
        query: CREATE_APPOINTMENT,
        variables: { input },
      });
      return response.data.createAppointment;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  async updateStatus(id: string, new_status: string): Promise<boolean> {
    try {
      await client.graphql({
        query: UPDATE_STATUS,
        variables: { id, new_status },
      });
      return true;
    } catch (error) {
      console.error("Error updating status:", error);
      return false;
    }
  },

  async deleteAppointment(id: string): Promise<boolean> {
    try {
      await client.graphql({
        query: DELETE_APPOINTMENT,
        variables: { id },
      });
      return true;
    } catch (error) {
      console.error("Error deleting appointment:", error);
      return false;
    }
  }
};