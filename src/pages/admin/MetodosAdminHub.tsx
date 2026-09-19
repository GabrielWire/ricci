import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Music,
  Users,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Loader2,
  Layers,
  Info,
} from 'lucide-react';
import { listStudents } from '../../services/studentService';
import { INSTRUMENTOS_CATEGORIZADOS, resolveInstrumento } from '../../utils/instrumentUtils';
import { METODOS_INSTRUMENTOS_CONFIG } from '../../data/metodosInstrumentosData';
import type { UsuarioDoc } from '../../types/auth';

export const MetodosAdminHub: React.FC = () => {
  const [students, setStudents] = useState<UsuarioDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [busca, setBusca] = useState('');
  const [filtroInstrumento, setFiltroInstrumento] = useState('todos');
  const [filtroEstagio, setFiltroEstagio] = useState('todos');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'instrumento' | 'progresso_desc' | 'estagio'>('estagio');

  // Accordion for official reference rules
  const [showRulesAccordion, setShowRulesAccordion] = useState(false);
  const [selectedRuleInstrument, setSelectedRuleInstrument] = useState('saxofone');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await listStudents();
      setStudents(data);
    } catch (err) {
      console.error('Falha ao listar alunos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Metrics
  const totalAlunos = students.length;
  const aptosRjm = useMemo(
    () => students.filter((s) => s.metodoEstagioApto && s.metodoEstagioApto !== 'Iniciante').length,
    [students]
  );
  const aptosCulto = useMemo(
    () =>
      students.filter(
        (s) => s.metodoEstagioApto === 'Apto Culto Oficial' || s.metodoEstagioApto === 'Apto Oficialização'
      ).length,
    [students]
  );
  const aptosOficializacao = useMemo(
    () => students.filter((s) => s.metodoEstagioApto === 'Apto Oficialização').length,
    [students]
  );

  // Filtered and sorted students
  const alunosFiltrados = useMemo(() => {
    return students
      .filter((aluno) => {
        if (busca.trim()) {
          const q = busca.toLowerCase();
          const matchName = aluno.name?.toLowerCase().includes(q);
          const matchEmail = aluno.email?.toLowerCase().includes(q);
          const matchMetodo = aluno.metodoNome?.toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchMetodo) return false;
        }

        if (filtroInstrumento !== 'todos') {
          const alunoInst = resolveInstrumento(aluno.instrument);
          const targetInst = resolveInstrumento(filtroInstrumento);
          if (alunoInst.id !== targetInst.id) return false;
        }

        if (filtroEstagio !== 'todos') {
          const stage = aluno.metodoEstagioApto || 'Iniciante';
          if (filtroEstagio === 'iniciante' && stage !== 'Iniciante') return false;
          if (filtroEstagio === 'rjm' && stage !== 'Apto RJM / Ensaio') return false;
          if (filtroEstagio === 'culto' && stage !== 'Apto Culto Oficial') return false;
          if (filtroEstagio === 'oficializacao' && stage !== 'Apto Oficialização') return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (ordenacao === 'nome') return a.name.localeCompare(b.name);
        if (ordenacao === 'instrumento') return (a.instrument || '').localeCompare(b.instrument || '');
        if (ordenacao === 'progresso_desc') return (b.metodoProgresso || 0) - (a.metodoProgresso || 0);
        if (ordenacao === 'estagio') {
          const rank = (s?: string) => {
            if (s === 'Apto Oficialização') return 4;
            if (s === 'Apto Culto Oficial') return 3;
            if (s === 'Apto RJM / Ensaio') return 2;
            return 1;
          };
          return rank(b.metodoEstagioApto) - rank(a.metodoEstagioApto);
        }
        return 0;
      });
  }, [students, busca, filtroInstrumento, filtroEstagio, ordenacao]);

  const activeRuleConfig = METODOS_INSTRUMENTOS_CONFIG[selectedRuleInstrument] || METODOS_INSTRUMENTOS_CONFIG.saxofone;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1 uppercase tracking-wider">
              <Music className="w-3 h-3" />
              Circular CCB Jan/2018
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Métodos de Instrumentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Acompanhe o método específico de cada instrumento e a aptidão dos alunos para Ensaio, Reunião de Jovens, Culto Oficial e Oficialização.
          </p>
        </div>

        <button
          onClick={() => setShowRulesAccordion(!showRulesAccordion)}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer self-start sm:self-auto border border-slate-300 dark:border-slate-700"
        >
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{showRulesAccordion ? 'Ocultar Tabela CCB' : 'Consultar Tabela CCB 2018'}</span>
        </button>
      </div>

      {/* Official CCB Guidelines Reference Accordion */}
      {showRulesAccordion && (
        <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Tabela Oficial CCB: Sugestão de Métodos e Requisitos Mínimos</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Critérios estabelecidos para ingresso nos cultos e testes de oficialização.
              </p>
            </div>

            <select
              value={selectedRuleInstrument}
              onChange={(e) => setSelectedRuleInstrument(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-900 dark:text-white cursor-pointer shadow-2xs"
            >
              {Object.entries(METODOS_INSTRUMENTOS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">
                  {cfg.instrumentoNome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* RJM Box */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                  🧒 Reuniões de Jovens / Ensaio
                </span>
                <div className="space-y-1.5 text-xs text-amber-950 dark:text-amber-200">
                  {activeRuleConfig.metodos.map((m) => (
                    <div key={m.id} className="pb-1.5 border-b border-amber-200/60 dark:border-amber-900/60 last:border-0">
                      <strong className="block text-slate-800 dark:text-white">{m.nome}:</strong>
                      <span className="text-[11px]">{m.exigencias.rjm.descricao}</span>
                    </div>
                  ))}
                  {activeRuleConfig.observacoesGerais?.rjm && (
                    <p className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold pt-1">
                      Obs.: {activeRuleConfig.observacoesGerais.rjm}
                    </p>
                  )}
                </div>
              </div>

              {/* Cultos Oficiais Box */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-400 block">
                  🏛️ Cultos Oficiais (Noite)
                </span>
                <div className="space-y-1.5 text-xs text-indigo-950 dark:text-indigo-200">
                  {activeRuleConfig.metodos.map((m) => (
                    <div key={m.id} className="pb-1.5 border-b border-indigo-200/60 dark:border-indigo-900/60 last:border-0">
                      <strong className="block text-slate-800 dark:text-white">{m.nome}:</strong>
                      <span className="text-[11px]">{m.exigencias.culto.descricao}</span>
                    </div>
                  ))}
                  {activeRuleConfig.observacoesGerais?.culto && (
                    <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold pt-1">
                      Obs.: {activeRuleConfig.observacoesGerais.culto}
                    </p>
                  )}
                </div>
              </div>

              {/* Oficializacao Box */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                  🎓 Oficialização
                </span>
                <div className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200">
                  {activeRuleConfig.metodos.map((m) => (
                    <div key={m.id} className="pb-1.5 border-b border-emerald-200/60 dark:border-emerald-900/60 last:border-0">
                      <strong className="block text-slate-800 dark:text-white">{m.nome}:</strong>
                      <span className="text-[11px]">{m.exigencias.oficializacao.descricao}</span>
                    </div>
                  ))}
                  {activeRuleConfig.observacoesGerais?.oficializacao && (
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold pt-1">
                      Obs.: {activeRuleConfig.observacoesGerais.oficializacao}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total de Alunos</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
              {totalAlunos}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Candidatos cadastrados</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Aptos para RJM</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-500 font-mono mt-1 block">
              {aptosRjm}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Reunião de Jovens / Ensaio</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Aptos Cultos Oficiais</span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1 block">
              {aptosCulto}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Cultos da noite</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Aptos Oficialização</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
              {aptosOficializacao}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Prontos para o exame</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do aluno ou método..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        {/* Instrument Filter */}
        <select
          value={filtroInstrumento}
          onChange={(e) => setFiltroInstrumento(e.target.value)}
          className="w-full md:w-52 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm text-slate-900 dark:text-white font-medium cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-2xs"
        >
          <option value="todos" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Todos os instrumentos</option>
          {INSTRUMENTOS_CATEGORIZADOS.map((cat) => (
            <optgroup key={cat.categoria} label={`── ${cat.categoria} ──`} className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold">
              {cat.itens.map((item) => (
                <option key={item.id} value={item.nomeExibicao} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">
                  {item.nomeExibicao}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Stage Filter */}
        <select
          value={filtroEstagio}
          onChange={(e) => setFiltroEstagio(e.target.value)}
          className="w-full md:w-44 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm text-slate-900 dark:text-white font-medium cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-2xs"
        >
          <option value="todos" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Todos os estágios</option>
          <option value="iniciante" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">⚪ Iniciante</option>
          <option value="rjm" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">🟡 Apto RJM / Ensaio</option>
          <option value="culto" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">🔵 Apto Culto Oficial</option>
          <option value="oficializacao" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">🟢 Apto Oficialização</option>
        </select>

        {/* Sort */}
        <select
          value={ordenacao}
          onChange={(e) => setOrdenacao(e.target.value as any)}
          className="w-full md:w-44 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm text-slate-900 dark:text-white font-medium cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-2xs"
        >
          <option value="estagio" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Por Estágio Apto</option>
          <option value="nome" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Nome Alfabético</option>
          <option value="instrumento" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Por Instrumento</option>
          <option value="progresso_desc" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Maior Progresso</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Carregando acompanhamento de métodos...</p>
          </div>
        ) : alunosFiltrados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 sm:px-6">Aluno</th>
                  <th className="py-3.5 px-4">Instrumento</th>
                  <th className="py-3.5 px-4">Método em Estudo</th>
                  <th className="py-3.5 px-4">Posição Atual</th>
                  <th className="py-3.5 px-4">Estágio de Aptidão</th>
                  <th className="py-3.5 px-4 text-center">Progresso</th>
                  <th className="py-3.5 px-4 text-right">Ação Pedagógica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {alunosFiltrados.map((aluno) => {
                  const inst = resolveInstrumento(aluno.instrument);
                  const metodoNome = aluno.metodoNome || 'Não definido';
                  const metodoPos = aluno.metodoPosicao || 'Página 1';
                  const estagio = aluno.metodoEstagioApto || 'Iniciante';
                  const progress = aluno.metodoProgresso || 0;

                  return (
                    <tr key={aluno.uid} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {aluno.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">
                              {aluno.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                              {aluno.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          <Music className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          {inst.nome}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {metodoNome}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {metodoPos}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            estagio === 'Apto Oficialização'
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : estagio === 'Apto Culto Oficial'
                              ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                              : estagio === 'Apto RJM / Ensaio'
                              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {estagio === 'Apto Oficialização'
                            ? '🟢 Oficialização'
                            : estagio === 'Apto Culto Oficial'
                            ? '🔵 Culto Oficial'
                            : estagio === 'Apto RJM / Ensaio'
                            ? '🟡 RJM / Ensaio'
                            : '⚪ Iniciante'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="max-w-[120px] mx-auto">
                          <div className="flex justify-between text-[11px] font-mono font-bold mb-1 text-slate-700 dark:text-slate-300">
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/alunos/${aluno.uid}?tab=metodo`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <span>Avaliar Método</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum aluno encontrado</p>
            <p className="text-xs text-slate-400 mt-1">Ajuste os filtros de busca para visualizar candidatos.</p>
          </div>
        )}
      </div>
    </div>
  );
};
