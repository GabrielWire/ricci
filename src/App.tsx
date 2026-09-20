import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AlunosList } from './pages/admin/AlunosList';
import { InstrutoresList } from './pages/admin/InstrutoresList';
import { AlunoDetalhes } from './pages/admin/AlunoDetalhes';
import { MsaAdminHub } from './pages/admin/MsaAdminHub';
import { MetodosAdminHub } from './pages/admin/MetodosAdminHub';

import { AlunoDashboard } from './pages/aluno/AlunoDashboard';
import { AlunoMsa } from './pages/aluno/AlunoMsa';
import { AlunoMetodo } from './pages/aluno/AlunoMetodo';
import { AlunoProgresso } from './pages/aluno/AlunoProgresso';
import { AlunoPerfil } from './pages/aluno/AlunoPerfil';

import { Music } from 'lucide-react';

const STORAGE_KEY_THEME = 'ricci_theme';

const RootRedirect: React.FC = () => {
  const { currentUser, role, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role === 'admin' || role === 'professor' || role === 'instrutor') return <Navigate to="/admin" replace />;
  return <Navigate to="/aluno" replace />;
};

const MainLayout: React.FC = () => {
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

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect based on auth state */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin / Instrutor Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'professor', 'instrutor']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/instrutores"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <InstrutoresList />
              </ProtectedRoute>
            }
          />
          {/* Redirecionamento retroativo para /admin/professores */}
          <Route path="/admin/professores" element={<Navigate to="/admin/instrutores" replace />} />
          <Route
            path="/admin/alunos"
            element={
              <ProtectedRoute allowedRoles={['admin', 'professor', 'instrutor']}>
                <AlunosList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/metodos"
            element={
              <ProtectedRoute allowedRoles={['admin', 'professor', 'instrutor']}>
                <MetodosAdminHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/msa"
            element={
              <ProtectedRoute allowedRoles={['admin', 'professor', 'instrutor']}>
                <MsaAdminHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/alunos/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'professor', 'instrutor']}>
                <AlunoDetalhes />
              </ProtectedRoute>
            }
          />

          {/* Student Protected Routes */}
          <Route
            path="/aluno"
            element={
              <ProtectedRoute allowedRoles={['aluno']}>
                <AlunoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aluno/metodo"
            element={
              <ProtectedRoute allowedRoles={['aluno']}>
                <AlunoMetodo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aluno/msa"
            element={
              <ProtectedRoute allowedRoles={['aluno']}>
                <AlunoMsa />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aluno/progresso"
            element={
              <ProtectedRoute allowedRoles={['aluno']}>
                <AlunoProgresso />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aluno/perfil"
            element={
              <ProtectedRoute allowedRoles={['aluno']}>
                <AlunoPerfil />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-8 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shrink-0">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-indigo-700 dark:text-indigo-400 text-sm tracking-tight block">
                  CCB - ESTUDOS MUSICAIS
                </span>
                <span className="text-slate-400 text-[11px]">Orquestra &bull; Hinário 5 &bull; MSA &bull; Métodos</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Produção Independente
              </span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Produção independente desenvolvida para auxílio aos candidatos, músicos e instrutores nos estudos musicais da Congregação Cristã no Brasil. Sem vínculo institucional oficial.
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              &copy; {new Date().getFullYear()} CCB Música &bull; Hinário 5 &bull; MSA &bull; Métodos de Instrumentos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
