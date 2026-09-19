import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Music,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Loader2,
  Edit2,
  Save,
  Plus,
  Trash2,
  Sliders,
} from 'lucide-react';
import {
  getStudentById,
  getStudentProgressMap,
  updateHymnProgress,
  updateStudentProfile,
} from '../../services/studentService';

import {
  listMsaPhases,
  listAllMsaLessons,
  getStudentMsaOverview,
  updateStudentLessonProgress,
} from '../../services/msaService';
import { HINOS_DATA } from '../../data/hinosData';
import { calcularTonalidadeInstrumento } from '../../data/instrumentsData';
import { resolveInstrumento, INSTRUMENTOS_CATEGORIZADOS } from '../../utils/instrumentUtils';
import {
  getStudentMethodProgress,
  updateStudentMethodProgress,
  calculateMethodStage,
  listStudentMethodLessons,
  saveStudentMethodLesson,
  deleteStudentMethodLesson,
} from '../../services/metodoService';
import { getMetodosConfigForInstrumento } from '../../data/metodosInstrumentosData';
import type {
  AlunoMetodoProgressoDoc,
  MetodoLicaoDoc,
  MetodoLicaoStatus,
} from '../../types/metodo';
import type { UsuarioDoc, HinoProgressoDoc, StatusProgresso } from '../../types/auth';

import type {
  MsaPhaseDoc,
  MsaLessonDoc,
  MsaStudentLessonProgress,
  MsaStudentOverallProgress,
  MsaLessonStatus,
} from '../../types/msa';

