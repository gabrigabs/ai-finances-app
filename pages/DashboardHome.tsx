
import React from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Area, AreaChart, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { PageHeader, Card, Heading, Text, Icon, Badge, Button, EmptyState } from '../components/DesignSystem';

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/95 border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md z-50">
        <p className="text-text-secondary text-[10px] mb-1 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-white font-bold text-sm">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const DashboardHome: React.FC = () => {
  const { stats, transactions, insights, isLoadingInsights, userProfile } = useFinancial();

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id - a.id)
    .slice(0, 5);

  // EMPTY STATE HANDLING
  if (transactions.length === 0) {
    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Visão Geral" />
            <div className="flex-1 flex items-center justify-center pb-20">
                 <EmptyState
                    icon="dashboard"
                    title="Bem-vindo ao Finanças IA"
                    description="Seu painel está pronto. Para gerar insights inteligentes e gráficos, precisamos dos seus primeiros dados."
                    action={
                        <div className="flex gap-3">
                            <Link to="/app/expenses">
                                <Button variant="primary" icon="cloud_upload">Importar com IA</Button>
                            </Link>
                            <Link to="/app/expenses">
                                <Button variant="secondary" icon="edit">Manual</Button>
                            </Link>
                        </div>
                    }
                 />
            </div>
        </div>
    );
  }

  // DATA PREPARATION
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const dataPie = Object.entries(expensesByCategory).map(([name, value], index) => ({
    name,
    value,
    color: [`#10b981`, `#34d399`, `#059669`, `#047857`, `#6ee7b7`][index % 5]
  }));

  // Mock Data for chart consistency simulation
  const dataBar = [
    { name: 'Sem 1', receita: stats.totalIncome * 0.2, despesa: stats.totalExpense * 0.25 },
    { name: 'Sem 2', receita: stats.totalIncome * 0.3, despesa: stats.totalExpense * 0.15 },
    { name: 'Sem 3', receita: stats.totalIncome * 0.1, despesa: stats.totalExpense * 0.4 },
    { name: 'Sem 4', receita: stats.totalIncome * 0.4, despesa: stats.totalExpense * 0.2 },
  ];

  const primaryGoal = userProfile?.goals?.[0] || "Saúde Financeira";

  return (
    <div className="flex flex-col h-full animate-fade-in">
        
        <PageHeader 
            title="Visão Geral"
            description="Resumo executivo da sua saúde financeira."
            actions={
                <div className="flex gap-3 w-full md:w-auto">
                    <Link to="/app/expenses" className="flex-1 md:flex-none">
                        <Button variant="primary" icon="add" size="sm" className="w-full">Nova Transação</Button>
                    </Link>
                </div>
            }
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-32 md:pb-8">
            <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-6">
                
                {/* User Focus Banner */}
                {userProfile && (
                    <div className="w-full p-1 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-900/20 border border-white/5 relative overflow-hidden shadow-lg">
                        <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4 relative z-10">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 animate-pulse-slow">
                                    <Icon name="flag" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Foco Atual</p>
                                    <h3 className="text-lg font-bold text-white">{primaryGoal}</h3>
                                </div>
                             </div>
                             <div className="flex items-center gap-6">
                                 <div className="text-right hidden md:block">
                                     <p className="text-[10px] text-text-secondary font-bold uppercase">Renda Mensal</p>
                                     <p className="text-sm font-bold text-white">R$ {userProfile.monthlyIncome.toLocaleString()}</p>
                                 </div>
                                 <Link to="/app/ai">
                                    <Button size="sm" variant="secondary" icon="insights">Ver Estratégia</Button>
                                 </Link>
                             </div>
                        </div>
                    </div>
                )}

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* 1. HERO STATS CARD */}
                    <div className="md:col-span-12 lg:col-span-4 rounded-3xl p-1 relative overflow-hidden group border border-white/5 bg-gradient-to-b from-zinc-900 to-black shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-transparent z-0"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                        
                        <div className="relative z-10 p-7 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                                        <Icon name="account_balance_wallet" />
                                    </div>
                                    <span className="text-sm font-bold text-emerald-100 tracking-wide uppercase opacity-80">Saldo Total</span>
                                </div>
                                <Badge variant="success" className="flex items-center gap-1">
                                    <Icon name="trending_up" className="text-sm" /> +12%
                                </Badge>
                            </div>
                            
                            <div className="mt-8 mb-6">
                                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-none">
                                    <span className="text-2xl align-top opacity-50 mr-1 font-medium">R$</span>
                                    {formatCurrency(stats.balance).replace('R$', '').trim()}
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                                <div>
                                    <Text variant="label" className="mb-1">Entradas</Text>
                                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(stats.totalIncome)}</p>
                                </div>
                                <div className="relative pl-4 border-l border-white/5">
                                    <Text variant="label" className="mb-1">Saídas</Text>
                                    <p className="text-lg font-bold text-rose-400">{formatCurrency(stats.totalExpense)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. MAIN CHART */}
                    <Card className="md:col-span-12 lg:col-span-8 flex flex-col">
                        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                            <div>
                                <Heading size="h4">Fluxo de Caixa</Heading>
                                <Text variant="secondary">Comparativo Receita x Despesa</Text>
                            </div>
                            <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-white/5">
                                {['7D', '30D', '3M', '1A'].map(t => (
                                    <button key={t} className={`text-[10px] font-bold px-4 py-1.5 rounded-lg transition-all ${t === '30D' ? 'bg-zinc-800 text-white shadow-sm border border-white/5' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}>{t}</button>
                                ))}
                            </div>
                        </div>
                        <div className="w-full h-[250px] md:h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dataBar} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="name" tick={{fill: '#71717a', fontSize: 10, fontWeight: 600}} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{fill: '#71717a', fontSize: 10, fontWeight: 600}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1}} />
                                    <Area type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" activeDot={{r: 6, strokeWidth: 0}} />
                                    <Area type="monotone" dataKey="despesa" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorDespesa)" activeDot={{r: 6, strokeWidth: 0}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* 3. LATEST TRANSACTIONS (UX Improvement) */}
                    <Card className="md:col-span-6 lg:col-span-4 flex flex-col" noPadding>
                        <div className="p-5 border-b border-white/5 flex justify-between items-center">
                             <Heading size="h4">Últimas Transações</Heading>
                             <Link to="/app/expenses" className="text-xs font-bold text-primary hover:underline">Ver tudo</Link>
                        </div>
                        <div className="p-2">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group cursor-default">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-white/5 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-text-secondary'}`}>
                                                <Icon name={t.icon} className="text-lg" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{t.description}</p>
                                                <p className="text-[10px] text-text-secondary">{t.date.split('-').reverse().slice(0,2).join('/')} • {t.category}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                            {t.type === 'expense' && '-'} {formatCurrency(t.amount)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-text-secondary text-xs">Sem movimentações recentes.</div>
                            )}
                        </div>
                    </Card>

                    {/* 4. AI INSIGHTS & CATEGORIES */}
                    <div className="md:col-span-6 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Insights */}
                        <Card className="relative overflow-hidden">
                             <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>
                             <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <Icon name="auto_awesome" className="text-primary text-lg" />
                                    <Heading size="h4">Insights da IA</Heading>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {insights.length > 0 ? (
                                    insights.slice(0,2).map((alert, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 flex gap-3">
                                            <div className={`mt-0.5 ${alert.type === 'warning' ? 'text-amber-400' : alert.type === 'success' ? 'text-emerald-400' : 'text-blue-400'}`}>
                                                <Icon name={alert.icon || 'info'} className="text-base" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{alert.title}</p>
                                                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{alert.message}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4 text-text-secondary gap-2 border border-dashed border-white/5 rounded-xl bg-black/20">
                                        <p className="text-xs font-medium opacity-60">A IA está analisando seus dados...</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Mini Categories Chart */}
                        <Card className="flex flex-col">
                            <Heading size="h4" className="mb-4">Top Categorias</Heading>
                            <div className="flex gap-4 items-center h-full">
                                <div className="w-[100px] h-[100px] relative shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dataPie}
                                                innerRadius={35}
                                                outerRadius={50}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={4}
                                            >
                                                {dataPie.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex-1 space-y-1">
                                    {dataPie.slice(0,3).map((item, i) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                                                <span className="text-text-secondary text-xs font-medium truncate">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-white text-xs">{((Number(item.value) / stats.totalExpense) * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};

export default DashboardHome;
