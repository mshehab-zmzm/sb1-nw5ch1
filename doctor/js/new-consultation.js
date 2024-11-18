import Alpine from 'alpinejs';
import { validateField } from '../modules/validation.js';
import { createNewConsultation, fetchDoctorsByClinic } from '../modules/api.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

document.addEventListener('alpine:init', () => {
  Alpine.data('newConsultation', () => ({
    formData: {
      name: '',
      birthDate: '',
      gender: '',
      mobile: '',
      nationalId: '',
      description: '',
      symptomsDuration: '',
      clinic: '',
      doctor: ''
    },
    errors: {},
    clinics: [
      { id: 1, name: 'العيادة العامة' },
      { id: 2, name: 'عيادة الباطنية' },
      { id: 3, name: 'عيادة الأطفال' },
      { id: 4, name: 'عيادة النساء والولادة' }
    ],
    doctors: [],

    async loadDoctors() {
      this.doctors = await fetchDoctorsByClinic(this.formData.clinic);
      this.formData.doctor = '';
    },

    validateField(field) {
      const error = validateField(this.formData[field], field);
      this.errors[field] = error;
      return !error;
    },

    validateForm() {
      const fields = [
        'name', 'birthDate', 'gender', 'mobile', 'nationalId',
        'description', 'symptomsDuration', 'clinic', 'doctor'
      ];
      
      let isValid = true;
      fields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });
      return isValid;
    },

    async submitForm() {
      if (!this.validateForm()) {
        return;
      }

      try {
        const result = await createNewConsultation(this.formData);
        alert('تم بدء الاستشارة بنجاح');
        window.location.href = `/doctor/consultation-result.html?id=${result.consultationId}`;
      } catch (error) {
        console.error('Error creating consultation:', error);
        alert('حدث خطأ أثناء إنشاء الاستشارة. الرجاء المحاولة مرة أخرى.');
      }
    }
  }));
});

Alpine.start();