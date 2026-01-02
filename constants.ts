
export const EXPENSE_CATEGORIES = [
  'Eventos',
  'Sede',
  'Manutenção',
  'Caridade',
  'Administrativo',
  'Viagens',
  'Outros'
];

// Logo do Harpias MC (Baseado na imagem enviada)
export const LOGO_URL = "https://raw.githubusercontent.com/filipe-js/harpias-mc/main/logo.png"; // Placeholder ou caminho local

export const CLOUD_CONFIG = {
  SUPABASE_URL: 'https://hmixzzxsnmsghufapnfd.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtaXh6enhzbm1zZ2h1ZmFwbmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjc1MjksImV4cCI6MjA4Mjk0MzUyOX0.nVGwM1SpVMCll0QhlgmIHeDzXzM-vKD8O9Y7VP59Ooc',
};

export const INITIAL_TREASURER = {
  id: 'admin-1',
  nome: 'Administrador Geral',
  apelido: 'admin',
  cargo: 'Tesoureiro',
  role: 'TESOUREIRO' as const,
  status: 'ATIVO' as const,
  senha: 'admin',
  requiresPasswordChange: false
};

export const INITIAL_USERS = [
  INITIAL_TREASURER,
  {
    id: 'vlad-admin',
    nome: 'Vlad Admin',
    apelido: 'vlad',
    cargo: 'Administrador',
    role: 'TESOUREIRO' as const,
    status: 'ATIVO' as const,
    senha: 'vlad',
    requiresPasswordChange: false
  }
];

export const STORAGE_KEYS = {
  USERS: 'harpias_users',
  FEE_CONFIG: 'harpias_fee_config',
  FEE_PAYMENTS: 'harpias_fee_payments',
  VAQUINHAS: 'harpias_vaquinhas',
  CONTRIBUTIONS: 'harpias_contributions',
  EXPENSES: 'harpias_expenses',
  CLOSURES: 'harpias_closures',
  AUDIT: 'harpias_audit',
  AUTH: 'harpias_auth'
};
