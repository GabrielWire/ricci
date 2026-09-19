import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { AlunoMetodoProgressoDoc, MetodoEstagioStatus } from '../types/metodo';

export function calculateMethodStage(estagios: { rjm: boolean; culto: boolean; oficializacao: boolean }): MetodoEstagioStatus {
  if (estagios.oficializacao) return 'Apto Oficialização';
  if (estagios.culto) return 'Apto Culto Oficial';
  if (estagios.rjm) return 'Apto RJM / Ensaio';
  return 'Iniciante';
}

/**
 * Retrieves the current instrument method progress for a student.
 */
export async function getStudentMethodProgress(studentId: string): Promise<AlunoMetodoProgressoDoc | null> {
  const docRef = doc(db, 'students', studentId, 'method_progress', 'current');
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data() as AlunoMetodoProgressoDoc;
}

/**
 * Updates student method progress and writes denormalized summary into users/{studentId}.
 */
export async function updateStudentMethodProgress(
  studentId: string,
  data: {
    instrumentoNome: string;
    metodoId: string;
    metodoNome: string;
    posicaoAtual: string;
    progressoPercent: number;
    estagiosAptos: {
      rjm: boolean;
      culto: boolean;
      oficializacao: boolean;
    };
    observacoesInstrutor?: string;
  }
): Promise<AlunoMetodoProgressoDoc> {
  const docRef = doc(db, 'students', studentId, 'method_progress', 'current');
  const stageStatus = calculateMethodStage(data.estagiosAptos);
  const progressoNormalizado = Math.min(100, Math.max(0, Math.round(data.progressoPercent || 0)));

  const updatedDoc: AlunoMetodoProgressoDoc = {
    studentId,
    instrumentoNome: data.instrumentoNome,
    metodoId: data.metodoId,
    metodoNome: data.metodoNome,
    posicaoAtual: data.posicaoAtual.trim() || 'Página 1',
    progressoPercent: progressoNormalizado,
    estagiosAptos: data.estagiosAptos,
    observacoesInstrutor: (data.observacoesInstrutor || '').trim(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, updatedDoc, { merge: true });

  // Update denormalized cached fields on users/{studentId} for fast listing
  const userRef = doc(db, 'users', studentId);
  await updateDoc(userRef, {
    metodoNome: data.metodoNome,
    metodoPosicao: data.posicaoAtual.trim() || 'Página 1',
    metodoProgresso: progressoNormalizado,
    metodoEstagioApto: stageStatus,
    updatedAt: serverTimestamp(),
  });

  return updatedDoc;
}
