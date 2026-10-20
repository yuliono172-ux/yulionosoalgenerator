import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EvaluationKit, SchoolMetadata } from '../types/assessment';

export interface BankSoalRecord {
  id: string;
  judul: string;
  mataPelajaran: string;
  levelKelas: string;
  tahunAjaran: string;
  semester: string;
  totalSoal: number;
  jumlahHots: number;
  createdAt: string;
  kit: EvaluationKit;
  schoolInfo: SchoolMetadata;
  source?: 'firestore' | 'local';
}

const LOCAL_STORAGE_KEY = 'bank_soal_kurikulum_merdeka';

import { SEED_BANK_SOAL_RECORDS } from '../data/bankSoalSeeds';

// Helper to get local records
function getLocalBankSoal(): BankSoalRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Seed with high quality multi-year assessments for immediate comparison
    saveLocalBankSoal(SEED_BANK_SOAL_RECORDS);
    return SEED_BANK_SOAL_RECORDS;
  } catch (e) {
    console.error('Error reading local bank soal', e);
    return SEED_BANK_SOAL_RECORDS;
  }
}

// Helper to save local records
function saveLocalBankSoal(records: BankSoalRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error writing local bank soal', e);
  }
}

/**
 * Save assessment kit to Bank Soal (Firestore + LocalStorage)
 */
export async function saveAssessmentToBankSoal(
  kit: EvaluationKit,
  customJudul: string,
  schoolInfo: SchoolMetadata
): Promise<{ id: string; source: 'firestore' | 'local' }> {
  const params = kit.paramsSnapshot;
  const hotsCount = kit.kisi_kisi.filter((k) => k.kategori_hots).length;

  const dataToSave = {
    judul: customJudul || `${params?.mataPelajaran || 'Asesmen'} - ${params?.levelKelas || 'Kurikulum Merdeka'}`,
    mataPelajaran: params?.mataPelajaran || 'Mata Pelajaran',
    levelKelas: params?.levelKelas || 'Fase B',
    tahunAjaran: schoolInfo.tahunPelajaran || '2026/2027',
    semester: schoolInfo.semester || 'Ganjil',
    totalSoal: kit.soal_evaluasi.length,
    jumlahHots: hotsCount,
    createdAt: new Date().toISOString(),
    kit: {
      kisi_kisi: kit.kisi_kisi,
      soal_evaluasi: kit.soal_evaluasi,
      kunci_dan_lembar_jawab: kit.kunci_dan_lembar_jawab,
      paramsSnapshot: kit.paramsSnapshot,
    },
    schoolInfo,
  };

  let firestoreId: string | null = null;

  // Try Firestore first
  try {
    const docRef = await addDoc(collection(db, 'bank_soal'), {
      ...dataToSave,
      firestoreCreatedAt: serverTimestamp(),
    });
    firestoreId = docRef.id;
  } catch (err) {
    console.warn('Firestore write notice (using local storage as primary/backup):', err);
  }

  // Always update local storage as well
  const finalId = firestoreId || `local_${Date.now()}`;
  const localRecord: BankSoalRecord = {
    id: finalId,
    ...dataToSave,
    source: firestoreId ? 'firestore' : 'local',
  };

  const locals = getLocalBankSoal();
  // prepend new record
  saveLocalBankSoal([localRecord, ...locals.filter((r) => r.id !== finalId)]);

  return {
    id: finalId,
    source: firestoreId ? 'firestore' : 'local',
  };
}

/**
 * Fetch all items in Bank Soal from Firestore, falling back to LocalStorage
 */
export async function fetchBankSoalList(): Promise<BankSoalRecord[]> {
  const localList = getLocalBankSoal();
  const remoteList: BankSoalRecord[] = [];

  try {
    const q = query(collection(db, 'bank_soal'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      remoteList.push({
        id: docSnap.id,
        judul: data.judul || 'Perangkat Soal',
        mataPelajaran: data.mataPelajaran || '',
        levelKelas: data.levelKelas || '',
        tahunAjaran: data.tahunAjaran || '',
        semester: data.semester || 'Ganjil',
        totalSoal: data.totalSoal || 0,
        jumlahHots: data.jumlahHots || 0,
        createdAt: data.createdAt || new Date().toISOString(),
        kit: data.kit,
        schoolInfo: data.schoolInfo,
        source: 'firestore',
      });
    });
  } catch (err) {
    console.warn('Could not read from Firestore collection (falling back to local cache):', err);
  }

  // If remote items found, merge with unique local-only items
  if (remoteList.length > 0) {
    const remoteIds = new Set(remoteList.map((r) => r.id));
    const extraLocals = localList.filter((l) => !remoteIds.has(l.id));
    return [...remoteList, ...extraLocals];
  }

  return localList;
}

/**
 * Delete a record from Bank Soal
 */
export async function deleteBankSoalRecord(id: string): Promise<void> {
  // If not local-only, try Firestore
  if (!id.startsWith('local_')) {
    try {
      await deleteDoc(doc(db, 'bank_soal', id));
    } catch (err) {
      console.warn('Could not delete from Firestore:', err);
    }
  }

  // Remove from local storage
  const locals = getLocalBankSoal();
  saveLocalBankSoal(locals.filter((r) => r.id !== id));
}

/**
 * Update the kit of an existing Bank Soal record (e.g. after generating answer keys & rubrics)
 */
export async function updateBankSoalRecordKit(
  id: string,
  updatedKit: EvaluationKit
): Promise<void> {
  const locals = getLocalBankSoal();
  const updatedLocals = locals.map((rec) => {
    if (rec.id === id) {
      return {
        ...rec,
        kit: {
          ...rec.kit,
          ...updatedKit,
          kunci_dan_lembar_jawab: updatedKit.kunci_dan_lembar_jawab,
        },
      };
    }
    return rec;
  });
  saveLocalBankSoal(updatedLocals);
}
