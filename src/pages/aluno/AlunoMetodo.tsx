import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Music,
  CheckCircle2,
  Clock,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Loader2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getStudentMethodProgress,
  listStudentMethodLessons,
} from '../../services/metodoService';
import { getMetodosConfigForInstrumento } from '../../data/metodosInstrumentosData';
import { resolveInstrumento } from '../../utils/instrumentUtils';
import type {
  AlunoMetodoProgressoDoc,
  MetodoOpcaoDef,
  MetodoLicaoDoc,
} from '../../types/metodo';

export const AlunoMetodo: React.FC = () => {
  const { userData, currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [progresso, setProgresso] = useState<AlunoMetodoProgressoDoc | null>(null);
  const [metodoLessons, setMetodoLessons] = useState<MetodoLicaoDoc[]>([]);
  const [activeMetodoTab, setActiveMetodoTab] = useState<string>('');

  const inst = useMemo(() => {
    return resolveInstrumento(userData?.instrument);
  }, [userData?.instrument]);

  const metodosConfig = useMemo(() => {
    return getMetodosConfigForInstrumento(userData?.instrument);
  }, [userData?.instrument]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchMetodo = async () => {
      setLoading(true);
      try {
        const [progressData, lessonsData] = await Promise.all([
          getStudentMethodProgress(currentUser.uid),
          listStudentMethodLessons(currentUser.uid),
        ]);

        setProgresso(progressData);
        setMetodoLessons(lessonsData);

        if (progressData?.metodoId) {
          setActiveMetodoTab(progressData.metodoId);
        } else if (metodosConfig.metodos.length > 0) {
          setActiveMetodoTab(metodosConfig.metodos[0].id);
        }
      } catch (err) {
        console.error('Erro ao buscar progresso de método:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetodo();
  }, [currentUser, metodosConfig]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Carregando plano de método do seu instrumento...</p>
      </div>
    );
  }

  // Selected method in view
  const currentOrSelectedMethod: MetodoOpcaoDef | undefined =
    metodosConfig.metodos.find((m) => m.id === (progresso?.metodoId || activeMetodoTab)) ||
    metodosConfig.metodos[0];

  const aptoRjm = !!progresso?.estagiosAptos?.rjm;
  const aptoCulto = !!progresso?.estagiosAptos?.culto;
  const aptoOficializacao = !!progresso?.estagiosAptos?.oficializacao;

  const getStageBadge = () => {
    if (aptoOficializacao) {
      return {
        label: 'Apto Oficialização',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
      };
    }
    if (aptoCulto) {
      return {
        label: 'Apto Culto Oficial',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      };
    }
    if (aptoRjm) {
      return {
        label: 'Apto RJM / Ensaio',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700',
      };
    }
    return {
      label: 'Iniciante',
      color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    };
  };

  const badge = getStageBadge();

  // Posicao Atual (Página X, Lição Y)
  const posicaoAtualCalculada =
    progresso?.posicaoAtual ||
    (metodoLessons.length > 0
      ? `Página ${metodoLessons[metodoLessons.length - 1].numeroPagina}, Lição ${metodoLessons[metodoLessons.length - 1].numeroLicao}`
      : 'Página 1, Lição 1');

  const licoesConcluidas = metodoLessons.filter(
    (l) => l.status === 'Concluído' || l.progress === 100
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                Método de Instrumento &bull; CCB Jan/2018
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {inst.nome} ({inst.afinacao})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Plano de Estudos do Instrumento
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Consulte seu progresso página por página e lição por lição, com as notas e parecer do seu professor.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            <Link
              to="/aluno/msa"
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Ver Meu MSA</span>
            </Link>
            <Link
              to="/aluno/progresso"
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Meus Hinos</span>
            </Link>
          </div>
        </div>

        {/* Current Student Progress Highlight */}
        {progresso ? (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-slate-50 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Método em Andamento
                </span>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {progresso.metodoNome}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  Posição Atual: <strong className="font-bold text-purple-600 dark:text-purple-400">{posicaoAtualCalculada}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Lições Concluídas: <strong className="font-bold text-slate-900 dark:text-white font-mono">{licoesConcluidas} de {metodoLessons.length}</strong>
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Atualizado em: {progresso.updatedAt?.toDate ? progresso.updatedAt.toDate().toLocaleDateString('pt-BR') : 'Recentemente'}
                </span>
              </div>
            </div>

            <div className="w-full md:w-64">
              <div className="flex justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Progresso Estimado</span>
                <span className="text-purple-600 dark:text-purple-400">{progresso.progressoPercent || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-300 dark:border-slate-700">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progresso.progressoPercent || 0}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">Nenhum método registrado pelo instrutor ainda</p>
              <p>
                Quando o seu professor avaliar e registrar sua lição atual no sistema, o seu progresso e notas pedagógicas aparecerão aqui.
                Abaixo você já pode consultar os métodos oficiais e as metas de lições do seu instrumento!
              </p>
            </div>
          </div>
        )}

        {/* Teacher Notes box (if present) */}
        {progresso?.observacoesInstrutor && (
          <div className="mt-3.5 p-3.5 sm:p-4 rounded-xl bg-purple-50/60 dark:bg-slate-850 border border-purple-200 dark:border-purple-800 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 dark:text-purple-300 mb-1">
              <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Orientações Gerais do Instrutor:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              "{progresso.observacoesInstrutor}"
            </p>
          </div>
        )}
      </div>

      {/* Official Stages Roadmap (CCB Jan/2018) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <span>Marcos de Aptidão para o Culto (CCB Jan/2018)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Metas de lições e hinário exigidas para cada etapa no seu instrumento:
            </p>
          </div>

          {/* Quick Method Selector if multiple options */}
          {metodosConfig.metodos.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold overflow-x-auto">
              {metodosConfig.metodos.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMetodoTab(m.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    (progresso?.metodoId || activeMetodoTab) === m.id
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {m.nome}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3 Milestone Cards */}
        {currentOrSelectedMethod && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. RJM / Ensaio */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                aptoRjm
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/70 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xl">🧒</span>
                  {aptoRjm ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Apto
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <Clock className="w-3 h-3" />
                      Em estudo
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. Reunião de Jovens / Ensaio
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Primeiro ingresso na orquestra
                </p>

                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-750 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Exigência no Método ({currentOrSelectedMethod.nome}):
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {currentOrSelectedMethod.exigencias.rjm.descricao}
                    </p>
                  </div>

                  {currentOrSelectedMethod.exigencias.rjm.observacao && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {currentOrSelectedMethod.exigencias.rjm.observacao}
                    </p>
                  )}

                  {metodosConfig.observacoesGerais?.rjm && (
                    <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-400 block">Hinário:</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {metodosConfig.observacoesGerais.rjm}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Culto Oficial */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                aptoCulto
                  ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/70 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xl">🏛️</span>
                  {aptoCulto ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Apto
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <Clock className="w-3 h-3" />
                      Pendente
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  2. Cultos Oficiais (Noite)
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Apto para tocar nos cultos de semana e domingo
                </p>

                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-750 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Exigência no Método ({currentOrSelectedMethod.nome}):
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {currentOrSelectedMethod.exigencias.culto.descricao}
                    </p>
                  </div>

                  {currentOrSelectedMethod.exigencias.culto.observacao && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {currentOrSelectedMethod.exigencias.culto.observacao}
                    </p>
                  )}

                  {metodosConfig.observacoesGerais?.culto && (
                    <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-400 block">Hinário:</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {metodosConfig.observacoesGerais.culto}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Oficialização */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                aptoOficializacao
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/70 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xl">🎓</span>
                  {aptoOficializacao ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Apto
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <Clock className="w-3 h-3" />
                      Pendente
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  3. Exame de Oficialização
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Oficializado na Congregação Cristã no Brasil
                </p>

                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-750 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Exigência no Método ({currentOrSelectedMethod.nome}):
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {currentOrSelectedMethod.exigencias.oficializacao.descricao}
                    </p>
                  </div>

                  {currentOrSelectedMethod.exigencias.oficializacao.observacao && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {currentOrSelectedMethod.exigencias.oficializacao.observacao}
                    </p>
                  )}

                  {metodosConfig.observacoesGerais?.oficializacao && (
                    <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-400 block">Hinário:</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {metodosConfig.observacoesGerais.oficializacao}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MINHAS LIÇÕES AVALIADAS NO MÉTODO (PÁGINA + LIÇÃO) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Minhas Lições do Método ({metodoLessons.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Histórico de lições com status, notas e parecer pedagógico registrado pelo seu professor.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {licoesConcluidas} Concluídas
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {metodoLessons.length - licoesConcluidas} Em andamento
            </span>
          </div>
        </div>

        {metodoLessons.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Nenhuma lição avaliada registrada ainda.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Assim que o seu instrutor avaliar e salvar o seu progresso na primeira página e lição, ela aparecerá aqui com as orientações de estudo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {metodoLessons.map((lesson) => {
              const isDone = lesson.status === 'Concluído' || lesson.progress === 100;
              const isInProgress = lesson.status === 'Em andamento' || (lesson.progress > 0 && lesson.progress < 100);

              return (
                <div
                  key={lesson.id}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 shadow-2xs ${
                    isDone
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : isInProgress
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Pág. {lesson.numeroPagina} &bull; Lição {lesson.numeroLicao}
                      </span>
                      {lesson.titulo && (
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {lesson.titulo}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                          : isInProgress
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300'
                      }`}
                    >
                      {lesson.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1">
                      <span>Domínio da Lição</span>
                      <span>{lesson.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-slate-700">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isDone ? 'bg-emerald-600' : 'bg-purple-600'
                        }`}
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Teacher Feedback Notes */}
                  {lesson.teacherNotes ? (
                    <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-400">
                        <MessageSquare className="w-3 h-3" />
                        <span>Orientação do Professor:</span>
                      </div>
                      <p className="italic font-medium">"{lesson.teacherNotes}"</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reference Catalog of Methods for this instrument */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Métodos Reconhecidos para {metodosConfig.instrumentoNome}
          </h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          De acordo com a resolução CCB Jan/2018, os seguintes métodos são aceitos para a evolução instrumental deste naipe:
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {metodosConfig.metodos.map((metodo, idx) => (
            <div key={metodo.id} className="py-4 first:pt-2 last:pb-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {metodo.nome}
                  </h4>
                  {metodo.subtitulo && (
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      &bull; {metodo.subtitulo}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-750">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">
                    RJM / Ensaio
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {metodo.exigencias.rjm.descricao}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-750">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block">
                    Culto Oficial
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {metodo.exigencias.culto.descricao}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-750">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                    Oficialização
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {metodo.exigencias.oficializacao.descricao}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
