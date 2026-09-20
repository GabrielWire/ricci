import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Music,
  Phone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Loader2,
} from 'lucide-react';
import { listStudents, createStudentByAdmin } from '../../services/studentService';
import { INSTRUMENTOS_CATEGORIZADOS, resolveInstrumento } from '../../utils/instrumentUtils';
import type { UsuarioDoc } from '../../types/auth';

export const AlunosList: React.FC = () => {
  const [students, setStudents] = useState<UsuarioDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroInstrumento, setFiltroInstrumento] = useState('todos');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'progresso_desc' | 'progresso_asc'>('nome');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [cadastrando, setCadastrando] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Form State
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoInstrumento, setNovoInstrumento] = useState('Saxofone Alto (Mi♭)');
  const [novaSenha, setNovaSenha] = useState('ccb123456');

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

  const handleCadastrarAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!novoNome.trim() || !novoEmail.trim() || !novaSenha.trim()) {
      setModalError('Preencha os campos obrigatórios (Nome, E-mail e Senha).');
      return;
    }

    if (novaSenha.length < 6) {
      setModalError('A senha inicial deve ter no mínimo 6 caracteres.');
      return;
    }

    setCadastrando(true);
    try {
      await createStudentByAdmin({
        name: novoNome.trim(),
        email: novoEmail.trim(),
        phone: novoTelefone.trim(),
        instrument: novoInstrumento,
        initialPassword: novaSenha,
      });

      setModalSuccess(`Aluno ${novoNome} cadastrado com sucesso!`);
      setNovoNome('');
      setNovoEmail('');
      setNovoTelefone('');
      setNovaSenha('ccb123456');

      await fetchStudents();

      setTimeout(() => {
        setModalSuccess('');
        setModalOpen(false);
      }, 1800);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setModalError('Este e-mail já está cadastrado no sistema.');
      } else if (err.code === 'auth/invalid-email') {
        setModalError('Formato de e-mail inválido.');
      } else {
        setModalError(err.message || 'Falha ao cadastrar aluno.');
      }
    } finally {
      setCadastrando(false);
    }
  };

  // Filtered and Sorted Students
  const alunosFiltrados = useMemo(() => {
    return students
      .filter((aluno) => {
        if (busca.trim()) {
          const q = busca.toLowerCase();
          const matchName = aluno.name?.toLowerCase().includes(q);
          const matchEmail = aluno.email?.toLowerCase().includes(q);
          if (!matchName && !matchEmail) return false;
        }

        if (filtroInstrumento !== 'todos') {
          const alunoInst = resolveInstrumento(aluno.instrument);
          const targetInst = resolveInstrumento(filtroInstrumento);
          if (alunoInst.id !== targetInst.id) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (ordenacao === 'nome') return a.name.localeCompare(b.name);
        if (ordenacao === 'progresso_desc') return (b.progressoGeral || 0) - (a.progressoGeral || 0);
        if (ordenacao === 'progresso_asc') return (a.progressoGeral || 0) - (b.progressoGeral || 0);
        return 0;
      });
  }, [students, busca, filtroInstrumento, ordenacao]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Alunos Cadastrados
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerencie candidatos da orquestra, instrumentos e acompanhe o progresso no Hinário 5.
          </p>
        </div>

        <button
          onClick={() => {
            setModalError('');
            setModalSuccess('');
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Aluno</span>
        </button>
      </div>

      {/* PrimeFaces Toolbar / Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar aluno por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          />
        </div>

        {/* Filter by Instrument with Categories */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filtroInstrumento}
            onChange={(e) => setFiltroInstrumento(e.target.value)}
            className="w-full md:w-56 px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer font-medium"
          >
            <option value="todos">Todos os instrumentos</option>
            {INSTRUMENTOS_CATEGORIZADOS.map((cat) => (
              <optgroup key={cat.categoria} label={`── ${cat.categoria} ──`}>
                {cat.itens.map((item) => (
                  <option key={item.id} value={item.nomeExibicao}>
                    {item.nomeExibicao}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Sort */}
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as any)}
            className="w-full md:w-44 px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer font-medium"
          >
            <option value="nome">Ordem Alfabética</option>
            <option value="progresso_desc">Maior Progresso</option>
            <option value="progresso_asc">Menor Progresso</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Carregando lista de alunos...</p>
          </div>
        ) : alunosFiltrados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 sm:px-6">Aluno</th>
                  <th className="py-3.5 px-4">Instrumento Oficial</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Contato</th>
                  <th className="py-3.5 px-4 text-center">Progresso</th>
                  <th className="py-3.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {alunosFiltrados.map((aluno) => {
                  const inst = resolveInstrumento(aluno.instrument);
                  return (
                    <tr key={aluno.uid} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
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
                        <div className="inline-flex flex-col">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                            <Music className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                            {inst.nome}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 ml-1">
                            Afinação: {inst.afinacao} &bull; {inst.hinario}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-600 dark:text-slate-300 text-xs">
                        {aluno.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {aluno.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Não informado</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="max-w-[140px] mx-auto">
                          <div className="flex justify-between text-[11px] font-mono font-bold mb-1 text-slate-700 dark:text-slate-300">
                            <span>{aluno.hinosConcluidos || 0}/480</span>
                            <span>{aluno.progressoGeral || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all"
                              style={{ width: `${aluno.progressoGeral || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/alunos/${aluno.uid}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer"
                        >
                          <span>Gerenciar</span>
                          <ExternalLink className="w-3 h-3" />
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
            <p className="text-xs text-slate-400 mt-1">Ajuste os filtros ou cadastre um novo candidato.</p>
          </div>
        )}
      </div>

      {/* Modal: Cadastrar Novo Aluno */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Cadastrar Novo Aluno</h3>
                  <p className="text-xs text-slate-500">Cria o acesso para o candidato estudar o Hinário 5</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCadastrarAluno} className="p-5 sm:p-6 space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {modalSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Gabriel Silva"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail (Login) *
                  </label>
                  <input
                    type="email"
                    required
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    placeholder="aluno@email.com"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={novoTelefone}
                    onChange={(e) => setNovoTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instrumento Oficial com Tonalidade *
                  </label>
                  <select
                    value={novoInstrumento}
                    onChange={(e) => setNovoInstrumento(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
                  >
                    {INSTRUMENTOS_CATEGORIZADOS.map((cat) => (
                      <optgroup key={cat.categoria} label={`── ${cat.categoria} ──`}>
                        {cat.itens.map((item) => (
                          <option key={item.id} value={item.nomeExibicao}>
                            {item.nomeExibicao}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Senha Inicial *
                  </label>
                  <input
                    type="text"
                    required
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cadastrando}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {cadastrando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Salvar e Criar Aluno</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
