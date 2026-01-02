
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Card, Button, Input, Select, Modal, Badge } from '../components/UI';
import { User, UserRole, UserStatus } from '../types';
import { Plus, Edit2, Shield, Trash2, Key, Loader2, AlertTriangle, UserX } from 'lucide-react';

const Members: React.FC = () => {
  const { members, upsertMember, deleteMember, addAuditLog } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [memberToReset, setMemberToReset] = useState<User | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    nome: '',
    apelido: '',
    cargo: '',
    role: 'MEMBRO',
    status: 'ATIVO',
    requiresPasswordChange: true,
    senha: 'mudar123'
  });

  const handleOpenModal = (member?: User) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        nome: member.nome,
        apelido: member.apelido,
        cargo: member.cargo,
        role: member.role,
        status: member.status,
        requiresPasswordChange: member.requiresPasswordChange,
        senha: member.senha
      });
    } else {
      setEditingMember(null);
      setFormData({
        nome: '',
        apelido: '',
        cargo: '',
        role: 'MEMBRO',
        status: 'ATIVO',
        requiresPasswordChange: true,
        senha: 'mudar123'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const exists = members.find(m => m.apelido.toLowerCase() === formData.apelido.toLowerCase() && m.id !== editingMember?.id);
    if (exists) {
      alert('Este apelido já está em uso.');
      return;
    }

    setIsSubmitting(true);
    try {
      const memberData: User = {
        ...formData,
        id: editingMember?.id || crypto.randomUUID()
      };
      await upsertMember(memberData);
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Erro ao salvar membro: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!memberToReset) return;

    setIsSubmitting(true);
    try {
      await upsertMember({ 
        ...memberToReset, 
        senha: 'mudar123', 
        requiresPasswordChange: true 
      });
      await addAuditLog('Segurança', `Senha do membro ${memberToReset.apelido} resetada pelo tesoureiro.`);
      setIsResetModalOpen(false);
      setMemberToReset(null);
      alert(`Senha de ${memberToReset.apelido} redefinida com sucesso!`);
    } catch (err: any) {
      alert(`Erro ao redefinir senha: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteMember(memberToDelete.id);
      await addAuditLog('Membros', `Membro ${memberToDelete.apelido} excluído permanentemente.`);
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    } catch (err: any) {
      alert(`Erro ao excluir membro: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestão de Membros</h1>
          <p className="text-slate-500">Administre o acesso e cargos do motoclube.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus size={20} />
          Novo Membro
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Membro</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cargo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Acesso</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                        {member.nome[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{member.apelido}</p>
                        <p className="text-xs text-slate-500">{member.nome}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{member.cargo}</td>
                  <td className="px-6 py-4">
                    <Badge color={member.role === 'TESOUREIRO' ? 'blue' : 'gray'}>
                      {member.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={member.status === 'ATIVO' ? 'green' : 'red'}>
                      {member.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => { setMemberToReset(member); setIsResetModalOpen(true); }} 
                      title="Resetar Senha" 
                      className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Key size={18} />
                    </button>
                    <button 
                      onClick={() => handleOpenModal(member)} 
                      className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    {member.id !== 'admin-1' && (
                      <button 
                        onClick={() => { setMemberToDelete(member); setIsDeleteModalOpen(true); }} 
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir Membro"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Criação/Edição */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingMember ? 'Editar Membro' : 'Novo Membro'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Nome Completo" 
            value={formData.nome} 
            onChange={e => setFormData({ ...formData, nome: e.target.value })} 
            required 
            disabled={isSubmitting}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Apelido" 
              value={formData.apelido} 
              onChange={e => setFormData({ ...formData, apelido: e.target.value })} 
              required 
              disabled={isSubmitting}
            />
            <Input 
              label="Cargo" 
              value={formData.cargo} 
              onChange={e => setFormData({ ...formData, cargo: e.target.value })} 
              required 
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Acesso" 
              value={formData.role} 
              onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
              options={[{ label: 'Membro', value: 'MEMBRO' }, { label: 'Tesoureiro', value: 'TESOUREIRO' }]} 
              disabled={isSubmitting}
            />
            <Select 
              label="Status" 
              value={formData.status} 
              onChange={e => setFormData({ ...formData, status: e.target.value as UserStatus })}
              options={[{ label: 'Ativo', value: 'ATIVO' }, { label: 'Inativo', value: 'INATIVO' }]} 
              disabled={isSubmitting}
            />
          </div>
          {!editingMember && (
            <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-500">
              A senha inicial padrão é <span className="font-bold">mudar123</span> e o membro será solicitado a trocá-la no primeiro acesso.
            </div>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin inline-block mr-2" size={18} /> : null}
              {editingMember ? 'Salvar Alterações' : 'Criar Membro'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Reset de Senha */}
      <Modal 
        isOpen={isResetModalOpen} 
        onClose={() => setIsResetModalOpen(false)} 
        title="Confirmar Reset de Senha"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
            <AlertTriangle size={24} className="shrink-0" />
            <p className="text-sm font-medium">
              Você está prestes a redefinir a senha do membro <span className="font-bold">{memberToReset?.apelido}</span>.
            </p>
          </div>
          
          <div className="text-slate-600 text-sm space-y-2">
            <p>Ao confirmar esta ação:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>A senha será alterada para <span className="font-bold">mudar123</span>.</li>
              <li>O membro será <span className="font-bold">obrigado</span> a criar uma nova senha pessoal no próximo login.</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsResetModalOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmResetPassword} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin inline-block mr-2" size={18} /> : <Key size={18} className="inline-block mr-2" />}
              Confirmar Redefinição
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Excluir Membro"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
            <UserX size={28} className="shrink-0" />
            <div>
              <p className="font-bold">Ação Irreversível</p>
              <p className="text-sm">
                Tem certeza que deseja excluir permanentemente o membro <span className="font-black underline">{memberToDelete?.nome} ({memberToDelete?.apelido})</span>?
              </p>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 leading-relaxed px-1">
            Isso removerá o acesso do usuário ao sistema. Registros financeiros vinculados a este ID podem se tornar órfãos ou inconsistentes no histórico de auditoria.
          </p>

          <div className="flex justify-end gap-3 mt-6 pt-2">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsDeleteModalOpen(false)} 
              disabled={isSubmitting}
            >
              Manter Membro
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirmDelete} 
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Trash2 size={18} className="inline-block mr-2" />
                  Excluir Agora
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Members;
