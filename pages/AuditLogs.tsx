
import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Card, Badge } from '../components/UI';
import { formatDate } from '../utils/helpers';
import { ClipboardList, History, Search } from 'lucide-react';

const AuditLogs: React.FC = () => {
  const { auditLogs } = useFinance();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Histórico de Auditoria</h1>
          <p className="text-slate-500">Registros automáticos de todas as ações importantes no sistema.</p>
        </div>
        <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><ClipboardList size={24} /></div>
      </div>

      <Card>
        <div className="overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Data/Hora</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Usuário</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ação</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">Nenhum log disponível.</td>
                </tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                          {log.userApelido[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{log.userApelido}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={log.action.includes('Criação') ? 'green' : log.action.includes('Exclusão') ? 'red' : 'blue'}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="flex justify-center mt-4">
        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
          <History size={14} /> Exibindo os últimos 1000 registros de auditoria.
        </p>
      </div>
    </div>
  );
};

export default AuditLogs;
