
import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../constants';
import { Button, Input, Heading, Text } from '../components/DesignSystem';

const Register: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full bg-background-dark text-text-primary font-display">
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="w-full max-w-md relative z-10">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center gap-3 mb-6">
               <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20">
                 <span className="material-symbols-rounded text-white text-2xl">auto_awesome</span>
              </div>
            </div>
            <Heading size="h1" className="mb-2">Crie sua conta</Heading>
            <Text variant="secondary">Junte-se a nós e organize suas finanças com IA.</Text>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10" icon="account_circle">
               Registrar com Google
            </Button>
             <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10" icon="account_circle">
               Registrar com Apple
            </Button>
          </div>

          <div className="my-8 flex items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-4 flex-shrink text-xs font-bold text-text-secondary uppercase tracking-widest">ou</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form className="space-y-5">
            <Input 
                label="Nome Completo"
                placeholder="Nome Completo"
                icon="person"
                type="text"
                required
            />
            <Input 
                label="E-mail"
                placeholder="E-mail"
                icon="mail"
                type="email"
                required
            />
            <Input 
                label="Senha"
                placeholder="Senha"
                icon="lock"
                type="password"
                required
            />
            
            <Button type="submit" size="lg" className="mt-6">
                Criar Conta
            </Button>
          </form>
          
          <p className="mt-8 text-center text-sm text-text-secondary">
            Já tem uma conta? <Link to="/login" className="font-bold text-primary hover:text-primary-light transition-colors">Faça login aqui</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div
          className="absolute inset-0 h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url("${IMAGES.LANDING_BG}")` }}
        >
          <div className="absolute inset-0 h-full w-full bg-background-dark/80 backdrop-blur-sm"></div>
        </div>
        <div className="relative z-10 flex h-full flex-col justify-center p-16 text-white">
          <h2 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">Transforme sua vida financeira com o poder da IA.</h2>
          <p className="max-w-xl text-xl text-text-secondary leading-relaxed">Obtenha insights, controle seus gastos e alcance seus objetivos com nossa plataforma intuitiva.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
