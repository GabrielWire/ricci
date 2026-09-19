import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, firebaseConfig } from '../config/firebase';
import type { UsuarioDoc } from '../types/auth';

/**
 * Lists all registered teachers in the system.
 */
export async function listTeachers(): Promise<UsuarioDoc[]> {
  const colRef = collection(db, 'users');
  const snap = await getDocs(colRef);
  const teachers: UsuarioDoc[] = [];

  snap.forEach((d) => {
    const data = d.data() as UsuarioDoc;
    if (data.role === 'professor') {
      teachers.push({ ...data, uid: d.id });
    }
  });

  return teachers.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Creates a new teacher account in Firebase Auth and creates their Firestore record.
 * Uses an isolated secondary app instance to preserve the current admin session.
 */
export async function createTeacherByAdmin(data: {
  name: string;
  email: string;
  phone: string;
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

    const newTeacherDoc: UsuarioDoc = {
      uid: newUid,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      instrument: 'Instrutor Geral',
      role: 'professor',
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

/**
 * Deletes a teacher's record.
 * Note: Only admins can perform this.
 */
export async function deleteTeacherByAdmin(teacherUid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', teacherUid));
}
