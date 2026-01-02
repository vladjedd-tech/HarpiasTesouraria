
import React, { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input, Select, Modal, Badge, ProofModal } from '../components/UI';
import { MonthlyFeePayment, PaymentStatus, User } from '../types';
import { formatCurrency, formatDate, getMonthName, fileToBase64 } from '../utils/helpers';
import { Plus, Check, X, Clock, FileText, Settings, AlertCircle, Lock, Unlock, Users, Loader2 } from 'lucide-react';

const MonthlyFees: React.FC = () => {
  const { 
    feePayments, feeConfigs, members, addFeePayment, updateFeePaymentStatus, 
    upsertFeeConfig, toggleClosure, isMonthClosed, closures 
  } = useFinance();
  const { user } = useAuth();
  
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProof, setSelectedProof] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'HISTORICO' | 'STATUS'>('STATUS');

  const isTreasurer = user?.role === 'TESOUREIRO';
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  const [paymentData, setPaymentData] = useState<Omit<MonthlyFeePayment, 'id'>>({
    memberId: user?.id || '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'PENDENTE',
    referenceMonth: currentMonthStr,
    proof: ''
  });

  const [feeConfigData, setFeeConfigData] = useState({
    month: currentMonthStr,
    value: 0
  });

  // Cálculos de Status por Membro para o Mês Selecionado (Treasurer Only)
  const memberStatusList = useMemo(() => {
    const config = feeConfigs.find(c => c.month === currentMonthStr);
    const expectedValue = config?.value || 0;

    return members
      .filter(m => m.status === 'ATIVO')
      .map(m => {
        const myPayments = feePayments.filter(p => p.memberId === m.id && p.referenceMonth === currentMonthStr);
        const validatedPayments = myPayments.filter(p => p.status === 'VALIDADO');
        const totalPaid = validatedPayments.reduce((acc, p) => acc + Number(p.amount), 0);
        const hasPending = myPayments.some(p => p.status === 'PENDENTE');

        let status: 'NADA' | 'PARCIAL' | 'OK' | 'AGUARDANDO' = 'NADA';
        if (hasPending) status = 'AGUARDANDO';
        else if (totalPaid >= expectedValue && expectedValue > 0) status = 'OK';
        else if (totalPaid > 0 && totalPaid < expectedValue) status = 'PARCIAL';

        return { member: m, totalPaid, status };
      });
  }, [members, feePayments, feeConfigs, currentMonthStr]);

  const handleOpenPayModal = () => {
    const config = feeConfigs.find(c => c.month === currentMonthStr);
    setPaymentData({
      memberId: user?.id || '',
      amount: config?.value || 0,
      paymentDate: new Date().toISOString().split('T')[0],
      status: isTreasurer ? 'VALIDADO' : 'PENDENTE',
      referenceMonth: currentMonthStr,
      proof: ''
    });
    setIsPayModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setPaymentData({ ...paymentData, proof: base64 });
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMonthClosed(paymentData.referenceMonth)) {
      alert('Mês fechado.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addFeePayment(paymentData);
      setIsPayModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'VALIDADO': return <Badge color="green">Validado</Badge>;
      case 'PENDENTE': return <Badge color="yellow">Pendente</Badge>;
      case 'REJEITADO': return <Badge color="red">Rejeitado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mensalidades</h1>
          <p className="text-slate-500">Gestão de entradas e validação financeira.</p>
        </div>
        <div className="flex gap-2">
          {isTreasurer && (
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('STATUS')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'STATUS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
              >
                Status Atual
              </button>
              <button 
                onClick={() => setViewMode('HISTORICO')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'HISTORICO' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
              >
                Histórico
              </button>
            </div>
          )}
          <Button onClick={handleOpenPayModal} className="flex items-center gap-2">
            <Plus size={20} /> Registrar Pagamento
          </Button>
        </div>
      </div>

      {isTreasurer && viewMode === 'STATUS' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-800">
              <Users size={20} />
              <h2 className="font-bold">Status de Pagamento: {getMonthName(currentMonthStr)}</h2>
            </div>
            {isTreasurer && (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsConfigModalOpen(true)} className="py-1.5 text-xs flex items-center gap-1">
                  <Settings size={14} /> Configurar Valor
                </Button>
                <Button variant="secondary" onClick={() => setIsClosureModalOpen(true)} className="py-1.5 text-xs flex items-center gap-1">
                  <Lock size={14} /> Fechamento
                </Button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {memberStatusList.map(({ member, totalPaid, status }) => (
              <div key={member.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-800 text-sm">{member.apelido}</span>
                  {status === 'OK' && <Badge color="green">Pago</Badge>}
                  {status === 'PARCIAL' && <Badge color="yellow">Parcial</Badge>}
                  {status === 'AGUARDANDO' && <Badge color="blue">Validar</Badge>}
                  {status === 'NADA' && <Badge color="red">Inadimplente</Badge>}
                </div>
                <p className="text-xs text-slate-500 font-medium">{member.nome}</p>
                <div className="mt-2 text-lg font-black text-slate-800">
                  {formatCurrency(totalPaid)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {(viewMode === 'HISTORICO' || !isTreasurer) && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Mês Ref.</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Membro</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Valor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Comprovante</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(isTreasurer ? feePayments : feePayments.filter(p => p.memberId === user?.id)).map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-700">{getMonthName(payment.referenceMonth)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {members.find(m => m.id === payment.memberId)?.apelido || '---'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                    <td className="px-6 py-4">
                      {payment.proof && (
                        <button onClick={() => setSelectedProof(payment.proof)} className="text-indigo-600 hover:underline flex items-center gap-1 font-bold text-xs">
                          <FileText size={14} /> Ver
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isTreasurer && payment.status === 'PENDENTE' && (
                        <div className="flex justify-end gap-1">
                          <button onClick={() => updateFeePaymentStatus(payment.id, 'VALIDADO')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><Check size={18} /></button>
                          <button onClick={() => updateFeePaymentStatus(payment.id, 'REJEITADO')} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"><X size={18} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modais */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Registrar Pagamento">
        <form onSubmit={handleSubmitPayment} className="space-y-4">
          <Input label="Mês de Referência" type="month" value={paymentData.referenceMonth} onChange={e => setPaymentData({ ...paymentData, referenceMonth: e.target.value })} required disabled={isSubmitting} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor" type="number" step="0.01" prefix="R$" value={paymentData.amount || ''} onChange={e => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })} required disabled={isSubmitting} />
            {isTreasurer ? (
              <Select label="Membro" value={paymentData.memberId} onChange={e => setPaymentData({ ...paymentData, memberId: e.target.value })} required disabled={isSubmitting} options={members.map(m => ({ label: m.apelido, value: m.id }))} />
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Membro</label>
                <div className="px-3 py-2 bg-slate-50 rounded-lg">{user?.apelido}</div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Comprovante</label>
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} disabled={isSubmitting} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsPayModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Registrar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} title="Configurar Mensalidade">
        <form onSubmit={(e) => { e.preventDefault(); upsertFeeConfig(feeConfigData); setIsConfigModalOpen(false); }} className="space-y-4">
          <Input label="Mês" type="month" value={feeConfigData.month} onChange={e => setFeeConfigData({ ...feeConfigData, month: e.target.value })} required />
          <Input label="Valor" type="number" step="0.01" prefix="R$" value={feeConfigData.value || ''} onChange={e => setFeeConfigData({ ...feeConfigData, value: parseFloat(e.target.value) || 0 })} required />
          <Button type="submit" className="w-full">Salvar</Button>
        </form>
      </Modal>

      <ProofModal isOpen={!!selectedProof} onClose={() => setSelectedProof(undefined)} proofData={selectedProof} />
    </div>
  );
};

export default MonthlyFees;
