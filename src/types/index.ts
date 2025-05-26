export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  cpf: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
}

export type TransactionType = 
  | 'EXPENSE' 
  | 'INCOME' 
  | 'LIVESTOCK_PURCHASE' 
  | 'LIVESTOCK_SALE'
  | 'ASSET_PURCHASE'
  | 'ASSET_SALE';

export interface Transaction {
  id: string;
  clientId: string;
  date: Date;
  type: TransactionType;
  description: string;
  amount: number;
  quantity?: number;
  assetDetails?: {
    name: string;
    addToTaxDeclaration: boolean;
  };
  month: number;
  year: number;
  createdAt: Date;
}

export interface MonthlyTransactionSummary {
  month: number;
  year: number;
  income: number;
  expenses: number;
  result: number;
}

export interface LivestockSummary {
  initialCount: number;
  purchased: number;
  sold: number;
  finalCount: number;
}

export interface AssetReport {
  date: Date;
  description: string;
  value: number;
  addToTaxDeclaration: boolean;
}

export interface AnnualReport {
  clientId: string;
  clientName: string;
  clientCpf: string;
  year: number;
  monthlySummaries: MonthlyTransactionSummary[];
  totalIncome: number;
  totalExpenses: number;
  annualResult: number;
  livestockSummary: LivestockSummary;
  assets: AssetReport[];
}