import React from 'react';
import { Check } from 'lucide-react';
import type { Hino, RegistroProgresso } from '../types';
import { calcularTonalidadeInstrumento } from '../data/instrumentsData';
import type { Instrumento } from '../data/instrumentsData';

interface Props {
  hino: Hino;
  registro?: RegistroProgresso;
  instrumento: Instrumento;
  modoDificuldade: 'inteiro' | 'intro';
  onToggleAprendido: (hinoNumero: number) => void;
}

export const HinoCard: React.FC<Props> = ({
  hino,
  registro,
  instrumento,
  modoDificuldade,
  onToggleAprendido,
}) => {
  const statusAtual = modoDificuldade === 'inteiro' ? registro?.inteiro : registro?.intro;
  const isAprendido = statusAtual === 'aprendido';
  const dif = modoDificuldade === 'inteiro' ? hino.dificuldadeInteiro : hino.dificuldadeIntro;

  // Transposed accidentals for instrument
  const transposto = calcularTonalidadeInstrumento(hino.acidentes, instrumento);

  const getDifficultyStyles = () => {
    if (dif === 'Fácil') {
      return {
        dot: 'bg-emerald-500',
        ring: 'ring-emerald-500/20',
      };
    }
    if (dif === 'Médio') {
      return {
        dot: 'bg-amber-500',
        ring: 'ring-amber-500/20',
      };
    }
    return {
      dot: 'bg-rose-500',
      ring: 'ring-rose-500/20',
    };
  };

  const styles = getDifficultyStyles();

  const isTransposing = instrumento.transposicaoArmadura !== 0;
  const armaduraDisplay = isTransposing ? transposto.armadura : hino.armadura;

  return (
    <button
      onClick={() => onToggleAprendido(hino.numero)}
      title={`${hino.numero}. ${hino.titulo}
Dificuldade: ${dif}
Tom no ${instrumento.nome}: ${transposto.tonalidade} (${transposto.armadura})
Tom Real (Dó): ${hino.tonalidadeEfeito} (${hino.armadura})`}
      className={`relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all duration-150 select-none text-center group cursor-pointer active:scale-95 ${
        isAprendido
          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500 shadow-2xs'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:shadow-xs hover:-translate-y-0.5'
      }`}
    >
      {/* Top row: Difficulty indicator & Checkbox */}
      <div className="w-full flex items-center justify-between">
        <span
          className={`w-2 h-2 rounded-full ${styles.dot} ring-2 ${styles.ring}`}
          title={`Dificuldade: ${dif}`}
        />

        <div
          className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
            isAprendido
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-transparent group-hover:border-indigo-400'
          }`}
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      </div>

      {/* Center: Hymn Number */}
      <div className="my-0.5">
        <span
          className={`text-xl sm:text-2xl font-black font-mono tracking-tight leading-none transition-colors ${
            isAprendido
              ? 'text-indigo-800 dark:text-indigo-300'
              : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
          }`}
        >
          {hino.numeroExibicao || hino.numero}
        </span>
      </div>

      {/* Bottom: Accidentals Box (Prime Tag) */}
      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex items-center gap-1">
          <span
            className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              isAprendido
                ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {armaduraDisplay === '0' ? '0♮' : armaduraDisplay}
          </span>

          {hino.meiaHora && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"
              title="Sugestão para Meia-Hora"
            />
          )}
        </div>

        {/* Small note if transposing */}
        {isTransposing && (
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 leading-none">
            Dó: {hino.armadura === '0' ? '0♮' : hino.armadura}
          </span>
        )}
      </div>
    </button>
  );
};
