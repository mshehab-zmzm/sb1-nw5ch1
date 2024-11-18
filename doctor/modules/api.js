const API_URL = 'http://localhost:3000/api/doctor';

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

export async function createNewConsultation(consultationData) {
  try {
    const response = await fetch(`${API_URL}/consultations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consultationData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating consultation:', error);
    throw error;
  }
}

export async function getConsultation(id) {
  try {
    const response = await fetch(`${API_URL}/consultations/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching consultation:', error);
    throw error;
  }
}

export async function saveConsultationResult(id, resultData) {
  try {
    const response = await fetch(`${API_URL}/consultations/${id}/result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resultData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving consultation result:', error);
    throw error;
  }
}