export const AlunoDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'hinos' | 'msa' | 'metodo'
  const [activeTab, setActiveTab] = useState<'hinos' | 'msa' | 'metodo'>(() => {
    const t = searchParams.get('tab');
    if (t === 'msa') return 'msa';
    if (t === 'metodo') return 'metodo';
    return 'hinos';
  });

  const [student, setStudent] = useState<UsuarioDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // Hymns Progress
  const [progressMap, setProgressMap] = useState<Record<number, HinoProgressoDoc>>({});
  const [updatingHino, setUpdatingHino] = useState<number | null>(null);
  const [buscaHinos, setBuscaHinos] = useState('');
  const [filtroStatusHinos, setFiltroStatusHinos] = useState<string>('todos');

  // MSA State
  const [msaPhases, setMsaPhases] = useState<MsaPhaseDoc[]>([]);
  const [msaLessonsByPhase, setMsaLessonsByPhase] = useState<Record<string, MsaLessonDoc[]>>({});
  const [msaProgressMap, setMsaProgressMap] = useState<Record<string, MsaStudentLessonProgress>>({});
  const [msaOverall, setMsaOverall] = useState<MsaStudentOverallProgress | null>(null);
  const [expandedMsaPhaseId, setExpandedMsaPhaseId] = useState<string | null>(null);
  const [updatingLessonId, setUpdatingLessonId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  // Instrument Method State
  const [, setMethodDoc] = useState<AlunoMetodoProgressoDoc | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [posicaoMetodo, setPosicaoMetodo] = useState('Página 1, Lição 1');
  const [progressoMetodo, setProgressoMetodo] = useState(0);
  const [estagiosAptos, setEstagiosAptos] = useState({ rjm: false, culto: false, oficializacao: false });
  const [observacoesMetodo, setObservacoesMetodo] = useState('');
  const [savingMetodo, setSavingMetodo] = useState(false);
  const [feedbackMetodo, setFeedbackMetodo] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Method Lessons (Página + Lição) State
  const [metodoLessons, setMetodoLessons] = useState<MetodoLicaoDoc[]>([]);
  const [novaPagina, setNovaPagina] = useState<number | string>(1);
  const [novaLicao, setNovaLicao] = useState<number | string>(1);
  const [novoTituloLicao, setNovoTituloLicao] = useState('');
  const [novoStatusLicao, setNovoStatusLicao] = useState<MetodoLicaoStatus>('Concluído');
  const [novoProgressoLicao, setNovoProgressoLicao] = useState<number>(100);
  const [adicionandoLicao, setAdicionandoLicao] = useState(false);

  const [editingMethodLessonNotes, setEditingMethodLessonNotes] = useState<Record<string, string>>({});
  const [updatingMethodLessonId, setUpdatingMethodLessonId] = useState<string | null>(null);
  const [filtroStatusMetodoLicoes, setFiltroStatusMetodoLicoes] = useState<string>('todos');

  // Edit instrument mode for teacher
  const [isEditingInstrument, setIsEditingInstrument] = useState(false);
  const [selectedInstOption, setSelectedInstOption] = useState('');
  const [savingInstrument, setSavingInstrument] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const studentData = await getStudentById(id);
        setStudent(studentData);
        if (studentData) {
          setSelectedInstOption(studentData.instrument);

          // Load Hymns Progress
          const map = await getStudentProgressMap(id);
          setProgressMap(map);

          // Load Instrument Method Progress & Lessons
          const methodProgressData = await getStudentMethodProgress(id);
          const configInst = getMetodosConfigForInstrumento(studentData.instrument);
          const defaultMetodo = configInst.metodos[0];

          if (methodProgressData) {
            setMethodDoc(methodProgressData);
            setSelectedMethodId(methodProgressData.metodoId || defaultMetodo.id);
            setPosicaoMetodo(methodProgressData.posicaoAtual || 'Página 1, Lição 1');
            setProgressoMetodo(methodProgressData.progressoPercent || 0);
            setEstagiosAptos(methodProgressData.estagiosAptos || { rjm: false, culto: false, oficializacao: false });
            setObservacoesMetodo(methodProgressData.observacoesInstrutor || '');
          } else {
            setSelectedMethodId(defaultMetodo.id);
            setPosicaoMetodo('Página 1, Lição 1');
            setProgressoMetodo(0);
            setEstagiosAptos({ rjm: false, culto: false, oficializacao: false });
            setObservacoesMetodo('');
          }

          const lessons = await listStudentMethodLessons(id);
          setMetodoLessons(lessons);

          // If there are lessons, prepare next lesson input
          if (lessons.length > 0) {
            const last = lessons[lessons.length - 1];
            setNovaPagina(last.numeroPagina);
            setNovaLicao(last.numeroLicao + 1);
          }

          // Load MSA Structure & Student Progress
          const phasesData = await listMsaPhases(false);
          setMsaPhases(phasesData);

          const lessonsMap = await listAllMsaLessons(phasesData);
          setMsaLessonsByPhase(lessonsMap);

          const msaData = await getStudentMsaOverview(id, phasesData, lessonsMap);
          setMsaProgressMap(msaData.progressMap);
          setMsaOverall(msaData.overall);

          if (msaData.overall.currentPhaseId) {
            setExpandedMsaPhaseId(msaData.overall.currentPhaseId);
          } else if (phasesData.length > 0) {
            setExpandedMsaPhaseId(phasesData[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  // Save Instrument Method General Settings & Aptitude
  const handleSaveMethod = async () => {
    if (!student || !selectedMethodId) return;
    setSavingMetodo(true);
    setFeedbackMetodo(null);

    const configInst = getMetodosConfigForInstrumento(student.instrument);
    const chosenMethod = configInst.metodos.find((m) => m.id === selectedMethodId) || configInst.metodos[0];

    try {
      const updated = await updateStudentMethodProgress(student.uid, {
        instrumentoNome: configInst.instrumentoNome,
        metodoId: chosenMethod.id,
        metodoNome: chosenMethod.nome,
        posicaoAtual: posicaoMetodo,
        progressoPercent: progressoMetodo,
        estagiosAptos,
        observacoesInstrutor: observacoesMetodo,
      });

      setMethodDoc(updated);
      const stageApto = calculateMethodStage(estagiosAptos);

      setStudent((prev) =>
        prev
          ? {
              ...prev,
              metodoNome: chosenMethod.nome,
              metodoPosicao: posicaoMetodo,
              metodoProgresso: progressoMetodo,
              metodoEstagioApto: stageApto,
            }
          : null
      );

      setFeedbackMetodo({ type: 'success', text: 'Configuração e marcos do método salvos com sucesso!' });
      setTimeout(() => setFeedbackMetodo(null), 3500);
    } catch (err: any) {
      console.error(err);
      setFeedbackMetodo({ type: 'error', text: 'Erro ao salvar método: ' + (err?.message || 'Erro') });
    } finally {
      setSavingMetodo(false);
    }
  };

  // Add / Register new lesson (Página + Lição)
  const handleAddMethodLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    const pag = Math.max(1, Number(novaPagina) || 1);
    const lic = Math.max(1, Number(novaLicao) || 1);

    const configInst = getMetodosConfigForInstrumento(student.instrument);
    const chosenMethod = configInst.metodos.find((m) => m.id === selectedMethodId) || configInst.metodos[0];

    setAdicionandoLicao(true);
    try {
      await saveStudentMethodLesson(student.uid, {
        metodoId: chosenMethod.id,
        metodoNome: chosenMethod.nome,
        numeroPagina: pag,
        numeroLicao: lic,
        titulo: novoTituloLicao,
        status: novoStatusLicao,
        progress: novoProgressoLicao,
      });

      const updatedList = await listStudentMethodLessons(student.uid);
      setMetodoLessons(updatedList);

      const updatedSummary = await getStudentMethodProgress(student.uid);
      if (updatedSummary) {
        setPosicaoMetodo(updatedSummary.posicaoAtual);
        setProgressoMetodo(updatedSummary.progressoPercent);
        setStudent((prev) =>
          prev
            ? {
                ...prev,
                metodoPosicao: updatedSummary.posicaoAtual,
                metodoProgresso: updatedSummary.progressoPercent,
              }
            : null
        );
      }

      setNovoTituloLicao('');
      setNovaLicao(lic + 1);
      setFeedbackMetodo({
        type: 'success',
        text: `Lição da Página ${pag} • Lição ${lic} registrada com sucesso!`,
      });
      setTimeout(() => setFeedbackMetodo(null), 3500);
    } catch (err: any) {
      console.error(err);
      setFeedbackMetodo({ type: 'error', text: 'Erro ao salvar lição: ' + (err?.message || 'Erro') });
    } finally {
      setAdicionandoLicao(false);
    }
  };

  // Update existing lesson (status, progress, notes)
  const handleUpdateMethodLesson = async (
    lesson: MetodoLicaoDoc,
    nextStatus: MetodoLicaoStatus,
    nextProgress: number,
    notes?: string
  ) => {
    if (!student) return;
    setUpdatingMethodLessonId(lesson.id);
    try {
      await saveStudentMethodLesson(student.uid, {
        id: lesson.id,
        metodoId: lesson.metodoId,
        metodoNome: lesson.metodoNome,
        numeroPagina: lesson.numeroPagina,
        numeroLicao: lesson.numeroLicao,
        titulo: lesson.titulo,
        status: nextStatus,
        progress: nextProgress,
        teacherNotes: notes !== undefined ? notes : lesson.teacherNotes,
      });

      const updatedList = await listStudentMethodLessons(student.uid);
      setMetodoLessons(updatedList);

      const updatedSummary = await getStudentMethodProgress(student.uid);
      if (updatedSummary) {
        setPosicaoMetodo(updatedSummary.posicaoAtual);
        setProgressoMetodo(updatedSummary.progressoPercent);
        setStudent((prev) =>
          prev
            ? {
                ...prev,
                metodoPosicao: updatedSummary.posicaoAtual,
                metodoProgresso: updatedSummary.progressoPercent,
              }
            : null
        );
      }
    } catch (err: any) {
      console.error('Erro ao atualizar lição:', err);
    } finally {
      setUpdatingMethodLessonId(null);
    }
  };

  // Delete a lesson
  const handleDeleteMethodLesson = async (lesson: MetodoLicaoDoc) => {
    if (!student) return;
    if (!window.confirm(`Deseja remover o registro da Página ${lesson.numeroPagina}, Lição ${lesson.numeroLicao}?`)) {
      return;
    }

    try {
      await deleteStudentMethodLesson(student.uid, lesson.id, lesson.metodoId, lesson.metodoNome);
      const updatedList = await listStudentMethodLessons(student.uid);
      setMetodoLessons(updatedList);

      const updatedSummary = await getStudentMethodProgress(student.uid);
      if (updatedSummary) {
        setPosicaoMetodo(updatedSummary.posicaoAtual);
        setProgressoMetodo(updatedSummary.progressoPercent);
      }
    } catch (err: any) {
      console.error('Erro ao excluir lição:', err);
    }
  };

  const handleTabChange = (tab: 'hinos' | 'msa' | 'metodo') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Resolves instrument
  const instrumentoObj = useMemo(() => {
    return resolveInstrumento(student?.instrument);
  }, [student?.instrument]);

  const handleSaveInstrument = async () => {
    if (!student || !selectedInstOption) return;
    setSavingInstrument(true);
    try {
      await updateStudentProfile(student.uid, {
        name: student.name,
        phone: student.phone || '',
        instrument: selectedInstOption,
      });
      setStudent((prev) => (prev ? { ...prev, instrument: selectedInstOption } : null));
      setIsEditingInstrument(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingInstrument(false);
    }
  };

  // Update Hymn Progress
  const handleUpdateHymnStatus = async (
    hinoId: number,
    hinoName: string,
    newStatus: StatusProgresso,
    newProgress: number
  ) => {
    if (!student) return;
    setUpdatingHino(hinoId);
    try {
      const stats = await updateHymnProgress(
        student.uid,
        hinoId,
        hinoName,
        newStatus,
        newProgress,
        progressMap
      );

      setProgressMap((prev) => ({
        ...prev,
        [hinoId]: {
          hinoId,
          name: hinoName,
          status: newStatus,
          progress: newProgress,
          updatedAt: new Date().toISOString(),
        },
      }));

      setStudent((prev) =>
        prev
          ? {
              ...prev,
              hinosConcluidos: stats.hinosConcluidos,
              hinosEmProgresso: stats.hinosEmProgresso,
              progressoGeral: stats.progressoGeral,
            }
          : null
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingHino(null);
    }
  };

  // Update MSA Lesson Progress
  const handleUpdateLesson = async (
    phaseId: string,
    lessonId: string,
    newStatus: MsaLessonStatus,
    newProgress: number,
    notes?: string
  ) => {
    if (!student) return;
    setUpdatingLessonId(lessonId);
    try {
      const updatedOverall = await updateStudentLessonProgress(
        student.uid,
        lessonId,
        phaseId,
        {
          status: newStatus,
          progress: newProgress,
          teacherNotes: notes,
        },
        msaPhases,
        msaLessonsByPhase,
        msaProgressMap
      );

      setMsaProgressMap((prev) => ({
        ...prev,
        [lessonId]: {
          lessonId,
          phaseId,
          status: newStatus,
          progress: newProgress,
          teacherNotes: notes !== undefined ? notes : prev[lessonId]?.teacherNotes,
          updatedAt: new Date().toISOString(),
        },
      }));

      setMsaOverall(updatedOverall);

      setStudent((prev) =>
        prev
          ? {
              ...prev,
              msaCurrentPhaseId: updatedOverall.currentPhaseId,
              msaCurrentPhaseName: updatedOverall.currentPhaseName,
              msaCurrentPhaseOrder: updatedOverall.currentPhaseOrder,
              msaGeneralProgress: updatedOverall.generalProgress,
              msaLessonsCompleted: updatedOverall.totalCompletedLessons,
              msaTotalLessons: updatedOverall.totalLessons,
            }
          : null
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingLessonId(null);
    }
  };

  // Filtered Hymns
  const hinosFiltrados = useMemo(() => {
    return HINOS_DATA.filter((hino) => {
      const matchBusca =
        buscaHinos.trim() === '' ||
        hino.numero.toString().includes(buscaHinos.trim()) ||
        hino.titulo.toLowerCase().includes(buscaHinos.toLowerCase());

      if (!matchBusca) return false;

      const pDoc = progressMap[hino.numero];
      const status = pDoc?.status || 'Não iniciado';

      if (filtroStatusHinos === 'concluido') return status === 'Concluído';
      if (filtroStatusHinos === 'em_progresso') return status === 'Em progresso' || status === 'Em aprendizado';
      if (filtroStatusHinos === 'nao_iniciado') return status === 'Não iniciado';

      return true;
    });
  }, [buscaHinos, filtroStatusHinos, progressMap]);

  // Filtered Method Lessons
  const metodoLicoesFiltradas = useMemo(() => {
    return metodoLessons.filter((l) => {
      if (filtroStatusMetodoLicoes === 'concluidas') {
        return l.status === 'Concluído' || l.progress === 100;
      }
      if (filtroStatusMetodoLicoes === 'em_andamento') {
        return l.status === 'Em andamento' || (l.progress > 0 && l.progress < 100);
      }
      return true;
    });
  }, [metodoLessons, filtroStatusMetodoLicoes]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Carregando perfil pedagógico do aluno...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Aluno não encontrado</h2>
        <Link to="/admin/alunos" className="text-sm font-semibold text-indigo-600 hover:underline">
          Voltar para a lista de alunos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <Link
          to="/admin/alunos"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Lista de Alunos</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-sm">
              {student.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {student.name}
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold">
                  Ativo
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {student.email} {student.phone ? `• ${student.phone}` : ''}
              </p>
            </div>
          </div>

          {/* Instrument Selector / Badge */}
          <div className="flex items-center gap-2">
            {isEditingInstrument ? (
              <div className="flex items-center gap-2">
                <select
                  value={selectedInstOption}
                  onChange={(e) => setSelectedInstOption(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-indigo-400 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                >
                  {INSTRUMENTOS_CATEGORIZADOS.map((cat) => (
                    <optgroup key={cat.categoria} label={`── ${cat.categoria} ──`}>
                      {cat.itens.map((item) => (
                        <option key={item.id} value={item.nomeExibicao}>
                          {item.nomeExibicao}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button
                  onClick={handleSaveInstrument}
                  disabled={savingInstrument}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {savingInstrument ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Salvar</span>
                </button>
                <button
                  onClick={() => setIsEditingInstrument(false)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <Music className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      {instrumentoObj.nome}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {instrumentoObj.afinacao} &bull; {instrumentoObj.hinario}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedInstOption(student.instrument);
                    setIsEditingInstrument(true);
                  }}
                  title="Alterar instrumento oficial do aluno"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section Navigation Tabs (Hinário vs MSA vs Método) */}
        <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => handleTabChange('hinos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'hinos'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Hinário 5 ({student.hinosConcluidos || 0}/480 Concluídos)</span>
          </button>

          <button
            onClick={() => handleTabChange('msa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'msa'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Método MSA ({msaOverall?.generalProgress || student.msaGeneralProgress || 0}% Geral)</span>
          </button>

          <button
            onClick={() => handleTabChange('metodo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'metodo'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Método do Instrumento ({student.metodoEstagioApto || 'Iniciante'})</span>
          </button>
        </div>
      </div>

      {activeTab === 'metodo' ? (
        /* ==================================================================== */
        /* TAB MÉTODO: ACOMPANHAMENTO DO MÉTODO POR PÁGINA + LIÇÃO (CCB 2018)  */
        /* ==================================================================== */
        <div className="space-y-5">
          {/* Feedback Alert */}
          {feedbackMetodo && (
            <div
              className={`p-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn ${
                feedbackMetodo.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
              }`}
            >
              {feedbackMetodo.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedbackMetodo.text}</span>
            </div>
          )}

          {(() => {
            const configInst = getMetodosConfigForInstrumento(student.instrument);
            const currentMethod = configInst.metodos.find((m) => m.id === selectedMethodId) || configInst.metodos[0];
            const stageStatus = calculateMethodStage(estagiosAptos);

            return (
              <div className="space-y-5">
                {/* Method Overview Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] font-bold text-purple-700 dark:text-purple-400">
                          {configInst.familia} &bull; {instrumentoObj.nome} ({instrumentoObj.afinacao})
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        Avaliação do Método de Instrumento
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Defina o método em estudo, registre lições (Página + Lição) e valide os marcos da CCB 2018.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs border ${
                        stageStatus === 'Apto Oficialização'
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                          : stageStatus === 'Apto Culto Oficial'
                          ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200 border-blue-300 dark:border-blue-800'
                          : stageStatus === 'Apto RJM / Ensaio'
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        Estágio Atual: {stageStatus}
                      </span>
                    </div>
                  </div>

                  {/* Method Selection & Current Position Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Método Oficial em Estudo:
                      </label>
                      <select
                        value={selectedMethodId}
                        onChange={(e) => setSelectedMethodId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm font-bold text-slate-900 dark:text-white cursor-pointer shadow-2xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      >
                        {configInst.metodos.map((m) => (
                          <option key={m.id} value={m.id} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">
                            {m.nome} {m.subtitulo ? `(${m.subtitulo})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Posição Atual (Calculada das Lições):
                      </label>
                      <div className="w-full px-3.5 py-2 rounded-xl bg-purple-50/60 dark:bg-slate-800 border border-purple-200 dark:border-slate-700 flex items-center justify-between text-xs sm:text-sm font-bold text-purple-900 dark:text-purple-300">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span>{posicaoMetodo || 'Em início'}</span>
                        </span>
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {metodoLessons.filter(l => l.status === 'Concluído').length} de {metodoLessons.length} concluídas
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Checkpoints CCB 2018 */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Requisitos Mínimos CCB (Marcar quando apto):
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Checkpoint 1: RJM */}
                      <label className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                        estagiosAptos.rjm
                          ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span>🧒 RJM / Ensaio</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={estagiosAptos.rjm}
                              onChange={(e) => setEstagiosAptos((prev) => ({ ...prev, rjm: e.target.checked }))}
                              className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                            />
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                            {currentMethod.exigencias.rjm.descricao}
                          </p>
                        </div>
                        {configInst.observacoesGerais?.rjm && (
                          <span className="text-[10px] text-amber-700 dark:text-amber-300 mt-2 block">
                            Obs: {configInst.observacoesGerais.rjm}
                          </span>
                        )}
                      </label>

                      {/* Checkpoint 2: Culto Oficial */}
                      <label className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                        estagiosAptos.culto
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-black text-blue-800 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span>🏛️ Cultos Oficiais</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={estagiosAptos.culto}
                              onChange={(e) => setEstagiosAptos((prev) => ({ ...prev, culto: e.target.checked }))}
                              className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                            />
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                            {currentMethod.exigencias.culto.descricao}
                          </p>
                        </div>
                        {configInst.observacoesGerais?.culto && (
                          <span className="text-[10px] text-blue-700 dark:text-blue-300 mt-2 block">
                            Obs: {configInst.observacoesGerais.culto}
                          </span>
                        )}
                      </label>

                      {/* Checkpoint 3: Oficializacao */}
                      <label className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                        estagiosAptos.oficializacao
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                              <span>🎓 Oficialização</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={estagiosAptos.oficializacao}
                              onChange={(e) => setEstagiosAptos((prev) => ({ ...prev, oficializacao: e.target.checked }))}
                              className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                            />
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">
                            {currentMethod.exigencias.oficializacao.descricao}
                          </p>
                        </div>
                        {configInst.observacoesGerais?.oficializacao && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-2 block">
                            Obs: {configInst.observacoesGerais.oficializacao}
                          </span>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Teacher General Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Orientações Gerais do Instrutor (Visíveis no Painel do Aluno):
                    </label>
                    <textarea
                      rows={2}
                      value={observacoesMetodo}
                      onChange={(e) => setObservacoesMetodo(e.target.value)}
                      placeholder="Ex: Aluno está desenvolvendo boa postura e afinação. Recomendado focar nas lições de staccato..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-2xs"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={handleSaveMethod}
                      disabled={savingMetodo}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm transition-all shadow-2xs flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      {savingMetodo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Salvar Configuração e Marcos do Método</span>
                    </button>
                  </div>
                </div>

                {/* FORM: Registrar Nova Lição (Página + Lição) */}
                <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Registrar Evolução: Página + Lição
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Adicione a página e a lição avaliada do método {currentMethod.nome}.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddMethodLesson} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Página Nº:
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={novaPagina}
                        onChange={(e) => setNovaPagina(e.target.value)}
                        placeholder="Ex: 15"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm font-bold text-slate-900 dark:text-white shadow-2xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Lição Nº:
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={novaLicao}
                        onChange={(e) => setNovaLicao(e.target.value)}
                        placeholder="Ex: 3"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm font-bold text-slate-900 dark:text-white shadow-2xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="lg:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Status Inicial:
                      </label>
                      <select
                        value={novoStatusLicao}
                        onChange={(e) => {
                          const s = e.target.value as MetodoLicaoStatus;
                          setNovoStatusLicao(s);
                          setNovoProgressoLicao(s === 'Concluído' ? 100 : s === 'Não iniciado' ? 0 : 50);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm font-bold text-slate-900 dark:text-white shadow-2xs focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
                      >
                        <option value="Concluído">🟢 Concluído</option>
                        <option value="Em andamento">🟡 Em andamento</option>
                        <option value="Não iniciado">⚪ Não iniciado</option>
                      </select>
                    </div>

                    <div className="lg:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Título / Foco (Opcional):
                      </label>
                      <input
                        type="text"
                        value={novoTituloLicao}
                        onChange={(e) => setNovoTituloLicao(e.target.value)}
                        placeholder="Ex: Escala de Ré / Tercinas"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm text-slate-900 dark:text-white shadow-2xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={adicionandoLicao}
                        className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        {adicionandoLicao ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        <span>Adicionar Lição</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* GRADE DE LIÇÕES DO MÉTODO (SEMEHLANTE AO MSA) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
                  {/* Sub-header & Filters */}
                  <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-purple-600" />
                        <span>Lições Avaliadas no Método ({metodoLessons.length})</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Acompanhe o domínio de cada lição, com notas e parecer individual.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                      <button
                        onClick={() => setFiltroStatusMetodoLicoes('todos')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          filtroStatusMetodoLicoes === 'todos'
                            ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 font-bold shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Todas ({metodoLessons.length})
                      </button>
                      <button
                        onClick={() => setFiltroStatusMetodoLicoes('concluidas')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          filtroStatusMetodoLicoes === 'concluidas'
                            ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Concluídas ({metodoLessons.filter(l => l.status === 'Concluído' || l.progress === 100).length})
                      </button>
                      <button
                        onClick={() => setFiltroStatusMetodoLicoes('em_andamento')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          filtroStatusMetodoLicoes === 'em_andamento'
                            ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 font-bold shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Em andamento ({metodoLessons.filter(l => l.status === 'Em andamento' || (l.progress > 0 && l.progress < 100)).length})
                      </button>
                    </div>
                  </div>

                  {/* Lessons List */}
                  {metodoLicoesFiltradas.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 p-6 space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-300">Nenhuma lição encontrada para o filtro selecionado.</p>
                      <p>Utilize o formulário acima para registrar a primeira página e lição avaliada.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 p-4 sm:p-5 space-y-3">
                      {metodoLicoesFiltradas.map((lesson) => {
                        const isUpdating = updatingMethodLessonId === lesson.id;
                        const status = lesson.status || 'Não iniciado';
                        const progress = lesson.progress || 0;
                        const notes =
                          editingMethodLessonNotes[lesson.id] !== undefined
                            ? editingMethodLessonNotes[lesson.id]
                            : (lesson.teacherNotes || '');

                        return (
                          <div
                            key={lesson.id}
                            className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-4.5 space-y-3 transition-colors hover:border-purple-300 dark:hover:border-purple-800"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Page and Lesson Header */}
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                    Página {lesson.numeroPagina} &bull; Lição {lesson.numeroLicao}
                                  </span>

                                  {lesson.titulo && (
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                      {lesson.titulo}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Interactive Controls (Status + Progress slider + Delete) */}
                              <div className="flex items-center gap-2.5 self-end sm:self-center">
                                <select
                                  value={status}
                                  disabled={isUpdating}
                                  onChange={(e) => {
                                    const nextStat = e.target.value as MetodoLicaoStatus;
                                    const nextProg = nextStat === 'Concluído' ? 100 : nextStat === 'Não iniciado' ? 0 : 50;
                                    handleUpdateMethodLesson(lesson, nextStat, nextProg, notes);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all shadow-2xs focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                                    status === 'Concluído'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700'
                                      : status === 'Em andamento'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700'
                                      : 'bg-white text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-600'
                                  }`}
                                >
                                  <option value="Não iniciado">⚪ Não iniciado</option>
                                  <option value="Em andamento">🟡 Em andamento</option>
                                  <option value="Concluído">🟢 Concluído</option>
                                </select>

                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="10"
                                    value={progress}
                                    disabled={isUpdating}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const nextStat: MetodoLicaoStatus = val === 100 ? 'Concluído' : val === 0 ? 'Não iniciado' : 'Em andamento';
                                      handleUpdateMethodLesson(lesson, nextStat, val, notes);
                                    }}
                                    className="w-20 sm:w-24 accent-purple-600 cursor-pointer"
                                  />
                                  <span className="font-mono text-xs font-black w-9 text-right text-purple-700 dark:text-purple-300">
                                    {progress}%
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleDeleteMethodLesson(lesson)}
                                  title="Remover esta lição"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Teacher Notes per Lesson */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                Observação da Lição:
                              </span>
                              <input
                                type="text"
                                value={notes}
                                placeholder="Ex: Ótima postura, atenção ao metrônomo no compasso 8..."
                                onChange={(e) => {
                                  setEditingMethodLessonNotes((prev) => ({
                                    ...prev,
                                    [lesson.id]: e.target.value,
                                  }));
                                }}
                                className="flex-1 w-full px-3 py-1.5 rounded-lg bg-slate-50 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-750 border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
                              />
                              <button
                                onClick={() => handleUpdateMethodLesson(lesson, status, progress, notes)}
                                disabled={isUpdating}
                                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs flex items-center gap-1.5 active:scale-95"
                              >
                                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Salvar Nota'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      ) : activeTab === 'msa' ? (
        /* ==================================================================== */
        /* TAB MSA: ACOMPANHAMENTO INDIVIDUAL DAS FASES & LIÇÕES                */
        /* ==================================================================== */
        <div className="space-y-5">
          {/* MSA Current Phase & Overall KPI Banner */}
          <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl p-5 shadow-2xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Fase Atual do Aluno
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {msaOverall?.currentPhaseName || 'Fase 1 — Fundamentos da Música'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Progresso Geral no Método: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{msaOverall?.generalProgress || 0}%</strong> &bull; {msaOverall?.totalCompletedLessons || 0} de {msaOverall?.totalLessons || 0} lições concluídas
                </p>
              </div>

              <div className="w-full md:w-64">
                <div className="flex justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Conclusão do MSA</span>
                  <span>{msaOverall?.generalProgress || 0}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-300 dark:border-slate-700">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${msaOverall?.generalProgress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Phases & Lessons Accordion List */}
          <div className="space-y-3">
            {msaPhases.map((phase) => {
              const summary = msaOverall?.phaseSummaries[phase.id];
              const isCurrentPhase = msaOverall?.currentPhaseId === phase.id;
              const isExpanded = expandedMsaPhaseId === phase.id;
              const lessons = msaLessonsByPhase[phase.id] || [];
              const progressPercent = summary?.progressPercent || 0;
              const isDone = summary?.isCompleted;

              return (
                <div
                  key={phase.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-150 shadow-2xs ${
                    isCurrentPhase
                      ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-400/20'
                      : isDone
                      ? 'border-emerald-200 dark:border-emerald-800/80'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Phase Row */}
                  <div
                    onClick={() => setExpandedMsaPhaseId(isExpanded ? null : phase.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-850/60 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <button className="p-1 text-slate-400 mt-0.5 sm:mt-0">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
                            Fase {phase.order}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {phase.name}
                          </h3>

                          {isCurrentPhase && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600 text-white shadow-2xs">
                              Fase Atual
                            </span>
                          )}

                          {isDone && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Concluída
                            </span>
                          )}
                        </div>

                        {phase.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {phase.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 block">
                          {summary?.completedLessons || 0} / {summary?.totalLessons || lessons.length} lições ({progressPercent}%)
                        </span>
                        <div className="w-28 sm:w-36 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700 mt-1">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isDone ? 'bg-emerald-600' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Lessons List */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 space-y-3">
                      {lessons.length > 0 ? (
                        lessons.map((lesson) => {
                          const pDoc = msaProgressMap[lesson.id];
                          const status = pDoc?.status || 'Não iniciado';
                          const progress = pDoc?.progress || 0;
                          const notes =
                            editingNotes[lesson.id] !== undefined
                              ? editingNotes[lesson.id]
                              : (pDoc?.teacherNotes || '');
                          const isUpdating = updatingLessonId === lesson.id;

                          return (
                            <div
                              key={lesson.id}
                              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-3 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-slate-400">
                                      #{lesson.order}
                                    </span>
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                                      {lesson.name}
                                    </h4>
                                    {lesson.type && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                        {lesson.type}
                                      </span>
                                    )}
                                  </div>
                                  {lesson.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>

                                {/* Status & Progress Controls */}
                                <div className="flex items-center gap-2.5 self-end sm:self-center">
                                  <select
                                    value={status}
                                    disabled={isUpdating}
                                    onChange={(e) => {
                                      const nextStat = e.target.value as MsaLessonStatus;
                                      const nextProg = nextStat === 'Concluído' ? 100 : nextStat === 'Não iniciado' ? 0 : 50;
                                      handleUpdateLesson(phase.id, lesson.id, nextStat, nextProg, notes);
                                    }}
                                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                                      status === 'Concluído'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700'
                                        : status === 'Em andamento'
                                        ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700'
                                        : 'bg-white text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-600'
                                    }`}
                                  >
                                    <option value="Não iniciado">⚪ Não iniciado</option>
                                    <option value="Em andamento">🟡 Em andamento</option>
                                    <option value="Concluído">🟢 Concluído</option>
                                  </select>

                                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      step="10"
                                      value={progress}
                                      disabled={isUpdating}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const nextStat: MsaLessonStatus = val === 100 ? 'Concluído' : val === 0 ? 'Não iniciado' : 'Em andamento';
                                        handleUpdateLesson(phase.id, lesson.id, nextStat, val, notes);
                                      }}
                                      className="w-20 sm:w-24 accent-indigo-600 cursor-pointer"
                                    />
                                    <span className="font-mono text-xs font-black w-9 text-right text-indigo-700 dark:text-indigo-300">
                                      {progress}%
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Teacher Notes / Observações do Professor */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                  Observação do Professor:
                                </span>
                                <input
                                  type="text"
                                  value={notes}
                                  placeholder="Ex: Aluno executou com postura correta e pulsação firme..."
                                  onChange={(e) => {
                                    setEditingNotes((prev) => ({
                                      ...prev,
                                      [lesson.id]: e.target.value,
                                    }));
                                  }}
                                  className="flex-1 w-full px-3 py-1.5 rounded-lg bg-slate-50 focus:bg-white dark:bg-slate-800 dark:focus:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                                />
                                <button
                                  onClick={() => handleUpdateLesson(phase.id, lesson.id, status, progress, notes)}
                                  disabled={isUpdating}
                                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs flex items-center gap-1.5 active:scale-95"
                                >
                                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Salvar Nota'}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-400 py-3 text-center">Nenhuma lição nesta fase.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ==================================================================== */
        /* TAB HINOS: GERENCIADOR DOS 480 HINOS DO HINÁRIO 5                    */
        /* ==================================================================== */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
          {/* Table Filters */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por número ou título do hino..."
                value={buscaHinos}
                onChange={(e) => setBuscaHinos(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filtroStatusHinos}
                onChange={(e) => setFiltroStatusHinos(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
              >
                <option value="todos">Todos os status</option>
                <option value="concluido">Concluídos</option>
                <option value="em_progresso">Em progresso</option>
                <option value="nao_iniciado">Não iniciados</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 sm:px-6 w-20">Nº</th>
                  <th className="py-3 px-4">Título do Hino</th>
                  <th className="py-3 px-4">Tom ({instrumentoObj.nome})</th>
                  <th className="py-3 px-4">Dificuldade</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Progresso</th>
                  <th className="py-3 px-4 text-right">Ação Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {hinosFiltrados.slice(0, 100).map((hino) => {
                  const progDoc = progressMap[hino.numero];
                  const status = progDoc?.status || 'Não iniciado';
                  const progress = progDoc?.progress || 0;
                  const isUpdating = updatingHino === hino.numero;
                  const trans = calcularTonalidadeInstrumento(hino.acidentes, instrumentoObj);

                  return (
                    <tr key={hino.numero} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4 sm:px-6 font-mono font-black text-indigo-700 dark:text-indigo-400">
                        {hino.numeroExibicao || hino.numero}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {hino.titulo}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{trans.tonalidade}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({trans.armadura === '0' ? '0♮' : trans.armadura})</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          hino.dificuldadeInteiro === 'Fácil' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                          hino.dificuldadeInteiro === 'Médio' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' :
                          'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {hino.dificuldadeInteiro}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={status}
                          disabled={isUpdating}
                          onChange={(e) => {
                            const nextStat = e.target.value as StatusProgresso;
                            const nextProg = nextStat === 'Concluído' ? 100 : nextStat === 'Não iniciado' ? 0 : 50;
                            handleUpdateHymnStatus(hino.numero, hino.titulo, nextStat, nextProg);
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                            status === 'Concluído'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700'
                              : status === 'Em progresso' || status === 'Em aprendizado'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700'
                              : 'bg-white text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-600'
                          }`}
                        >
                          <option value="Não iniciado" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">⚪ Não iniciado</option>
                          <option value="Em aprendizado" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">🟡 Em aprendizado</option>
                          <option value="Em progresso" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">🟡 Em progresso</option>
                          <option value="Concluído" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">🟢 Concluído</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={progress}
                            disabled={isUpdating}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const nextStat: StatusProgresso = val === 100 ? 'Concluído' : val === 0 ? 'Não iniciado' : 'Em progresso';
                              handleUpdateHymnStatus(hino.numero, hino.titulo, nextStat, val);
                            }}
                            className="w-20 accent-indigo-600 cursor-pointer"
                          />
                          <span className="font-mono text-[11px] font-bold w-9 text-right text-slate-700 dark:text-slate-300">
                            {progress}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            const isDone = status === 'Concluído';
                            handleUpdateHymnStatus(
                              hino.numero,
                              hino.titulo,
                              isDone ? 'Não iniciado' : 'Concluído',
                              isDone ? 0 : 100
                            );
                          }}
                          disabled={isUpdating}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            status === 'Concluído'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-rose-100 hover:text-rose-700'
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white'
                          }`}
                        >
                          {status === 'Concluído' ? 'Desmarcar' : 'Concluir'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
