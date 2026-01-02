
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input } from '../components/UI';
import { Lock, User as UserIcon, Shield } from 'lucide-react';

const Login: React.FC = () => {
  const [apelido, setApelido] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const success = await login(apelido, senha);
      if (!success) {
        setError('Credenciais inválidas ou conta inativa.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-6 bg-indigo-600 p-4 rounded-2xl shadow-2xl shadow-indigo-500/20">
            <Shield size={64} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Harpias MC</h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Gestão Financeira</p>
        </div>

        <Card className="p-8 bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-lg text-sm font-bold text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative">
                <UserIcon className="absolute left-3 top-9 text-slate-500 z-10" size={18} />
                <Input 
                  label="Membro (Apelido)" 
                  labelClassName="text-white font-bold"
                  placeholder="Seu apelido" 
                  className="pl-10 bg-white border-slate-700 text-black font-medium focus:border-indigo-500"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-9 text-slate-500 z-10" size={18} />
                <Input 
                  label="Senha" 
                  labelClassName="text-white font-bold"
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 bg-white border-slate-700 text-black font-medium focus:border-indigo-500"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-black uppercase tracking-widest shadow-xl shadow-indigo-900/20" disabled={isSubmitting}>
              {isSubmitting ? 'Validando...' : 'Entrar na Sede'}
            </Button>
          </form>
        </Card>
        
        <p className="text-center mt-8 text-slate-600 text-xs font-bold uppercase tracking-widest">
          Acesso Exclusivo • Irmandade e Honra
        </p>
      </div>
    </div>
  );
};

export default Login;
