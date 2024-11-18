import { all, run, get } from '../db/database.js';
import { mkdir } from 'fs/promises';
const UPLOADS_DIR = 'uploads';
// Ensure uploads directory exists
try {
  await mkdir(UPLOADS_DIR, { recursive: true });
} catch (err) {
  console.error('Error creating uploads directory:', err);
}

export const getAllConsultations = async (req, res) => {
  try {
    // Get consultations with beneficiary details
    const consultations = await all(`
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

    // Get supporting documents for each consultation
    const consultationsWithDocs = await Promise.all(
      consultations.map(async (consultation) => {
        const docs = await all(
          'SELECT id, title, filename FROM supporting_documents WHERE consultationId = ?',
          [consultation.id]
        );
        return { ...consultation, supportingDocs: docs };
      })
    );

    res.json(consultationsWithDocs);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createConsultation = async (req, res) => {
  try {
    const {
      name, birthDate, gender, mobile, nationalId,
      description, symptomsDuration, clinic, doctor, appointment
    } = req.body;

    // First, check if beneficiary exists
    let beneficiary = await get(
      'SELECT id FROM beneficiaries WHERE nationalId = ?',
      [nationalId]
    );

    // If beneficiary doesn't exist, create new one
    if (!beneficiary) {
      const result = await run(
        `INSERT INTO beneficiaries (
          name, birthDate, gender, mobile, nationalId
        ) VALUES (?, ?, ?, ?, ?)`,
        [name, birthDate, gender, mobile, nationalId]
      );
      beneficiary = { id: result.id };
    }

    // Insert consultation
    const result = await run(
      `INSERT INTO consultations (
        beneficiaryId, description, symptomsDuration,
        clinic, doctor, appointment
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [beneficiary.id, description, symptomsDuration,
       clinic, doctor, appointment]
    );

    const consultationId = result.id;

    // Handle supporting documents
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const title = req.body[`supportingDocs[${file.fieldname}][title]`];
        await run(
          'INSERT INTO supporting_documents (consultationId, title, filename) VALUES (?, ?, ?)',
          [consultationId, title, file.filename]
        );
      }
    }

    res.status(201).json({ 
      message: 'تم إنشاء طلب الاستشارة بنجاح',
      consultationId 
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(400).json({ message: error.message });
  }
};