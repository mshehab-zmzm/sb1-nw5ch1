import { all, run } from '../db/database.js';

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await all(
      'SELECT * FROM available_appointments ORDER BY fromDate ASC, fromTime ASC'
    );
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAppointments = async (req, res) => {
  try {
    const appointments = req.body;
    const results = [];

    for (const appointment of appointments) {
      const { clinic, fromDate, toDate, fromTime, toTime } = appointment;
      const result = await run(
        `INSERT INTO available_appointments (
          clinic, fromDate, toDate, fromTime, toTime
        ) VALUES (?, ?, ?, ?, ?)`,
        [clinic, fromDate, toDate, fromTime, toTime]
      );
      results.push(result);
    }

    res.status(201).json({ 
      message: 'تم إضافة المواعيد بنجاح',
      results 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM available_appointments WHERE id = ? AND isBooked = 0', [id]);
    res.json({ message: 'تم حذف الموعد بنجاح' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};