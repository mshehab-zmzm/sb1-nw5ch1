import express from 'express';
import multer from 'multer';
import { join } from 'path';
import { 
  createNewConsultation, 
  getConsultation, 
  saveConsultationResult, 
  addConsultationNote,
  getConsultationRequests,
  startConsultation,
  addSupportingDocument,
  deleteSupportingDocument
} from '../controllers/doctorConsultationController.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

export const router = express.Router();

router.get('/consultations/requests', getConsultationRequests);
router.get('/consultations/:id', getConsultation);
router.post('/consultations', createNewConsultation);
router.post('/consultations/:id/result', saveConsultationResult);
router.post('/consultations/:id/notes', addConsultationNote);
router.post('/consultations/:id/start', startConsultation);
router.post('/consultations/:id/documents', upload.single('file'), addSupportingDocument);
router.delete('/consultations/:id/documents/:docId', deleteSupportingDocument);