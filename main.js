import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';
import Alpine from 'alpinejs';

window.Alpine = Alpine;

// Set document direction and language
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'ar';

// API endpoints
const API_URL = 'http://localhost:3000/api';

// Define Alpine.js data and methods
document.addEventListener('alpine:init', () => {
  Alpine.data('clinicData', () => ({
    appointments: [],
    consultations: [],
    clinics: [
      { id: 1, name: 'العيادة العامة' },
      { id: 2, name: 'عيادة الباطنية' },
      { id: 3, name: 'عيادة الأطفال' },
      { id: 4, name: 'عيادة النساء والولادة' }
    ],
    doctors: [
      { id: 1, name: 'د. أحمد محمد' },
      { id: 2, name: 'د. سارة أحمد' },
      { id: 3, name: 'د. خالد العمري' },
      { id: 4, name: 'د. فاطمة السيد' },
      { id: 5, name: 'د. محمد العلي' }
    ],

    async init() {
      await this.fetchAppointments();
      await this.fetchConsultations();
    },

    async fetchAppointments() {
      try {
        const response = await fetch(`${API_URL}/doctor/appointments/registered`);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        this.appointments = await response.json();
      } catch (error) {
        console.error('Error fetching appointments:', error);
        this.appointments = [];
      }
    },

    async fetchConsultations() {
      try {
        const response = await fetch(`${API_URL}/consultations`);
        if (!response.ok) throw new Error('Failed to fetch consultations');
        this.consultations = await response.json();
      } catch (error) {
        console.error('Error fetching consultations:', error);
        this.consultations = [];
      }
    },

    getClinicName(id) {
      const clinic = this.clinics.find(c => c.id === parseInt(id));
      return clinic ? clinic.name : '';
    },

    getDoctorName(id) {
      const doctor = this.doctors.find(d => d.id === parseInt(id));
      return doctor ? doctor.name : '';
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('ar-SA');
    }
  }));
});

Alpine.start();