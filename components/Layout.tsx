
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, Users, CreditCard, PiggyBank, 
  Receipt, ClipboardList, LogOut, Menu, X, Shield
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['TESOUREIRO', 'MEMBRO'] },
    { name: 'Membros', href: '/members', icon: Users, roles: ['TESOUREIRO'] },
    { name: 'Mensalidades', href: '/fees', icon: CreditCard, roles: ['TESOUREIRO', 'MEMBRO'] },
    { name: 'Vaquinhas', href: '/vaquinhas', icon: PiggyBank, roles: ['TESOUREIRO', 'MEMBRO'] },
    { name: 'Gastos', href: '/expenses', icon: Receipt, roles: ['TESOUREIRO', 'MEMBRO'] },
    { name: 'Auditoria', href: '/audit', icon: ClipboardList, roles: ['TESOUREIRO'] },
  ];

  const filteredNav = navigation.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Shield size={24} className="text-indigo-500" />
          <span className="font-black text-lg tracking-tighter uppercase italic">Harpias MC</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 border-r border-slate-800
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-4">
          <div className="hidden md:flex items-center gap-3 mb-10 px-2 py-4">
            <Shield size={32} className="text-indigo-500" />
            <span className="font-black text-xl text-white tracking-tighter uppercase italic">Harpias MC</span>
          </div>

          <nav className="flex-1 space-y-1">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3 px-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-white font-bold text-lg">
                {user?.nome?.[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.nome}</p>
                <p className="text-xs text-slate-500 italic truncate">{user?.cargo || 'Membro'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg font-medium text-rose-400 hover:bg-rose-400/10 transition-all"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
