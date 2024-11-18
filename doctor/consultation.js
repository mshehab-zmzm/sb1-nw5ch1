import Alpine from 'alpinejs';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const API_URL = 'http://localhost:3000/api';

document.addEventListener('alpine:init', () => {
  Alpine.data('doctorConsultation', () => ({
    formData: {
      medicalFileNumber: '',
      patientName: '',
      age: '',
      gender: '',
      chiefComplaint: '',
      medicalHistory: '',
      currentMedications: '',
      clinicalExamination: '',
      diagnosis: '',
      treatmentPlan: '',
      prescription: [],
      notes: ''
    },
    errors: {},

    validateField(field) {
      const value = this.formData[field];
      let error = '';

      if (['medicalFileNumber', 'patientName', 'age', 'gender', 'chiefComplaint', 
           'medicalHistory', 'clinicalExamination', 'diagnosis', 'treatmentPlan'].includes(field) && !value) {
        error = 'هذا الحقل مطلوب';
      }

      if (field === 'age' && value && (value < 0 || value > 150)) {
        error = 'يرجى إدخال عمر صحيح';
      }

      if (field === 'medicalFileNumber' && value && !/^\d{6}$/.test(value)) {
        error = 'يجب أن يتكون رقم الملف من 6 أرقام';
      }

      this.errors[field] = error;
      return !error;
    },

    validateForm() {
      const requiredFields = [
        'medicalFileNumber', 'patientName', 'age', 'gender', 'chiefComplaint',
        'medicalHistory', 'clinicalExamination', 'diagnosis', 'treatmentPlan'
      ];

      let isValid = true;
      requiredFields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      return isValid;
    },

    addMedicine() {
      this.formData.prescription.push({
        name: '',
        dosage: '',
        duration: ''
      });
    },

    removeMedicine(index) {
      this.formData.prescription.splice(index, 1);
    },

    async submitForm() {
      if (!this.validateForm()) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/doctor/consultations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.formData)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        alert('تم حفظ الاستشارة بنجاح');
        window.location.href = '/doctor/consultations.html';
      } catch (error) {
        console.error('Error submitting consultation:', error);
        alert('حدث خطأ أثناء حفظ الاستشارة. الرجاء المحاولة مرة أخرى.');
      }
    }
  }));
});

Alpine.start();