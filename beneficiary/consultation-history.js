import Alpine from 'alpinejs'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const API_URL = 'http://localhost:3000/api'

document.addEventListener('alpine:init', () => {
  Alpine.data('consultationHistory', () => ({
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
      { id: 3, name: 'د. خالد العمري' }
    ],
    appointments: [
      { id: 1, time: '٩:٠٠ صباحاً - الأحد ٢٠٢٤/٠٣/١٠' },
      { id: 2, time: '١١:٣٠ صباحاً - الأحد ٢٠٢٤/٠٣/١٠' },
      { id: 3, time: '٢:٠٠ مساءً - الإثنين ٢٠٢٤/٠٣/١١' }
    ],

    async init() {
      await this.fetchConsultations()
    },

    async fetchConsultations() {
      try {
        const response = await fetch(`${API_URL}/consultations`)
        this.consultations = await response.json()
      } catch (error) {
        console.error('Error fetching consultations:', error)
        this.consultations = []
      }
    },

    getClinicName(id) {
      const clinic = this.clinics.find(c => c.id === parseInt(id))
      return clinic ? clinic.name : ''
    },

    getDoctorName(id) {
      const doctor = this.doctors.find(d => d.id === parseInt(id))
      return doctor ? doctor.name : ''
    },

    getAppointmentTime(id) {
      const appointment = this.appointments.find(a => a.id === parseInt(id))
      return appointment ? appointment.time : ''
    },

    getStatusBadgeClass(status) {
      const classes = {
        pending: 'badge bg-warning',
        approved: 'badge bg-success',
        rejected: 'badge bg-danger',
        completed: 'badge bg-info'
      }
      return classes[status] || classes.pending
    },

    getStatusText(status) {
      const texts = {
        pending: 'قيد المراجعة',
        approved: 'تمت الموافقة',
        rejected: 'مرفوض',
        completed: 'مكتمل'
      }
      return texts[status] || texts.pending
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }))
})

Alpine.start()