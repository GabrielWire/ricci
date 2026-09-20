import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  GraduationCap,
  ShieldCheck,
  Music,
  Check,
  Edit2,
  Filter,
} from 'lucide-react';
import {
  listTeachers,
  createTeacherByAdmin,
  deleteTeacherByAdmin,
  updateInstructorInstruments,
} from '../../services/teacherService';
import type { UsuarioDoc } from '../../types/auth';
import {
  INSTRUMENTOS_CATEGORIZADOS,
  TODOS_INSTRUMENTOS_OFICIAIS,
  isInstrutorHabilitadoParaInstrumento,
} from '../../utils/instrumentUtils';

export const InstrutoresList: React.FC = () => {
  const [instructors, setInstructors] = useState<UsuarioDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroInstrumento, setFiltroInstrumento] = useState<string>('todos');

  // Modal: Novo Instrutor
  const [modalOpen, setModalOpen] = useState(false);
  const [cadastrando, setCadastrando] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  // Form: Novo Instrutor
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novaSenha, setNovaSenha] = useState('ccb123456');
  const [novosInstrumentos, setNovosInstrumentos] = useState<string[]>([]);

  // Modal: Editar Instrumentos Aptos
  const [editingInstructor, setEditingInstructor] = useState<UsuarioDoc | null>(null);
  const [editandoInstrumentos, setEditandoInstrumentos] = useState<string[]>([]);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');

  // Feedback geral
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const data = await listTeachers();
      setInstructors(data);
    } catch (err: any) {
      console.error('Falha ao listar instrutores:', err);
      setFeedback({ type: 'error', text: 'Falha ao carregar lista de instrutores.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  // Alterna a seleção de um instrumento na lista
  const toggleInstrumento = (
    nomeInstrumento: string,
    state: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (state.includes(nomeInstrumento)) {
      setter(state.filter((i) => i !== nomeInstrumento));
    } else {
      setter([...state, nomeInstrumento]);
    }
  };

  // Atalhos rápidos para famílias
  const selecionarFamilia = (
    categoriaNome: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const cat = INSTRUMENTOS_CATEGORIZADOS.find((c) => c.categoria === categoriaNome);
    if (!cat) return;
    const nomes = cat.itens.map((i) => i.nomeExibicao);
    setter((prev) => Array.from(new Set([...prev, ...nomes])));
  };

  const selecionarTodos = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter([...TODOS_INSTRUMENTOS_OFICIAIS]);
  };

  const limparSelecao = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter([]);
  };

  const handleCadastrarInstrutor = async (e: React.FormEvent) => {
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
      await createTeacherByAdmin({
        name: novoNome.trim(),
        email: novoEmail.trim(),
        phone: novoTelefone.trim(),
        instruments: novosInstrumentos,
        initialPassword: novaSenha,
      });

      setModalSuccess(`Instrutor ${novoNome} cadastrado com sucesso!`);
      setNovoNome('');
      setNovoEmail('');
      setNovoTelefone('');
      setNovaSenha('ccb123456');
      setNovosInstrumentos([]);

      await fetchInstructors();

      setTimeout(() => {
        setModalSuccess('');
        setModalOpen(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setModalError('Este e-mail já está cadastrado no sistema.');
      } else if (err.code === 'auth/invalid-email') {
        setModalError('Formato de e-mail inválido.');
      } else {
        setModalError(err.message || 'Falha ao cadastrar instrutor.');
      }
    } finally {
      setCadastrando(false);
    }
  };

  const handleOpenEditInstruments = (instructor: UsuarioDoc) => {
    setEditingInstructor(instructor);
    setEditandoInstrumentos(instructor.instruments || []);
    setEditSuccess('');
  };

  const handleSaveEditInstruments = async () => {
    if (!editingInstructor) return;
    setSalvandoEdicao(true);
    try {
      await updateInstructorInstruments(editingInstructor.uid, editandoInstrumentos);
      setEditSuccess('Instrumentos atualizados com sucesso!');
      await fetchInstructors();
      setTimeout(() => {
        setEditSuccess('');
        setEditingInstructor(null);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Falha ao atualizar instrumentos do instrutor.' });
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const handleDeleteInstructor = async (instructor: UsuarioDoc) => {
    if (!confirm(`Tem certeza que deseja remover o instrutor "${instructor.name}"?`)) return;

    try {
      await deleteTeacherByAdmin(instructor.uid);
      setFeedback({ type: 'success', text: `Instrutor "${instructor.name}" removido com sucesso.` });
      await fetchInstructors();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Erro ao remover instrutor: ' + (err?.message || 'Erro') });
    }
  };

  const instrutoresFiltrados = useMemo(() => {
    return instructors.filter((inst) => {
      // Busca textual
      if (busca.trim()) {
        const q = busca.toLowerCase();
        const matchText =
          inst.name?.toLowerCase().includes(q) ||
          inst.email?.toLowerCase().includes(q) ||
          inst.phone?.includes(q) ||
          (inst.instruments && inst.instruments.some((i) => i.toLowerCase().includes(q)));
        if (!matchText) return false;
      }

      // Filtro por Instrumento
      if (filtroInstrumento !== 'todos') {
        return isInstrutorHabilitadoParaInstrumento(inst, filtroInstrumento);
      }

      return true;
    });
  }, [instructors, busca, filtroInstrumento]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1 uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              Apenas Administradores
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Gestão de Instrutores
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cadastre os instrutores e configure em quais instrumentos cada um é apto a lecionar e acompanhar alunos.
          </p>
        </div>

        <button
          onClick={() => {
            setModalError('');
            setModalSuccess('');
            setNovosInstrumentos([]);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Instrutor</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Search & Instrument Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar instrutor por nome, e-mail ou instrumento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filtroInstrumento}
            onChange={(e) => setFiltroInstrumento(e.target.value)}
            className="w-full md:w-64 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-medium cursor-pointer"
          >
            <option value="todos">Todos os Instrumentos Aptos</option>
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
      </div>

      {/* Instructors Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Carregando lista de instrutores...</p>
          </div>
        ) : instrutoresFiltrados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 sm:px-6">Instrutor</th>
                  <th className="py-3.5 px-4">Contato</th>
                  <th className="py-3.5 px-4">Instrumentos Aptos para Aula</th>
                  <th className="py-3.5 px-4">Perfil</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {instrutoresFiltrados.map((teacher) => {
                  const instList = teacher.instruments || [];
                  return (
                    <tr
                      key={teacher.uid}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                            {teacher.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">
                              {teacher.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                              {teacher.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {teacher.phone ? (
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{teacher.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Não informado</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {instList.length > 0 ? (
                            <>
                              {instList.slice(0, 3).map((inst, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60"
                                >
                                  <Music className="w-2.5 h-2.5 shrink-0" />
                                  <span>{inst.split('(')[0].trim()}</span>
                                </span>
                              ))}
                              {instList.length > 3 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  +{instList.length - 3} mais
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Todos os Instrumentos
                            </span>
                          )}

                          <button
                            onClick={() => handleOpenEditInstruments(teacher)}
                            title="Editar instrumentos aptos deste instrutor"
                            className="p-1 rounded-md text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <GraduationCap className="w-3 h-3" />
                          Instrutor
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditInstruments(teacher)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                            title="Editar Instrumentos Aptos"
                          >
                            <Music className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInstructor(teacher)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Remover Instrutor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum instrutor encontrado</p>
            <p className="text-xs text-slate-400 mt-1">
              {busca || filtroInstrumento !== 'todos'
                ? 'Tente ajustar os termos de busca ou o filtro de instrumento.'
                : 'Clique no botão acima para cadastrar o primeiro instrutor.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal: Cadastrar Novo Instrutor */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-scaleIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Novo Instrutor</h3>
                  <p className="text-[11px] text-slate-400">Acesso pedagógico ao portal CCB Música</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCadastrarInstrutor} className="p-5 space-y-4 text-xs sm:text-sm overflow-y-auto">
              {modalError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {modalSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome Completo do Instrutor *
                  </label>
                  <input
                    type="text"
                    required
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Irmão Silva"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail de Acesso (Login) *
                  </label>
                  <input
                    type="email"
                    required
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    placeholder="instrutor@exemplo.com"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telefone / WhatsApp (opcional)
                  </label>
                  <input
                    type="tel"
                    value={novoTelefone}
                    onChange={(e) => setNovoTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Senha Inicial de Acesso *
                  </label>
                  <input
                    type="text"
                    required
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Seletor Multi-Instrumento Aptos */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-bold text-slate-900 dark:text-white">
                      Instrumentos em que é Apto para Dar Aula
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Selecione um ou mais instrumentos que este instrutor leciona na CCB.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0 self-start sm:self-auto">
                    {novosInstrumentos.length} selecionado(s)
                  </span>
                </div>

                {/* Atalhos Rápidos */}
                <div className="flex flex-wrap gap-1.5 pb-2">
                  <button
                    type="button"
                    onClick={() => selecionarFamilia('Cordas e Teclados', setNovosInstrumentos)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    + Cordas/Teclados
                  </button>
                  <button
                    type="button"
                    onClick={() => selecionarFamilia('Madeiras', setNovosInstrumentos)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    + Madeiras
                  </button>
                  <button
                    type="button"
                    onClick={() => selecionarFamilia('Metais', setNovosInstrumentos)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    + Metais
                  </button>
                  <button
                    type="button"
                    onClick={() => selecionarTodos(setNovosInstrumentos)}
                    className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 cursor-pointer"
                  >
                    Marcar Todos
                  </button>
                  {novosInstrumentos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => limparSelecao(setNovosInstrumentos)}
                      className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-[11px] font-semibold text-rose-700 dark:text-rose-400 cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Grade de Instrumentos Categorizados */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 max-h-56 overflow-y-auto">
                  {INSTRUMENTOS_CATEGORIZADOS.map((cat) => (
                    <div key={cat.categoria} className="space-y-1.5">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        {cat.categoria}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {cat.itens.map((item) => {
                          const isSelected = novosInstrumentos.includes(item.nomeExibicao);
                          return (
                            <button
                              type="button"
                              key={item.id}
                              onClick={() => toggleInstrumento(item.nomeExibicao, novosInstrumentos, setNovosInstrumentos)}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                              }`}
                            >
                              <span>{item.nomeExibicao}</span>
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 shrink-0 ml-1.5 text-white" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cadastrando}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {cadastrando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Criar Instrutor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Instrumentos Aptos */}
      {editingInstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-scaleIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Instrumentos de {editingInstructor.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">Marque os instrumentos em que o instrutor é apto a lecionar</p>
                </div>
              </div>
              <button
                onClick={() => setEditingInstructor(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto">
              {editSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}

              {/* Atalhos Rápidos */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => selecionarFamilia('Cordas e Teclados', setEditandoInstrumentos)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    + Cordas
                  </button>
                  <button
                    type="button"
                    onClick={() => selecionarFamilia('Madeiras', setEditandoInstrumentos)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    + Madeiras
                  </button>
                  <button
                    type="button"
                    onClick={() => selecionarFamilia('Metais', setEditandoInstrumentos)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    + Metais
                  </button>
                  <button
                    type="button"
                    onClick={() => selecionarTodos(setEditandoInstrumentos)}
                    className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 cursor-pointer"
                  >
                    Marcar Todos
                  </button>
                </div>

                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {editandoInstrumentos.length} selecionado(s)
                </span>
              </div>

              {/* Lista dos Instrumentos Categorizados */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 max-h-72 overflow-y-auto">
                {INSTRUMENTOS_CATEGORIZADOS.map((cat) => (
                  <div key={cat.categoria} className="space-y-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      {cat.categoria}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {cat.itens.map((item) => {
                        const isSelected = editandoInstrumentos.includes(item.nomeExibicao);
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => toggleInstrumento(item.nomeExibicao, editandoInstrumentos, setEditandoInstrumentos)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                            }`}
                          >
                            <span>{item.nomeExibicao}</span>
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 shrink-0 ml-1.5 text-white" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingInstructor(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditInstruments}
                disabled={salvandoEdicao}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                {salvandoEdicao ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Salvar Instrumentos</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
