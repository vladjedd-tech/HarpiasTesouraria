
import React from 'react';
import { Download, X, FileText, ImageIcon } from 'lucide-react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const hasBg = className.includes('bg-');
  return (
    <div className={`rounded-xl shadow-sm border border-slate-200 overflow-hidden ${hasBg ? '' : 'bg-white'} ${className}`}>
      {children}
    </div>
  );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-50'
  };
  return (
    <button className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; prefix?: string; labelClassName?: string }> = ({ label, prefix, className = '', labelClassName = '', ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className={`text-sm font-semibold ${labelClassName || 'text-slate-700'}`}>{label}</label>}
    <div className="relative group">
      {prefix && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <span className="text-slate-400 font-bold text-sm">{prefix}</span>
        </div>
      )}
      <input 
        className={`px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full ${prefix ? 'pl-10' : ''} ${className}`} 
        {...props} 
      />
    </div>
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { label: string; value: string }[] }> = ({ label, options, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
    <select className={`px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${className}`} {...props}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const ProofModal: React.FC<{ isOpen: boolean; onClose: () => void; proofData?: string }> = ({ isOpen, onClose, proofData }) => {
  if (!isOpen || !proofData) return null;

  const isPDF = proofData.includes('application/pdf');
  
  const downloadFile = () => {
    const link = document.createElement('a');
    link.href = proofData;
    link.download = `comprovante-${Date.now()}.${isPDF ? 'pdf' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            {isPDF ? <FileText className="text-rose-500" /> : <ImageIcon className="text-indigo-500" />}
            <h3 className="text-lg font-bold text-slate-800">Visualizar Comprovante</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={downloadFile}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-bold text-sm"
            >
              <Download size={18} /> Baixar
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6 bg-slate-50 flex items-center justify-center">
          {isPDF ? (
            <iframe src={proofData} className="w-full h-full rounded-lg border border-slate-200" title="PDF Proof" />
          ) : (
            <img src={proofData} alt="Comprovante" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
          )}
        </div>
      </div>
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-rose-100 text-rose-700',
    yellow: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-slate-100 text-slate-700'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
};
