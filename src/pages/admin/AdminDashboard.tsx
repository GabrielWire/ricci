import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, CheckCircle2, TrendingUp, UserPlus, ArrowRight, Music, Loader2 } from 'lucide-react';
import { listStudents } from '../../services/studentService';
import type { UsuarioDoc } from '../../types/auth';

export const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<UsuarioDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const list = await listStudents();
        setStudents(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalAlunos = students.length;
  const alunosAtivos = students.filter((s) => s.progressoGeral > 0 || s.hinosEmProgresso > 0).length;
  const totalHinosEmProgresso = students.reduce((acc, s) => acc + (s.hinosEmProgresso || 0), 0);
  const totalHinosConcluidos = students.reduce((acc, s) => acc + (s.hinosConcluidos || 0), 0);

  // Top 5 students with highest progress
  const destaques = [...students].sort((a, b) => b.progressoGeral - a.progressoGeral).slice(0, 5);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Carregando painel de gestão...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
            Área Administrativa &bull; Gestão Pedagógica
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
            Painel da Orquestra CCB
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Acompanhe o desenvolvimento de cada aluno no repertório do Hinário 5 da CCB.
          </p>
        </div>

        <Link
          to="/admin/alunos"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-2xs transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar / Ver Alunos</span>
        </Link>
      </div>

      {/* KPI Cards (PrimeFaces Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Total de Alunos
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
              {totalAlunos}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Cadastrados no portal</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Alunos Ativos
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
              {alunosAtivos}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Com estudos iniciados</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Hinos em Progresso
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400 font-mono mt-1 block">
              {totalHinosEmProgresso}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Em fase de estudo</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Hinos Concluídos
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1 block">
              {totalHinosConcluidos}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Aptos e dominados</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Student Highlights Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Alunos em Destaque</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Progresso geral no Hinário 5</p>
          </div>
          <Link
            to="/admin/alunos"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>Ver todos os {totalAlunos} alunos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {destaques.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {destaques.map((aluno) => (
              <div key={aluno.uid} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
                    {aluno.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                      {aluno.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Music className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <span>{aluno.instrument}</span>
                      <span>&bull;</span>
                      <span>{aluno.email}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                      {aluno.hinosConcluidos || 0} / 480
                    </span>
                    <span className="text-[10px] text-slate-400 block">hinos concluídos</span>
                  </div>

                  <div className="w-20 sm:w-28">
                    <div className="flex justify-between text-[11px] font-mono font-bold mb-1 text-slate-700 dark:text-slate-300">
                      <span>{aluno.progressoGeral || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${aluno.progressoGeral || 0}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/admin/alunos/${aluno.uid}`}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    title="Ver detalhes do aluno"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            Nenhum aluno cadastrado ainda. Clique em "Cadastrar / Ver Alunos" para iniciar.
          </div>
        )}
      </div>

    </div>
  );
};
