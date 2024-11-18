const API_URL = 'http://localhost:3000/api';

export async function fetchDoctorsByClinic(clinicId) {
  try {
    // Simulated API call - in production, this would be a real API endpoint
    return [
      { id: 1, name: 'د. أحمد محمد', clinicId: 1 },
      { id: 2, name: 'د. سارة أحمد', clinicId: 1 },
      { id: 3, name: 'د. خالد العمري', clinicId: 2 },
      { id: 4, name: 'د. فاطمة السيد', clinicId: 3 },
      { id: 5, name: 'د. محمد العلي', clinicId: 4 }
    ].filter(doctor => doctor.clinicId === parseInt(clinicId));
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
}

export async function fetchAppointmentsByDoctor(doctorId) {
  try {
    // Simulated API call - in production, this would be a real API endpoint
    const baseAppointments = [
      { id: 1, time: '٩:٠٠ صباحاً - الأحد ٢٠٢٤/٠٣/١٠', doctorId: 1 },
      { id: 2, time: '١١:٣٠ صباحاً - الأحد ٢٠٢٤/٠٣/١٠', doctorId: 1 },
      { id: 3, time: '٢:٠٠ مساءً - الإثنين ٢٠٢٤/٠٣/١١', doctorId: 2 },
      { id: 4, time: '١٠:٠٠ صباحاً - الثلاثاء ٢٠٢٤/٠٣/١٢', doctorId: 3 }
    ];
    return baseAppointments.filter(apt => apt.doctorId === parseInt(doctorId));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

export async function submitConsultation(formData) {
  try {
    const response = await fetch(`${API_URL}/consultations`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting consultation:', error);
    throw error;
  }
}