
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGES } from '../constants';
import { Button, Input, Heading, Text, Card, Icon } from '../components/DesignSystem';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app/dashboard');
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background-dark overflow-hidden p-4">
      {/* Ambient Background */}
      <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow pointer-events-none"></div>
      <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[100px] animate-pulse-slow pointer-events-none" style={{animationDelay: '1s'}}></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="glass-panel backdrop-blur-xl border border-white/10">
            <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-lg shadow-primary/10">
                <div
                className="bg-center bg-no-repeat bg-cover rounded-xl size-10"
                style={{ backgroundImage: `url("${IMAGES.LOGO}")` }}
                ></div>
            </div>
            <Heading size="h2">Bem-vindo de volta</Heading>
            <Text variant="secondary" className="mt-2">Acesse seu painel financeiro inteligente.</Text>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
                label="E-mail" 
                type="email" 
                placeholder="exemplo@email.com" 
                required 
            />
            <Input 
                label="Senha" 
                type="password" 
                placeholder="••••••••" 
                required 
            />

            <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer group">
                <input
                    className="h-4 w-4 rounded bg-white/10 border-transparent focus:ring-0 text-primary checked:bg-primary cursor-pointer"
                    type="checkbox"
                />
                <span className="ml-2 block text-sm text-text-secondary group-hover:text-white transition-colors">Lembrar</span>
                </label>
                <a className="text-sm font-medium text-primary-light hover:text-primary transition-colors" href="#">Recuperar senha</a>
            </div>

            <Button type="submit" variant="primary" size="lg" className="mt-4">
                Entrar na conta
            </Button>
            </form>

            <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#131315] px-3 text-text-secondary">ou entrar com</span>
            </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {['Google', 'Apple'].map((provider) => (
                    <Button key={provider} variant="outline" size="md" className="bg-white/5 border-white/10">
                        {provider}
                    </Button>
                ))}
            </div>
            
            <p className="mt-8 text-center text-sm text-text-secondary">
                Novo por aqui?{" "}
                <Link to="/register" className="font-bold text-primary-light hover:text-primary transition-colors">
                    Criar conta grátis
                </Link>
            </p>
        </Card>
      </div>
    </div>
  );
};

export default Login;
