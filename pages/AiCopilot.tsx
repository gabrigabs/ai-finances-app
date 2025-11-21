
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFinancial, Transaction } from '../context/FinancialContext';
import { chatWithFinancialData } from '../services/ai';
import { PageHeader, Card, Heading, Text, Badge, Icon, Button } from '../components/DesignSystem';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

// --- HELPER COMPONENTS ---

const RecurringAuditRow = ({ name, amount, status }: { name: string, amount: number, status: 'ok' | 'high' | 'review' }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors group">
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold 
                ${status === 'high' ? 'bg-rose-500/10 text-rose-500' : 
                  status === 'review' ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-emerald-500/10 text-emerald-500'}`}>
                <Icon name={status === 'high' ? 'trending_up' : status === 'review' ? 'warning' : 'check'} />
            </div>
            <div>
                <p className="text-sm font-bold text-white">{name}</p>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Mensal</p>
            </div>
        </div>
        <div className="text-right">
             <p className="text-sm font-bold text-white">R$ {amount.toFixed(2)}</p>
             {status === 'high' && <span className="text-[10px] text-rose-400 font-bold">Alta de 10%</span>}
        </div>
    </div>
);

const FloatingChatWindow = ({ isOpen, onClose, messages, onSendMessage, isTyping, userGoals }: any) => {
    const [input, setInput] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    // Quick Prompts
    const SUGGESTIONS = [
        "Como reduzir meus gastos?",
        "Analise minhas assinaturas",
        "Estou gastando muito com Lazer?",
        "Projete meu saldo para o fim do mês"
    ];

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!input.trim()) return;
        onSendMessage(input);
        setInput("");
    }

    const handleSuggestionClick = (text: string) => {
        onSendMessage(text);
    };

    return (
        <div className="fixed bottom-24 right-4 md:right-6 w-[calc(100vw-2rem)] md:w-[380px] h-[500px] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in backdrop-blur-xl">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-lg shadow-primary/10">
                        <Icon name="smart_toy" className="text-white text-sm" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Consultor IA</h3>
                        <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-text-secondary">
                    <Icon name="close" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/20">
                {messages.map((msg: Message) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                            msg.sender === 'user' 
                                ? 'bg-primary text-black rounded-br-sm font-medium' 
                                : 'bg-zinc-800 text-zinc-200 rounded-bl-sm border border-white/5'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                         <div className="bg-zinc-800 rounded-2xl px-3 py-2 border border-white/5">
                             <Icon name="more_horiz" className="text-text-secondary animate-pulse text-xs" />
                         </div>
                    </div>
                )}

                {/* Quick Suggestions Chips (Only show if few messages) */}
                {!isTyping && messages.length < 3 && (
                    <div className="flex flex-wrap gap-2 mt-4 animate-fade-in">
                        {SUGGESTIONS.map((s, i) => (
                            <button 
                                key={i}
                                onClick={() => handleSuggestionClick(s)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary/10 hover:text-primary border border-white/5 hover:border-primary/20 text-[10px] text-text-secondary transition-all"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 bg-black/40 flex gap-2">
                <input 
                    className="flex-1 bg-zinc-800/50 border border-white/10 rounded-xl px-3 text-xs text-white focus:border-primary/50 outline-none"
                    placeholder="Pergunte sobre seus gastos..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <button type="submit" className="p-2.5 bg-white/5 hover:bg-primary hover:text-black text-white rounded-xl transition-colors">
                    <Icon name="send" className="text-sm" />
                </button>
            </form>
        </div>
    )
}

// --- MAIN PAGE COMPONENT ---

const AiCopilot: React.FC = () => {
  const { transactions, stats, userProfile } = useFinancial();
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // --- DATA ANALYSIS ---

  // 1. 50/30/20 Split
  const budgetSplit = useMemo(() => {
      const split = { needs: 0, wants: 0, savings: 0, total: 0 };
      transactions.filter(t => t.type === 'expense').forEach(t => {
          const cat = t.category;
          if (['Moradia', 'Saúde', 'Educação', 'Serviços', 'Transporte', 'Mercado'].includes(cat)) split.needs += t.amount;
          else if (['Investimento', 'Reserva'].includes(cat)) split.savings += t.amount;
          else split.wants += t.amount;
          split.total += t.amount;
      });
      return split;
  }, [transactions]);

  // 2. Velocity Data
  const velocityData = useMemo(() => {
      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const data = [];
      let cumCurrent = 0;

      for (let i = 1; i <= daysInMonth; i++) {
          // Mock realistic curve for demo if empty
          if (transactions.length < 5) {
             cumCurrent += Math.random() * 200;
             data.push({ day: i, current: i <= today.getDate() ? cumCurrent : null, limit: i * 150 });
             continue;
          }

          // Real logic
          const dayDate = new Date(today.getFullYear(), today.getMonth(), i).toISOString().split('T')[0];
          const dailySum = transactions
            .filter(t => t.type === 'expense' && t.date === dayDate)
            .reduce((acc, t) => acc + t.amount, 0);
            
          if (i <= today.getDate()) {
             cumCurrent += dailySum;
          }
          
          data.push({
              day: i,
              current: i <= today.getDate() ? cumCurrent : null,
              limit: (userProfile?.monthlyIncome || 5000) / daysInMonth * i // Linear projection of income
          });
      }
      return data;
  }, [transactions, userProfile]);

  // 3. Top Categories (Bar Chart)
  const topCategories = useMemo(() => {
      const cats: Record<string, number> = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
          cats[t.category] = (cats[t.category] || 0) + t.amount;
      });
      return Object.entries(cats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
  }, [transactions]);

  // 4. Recurring Identification (Simple Heuristic)
  const recurringExpenses = useMemo(() => {
      return transactions
        .filter(t => t.type === 'expense' && ['Moradia', 'Serviços', 'Educação', 'Saúde'].includes(t.category))
        .slice(0, 4) // Limit for display
        .map(t => ({
            name: t.description,
            amount: t.amount,
            status: t.amount > 500 ? 'high' : 'ok' as any
        }));
  }, [transactions]);

  // --- CHAT HANDLERS ---
  
  useEffect(() => {
    if (messages.length === 0 && userProfile) {
        setMessages([{
            id: 1,
            text: `Olá! Sou seu estrategista financeiro. Analisei seus dados e seu objetivo de "${userProfile.goals[0] || 'Saúde Financeira'}". Como posso te ajudar hoje?`,
            sender: 'ai',
            timestamp: new Date()
        }]);
    }
  }, [userProfile]);

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now(), text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    const response = await chatWithFinancialData(messages, text, transactions, userProfile);
    const aiMsg: Message = { id: Date.now()+1, text: response || "Erro.", sender: 'ai', timestamp: new Date() };
    setIsTyping(false);
    setMessages(prev => [...prev, aiMsg]);
  };

  // --- RENDER ---

  if (!userProfile) {
      return (
          <div className="flex flex-col items-center justify-center h-full bg-black text-center p-8 animate-fade-in">
               <Link to="/onboarding">
                <Button size="lg" icon="arrow_forward">Configurar Perfil</Button>
              </Link>
          </div>
      )
  }

  return (
    <div className="flex flex-col h-full animate-fade-in bg-black text-white overflow-hidden relative">
      <PageHeader 
        title="Estrategista Financeiro"
        description="Painel de controle de saúde financeira e análise preditiva."
        actions={
            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 gap-2">
                     <Icon name="calendar_today" className="text-text-secondary text-xs" />
                     <span className="text-xs font-bold text-white">Mês Atual</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-xs font-bold text-emerald-400">Monitorando</span>
                </div>
            </div>
        }
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-24">
        <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. MAIN VELOCITY CHART (Full Width) */}
            <Card className="lg:col-span-12 min-h-[300px] relative flex flex-col bg-gradient-to-b from-zinc-900 to-black">
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <Heading size="h3">Velocidade de Consumo</Heading>
                        <Text variant="secondary">Acumulado diário vs. Projeção de Renda</Text>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-xs text-text-secondary font-bold uppercase">Gasto Atual</p>
                            <p className="text-xl font-bold text-white">R$ {stats.totalExpense.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-text-secondary font-bold uppercase">Limite Seguro</p>
                            <p className="text-xl font-bold text-emerald-400">R$ {(userProfile.monthlyIncome * 0.8).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={velocityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="day" tick={{fill: '#52525b', fontSize: 10}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fill: '#52525b', fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff', fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="limit" stroke="#52525b" strokeWidth={1} strokeDasharray="5 5" fill="transparent" />
                            <Area type="monotone" dataKey="current" stroke="#10b981" strokeWidth={3} fill="url(#colorCurrent)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* 2. STRATEGIC COLUMNS */}
            
            {/* LEFT: 50/30/20 & Categories */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <Heading size="h4">Distribuição (50/30/20)</Heading>
                        <Icon name="pie_chart" className="text-text-secondary" />
                    </div>
                    <div className="space-y-5">
                         <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-emerald-400">Essenciais (Necessidades)</span>
                                <span className="text-white">{((budgetSplit.needs / (userProfile.monthlyIncome || 1)) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-emerald-500" style={{ width: `${(budgetSplit.needs / (userProfile.monthlyIncome || 1)) * 100}%` }}></div>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-amber-400">Estilo de Vida (Desejos)</span>
                                <span className="text-white">{((budgetSplit.wants / (userProfile.monthlyIncome || 1)) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-amber-500" style={{ width: `${(budgetSplit.wants / (userProfile.monthlyIncome || 1)) * 100}%` }}></div>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-blue-400">Futuro (Investimentos)</span>
                                <span className="text-white">{((budgetSplit.savings / (userProfile.monthlyIncome || 1)) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-blue-500" style={{ width: `${(budgetSplit.savings / (userProfile.monthlyIncome || 1)) * 100}%` }}></div>
                            </div>
                         </div>
                    </div>
                </Card>

                <Card>
                    <Heading size="h4" className="mb-4">Top Categorias</Heading>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCategories} layout="vertical" margin={{ left: 0, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                    {topCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : '#27272a'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* RIGHT: Action Plan & Recurring */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                
                {/* Smart Action Plan (The expanded suggestion area) */}
                <Card className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 bg-primary/5 blur-[80px] rounded-full"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                            <div className="p-2 rounded-lg bg-primary text-black">
                                <Icon name="checklist" />
                            </div>
                            <div>
                                <Heading size="h3">Plano de Ação Estratégico</Heading>
                                <Text variant="secondary">Passos recomendados pela IA para atingir: <span className="text-white font-bold">{userProfile.goals[0]}</span></Text>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Dynamic Actions based on profile */}
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-rose-500/30 transition-colors cursor-pointer group relative overflow-hidden">
                                <div className="absolute left-0 top-0 w-1 h-full bg-rose-500/50 group-hover:bg-rose-500 transition-colors"></div>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="danger">Crítico</Badge>
                                    <Icon name="arrow_forward" className="text-text-secondary group-hover:text-white text-sm" />
                                </div>
                                <p className="font-bold text-white mb-1">Reduzir Gastos Variáveis</p>
                                <p className="text-xs text-text-secondary">Seus gastos com "Lazer" estão 15% acima da média recomendada.</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group relative overflow-hidden">
                                <div className="absolute left-0 top-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors"></div>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="primary">Meta</Badge>
                                    <Icon name="arrow_forward" className="text-text-secondary group-hover:text-white text-sm" />
                                </div>
                                <p className="font-bold text-white mb-1">Aporte em Reserva</p>
                                <p className="text-xs text-text-secondary">Programe um PIX de R$ 300,00 para sua conta de rendimento.</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-amber-500/30 transition-colors cursor-pointer group relative overflow-hidden">
                                <div className="absolute left-0 top-0 w-1 h-full bg-amber-500/50 group-hover:bg-amber-500 transition-colors"></div>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="warning">Revisão</Badge>
                                    <Icon name="arrow_forward" className="text-text-secondary group-hover:text-white text-sm" />
                                </div>
                                <p className="font-bold text-white mb-1">Renegociar Assinaturas</p>
                                <p className="text-xs text-text-secondary">Você tem 4 serviços de streaming ativos. Cancele um.</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-emerald-900/10 border border-emerald-500/20 flex items-center justify-center text-center hover:bg-emerald-900/20 transition-colors cursor-pointer">
                                <div>
                                    <Icon name="add_task" className="text-emerald-500 mb-2 text-2xl opacity-50" />
                                    <p className="text-xs font-bold text-emerald-500">Gerar novos passos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Recurring Audit Table */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Icon name="history" className="text-text-secondary" />
                            <Heading size="h4">Auditoria de Custos Fixos</Heading>
                        </div>
                        <Badge variant="neutral">{recurringExpenses.length} detectados</Badge>
                    </div>
                    
                    <div className="space-y-2">
                        {recurringExpenses.length > 0 ? (
                            recurringExpenses.map((item, idx) => (
                                <RecurringAuditRow key={idx} {...item} />
                            ))
                        ) : (
                            <div className="text-center py-8 text-text-secondary text-xs">
                                Adicione mais transações para detectar recorrências.
                            </div>
                        )}
                    </div>
                </Card>

            </div>
        </div>
      </div>

      {/* FLOATING CHAT BUTTON & WINDOW */}
      <FloatingChatWindow 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        messages={messages}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
        userGoals={userProfile.goals}
      />

      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-6 right-6 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-[60] group border border-white/10
            ${isChatOpen ? 'w-14 bg-zinc-800 text-white' : 'w-auto px-6 bg-primary text-background-dark hover:scale-105'}`}
      >
          {isChatOpen ? (
              <Icon name="close" className="text-xl" />
          ) : (
              <div className="flex items-center gap-3">
                  <Icon name="smart_toy" className="text-2xl" fill />
                  <span className="font-bold text-sm">Consultor IA</span>
              </div>
          )}
      </button>

    </div>
  );
};

export default AiCopilot;
