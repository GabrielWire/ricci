import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Hino, RegistroProgresso } from '../types';
import type { Instrumento } from '../data/instrumentsData';

interface Props {
  hinos: Hino[];
  registros: Record<number, RegistroProgresso>;
  instrumento: Instrumento;
  modoDificuldade: 'inteiro' | 'intro';
  setModoDificuldade: (modo: 'inteiro' | 'intro') => void;
}

export const StatsDashboard: React.FC<Props> = ({
  hinos,
  registros,
  instrumento,
  modoDificuldade,
  setModoDificuldade,
}) => {
  const totalHinos = 480;

  let totalAprendidos = 0;
  let faceisAprendidos = 0;
  let mediosAprendidos = 0;
  let dificeisAprendidos = 0;

  let faceisTotal = 0;
  let mediosTotal = 0;
  let dificeisTotal = 0;

  hinos.forEach((h) => {
    if (h.numero > 480) return;

    const reg = registros[h.numero];
    const status = modoDificuldade === 'inteiro' ? reg?.inteiro : reg?.intro;
    const dif = modoDificuldade === 'inteiro' ? h.dificuldadeInteiro : h.dificuldadeIntro;

    if (dif === 'Fácil') faceisTotal++;
    else if (dif === 'Médio') mediosTotal++;
    else if (dif === 'Difícil') dificeisTotal++;

    if (status === 'aprendido') {
      totalAprendidos++;
      if (dif === 'Fácil') faceisAprendidos++;
      else if (dif === 'Médio') mediosAprendidos++;
      else if (dif === 'Difícil') dificeisAprendidos++;
    }
  });

  const percentTotal = Math.round((totalAprendidos / totalHinos) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5 transition-colors duration-200">
      
      {/* Top line: progress number, mode toggle, and instrument */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
              {totalAprendidos}
            </span>
            <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 font-mono">
              / {totalHinos}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 font-bold ml-1">
              {percentTotal}% aprendidos
            </span>
            <span className="hidden sm:inline-block text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono ml-2 font-medium">
              {instrumento.nome} ({instrumento.afinacao})
            </span>
          </div>
        </div>

        {/* PrimeFaces SelectButton (Mode toggle) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setModoDificuldade('inteiro')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              modoDificuldade === 'inteiro'
                ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Hinos Inteiros
          </button>
          <button
            onClick={() => setModoDificuldade('intro')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              modoDificuldade === 'intro'
                ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Introduções
          </button>
        </div>
      </div>

      {/* PrimeFaces ProgressBar */}
      <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-slate-800">
        <div
          className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-300 shadow-2xs"
          style={{ width: `${percentTotal}%` }}
        />
      </div>

      {/* Prime Severity Breakdown Chips (Tags) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Fáceis: <strong className="text-slate-900 dark:text-white font-mono ml-0.5">{faceisAprendidos}/{faceisTotal}</strong>
          </span>

          <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Médios: <strong className="text-slate-900 dark:text-white font-mono ml-0.5">{mediosAprendidos}/{mediosTotal}</strong>
          </span>

          <span className="px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-medium flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Difíceis: <strong className="text-slate-900 dark:text-white font-mono ml-0.5">{dificeisAprendidos}/{dificeisTotal}</strong>
          </span>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Clique na caixa do hino para marcar como aprendido</span>
        </div>
      </div>

    </div>
  );
};
