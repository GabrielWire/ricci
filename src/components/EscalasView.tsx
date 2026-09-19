import React, { useState } from 'react';
import { Award, Music2, Info, Search, BookOpen } from 'lucide-react';
import type { Instrumento } from '../data/instrumentsData';

interface Props {
  instrumento: Instrumento;
  onOpenInstrumentModal: () => void;
}

export const EscalasView: React.FC<Props> = ({ instrumento, onOpenInstrumentModal }) => {
  const [busca, setBusca] = useState('');

  const escalasFiltradas = instrumento.escalasRecomendadas.filter((esc) => {
    if (!busca) return true;
    const b = busca.toLowerCase();
    return (
      esc.nome.toLowerCase().includes(b) ||
      esc.armadura.toLowerCase().includes(b) ||
      esc.notas.toLowerCase().includes(b)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                {instrumento.categoria} &bull; {instrumento.voz}
              </span>
              <span className="text-xs text-slate-400">&bull; {instrumento.hinario}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5 flex items-center gap-3">
              Escalas para {instrumento.nome}
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {instrumento.descricao}
            </p>
          </div>

          <button
            onClick={onOpenInstrumentModal}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold transition-colors shrink-0 flex items-center gap-2"
          >
            <Music2 className="w-4 h-4" />
            Trocar Instrumento
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Afinação & Clave</span>
            <span className="text-sm font-bold text-white mt-0.5 block">{instrumento.afinacao} &bull; {instrumento.clave}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Regra de Transposição</span>
            <span className="text-sm font-bold text-amber-300 mt-0.5 block">
              {instrumento.transposicaoArmadura === 0
                ? 'Sem transposição (Som real / Hinário em Dó)'
                : `${instrumento.transposicaoArmadura > 0 ? '+' : ''}${instrumento.transposicaoArmadura} acidente(s) na armadura`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Método CCB / GEM</span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5 block">Exigência para Testes e Reunião de Jovens</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar escala (ex: Sol Maior, 2♯, Ré...)"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Executar as escalas em andamento moderado com arpejo completo e sonoridade limpa.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {escalasFiltradas.map((escala, idx) => (
          <div
            key={idx}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    {escala.nome}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    Extensão sugerida: {escala.oitavas} oitava{escala.oitavas > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold text-xs">
                  {escala.armadura}
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Notas da Escala:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {escala.notas.split(', ').map((nota, nIdx) => (
                    <span
                      key={nIdx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-semibold"
                    >
                      {nota}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
                  Arpejo correspondente:
                </div>
                <div className="text-xs text-slate-200 font-mono font-bold">
                  {escala.arpejo}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>{escala.acidentes} {escala.acidentes === 1 ? 'acidente' : 'acidentes'} na armadura</span>
              <span className="text-emerald-400 font-medium">Fundamental para GEM</span>
            </div>
          </div>
        ))}
      </div>

      {escalasFiltradas.length === 0 && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Nenhuma escala encontrada com os termos buscados.</p>
        </div>
      )}
    </div>
  );
};
