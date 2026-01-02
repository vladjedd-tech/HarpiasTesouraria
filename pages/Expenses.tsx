
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input, Select, Modal, Badge, ProofModal } from '../components/UI';
import { Expense } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { formatCurrency, formatDate, getMonthName, fileToBase64 } from '../utils/helpers';
import { Plus, Edit2, Trash2, FileText, AlertCircle } from 'lucide-react';

const Expenses: React.FC = () => {
  const { expenses, upsertExpense, deleteExpense, isMonthClosed, members } = useFinance();
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedProof, setSelectedProof] = useState<string | undefined>(undefined);

  const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: EXPENSE_CATEGORIES[0],
    responsibleId: user?.id || '',
    referenceMonth: new Date().toISOString().slice(0, 7),
    proof: ''
  });

  const handleOpenModal = (expense?: Expense) => {
    if (user?.role !== 'TESOUREIRO' && !expense) return;
    
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        date: expense.date,
        description: expense.description,
        amount: Number(expense.amount),
        category: expense.category,
        responsibleId: expense.responsibleId,
        referenceMonth: expense.referenceMonth,
        proof: expense.proof || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        category: EXPENSE_CATEGORIES[0],
        responsibleId: user?.id || '',
        referenceMonth: new Date().toISOString().slice(0, 7),
        proof: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setFormData({ ...formData, proof: base64 });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMonthClosed(formData.referenceMonth)) {
      alert('Este mês já está fechado. Não é possível realizar lançamentos.');
      return;
    }

    const data: Expense = {
      ...formData,
      id: editingExpense?.id || crypto.randomUUID()
    };
    upsertExpense(data);
    setIsModalOpen(false);
  };

  const isTreasurer = user?.role === 'TESOUREIRO';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Controle de Gastos</h1>
          <p className="text-slate-500">Registre e acompanhe as saídas do motoclube.</p>
        </div>
        {isTreasurer && (
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus size={20} />
            Novo Gasto
          </Button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Categoria</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Comprovante</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">Nenhum gasto registrado.</td>
                </tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatDate(expense.date)}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800">{expense.description}</p>
                        <p className="text-xs text-slate-500">Mês Ref: {getMonthName(expense.referenceMonth)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Badge color="gray">{expense.category}</Badge></td>
                    <td className="px-6 py-4 font-bold text-slate-800">{formatCurrency(expense.amount)}</td>
                    <td className="px-6 py-4">
                      {expense.proof ? (
                        <button 
                          onClick={() => setSelectedProof(expense.proof)} 
                          className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold text-sm bg-indigo-50 px-2 py-1 rounded"
                        >
                          <FileText size={16} /> Ver
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      {isTreasurer && (
                        <>
                          <button onClick={() => handleOpenModal(expense)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => deleteExpense(expense.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingExpense ? 'Editar Gasto' : 'Novo Gasto'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Data do Gasto" 
              type="date"
              value={formData.date} 
              onChange={e => setFormData({ ...formData, date: e.target.value })} 
              required 
            />
            <Input 
              label="Mês de Referência" 
              type="month"
              value={formData.referenceMonth} 
              onChange={e => setFormData({ ...formData, referenceMonth: e.target.value })} 
              required 
            />
          </div>
          
          <Input 
            label="Descrição" 
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })} 
            required 
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Valor" 
              type="number"
              step="0.01"
              prefix="R$"
              placeholder="0,00"
              value={formData.amount || ''} 
              onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} 
              required 
            />
            <Select 
              label="Categoria" 
              value={formData.category} 
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              options={EXPENSE_CATEGORIES.map(c => ({ label: c, value: c }))} 
            />
          </div>

          <Select 
            label="Responsável" 
            value={formData.responsibleId} 
            onChange={e => setFormData({ ...formData, responsibleId: e.target.value })}
            options={members.map(m => ({ label: m.apelido, value: m.id }))} 
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Comprovante</label>
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            {formData.proof && <p className="text-xs text-emerald-600 font-medium">✓ Arquivo carregado</p>}
          </div>

          {isMonthClosed(formData.referenceMonth) && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm font-medium">
              <AlertCircle size={18} />
              Este mês está fechado. O lançamento será bloqueado.
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isMonthClosed(formData.referenceMonth)}>Salvar Gasto</Button>
          </div>
        </form>
      </Modal>

      <ProofModal 
        isOpen={!!selectedProof} 
        onClose={() => setSelectedProof(undefined)} 
        proofData={selectedProof} 
      />
    </div>
  );
};

export default Expenses;
