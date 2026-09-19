import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Music,
  GraduationCap,
  ArrowRight,
  Award,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { resolveInstrumento } from '../../utils/instrumentUtils';

export const AlunoDashboard: React.FC = () => {
  const { userData } = useAuth();

  const totalHinos = 480;
  const hinosConcluidos = userData?.hinosConcluidos || 0;
  const hinosEmProgresso = userData?.hinosEmProgresso || 0;
  const progressoGeral = userData?.progressoGeral || 0;

  const msaPhaseName = userData?.msaCurrentPhaseName || 'Fase 1 — Fundamentos da Música';
  const msaProgress = userData?.msaGeneralProgress || 0;

  const metodoNome = userData?.metodoNome || 'Método de Instrumento';
  const metodoPosicao = userData?.metodoPosicao || 'Consultar';
  const metodoProgresso = userData?.metodoProgresso || 0;
  const metodoEstagio = userData?.metodoEstagioApto || 'Iniciante';

  const inst = useMemo(() => {
    return resolveInstrumento(userData?.instrument);
  }, [userData?.instrument]);

  const getMetodoBadgeColor = (status: string) => {
    switch (status) {
      case 'Apto Oficialização':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      case 'Apto Culto Oficial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'Apto RJM / Ensaio':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              Portal do Candidato &bull; Orquestra CCB
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {inst.nome} ({inst.afinacao})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
            Olá, {userData?.name || 'Aluno(a)'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Seu plano de estudos está configurado para o <strong className="text-indigo-600 dark:text-indigo-400">{inst.nome}</strong>. Acompanhe os hinos, o MSA e o método do instrumento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          <Link
            to="/aluno/metodo"
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-2xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Music className="w-4 h-4" />
            <span>Meu Método</span>
          </Link>
          <Link
            to="/aluno/msa"
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-2xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Meu MSA</span>
          </Link>
          <Link
            to="/aluno/progresso"
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-2xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Meus Hinos</span>
          </Link>
        </div>
      </div>

      {/* 2-Column Banner Grid: MSA & Instrument Method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MSA Quick Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-slate-50 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Método Simplificado de Aprendizagem (MSA)</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {msaPhaseName}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Progresso Geral: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{msaProgress}%</strong> concluído na trilha de lições.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-300 dark:border-slate-700">
              <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${msaProgress}%` }} />
            </div>
            <div className="flex justify-end">
              <Link
                to="/aluno/msa"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Acessar Lições do MSA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Instrument Method Quick Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-slate-50 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wider">
                <Music className="w-4 h-4" />
                <span>Método de Instrumento (CCB 2018)</span>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getMetodoBadgeColor(metodoEstagio)}`}>
                {metodoEstagio}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {metodoNome}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Posição Atual: <strong className="text-purple-600 dark:text-purple-400 font-semibold">{metodoPosicao}</strong> &bull; Progresso: <strong className="font-mono">{metodoProgresso}%</strong>
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-300 dark:border-slate-700">
              <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${metodoProgresso}%` }} />
            </div>
            <div className="flex justify-end">
              <Link
                to="/aluno/metodo"
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Ver Requisitos do Método</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Instrument Pedagogical Plan Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Diretrizes Pedagógicas CCB &bull; {inst.nome}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
            {inst.dicaGEM}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Voz: <strong className="text-slate-700 dark:text-slate-200">{inst.voz}</strong></span>
            <span>&bull;</span>
            <span>Clave: <strong className="text-slate-700 dark:text-slate-200">{inst.clave}</strong></span>
            <span>&bull;</span>
            <span>Hinário: <strong className="text-slate-700 dark:text-slate-200">{inst.hinario}</strong></span>
          </div>
        </div>

        <Link
          to="/aluno/progresso"
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-2xs"
        >
          <span>Ver Escalas ({inst.escalasRecomendadas.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Total do Hinário
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
              {totalHinos}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Hinos oficiais</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
            <Music className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Hinos Concluídos
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
              {hinosConcluidos}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Totalmente aprendidos</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Em Aprendizado
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400 font-mono mt-1 block">
              {hinosEmProgresso}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Em andamento</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Progresso Geral Hinário
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1 block">
              {progressoGeral}%
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Do hinário concluído</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
