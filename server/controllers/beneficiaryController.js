import { all, run, get } from '../db/database.js';
import { unlink } from 'fs/promises';
import { join } from 'path';

export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await get(
      'SELECT * FROM beneficiaries WHERE id = ?',
      [id]
    );
    
    if (!profile) {
      return res.status(404).json({ message: 'المستفيد غير موجود' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, birthDate, gender, mobile, nationalId } = req.body;

    await run(
      `UPDATE beneficiaries 
       SET name = ?, birthDate = ?, gender = ?, mobile = ?, nationalId = ?
       WHERE id = ?`,
      [name, birthDate, gender, mobile, nationalId, id]
    );

    res.json({ message: 'تم تحديث البيانات بنجاح' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getChronicDiseases = async (req, res) => {
  try {
    const { id } = req.params;
    const diseases = await all(
      'SELECT * FROM chronic_diseases WHERE beneficiaryId = ? ORDER BY createdAt DESC',
      [id]
    );
    res.json(diseases);
  } catch (error) {
    console.error('Error fetching chronic diseases:', error);
    res.status(500).json({ message: error.message });
  }
};

export const addChronicDisease = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const result = await run(
      'INSERT INTO chronic_diseases (beneficiaryId, title) VALUES (?, ?)',
      [id, title]
    );

    res.status(201).json({
      message: 'تمت إضافة المرض المزمن بنجاح',
      id: result.id
    });
  } catch (error) {
    console.error('Error adding chronic disease:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteChronicDisease = async (req, res) => {
  try {
    const { id, diseaseId } = req.params;

    await run(
      'DELETE FROM chronic_diseases WHERE id = ? AND beneficiaryId = ?',
      [diseaseId, id]
    );

    res.json({ message: 'تم حذف المرض المزمن بنجاح' });
  } catch (error) {
    console.error('Error deleting chronic disease:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getAllergies = async (req, res) => {
  try {
    const { id } = req.params;
    const allergies = await all(
      'SELECT * FROM allergies WHERE beneficiaryId = ? ORDER BY createdAt DESC',
      [id]
    );
    res.json(allergies);
  } catch (error) {
    console.error('Error fetching allergies:', error);
    res.status(500).json({ message: error.message });
  }
};

export const addAllergy = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, name } = req.body;

    const result = await run(
      'INSERT INTO allergies (beneficiaryId, type, name) VALUES (?, ?, ?)',
      [id, type, name]
    );

    res.status(201).json({
      message: 'تمت إضافة الحساسية بنجاح',
      id: result.id
    });
  } catch (error) {
    console.error('Error adding allergy:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteAllergy = async (req, res) => {
  try {
    const { id, allergyId } = req.params;

    await run(
      'DELETE FROM allergies WHERE id = ? AND beneficiaryId = ?',
      [allergyId, id]
    );

    res.json({ message: 'تم حذف الحساسية بنجاح' });
  } catch (error) {
    console.error('Error deleting allergy:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get profile files
export const getProfileFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const files = await all(
      'SELECT * FROM profile_files WHERE beneficiaryId = ? ORDER BY createdAt DESC',
      [id]
    );
    res.json(files);
  } catch (error) {
    console.error('Error fetching profile files:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add profile file
export const addProfileFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const { filename } = req.file;

    const result = await run(
      'INSERT INTO profile_files (beneficiaryId, title, filename) VALUES (?, ?, ?)',
      [id, title, filename]
    );

    res.status(201).json({
      message: 'تمت إضافة المستند بنجاح',
      id: result.id
    });
  } catch (error) {
    console.error('Error adding profile file:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete profile file
export const deleteProfileFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;

    // Get file info before deleting
    const file = await get(
      'SELECT filename FROM profile_files WHERE id = ? AND beneficiaryId = ?',
      [fileId, id]
    );

    if (!file) {
      return res.status(404).json({ message: 'المستند غير موجود' });
    }

    // Delete physical file
    try {
      await unlink(join(process.cwd(), 'server', 'uploads', file.filename));
    } catch (err) {
      console.error('Error deleting physical file:', err);
    }

    // Delete from database
    await run(
      'DELETE FROM profile_files WHERE id = ? AND beneficiaryId = ?',
      [fileId, id]
    );

    res.json({ message: 'تم حذف المستند بنجاح' });
  } catch (error) {
    console.error('Error deleting profile file:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get profile notes
export const getProfileNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await all(
      'SELECT * FROM profile_notes WHERE beneficiaryId = ? ORDER BY createdAt DESC',
      [id]
    );
    res.json(notes);
  } catch (error) {
    console.error('Error fetching profile notes:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add profile note
export const addProfileNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const result = await run(
      'INSERT INTO profile_notes (beneficiaryId, title, content, createdBy) VALUES (?, ?, ?, ?)',
      [id, title, content, 'المستفيد'] // Later this will come from auth
    );

    res.status(201).json({
      message: 'تمت إضافة الملاحظة بنجاح',
      id: result.id
    });
  } catch (error) {
    console.error('Error adding profile note:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete profile note
export const deleteProfileNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;

    await run(
      'DELETE FROM profile_notes WHERE id = ? AND beneficiaryId = ?',
      [noteId, id]
    );

    res.json({ message: 'تم حذف الملاحظة بنجاح' });
  } catch (error) {
    console.error('Error deleting profile note:', error);
    res.status(400).json({ message: error.message });
  }
};