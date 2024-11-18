import Alpine from 'alpinejs';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const API_URL = 'http://localhost:3000/api';

document.addEventListener('alpine:init', () => {
  Alpine.data('appointmentsManager', () => ({
    appointments: [],
    newAppointments: [],
    clinics: [
      { id: 1, name: 'العيادة العامة' },
      { id: 2, name: 'عيادة الباطنية' },
      { id: 3, name: 'عيادة الأطفال' },
      { id: 4, name: 'عيادة النساء والولادة' }
    ],

    async init() {
      await this.loadAppointments();
    },

    async loadAppointments() {
      try {
        const response = await fetch(`${API_URL}/appointments`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.appointments = await response.json();
      } catch (error) {
        console.error('Error loading appointments:', error);
        alert('حدث خطأ أثناء تحميل المواعيد');
      }
    },

    addNewRow() {
      this.newAppointments.push({
        clinic: '',
        fromDate: '',
        toDate: '',
        fromTime: '',
        toTime: ''
      });
    },

    removeNewRow(index) {
      this.newAppointments.splice(index, 1);
    },

    async saveAppointments() {
      try {
        // Validate all fields are filled
        const isValid = this.newAppointments.every(appointment => 
          appointment.clinic && 
          appointment.fromDate && 
          appointment.toDate && 
          appointment.fromTime && 
          appointment.toTime
        );

        if (!isValid) {
          alert('الرجاء ملء جميع الحقول المطلوبة');
          return;
        }

        const response = await fetch(`${API_URL}/appointments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newAppointments)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Clear new appointments and reload
        this.newAppointments = [];
        await this.loadAppointments();
        alert('تم حفظ المواعيد بنجاح');
      } catch (error) {
        console.error('Error saving appointments:', error);
        alert('حدث خطأ أثناء حفظ المواعيد');
      }
    },

    async deleteAppointment(id) {
      if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/appointments/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await this.loadAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('حدث خطأ أثناء حذف الموعد');
      }
    },

    getClinicName(id) {
      const clinic = this.clinics.find(c => c.id === parseInt(id));
      return clinic ? clinic.name : '';
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('ar-SA');
    },

    formatTime(timeString) {
      return timeString;
    }
  }));
});

Alpine.start();