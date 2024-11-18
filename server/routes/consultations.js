import express from 'express';
import multer from 'multer';
import { join } from 'path';
import { getAllConsultations, createConsultation } from '../controllers/consultationController.js';

export const router = express.Router();

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

router.get('/', getAllConsultations);
router.post('/', upload.array('supportingDocs'), createConsultation);