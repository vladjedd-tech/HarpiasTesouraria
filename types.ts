
export type UserRole = 'TESOUREIRO' | 'MEMBRO';
export type UserStatus = 'ATIVO' | 'INATIVO';
export type PaymentStatus = 'PENDENTE' | 'VALIDADO' | 'REJEITADO';
export type VaquinhaStatus = 'ATIVA' | 'FINALIZADA';

export interface User {
  id: string;
  nome: string;
  apelido: string;
  cargo: string;
  role: UserRole;
  status: UserStatus;
  senha?: string;
  requiresPasswordChange: boolean;
}

export interface MonthlyFeeConfig {
  month: string; // YYYY-MM
  value: number;
}

export interface MonthlyFeePayment {
  id: string;
  memberId: string;
  amount: number;
  paymentDate: string;
  status: PaymentStatus;
  observation?: string;
  proof?: string; // base64
  referenceMonth: string; // YYYY-MM
}

export interface Vaquinha {
  id: string;
  name: string;
  description: string;
  goal: number;
  startDate: string;
  endDate: string;
  status: VaquinhaStatus;
}

export interface VaquinhaContribution {
  id: string;
  vaquinhaId: string;
  memberId: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  proof?: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  responsibleId: string;
  referenceMonth: string; // YYYY-MM
  proof?: string;
}

export interface MonthlyClosure {
  month: string; // YYYY-MM
  isClosed: boolean;
  closedBy: string;
  closedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userApelido: string;
  action: string;
  details: string;
}
