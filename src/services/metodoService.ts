import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  AlunoMetodoProgressoDoc,
  MetodoLicaoDoc,
  MetodoLicaoStatus,
  MetodoEstagioStatus,
} from '../types/metodo';

export function calculateMethodStage(estagios: {
  rjm: boolean;
  culto: boolean;
  oficializacao: boolean;
}): MetodoEstagioStatus {
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
 * Lists all lessons registered for a student's instrument method.
 * Ordered by page asc, then lesson number asc.
 */
export async function listStudentMethodLessons(studentId: string): Promise<MetodoLicaoDoc[]> {
  const colRef = collection(db, 'students', studentId, 'method_progress', 'current', 'lessons');
  const snap = await getDocs(colRef);
  const lessons: MetodoLicaoDoc[] = [];

  snap.forEach((d) => {
    const data = d.data() as MetodoLicaoDoc;
    lessons.push({ ...data, id: d.id });
  });

  return lessons.sort((a, b) => {
    if (a.numeroPagina !== b.numeroPagina) {
      return a.numeroPagina - b.numeroPagina;
    }
    return a.numeroLicao - b.numeroLicao;
  });
}

/**
 * Saves or updates a specific method lesson (Page + Lesson).
 * Automatically calculates latest student position and syncs users/{studentId}.
 */
export async function saveStudentMethodLesson(
  studentId: string,
  lessonData: {
    id?: string;
    metodoId: string;
    metodoNome: string;
    numeroPagina: number;
    numeroLicao: number;
    titulo?: string;
    status: MetodoLicaoStatus;
    progress: number;
    teacherNotes?: string;
  }
): Promise<MetodoLicaoDoc> {
  const pag = Math.max(1, Number(lessonData.numeroPagina) || 1);
  const lic = Math.max(1, Number(lessonData.numeroLicao) || 1);
  const lessonId = lessonData.id || `pag_${pag}_lic_${lic}`;

  const docRef = doc(db, 'students', studentId, 'method_progress', 'current', 'lessons', lessonId);
  const snap = await getDoc(docRef);
  const existing = snap.exists() ? (snap.data() as MetodoLicaoDoc) : null;

  const nowIso = new Date().toISOString();
  const isDone = lessonData.status === 'Concluído' || lessonData.progress === 100;
  const normProgress = Math.min(100, Math.max(0, Math.round(lessonData.progress)));

  const newDoc: MetodoLicaoDoc = {
    id: lessonId,
    studentId,
    metodoId: lessonData.metodoId,
    metodoNome: lessonData.metodoNome,
    numeroPagina: pag,
    numeroLicao: lic,
    titulo: (lessonData.titulo || '').trim(),
    status: lessonData.status,
    progress: normProgress,
    teacherNotes: lessonData.teacherNotes !== undefined ? lessonData.teacherNotes.trim() : (existing?.teacherNotes || ''),
    startedAt: existing?.startedAt || (lessonData.status !== 'Não iniciado' ? nowIso : null),
    completedAt: isDone ? (existing?.completedAt || nowIso) : null,
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, newDoc, { merge: true });

  // Recalculate summary and position
  await syncMethodSummaryFromLessons(studentId, lessonData.metodoId, lessonData.metodoNome);

  return newDoc;
}

/**
 * Deletes a registered lesson and syncs summary.
 */
export async function deleteStudentMethodLesson(
  studentId: string,
  lessonId: string,
  metodoId: string,
  metodoNome: string
): Promise<void> {
  const docRef = doc(db, 'students', studentId, 'method_progress', 'current', 'lessons', lessonId);
  await deleteDoc(docRef);
  await syncMethodSummaryFromLessons(studentId, metodoId, metodoNome);
}

/**
 * Recalculates latest page + lesson and updates the summary document and user profile.
 */
async function syncMethodSummaryFromLessons(
  studentId: string,
  metodoId: string,
  metodoNome: string
): Promise<void> {
  const lessons = await listStudentMethodLessons(studentId);
  const currentSummary = await getStudentMethodProgress(studentId);

  const totalCadastradas = lessons.length;
  const concluidas = lessons.filter((l) => l.status === 'Concluído' || l.progress === 100).length;

  let latestPag = 1;
  let latestLic = 1;
  let posicaoString = 'Página 1, Lição 1';

  if (lessons.length > 0) {
    // Find active (Em andamento or Concluído) with highest page and lesson
    const activeLessons = lessons.filter((l) => l.status !== 'Não iniciado' || l.progress > 0);
    const target = activeLessons.length > 0 ? activeLessons[activeLessons.length - 1] : lessons[0];
    latestPag = target.numeroPagina;
    latestLic = target.numeroLicao;
    posicaoString = `Página ${latestPag}, Lição ${latestLic}`;
  } else if (currentSummary?.posicaoAtual) {
    posicaoString = currentSummary.posicaoAtual;
  }

  // Calculate percentage: if lessons exist, based on completed / total, or maintain existing
  const progressoPercent =
    totalCadastradas > 0
      ? Math.round((concluidas / totalCadastradas) * 100)
      : (currentSummary?.progressoPercent || 0);

  const estagios = currentSummary?.estagiosAptos || { rjm: false, culto: false, oficializacao: false };
  const stageStatus = calculateMethodStage(estagios);

  const currentRef = doc(db, 'students', studentId, 'method_progress', 'current');
  await setDoc(
    currentRef,
    {
      studentId,
      metodoId: metodoId || currentSummary?.metodoId || '',
      metodoNome: metodoNome || currentSummary?.metodoNome || '',
      paginaAtual: latestPag,
      licaoAtual: latestLic,
      posicaoAtual: posicaoString,
      progressoPercent,
      totalLicoesCadastradas: totalCadastradas,
      totalLicoesConcluidas: concluidas,
      estagiosAptos: estagios,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  const userRef = doc(db, 'users', studentId);
  await updateDoc(userRef, {
    metodoNome: metodoNome || currentSummary?.metodoNome || '',
    metodoPosicao: posicaoString,
    metodoProgresso: progressoPercent,
    metodoEstagioApto: stageStatus,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Updates student method configuration (chosen method, aptitude checkpoints, instructor general notes).
 */
export async function updateStudentMethodProgress(
  studentId: string,
  data: {
    instrumentoNome: string;
    metodoId: string;
    metodoNome: string;
    paginaAtual?: number;
    licaoAtual?: number;
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
    paginaAtual: data.paginaAtual,
    licaoAtual: data.licaoAtual,
    posicaoAtual: data.posicaoAtual.trim() || 'Página 1, Lição 1',
    progressoPercent: progressoNormalizado,
    estagiosAptos: data.estagiosAptos,
    observacoesInstrutor: (data.observacoesInstrutor || '').trim(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, updatedDoc, { merge: true });

  const userRef = doc(db, 'users', studentId);
  await updateDoc(userRef, {
    metodoNome: data.metodoNome,
    metodoPosicao: data.posicaoAtual.trim() || 'Página 1, Lição 1',
    metodoProgresso: progressoNormalizado,
    metodoEstagioApto: stageStatus,
    updatedAt: serverTimestamp(),
  });

  return updatedDoc;
}
