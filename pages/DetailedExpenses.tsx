
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useFinancial, Transaction } from '../context/FinancialContext';
import { extractTransactionsFromDocument } from '../services/ai';
import { 
    Button, 
    Input, 
    Select, 
    Modal, 
    Badge, 
    Icon, 
    IconButton, 
    Text,
    PageHeader,
    EmptyState,
    Card
} from '../components/DesignSystem';

interface FileUploadState {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  extractedData?: Transaction[];
  detectedSource?: string;
  errorMessage?: string;
}

const SOURCES_OPTIONS = ['Nubank', 'Itaú', 'Bradesco', 'Inter', 'Santander', 'Caixa', 'BB', 'Carteira', 'Ticket', 'Outro'];

const getSourceColor = (source: string) => {
    const s = source ? source.toLowerCase() : '';
    if (s.includes('nubank')) return 'text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/20';
    if (s.includes('itaú') || s.includes('itau')) return 'text-[#fb923c] bg-[#fb923c]/10 border-[#fb923c]/20';
    if (s.includes('bradesco')) return 'text-[#f43f5e] bg-[#f43f5e]/10 border-[#f43f5e]/20';
    if (s.includes('inter')) return 'text-[#fdba74] bg-[#fdba74]/10 border-[#fdba74]/20';
    if (s.includes('santander')) return 'text-[#fca5a5] bg-[#fca5a5]/10 border-[#fca5a5]/20';
    if (s.includes('carteira') || s.includes('dinheiro')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    return 'text-zinc-400 bg-zinc-800 border-white/5';
};

// --- MODALS (ManualEntry, ReviewStaging, etc) ---
const ManualEntryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { addTransaction } = useFinancial();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Geral',
    type: 'expense' as 'expense' | 'income',
    source: 'Carteira',
    installmentsTotal: '',
    hasInstallments: false
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    const amount = parseFloat(formData.amount.replace(',', '.'));
    if (!amount || !formData.description) return;

    const newTransaction: Transaction = {
      id: Date.now(),
      description: formData.description,
      amount: amount,
      date: formData.date,
      category: formData.category,
      type: formData.type,
      source: formData.source,
      icon: formData.type === 'income' ? 'attach_money' : 'receipt_long',
      installments: formData.hasInstallments && Number(formData.installmentsTotal) > 1 ? {
        current: 1,
        total: Number(formData.installmentsTotal)
      } : undefined
    };

    addTransaction(newTransaction);
    onClose();
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Geral',
      type: 'expense',
      source: 'Carteira',
      installmentsTotal: '',
      hasInstallments: false
    });
  };

  return (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Nova Transação"
        maxWidth="max-w-lg"
        footer={
             <Button onClick={handleSubmit} variant="primary" size="lg" icon="check">
                Salvar Transação
             </Button>
        }
    >
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-1 p-1 bg-black rounded-xl border border-white/5">
                <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`py-2.5 rounded-lg text-sm font-bold transition-all ${formData.type === 'expense' ? 'bg-rose-500/10 text-rose-400 shadow-sm border border-rose-500/20' : 'text-text-secondary hover:text-white'}`}>Despesa</button>
                <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`py-2.5 rounded-lg text-sm font-bold transition-all ${formData.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 shadow-sm border border-emerald-500/20' : 'text-text-secondary hover:text-white'}`}>Receita</button>
            </div>

             <div className="grid grid-cols-2 gap-4">
                 <Input label="Valor" type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0,00" className="text-lg font-bold" icon={formData.type === 'income' ? 'add' : 'remove'} />
                 <Select label="Origem / Conta" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} options={SOURCES_OPTIONS.map(c => ({ value: c, label: c }))} />
             </div>

             <Input label="Descrição" type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: Supermercado..." />

             <div className="grid grid-cols-2 gap-4">
                <Select label="Categoria" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} options={['Geral', 'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Serviços', 'Salário', 'Investimento'].map(c => ({ value: c, label: c }))} />
                <Input label="Data" type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="[color-scheme:dark]" />
             </div>
            
             {formData.type === 'expense' && (
                 <div className="p-4 rounded-xl bg-zinc-800/30 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-white flex items-center gap-2"><Icon name="calendar_month" className="text-primary" /> Compra Parcelada?</label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" checked={formData.hasInstallments} onChange={e => setFormData({...formData, hasInstallments: e.target.checked})} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5 checked:border-primary" style={{right: formData.hasInstallments ? '0' : 'auto', left: formData.hasInstallments ? 'auto' : '0'}} />
                            <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${formData.hasInstallments ? 'bg-primary' : 'bg-zinc-700'}`}></div>
                        </div>
                    </div>
                    {formData.hasInstallments && ( <div className="animate-fade-in"><Input label="Quantas Parcelas?" type="number" min="2" max="99" value={formData.installmentsTotal} onChange={e => setFormData({...formData, installmentsTotal: e.target.value})} placeholder="Ex: 12" /></div> )}
                 </div>
             )}
          </div>
    </Modal>
  );
};

const ReviewStagingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialTransactions: Transaction[];
  detectedSource?: string;
  onConfirm: (finalTransactions: Transaction[]) => void;
}> = ({ isOpen, onClose, initialTransactions, detectedSource, onConfirm }) => {
  const [stagedData, setStagedData] = useState<Transaction[]>([]);
  const [globalSource, setGlobalSource] = useState('Carteira');

  useEffect(() => {
    if (isOpen) {
      setStagedData(initialTransactions);
      if (detectedSource) {
          const match = SOURCES_OPTIONS.find(s => detectedSource.toLowerCase().includes(s.toLowerCase()));
          setGlobalSource(match || detectedSource);
      } else {
          setGlobalSource('Carteira');
      }
    }
  }, [isOpen, initialTransactions, detectedSource]);

  if (!isOpen) return null;

  const handleUpdateRow = (id: number, field: keyof Transaction, value: any) => {
    setStagedData(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleDeleteRow = (id: number) => {
    setStagedData(prev => prev.filter(t => t.id !== id));
  };

  const handleConfirm = () => {
    const finalData = stagedData.map(t => ({ ...t, source: globalSource }));
    onConfirm(finalData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Revisão de Importação" maxWidth="max-w-5xl" footer={<div className="flex justify-between items-center w-full"><div className="text-xs text-text-secondary hidden md:block"><strong className="text-white">{stagedData.length}</strong> transações serão marcadas como <strong className="text-primary">{globalSource}</strong>.</div><div className="flex gap-3 w-full md:w-auto"><Button onClick={onClose} variant="ghost">Cancelar</Button><Button onClick={handleConfirm} variant="primary" disabled={stagedData.length === 0}>Confirmar Importação</Button></div></div>}>
        <div className="mb-6 flex items-center justify-between bg-zinc-800/50 p-4 rounded-xl border border-white/5">
             <Text variant="secondary">Detectamos {stagedData.length} itens. Defina a origem e verifique abaixo.</Text>
             <div className="flex items-center gap-3"><Text variant="label">Origem:</Text><input list="sources" value={globalSource} onChange={(e) => setGlobalSource(e.target.value)} className="bg-zinc-900 text-white text-sm font-bold px-3 py-1.5 rounded-lg border border-white/10 focus:border-primary/50 outline-none w-40" placeholder="Ex: Nubank" /><datalist id="sources">{SOURCES_OPTIONS.map(s => <option key={s} value={s} />)}</datalist></div>
        </div>
        <div className="space-y-3 bg-zinc-900/30 rounded-2xl p-1">
            {stagedData.map((t) => (
            <div key={t.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-xl bg-black border border-white/5 hover:border-white/10 transition-colors items-center group">
                <div className="md:col-span-2"><label className="block md:hidden text-[10px] font-bold text-text-secondary uppercase mb-1">Data</label><input type="date" value={t.date} onChange={e => handleUpdateRow(t.id, 'date', e.target.value)} className="w-full bg-transparent border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-primary/50 focus:outline-none [color-scheme:dark]" /></div>
                <div className="md:col-span-5"><label className="block md:hidden text-[10px] font-bold text-text-secondary uppercase mb-1">Descrição</label><input type="text" value={t.description} onChange={e => handleUpdateRow(t.id, 'description', e.target.value)} className="w-full bg-transparent border-none rounded-lg px-0 py-1.5 text-sm font-bold text-white focus:ring-0 focus:bg-white/5 transition-colors" /><div className="flex gap-2 mt-1">{t.installments && (<span className="text-[10px] bg-white/5 text-text-secondary px-1.5 rounded border border-white/5">Parcela {t.installments.current}/{t.installments.total}</span>)}</div></div>
                <div className="md:col-span-3"><label className="block md:hidden text-[10px] font-bold text-text-secondary uppercase mb-1">Categoria</label><select value={t.category} onChange={e => handleUpdateRow(t.id, 'category', e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-text-secondary focus:text-white focus:border-primary/50 focus:outline-none">{['Geral', 'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Serviços', 'Salário', 'Investimento'].map(c => (<option key={c} value={c}>{c}</option>))}</select></div>
                <div className="md:col-span-1 relative"><label className="block md:hidden text-[10px] font-bold text-text-secondary uppercase mb-1">Valor</label><input type="number" step="0.01" value={t.amount} onChange={e => handleUpdateRow(t.id, 'amount', parseFloat(e.target.value))} className={`w-full bg-transparent border border-white/10 rounded-lg px-2 py-1.5 text-xs font-bold focus:border-primary/50 focus:outline-none text-right ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`} /></div>
                <div className="md:col-span-1 flex justify-end"><IconButton icon="delete" onClick={() => handleDeleteRow(t.id)} variant="danger" className="opacity-0 group-hover:opacity-100" /></div>
            </div>
            ))}
            {stagedData.length === 0 && (<div className="py-10 text-center text-text-secondary">Todas as linhas foram removidas. Nada será importado.</div>)}
        </div>
    </Modal>
  );
};

const AssignPeerModal: React.FC<{ isOpen: boolean; onClose: () => void; transaction: Transaction | null; }> = ({ isOpen, onClose, transaction }) => {
  const { peers, updateTransaction } = useFinancial();
  if (!isOpen || !transaction) return null;
  const handleAssign = (peerId: string) => { updateTransaction(transaction.id, { peerId }); onClose(); };
  const handleRemove = () => { updateTransaction(transaction.id, { peerId: undefined }); onClose(); };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delegar Transação" maxWidth="max-w-sm">
          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
            <Text variant="label">Transação</Text>
            <p className="text-white font-medium truncate">{transaction.description}</p>
            <p className="text-emerald-400 font-bold mt-1">R$ {transaction.amount.toFixed(2)}</p>
          </div>
          <div className="space-y-2">
            {peers.map(peer => (
              <button key={peer.id} onClick={() => handleAssign(peer.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${transaction.peerId === peer.id ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                <div className="w-8 h-8 rounded-full bg-cover bg-center flex-shrink-0" style={{backgroundImage: `url(${peer.avatar})`}}></div>
                <p className={`text-sm font-bold truncate ${transaction.peerId === peer.id ? 'text-primary' : 'text-white'}`}>{peer.name}</p>
              </button>
            ))}
          </div>
          {transaction.peerId && <Button onClick={handleRemove} variant="danger" size="sm" className="w-full mt-4">Remover Atribuição</Button>}
    </Modal>
  );
};

const UploadModal: React.FC<{ isOpen: boolean; onClose: () => void; onReviewRequested: (transactions: Transaction[], detectedSource?: string) => void; }> = ({ isOpen, onClose, onReviewRequested }) => {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const fileToBase64 = (file: File): Promise<string> => { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve((reader.result as string).split(',')[1]); reader.onerror = error => reject(error); }); };
  
  const processFile = async (fileId: string, file: File) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'processing' } : f));
    try {
      const base64 = await fileToBase64(file);
      const aiResult = await extractTransactionsFromDocument(base64, file.type);
      const rawItems = aiResult.items || [];
      const detectedSource = aiResult.bankName;
      if (rawItems && Array.isArray(rawItems)) {
        const newTransactions: Transaction[] = rawItems.map((t: any) => ({ id: Date.now() + Math.random(), description: t.description || 'Transação Importada', amount: Number(t.amount) || 0, date: t.date || new Date().toISOString().split('T')[0], category: t.category || 'Geral', type: t.type || 'expense', source: 'Importado', icon: t.type === 'income' ? 'attach_money' : 'receipt_long', installments: t.installments }));
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'success', extractedData: newTransactions, detectedSource: detectedSource } : f));
      } else { throw new Error("Formato inválido"); }
    } catch (error) { setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error', errorMessage: "Falha ao ler o arquivo" } : f)); }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) { const newFiles = Array.from(e.target.files).map((file: any) => ({ id: Math.random().toString(36).substr(2, 9), file: file as File, status: 'pending' as const })); setFiles(prev => [...newFiles, ...prev]); newFiles.forEach(f => processFile(f.id, f.file)); } };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) { const newFiles = Array.from(e.dataTransfer.files).map((file: any) => ({ id: Math.random().toString(36).substr(2, 9), file: file as File, status: 'pending' as const })); setFiles(prev => [...newFiles, ...prev]); newFiles.forEach(f => processFile(f.id, f.file)); } };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Documentos" maxWidth="max-w-3xl" footer={<div className="flex justify-end"><Button onClick={onClose} variant="secondary">Fechar</Button></div>}>
           <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`relative overflow-hidden flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-12 transition-all duration-300 cursor-pointer group ${isDragging ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/30 hover:bg-white/[0.02]'}`}>
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/png, image/jpeg, application/pdf" onChange={handleFileSelect} />
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isDragging ? 'bg-primary text-white' : 'bg-white/5 text-text-secondary group-hover:text-primary group-hover:bg-primary/10'}`}><Icon name="upload_file" className="text-3xl" /></div>
            <div className="text-center"><p className="text-white font-bold text-lg">Clique ou arraste arquivos aqui</p><p className="text-text-secondary text-sm mt-1">PDF, JPG ou PNG</p></div>
          </div>
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <Text variant="label">Arquivos Processados</Text>
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded flex-shrink-0 flex items-center justify-center ${file.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : file.status === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}><Icon name={file.status === 'success' ? 'check' : file.status === 'error' ? 'close' : 'sync'} className={file.status === 'processing' ? 'animate-spin' : ''} /></div>
                    <div className="min-w-0"><p className="text-sm font-medium text-white truncate max-w-[150px] md:max-w-[300px]">{file.file.name}</p><p className="text-xs text-text-secondary capitalize">{file.status === 'processing' ? 'IA Analisando...' : file.status}</p></div>
                  </div>
                  {file.status === 'success' && file.extractedData && ( <button onClick={() => onReviewRequested(file.extractedData || [], file.detectedSource)} className="ml-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg border border-white/5 transition-colors flex items-center gap-1">Revisar <span className="bg-emerald-500/20 text-emerald-400 px-1.5 rounded text-[10px] ml-1">+{file.extractedData.length}</span></button> )}
                </div>
              ))}
            </div>
          )}
    </Modal>
  );
};

// --- CALENDAR VIEW COMPONENT ---
const CalendarView: React.FC<{ transactions: Transaction[], currentDate: string }> = ({ transactions, currentDate }) => {
    const year = parseInt(currentDate.split('-')[0]);
    const month = parseInt(currentDate.split('-')[1]);
    
    // Get days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
    
    const calendarDays = [];
    // Padding for empty start days
    for(let i=0; i < firstDayOfMonth; i++) calendarDays.push(null);
    // Actual days
    for(let i=1; i <= daysInMonth; i++) calendarDays.push(i);
    
    const getDailyTotal = (day: number) => {
        const dayStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        return transactions
            .filter(t => t.date === dayStr && t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);
    };

    const getDailyIncome = (day: number) => {
        const dayStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        return transactions
            .filter(t => t.date === dayStr && t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);
    };

    const maxDailySpend = Math.max(...calendarDays.filter(d => d !== null).map(d => getDailyTotal(d as number)), 1);

    return (
        <div className="grid grid-cols-7 gap-2 animate-fade-in">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-text-secondary uppercase py-2">{d}</div>
            ))}
            
            {calendarDays.map((day, idx) => {
                if (day === null) return <div key={idx} className="h-24 bg-transparent"></div>;
                
                const spend = getDailyTotal(day);
                const income = getDailyIncome(day);
                const intensity = Math.min(1, spend / (maxDailySpend || 1));
                
                return (
                    <div key={idx} className="calendar-day h-24 rounded-xl border border-white/5 bg-zinc-900/50 p-2 flex flex-col justify-between relative overflow-hidden hover:border-white/20 group cursor-default">
                        {spend > 0 && (
                            <div 
                                className="absolute bottom-0 left-0 right-0 bg-rose-500/10 transition-all"
                                style={{ height: `${intensity * 100}%` }}
                            ></div>
                        )}
                        <span className="text-xs font-bold text-text-secondary z-10">{day}</span>
                        
                        <div className="z-10 flex flex-col gap-1 items-end">
                            {income > 0 && <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded">+{new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(income)}</span>}
                            {spend > 0 && <span className="text-[10px] font-bold text-white">-{new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(spend)}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}


// --- MAIN PAGE ---
const DetailedExpenses: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, peers, updateTransaction } = useFinancial();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7)); 
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewTransactions, setReviewTransactions] = useState<Transaction[]>([]);
  const [detectedSource, setDetectedSource] = useState<string | undefined>(undefined);
  
  const availableMonths = useMemo<string[]>(() => {
     const months = new Set<string>();
     transactions.forEach(t => { months.add(t.date.substring(0, 7)); });
     return Array.from(months).sort().reverse();
  }, [transactions]);

  const handleReviewRequested = (extracted: Transaction[], source?: string) => {
    setReviewTransactions(extracted);
    setDetectedSource(source);
    setIsUploadOpen(false);
    setIsReviewOpen(true);
  };

  const handleReviewConfirmed = (confirmedData: Transaction[]) => {
    confirmedData.forEach(t => addTransaction(t));
  };

  const handleOpenAssign = (t: Transaction) => {
    setSelectedTransaction(t);
    setAssignModalOpen(true);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesText = t.description.toLowerCase().includes(filterText.toLowerCase()) || t.category.toLowerCase().includes(filterText.toLowerCase()) || (t.source && t.source.toLowerCase().includes(filterText.toLowerCase()));
    const matchesMonth = filterMonth ? t.date.startsWith(filterMonth) : true;
    return matchesText && matchesMonth;
  });
  
  filteredTransactions.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.id - a.id;
  });

  const viewTotals = useMemo(() => {
      return filteredTransactions.reduce((acc, curr) => {
          if (curr.type === 'income') acc.income += curr.amount;
          else acc.expense += curr.amount;
          return acc;
      }, { income: 0, expense: 0 });
  }, [filteredTransactions]);
  const viewBalance = viewTotals.income - viewTotals.expense;

  const getPeerInfo = (peerId?: string) => { if(!peerId) return null; return peers.find(p => p.id === peerId); };
  const formatDateFriendly = (dateStr: string) => { const today = new Date().toISOString().split('T')[0]; const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]; if (dateStr === today) return 'Hoje'; if (dateStr === yesterday) return 'Ontem'; const [y, m, d] = dateStr.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }); }

  const groupedTransactions = useMemo(() => {
      const groups: Record<string, Transaction[]> = {};
      filteredTransactions.forEach(t => { if (!groups[t.date]) groups[t.date] = []; groups[t.date].push(t); });
      return groups;
  }, [filteredTransactions]);

  return (
    <div className="flex flex-col h-full animate-fade-in relative">
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onReviewRequested={handleReviewRequested} />
      <ReviewStagingModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} initialTransactions={reviewTransactions} detectedSource={detectedSource} onConfirm={handleReviewConfirmed} />
      <ManualEntryModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
      <AssignPeerModal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} transaction={selectedTransaction} />

      <PageHeader 
        title="Transações"
        actions={
             <div className="flex items-center justify-between w-full md:w-auto gap-3">
                <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-white/5 mr-2">
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-white shadow-sm' : 'text-text-secondary hover:text-white'}`} title="Lista"><Icon name="list" className="text-lg" /></button>
                    <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-zinc-800 text-white shadow-sm' : 'text-text-secondary hover:text-white'}`} title="Calendário"><Icon name="calendar_month" className="text-lg" /></button>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setIsUploadOpen(true)} className="hidden md:flex group relative items-center gap-2 bg-gradient-to-r from-emerald-600 to-primary text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02]">
                        <Icon name="auto_awesome" className="text-lg" />
                        <span>Importar (IA)</span>
                    </button>
                    <Button onClick={() => setIsManualOpen(true)} variant="secondary" icon="add">
                        <span className="hidden sm:inline">Manual</span>
                    </Button>
                </div>
            </div>
        }
      />
      
      <div className="shrink-0 z-20 px-4 md:px-8 py-2 border-b border-white/5 bg-background-dark/50 backdrop-blur-md">
         <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-4">
            {/* Filters & Stats */}
            {transactions.length > 0 && (
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between pb-2">
                    <div className="flex flex-col gap-3 w-full lg:w-auto">
                         <div className="flex items-center gap-2">
                            <div className="relative flex-1 lg:w-64 group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                                    <Icon name="search" className="text-lg group-focus-within:text-primary transition-colors" />
                                </span>
                                <input
                                    value={filterText}
                                    onChange={(e) => { setFilterText(e.target.value); }}
                                    className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-text-secondary/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/40 outline-none transition-all"
                                    placeholder="Buscar..."
                                />
                            </div>
                            <div className="relative flex-1 lg:w-48">
                                <select value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); }} className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-2.5 pl-3 pr-10 text-sm text-white focus:border-primary/40 focus:ring-1 focus:ring-primary/40 outline-none appearance-none cursor-pointer font-medium">
                                    <option value="">Todos os meses</option>
                                    {availableMonths.map(month => ( <option key={month} value={month}> {new Date(month + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} </option> ))}
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                                    <Icon name="expand_more" />
                                </span>
                            </div>
                        </div>
                        
                        {/* Smart Filter Chips */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                             {['Alimentação', 'Transporte', 'Mercado', 'Lazer'].map(cat => (
                                 <button key={cat} onClick={() => setFilterText(cat)} className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold text-text-secondary hover:text-white whitespace-nowrap transition-colors">
                                     {cat}
                                 </button>
                             ))}
                             {filterText && <button onClick={() => setFilterText('')} className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">Limpar</button>}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs w-full lg:w-auto justify-between lg:justify-end border-t border-white/5 lg:border-0 pt-3 lg:pt-0 px-1">
                         <div className="flex gap-6">
                            <div className="text-right">
                                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Entradas</p>
                                <p className="text-emerald-400 font-bold text-base">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: "compact" }).format(viewTotals.income)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Saídas</p>
                                <p className="text-white font-bold text-base">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: "compact" }).format(viewTotals.expense)}</p>
                            </div>
                         </div>
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 pb-24 md:pb-8">
         <div className="w-full max-w-[1600px] mx-auto pt-6">
            {transactions.length === 0 ? (
                <EmptyState 
                    icon="receipt_long"
                    title="Nenhuma transação encontrada"
                    description="Use a IA para importar extratos PDF/Imagens ou adicione manualmente."
                    action={
                        <Button onClick={() => setIsUploadOpen(true)} variant="primary" icon="auto_awesome">
                            Importar Agora
                        </Button>
                    }
                />
            ) : (
                <>
                    {viewMode === 'calendar' ? (
                        <CalendarView transactions={filteredTransactions} currentDate={filterMonth || new Date().toISOString().slice(0,7)} />
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(groupedTransactions).sort((a, b) => b[0].localeCompare(a[0])).map(([date, dayTransactions]: [string, Transaction[]]) => (
                                <div key={date} className="relative animate-fade-in">
                                    <div className="sticky top-0 z-30 bg-background-dark/95 backdrop-blur-sm py-2 mb-2 border-b border-white/5 flex items-center gap-3 shadow-sm">
                                        <h3 className="text-sm font-bold text-white capitalize ml-2">{formatDateFriendly(date)}</h3>
                                        <span className="text-xs text-text-secondary font-mono opacity-60">
                                            {new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date(date))}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-2">
                                        {dayTransactions.map((t) => {
                                            const peer = getPeerInfo(t.peerId);
                                            return (
                                            <div key={t.id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all duration-200 cursor-pointer relative overflow-hidden">
                                                <div className="flex items-center gap-4 z-10 min-w-0">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-900 text-text-secondary group-hover:text-white'} transition-colors shadow-sm`}>
                                                        <Icon name={t.icon} className="text-xl" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold text-white truncate">{t.description}</p>
                                                            {t.installments && (
                                                                <span className="text-[9px] px-1.5 rounded bg-white/5 text-text-secondary border border-white/5 font-mono">
                                                                    {t.installments.current}/{t.installments.total}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                                                            <Badge variant="neutral" className="py-0 px-1.5 text-[9px] h-5">{t.category}</Badge>
                                                            <span className={`px-1.5 rounded-[4px] text-[9px] font-bold border ${getSourceColor(t.source)}`}>
                                                                {t.source}
                                                            </span>
                                                            {peer && (
                                                                <div className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-1.5 rounded border border-indigo-500/10">
                                                                    <Icon name="person" className="text-[10px]" />
                                                                    <span className="text-[9px] font-bold">{peer.name.split(' ')[0]}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-right z-10 pl-4 flex flex-col items-end gap-1">
                                                    <span className={`text-sm font-bold tracking-tight ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                                        {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                                                    </span>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <IconButton icon="person_add" onClick={(e) => { e.stopPropagation(); handleOpenAssign(t); }} title="Delegar / Dividir" />
                                                        <IconButton icon="delete" variant="danger" onClick={(e) => { e.stopPropagation(); deleteTransaction(t.id); }} title="Excluir" />
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
         </div>
      </div>
    </div>
  );
};

export default DetailedExpenses;
