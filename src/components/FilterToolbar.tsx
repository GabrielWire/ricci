import React from 'react';
import { Search, X, ArrowUpDown, RotateCcw } from 'lucide-react';

export interface FiltrosState {
  busca: string;
  dificuldade: string;
  acidentes: string;
  tipoAcidente: string;
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
    filtros.tipoAcidente !== 'todos' ||
    filtros.categoria !== 'todas' ||
    filtros.status !== 'todos' ||
    filtros.ordenacao !== 'numero_asc';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5 transition-colors duration-200">
      
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
            className="w-full pl-10 pr-10 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
              className="w-full pl-8.5 pr-8 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm appearance-none focus:outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-all"
            >
              <option value="numero_asc">Ordem: Número crescente (1 → 480)</option>
              <option value="numero_desc">Ordem: Número decrescente (480 → 1)</option>
              <option value="dif_facil">Ordem: Mais Fáceis primeiro</option>
              <option value="dif_dificil">Ordem: Mais Difíceis primeiro</option>
              <option value="acidentes_asc">Ordem: Menos acidentes (0 → 7)</option>
              <option value="acidentes_desc">Ordem: Mais acidentes (7 → 0)</option>
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={onResetFiltros}
              title="Limpar filtros"
              className="p-2 sm:px-3 sm:py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Selects Grid (PrimeFaces Form Controls) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 text-xs">
        
        {/* Dificuldade */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Dificuldade
          </label>
          <select
            value={filtros.dificuldade}
            onChange={(e) => setFiltros((prev) => ({ ...prev, dificuldade: e.target.value }))}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="todas">Todas</option>
            <option value="Fácil">🟢 Fáceis</option>
            <option value="Médio">🟡 Médios</option>
            <option value="Difícil">🔴 Difíceis</option>
          </select>
        </div>

        {/* Acidentes no Instrumento */}
        <div>
          <label className="block text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 truncate" title={`Acidentes no ${instrumentoNome}`}>
            Acidentes ({instrumentoNome})
          </label>
          <select
            value={filtros.acidentes}
            onChange={(e) => setFiltros((prev) => ({ ...prev, acidentes: e.target.value }))}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-indigo-300 dark:border-indigo-500/40 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium"
          >
            <option value="todos">Todos (0 a 7)</option>
            <option value="0">0 acidentes (♮ Natural)</option>
            <option value="1">1 acidente</option>
            <option value="2">2 acidentes</option>
            <option value="3">3 acidentes</option>
            <option value="4+">4 ou mais acidentes</option>
            <option value="1b">1♭ (1 Bemol)</option>
            <option value="2b">2♭ (2 Bemóis)</option>
            <option value="3b">3♭ (3 Bemóis)</option>
            <option value="4b">4♭ (4 Bemóis)</option>
            <option value="1s">1♯ (1 Sustenido)</option>
            <option value="2s">2♯ (2 Sustenidos)</option>
            <option value="3s">3♯ (3 Sustenidos)</option>
          </select>
        </div>

        {/* Tipo de Armadura */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Tipo Armadura
          </label>
          <select
            value={filtros.tipoAcidente}
            onChange={(e) => setFiltros((prev) => ({ ...prev, tipoAcidente: e.target.value }))}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="todos">Todos</option>
            <option value="bemois">♭ Com Bemóis</option>
            <option value="sustenidos">♯ Com Sustenidos</option>
            <option value="natural">♮ Naturais (0)</option>
          </select>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Categoria
          </label>
          <select
            value={filtros.categoria}
            onChange={(e) => setFiltros((prev) => ({ ...prev, categoria: e.target.value }))}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="todas">Todas as categorias</option>
            <option value="culto">Culto Oficial (1 - 430)</option>
            <option value="jovens">Jovens e Menores (431 - 480)</option>
            <option value="meia_hora">Sugestão Meia-Hora</option>
            <option value="coros">Coros Avulsos (1 - 6)</option>
          </select>
        </div>

        {/* Status */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Meu Estudo
          </label>
          <select
            value={filtros.status}
            onChange={(e) => setFiltros((prev) => ({ ...prev, status: e.target.value }))}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="todos">Todos</option>
            <option value="aprendido">✅ Já Aprendi</option>
            <option value="nao_iniciado">⏳ Não Aprendidos</option>
          </select>
        </div>

      </div>

      {/* Counter summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
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
