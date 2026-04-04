import { create } from 'zustand'

/**
 * Central place for user-added transactions (e.g. from Add Transaction modal).
 * Dashboard charts stay static; this list powers the Transactions page.
 */
export const useTransactionStore = create((set) => ({
  transactions: [],
  role: 'viewer', // 'viewer' | 'admin'

  setRole: (role) => set({ role }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [
        {
          id: crypto.randomUUID(),
          ...transaction,
        },
        ...state.transactions,
      ],
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
}))
