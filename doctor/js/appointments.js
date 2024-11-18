import Alpine from 'alpinejs';
import { Modal } from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const API_URL = 'http://localhost:3000/api/doctor/appointments';

document.addEventListener('alpine:init', () => {
  Alpine.data('doctorAppointments', () => ({
    appointments: [],
    registration: {
      appointmentId: null,
      fromTime: '',
      toTime: ''
    },
    modal: null,
    clinics: [
      { id: 1, name: 'العيادة العامة' },
      { id: 2, name: 'عيادة الباطنية' },
      { id: 3, name: 'عيادة الأطفال' },
      { id: 4, name: 'عيادة النساء والولادة' }
    ],
    doctorId: 1, // This should come from authentication in a real app

    async init() {
      this.modal = new Modal(document.getElementById('registrationModal'));
      await this.loadAppointments();
    },

    async loadAppointments() {
      try {
        const url = new URL(`${API_URL}/available`);
        url.searchParams.append('doctorId', this.doctorId);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        this.appointments = await response.json();
      } catch (error) {
        console.error('Error loading appointments:', error);
        alert('حدث خطأ أثناء تحميل المواعيد');
      }
    },

    openRegistrationModal(appointment) {
      this.registration = {
        appointmentId: appointment.id,
        fromTime: appointment.fromTime,
        toTime: appointment.toTime
      };
      this.modal.show();
    },

    async registerForAppointment() {
      try {
        const response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...this.registration,
            doctorId: this.doctorId
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'حدث خطأ أثناء التسجيل');
        }

        this.modal.hide();
        await this.loadAppointments();
        alert('تم التسجيل في الموعد بنجاح');
      } catch (error) {
        console.error('Registration error:', error);
        alert(error.message || 'حدث خطأ أثناء التسجيل في الموعد');
      }
    },

    getClinicName(id) {
      const clinic = this.clinics.find(c => c.id === parseInt(id));
      return clinic ? clinic.name : '';
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('ar-SA');
    }
  }));
});

Alpine.start();