import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AlunosList } from './pages/admin/AlunosList';
import { AlunoDetalhes } from './pages/admin/AlunoDetalhes';
import { AlunoDashboard } from './pages/aluno/AlunoDashboard';
import { AlunoProgresso } from './pages/aluno/AlunoProgresso';
import { AlunoPerfil } from './pages/aluno/AlunoPerfil';
import { MsaAdminHub } from './pages/admin/MsaAdminHub';
import { AlunoMsa } from './pages/aluno/AlunoMsa';

import { Music, MapPin, Phone, ExternalLink } from 'lucide-react';

const STORAGE_KEY_THEME = 'ricci_theme';

const RootRedirect: React.FC = () => {
  const { currentUser, role, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role === 'admin' || role === 'professor') return <Navigate to="/admin" replace />;
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

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/alunos"
            element={
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <AlunosList />
              </ProtectedRoute>
            }
          />
                    <Route
            path="/admin/msa"
            element={
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <MsaAdminHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/alunos/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
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
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-indigo-700 dark:text-indigo-400 text-sm tracking-tight block">
                  RICCI - ACADEMIA DE MÚSICA
                </span>
                <span className="text-slate-400 text-[11px]">Santo André - SP</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Av. Das Nações, 749</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>(11) 4475-6918</span>
              </div>
              <a
                href="https://www.ricciacademiademusica.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-semibold"
              >
                <span>ricciacademiademusica.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
            Portal de Gerenciamento da Orquestra CCB &bull; Hinário 5 &copy; {new Date().getFullYear()} RICCI Academia de Música.
          </p>
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
