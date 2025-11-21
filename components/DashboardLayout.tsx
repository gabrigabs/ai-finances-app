
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { IMAGES } from '../constants';
import { Icon, Logo, Avatar } from './DesignSystem';

// Desktop Sidebar Item
const SidebarItem: React.FC<{ to: string; icon: string; label: string; exact?: boolean }> = ({ to, icon, label, exact }) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }) =>
      `group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ease-out ${
        isActive 
          ? 'text-white font-medium bg-white/[0.03]' 
          : 'text-text-secondary hover:text-white hover:bg-white/[0.03]'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon name={icon} className={`text-[20px] transition-colors duration-300 ${isActive ? 'text-primary font-variation-settings-"FILL" 1' : 'text-text-secondary group-hover:text-white'}`} />
        <p className="text-sm tracking-tight">{label}</p>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>}
      </>
    )}
  </NavLink>
);

// Mobile Bottom Navigation Item
const MobileNavItem: React.FC<{ to: string; icon: string; label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all flex-1 ${
        isActive 
          ? 'text-primary' 
          : 'text-text-secondary hover:text-white active:scale-95'
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div className={`relative transition-all duration-300 ${isActive ? '-translate-y-0.5' : ''}`}>
            <Icon name={icon} className={`text-[24px] ${isActive ? 'font-variation-settings-"FILL" 1' : ''}`} />
            {isActive && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_5px_rgba(16,185,129,1)]"></span>}
        </div>
        <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
      </>
    )}
  </NavLink>
);

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-black overflow-hidden selection:bg-primary/20 font-display">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] z-40 h-full shrink-0 bg-black border-r border-white/5">
          <div className="flex flex-col h-full pt-6 pb-4 px-4">
            {/* Brand */}
            <div className="px-2 mb-8">
                <Logo />
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-4 py-2 mb-1">
                 <p className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest">Menu</p>
              </div>
              <SidebarItem to="/app/dashboard" icon="dashboard" label="Visão Geral" />
              <SidebarItem to="/app/expenses" icon="receipt_long" label="Transações" />
              <SidebarItem to="/app/groups" icon="people_alt" label="Repasses" />
              <SidebarItem to="/app/ai" icon="smart_toy" label="AI Studio" />
              
              <div className="my-6 border-t border-white/5 mx-2"></div>
              
              <div className="px-4 py-2 mb-1">
                 <p className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest">Conta</p>
              </div>
              <SidebarItem to="/app/profile" icon="settings" label="Ajustes" />
            </nav>

            {/* User Profile Compact */}
            <NavLink to="/app/profile" className="mt-4 flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer border border-white/5 hover:border-white/10 bg-zinc-900/50">
                <div className="relative">
                    <Avatar src={IMAGES.USER_AVATAR_JOAO} size="sm" className="ring-2 ring-black group-hover:ring-white/10" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full"></div>
                </div>
                <div className="flex flex-col overflow-hidden">
                    <p className="text-white text-xs font-bold truncate group-hover:text-primary transition-colors">João Silva</p>
                    <p className="text-[10px] text-text-secondary truncate">Plano Pro</p>
                </div>
            </NavLink>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 h-full flex flex-col overflow-hidden bg-black">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/80 backdrop-blur-xl z-30 shrink-0 h-14">
           <Logo showText={true} />
           <Avatar src={IMAGES.USER_AVATAR_JOAO} size="sm" />
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col w-full h-full">
            <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-[84px] z-50 px-4 pb-6 pt-3 bg-black/90 backdrop-blur-xl border-t border-white/5">
            <nav className="flex items-center justify-around h-full relative z-10">
                <MobileNavItem to="/app/dashboard" icon="dashboard" label="Início" />
                <MobileNavItem to="/app/expenses" icon="receipt_long" label="Extrato" />
                
                {/* Center Action Button (AI) */}
                <NavLink to="/app/ai" className="relative -top-6">
                    {({ isActive }) => (
                        <div className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 border-4 border-black ${isActive ? 'bg-white text-primary scale-110 shadow-white/20' : 'bg-primary text-background-dark hover:scale-105 hover:bg-primary-light shadow-primary/40'}`}>
                             <Icon name="smart_toy" className="text-2xl font-variation-settings-'FILL' 1" />
                        </div>
                    )}
                </NavLink>

                <MobileNavItem to="/app/groups" icon="people_alt" label="Grupos" />
                <MobileNavItem to="/app/profile" icon="settings" label="Perfil" />
            </nav>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
