import Alpine from 'alpinejs';
import { Modal } from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const API_URL = 'http://localhost:3000/api/beneficiary';

document.addEventListener('alpine:init', () => {
  Alpine.data('editProfile', () => ({
    formData: {
      name: '',
      birthDate: '',
      gender: '',
      mobile: '',
      nationalId: ''
    },
    files: [],
    notes: [],
    chronicDiseases: [],
    allergies: [],
    newFile: {
      title: '',
      file: null
    },
    newNote: {
      title: '',
      content: ''
    },
    fileModal: null,
    noteModal: null,
    errors: {},

    async init() {
      // Initialize modals after DOM is loaded
      document.addEventListener('DOMContentLoaded', () => {
        this.fileModal = new Modal(document.getElementById('addFileModal'));
        this.noteModal = new Modal(document.getElementById('addNoteModal'));
      });

      await this.loadProfile();
      await this.loadFiles();
      await this.loadNotes();
    },

    async loadProfile() {
      try {
        const beneficiaryId = 1; // This should come from auth
        const response = await fetch(`${API_URL}/profile/${beneficiaryId}`);
        if (!response.ok) {
          throw new Error('Failed to load profile');
        }
        this.formData = await response.json();
      } catch (error) {
        console.error('Error loading profile:', error);
        alert('حدث خطأ أثناء تحميل البيانات الشخصية');
      }
    },

    async loadFiles() {
      try {
        const beneficiaryId = 1; // This should come from auth
        const response = await fetch(`${API_URL}/profile/${beneficiaryId}/files`);
        if (!response.ok) {
          throw new Error('Failed to load files');
        }
        this.files = await response.json();
      } catch (error) {
        console.error('Error loading files:', error);
        alert('حدث خطأ أثناء تحميل المستندات');
      }
    },

    async loadNotes() {
      try {
        const beneficiaryId = 1; // This should come from auth
        const response = await fetch(`${API_URL}/profile/${beneficiaryId}/notes`);
        if (!response.ok) {
          throw new Error('Failed to load notes');
        }
        this.notes = await response.json();
      } catch (error) {
        console.error('Error loading notes:', error);
        alert('حدث خطأ أثناء تحميل الملاحظات');
      }
    },

    async saveProfile() {
      try {
        const beneficiaryId = 1; // This should come from auth
        const response = await fetch(`${API_URL}/profile/${beneficiaryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.formData)
        });

        if (!response.ok) {
          throw new Error('Failed to save profile');
        }

        alert('تم حفظ البيانات بنجاح');
      } catch (error) {
        console.error('Error saving profile:', error);
        alert('حدث خطأ أثناء حفظ البيانات');
      }
    },

    showAddFileModal() {
      this.newFile = { title: '', file: null };
      this.fileModal?.show();
    },

    showAddNoteModal() {
      this.newNote = { title: '', content: '' };
      this.noteModal?.show();
    },

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.newFile.file = file;
      }
    },

    async addFile() {
      try {
        const beneficiaryId = 1; // This should come from auth
        const formData = new FormData();
        formData.append('title', this.newFile.title);
        formData.append('file', this.newFile.file);

        const response = await fetch(`${API_URL}/profile/${beneficiaryId}/files`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to add file');
        }

        await this.loadFiles();
        this.fileModal?.hide();
      } catch (error) {
        console.error('Error adding file:', error);
        alert('حدث خطأ أثناء إضافة المستند');
      }
    },

    async deleteFile(id) {
      if (!confirm('هل أنت متأكد من حذف هذا المستند؟')) {
        return;
      }

      try {
        const beneficiaryId = 1; // This should come from auth
        const response = await fetch(`${API_URL}/profile/${beneficiaryId}/files/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete file');
        }

        await this.loadFiles();
      } catch (error) {
        console.error('Error deleting file:', error);
        alert('حدث خطأ أثناء حذف المستند');
      }
    },

    async addNote() {
      try {
        const beneficiaryId = 1; // This should come from auth
        const response = await fetch(`${API_URL}/profile/${beneficiaryId}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newNote)
        });

        if (!response.ok) {
          throw new Error('Failed to add note');
        }

        await this.loadNotes();
        this.noteModal?.hide();
      } catch (error) {
        console.error('Error adding note:', error);
        alert('حدث خطأ أثناء إضافة الملاحظة');
      }
    },

    async deleteNote(id) {
      if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
        return;
      }

      try {
        const beneficiaryId = 1; // This should come from auth
        const response = await fetch(`${API_URL}/profile/${beneficiaryId}/notes/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete note');
        }

        await this.loadNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('حدث خطأ أثناء حذف الملاحظة');
      }
    },

    validateField(field) {
      const value = this.formData[field];
      let error = '';

      if (!value) {
        error = 'هذا الحقل مطلوب';
      } else {
        switch (field) {
          case 'mobile':
            if (!/^05\d{8}$/.test(value)) {
              error = 'يجب أن يبدأ رقم الجوال بـ 05 ويتكون من 10 أرقام';
            }
            break;

          case 'nationalId':
            if (!/^\d{10}$/.test(value)) {
              error = 'يجب أن يتكون رقم الهوية من 10 أرقام';
            }
            break;
        }
      }

      this.errors[field] = error;
      return !error;
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