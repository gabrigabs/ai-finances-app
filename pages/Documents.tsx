
import React, { useState, useRef } from 'react';
import { useFinancial, Transaction } from '../context/FinancialContext';
import { extractTransactionsFromDocument } from '../services/ai';
import { Button, Modal, Badge, Text, Icon, PageHeader } from '../components/DesignSystem';

interface FileUploadState {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  extractedData?: Transaction[];
  detectedSource?: string;
  errorMessage?: string;
}

// Modal Component for Viewing Extracted Data
const ReviewModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  fileName: string; 
  transactions: Transaction[];
}> = ({ isOpen, onClose, fileName, transactions }) => {
  return (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Transações Extraídas"
        maxWidth="max-w-2xl"
        footer={
             <Button onClick={onClose} variant="primary" size="lg">
                Concluir Revisão
             </Button>
        }
    >
        <div className="mb-4 p-3 rounded-xl bg-zinc-800/50 border border-white/5 flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg">
                 <Icon name="description" />
            </div>
            <div>
                <Text variant="label">Arquivo</Text>
                <Text variant="primary" className="font-bold truncate">{fileName}</Text>
            </div>
        </div>
        
        {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-black rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-lg ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      <Icon name={t.icon} className="text-xl" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate">{t.description}</p>
                      <div className="flex gap-2 text-xs text-text-secondary mt-0.5">
                        <Badge variant="neutral">{t.category}</Badge>
                        <span className="py-0.5 whitespace-nowrap">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                        {t.source && <Badge variant="warning">{t.source}</Badge>}
                      </div>
                    </div>
                  </div>
                  <span className={`font-bold text-sm whitespace-nowrap ml-2 ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                    {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-secondary">
              <Icon name="find_in_page" className="text-5xl mb-4 opacity-20" />
              <Text variant="secondary">Nenhuma transação encontrada neste documento.</Text>
            </div>
          )}
    </Modal>
  );
};

const Documents: React.FC = () => {
  const { addTransaction } = useFinancial();
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFileTransactions, setSelectedFileTransactions] = useState<Transaction[]>([]);
  const [selectedFileName, setSelectedFileName] = useState("");

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const processFile = async (fileId: string, file: File) => {
    // Update to processing
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'processing' } : f));

    try {
      const base64 = await fileToBase64(file);
      const aiResult = await extractTransactionsFromDocument(base64, file.type);
      
      const rawItems = aiResult.items || (Array.isArray(aiResult) ? aiResult : []);
      const detectedSource = aiResult.bankName || 'Importado';
      
      if (rawItems && Array.isArray(rawItems)) {
        const newTransactions: Transaction[] = rawItems.map((t: any) => ({
          id: Date.now() + Math.random(),
          description: t.description || 'Transação Importada',
          amount: Number(t.amount) || 0,
          date: t.date || new Date().toISOString().split('T')[0],
          category: t.category || 'Geral',
          type: t.type || 'expense',
          icon: t.type === 'income' ? 'attach_money' : 'receipt_long',
          source: detectedSource
        }));

        // Add to global context
        newTransactions.forEach(t => addTransaction(t));

        // Update success state
        setFiles(prev => prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'success', 
          extractedData: newTransactions 
        } : f));
      } else {
        throw new Error("Formato inválido");
      }
    } catch (error) {
      console.error(error);
      setFiles(prev => prev.map(f => f.id === fileId ? { 
        ...f, 
        status: 'error',
        errorMessage: "Falha ao ler o arquivo" 
      } : f));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        file: file as File,
        status: 'pending' as const
      }));
      setFiles(prev => [...newFiles, ...prev]);
      newFiles.forEach(f => processFile(f.id, f.file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map((file: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        file: file as File,
        status: 'pending' as const
      }));
      setFiles(prev => [...newFiles, ...prev]);
      newFiles.forEach(f => processFile(f.id, f.file));
    }
  };

  const openDetails = (file: FileUploadState) => {
    if (file.extractedData) {
      setSelectedFileTransactions(file.extractedData);
      setSelectedFileName(file.file.name);
      setModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in bg-black">
      <PageHeader 
        title="Digitalizar Documentos" 
        description="Converta extratos e recibos em dados automaticamente."
      />
      
      <ReviewModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        fileName={selectedFileName}
        transactions={selectedFileTransactions}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-24">
        <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col">
            {/* Drag Area */}
            <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative overflow-hidden flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed px-6 py-20 transition-all duration-500 cursor-pointer group bg-zinc-900/50
                ${isDragging 
                ? 'border-primary/50 bg-primary/5 shadow-[0_0_50px_rgba(16,185,129,0.1)]' 
                : 'border-white/10 hover:border-primary/30 hover:bg-white/[0.02]'
                }`}
            >
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/png, image/jpeg, application/pdf" onChange={handleFileSelect} />
            
            <div className={`z-10 flex flex-col items-center gap-4 pointer-events-none transition-transform duration-300 ${isDragging ? 'scale-105' : ''}`}>
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-2 transition-all duration-300 shadow-2xl ${isDragging ? 'bg-primary text-white' : 'bg-zinc-900 border border-white/10 text-emerald-500 group-hover:scale-110 group-hover:border-emerald-500/30'}`}>
                <Icon name="cloud_upload" className="text-5xl" />
                </div>
                <div className="text-center">
                    <p className="text-white text-xl font-bold mb-1">
                    {isDragging ? 'Solte para processar' : 'Clique ou arraste arquivos'}
                    </p>
                    <p className="text-text-secondary text-sm font-medium">PDF, JPG ou PNG até 10MB</p>
                </div>
            </div>
            
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            </div>

            {/* Processing List */}
            {files.length > 0 && (
                <div className="mt-10 animate-fade-in">
                <Text variant="label" className="mb-4 pl-1">Histórico</Text>

                <div className="flex flex-col gap-3">
                    {files.map((file) => (
                    <div key={file.id} className="bg-zinc-900 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-white/5
                            ${file.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 
                            file.status === 'error' ? 'bg-rose-500/10 text-rose-400' : 
                            'bg-blue-500/10 text-blue-400'}`}>
                            <Icon 
                                name={file.status === 'success' ? 'check_circle' : 
                                    file.status === 'error' ? 'error' : 
                                    file.status === 'processing' ? 'sync' : 'hourglass_top'} 
                                className={file.status === 'processing' ? 'animate-spin' : ''}
                            />
                        </div>
                        
                        <div>
                            <p className="text-text-primary text-sm font-bold">{file.file.name}</p>
                            <p className="text-text-secondary text-xs flex items-center gap-1 mt-0.5">
                            {(file.file.size / 1024).toFixed(0)} KB • 
                            <span className="capitalize opacity-80">{file.status === 'success' ? 'Processado' : file.status === 'processing' ? 'IA Analisando...' : file.status === 'error' ? 'Falha' : 'Aguardando'}</span>
                            </p>
                        </div>
                        </div>

                        <div className="flex items-center gap-4">
                        {file.status === 'success' && file.extractedData && (
                            <div className="text-right hidden sm:block mr-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/10">
                                +{file.extractedData.length} itens
                            </span>
                            </div>
                        )}

                        {file.status === 'success' && (
                            <Button size="sm" variant="secondary" onClick={() => openDetails(file)}>
                                Revisar
                            </Button>
                        )}
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
