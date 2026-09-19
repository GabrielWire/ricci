import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Music,
  CheckCircle2,
  Clock,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Loader2,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentMethodProgress } from '../../services/metodoService';
import { getMetodosConfigForInstrumento } from '../../data/metodosInstrumentosData';
import { resolveInstrumento } from '../../utils/instrumentUtils';
import type { AlunoMetodoProgressoDoc, MetodoOpcaoDef } from '../../types/metodo';

export const AlunoMetodo: React.FC = () => {
  const { userData, currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [progresso, setProgresso] = useState<AlunoMetodoProgressoDoc | null>(null);
  const [activeMetodoTab, setActiveMetodoTab] = useState<string>('');

  const inst = useMemo(() => {
    return resolveInstrumento(userData?.instrument);
  }, [userData?.instrument]);

  const metodosConfig = useMemo(() => {
    return getMetodosConfigForInstrumento(userData?.instrument);
  }, [userData?.instrument]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchMetodo = async () => {
      setLoading(true);
      try {
        const data = await getStudentMethodProgress(currentUser.uid);
        setProgresso(data);
        if (data?.metodoId) {
          setActiveMetodoTab(data.metodoId);
        } else if (metodosConfig.metodos.length > 0) {
          setActiveMetodoTab(metodosConfig.metodos[0].id);
        }
      } catch (err) {
        console.error('Erro ao buscar progresso de método:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetodo();
  }, [currentUser, metodosConfig]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Carregando plano de método do seu instrumento...</p>
      </div>
    );
  }

  // Selected method in view
  const currentOrSelectedMethod: MetodoOpcaoDef | undefined =
    metodosConfig.metodos.find((m) => m.id === (progresso?.metodoId || activeMetodoTab)) ||
    metodosConfig.metodos[0];

  const aptoRjm = !!progresso?.estagiosAptos?.rjm;
  const aptoCulto = !!progresso?.estagiosAptos?.culto;
  const aptoOficializacao = !!progresso?.estagiosAptos?.oficializacao;

  const getStageBadge = () => {
    if (aptoOficializacao) {
      return {
        label: 'Apto Oficialização',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
      };
    }
    if (aptoCulto) {
      return {
        label: 'Apto Culto Oficial',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      };
    }
    if (aptoRjm) {
      return {
        label: 'Apto RJM / Ensaio',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700',
      };
    }
    return {
      label: 'Iniciante',
      color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    };
  };

  const badge = getStageBadge();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                Método de Instrumento &bull; CCB Jan/2018
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {inst.nome} ({inst.afinacao})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Plano de Estudos do Instrumento
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Consulte a posição das suas lições de método e os critérios oficiais da CCB para tocar em Reunião de Jovens, Culto Oficial e Oficialização.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            <Link
              to="/aluno/msa"
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Ver Meu MSA</span>
            </Link>
            <Link
              to="/aluno/progresso"
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Meus Hinos</span>
            </Link>
          </div>
        </div>

        {/* Current Student Progress Highlight */}
        {progresso ? (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-slate-50 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-900 border border-purple-200/80 dark:border-purple-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Método em Andamento
                </span>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {progresso.metodoNome}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                <span>
                  Posição Atual: <strong className="font-bold text-purple-600 dark:text-purple-400">{progresso.posicaoAtual || 'Em início'}</strong>
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Atualizado em: {progresso.updatedAt?.toDate ? progresso.updatedAt.toDate().toLocaleDateString('pt-BR') : 'Recentemente'}
                </span>
              </div>
            </div>

            <div className="w-full md:w-64">
              <div className="flex justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Progresso Estimado</span>
                <span className="text-purple-600 dark:text-purple-400">{progresso.progressoPercent || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-300 dark:border-slate-700">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progresso.progressoPercent || 0}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">Nenhum método registrado pelo instrutor ainda</p>
              <p>
                Quando o seu professor avaliar e registrar sua lição atual no sistema, o seu progresso e notas pedagógicas aparecerão aqui.
                Abaixo você já pode consultar os métodos oficiais e as metas de lições do seu instrumento!
              </p>
            </div>
          </div>
        )}

        {/* Teacher Notes box (if present) */}
        {progresso?.observacoesInstrutor && (
          <div className="mt-3.5 p-3.5 sm:p-4 rounded-xl bg-purple-50/60 dark:bg-slate-850 border border-purple-200 dark:border-purple-800 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 dark:text-purple-300 mb-1">
              <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Orientações do Instrutor:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              "{progresso.observacoesInstrutor}"
            </p>
          </div>
        )}
      </div>

      {/* Official Stages Roadmap (CCB Jan/2018) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <span>Marcos de Aptidão para o Culto (CCB Jan/2018)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Metas de lições e hinário exigidas para cada etapa no seu instrumento:
            </p>
          </div>

          {/* Quick Method Selector if multiple options */}
          {metodosConfig.metodos.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold overflow-x-auto">
              {metodosConfig.metodos.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMetodoTab(m.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    (progresso?.metodoId || activeMetodoTab) === m.id
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {m.nome}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3 Milestone Cards */}
        {currentOrSelectedMethod && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. RJM / Ensaio */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                aptoRjm
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/70 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xl">🧒</span>
                  {aptoRjm ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Apto
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <Clock className="w-3 h-3" />
                      Em estudo
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. Reunião de Jovens / Ensaio
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Primeiro ingresso na orquestra
                </p>

                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-750 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Exigência no Método ({currentOrSelectedMethod.nome}):
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {currentOrSelectedMethod.exigencias.rjm.descricao}
                    </p>
                  </div>

                  {currentOrSelectedMethod.exigencias.rjm.observacao && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {currentOrSelectedMethod.exigencias.rjm.observacao}
                    </p>
                  )}

                  {metodosConfig.observacoesGerais?.rjm && (
                    <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-400 block">Hinário:</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {metodosConfig.observacoesGerais.rjm}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Culto Oficial */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                aptoCulto
                  ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/70 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xl">🏛️</span>
                  {aptoCulto ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Apto
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <Clock className="w-3 h-3" />
                      Pendente
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  2. Cultos Oficiais (Noite)
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Apto para tocar nos cultos de semana e domingo
                </p>

                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-750 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Exigência no Método ({currentOrSelectedMethod.nome}):
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {currentOrSelectedMethod.exigencias.culto.descricao}
                    </p>
                  </div>

                  {currentOrSelectedMethod.exigencias.culto.observacao && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {currentOrSelectedMethod.exigencias.culto.observacao}
                    </p>
                  )}

                  {metodosConfig.observacoesGerais?.culto && (
                    <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-400 block">Hinário:</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {metodosConfig.observacoesGerais.culto}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Oficialização */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                aptoOficializacao
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/70 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-xl">🎓</span>
                  {aptoOficializacao ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Apto
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      <Clock className="w-3 h-3" />
                      Pendente
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  3. Exame de Oficialização
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Oficializado na Congregação Cristã no Brasil
                </p>

                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-750 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Exigência no Método ({currentOrSelectedMethod.nome}):
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {currentOrSelectedMethod.exigencias.oficializacao.descricao}
                    </p>
                  </div>

                  {currentOrSelectedMethod.exigencias.oficializacao.observacao && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {currentOrSelectedMethod.exigencias.oficializacao.observacao}
                    </p>
                  )}

                  {metodosConfig.observacoesGerais?.oficializacao && (
                    <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-400 block">Hinário:</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {metodosConfig.observacoesGerais.oficializacao}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reference Catalog of Methods for this instrument */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Métodos Reconhecidos para {metodosConfig.instrumentoNome}
          </h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          De acordo com a resolução CCB Jan/2018, os seguintes métodos são aceitos para a evolução instrumental deste naipe:
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {metodosConfig.metodos.map((metodo, idx) => (
            <div key={metodo.id} className="py-4 first:pt-2 last:pb-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {metodo.nome}
                  </h4>
                  {metodo.subtitulo && (
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      &bull; {metodo.subtitulo}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-750">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">
                    RJM / Ensaio
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {metodo.exigencias.rjm.descricao}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-750">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block">
                    Culto Oficial
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {metodo.exigencias.culto.descricao}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-750">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                    Oficialização
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {metodo.exigencias.oficializacao.descricao}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
