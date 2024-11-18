import express from 'express';
import multer from 'multer';
import { join } from 'path';
import { 
  getProfile,
  updateProfile,
  getChronicDiseases, 
  addChronicDisease, 
  deleteChronicDisease, 
  getAllergies, 
  addAllergy, 
  deleteAllergy,
  getProfileFiles,
  addProfileFile,
  deleteProfileFile,
  getProfileNotes,
  addProfileNote,
  deleteProfileNote
} from '../controllers/beneficiaryController.js';

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

// Profile routes
router.get('/profile/:id', getProfile);
router.put('/profile/:id', updateProfile);

// Chronic diseases routes
router.get('/profile/:id/diseases', getChronicDiseases);
router.post('/profile/:id/diseases', addChronicDisease);
router.delete('/profile/:id/diseases/:diseaseId', deleteChronicDisease);

// Allergies routes
router.get('/profile/:id/allergies', getAllergies);
router.post('/profile/:id/allergies', addAllergy);
router.delete('/profile/:id/allergies/:allergyId', deleteAllergy);

// Profile files routes
router.get('/profile/:id/files', getProfileFiles);
router.post('/profile/:id/files', upload.single('file'), addProfileFile);
router.delete('/profile/:id/files/:fileId', deleteProfileFile);

// Profile notes routes
router.get('/profile/:id/notes', getProfileNotes);
router.post('/profile/:id/notes', addProfileNote);
router.delete('/profile/:id/notes/:noteId', deleteProfileNote);