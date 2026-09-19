import React, { useState } from 'react';
import { X, Check, Info, Music } from 'lucide-react';
import { INSTRUMENTOS } from '../data/instrumentsData';
import type { Instrumento } from '../data/instrumentsData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedInstrumento: Instrumento;
  onSelectInstrumento: (instrumento: Instrumento) => void;
}

export const InstrumentSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedInstrumento,
  onSelectInstrumento,
}) => {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todas');

  if (!isOpen) return null;

  const categorias = ['Todas', 'Cordas', 'Madeiras', 'Metais'];

  const instrumentosFiltrados = INSTRUMENTOS.filter((inst) => {
    if (categoriaAtiva === 'Todas') return true;
    if (categoriaAtiva === 'Cordas') return inst.categoria === 'Cordas' || inst.categoria === 'Cordas e Teclados';
    return inst.categoria === categoriaAtiva;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-amber-400" />
              Selecione seu Instrumento
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              A ordem de acidentes e as escalas serão ajustadas para a transposição do seu instrumento na orquestra.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                categoriaAtiva === cat
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1">
          {instrumentosFiltrados.map((inst) => {
            const isSelected = selectedInstrumento.id === inst.id;
            return (
              <div
                key={inst.id}
                onClick={() => {
                  onSelectInstrumento(inst);
                  onClose();
                }}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-950/30 border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-bold text-base ${isSelected ? 'text-amber-300' : 'text-slate-100 group-hover:text-white'}`}>
                        {inst.nome}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{inst.voz} &bull; {inst.categoria}</p>
                    </div>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {inst.descricao}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700/80 font-mono font-semibold">
                    Afinação: {inst.afinacao}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700/80">
                    {inst.clave}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {inst.hinario}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2 text-xs text-slate-400">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Observação CCB:</strong> O Contrabaixo Acústico não é utilizado nas congregações comuns. O Órgão Eletrônico é executado exclusivamente pelas irmãs organistas.
          </span>
        </div>

      </div>
    </div>
  );
};
