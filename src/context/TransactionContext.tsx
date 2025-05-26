import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'month' | 'year'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  getClientTransactions: (clientId: string) => Transaction[];
  getClientTransactionsByType: (clientId: string, type: TransactionType) => Transaction[];
  getClientTransactionsByDate: (clientId: string, startDate: Date, endDate: Date) => Transaction[];
  filterTransactions: (
    clientId: string, 
    filters: { 
      startDate?: Date; 
      endDate?: Date; 
      type?: TransactionType; 
      description?: string;
      minAmount?: number;
      maxAmount?: number;
    }
  ) => Transaction[];
}

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
  getClientTransactions: () => [],
  getClientTransactionsByType: () => [],
  getClientTransactionsByDate: () => [],
  filterTransactions: () => [],
});

export const useTransactionContext = () => useContext(TransactionContext);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'month' | 'year'>) => {
    const date = new Date(transaction.date);
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      createdAt: new Date(),
      month: date.getMonth() + 1, // JavaScript months are 0-based
      year: date.getFullYear(),
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions((prev) => 
      prev.map((transaction) => 
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
  };

  const getClientTransactions = (clientId: string) => {
    return transactions.filter((transaction) => transaction.clientId === clientId);
  };

  const getClientTransactionsByType = (clientId: string, type: TransactionType) => {
    return transactions.filter(
      (transaction) => transaction.clientId === clientId && transaction.type === type
    );
  };

  const getClientTransactionsByDate = (clientId: string, startDate: Date, endDate: Date) => {
    return transactions.filter(
      (transaction) => 
        transaction.clientId === clientId && 
        new Date(transaction.date) >= startDate && 
        new Date(transaction.date) <= endDate
    );
  };

  const filterTransactions = (
    clientId: string, 
    filters: { 
      startDate?: Date; 
      endDate?: Date; 
      type?: TransactionType; 
      description?: string;
      minAmount?: number;
      maxAmount?: number;
    }
  ) => {
    return transactions.filter((transaction) => {
      if (transaction.clientId !== clientId) return false;
      
      const date = new Date(transaction.date);
      
      if (filters.startDate && date < filters.startDate) return false;
      if (filters.endDate && date > filters.endDate) return false;
      if (filters.type && transaction.type !== filters.type) return false;
      if (filters.description && !transaction.description.toLowerCase().includes(filters.description.toLowerCase())) return false;
      if (filters.minAmount && transaction.amount < filters.minAmount) return false;
      if (filters.maxAmount && transaction.amount > filters.maxAmount) return false;
      
      return true;
    });
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getClientTransactions,
        getClientTransactionsByType,
        getClientTransactionsByDate,
        filterTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};