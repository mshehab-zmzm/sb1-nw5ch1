import express from 'express';
import { getAllAppointments, createAppointments, deleteAppointment } from '../controllers/appointmentController.js';

export const router = express.Router();

router.get('/', getAllAppointments);
router.post('/', createAppointments);
router.delete('/:id', deleteAppointment);