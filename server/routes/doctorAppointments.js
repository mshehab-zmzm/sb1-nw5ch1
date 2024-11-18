import express from 'express';
import { getAvailableAppointments, registerForAppointment, getRegisteredAppointments } from '../controllers/doctorAppointmentsController.js';

export const router = express.Router();

router.get('/available', getAvailableAppointments);
router.get('/registered', getRegisteredAppointments);
router.post('/register', registerForAppointment);