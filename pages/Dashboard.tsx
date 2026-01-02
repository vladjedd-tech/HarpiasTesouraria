
import React, { useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Card, Badge } from '../components/UI';
import { formatCurrency, getMonthName } from '../utils/helpers';
import { TrendingUp, TrendingDown, Wallet, Users, AlertCircle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const Dashboard: React.FC = () => {
  const { expenses, feePayments, contributions, members, closures } = useFinance();
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const stats = useMemo(() => {
    // Entradas Totais (Sempre garantindo conversão para Number)
    const totalFees = feePayments
      .filter(p => p.status === 'VALIDADO')
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      
    const totalContr = contributions
      .filter(c => c.status === 'VALIDADO')
      .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
      
    const totalIn = totalFees + totalContr;

    // Saídas Totais
    const totalOut = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    
    // Entradas do mês atual
    const monthFees = feePayments
      .filter(p => p.referenceMonth === currentMonth && p.status === 'VALIDADO')
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      
    const monthContr = contributions
      .filter(c => c.date.startsWith(currentMonth) && c.status === 'VALIDADO')
      .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

    const monthOut = expenses
      .filter(e => e.referenceMonth === currentMonth)
      .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    return {
      balance: totalIn - totalOut,
      currentMonthIn: monthFees + monthContr,
      currentMonthOut: monthOut
    };
  }, [feePayments, contributions, expenses, currentMonth]);

  const isClosed = closures.find(c => c.month === currentMonth)?.isClosed;

  const chartData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toISOString().slice(0, 7);
    }).reverse();

    return last6Months.map(month => {
      const monthFees = feePayments
        .filter(p => p.referenceMonth === month && p.status === 'VALIDADO')
        .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      const monthContr = contributions
        .filter(c => c.date.startsWith(month) && c.status === 'VALIDADO')
        .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
      const monthExp = expenses
        .filter(e => e.referenceMonth === month)
        .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
      return {
        name: getMonthName(month).split(' ')[0],
        entradas: monthFees + monthContr,
        saidas: monthExp
      };
    });
  }, [feePayments, contributions, expenses]);

  const categoryData = useMemo(() => {
    return Object.entries(
      expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + (Number(e.amount) || 0);
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Financeiro</h1>
          <p className="text-slate-500">Resumo geral das contas do motoclube.</p>
        </div>
        {isClosed && (
          <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold">
            <AlertCircle size={20} />
            Mês de {getMonthName(currentMonth)} está fechado.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-indigo-600 text-white shadow-xl shadow-indigo-100 ring-1 ring-white/20">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/20 rounded-lg"><Wallet size={24} /></div>
            <Badge color="blue">Em Caixa</Badge>
          </div>
          <p className="text-white/80 text-sm font-medium">Saldo Atual Disponível</p>
          <h2 className="text-3xl font-bold mt-1 tracking-tight">
            {formatCurrency(stats.balance)}
          </h2>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp size={24} /></div>
            <Badge color="green">Mês</Badge>
          </div>
          <p className="text-slate-500 text-sm font-medium">Entradas (Este Mês)</p>
          <h2 className="text-3xl font-bold mt-1 text-slate-800">
            {formatCurrency(stats.currentMonthIn)}
          </h2>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><TrendingDown size={24} /></div>
            <Badge color="red">Mês</Badge>
          </div>
          <p className="text-slate-500 text-sm font-medium">Saídas (Este Mês)</p>
          <h2 className="text-3xl font-bold mt-1 text-slate-800">
            {formatCurrency(stats.currentMonthOut)}
          </h2>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Users size={24} /></div>
            <Badge color="gray">Geral</Badge>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total de Membros</p>
          <h2 className="text-3xl font-bold mt-1 text-slate-800">{members.length}</h2>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Fluxo de Caixa (6 meses)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `R$${val}`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="entradas" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="saidas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Gastos por Categoria</h3>
          {categoryData.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center text-slate-400">
              <TrendingDown size={48} className="mb-4 opacity-20" />
              <p>Nenhum gasto registrado</p>
            </div>
          ) : (
            <>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-2">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-slate-600 font-medium">{cat.name}</span>
                    </div>
                    <span className="text-slate-800 font-bold">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
