import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { InstrumentSelectorModal } from './components/InstrumentSelectorModal';
import { StatsDashboard } from './components/StatsDashboard';
import { FilterToolbar } from './components/FilterToolbar';
import type { FiltrosState } from './components/FilterToolbar';
import { HinoCard } from './components/HinoCard';
import { EscalasView } from './components/EscalasView';
import { BackupModal } from './components/BackupModal';
import { INSTRUMENTOS, calcularTonalidadeInstrumento } from './data/instrumentsData';
import type { Instrumento } from './data/instrumentsData';
import { HINOS_DATA } from './data/hinosData';
import type { RegistroProgresso, StatusHino } from './types';
import { Music, BookOpen, ExternalLink, Phone, MapPin, ChevronDown } from 'lucide-react';

const STORAGE_KEY_PREFIX = 'ricci_ccb_progress_';
const STORAGE_KEY_INSTRUMENT = 'ricci_ccb_instrument_id';
const STORAGE_KEY_THEME = 'ricci_theme';

export const App: React.FC = () => {
  const [selectedInstrumento, setSelectedInstrumento] = useState<Instrumento>(() => {
    const savedId = localStorage.getItem(STORAGE_KEY_INSTRUMENT);
    return INSTRUMENTOS.find((i) => i.id === savedId) || INSTRUMENTOS[0];
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [registros, setRegistros] = useState<Record<number, RegistroProgresso>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${selectedInstrumento.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeTab, setActiveTab] = useState<'hinos' | 'escalas'>('hinos');
  const [isInstrumentModalOpen, setIsInstrumentModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [modoDificuldade, setModoDificuldade] = useState<'inteiro' | 'intro'>('inteiro');
  const [visibleCount, setVisibleCount] = useState(60);

  const [filtros, setFiltros] = useState<FiltrosState>({
    busca: '',
    dificuldade: 'todas',
    acidentes: 'todos',
    categoria: 'todas',
    status: 'todos',
    ordenacao: 'numero_asc',
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INSTRUMENT, selectedInstrumento.id);
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${selectedInstrumento.id}`);
      setRegistros(saved ? JSON.parse(saved) : {});
    } catch {
      setRegistros({});
    }
  }, [selectedInstrumento.id]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${selectedInstrumento.id}`, JSON.stringify(registros));
  }, [registros, selectedInstrumento.id]);

  // Reset accidentals filter if not present in the new instrument
  useEffect(() => {
    if (filtros.acidentes !== 'todos' && filtros.acidentes !== '0') {
      const exists = HINOS_DATA.some((h) => {
        const trans = calcularTonalidadeInstrumento(h.acidentes, selectedInstrumento);
        if (filtros.acidentes === '1b') return trans.armadura === '1♭';
        if (filtros.acidentes === '2b') return trans.armadura === '2♭';
        if (filtros.acidentes === '3b') return trans.armadura === '3♭';
        if (filtros.acidentes === '4b') return trans.armadura === '4♭';
        if (filtros.acidentes === '5b') return trans.armadura === '5♭';
        if (filtros.acidentes === '6b') return trans.armadura === '6♭';
        if (filtros.acidentes === '7b') return trans.armadura === '7♭';
        if (filtros.acidentes === '1s') return trans.armadura === '1♯';
        if (filtros.acidentes === '2s') return trans.armadura === '2♯';
        if (filtros.acidentes === '3s') return trans.armadura === '3♯';
        if (filtros.acidentes === '4s') return trans.armadura === '4♯';
        if (filtros.acidentes === '5s') return trans.armadura === '5♯';
        if (filtros.acidentes === '6s') return trans.armadura === '6♯';
        if (filtros.acidentes === '7s') return trans.armadura === '7♯';
        return false;
      });
      if (!exists) {
        setFiltros((prev) => ({ ...prev, acidentes: 'todos' }));
      }
    }
  }, [selectedInstrumento, filtros.acidentes]);

  const handleToggleAprendido = (hinoNumero: number) => {
    setRegistros((prev) => {
      const current = prev[hinoNumero] || { intro: 'nao_iniciado', inteiro: 'nao_iniciado' };
      const currentField = modoDificuldade === 'inteiro' ? 'inteiro' : 'intro';
      const currentVal = current[currentField];
      const nextVal: StatusHino = currentVal === 'aprendido' ? 'nao_iniciado' : 'aprendido';

      return {
        ...prev,
        [hinoNumero]: {
          ...current,
          [currentField]: nextVal,
          atualizadoEm: new Date().toISOString(),
        },
      };
    });
  };

  const handleResetFiltros = () => {
    setFiltros({
      busca: '',
      dificuldade: 'todas',
      acidentes: 'todos',
      categoria: 'todas',
      status: 'todos',
      ordenacao: 'numero_asc',
    });
  };

  const handleImportData = (data: Record<number, RegistroProgresso>) => {
    setRegistros(data);
  };

  const handleResetData = () => {
    setRegistros({});
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${selectedInstrumento.id}`);
  };

  const hinosFiltrados = useMemo(() => {
    let list = [...HINOS_DATA];

    // 1. Text search
    if (filtros.busca.trim()) {
      const q = filtros.busca.trim().toLowerCase();
      list = list.filter(
        (h) =>
          h.numero.toString().includes(q) ||
          h.titulo.toLowerCase().includes(q) ||
          (h.numeroExibicao && h.numeroExibicao.toLowerCase().includes(q))
      );
    }

    // 2. Difficulty
    if (filtros.dificuldade !== 'todas') {
      list = list.filter((h) => {
        const dif = modoDificuldade === 'inteiro' ? h.dificuldadeInteiro : h.dificuldadeIntro;
        return dif === filtros.dificuldade;
      });
    }

    // 3. Accidentals FILTERED BY SPECIFIC ACCIDENTAL ON THE SELECTED INSTRUMENT
    if (filtros.acidentes !== 'todos') {
      list = list.filter((h) => {
        const trans = calcularTonalidadeInstrumento(h.acidentes, selectedInstrumento);
        if (filtros.acidentes === '0') return trans.armadura === '0';
        if (filtros.acidentes === '1b') return trans.armadura === '1♭';
        if (filtros.acidentes === '2b') return trans.armadura === '2♭';
        if (filtros.acidentes === '3b') return trans.armadura === '3♭';
        if (filtros.acidentes === '4b') return trans.armadura === '4♭';
        if (filtros.acidentes === '5b') return trans.armadura === '5♭';
        if (filtros.acidentes === '6b') return trans.armadura === '6♭';
        if (filtros.acidentes === '1s') return trans.armadura === '1♯';
        if (filtros.acidentes === '2s') return trans.armadura === '2♯';
        if (filtros.acidentes === '3s') return trans.armadura === '3♯';
        if (filtros.acidentes === '4s') return trans.armadura === '4♯';
        if (filtros.acidentes === '5s') return trans.armadura === '5♯';
        if (filtros.acidentes === '6s') return trans.armadura === '6♯';
        return true;
      });
    }

    // 4. Category
    if (filtros.categoria !== 'todas') {
      if (filtros.categoria === 'culto') list = list.filter((h) => h.categoria === 'Culto Oficial');
      else if (filtros.categoria === 'jovens') list = list.filter((h) => h.categoria === 'Reunião de Jovens e Menores');
      else if (filtros.categoria === 'meia_hora') list = list.filter((h) => h.meiaHora);
      else if (filtros.categoria === 'coros') list = list.filter((h) => h.categoria === 'Coros');
    }

    // 5. Student Status
    if (filtros.status !== 'todos') {
      list = list.filter((h) => {
        const reg = registros[h.numero];
        const currentStatus = modoDificuldade === 'inteiro' ? reg?.inteiro || 'nao_iniciado' : reg?.intro || 'nao_iniciado';
        if (filtros.status === 'aprendido') return currentStatus === 'aprendido';
        if (filtros.status === 'nao_iniciado') return currentStatus !== 'aprendido';
        return true;
      });
    }

    // 6. Sorting
    const difWeights: Record<string, number> = { 'Fácil': 1, 'Médio': 2, 'Difícil': 3 };

    list.sort((a, b) => {
      switch (filtros.ordenacao) {
        case 'numero_asc':
          return a.numero - b.numero;
        case 'numero_desc':
          return b.numero - a.numero;
        case 'dif_facil': {
          const difA = difWeights[modoDificuldade === 'inteiro' ? a.dificuldadeInteiro : a.dificuldadeIntro] || 2;
          const difB = difWeights[modoDificuldade === 'inteiro' ? b.dificuldadeInteiro : b.dificuldadeIntro] || 2;
          if (difA !== difB) return difA - difB;
          return a.numero - b.numero;
        }
        case 'dif_dificil': {
          const difA = difWeights[modoDificuldade === 'inteiro' ? a.dificuldadeInteiro : a.dificuldadeIntro] || 2;
          const difB = difWeights[modoDificuldade === 'inteiro' ? b.dificuldadeInteiro : b.dificuldadeIntro] || 2;
          if (difA !== difB) return difB - difA;
          return a.numero - b.numero;
        }
        case 'acidentes_asc': {
          const qtdA = calcularTonalidadeInstrumento(a.acidentes, selectedInstrumento).totalAcidentes;
          const qtdB = calcularTonalidadeInstrumento(b.acidentes, selectedInstrumento).totalAcidentes;
          if (qtdA !== qtdB) return qtdA - qtdB;
          return a.numero - b.numero;
        }
        case 'acidentes_desc': {
          const qtdA = calcularTonalidadeInstrumento(a.acidentes, selectedInstrumento).totalAcidentes;
          const qtdB = calcularTonalidadeInstrumento(b.acidentes, selectedInstrumento).totalAcidentes;
          if (qtdA !== qtdB) return qtdB - qtdA;
          return a.numero - b.numero;
        }
        default:
          return a.numero - b.numero;
      }
    });

    return list;
  }, [filtros, modoDificuldade, registros, selectedInstrumento]);

  const hinosExibidos = useMemo(() => {
    return hinosFiltrados.slice(0, visibleCount);
  }, [hinosFiltrados, visibleCount]);

  const totalAprendidos = Object.values(registros).filter(
    (r) => (modoDificuldade === 'inteiro' ? r.inteiro : r.intro) === 'aprendido'
  ).length;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <Header
        instrumento={selectedInstrumento}
        onOpenInstrumentModal={() => setIsInstrumentModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        totalAprendidos={totalAprendidos}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {activeTab === 'hinos' ? (
          <>
            <StatsDashboard
              hinos={HINOS_DATA}
              registros={registros}
              instrumento={selectedInstrumento}
              modoDificuldade={modoDificuldade}
              setModoDificuldade={setModoDificuldade}
            />

            <FilterToolbar
              filtros={filtros}
              setFiltros={setFiltros}
              totalFiltrados={hinosFiltrados.length}
              totalHinos={HINOS_DATA.length}
              onResetFiltros={handleResetFiltros}
              instrumento={selectedInstrumento}
              hinos={HINOS_DATA}
            />

            {hinosFiltrados.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-2.5">
                  {hinosExibidos.map((hino) => (
                    <HinoCard
                      key={hino.numero}
                      hino={hino}
                      registro={registros[hino.numero]}
                      instrumento={selectedInstrumento}
                      modoDificuldade={modoDificuldade}
                      onToggleAprendido={handleToggleAprendido}
                    />
                  ))}
                </div>

                {visibleCount < hinosFiltrados.length && (
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4 pb-8">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 60)}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Mostrar mais 60 hinos
                    </button>
                    <button
                      onClick={() => setVisibleCount(hinosFiltrados.length)}
                      className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all active:scale-95 shadow-2xs cursor-pointer"
                    >
                      Mostrar todos ({hinosFiltrados.length})
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xs">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhum hino encontrado</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Ajuste os filtros de busca ou armadura de clave para exibir os hinos.
                </p>
                <button
                  onClick={handleResetFiltros}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </>
        ) : (
          <EscalasView
            instrumento={selectedInstrumento}
            onOpenInstrumentModal={() => setIsInstrumentModalOpen(true)}
          />
        )}
      </main>

      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-8 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-indigo-700 dark:text-indigo-400 text-sm tracking-tight block">RICCI - ACADEMIA DE MÚSICA</span>
                <span className="text-slate-400 text-[11px]">Santo André - SP</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Av. Das Nações, 749</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>(11) 4475-6918</span>
              </div>
              <a
                href="https://www.ricciacademiademusica.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-semibold"
              >
                <span>ricciacademiademusica.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
            Classificação por dificuldade baseada no roteiro de estudos do Hinário 5 (Crislaine M. Ventura). &copy; {new Date().getFullYear()} RICCI Academia de Música.
          </p>
        </div>
      </footer>

      <InstrumentSelectorModal
        isOpen={isInstrumentModalOpen}
        onClose={() => setIsInstrumentModalOpen(false)}
        selectedInstrumento={selectedInstrumento}
        onSelectInstrumento={setSelectedInstrumento}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        instrumento={selectedInstrumento}
        registros={registros}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />
    </div>
  );
};

export default App;
