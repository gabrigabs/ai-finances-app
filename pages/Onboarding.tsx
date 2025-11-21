
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinancial } from '../context/FinancialContext';
import { Button, Heading, Text, Input, Icon } from '../components/DesignSystem';

const GOALS_OPTIONS = [
    { id: 'debt', icon: 'credit_card_off', label: 'Sair das Dívidas', desc: 'Eliminar pendências e limpar o nome.' },
    { id: 'emergency', icon: 'health_and_safety', label: 'Reserva de Emergência', desc: 'Ter 6 meses de custo de vida guardado.' },
    { id: 'invest', icon: 'trending_up', label: 'Começar a Investir', desc: 'Fazer o dinheiro trabalhar para o futuro.' },
    { id: 'buy_house', icon: 'home', label: 'Comprar Imóvel', desc: 'Juntar entrada para casa própria.' },
    { id: 'travel', icon: 'flight', label: 'Viagem dos Sonhos', desc: 'Experiências e lazer.' },
    { id: 'control', icon: 'receipt_long', label: 'Controle Total', desc: 'Saber exatamente para onde vai cada centavo.' },
];

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const { updateUserProfile } = useFinancial();
    const [step, setStep] = useState(1);
    
    const [income, setIncome] = useState('');
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [risk, setRisk] = useState<'conservative' | 'moderate' | 'aggressive' | ''>('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleGoalToggle = (id: string) => {
        setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
    };

    const finishOnboarding = async () => {
        setIsProcessing(true);
        
        // Simulate AI Analysis
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        updateUserProfile({
            monthlyIncome: parseFloat(income.replace(',', '.')),
            goals: selectedGoals,
            riskProfile: risk as any,
            onboardingCompleted: true
        });
        
        navigate('/app/dashboard');
    };

    return (
        <div className="min-h-screen w-full bg-black text-white flex flex-col overflow-hidden relative">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-3xl mx-auto w-full z-10">
                
                {/* Progress Dots */}
                <div className="flex gap-2 mb-12">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-primary' : 'w-2 bg-zinc-800'}`}></div>
                    ))}
                </div>

                {/* STEP 1: INCOME */}
                {step === 1 && (
                    <div className="w-full animate-fade-in space-y-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center mx-auto shadow-2xl shadow-primary/5">
                            <Icon name="payments" className="text-3xl text-primary" />
                        </div>
                        <div>
                            <Heading size="h1" className="mb-3">Vamos começar pelo básico</Heading>
                            <Text variant="secondary" className="text-lg">Qual é a sua renda mensal líquida aproximada?</Text>
                            <Text variant="secondary" className="text-xs opacity-60 mt-1">Isso ajuda a IA a calcular seu poder de poupança.</Text>
                        </div>
                        
                        <div className="max-w-xs mx-auto">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-xl">R$</span>
                                <input 
                                    type="number" 
                                    value={income}
                                    onChange={e => setIncome(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-transparent border-b-2 border-white/20 py-4 pl-12 pr-4 text-4xl font-bold text-white placeholder:text-white/10 focus:border-primary focus:outline-none text-center transition-all"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <Button 
                            onClick={handleNext} 
                            disabled={!income || parseFloat(income) <= 0}
                            size="lg" 
                            className="w-full max-w-xs mx-auto mt-8 rounded-2xl"
                            icon="arrow_forward"
                        >
                            Continuar
                        </Button>
                    </div>
                )}

                {/* STEP 2: GOALS */}
                {step === 2 && (
                    <div className="w-full animate-fade-in space-y-8">
                         <div className="text-center">
                            <Heading size="h1" className="mb-3">Qual seu foco principal?</Heading>
                            <Text variant="secondary" className="text-lg">Selecione até 3 objetivos para a IA priorizar.</Text>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {GOALS_OPTIONS.map(goal => {
                                const isSelected = selectedGoals.includes(goal.id);
                                return (
                                    <div 
                                        key={goal.id}
                                        onClick={() => {
                                            if (!isSelected && selectedGoals.length >= 3) return;
                                            handleGoalToggle(goal.id);
                                        }}
                                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 group
                                            ${isSelected 
                                                ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                                                : 'bg-zinc-900/50 border-white/10 hover:bg-zinc-900 hover:border-white/20'
                                            }
                                            ${!isSelected && selectedGoals.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        <div className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-primary text-background-dark' : 'bg-white/5 text-text-secondary group-hover:text-white'}`}>
                                            <Icon name={goal.icon} className="text-xl" />
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm mb-1 ${isSelected ? 'text-white' : 'text-text-primary'}`}>{goal.label}</p>
                                            <p className="text-xs text-text-secondary leading-relaxed">{goal.desc}</p>
                                        </div>
                                        {isSelected && (
                                            <div className="ml-auto">
                                                <Icon name="check_circle" className="text-primary" fill />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-center">
                            <Button 
                                onClick={handleNext} 
                                disabled={selectedGoals.length === 0}
                                size="lg" 
                                className="w-full max-w-xs rounded-2xl"
                                icon="arrow_forward"
                            >
                                Próximo
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 3: RISK / STYLE */}
                {step === 3 && !isProcessing && (
                    <div className="w-full animate-fade-in space-y-8 text-center">
                         <div>
                            <Heading size="h1" className="mb-3">Como você lida com dinheiro?</Heading>
                            <Text variant="secondary" className="text-lg">Isso define o tom dos conselhos da IA.</Text>
                        </div>

                        <div className="flex flex-col gap-4 max-w-md mx-auto">
                            {[
                                { id: 'conservative', label: 'Conservador', desc: 'Prefiro segurança absoluta. Tenho medo de dívidas.', icon: 'shield' },
                                { id: 'moderate', label: 'Moderado', desc: 'Equilíbrio entre aproveitar a vida e guardar.', icon: 'balance' },
                                { id: 'aggressive', label: 'Arrojado', desc: 'Quero maximizar ganhos e cortar tudo o que for inútil.', icon: 'rocket_launch' },
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setRisk(opt.id as any)}
                                    className={`p-6 rounded-2xl border text-left flex items-center gap-4 transition-all
                                        ${risk === opt.id 
                                            ? 'bg-white text-black border-white shadow-lg scale-[1.02]' 
                                            : 'bg-zinc-900 border-white/10 text-text-secondary hover:bg-zinc-800 hover:text-white'
                                        }
                                    `}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${risk === opt.id ? 'bg-black/10 text-black' : 'bg-black text-text-secondary'}`}>
                                        <Icon name={opt.icon} className="text-2xl" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{opt.label}</p>
                                        <p className={`text-sm ${risk === opt.id ? 'text-black/60' : 'text-text-secondary'}`}>{opt.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <Button 
                            onClick={finishOnboarding} 
                            disabled={!risk}
                            size="lg" 
                            variant="primary"
                            className="w-full max-w-xs mx-auto rounded-2xl mt-4"
                            icon="auto_awesome"
                        >
                            Gerar Meu Plano
                        </Button>
                    </div>
                )}

                {/* LOADING STATE */}
                {isProcessing && (
                    <div className="flex flex-col items-center justify-center animate-fade-in text-center">
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/30"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Icon name="smart_toy" className="text-3xl text-primary animate-pulse" />
                            </div>
                        </div>
                        <Heading size="h2">Construindo seu perfil...</Heading>
                        <Text variant="secondary" className="mt-2">A IA está analisando estratégias para sua renda de R$ {income}.</Text>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Onboarding;
