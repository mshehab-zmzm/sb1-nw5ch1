import Alpine from 'alpinejs';
import { Modal } from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const API_URL = 'http://localhost:3000/api/doctor';

document.addEventListener('alpine:init', () => {
  Alpine.data('consultationDetails', () => ({
    consultation: {},
    newNote: {
      title: '',
      description: ''
    },
    newDocument: {
      title: '',
      file: null
    },
    documentModal: null,

    async init() {
      this.documentModal = new Modal(document.getElementById('addDocumentModal'));
      await this.loadConsultation();
    },

    async loadConsultation() {
      try {
        const id = new URLSearchParams(window.location.search).get('id');
        const response = await fetch(`${API_URL}/consultations/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.consultation = await response.json();
      } catch (error) {
        console.error('Error loading consultation:', error);
        alert('حدث خطأ أثناء تحميل بيانات الاستشارة');
      }
    },

    showAddDocumentModal() {
      this.newDocument = { title: '', file: null };
      this.documentModal.show();
    },

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.newDocument.file = file;
      }
    },

    async addDocument() {
      try {
        const id = new URLSearchParams(window.location.search).get('id');
        const formData = new FormData();
        formData.append('title', this.newDocument.title);
        formData.append('file', this.newDocument.file);

        const response = await fetch(`${API_URL}/consultations/${id}/documents`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        this.documentModal.hide();
        await this.loadConsultation();
      } catch (error) {
        console.error('Error adding document:', error);
        alert('حدث خطأ أثناء إضافة المستند');
      }
    },

    async deleteDocument(docId) {
      if (!confirm('هل أنت متأكد من حذف هذا المستند؟')) {
        return;
      }

      try {
        const id = new URLSearchParams(window.location.search).get('id');
        const response = await fetch(`${API_URL}/consultations/${id}/documents/${docId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await this.loadConsultation();
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('حدث خطأ أثناء حذف المستند');
      }
    },

    async addNote() {
      try {
        const id = new URLSearchParams(window.location.search).get('id');
        const response = await fetch(`${API_URL}/consultations/${id}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newNote)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Reset form and reload consultation
        this.newNote = { title: '', description: '' };
        await this.loadConsultation();
      } catch (error) {
        console.error('Error adding note:', error);
        alert('حدث خطأ أثناء إضافة الملاحظة');
      }
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