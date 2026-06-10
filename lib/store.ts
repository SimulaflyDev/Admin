import { create } from 'zustand'

export interface AdminStore {
  // Fraud
  fraudAlerts: number;
  resolveFraudAlert: () => void;
  
  // Invoices
  overdueInvoices: number;
  resolveInvoice: () => void;
  
  // Support
  slaBreaches: number;
  resolveSlaBreach: () => void;
  
  // AI Health
  failedGenerations: number;
  restartAiService: () => void;
  
  // Wallet Risk
  walletsBelow100: number;
  alertWallets: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  // Initial States
  fraudAlerts: 3,
  overdueInvoices: 14,
  slaBreaches: 2,
  failedGenerations: 14,
  walletsBelow100: 28,

  // Actions
  resolveFraudAlert: () => set((state) => ({ fraudAlerts: Math.max(0, state.fraudAlerts - 1) })),
  resolveInvoice: () => set((state) => ({ overdueInvoices: Math.max(0, state.overdueInvoices - 1) })),
  resolveSlaBreach: () => set((state) => ({ slaBreaches: Math.max(0, state.slaBreaches - 1) })),
  restartAiService: () => set({ failedGenerations: 0 }),
  alertWallets: () => set({ walletsBelow100: 0 }), // Simulated action
}))
