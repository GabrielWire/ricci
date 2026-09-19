import React, { useState, useEffect, useMemo } from 'react';
import { StatsDashboard } from '../../components/StatsDashboard';
import { FilterToolbar } from '../../components/FilterToolbar';
import type { FiltrosState } from '../../components/FilterToolbar';
import { HinoCard } from '../../components/HinoCard';
import { EscalasView } from '../../components/EscalasView';
import { InstrumentSelectorModal } from '../../components/InstrumentSelectorModal';
import { HINOS_DATA } from '../../data/hinosData';
import { calcularTonalidadeInstrumento } from '../../data/instrumentsData';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentProgressMap, updateHymnProgress } from '../../services/studentService';
import { resolveInstrumento } from '../../utils/instrumentUtils';
import type { HinoProgressoDoc, StatusProgresso } from '../../types/auth';
import type { RegistroProgresso } from '../../types';
import { BookOpen, ChevronDown, Loader2, Music, GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlunoProgresso: React.FC = () => {
  const { userData, currentUser, refreshUserData } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<number, HinoProgressoDoc>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hinos' | 'escalas'>('hinos');
  const [modoDificuldade, setModoDificuldade] = useState<'inteiro' | 'intro'>('inteiro');
  const [visibleCount, setVisibleCount] = useState(60);
  const [isModalInstrumentoOpen, setIsModalInstrumentoOpen] = useState(false);

  // Resolves official instrument from student profile
  const instrumentoOficial = useMemo(() => {
    return resolveInstrumento(userData?.instrument);
  }, [userData?.instrument]);

  // Current instrument being viewed (defaults to student's official instrument)
  const [instrumentoAtual, setInstrumentoAtual] = useState(instrumentoOficial);

  // Sync when profile data loads
  useEffect(() => {
    setInstrumentoAtual(instrumentoOficial);
  }, [instrumentoOficial]);

  const [filtros, setFiltros] = useState<FiltrosState>({
    busca: '',
    dificuldade: 'todas',
    acidentes: 'todos',
    categoria: 'todas',
    status: 'todos',
    ordenacao: 'numero_asc',
  });

  // Auto-reset accidentals filter if not existing in selected instrument
  useEffect(() => {
    if (filtros.acidentes !== 'todos' && filtros.acidentes !== '0') {
      const exists = HINOS_DATA.some((h) => {
        const trans = calcularTonalidadeInstrumento(h.acidentes, instrumentoAtual);
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
  }, [instrumentoAtual, filtros.acidentes]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchProgress = async () => {
      try {
        const map = await getStudentProgressMap(currentUser.uid);
        setProgressMap(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [currentUser]);

  // Convert Firestore progress to component format
  const registrosFormat: Record<number, RegistroProgresso> = useMemo(() => {
    const res: Record<number, RegistroProgresso> = {};
    Object.entries(progressMap).forEach(([hId, doc]) => {
      const isConcluido = doc.status === 'Concluído' || doc.progress === 100;
      res[Number(hId)] = {
        intro: isConcluido ? 'aprendido' : 'nao_iniciado',
        inteiro: isConcluido ? 'aprendido' : 'nao_iniciado',
        atualizadoEm: doc.updatedAt,
      };
    });
    return res;
  }, [progressMap]);

  const handleToggleAprendido = async (hinoNumero: number) => {
    if (!currentUser) return;
    const current = progressMap[hinoNumero];
    const isCurrentlyDone = current?.status === 'Concluído' || current?.progress === 100;
    const nextStatus: StatusProgresso = isCurrentlyDone ? 'Não iniciado' : 'Concluído';
    const nextProg = isCurrentlyDone ? 0 : 100;

    const hinoData = HINOS_DATA.find((h) => h.numero === hinoNumero);
    const hinoName = hinoData?.titulo || `Hino ${hinoNumero}`;

    // Optimistic UI update
    setProgressMap((prev) => ({
      ...prev,
      [hinoNumero]: {
        hinoId: hinoNumero,
        name: hinoName,
        status: nextStatus,
        progress: nextProg,
        updatedAt: new Date().toISOString(),
      },
    }));

    try {
      await updateHymnProgress(
        currentUser.uid,
        hinoNumero,
        hinoName,
        nextStatus,
        nextProg,
        progressMap
      );
      await refreshUserData();
    } catch (err) {
      console.error(err);
    }
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

    // 3. Accidentals FILTERED BY TRANSPOSED KEY ON THE STUDENT'S INSTRUMENT
    if (filtros.acidentes !== 'todos') {
      list = list.filter((h) => {
        const trans = calcularTonalidadeInstrumento(h.acidentes, instrumentoAtual);
        if (filtros.acidentes === '0') return trans.armadura === '0';
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

    // 5. Study status
    if (filtros.status !== 'todos') {
      list = list.filter((h) => {
        const isDone = progressMap[h.numero]?.status === 'Concluído';
        if (filtros.status === 'aprendido') return isDone;
        if (filtros.status === 'nao_iniciado') return !isDone;
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
          const qtdA = calcularTonalidadeInstrumento(a.acidentes, instrumentoAtual).totalAcidentes;
          const qtdB = calcularTonalidadeInstrumento(b.acidentes, instrumentoAtual).totalAcidentes;
          if (qtdA !== qtdB) return qtdA - qtdB;
          return a.numero - b.numero;
        }
        case 'acidentes_desc': {
          const qtdA = calcularTonalidadeInstrumento(a.acidentes, instrumentoAtual).totalAcidentes;
          const qtdB = calcularTonalidadeInstrumento(b.acidentes, instrumentoAtual).totalAcidentes;
          if (qtdA !== qtdB) return qtdB - qtdA;
          return a.numero - b.numero;
        }
        default:
          return a.numero - b.numero;
      }
    });

    return list;
  }, [filtros, modoDificuldade, progressMap, instrumentoAtual]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-400">Carregando seu plano de estudos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Student Instrument Plan Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs transition-colors duration-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                {instrumentoAtual.nome}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Afinação: <strong className="text-slate-800 dark:text-slate-200">{instrumentoAtual.afinacao}</strong>
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">&bull;</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {instrumentoAtual.hinario}
              </span>
              {instrumentoAtual.transposicaoArmadura !== 0 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Transposição: {instrumentoAtual.transposicaoArmadura > 0 ? `+${instrumentoAtual.transposicaoArmadura}` : instrumentoAtual.transposicaoArmadura} armadura
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Dica GEM: </span>
              {instrumentoAtual.dicaGEM}
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => setIsModalInstrumentoOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Trocar visualização temporária de instrumento"
            >
              <Music className="w-3.5 h-3.5 text-indigo-600" />
              <span>Trocar Visão</span>
            </button>
            <Link
              to="/aluno/perfil"
              className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span>Editar Perfil</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Tab Selection: Hinos vs Plano de Estudos/Escalas */}
        <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => setActiveTab('hinos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'hinos'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Hinos do Hinário 5 ({HINOS_DATA.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('escalas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'escalas'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Plano de Escalas & Teoria ({instrumentoAtual.escalasRecomendadas.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content: Either Hymns or Escalas Study Plan */}
      {activeTab === 'escalas' ? (
        <EscalasView
          instrumento={instrumentoAtual}
          onOpenInstrumentModal={() => setIsModalInstrumentoOpen(true)}
        />
      ) : (
        <>
          <StatsDashboard
            hinos={HINOS_DATA}
            registros={registrosFormat}
            instrumento={instrumentoAtual}
            modoDificuldade={modoDificuldade}
            setModoDificuldade={setModoDificuldade}
          />

          <FilterToolbar
            filtros={filtros}
            setFiltros={setFiltros}
            totalFiltrados={hinosFiltrados.length}
            totalHinos={HINOS_DATA.length}
            onResetFiltros={handleResetFiltros}
            instrumento={instrumentoAtual}
            hinos={HINOS_DATA}
          />

          {hinosFiltrados.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-2.5">
                {hinosFiltrados.slice(0, visibleCount).map((hino) => (
                  <HinoCard
                    key={hino.numero}
                    hino={hino}
                    registro={registrosFormat[hino.numero]}
                    instrumento={instrumentoAtual}
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
                Ajuste os filtros de acidentes ou busca para exibir os hinos do repertório.
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal to Switch Viewing Instrument */}
      <InstrumentSelectorModal
        isOpen={isModalInstrumentoOpen}
        onClose={() => setIsModalInstrumentoOpen(false)}
        selectedInstrumento={instrumentoAtual}
        onSelectInstrumento={(novo) => {
          setInstrumentoAtual(novo);
          setIsModalInstrumentoOpen(false);
        }}
      />
    </div>
  );
};
