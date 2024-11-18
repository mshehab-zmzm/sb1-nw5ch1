import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { router as appointmentRoutes } from './routes/appointments.js';
import { router as consultationRoutes } from './routes/consultations.js';
import { router as doctorConsultationRoutes } from './routes/doctorConsultations.js';
import { router as doctorAppointmentRoutes } from './routes/doctorAppointments.js';
import { router as beneficiaryRoutes } from './routes/beneficiary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/doctor', doctorConsultationRoutes);
app.use('/api/doctor/appointments', doctorAppointmentRoutes);
app.use('/api/beneficiary', beneficiaryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});