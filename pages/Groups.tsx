
import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Button, Modal, Input, Heading, Text, PageHeader, Avatar, ProgressBar, Card, Badge, EmptyState } from '../components/DesignSystem';

const SettleDebtModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  peerName: string;
  onConfirm: (amount: number) => void;
}> = ({ isOpen, onClose, peerName, onConfirm }) => {
    const [amount, setAmount] = useState("");

    const handleSubmit = () => {
        const val = parseFloat(amount.replace(',', '.'));
        if (!isNaN(val) && val > 0) {
            onConfirm(val);
            setAmount("");
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Pagamento"
            maxWidth="max-w-sm"
            footer={
                <Button onClick={handleSubmit} variant="primary" size="lg" icon="check">
                    Confirmar Pagamento
                </Button>
            }
        >
            <div className="space-y-4 py-2">
                <Text variant="secondary">Quanto <strong>{peerName}</strong> te pagou?</Text>
                <Input
                    autoFocus
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="text-xl font-bold"
                    icon="attach_money"
                />
            </div>
        </Modal>
    )
}

const Groups: React.FC = () => {
  const { peers, transactions, addTransaction } = useFinancial();
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(peers.length > 0 ? peers[0].id : null);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  
  const selectedPeer = peers.find(p => p.id === selectedPeerId);
  
  // Filter transactions assigned to the selected peer
  const history = selectedPeer ? transactions.filter(t => t.peerId === selectedPeerId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

  // Calculate totals for all peers to display in the list
  const peerStats = peers.map(peer => {
     const peerTransactions = transactions.filter(t => t.peerId === peer.id);
     const expected = peerTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
     const paid = peerTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
     return { ...peer, totalExpected: expected, totalPaid: paid };
  });

  // Calculate Global Total Receivable
  const totalReceivable = peerStats.reduce((acc, curr) => acc + Math.max(0, curr.totalExpected - curr.totalPaid), 0);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="flex flex-col h-full animate-fade-in bg-black">
        {selectedPeer && (
            <SettleDebtModal 
                isOpen={settleModalOpen} 
                onClose={() => setSettleModalOpen(false)} 
                peerName={selectedPeer.name} 
                onConfirm={(amount) => {
                    addTransaction({
                        id: Date.now(),
                        description: `Pagamento de ${selectedPeer.name}`,
                        amount: amount,
                        category: 'Reembolso',
                        date: new Date().toISOString().split('T')[0],
                        type: 'income',
                        icon: 'check_circle',
                        peerId: selectedPeer.id,
                        source: 'Carteira'
                    });
                }}
            />
        )}
        
        <PageHeader 
            title="Gestão de Repasses"
            description="Controle quem te deve baseado nas transações delegadas."
            actions={
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-right pr-4 border-r border-white/10 hidden md:block">
                        <Text variant="label">Total a Receber</Text>
                        <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalReceivable)}</p>
                    </div>
                    <Button icon="person_add" size="md">Nova Pessoa</Button>
                </div>
            }
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-24 md:pb-8">
            <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: List of People */}
                <div className="xl:col-span-4 flex flex-col gap-4">
                    <Text variant="label" className="ml-1">Pessoas</Text>
                    
                    {peers.length === 0 ? (
                        <EmptyState 
                            icon="group_off"
                            title="Sem contatos"
                            description="Adicione pessoas para dividir contas e controlar repasses."
                        />
                    ) : (
                        peerStats.map((peer) => {
                            const remaining = Math.max(0, peer.totalExpected - peer.totalPaid);
                            const isSelected = peer.id === selectedPeerId;

                            return (
                                <div 
                                    key={peer.id}
                                    onClick={() => setSelectedPeerId(peer.id)}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border relative overflow-hidden group
                                        ${isSelected 
                                            ? 'border-primary/30 bg-primary/5 shadow-[0_0_30px_rgba(16,185,129,0.05)]' 
                                            : 'border-white/5 bg-zinc-900 hover:border-white/10 hover:bg-zinc-800'}`}
                                >
                                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                                    
                                    <div className="flex justify-between items-start mb-3 pl-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar src={peer.avatar} size="md" />
                                            <div>
                                                <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-text-primary'}`}>{peer.name}</p>
                                                <p className="text-xs text-text-secondary">{peer.email}</p>
                                            </div>
                                        </div>
                                        {remaining <= 0 && peer.totalExpected > 0 ? (
                                            <Badge variant="success">Quitado</Badge>
                                        ) : remaining > 0 ? (
                                            <Badge variant="warning">Pendente</Badge>
                                        ) : (
                                            <Badge variant="neutral">Sem Dívidas</Badge>
                                        )}
                                    </div>

                                    <div className="pl-2 space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <Text variant="label">Restante</Text>
                                                <p className={`text-lg font-bold ${remaining > 0 ? 'text-white' : 'text-text-secondary opacity-60'}`}>{formatCurrency(remaining)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-text-secondary">Pago: {formatCurrency(peer.totalPaid)}</p>
                                            </div>
                                        </div>
                                        {/* Progress Bar */}
                                        {peer.totalExpected > 0 && (
                                            <ProgressBar value={peer.totalPaid} max={peer.totalExpected} variant={remaining <= 0 ? 'success' : 'primary'} />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Right Column: Detail & History */}
                {selectedPeer && (
                    <div className="xl:col-span-8 flex flex-col gap-6 animate-fade-in">
                        {(() => {
                            const pStat = peerStats.find(p => p.id === selectedPeer.id) || { totalExpected: 0, totalPaid: 0 };
                            const remaining = Math.max(0, pStat.totalExpected - pStat.totalPaid);
                            
                            return (
                            <>
                                {/* Main Detail Card */}
                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                                    
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8 mb-8">
                                        <div className="flex items-center gap-5">
                                            <Avatar src={selectedPeer.avatar} size="lg" className="rounded-2xl shadow-2xl ring-1 ring-white/10" />
                                            <div>
                                                <Heading size="h2">{selectedPeer.name}</Heading>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-text-secondary text-xs font-medium flex items-center gap-1">
                                                        <span className="material-symbols-rounded text-sm">mail</span>
                                                        {selectedPeer.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <Button 
                                                onClick={() => setSettleModalOpen(true)}
                                                variant="primary"
                                                className="bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20"
                                                icon="check"
                                            >
                                                Registrar Pagamento
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                            <Text variant="label" className="mb-1">Total Delegado</Text>
                                            <p className="text-xl font-bold text-white">{formatCurrency(pStat.totalExpected)}</p>
                                            <p className="text-[10px] text-text-secondary mt-1 opacity-60">Dívida Total</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                            <Text variant="label" className="mb-1 text-emerald-500">Total Reembolsado</Text>
                                            <p className="text-xl font-bold text-emerald-400">{formatCurrency(pStat.totalPaid)}</p>
                                            <p className="text-[10px] text-text-secondary mt-1 opacity-60">Já devolvido</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 relative overflow-hidden">
                                            {remaining > 0 && <div className="absolute right-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                                            <Text variant="label" className="mb-1 text-amber-500">Saldo Pendente</Text>
                                            <p className="text-xl font-bold text-amber-400">{formatCurrency(remaining)}</p>
                                            <p className="text-[10px] text-text-secondary mt-1 opacity-60">Falta receber</p>
                                        </div>
                                    </div>
                                </Card>
                            </>
                            );
                        })()}

                        {/* Transaction List */}
                        <Card className="flex flex-col" noPadding>
                            <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                                <Heading size="h3" className="text-sm">Histórico de Movimentações</Heading>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[600px]">
                                    <thead className="bg-white/[0.02]">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Data</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Descrição</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider">Tipo</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {history.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 text-sm text-text-secondary font-medium">
                                                    {new Date(item.date).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white font-bold">
                                                    {item.description}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.type === 'expense' ? (
                                                        <Badge variant="warning" className="gap-1">
                                                            <span className="material-symbols-rounded text-sm">arrow_outward</span>
                                                            Repasse
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="success" className="gap-1">
                                                            <span className="material-symbols-rounded text-sm">call_received</span>
                                                            Pagamento
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className={`px-6 py-4 text-sm font-bold text-right ${item.type === 'expense' ? 'text-white' : 'text-emerald-400'}`}>
                                                    {item.type === 'income' && '+ '}{formatCurrency(item.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {history.length === 0 && (
                                <div className="p-8">
                                    <EmptyState 
                                        icon="receipt_long"
                                        title="Sem histórico"
                                        description="Nenhum registro encontrado para esta pessoa."
                                    />
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Groups;
