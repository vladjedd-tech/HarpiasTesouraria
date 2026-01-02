
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  User, MonthlyFeeConfig, MonthlyFeePayment, Vaquinha, VaquinhaContribution, 
  Expense, MonthlyClosure, AuditLog, PaymentStatus 
} from '../types';
import { useAuth } from './AuthContext';
import { supabase, isCloudEnabled } from '../services/supabase';

interface FinanceContextType {
  members: User[];
  feeConfigs: MonthlyFeeConfig[];
  feePayments: MonthlyFeePayment[];
  vaquinhas: Vaquinha[];
  contributions: VaquinhaContribution[];
  expenses: Expense[];
  closures: MonthlyClosure[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  
  addAuditLog: (action: string, details: string) => Promise<void>;
  upsertMember: (member: User) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  upsertFeeConfig: (config: MonthlyFeeConfig) => Promise<void>;
  addFeePayment: (payment: Omit<MonthlyFeePayment, 'id'>) => Promise<void>;
  updateFeePaymentStatus: (id: string, status: PaymentStatus) => Promise<void>;
  upsertVaquinha: (vaquinha: Vaquinha) => Promise<void>;
  addContribution: (contribution: Omit<VaquinhaContribution, 'id'>) => Promise<void>;
  updateContributionStatus: (id: string, status: PaymentStatus) => Promise<void>;
  upsertExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  toggleClosure: (month: string) => Promise<void>;
  isMonthClosed: (month: string) => boolean;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<User[]>([]);
  const [feeConfigs, setFeeConfigs] = useState<MonthlyFeeConfig[]>([]);
  const [feePayments, setFeePayments] = useState<MonthlyFeePayment[]>([]);
  const [vaquinhas, setVaquinhas] = useState<Vaquinha[]>([]);
  const [contributions, setContributions] = useState<VaquinhaContribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [closures, setClosures] = useState<MonthlyClosure[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const refreshData = useCallback(async () => {
    if (!isCloudEnabled) return;
    setIsLoading(true);
    try {
      const [
        { data: m }, { data: fc }, { data: fp }, 
        { data: v }, { data: c }, { data: e }, 
        { data: cl }, { data: al }
      ] = await Promise.all([
        supabase.from('members').select('*').order('nome'),
        supabase.from('fee_configs').select('*'),
        supabase.from('fee_payments').select('*'),
        supabase.from('vaquinhas').select('*'),
        supabase.from('contributions').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('closures').select('*'),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(1000)
      ]);

      if (m) setMembers(m.map(x => ({ 
        id: x.id, nome: x.nome, apelido: x.apelido, cargo: x.cargo, 
        role: x.role, status: x.status, senha: x.senha, 
        requiresPasswordChange: x.requires_password_change 
      })));

      if (fc) setFeeConfigs(fc.map(item => ({ ...item, value: Number(item.value) })));

      if (fp) setFeePayments(fp.map(p => ({ 
        id: p.id, memberId: p.member_id, amount: Number(p.amount),
        paymentDate: p.payment_date, status: p.status, proof: p.proof,
        referenceMonth: p.reference_month, observation: p.observation
      })));

      if (v) setVaquinhas(v.map(item => ({ 
        id: item.id, name: item.name, description: item.description, 
        goal: Number(item.goal), startDate: item.start_date, 
        endDate: item.end_date || '', status: item.status
      })));

      if (c) setContributions(c.map(item => ({ 
        id: item.id, vaquinhaId: item.vaquinha_id, memberId: item.member_id, 
        amount: Number(item.amount), date: item.date, status: item.status, proof: item.proof
      })));

      if (e) setExpenses(e.map(item => ({ 
        id: item.id, date: item.date, description: item.description, 
        amount: Number(item.amount), category: item.category, 
        responsibleId: item.responsible_id, referenceMonth: item.reference_month, proof: item.proof
      })));

      if (cl) setClosures(cl.map(x => ({ 
        month: x.month, isClosed: x.is_closed, closedBy: x.closed_by, closedAt: x.closed_at 
      })));

      if (al) setAuditLogs(al.map(x => ({ 
        id: x.id, timestamp: x.timestamp, userId: x.user_id, 
        userApelido: x.user_apelido, action: x.action, details: x.details
      })));
    } catch (err: any) {
      console.error('Falha ao sincronizar Supabase:', err.message || err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addAuditLog = async (action: string, details: string) => {
    const logData = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: user?.id || null,
      user_apelido: user?.apelido || 'sistema',
      action,
      details
    };
    if (isCloudEnabled) await supabase.from('audit_logs').insert(logData);
    await refreshData();
  };

  const isMonthClosed = (month: string) => closures.find(c => c.month === month)?.isClosed || false;

  const upsertMember = async (m: User) => {
    if (isCloudEnabled) {
      const { error } = await supabase.from('members').upsert({
        id: m.id,
        nome: m.nome,
        apelido: m.apelido,
        cargo: m.cargo, 
        role: m.role,
        status: m.status,
        senha: m.senha, 
        requires_password_change: m.requiresPasswordChange
      });
      if (error) throw new Error(error.message);
      await refreshData();
    }
  };

  const deleteMember = async (id: string) => {
    if (isCloudEnabled) {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw new Error(error.message);
      await refreshData();
    }
    await addAuditLog('Sistema', `Membro removido: ${id}`);
  };

  const upsertFeeConfig = async (config: MonthlyFeeConfig) => {
    if (isCloudEnabled) {
      const { error } = await supabase.from('fee_configs').upsert({
        month: config.month, value: config.value
      }, { onConflict: 'month' });
      if (error) throw new Error(error.message);
      await refreshData();
    }
  };

  const addFeePayment = async (p: Omit<MonthlyFeePayment, 'id'>) => {
    if (isCloudEnabled) {
      const { error } = await supabase.from('fee_payments').insert({
        id: crypto.randomUUID(), member_id: p.memberId, amount: p.amount,
        payment_date: p.paymentDate, status: p.status, proof: p.proof,
        reference_month: p.referenceMonth, observation: p.observation
      });
      if (error) throw new Error(error.message);
      await refreshData();
    }
  };

  const updateFeePaymentStatus = async (id: string, status: PaymentStatus) => {
    if (isCloudEnabled) {
      const { error } = await supabase.from('fee_payments').update({ status }).eq('id', id);
      if (error) throw new Error(error.message);
      await refreshData();
    }
  };

  const upsertVaquinha = async (v: Vaquinha) => {
    if (isCloudEnabled) {
      const { error } = await supabase.from('vaquinhas').upsert({
        id: v.id,
        name: v.name,
        description: v.description,
        goal: v.goal, 
        start_date: v.startDate,
        end_date: v.endDate || null, // Importante: strings vazias em campos DATE falham no SQL
        status: v.status
      });
      if (error) {
        console.error("Erro ao salvar vaquinha:", error);
        throw new Error(error.message);
      }
      await refreshData();
    }
    await addAuditLog('Vaquinha', `Vaquinha "${v.name}" atualizada.`);
  };

  const addContribution = async (c: Omit<VaquinhaContribution, 'id'>) => {
    if (isCloudEnabled) {
      const { error } = await supabase.from('contributions').insert({
        id: crypto.randomUUID(),
        vaquinha_id: c.vaquinhaId,
        member_id: c.memberId, 
        amount: c.amount,
        date: c.date,
        status: c.status,
        proof: c.proof
      });
      if (error) throw new Error(error.message);
      await refreshData();
    }
  };

  const updateContributionStatus = async (id: string, status: PaymentStatus) => {
    if (isCloudEnabled) {
      const { error } = await supabase.from('contributions').update({ status }).eq('id', id);
      if (error) throw new Error(error.message);
      await refreshData();
    }
  };

  const upsertExpense = async (e: Expense) => {
    if (isCloudEnabled) {
      const { error } = await supabase.from('expenses').upsert({
        id: e.id,
        date: e.date,
        description: e.description,
        amount: e.amount, 
        category: e.category,
        responsible_id: e.responsibleId, 
        reference_month: e.referenceMonth,
        proof: e.proof
      });
      if (error) throw new Error(error.message);
      await refreshData();
    }
  };

  const deleteExpense = async (id: string) => {
    if (isCloudEnabled) {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw new Error(error.message);
      await refreshData();
    }
  };

  const toggleClosure = async (month: string) => {
    const exists = closures.find(c => c.month === month);
    const is_closed = exists ? !exists.isClosed : true;
    if (isCloudEnabled) {
      const { error } = await supabase.from('closures').upsert({
        month, is_closed: is_closed, closed_at: new Date().toISOString(), closed_by: user?.apelido
      }, { onConflict: 'month' });
      if (error) throw new Error(error.message);
      await refreshData();
    }
  };

  return (
    <FinanceContext.Provider value={{
      members, feeConfigs, feePayments, vaquinhas, contributions, expenses, closures, auditLogs, isLoading,
      addAuditLog, upsertMember, deleteMember, upsertFeeConfig, addFeePayment, updateFeePaymentStatus,
      upsertVaquinha, addContribution, updateContributionStatus, upsertExpense, deleteExpense, toggleClosure, isMonthClosed, refreshData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};
