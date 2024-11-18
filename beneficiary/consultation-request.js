import Alpine from 'alpinejs';
import { fetchDoctorsByClinic, fetchAppointmentsByDoctor, submitConsultation } from './modules/api.js';
import { validateField, fieldsPerStep } from './modules/validation.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

document.addEventListener('alpine:init', () => {
  Alpine.data('consultationRequest', () => ({
    currentStep: 1,
    errors: {},
    touched: {},
    clinics: [
      { id: 1, name: 'العيادة العامة' },
      { id: 2, name: 'عيادة الباطنية' },
      { id: 3, name: 'عيادة الأطفال' },
      { id: 4, name: 'عيادة النساء والولادة' }
    ],
    doctors: [],
    appointments: [],
    supportingDocs: [],
    formData: {
      name: '',
      birthDate: '',
      gender: '',
      mobile: '',
      nationalId: '',
      description: '',
      symptomsDuration: '',
      clinic: '',
      doctor: '',
      appointment: ''
    },

    async loadDoctors() {
      this.doctors = await fetchDoctorsByClinic(this.formData.clinic);
      this.formData.doctor = '';
      this.formData.appointment = '';
      this.appointments = [];
    },

    async loadAppointments() {
      this.appointments = await fetchAppointmentsByDoctor(this.formData.doctor);
      this.formData.appointment = '';
    },

    validateField(field) {
      this.touched[field] = true;
      const error = validateField(this.formData[field], field);
      this.errors[field] = error;
      return !error;
    },

    validateStep() {
      const fields = fieldsPerStep[this.currentStep] || [];
      let isValid = true;

      fields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      return isValid;
    },

    nextStep() {
      if (this.validateStep()) {
        this.currentStep++;
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
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

    getAppointmentTime(id) {
      const appointment = this.appointments.find(a => a.id === parseInt(id));
      return appointment ? appointment.time : '';
    },

    addSupportingDoc() {
      this.supportingDocs.push({ title: '', file: null });
    },

    removeSupportingDoc(index) {
      this.supportingDocs.splice(index, 1);
    },

    handleFileSelect(event, index) {
      const file = event.target.files[0];
      if (file) {
        this.supportingDocs[index].file = file;
      }
    },

    async submitForm() {
      try {
        if (!this.validateStep()) {
          return;
        }

        const formData = new FormData();
        
        Object.keys(this.formData).forEach(key => {
          formData.append(key, this.formData[key]);
        });

        this.supportingDocs.forEach((doc, index) => {
          if (doc.file) {
            formData.append('supportingDocs', doc.file);
            formData.append(`supportingDocs[${index}][title]`, doc.title);
          }
        });

        await submitConsultation(formData);
        alert('تم تقديم طلب الاستشارة بنجاح');
        window.location.href = '/beneficiary/consultation-history.html';
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('حدث خطأ أثناء تقديم الطلب. الرجاء المحاولة مرة أخرى.');
      }
    }
  }));
});

Alpine.start();