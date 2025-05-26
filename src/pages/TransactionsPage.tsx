import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import { useTransactionContext } from '../context/TransactionContext';
import Layout from '../components/layout/Layout';
import TransactionList from '../components/transactions/TransactionList';
import TransactionForm from '../components/transactions/TransactionForm';
import Button from '../components/ui/Button';
import { generateAnnualReport, exportToPdf, exportToExcel } from '../utils/reportGenerator';

const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedClient } = useClientContext();
  const { getClientTransactions, deleteTransaction } = useTransactionContext();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editTransactionId, setEditTransactionId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedClient) {
      navigate('/');
    }
  }, [selectedClient, navigate]);

  if (!selectedClient) {
    return null;
  }

  const transactions = getClientTransactions(selectedClient.id);
  const editingTransaction = editTransactionId
    ? transactions.find((t) => t.id === editTransactionId)
    : undefined;

  const handleEditTransaction = (transactionId: string) => {
    setEditTransactionId(transactionId);
    setShowAddTransaction(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    deleteTransaction(transactionId);
  };

  const handleAddTransaction = () => {
    setEditTransactionId(null);
    setShowAddTransaction(true);
  };

  const handleCloseForm = () => {
    setShowAddTransaction(false);
    setEditTransactionId(null);
  };

  const handleExportPdf = () => {
    const currentYear = new Date().getFullYear();
    const report = generateAnnualReport(selectedClient, transactions, currentYear);
    exportToPdf(report);
  };

  const handleExportExcel = () => {
    const currentYear = new Date().getFullYear();
    const report = generateAnnualReport(selectedClient, transactions, currentYear);
    exportToExcel(report);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionList
            clientId={selectedClient.id}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onAdd={handleAddTransaction}
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
          />
        </div>

        <div>
          {showAddTransaction ? (
            <TransactionForm
              transaction={editingTransaction}
              clientId={selectedClient.id}
              onClose={handleCloseForm}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lançamentos Financeiros</h3>
              <p className="text-gray-600 mb-4">
                Registre todos os lançamentos financeiros relacionados à atividade rural:
              </p>
              <ul className="list-disc pl-5 text-gray-600 mb-6">
                <li>Receitas e despesas comuns</li>
                <li>Compra e venda de gado</li>
                <li>Aquisição e alienação de bens rurais</li>
              </ul>
              <Button onClick={handleAddTransaction} fullWidth>
                Novo Lançamento
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TransactionsPage;