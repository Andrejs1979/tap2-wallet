import { create } from 'zustand';

interface WalletState {
  balance: number;
  transactions: Transaction[];
  setBalance: (balance: number) => void;
  addTransaction: (transaction: Transaction) => void;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'payment' | 'p2p' | 'fund' | 'withdraw';
  createdAt: Date;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  transactions: [],
  setBalance: (balance) => set({ balance }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [...state.transactions, transaction],
    })),
}));
