import React from 'react';
import { Music, Sliders, BookOpen, Award, Download } from 'lucide-react';
import type { Instrumento } from '../data/instrumentsData';

interface HeaderProps {
  instrumento: Instrumento;
  onOpenInstrumentModal: () => void;
  activeTab: 'hinos' | 'escalas';
  setActiveTab: (tab: 'hinos' | 'escalas') => void;
  onOpenBackupModal: () => void;
  totalAprendidos: number;
}

export const Header: React.FC<HeaderProps> = ({
  instrumento,
  onOpenInstrumentModal,
  activeTab,
  setActiveTab,
  onOpenBackupModal,
  totalAprendidos,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
                <Music className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-wider text-amber-400 text-lg sm:text-xl uppercase">RICCI</span>
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold border-l border-slate-700 pl-2">Academia de Música</span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  Preparatório Orquestra CCB &bull; Hinário 5
                </p>
              </div>
            </div>

            <button
              onClick={onOpenBackupModal}
              title="Backup e Dados"
              className="md:hidden p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-center">
            <button
              onClick={onOpenInstrumentModal}
              className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-800/80 hover:from-amber-950/40 hover:to-amber-900/30 border border-amber-500/30 hover:border-amber-400 transition-all duration-200 shadow-inner"
            >
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Instrumento:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-amber-200 group-hover:text-amber-300">{instrumento.nome}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {instrumento.afinacao}
                </span>
              </div>
              <Sliders className="w-3.5 h-3.5 text-amber-400 ml-1 group-hover:rotate-45 transition-transform" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
            <nav className="flex p-1 rounded-xl bg-slate-950/80 border border-slate-800">
              <button
                onClick={() => setActiveTab('hinos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'hinos'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Hinos (480)
              </button>

              <button
                onClick={() => setActiveTab('escalas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'escalas'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                Escalas
              </button>
            </nav>

            <button
              onClick={onOpenBackupModal}
              title="Gerenciar Dados & Backup"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup ({totalAprendidos})</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
