
import React, { ReactNode, InputHTMLAttributes, ButtonHTMLAttributes, SelectHTMLAttributes } from 'react';

// --- UTILS ---
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- ICON ---
interface IconProps {
  name: string;
  className?: string;
  fill?: boolean;
}
export const Icon: React.FC<IconProps> = ({ name, className, fill = false }) => (
  <span 
    className={cn(
      "material-symbols-rounded select-none", 
      fill && "font-variation-settings-'FILL' 1", 
      className
    )}
  >
    {name}
  </span>
);

// --- LOGO ---
export const Logo: React.FC<{ className?: string; showText?: boolean }> = ({ className, showText = true }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 border border-white/10">
        <Icon name="auto_awesome" className="text-white text-lg" />
    </div>
    {showText && (
      <div>
          <h1 className="text-white text-base font-bold tracking-tight leading-none">Finanças IA</h1>
          <p className="text-[10px] text-text-secondary font-medium mt-0.5 opacity-60">Premium Workspace</p>
      </div>
    )}
  </div>
);

// --- TYPOGRAPHY ---
export const Heading: React.FC<{ children: ReactNode; className?: string; size?: 'h1' | 'h2' | 'h3' | 'h4' }> = ({ children, className, size = 'h2' }) => {
    const sizes = {
        h1: "text-3xl md:text-4xl font-extrabold tracking-tight",
        h2: "text-xl md:text-2xl font-bold tracking-tight",
        h3: "text-lg font-bold tracking-tight",
        h4: "text-base font-bold tracking-tight"
    };
    return <h2 className={cn("text-white", sizes[size], className)}>{children}</h2>;
};

export const Text: React.FC<{ children: ReactNode; className?: string; variant?: 'primary' | 'secondary' | 'label' | 'success' | 'danger' }> = ({ children, className, variant = 'primary' }) => {
    const variants = {
        primary: "text-white text-sm",
        secondary: "text-text-secondary text-sm leading-relaxed",
        label: "text-[10px] font-bold text-text-secondary uppercase tracking-wider",
        success: "text-emerald-400 text-sm font-medium",
        danger: "text-rose-400 text-sm font-medium"
    };
    return <p className={cn(variants[variant], className)}>{children}</p>;
};

// --- LAYOUT ---
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}
export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions, className }) => {
  return (
    <div className={cn("shrink-0 z-30 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-5 sticky top-0", className)}>
      <div className="w-full max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Heading size="h2">{title}</Heading>
          {description && <Text variant="secondary" className="mt-1">{description}</Text>}
        </div>
        {actions && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}> = ({ icon, title, description, action, className }) => (
  <div className={cn("flex flex-col items-center justify-center p-12 text-center animate-fade-in", className)}>
    <div className="w-20 h-20 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center justify-center mb-6 shadow-xl">
      <Icon name={icon} className="text-4xl text-text-secondary opacity-30" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">{description}</p>
    {action}
  </div>
);

// --- AVATAR ---
interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}
export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', className, fallback = 'U' }) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-20 h-20 text-xl",
    xl: "w-32 h-32 text-3xl"
  };
  
  return (
    <div className={cn("rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden relative bg-cover bg-center bg-no-repeat shrink-0 shadow-md", sizes[size], className)} style={src ? { backgroundImage: `url('${src}')` } : {}}>
      {!src && <span className="font-bold text-text-secondary">{fallback.charAt(0).toUpperCase()}</span>}
    </div>
  );
};

// --- PROGRESS BAR ---
interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}
export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, variant = 'primary', className }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const variants = {
    primary: "bg-primary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500"
  };

  return (
    <div className={cn("h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5", className)}>
      <div 
        className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.5)]", variants[variant])}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

// --- BUTTONS ---
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', isLoading, icon, className, ...props 
}) => {
  const baseStyles = "rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-light text-background-dark shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 border border-transparent",
    secondary: "bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10 hover:border-white/20 shadow-md",
    outline: "bg-transparent border border-white/10 text-text-secondary hover:text-white hover:bg-white/5",
    ghost: "bg-transparent text-text-secondary hover:text-white hover:bg-white/5",
    danger: "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/10"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base w-full"
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {!isLoading && icon && <Icon name={icon} className={size === 'sm' ? 'text-base' : 'text-xl'} />}
      {children}
    </button>
  );
};

export const IconButton: React.FC<ButtonProps> = ({ icon, className, variant = 'ghost', ...props }) => {
    return (
        <button 
            className={cn(
                "p-2 rounded-lg transition-colors flex items-center justify-center",
                variant === 'ghost' && "text-text-secondary hover:text-white hover:bg-white/10",
                variant === 'danger' && "text-text-secondary hover:text-rose-400 hover:bg-rose-500/10",
                className
            )}
            {...props}
        >
            <Icon name={icon || 'circle'} className="text-xl" />
        </button>
    )
}

// --- INPUTS ---
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, className, containerClassName, ...props }) => {
  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">{label}</label>}
      <div className="relative group">
        {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none group-focus-within:text-primary transition-colors">
                <Icon name={icon} className="text-lg" />
            </span>
        )}
        <input
          className={cn(
            "block w-full rounded-xl border border-white/10 bg-zinc-900/50 py-3 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:bg-black transition-all outline-none sm:text-sm",
            icon ? "pl-11 pr-4" : "px-4",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className, ...props }) => {
    return (
        <div className="space-y-1.5">
            {label && <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider ml-1">{label}</label>}
            <div className="relative">
                <select
                    className={cn(
                        "block w-full rounded-xl border border-white/10 bg-zinc-900/50 py-3 px-4 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all appearance-none text-sm cursor-pointer",
                        className
                    )}
                    {...props}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">{opt.label}</option>
                    ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                    <Icon name="expand_more" />
                </span>
            </div>
        </div>
    );
}

// --- CARDS ---
export const Card: React.FC<{ children: ReactNode; className?: string; noPadding?: boolean }> = ({ children, className, noPadding = false }) => (
  <div className={cn("bg-[#0e0e11] border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:border-white/10 transition-colors duration-300", className)}>
    <div className={cn(noPadding ? "" : "p-6")}>
      {children}
    </div>
  </div>
);

// --- BADGES ---
export const Badge: React.FC<{ children: ReactNode; variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'primary'; className?: string }> = ({ children, variant = 'neutral', className }) => {
    const variants = {
        success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        neutral: "bg-white/5 text-text-secondary border-white/5",
        primary: "bg-primary/10 text-primary border-primary/20"
    };
    return (
        <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold border inline-flex items-center gap-1.5", variants[variant], className)}>
            {children}
        </span>
    )
}

// --- MODAL ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, maxWidth = "max-w-lg" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-lg animate-fade-in">
            <div className={cn("w-full flex flex-col rounded-t-3xl md:rounded-3xl shadow-2xl bg-[#0e0e11] border border-white/10 relative overflow-hidden max-h-[90vh]", maxWidth)}>
                <div className="p-5 border-b border-white/5 flex justify-between items-center shrink-0 bg-white/[0.02]">
                    <Heading size="h3">{title}</Heading>
                    <IconButton icon="close" onClick={onClose} />
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
                {footer && (
                    <div className="p-4 border-t border-white/5 bg-white/[0.02] shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
