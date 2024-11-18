import Alpine from 'alpinejs';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const API_URL = 'http://localhost:3000/api/doctor';

document.addEventListener('alpine:init', () => {
  Alpine.data('consultationRequests', () => ({
    requests: [],
    statusFilter: '',
    clinics: [
      { id: 1, name: 'العيادة العامة' },
      { id: 2, name: 'عيادة الباطنية' },
      { id: 3, name: 'عيادة الأطفال' },
      { id: 4, name: 'عيادة النساء والولادة' }
    ],

    async init() {
      await this.loadRequests();
    },

    get filteredRequests() {
      if (!this.statusFilter) {
        return this.requests;
      }
      return this.requests.filter(request => request.status === this.statusFilter);
    },

    async loadRequests() {
      try {
        const response = await fetch(`${API_URL}/consultations/requests`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.requests = await response.json();
      } catch (error) {
        console.error('Error loading consultation requests:', error);
        this.requests = [];
      }
    },

    async startConsultation(id) {
      if (!confirm('هل أنت متأكد من بدء هذه الاستشارة؟')) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/consultations/${id}/start`, {
          method: 'POST'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await this.loadRequests();
        window.location.href = `/doctor/consultation-details.html?id=${id}`;
      } catch (error) {
        console.error('Error starting consultation:', error);
        alert('حدث خطأ أثناء بدء الاستشارة');
      }
    },

    getClinicName(id) {
      const clinic = this.clinics.find(c => c.id === parseInt(id));
      return clinic ? clinic.name : '';
    },

    getStatusBadgeClass(status) {
      const classes = {
        pending: 'badge bg-warning',
        in_progress: 'badge bg-primary',
        completed: 'badge bg-success'
      };
      return classes[status] || 'badge bg-secondary';
    },

    getStatusText(status) {
      const texts = {
        pending: 'قيد الانتظار',
        in_progress: 'قيد المعالجة',
        completed: 'مكتملة'
      };
      return texts[status] || status;
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }));
});

Alpine.start();