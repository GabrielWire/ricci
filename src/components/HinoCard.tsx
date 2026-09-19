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
        border: isAprendido ? 'border-emerald-500' : 'border-emerald-500/40 hover:border-emerald-400',
        dot: 'bg-emerald-400',
        badge: 'text-emerald-300 bg-emerald-950/60',
      };
    }
    if (dif === 'Médio') {
      return {
        border: isAprendido ? 'border-amber-500' : 'border-amber-500/40 hover:border-amber-400',
        dot: 'bg-amber-400',
        badge: 'text-amber-300 bg-amber-950/60',
      };
    }
    return {
      border: isAprendido ? 'border-rose-500' : 'border-rose-500/40 hover:border-rose-400',
      dot: 'bg-rose-400',
      badge: 'text-rose-300 bg-rose-950/60',
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
      className={`relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl border-2 transition-all duration-150 select-none text-center group cursor-pointer active:scale-95 ${styles.border} ${
        isAprendido
          ? 'bg-gradient-to-b from-emerald-950/70 to-slate-900 shadow-md shadow-emerald-950/30'
          : 'bg-slate-900/80 hover:bg-slate-850'
      }`}
    >
      {/* Top row: Checkmark / indicator & Difficulty dot */}
      <div className="w-full flex items-center justify-between">
        <span
          className={`w-2 h-2 rounded-full ${styles.dot}`}
          title={`Dificuldade: ${dif}`}
        />

        <div
          className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
            isAprendido
              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
              : 'border-slate-700 bg-slate-950/80 text-transparent group-hover:border-slate-500'
          }`}
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      </div>

      {/* Center: Hymn Number */}
      <div className="my-0.5">
        <span
          className={`text-xl sm:text-2xl font-black font-mono tracking-tight leading-none ${
            isAprendido ? 'text-emerald-300' : 'text-white group-hover:text-amber-200'
          }`}
        >
          {hino.numeroExibicao || hino.numero}
        </span>
      </div>

      {/* Bottom: Accidentals Box */}
      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex items-center gap-1">
          <span
            className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border border-slate-700/80 ${
              isAprendido
                ? 'bg-emerald-900/60 text-emerald-200 border-emerald-700/60'
                : styles.badge
            }`}
          >
            {armaduraDisplay === '0' ? '0♮' : armaduraDisplay}
          </span>

          {hino.meiaHora && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"
              title="Sugestão para Meia-Hora"
            />
          )}
        </div>

        {/* Small note if transposing */}
        {isTransposing && (
          <span className="text-[9px] text-slate-400/80 font-mono mt-0.5 leading-none">
            Dó: {hino.armadura === '0' ? '0♮' : hino.armadura}
          </span>
        )}
      </div>
    </button>
  );
};
