import React from 'react';
import { Music, Sliders, BookOpen, Award, Download, Sun, Moon } from 'lucide-react';
import type { Instrumento } from '../data/instrumentsData';

interface HeaderProps {
  instrumento: Instrumento;
  onOpenInstrumentModal: () => void;
  activeTab: 'hinos' | 'escalas';
  setActiveTab: (tab: 'hinos' | 'escalas') => void;
  onOpenBackupModal: () => void;
  totalAprendidos: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  instrumento,
  onOpenInstrumentModal,
  activeTab,
  setActiveTab,
  onOpenBackupModal,
  totalAprendidos,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-2.5 sm:py-3 gap-2.5 sm:gap-3">
          
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 flex items-center justify-center shadow-sm shadow-indigo-600/30 text-white font-bold shrink-0">
                <Music className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-extrabold tracking-tight text-indigo-700 dark:text-indigo-400 text-base sm:text-lg uppercase">RICCI</span>
                  <span className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold border-l border-slate-300 dark:border-slate-700 pl-2">Academia de Música</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  Preparatório Orquestra CCB &bull; Hinário 5
                </p>
              </div>
            </div>

            {/* Mobile Actions (Theme + Backup) */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={onToggleTheme}
                title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>
              <button
                onClick={onOpenBackupModal}
                title="Backup e Dados"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Instrument Chip / Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-center">
            <button
              onClick={onOpenInstrumentModal}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50/70 dark:bg-slate-800/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-150 shadow-2xs"
            >
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Instrumento:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{instrumento.nome}</span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono font-bold">
                  {instrumento.afinacao}
                </span>
              </div>
              <Sliders className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ml-0.5 group-hover:rotate-45 transition-transform" />
            </button>
          </div>

          {/* Navigation & Desktop Tools */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
            {/* PrimeFaces SelectButton Tabs */}
            <nav className="flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('hinos')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'hinos'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Hinos (480)
              </button>

              <button
                onClick={() => setActiveTab('escalas')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'escalas'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Escalas
              </button>
            </nav>

            {/* Desktop Theme Switcher */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Mudar para Modo Claro (Jakarta Light)' : 'Mudar para Modo Escuro (PrimeFaces Vela)'}
              className="hidden md:flex items-center p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-2xs"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Desktop Backup Button */}
            <button
              onClick={onOpenBackupModal}
              title="Gerenciar Dados e Backup"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Backup ({totalAprendidos})</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
