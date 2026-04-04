import { create } from 'zustand'
import seedData from '../data/transactions.json'

export const useTransactionStore = create((set) => ({
  transactions: seedData,  // seeded with mock data
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
}))