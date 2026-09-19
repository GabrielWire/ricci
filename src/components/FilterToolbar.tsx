import React from 'react';
import { Search, X, ArrowUpDown, RotateCcw } from 'lucide-react';

export interface FiltrosState {
  busca: string;
  dificuldade: string;
  acidentes: string;
  categoria: string;
  status: string;
  ordenacao: 'numero_asc' | 'numero_desc' | 'dif_facil' | 'dif_dificil' | 'acidentes_asc' | 'acidentes_desc';
}

interface Props {
  filtros: FiltrosState;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosState>>;
  totalFiltrados: number;
  totalHinos: number;
  onResetFiltros: () => void;
  instrumentoNome: string;
}

export const FilterToolbar: React.FC<Props> = ({
  filtros,
  setFiltros,
  totalFiltrados,
  totalHinos,
  onResetFiltros,
  instrumentoNome,
}) => {
  const isFiltered =
    filtros.busca !== '' ||
    filtros.dificuldade !== 'todas' ||
    filtros.acidentes !== 'todos' ||
    filtros.categoria !== 'todas' ||
    filtros.status !== 'todos' ||
    filtros.ordenacao !== 'numero_asc';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5 transition-colors duration-200">
      
      {/* Search and Sort (PrimeFaces Toolbar) */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Prime InputText */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número (ex: 247) ou título..."
            value={filtros.busca}
            onChange={(e) => setFiltros((prev) => ({ ...prev, busca: e.target.value }))}
            className="w-full pl-10 pr-10 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
          />
          {filtros.busca && (
            <button
              onClick={() => setFiltros((prev) => ({ ...prev, busca: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filtros.ordenacao}
              onChange={(e) => setFiltros((prev) => ({ ...prev, ordenacao: e.target.value as any }))}
              className="w-full pl-8.5 pr-8 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm appearance-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all shadow-2xs"
            >
              <option value="numero_asc" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Ordem: Número crescente (1 → 480)</option>
              <option value="numero_desc" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Ordem: Número decrescente (480 → 1)</option>
              <option value="dif_facil" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Ordem: Mais Fáceis primeiro</option>
              <option value="dif_dificil" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Ordem: Mais Difíceis primeiro</option>
              <option value="acidentes_asc" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Ordem: Menos acidentes (0 → 7)</option>
              <option value="acidentes_desc" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Ordem: Mais acidentes (7 → 0)</option>
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={onResetFiltros}
              title="Limpar filtros"
              className="p-2 sm:px-3 sm:py-2 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Selects Grid (PrimeFaces Form Controls - 4 clean columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-xs">
        
        {/* 1. Dificuldade */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
            Dificuldade
          </label>
          <select
            value={filtros.dificuldade}
            onChange={(e) => setFiltros((prev) => ({ ...prev, dificuldade: e.target.value }))}
            className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs font-medium cursor-pointer"
          >
            <option value="todas" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Todas as dificuldades</option>
            <option value="Fácil" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">🟢 Fáceis</option>
            <option value="Médio" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">🟡 Médios</option>
            <option value="Difícil" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">🔴 Difíceis</option>
          </select>
        </div>

        {/* 2. Acidentes no Instrumento (Specific Accidentals Only) */}
        <div>
          <label className="block text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 truncate" title={`Acidentes no ${instrumentoNome}`}>
            Acidentes ({instrumentoNome})
          </label>
          <select
            value={filtros.acidentes}
            onChange={(e) => setFiltros((prev) => ({ ...prev, acidentes: e.target.value }))}
            className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-950 border border-indigo-300 dark:border-indigo-500/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs font-medium cursor-pointer"
          >
            <option value="todos" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Todas as armaduras</option>
            <option value="0" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">0 acidentes (♮ Natural)</option>
            
            <optgroup label="── Bemóis (♭) ──" className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300 font-bold">
              <option value="1b" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">1 Bemol (1♭)</option>
              <option value="2b" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">2 Bemóis (2♭)</option>
              <option value="3b" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">3 Bemóis (3♭)</option>
              <option value="4b" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">4 Bemóis (4♭)</option>
              <option value="5b" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">5 Bemóis (5♭)</option>
              <option value="6b" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">6 Bemóis (6♭)</option>
            </optgroup>

            <optgroup label="── Sustenidos (♯) ──" className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300 font-bold">
              <option value="1s" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">1 Sustenido (1♯)</option>
              <option value="2s" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">2 Sustenidos (2♯)</option>
              <option value="3s" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">3 Sustenidos (3♯)</option>
              <option value="4s" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">4 Sustenidos (4♯)</option>
              <option value="5s" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">5 Sustenidos (5♯)</option>
              <option value="6s" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">6 Sustenidos (6♯)</option>
            </optgroup>
          </select>
        </div>

        {/* 3. Categoria */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
            Categoria
          </label>
          <select
            value={filtros.categoria}
            onChange={(e) => setFiltros((prev) => ({ ...prev, categoria: e.target.value }))}
            className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs font-medium cursor-pointer"
          >
            <option value="todas" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Todas as categorias</option>
            <option value="culto" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Culto Oficial (1 - 430)</option>
            <option value="jovens" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Jovens e Menores (431 - 480)</option>
            <option value="meia_hora" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Sugestão Meia-Hora</option>
            <option value="coros" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Coros Avulsos (1 - 6)</option>
          </select>
        </div>

        {/* 4. Status de Estudo */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
            Meu Estudo
          </label>
          <select
            value={filtros.status}
            onChange={(e) => setFiltros((prev) => ({ ...prev, status: e.target.value }))}
            className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs font-medium cursor-pointer"
          >
            <option value="todos" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">Todos os hinos</option>
            <option value="aprendido" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">✅ Já Aprendi</option>
            <option value="nao_iniciado" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">⏳ Não Aprendidos</option>
          </select>
        </div>

      </div>

      {/* Counter summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 pt-1">
        <span>
          Exibindo <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{totalFiltrados}</strong> de {totalHinos} hinos
        </span>
        {isFiltered && (
          <span className="text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 font-semibold">
            Filtros ativos
          </span>
        )}
      </div>

    </div>
  );
};
