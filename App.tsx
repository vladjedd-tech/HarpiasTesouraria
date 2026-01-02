
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider, useFinance } from './contexts/FinanceContext';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MonthlyFees from './pages/MonthlyFees';
import Crowdfunding from './pages/Crowdfunding';
import Expenses from './pages/Expenses';
import AuditLogs from './pages/AuditLogs';
import ChangePassword from './pages/ChangePassword';

const GlobalLoader: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
    <p className="text-slate-500 font-medium animate-pulse">Sincronizando dados...</p>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading: financeLoading } = useFinance();

  if (authLoading || financeLoading) return <GlobalLoader />;
  
  // Verificação explícita de user para satisfazer o TypeScript
  if (!isAuthenticated || !user) return <Navigate to="/login" />;
  
  if (user.requiresPasswordChange) return <Navigate to="/change-password" />;
  
  // Aqui o TS já sabe que 'user' existe e é do tipo 'User'
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <GlobalLoader />;

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/change-password" element={user?.requiresPasswordChange ? <ChangePassword /> : <Navigate to="/" />} />
      
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/fees" element={<ProtectedRoute><MonthlyFees /></ProtectedRoute>} />
      <Route path="/vaquinhas" element={<ProtectedRoute><Crowdfunding /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      
      {/* Treasury Only Routes */}
      <Route path="/members" element={<ProtectedRoute roles={['TESOUREIRO']}><Members /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute roles={['TESOUREIRO']}><AuditLogs /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <FinanceProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </FinanceProvider>
    </AuthProvider>
  );
};

export default App;
