
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input } from '../components/UI';
import { Key, ShieldCheck } from 'lucide-react';

const ChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { updatePassword } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    updatePassword(newPassword);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-amber-100 p-4 rounded-full text-amber-600 mb-4 shadow-sm">
            <Key size={48} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Alteração de Senha Obrigatória</h1>
          <p className="text-slate-500 mt-2">Para sua segurança, defina uma nova senha antes de continuar.</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <Input 
                label="Nova Senha" 
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="No mínimo 6 caracteres"
                required
              />
              <Input 
                label="Confirmar Nova Senha" 
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full h-12 flex items-center justify-center gap-2">
              <ShieldCheck size={20} />
              Salvar e Acessar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
