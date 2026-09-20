import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, firebaseConfig } from '../config/firebase';
import type { UsuarioDoc } from '../types/auth';

/**
 * Lists all registered instructors/teachers in the system.
 */
export async function listTeachers(): Promise<UsuarioDoc[]> {
  const colRef = collection(db, 'users');
  const snap = await getDocs(colRef);
  const teachers: UsuarioDoc[] = [];

  snap.forEach((d) => {
    const data = d.data() as UsuarioDoc;
    if (data.role === 'professor' || data.role === 'instrutor') {
      teachers.push({
        ...data,
        uid: d.id,
        instruments: data.instruments || (data.instrument && data.instrument !== 'Instrutor Geral' && data.instrument !== 'Todos os Instrumentos' ? [data.instrument] : []),
      });
    }
  });

  return teachers.sort((a, b) => a.name.localeCompare(b.name));
}

export const listInstructors = listTeachers;

/**
 * Creates a new instructor account in Firebase Auth and creates their Firestore record.
 * Uses an isolated secondary app instance to preserve the current admin session.
 */
export async function createTeacherByAdmin(data: {
  name: string;
  email: string;
  phone: string;
  instruments?: string[];
  initialPassword: string;
}): Promise<UsuarioDoc> {
  const secondaryApp = initializeApp(firebaseConfig, `createTeacher_${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      data.email.trim(),
      data.initialPassword
    );
    const newUid = cred.user.uid;

    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);

    const selectedInstruments = data.instruments || [];
    const formattedInstrumentStr =
      selectedInstruments.length > 0
        ? selectedInstruments.join(', ')
        : 'Todos os Instrumentos';

    const newTeacherDoc: UsuarioDoc = {
      uid: newUid,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      instrument: formattedInstrumentStr,
      instruments: selectedInstruments,
      role: 'instrutor',
      totalHinos: 480,
      hinosConcluidos: 0,
      hinosEmProgresso: 0,
      progressoGeral: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', newUid), newTeacherDoc);
    return newTeacherDoc;
  } catch (err: any) {
    await deleteApp(secondaryApp);
    throw err;
  }
}

export const createInstructorByAdmin = createTeacherByAdmin;

/**
 * Updates the qualified instruments for a specific instructor.
 */
export async function updateInstructorInstruments(
  instructorUid: string,
  instruments: string[]
): Promise<void> {
  const userRef = doc(db, 'users', instructorUid);
  const formatted = instruments.length > 0 ? instruments.join(', ') : 'Todos os Instrumentos';
  await updateDoc(userRef, {
    instruments,
    instrument: formatted,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes an instructor's record.
 * Note: Only admins can perform this.
 */
export async function deleteTeacherByAdmin(teacherUid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', teacherUid));
}

export const deleteInstructorByAdmin = deleteTeacherByAdmin;
