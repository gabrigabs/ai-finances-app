
import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateDashboardInsights } from '../services/ai';
import { IMAGES } from '../constants';

export interface Transaction {
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string; // ISO YYYY-MM-DD
  type: 'income' | 'expense';
  icon: string;
  source: string; // e.g., "Nubank", "Itaú", "Carteira"
  peerId?: string; 
  groupId?: string; // ID to link split transactions together
  finalDate?: string; // Date of the last installment
  installments?: {
    current: number;
    total: number;
  };
}

export interface Peer {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface UserProfile {
  monthlyIncome: number;
  goals: string[];
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  onboardingCompleted: boolean;
}

interface Insight {
  type: "warning" | "info" | "success";
  title: string;
  message: string;
  icon: string;
}

interface FinancialContextType {
  transactions: Transaction[];
  insights: Insight[];
  peers: Peer[];
  userProfile: UserProfile | null;
  isLoadingInsights: boolean;
  refreshInsights: () => void;
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: number, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: number) => void;
  addPeer: (peer: Peer) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  stats: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const INITIAL_PEERS: Peer[] = [
  { id: '1', name: 'Ana Souza', avatar: IMAGES.USER_AVATAR_ANA, email: 'ana.s@email.com' },
  { id: '2', name: 'Alex Pereira', avatar: IMAGES.USER_AVATAR_ALEX, email: 'alex.p@email.com' },
];

// Helper to safely add months to a date string (YYYY-MM-DD)
const addMonthsToDate = (startDate: string, monthsToAdd: number): string => {
  const [year, month, day] = startDate.split('-').map(Number);
  const targetDate = new Date(year, month - 1 + monthsToAdd, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const finalDay = Math.min(day, daysInTargetMonth);
  const y = targetYear;
  const m = String(targetMonth + 1).padStart(2, '0');
  const d = String(finalDay).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [peers, setPeers] = useState<Peer[]>(INITIAL_PEERS);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  // Default profile is null until onboarding is done
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const stats = transactions.reduce(
    (acc, curr) => {
      if (curr.type === 'income') {
        acc.totalIncome += curr.amount;
      } else {
        acc.totalExpense += curr.amount;
      }
      acc.balance = acc.totalIncome - acc.totalExpense;
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, balance: 0 }
  );

  const refreshInsights = async () => {
    if (transactions.length === 0) return;
    setIsLoadingInsights(true);
    const data = await generateDashboardInsights(transactions);
    if (data && data.alerts) {
      setInsights(data.alerts);
    }
    setIsLoadingInsights(false);
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    setUserProfile(prev => {
        const base = prev || { monthlyIncome: 0, goals: [], riskProfile: 'moderate', onboardingCompleted: false };
        return { ...base, ...data };
    });
  };

  const addTransaction = (t: Transaction) => {
    setTransactions(prev => {
        const newTransactions: Transaction[] = [];
        const source = t.source || 'Carteira';
        const groupId = t.groupId || (t.installments && t.installments.total > 1 ? Math.random().toString(36).substr(2, 9) : undefined);

        const isDuplicate = (candidate: Transaction, list: Transaction[]) => {
            return list.some(existing => 
                existing.description === candidate.description &&
                Math.abs(existing.amount - candidate.amount) < 0.01 && 
                existing.date === candidate.date &&
                existing.type === candidate.type &&
                existing.source === candidate.source &&
                (candidate.installments 
                    ? (existing.installments?.current === candidate.installments.current && existing.installments?.total === candidate.installments.total)
                    : true)
            );
        };

        if (t.installments && t.installments.total > 1) {
            const total = t.installments.total;
            const current = t.installments.current || 1;
            const finalDateStr = addMonthsToDate(t.date, total - current);

            for (let i = current; i <= total; i++) {
                const monthOffset = i - current;
                const dateIso = addMonthsToDate(t.date, monthOffset);

                const installmentTx: Transaction = {
                    ...t,
                    id: Math.random() + Date.now(), 
                    date: dateIso,
                    source,
                    groupId,
                    finalDate: finalDateStr,
                    installments: {
                        current: i,
                        total: total
                    }
                };

                if (!isDuplicate(installmentTx, prev) && !isDuplicate(installmentTx, newTransactions)) {
                    newTransactions.push(installmentTx);
                }
            }
        } else {
            const singleTx = { ...t, source };
            if (!isDuplicate(singleTx, prev) && !isDuplicate(singleTx, newTransactions)) {
                newTransactions.push(singleTx);
            }
        }
        return [...newTransactions, ...prev];
    });
  };

  const updateTransaction = (id: number, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addPeer = (peer: Peer) => {
    setPeers(prev => [...prev, peer]);
  };

  useEffect(() => {
    if (transactions.length > 0 && insights.length === 0) {
      refreshInsights();
    }
  }, [transactions.length]); 

  return (
    <FinancialContext.Provider value={{ 
      transactions, 
      insights, 
      peers,
      userProfile,
      isLoadingInsights, 
      refreshInsights, 
      addTransaction, 
      updateTransaction,
      deleteTransaction,
      addPeer,
      updateUserProfile,
      stats 
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
