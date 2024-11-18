import { db } from '../db/database.js';

export const getAvailableAppointments = async (req, res) => {
  try {
    const appointments = await db.all(`
      SELECT a.*, 
             COALESCE(COUNT(DISTINCT dr.id), 0) as registeredDoctors,
             CASE 
               WHEN EXISTS (
                 SELECT 1 FROM doctor_registered_appointments 
                 WHERE appointmentId = a.id AND doctorId = ?
               ) THEN 1 
               ELSE 0 
             END as isRegistered
      FROM available_appointments a
      LEFT JOIN doctor_registered_appointments dr ON a.id = dr.appointmentId
      WHERE a.fromDate >= date('now')
      GROUP BY a.id, a.clinic, a.fromDate, a.toDate, a.fromTime, a.toTime, a.isBooked, a.createdAt
      ORDER BY a.fromDate ASC, a.fromTime ASC
    `, [req.query.doctorId || 0]);

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getRegisteredAppointments = async (req, res) => {
  try {
    const appointments = await db.all(`
      SELECT 
        dr.*,
        a.clinic,
        a.fromDate,
        a.toDate
      FROM doctor_registered_appointments dr
      JOIN available_appointments a ON dr.appointmentId = a.id
      WHERE a.fromDate >= date('now')
      ORDER BY a.fromDate ASC, dr.fromTime ASC
    `);

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching registered appointments:', error);
    res.status(500).json({ message: error.message });
  }
};

export const registerForAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentId, fromTime, toTime } = req.body;

    // Validate input
    if (!doctorId || !appointmentId || !fromTime || !toTime) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    // Check if appointment exists
    const appointment = await db.get(
      'SELECT * FROM available_appointments WHERE id = ?',
      [appointmentId]
    );

    if (!appointment) {
      return res.status(404).json({ message: 'الموعد غير موجود' });
    }

    // Check if already registered
    const existing = await db.get(
      'SELECT id FROM doctor_registered_appointments WHERE doctorId = ? AND appointmentId = ?',
      [doctorId, appointmentId]
    );

    if (existing) {
      return res.status(400).json({ message: 'أنت مسجل بالفعل في هذا الموعد' });
    }

    // Register for appointment
    const result = await db.run(
      `INSERT INTO doctor_registered_appointments (
        doctorId, appointmentId, fromTime, toTime
      ) VALUES (?, ?, ?, ?)`,
      [doctorId, appointmentId, fromTime, toTime]
    );

    res.status(201).json({ 
      message: 'تم التسجيل في الموعد بنجاح',
      registrationId: result.id
    });
  } catch (error) {
    console.error('Error registering for appointment:', error);
    res.status(400).json({ message: error.message });
  }
};