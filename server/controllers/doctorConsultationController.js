import { unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(dirname(__filename), '..');

export const getConsultationRequests = async (req, res) => {
  try {
    // First get all consultations
    const consultations = await db.all(`
      SELECT 
        c.*,
        b.name,
        b.birthDate,
        b.gender,
        b.mobile,
        b.nationalId
      FROM consultations c
      JOIN beneficiaries b ON c.beneficiaryId = b.id
      ORDER BY c.createdAt DESC
    `);

    // Then get supporting documents for each consultation
    const consultationsWithDocs = await Promise.all(
      consultations.map(async (consultation) => {
        const docs = await db.all(
          'SELECT id, title, filename FROM supporting_documents WHERE consultationId = ?',
          [consultation.id]
        );
        return {
          ...consultation,
          supportingDocs: docs
        };
      })
    );

    res.json(consultationsWithDocs);
  } catch (error) {
    console.error('Error fetching consultation requests:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getConsultation = async (req, res) => {
  try {
    const { id } = req.params;

    const consultation = await db.get(`
      SELECT 
        c.*,
        b.name,
        b.birthDate,
        b.gender,
        b.mobile,
        b.nationalId
      FROM consultations c
      JOIN beneficiaries b ON c.beneficiaryId = b.id
      WHERE c.id = ?
    `, [id]);

    if (!consultation) {
      return res.status(404).json({ message: 'الاستشارة غير موجودة' });
    }

    // Get consultation notes
    const notes = await db.all(
      'SELECT * FROM consultation_notes WHERE consultationId = ? ORDER BY createdAt DESC',
      [id]
    );

    // Get supporting documents
    const documents = await db.all(
      'SELECT * FROM supporting_documents WHERE consultationId = ?',
      [id]
    );

    res.json({
      ...consultation,
      notes,
      supportingDocs: documents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addConsultationNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const result = await db.run(
      'INSERT INTO consultation_notes (consultationId, title, description) VALUES (?, ?, ?)',
      [id, title, description]
    );

    res.status(201).json({
      message: 'تمت إضافة الملاحظة بنجاح',
      noteId: result.id
    });
  } catch (error) {
    console.error('Error adding consultation note:', error);
    res.status(400).json({ message: error.message });
  }
};

export const createNewConsultation = async (req, res) => {
  try {
    const {
      name, birthDate, gender, mobile, nationalId,
      description, symptomsDuration, clinic, doctor
    } = req.body;

    // First, check if beneficiary exists
    let beneficiary = await db.get(
      'SELECT id FROM beneficiaries WHERE nationalId = ?',
      [nationalId]
    );

    // If beneficiary doesn't exist, create new one
    if (!beneficiary) {
      const result = await db.run(
        `INSERT INTO beneficiaries (
          name, birthDate, gender, mobile, nationalId
        ) VALUES (?, ?, ?, ?, ?)`,
        [name, birthDate, gender, mobile, nationalId]
      );
      beneficiary = { id: result.id };
    }

    const result = await db.run(
      `INSERT INTO consultations (
        beneficiaryId, description, symptomsDuration,
        clinic, doctor, status, appointment
      ) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        beneficiary.id, description, symptomsDuration,
        clinic, doctor, 'in_progress'
      ]
    );

    res.status(201).json({
      message: 'تم بدء الاستشارة بنجاح',
      consultationId: result.id
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(400).json({ message: error.message });
  }
};

export const startConsultation = async (req, res) => {
  try {
    const { id } = req.params;

    // Update consultation status
    await db.run(
      'UPDATE consultations SET status = ? WHERE id = ? AND status = ?',
      ['in_progress', id, 'pending']
    );

    res.json({ message: 'تم بدء الاستشارة بنجاح' });
  } catch (error) {
    console.error('Error starting consultation:', error);
    res.status(400).json({ message: error.message });
  }
};

export const saveConsultationResult = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      medicalFileNumber, chiefComplaint, medicalHistory,
      currentMedications, clinicalExamination, diagnosis,
      treatmentPlan, prescription, notes
    } = req.body;

    // Update consultation with medical results
    await db.run(
      `UPDATE consultations SET
        medicalFileNumber = ?,
        chiefComplaint = ?,
        medicalHistory = ?,
        currentMedications = ?,
        clinicalExamination = ?,
        diagnosis = ?,
        treatmentPlan = ?,
        prescription = ?,
        notes = ?,
        status = 'completed'
      WHERE id = ?`,
      [
        medicalFileNumber, chiefComplaint, medicalHistory,
        currentMedications, clinicalExamination, diagnosis,
        treatmentPlan, JSON.stringify(prescription), notes,
        id
      ]
    );

    res.json({
      message: 'تم حفظ نتيجة الاستشارة بنجاح'
    });
  } catch (error) {
    console.error('Error saving consultation result:', error);
    res.status(400).json({ message: error.message });
  }
};

export const addSupportingDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const { filename } = req.file;

    const result = await db.run(
      'INSERT INTO supporting_documents (consultationId, title, filename) VALUES (?, ?, ?)',
      [id, title, filename]
    );

    res.status(201).json({
      message: 'تم إضافة المستند بنجاح',
      documentId: result.id
    });
  } catch (error) {
    console.error('Error adding supporting document:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteSupportingDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;

    // Get the filename before deleting
    const doc = await db.get(
      'SELECT filename FROM supporting_documents WHERE id = ? AND consultationId = ?',
      [docId, id]
    );

    if (!doc) {
      return res.status(404).json({ message: 'المستند غير موجود' });
    }

    // Delete the file
    try {
      await unlink(join(__dirname, 'uploads', doc.filename));
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    // Delete from database
    await db.run(
      'DELETE FROM supporting_documents WHERE id = ? AND consultationId = ?',
      [docId, id]
    );

    res.json({ message: 'تم حذف المستند بنجاح' });
  } catch (error) {
    console.error('Error deleting supporting document:', error);
    res.status(400).json({ message: error.message });
  }
};