// In-memory data store
export const store = {
  appointments: [],
  consultations: []
};

// Helper to generate incremental IDs
let appointmentId = 1;
let consultationId = 1;

export const getNextAppointmentId = () => appointmentId++;
export const getNextConsultationId = () => consultationId++;