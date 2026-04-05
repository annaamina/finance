import { create } from 'zustand'
import seedData from '../data/transactions.json'

export const useTransactionStore = create((set) => ({
  transactions: seedData,
  role: 'viewer',

  setRole: (role) => set({ role }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [
        { id: crypto.randomUUID(), ...transaction },
        ...state.transactions,
      ],
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),

  updateTransaction: (updated) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === updated.id ? { ...t, ...updated } : t
      ),
    })),
}))