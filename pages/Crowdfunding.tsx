
import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input, Modal, Badge, Select, ProofModal } from '../components/UI';
import { Vaquinha, VaquinhaContribution, PaymentStatus } from '../types';
import { formatCurrency, formatDate, fileToBase64 } from '../utils/helpers';
import { Plus, Target, Users, Calendar, ArrowRight, FileText, Check, X, Clock, Loader2 } from 'lucide-react';

const Crowdfunding: React.FC = () => {
  const { vaquinhas, contributions, upsertVaquinha, addContribution, updateContributionStatus, members } = useFinance();
  const { user } = useAuth();
  
  const [isVaqModalOpen, setIsVaqModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVaquinha, setSelectedVaquinha] = useState<Vaquinha | null>(null);
  const [selectedProof, setSelectedProof] = useState<string | undefined>(undefined);

  const [vaqFormData, setVaqFormData] = useState<Vaquinha>({
    id: '',
    name: '',
    description: '',
    goal: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'ATIVA'
  });

  const [contribData, setContribData] = useState<Omit<VaquinhaContribution, 'id'>>({
    vaquinhaId: '',
    memberId: user?.id || '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'PENDENTE',
    proof: ''
  });

  const isTreasurer = user?.role === 'TESOUREIRO';

  const handleOpenVaqModal = (vaquinha?: Vaquinha) => {
    if (vaquinha) {
      setVaqFormData(vaquinha);
    } else {
      setVaqFormData({
        id: crypto.randomUUID(),
        name: '',
        description: '',
        goal: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'ATIVA'
      });
    }
    setIsVaqModalOpen(true);
  };

  const handleVaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await upsertVaquinha(vaqFormData);
      setIsVaqModalOpen(false);
    } catch (err: any) {
      alert(`Erro ao salvar vaquinha: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenContributeModal = (v: Vaquinha) => {
    setSelectedVaquinha(v);
    setContribData({
      vaquinhaId: v.id,
      memberId: user?.id || '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      status: isTreasurer ? 'VALIDADO' : 'PENDENTE',
      proof: ''
    });
    setIsContributeModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setContribData({ ...contribData, proof: base64 });
    }
  };

  const handleContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribData.memberId) {
      alert('Selecione um membro para a contribuição.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addContribution(contribData);
      setIsContributeModalOpen(false);
    } catch (err: any) {
      alert(`Erro ao registrar contribuição: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRaisedAmount = (vaqId: string) => {
    return contributions
      .filter(c => c.vaquinhaId === vaqId && c.status === 'VALIDADO')
      .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
  };

  const getProgress = (vaqId: string, goal: number) => {
    const raised = getRaisedAmount(vaqId);
    if (!goal) return 0;
    return Math.min(Math.round((raised / goal) * 100), 100);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vaquinhas & Arrecadações</h1>
          <p className="text-slate-500">Projetos especiais e vaquinhas do motoclube.</p>
        </div>
        {isTreasurer && (
          <Button onClick={() => handleOpenVaqModal()} className="flex items-center gap-2">
            <Plus size={20} />
            Nova Vaquinha
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vaquinhas.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-medium">
            Nenhuma vaquinha ativa no momento.
          </div>
        ) : (
          vaquinhas.map(v => {
            const raised = getRaisedAmount(v.id);
            const progress = getProgress(v.id, v.goal);
            return (
              <Card key={v.id} className="flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <Badge color={v.status === 'ATIVA' ? 'green' : 'gray'}>{v.status}</Badge>
                    <div className="text-slate-400"><Target size={20} /></div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{v.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6">{v.description}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-bold text-indigo-600">{formatCurrency(raised)}</span>
                        <span className="text-slate-400">Meta: {formatCurrency(v.goal)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-right text-xs text-slate-400 mt-1 font-bold">{progress}% arrecadado</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1"><Calendar size={14} /> {formatDate(v.startDate)}</div>
                      <div className="flex items-center gap-1"><ArrowRight size={14} /></div>
                      <div className="flex items-center gap-1">{v.endDate ? formatDate(v.endDate) : 'Indeterminado'}</div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                  <Button onClick={() => handleOpenContributeModal(v)} className="flex-1 py-2 text-sm">Contribuir</Button>
                  <Button variant="secondary" onClick={() => { setSelectedVaquinha(v); setIsDetailsModalOpen(true); }} className="p-2" title="Ver Contribuições">
                    <Users size={18} />
                  </Button>
                  {isTreasurer && (
                    <Button variant="secondary" onClick={() => handleOpenVaqModal(v)} className="p-2" title="Editar">
                      <Plus size={18} className="rotate-45" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Contribute Modal */}
      <Modal isOpen={isContributeModalOpen} onClose={() => setIsContributeModalOpen(false)} title={`Contribuir para: ${selectedVaquinha?.name}`}>
        <form onSubmit={handleContributionSubmit} className="space-y-4">
          <Input 
            label="Valor da Contribuição" 
            type="number" 
            step="0.01" 
            prefix="R$"
            placeholder="0,00"
            value={contribData.amount || ''} 
            onChange={e => setContribData({ ...contribData, amount: parseFloat(e.target.value) || 0 })} 
            required 
            disabled={isSubmitting}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data" type="date" value={contribData.date} onChange={e => setContribData({ ...contribData, date: e.target.value })} required disabled={isSubmitting} />
            {isTreasurer ? (
              <Select 
                label="Membro (Obrigatório)" 
                value={contribData.memberId} 
                onChange={e => setContribData({ ...contribData, memberId: e.target.value })}
                required
                disabled={isSubmitting}
                options={[
                  { label: 'Selecione um membro...', value: '' },
                  ...members.map(m => ({ label: m.apelido, value: m.id }))
                ]}
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Membro</label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-600 font-medium">
                  {user?.apelido}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Comprovante</label>
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} disabled={isSubmitting} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            {contribData.proof && <p className="text-xs text-emerald-600 font-medium">✓ Arquivo carregado</p>}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsContributeModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
              Confirmar Doação
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={`Contribuições: ${selectedVaquinha?.name}`}>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-2">Membro</th>
                  <th className="px-4 py-2">Valor</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Comprovante</th>
                  {isTreasurer && <th className="px-4 py-2 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {contributions.filter(c => c.vaquinhaId === selectedVaquinha?.id).length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center italic text-slate-400">Nenhuma contribuição.</td></tr>
                ) : (
                  contributions.filter(c => c.vaquinhaId === selectedVaquinha?.id).map(c => (
                    <tr key={c.id}>
                      <td className="px-4 py-2 font-medium">{members.find(m => m.id === c.memberId)?.apelido || '---'}</td>
                      <td className="px-4 py-2">{formatCurrency(c.amount)}</td>
                      <td className="px-4 py-2">{getStatusBadge(c.status)}</td>
                      <td className="px-4 py-2">
                        {c.proof && (
                          <button onClick={() => setSelectedProof(c.proof)} className="text-indigo-600 hover:underline flex items-center gap-1 font-bold">
                            <FileText size={14} /> Ver
                          </button>
                        )}
                      </td>
                      {isTreasurer && (
                        <td className="px-4 py-2 text-right space-x-1">
                          {c.status === 'PENDENTE' && (
                            <>
                              <button onClick={() => updateContributionStatus(c.id, 'VALIDADO')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Validar"><Check size={16} /></button>
                              <button onClick={() => updateContributionStatus(c.id, 'REJEITADO')} className="p-1 text-rose-600 hover:bg-rose-50 rounded" title="Rejeitar"><X size={16} /></button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsDetailsModalOpen(false)}>Fechar</Button>
          </div>
        </div>
      </Modal>

      {/* Manage Vaquinha Modal */}
      <Modal isOpen={isVaqModalOpen} onClose={() => setIsVaqModalOpen(false)} title={vaqFormData.id ? 'Editar Vaquinha' : 'Nova Vaquinha'}>
        <form onSubmit={handleVaqSubmit} className="space-y-4">
          <Input label="Nome da Vaquinha" value={vaqFormData.name} onChange={e => setVaqFormData({ ...vaqFormData, name: e.target.value })} required disabled={isSubmitting} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Descrição</label>
            <textarea 
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] text-black"
              value={vaqFormData.description} 
              onChange={e => setVaqFormData({ ...vaqFormData, description: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Meta Financeira" 
              type="number" 
              step="0.01" 
              prefix="R$"
              placeholder="0,00"
              value={vaqFormData.goal || ''} 
              onChange={e => setVaqFormData({ ...vaqFormData, goal: parseFloat(e.target.value) || 0 })} 
              required 
              disabled={isSubmitting}
            />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select 
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-black"
                value={vaqFormData.status} 
                onChange={e => setVaqFormData({ ...vaqFormData, status: e.target.value as any })}
                disabled={isSubmitting}
              >
                <option value="ATIVA">Ativa</option>
                <option value="FINALIZADA">Finalizada</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Início" type="date" value={vaqFormData.startDate} onChange={e => setVaqFormData({ ...vaqFormData, startDate: e.target.value })} required disabled={isSubmitting} />
            <Input label="Término (Opcional)" type="date" value={vaqFormData.endDate} onChange={e => setVaqFormData({ ...vaqFormData, endDate: e.target.value })} disabled={isSubmitting} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsVaqModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
              Salvar Projeto
            </Button>
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

export default Crowdfunding;
