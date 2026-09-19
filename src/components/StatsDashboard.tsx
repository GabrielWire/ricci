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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
      
      {/* Top line: progress number, mode toggle, and instrument */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {totalAprendidos}
            </span>
            <span className="text-sm font-semibold text-slate-400 font-mono">
              / {totalHinos}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold ml-1">
              {percentTotal}% aprendidos
            </span>
            <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono ml-2">
              {instrumento.nome} ({instrumento.afinacao})
            </span>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setModoDificuldade('inteiro')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              modoDificuldade === 'inteiro'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hinos Inteiros
          </button>
          <button
            onClick={() => setModoDificuldade('intro')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              modoDificuldade === 'intro'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Introduções
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-300"
          style={{ width: `${percentTotal}%` }}
        />
      </div>

      {/* Breakdown chips & legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Fáceis: <strong className="text-white font-mono">{faceisAprendidos}/{faceisTotal}</strong>
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Médios: <strong className="text-white font-mono">{mediosAprendidos}/{mediosTotal}</strong>
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Difíceis: <strong className="text-white font-mono">{dificeisAprendidos}/{dificeisTotal}</strong>
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Toque na caixa do hino para marcar como aprendido</span>
        </div>
      </div>

    </div>
  );
};
