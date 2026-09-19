import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Music, Search, Loader2, AlertCircle, Edit2, Save } from 'lucide-react';
import { getStudentById, getStudentProgressMap, updateHymnProgress, updateStudentProfile } from '../../services/studentService';
import type { UsuarioDoc, HinoProgressoDoc, StatusProgresso } from '../../types/auth';
import { HINOS_DATA } from '../../data/hinosData';
import { calcularTonalidadeInstrumento } from '../../data/instrumentsData';
import { resolveInstrumento, INSTRUMENTOS_CATEGORIZADOS } from '../../utils/instrumentUtils';

export const AlunoDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<UsuarioDoc | null>(null);
  const [progressMap, setProgressMap] = useState<Record<number, HinoProgressoDoc>>({});
  const [loading, setLoading] = useState(true);
  const [updatingHino, setUpdatingHino] = useState<number | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Edit instrument mode for teacher
  const [isEditingInstrument, setIsEditingInstrument] = useState(false);
  const [selectedInstOption, setSelectedInstOption] = useState('');
  const [savingInstrument, setSavingInstrument] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const studentData = await getStudentById(id);
        setStudent(studentData);
        if (studentData) {
          setSelectedInstOption(studentData.instrument);
          const map = await getStudentProgressMap(id);
          setProgressMap(map);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  // Resolves the actual instrument object with intelligent matching
  const instrumentoObj = useMemo(() => {
    return resolveInstrumento(student?.instrument);
  }, [student?.instrument]);

  const handleSaveInstrument = async () => {
    if (!student || !selectedInstOption) return;
    setSavingInstrument(true);
    try {
      await updateStudentProfile(student.uid, {
        name: student.name,
        phone: student.phone || '',
        instrument: selectedInstOption,
      });
      setStudent((prev) => prev ? { ...prev, instrument: selectedInstOption } : null);
      setIsEditingInstrument(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingInstrument(false);
    }
  };

  const handleUpdateStatus = async (hinoId: number, hinoName: string, newStatus: StatusProgresso, newProgress: number) => {
    if (!student) return;
    setUpdatingHino(hinoId);
    try {
      const stats = await updateHymnProgress(
        student.uid,
        hinoId,
        hinoName,
        newStatus,
        newProgress,
        progressMap
      );

      // Update local state
      setProgressMap((prev) => ({
        ...prev,
        [hinoId]: {
          hinoId,
          name: hinoName,
          status: newStatus,
          progress: newProgress,
          updatedAt: new Date().toISOString(),
        },
      }));

      // Update student metrics in header
      setStudent((prev) => prev ? {
        ...prev,
        hinosConcluidos: stats.hinosConcluidos,
        hinosEmProgresso: stats.hinosEmProgresso,
        progressoGeral: stats.progressoGeral,
      } : null);
    } catch (err) {
      console.error('Falha ao atualizar hino:', err);
    } finally {
      setUpdatingHino(null);
    }
  };

  const hinosFiltrados = useMemo(() => {
    return HINOS_DATA.filter((h) => {
      if (h.numero > 480) return false;

      if (busca.trim()) {
        const q = busca.toLowerCase();
        const matchesNum = h.numero.toString().includes(q);
        const matchesName = h.titulo.toLowerCase().includes(q);
        if (!matchesNum && !matchesName) return false;
      }

      if (filtroStatus !== 'todos') {
        const currentProg = progressMap[h.numero];
        const status = currentProg?.status || 'Não iniciado';
        if (filtroStatus === 'concluido' && status !== 'Concluído') return false;
        if (filtroStatus === 'em_progresso' && status !== 'Em progresso' && status !== 'Em aprendizado') return false;
        if (filtroStatus === 'nao_iniciado' && status !== 'Não iniciado') return false;
      }

      return true;
    });
  }, [busca, filtroStatus, progressMap]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Carregando ficha e hinos do aluno...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Aluno não encontrado</h2>
        <p className="text-xs text-slate-400 mt-1">O ID do aluno fornecido não existe ou foi removido.</p>
        <Link
          to="/admin/alunos"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/admin/alunos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para lista de alunos</span>
        </Link>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-sm">
              {student.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {student.name}
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold">
                  Ativo
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {student.email} {student.phone ? `• ${student.phone}` : ''}
              </p>
            </div>
          </div>

          {/* Instrument Selector / Badge */}
          <div className="flex items-center gap-2">
            {isEditingInstrument ? (
              <div className="flex items-center gap-2">
                <select
                  value={selectedInstOption}
                  onChange={(e) => setSelectedInstOption(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-indigo-400 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
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
                <button
                  onClick={handleSaveInstrument}
                  disabled={savingInstrument}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {savingInstrument ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Salvar</span>
                </button>
                <button
                  onClick={() => setIsEditingInstrument(false)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <Music className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      {instrumentoObj.nome}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {instrumentoObj.afinacao} &bull; {instrumentoObj.hinario}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedInstOption(student.instrument);
                    setIsEditingInstrument(true);
                  }}
                  title="Alterar instrumento oficial do aluno"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Progresso Geral</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">
              {student.progressoGeral || 0}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">Concluídos</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {student.hinosConcluidos || 0} <span className="text-xs text-slate-400 font-normal">/ 480</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60">
            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">Em Progresso</span>
            <span className="text-2xl font-black text-amber-500 dark:text-amber-400 font-mono mt-0.5 block">
              {student.hinosEmProgresso || 0}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Não Iniciados</span>
            <span className="text-2xl font-black text-slate-600 dark:text-slate-400 font-mono mt-0.5 block">
              {480 - ((student.hinosConcluidos || 0) + (student.hinosEmProgresso || 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Hymns Management Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por número ou título do hino..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
            >
              <option value="todos">Todos os status</option>
              <option value="concluido">Concluídos</option>
              <option value="em_progresso">Em progresso</option>
              <option value="nao_iniciado">Não iniciados</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 sm:px-6 w-20">Nº</th>
                <th className="py-3 px-4">Título do Hino</th>
                <th className="py-3 px-4">Tom ({instrumentoObj.nome})</th>
                <th className="py-3 px-4">Dificuldade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Progresso</th>
                <th className="py-3 px-4 text-right">Ação Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {hinosFiltrados.slice(0, 100).map((hino) => {
                const progDoc = progressMap[hino.numero];
                const status = progDoc?.status || 'Não iniciado';
                const progress = progDoc?.progress || 0;
                const isUpdating = updatingHino === hino.numero;
                const trans = calcularTonalidadeInstrumento(hino.acidentes, instrumentoObj);

                return (
                  <tr key={hino.numero} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors">
                    <td className="py-3 px-4 sm:px-6 font-mono font-black text-indigo-700 dark:text-indigo-400">
                      {hino.numeroExibicao || hino.numero}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {hino.titulo}
                    </td>

                    <td className="py-3 px-4 font-mono text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{trans.tonalidade}</span>
                      <span className="text-[10px] text-slate-400 ml-1">({trans.armadura === '0' ? '0♮' : trans.armadura})</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        hino.dificuldadeInteiro === 'Fácil' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                        hino.dificuldadeInteiro === 'Médio' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' :
                        'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}>
                        {hino.dificuldadeInteiro}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={status}
                        disabled={isUpdating}
                        onChange={(e) => {
                          const nextStat = e.target.value as StatusProgresso;
                          const nextProg = nextStat === 'Concluído' ? 100 : nextStat === 'Não iniciado' ? 0 : 50;
                          handleUpdateStatus(hino.numero, hino.titulo, nextStat, nextProg);
                        }}
                        className="px-2 py-1 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        <option value="Não iniciado">Não iniciado</option>
                        <option value="Em aprendizado">Em aprendizado</option>
                        <option value="Em progresso">Em progresso</option>
                        <option value="Concluído">Concluído</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={progress}
                          disabled={isUpdating}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const nextStat: StatusProgresso = val === 100 ? 'Concluído' : val === 0 ? 'Não iniciado' : 'Em progresso';
                            handleUpdateStatus(hino.numero, hino.titulo, nextStat, val);
                          }}
                          className="w-20 accent-indigo-600 cursor-pointer"
                        />
                        <span className="font-mono text-[11px] font-bold w-9 text-right text-slate-700 dark:text-slate-300">
                          {progress}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          const isDone = status === 'Concluído';
                          handleUpdateStatus(
                            hino.numero,
                            hino.titulo,
                            isDone ? 'Não iniciado' : 'Concluído',
                            isDone ? 0 : 100
                          );
                        }}
                        disabled={isUpdating}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          status === 'Concluído'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-rose-100 hover:text-rose-700'
                            : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        {status === 'Concluído' ? 'Desmarcar' : 'Concluir'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
