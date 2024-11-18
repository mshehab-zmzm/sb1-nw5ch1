import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database connection
export const db = new sqlite3.Database(join(__dirname, 'consultation.db'));

// Initialize database tables
db.serialize(() => {
  // Beneficiaries table
  db.run(`
    CREATE TABLE IF NOT EXISTS beneficiaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      birthDate TEXT NOT NULL,
      gender TEXT NOT NULL,
      mobile TEXT NOT NULL,
      nationalId TEXT NOT NULL UNIQUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Chronic diseases table
  db.run(`
    CREATE TABLE IF NOT EXISTS chronic_diseases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      beneficiaryId INTEGER NOT NULL,
      title TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (beneficiaryId) REFERENCES beneficiaries(id)
    )
  `);

  // Allergies table
  db.run(`
    CREATE TABLE IF NOT EXISTS allergies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      beneficiaryId INTEGER NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (beneficiaryId) REFERENCES beneficiaries(id)
    )
  `);

  // Profile files table
  db.run(`
    CREATE TABLE IF NOT EXISTS profile_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      beneficiaryId INTEGER NOT NULL,
      title TEXT NOT NULL,
      filename TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (beneficiaryId) REFERENCES beneficiaries(id)
    )
  `);

  // Profile notes table
  db.run(`
    CREATE TABLE IF NOT EXISTS profile_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      beneficiaryId INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (beneficiaryId) REFERENCES beneficiaries(id)
    )
  `);

  // Available appointments table
  db.run(`
    CREATE TABLE IF NOT EXISTS available_appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clinic INTEGER NOT NULL,
      fromDate TEXT NOT NULL,
      toDate TEXT NOT NULL,
      fromTime TEXT NOT NULL,
      toTime TEXT NOT NULL,
      isBooked INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Doctor registered appointments table
  db.run(`
    CREATE TABLE IF NOT EXISTS doctor_registered_appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctorId INTEGER NOT NULL,
      appointmentId INTEGER NOT NULL,
      fromTime TEXT NOT NULL,
      toTime TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointmentId) REFERENCES available_appointments(id)
    )
  `);

  // Consultations table (with beneficiaryId reference)
  db.run(`
    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      beneficiaryId INTEGER NOT NULL,
      description TEXT NOT NULL,
      symptomsDuration TEXT NOT NULL,
      clinic INTEGER NOT NULL,
      doctor INTEGER NOT NULL,
      appointment INTEGER NOT NULL,
      medicalFileNumber TEXT,
      chiefComplaint TEXT,
      medicalHistory TEXT,
      currentMedications TEXT,
      clinicalExamination TEXT,
      diagnosis TEXT,
      treatmentPlan TEXT,
      prescription TEXT,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (beneficiaryId) REFERENCES beneficiaries(id),
      FOREIGN KEY (appointment) REFERENCES available_appointments(id)
    )
  `);

  // Supporting documents table
  db.run(`
    CREATE TABLE IF NOT EXISTS supporting_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      consultationId INTEGER NOT NULL,
      title TEXT NOT NULL,
      filename TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (consultationId) REFERENCES consultations(id)
    )
  `);

  // Consultation notes table
  db.run(`
    CREATE TABLE IF NOT EXISTS consultation_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      consultationId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (consultationId) REFERENCES consultations(id)
    )
  `);
});

// Export database functions
export const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};