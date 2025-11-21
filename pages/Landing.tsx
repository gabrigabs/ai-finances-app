
import React from 'react';
import { Link } from 'react-router-dom';

// High Fidelity Dashboard Mockup - Coherent with App Design
const PremiumDashboardMockup = () => {
  return (
    <div className="relative w-full max-w-6xl mx-auto perspective-[2500px] group">
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-primary/20 blur-[120px] -z-10 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700"></div>

      {/* Main Container - Transformed */}
      <div className="relative bg-[#09090b] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden transform rotate-x-[5deg] rotate-y-[-2deg] group-hover:rotate-x-0 group-hover:rotate-y-0 transition-all duration-700 ease-out-expo origin-bottom">
        
        {/* Mock Window Controls */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-white/[0.02] border-b border-white/5 flex items-center px-6 gap-2 z-20 backdrop-blur-md">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-sm"></div>
        </div>

        {/* Layout Mock */}
        <div className="flex h-[600px] pt-12">
            
            {/* Sidebar Mock */}
            <div className="w-20 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-black/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
                    <span className="material-symbols-rounded text-white text-xl">auto_awesome</span>
                </div>
                {['dashboard', 'receipt_long', 'pie_chart', 'smart_toy'].map((icon, i) => (
                    <div key={icon} className={`p-3 rounded-xl ${i === 0 ? 'bg-white/10 text-white' : 'text-zinc-500'} transition-colors`}>
                        <span className="material-symbols-rounded text-xl">{icon}</span>
                    </div>
                ))}
                <div className="mt-auto p-3 rounded-xl text-zinc-500">
                    <span className="material-symbols-rounded text-xl">settings</span>
                </div>
            </div>

            {/* Main Content Mock */}
            <div className="flex-1 p-8 bg-black relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                <div className="relative z-10 flex flex-col gap-6 h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-white">Visão Geral</h3>
                            <p className="text-zinc-400 text-sm">Bem-vindo de volta, João</p>
                        </div>
                        <div className="flex gap-3 items-center">
                             <div className="h-10 w-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400">
                                <span className="material-symbols-rounded text-lg">notifications</span>
                             </div>
                             <div className="h-10 w-10 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center shadow-lg shadow-emerald-500/20">JS</div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                        
                        {/* Big Chart Card */}
                        <div className="md:col-span-2 bg-zinc-900/80 backdrop-blur-sm border border-white/5 rounded-3xl p-6 flex flex-col shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/10 text-emerald-500">
                                        <span className="material-symbols-rounded">account_balance_wallet</span>
                                    </div>
                                    <div>
                                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Saldo Total</p>
                                        <h2 className="text-4xl font-bold text-white tracking-tight">R$ 12.450,00</h2>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-bold flex items-center gap-1">
                                    <span className="material-symbols-rounded text-sm">trending_up</span>
                                    +12%
                                </div>
                            </div>
                            
                            {/* SVG Area Chart with HTML Overlays */}
                            <div className="flex-1 w-full relative mt-4">
                                {/* Base Chart - Stretches to fill */}
                                <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {/* Grid lines */}
                                    <line x1="0" y1="0" x2="400" y2="0" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                                    <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                                    <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                                    <line x1="0" y1="150" x2="400" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                                    <path d="M0,150 L0,100 C50,120 80,60 130,80 C180,100 220,40 270,60 C320,80 350,20 400,40 L400,150 Z" fill="url(#chartGradient)" />
                                    <path d="M0,100 C50,120 80,60 130,80 C180,100 220,40 270,60 C320,80 350,20 400,40" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                </svg>

                                {/* HTML Overlays (Prevents distortion) */}
                                {/* Point 1 (32.5%, 53%) */}
                                <div className="absolute left-[32.5%] top-[53%] w-3 h-3 rounded-full bg-[#09090b] border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform duration-200"></div>
                                
                                {/* Point 2 (67.5%, 40%) */}
                                <div className="absolute left-[67.5%] top-[40%] w-3 h-3 rounded-full bg-[#09090b] border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform duration-200"></div>

                                {/* Tooltip HTML Overlay - Positioned near Point 2 */}
                                <div className="absolute left-[67.5%] top-[15%] transform -translate-x-1/2 bg-[#09090b] border border-white/10 px-4 py-2 rounded-xl shadow-xl backdrop-blur-md z-10 animate-fade-in-up">
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-0.5 text-center">Receita</p>
                                    <p className="text-white text-sm font-bold whitespace-nowrap">R$ 4.200</p>
                                    {/* Little arrow */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-[#09090b] border-r border-b border-white/10 transform rotate-45"></div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-6">
                            {/* AI Insight */}
                            <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-lg group/card">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[60px] rounded-full group-hover/card:bg-primary/30 transition-all duration-500"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <span className="material-symbols-rounded animate-pulse">auto_awesome</span>
                                        </div>
                                        <span className="text-sm font-bold text-white">Insight da IA</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 leading-relaxed mb-5">
                                        Seus gastos com transporte subiram <span className="text-white font-bold">15%</span> este mês. A IA sugere um novo limite para economizar.
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors">
                                            Aceitar
                                        </button>
                                        <button className="px-3 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-colors">
                                            <span className="material-symbols-rounded text-lg">close</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction List Mock */}
                            <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-3xl p-6 flex flex-col gap-5 shadow-lg backdrop-blur-md">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Recentes</p>
                                    <span className="text-[10px] text-primary font-bold cursor-pointer hover:underline">Ver tudo</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {[
                                        { icon: 'shopping_bag', name: 'Amazon', date: 'Hoje', val: '- R$ 240,00', color: 'text-white', iconBg: 'bg-zinc-800' },
                                        { icon: 'payments', name: 'Salário', date: 'Ontem', val: '+ R$ 4.500,00', color: 'text-emerald-400', iconBg: 'bg-emerald-500/10 text-emerald-500' },
                                        { icon: 'local_cafe', name: 'Café', date: 'Ontem', val: '- R$ 15,90', color: 'text-white', iconBg: 'bg-zinc-800' }
                                    ].map((t, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 -mx-2 rounded-xl hover:bg-white/5 transition-colors cursor-default">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.iconBg || 'bg-zinc-800 text-zinc-400'}`}>
                                                    <span className="material-symbols-rounded text-lg">{t.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white">{t.name}</p>
                                                    <p className="text-[10px] text-zinc-500">{t.date}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-bold ${t.color}`}>{t.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const Landing: React.FC = () => {
  return (
    <div className="relative h-full w-full overflow-y-auto custom-scrollbar font-display bg-black text-text-primary selection:bg-primary/30 selection:text-white">
      {/* Background Effects - True Black OLED vibe */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      <div className="fixed top-[-20%] left-[50%] -translate-x-1/2 w-[1000px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none animate-pulse-slow"></div>
      
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/5 bg-black/50">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-gradient-to-tr from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20">
                   <span className="material-symbols-rounded text-white text-lg">auto_awesome</span>
                </div>
                <span className="font-bold text-lg tracking-tight text-white">Finanças IA</span>
            </div>
            <div className="flex items-center gap-6">
                <Link to="/login" className="text-sm font-bold text-text-secondary hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="px-5 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-colors">Começar Agora</Link>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 pt-36 pb-20 md:pt-48 md:pb-32 container mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Versão 3.0 Disponível</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-[1.05]">
          Controle total, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">sem esforço manual.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-medium opacity-80">
          A inteligência artificial que categoriza, analisa e prevê seu futuro financeiro. Abandone as planilhas hoje mesmo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24">
          <Link to="/app/dashboard" className="h-14 px-8 rounded-xl bg-primary hover:bg-primary-light text-background-dark font-bold text-base flex items-center justify-center transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-1">
            Acessar Painel
          </Link>
          <Link to="/register" className="h-14 px-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-base flex items-center justify-center backdrop-blur-sm transition-all hover:border-white/20">
            Criar Conta
          </Link>
        </div>

        {/* Dashboard Preview - New Premium Mockup */}
        <div className="relative max-w-5xl mx-auto animate-fade-in px-4">
            <PremiumDashboardMockup />
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 bg-black relative z-10 border-t border-white/5">
         <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-white mb-4">Por que Finanças IA?</h2>
                <p className="text-text-secondary max-w-xl mx-auto">Tecnologia de ponta para simplificar sua vida financeira.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { icon: 'psychology', title: 'IA Preditiva', desc: 'O sistema aprende seus hábitos e avisa antes que você estoure o orçamento do mês.' },
                    { icon: 'image', title: 'Visualização Criativa', desc: 'Gere imagens de metas financeiras com Nano Banana Pro para visualizar seus sonhos.' },
                    { icon: 'lock', title: 'Segurança Total', desc: 'Seus dados são criptografados de ponta a ponta. Sua privacidade é nossa prioridade.' }
                ].map((feature, i) => (
                    <div key={i} className="group p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-900 transition-all duration-300">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:border-primary/30 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all">
                            <span className="material-symbols-rounded text-primary text-2xl">{feature.icon}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
         </div>
      </section>

      <footer className="border-t border-white/5 bg-black py-12 text-center">
        <p className="text-text-secondary/40 text-xs font-bold tracking-widest uppercase">© 2024 Finanças IA</p>
      </footer>
    </div>
  );
};

export default Landing;
