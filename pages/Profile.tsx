
import React, { useState, useEffect } from 'react';
import { IMAGES } from '../constants';
import { useFinancial, UserProfile } from '../context/FinancialContext';
import { Card, Button, Input, Heading, Text, Badge, PageHeader, Avatar, Icon, Select, IconButton } from '../components/DesignSystem';

const RiskSelector: React.FC<{ 
    value: string; 
    onChange: (val: any) => void; 
    disabled?: boolean 
}> = ({ value, onChange, disabled }) => {
    const options = [
        { id: 'conservative', icon: 'shield', label: 'Conservador', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { id: 'moderate', icon: 'balance', label: 'Moderado', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { id: 'aggressive', icon: 'rocket_launch', label: 'Arrojado', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {options.map((opt) => {
                const isSelected = value === opt.id;
                return (
                    <button
                        key={opt.id}
                        onClick={() => !disabled && onChange(opt.id)}
                        disabled={disabled}
                        className={`relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                            isSelected 
                                ? `${opt.bg} ${opt.border} ring-1 ring-offset-1 ring-offset-black ${opt.color.replace('text', 'ring')}` 
                                : 'bg-zinc-900/50 border-white/5 text-text-secondary hover:bg-zinc-900'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <Icon name={opt.icon} className={`text-xl ${isSelected ? opt.color : 'text-text-secondary'}`} />
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-text-secondary'}`}>{opt.label}</span>
                        {isSelected && (
                            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-current shadow-sm animate-pulse"></div>
                        )}
                    </button>
                )
            })}
        </div>
    );
};

const Profile: React.FC = () => {
  const { userProfile, updateUserProfile } = useFinancial();
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for editing
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (userProfile) {
        setFormData(userProfile);
    }
  }, [userProfile]);

  const handleSave = () => {
      updateUserProfile(formData);
      setIsEditing(false);
  };

  const handleCancel = () => {
      if (userProfile) setFormData(userProfile);
      setIsEditing(false);
  }

  const handleChange = (field: keyof UserProfile, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col h-full animate-fade-in bg-black relative">
      
      {/* Cover Image Area */}
      <div className="h-48 w-full relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 via-black to-blue-900/40"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Floating Header Content */}
      <div className="px-4 md:px-8 relative -mt-16 pb-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-5xl mx-auto">
              
              {/* Identity Header */}
              <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-end gap-6">
                      <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-blue-600 rounded-full opacity-50 blur group-hover:opacity-100 transition duration-500"></div>
                          <Avatar 
                            src={IMAGES.USER_AVATAR_JOAO} 
                            size="xl" 
                            className="relative w-32 h-32 border-4 border-black shadow-2xl" 
                          />
                          <button className="absolute bottom-1 right-1 p-2 rounded-full bg-zinc-800 border border-black text-white hover:bg-zinc-700 transition-colors shadow-lg">
                              <Icon name="photo_camera" className="text-sm" />
                          </button>
                      </div>
                      <div className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                              <h1 className="text-3xl font-bold text-white tracking-tight">João Silva</h1>
                              <Badge variant="success" className="rounded-full px-2">PRO</Badge>
                          </div>
                          <p className="text-text-secondary flex items-center gap-1.5">
                              <Icon name="mail" className="text-sm" />
                              joao.silva@email.com
                          </p>
                      </div>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                      {isEditing ? (
                          <>
                            <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>
                            <Button variant="primary" icon="save" onClick={handleSave}>Salvar Alterações</Button>
                          </>
                      ) : (
                          <Button variant="secondary" icon="edit" onClick={() => setIsEditing(true)}>Editar Perfil</Button>
                      )}
                  </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Stats & Personal */}
                  <div className="lg:col-span-4 space-y-6">
                      
                      {/* Gamification / Status Card */}
                      <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10">
                          <Heading size="h4" className="mb-4 flex items-center gap-2">
                              <Icon name="military_tech" className="text-amber-400" />
                              Nível Financeiro
                          </Heading>
                          <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-white">Estrategista</span>
                              <span className="text-xs font-bold text-text-secondary">Nvl. 12</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mb-4">
                              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 w-[75%] shadow-[0_0_10px_rgba(251,191,36,0.3)]"></div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 rounded-lg bg-white/5 text-center">
                                  <p className="text-[10px] text-text-secondary uppercase">Dias Seguidos</p>
                                  <p className="text-lg font-bold text-white">24</p>
                              </div>
                              <div className="p-2 rounded-lg bg-white/5 text-center">
                                  <p className="text-[10px] text-text-secondary uppercase">Badges</p>
                                  <p className="text-lg font-bold text-white">8</p>
                              </div>
                          </div>
                      </Card>

                      {/* Personal Info */}
                      <Card>
                          <Heading size="h4" className="mb-4">Dados Pessoais</Heading>
                          <div className="space-y-4">
                              <Input 
                                  label="Nome de Exibição" 
                                  defaultValue="João Silva" 
                                  disabled={!isEditing}
                                  className={!isEditing ? "border-transparent bg-transparent pl-0" : ""}
                              />
                              <Input 
                                  label="Telefone" 
                                  defaultValue="+55 11 99999-9999" 
                                  disabled={!isEditing}
                                  className={!isEditing ? "border-transparent bg-transparent pl-0" : ""}
                              />
                              <Input 
                                  label="Localização" 
                                  defaultValue="São Paulo, SP" 
                                  disabled={!isEditing}
                                  icon="location_on"
                                  className={!isEditing ? "border-transparent bg-transparent pl-10" : ""}
                              />
                          </div>
                      </Card>

                      {/* Security */}
                      <Card>
                          <Heading size="h4" className="mb-4 text-rose-400">Zona de Perigo</Heading>
                          <Button variant="outline" className="w-full justify-start border-white/5 hover:border-rose-500/30 hover:text-rose-400" icon="logout">
                              Sair da Conta
                          </Button>
                          <div className="h-3"></div>
                          <Button variant="danger" className="w-full justify-start bg-rose-500/5 border-rose-500/10" icon="delete">
                              Excluir minha conta
                          </Button>
                      </Card>
                  </div>

                  {/* Right Column: Financial Brain */}
                  <div className="lg:col-span-8 space-y-6">
                      
                      {/* AI Calibration Widget */}
                      <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-emerald-500/30 to-transparent">
                          <Card className="bg-black relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                              
                              <div className="flex items-center justify-between mb-6 relative z-10">
                                  <div className="flex items-center gap-3">
                                      <div className="p-2.5 rounded-xl bg-emerald-500 text-black shadow-lg shadow-emerald-500/20">
                                          <Icon name="psychology" />
                                      </div>
                                      <div>
                                          <Heading size="h3">Cérebro da IA</Heading>
                                          <Text variant="secondary">Como a inteligência artificial analisa seus dados.</Text>
                                      </div>
                                  </div>
                                  {!isEditing && (
                                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                          <span className="text-xs font-bold text-emerald-400">Ativo</span>
                                      </div>
                                  )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                  <div className="space-y-6">
                                      <Input 
                                          label="Renda Mensal (Base de Cálculo)"
                                          type="number"
                                          value={formData.monthlyIncome}
                                          onChange={e => handleChange('monthlyIncome', parseFloat(e.target.value))}
                                          disabled={!isEditing}
                                          icon="attach_money"
                                          className="font-mono text-lg font-bold"
                                      />
                                      
                                      <div>
                                          <Text variant="label" className="mb-3 block ml-1">Perfil de Risco</Text>
                                          <RiskSelector 
                                              value={formData.riskProfile || 'moderate'} 
                                              onChange={(val) => handleChange('riskProfile', val)}
                                              disabled={!isEditing}
                                          />
                                      </div>
                                  </div>

                                  <div className="flex flex-col h-full bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                                      <Text variant="label" className="mb-3">Objetivos Ativos</Text>
                                      
                                      <div className="flex-1">
                                          {formData.goals && formData.goals.length > 0 ? (
                                              <div className="flex flex-col gap-2">
                                                  {formData.goals.map(goal => (
                                                      <div key={goal} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-white/5 group">
                                                          <div className="flex items-center gap-3">
                                                              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                              <span className="text-sm font-bold text-white">{goal}</span>
                                                          </div>
                                                          {isEditing && (
                                                              <button 
                                                                onClick={() => handleChange('goals', formData.goals?.filter(g => g !== goal))}
                                                                className="text-text-secondary hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                                                              >
                                                                  <Icon name="close" className="text-sm" />
                                                              </button>
                                                          )}
                                                      </div>
                                                  ))}
                                              </div>
                                          ) : (
                                              <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
                                                  <Icon name="flag" className="text-3xl mb-2" />
                                                  <span className="text-xs">Sem objetivos definidos</span>
                                              </div>
                                          )}
                                      </div>
                                      
                                      {isEditing && (
                                          <Button variant="outline" size="sm" className="mt-4 border-dashed" icon="add">
                                              Adicionar Objetivo
                                          </Button>
                                      )}
                                  </div>
                              </div>
                          </Card>
                      </div>

                      {/* Preferences */}
                      <Card>
                          <Heading size="h4" className="mb-4">Preferências do App</Heading>
                          <div className="divide-y divide-white/5">
                              {[
                                  { label: 'Notificações Push', desc: 'Alertas sobre gastos incomuns', active: true },
                                  { label: 'Relatórios Semanais', desc: 'Receber resumo por email', active: true },
                                  { label: 'Modo Oculto', desc: 'Esconder valores na dashboard', active: false }
                              ].map((pref, idx) => (
                                  <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                      <div>
                                          <p className="text-sm font-bold text-white">{pref.label}</p>
                                          <p className="text-xs text-text-secondary">{pref.desc}</p>
                                      </div>
                                      <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer flex items-center ${pref.active && !isEditing ? 'bg-emerald-500' : isEditing ? 'bg-zinc-700' : 'bg-zinc-800'}`}>
                                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${pref.active ? 'translate-x-6' : ''}`}></div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </Card>

                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Profile;
