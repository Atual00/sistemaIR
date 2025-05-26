import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import { useTransactionContext } from '../context/TransactionContext';
import { Transaction, TransactionType } from '../types';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { formatCurrency, formatDate } from '../utils/formatters';
import { generateAnnualReport, exportToPdf, exportToExcel } from '../utils/reportGenerator';
import { Search, Download, FileSpreadsheet } from 'lucide-react';

const LookupPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedClient } = useClientContext();
  const { filterTransactions } = useTransactionContext();

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    description: '',
    minAmount: '',
    maxAmount: '',
  });

  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  React.useEffect(() => {
    if (!selectedClient) {
      navigate('/');
    }
  }, [selectedClient, navigate]);

  if (!selectedClient) {
    return null;
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    const searchFilters: any = {
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      type: filters.type ? (filters.type as TransactionType) : undefined,
      description: filters.description || undefined,
      minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
      maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined,
    };

    const results = filterTransactions(selectedClient.id, searchFilters);
    setFilteredTransactions(results);
    setHasSearched(true);
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: '',
      description: '',
      minAmount: '',
      maxAmount: '',
    });
    setFilteredTransactions([]);
    setHasSearched(false);
  };

  const handleExportPdf = () => {
    // Use the current year for the report, but only include filtered transactions
    const currentYear = new Date().getFullYear();
    const report = generateAnnualReport(selectedClient, filteredTransactions, currentYear);
    report.monthlySummaries = report.monthlySummaries.filter(m => m.income > 0 || m.expenses > 0);
    exportToPdf(report);
  };

  const handleExportExcel = () => {
    const currentYear = new Date().getFullYear();
    const report = generateAnnualReport(selectedClient, filteredTransactions, currentYear);
    report.monthlySummaries = report.monthlySummaries.filter(m => m.income > 0 || m.expenses > 0);
    exportToExcel(report);
  };

  const getTransactionTypeLabel = (type: TransactionType): string => {
    const typeMap: Record<TransactionType, string> = {
      'EXPENSE': 'Despesa',
      'INCOME': 'Receita',
      'LIVESTOCK_PURCHASE': 'Compra de Gado',
      'LIVESTOCK_SALE': 'Venda de Gado',
      'ASSET_PURCHASE': 'Compra de Bem',
      'ASSET_SALE': 'Venda de Bem',
    };
    return typeMap[type] || type;
  };

  const getTransactionTypeColor = (type: TransactionType): string => {
    switch (type) {
      case 'INCOME':
      case 'LIVESTOCK_SALE':
      case 'ASSET_SALE':
        return 'text-green-700 bg-green-100';
      case 'EXPENSE':
      case 'LIVESTOCK_PURCHASE':
      case 'ASSET_PURCHASE':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const transactionTypeOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'EXPENSE', label: 'Despesa' },
    { value: 'INCOME', label: 'Receita' },
    { value: 'LIVESTOCK_PURCHASE', label: 'Compra de Gado' },
    { value: 'LIVESTOCK_SALE', label: 'Venda de Gado' },
    { value: 'ASSET_PURCHASE', label: 'Compra de Bem' },
    { value: 'ASSET_SALE', label: 'Venda de Bem' },
  ];

  return (
    <Layout>
      <Card title="Consulta de Lançamentos">
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name="startDate"
              type="date"
              label="Data inicial"
              value={filters.startDate}
              onChange={handleFilterChange}
              fullWidth
            />
            <Input
              name="endDate"
              type="date"
              label="Data final"
              value={filters.endDate}
              onChange={handleFilterChange}
              fullWidth
            />
            <Select
              name="type"
              label="Tipo"
              options={transactionTypeOptions}
              value={filters.type}
              onChange={(value) => handleFilterChange({ target: { name: 'type', value } } as any)}
              fullWidth
            />
            <Input
              name="description"
              label="Descrição"
              value={filters.description}
              onChange={handleFilterChange}
              fullWidth
            />
            <Input
              name="minAmount"
              type="number"
              label="Valor mínimo"
              value={filters.minAmount}
              onChange={handleFilterChange}
              fullWidth
            />
            <Input
              name="maxAmount"
              type="number"
              label="Valor máximo"
              value={filters.maxAmount}
              onChange={handleFilterChange}
              fullWidth
            />
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={resetFilters}>
              Limpar
            </Button>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-1" />
              Pesquisar
            </Button>
          </div>
        </div>

        {hasSearched && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Resultados da Consulta</h3>
              <div className="flex space-x-2">
                {filteredTransactions.length > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleExportExcel}>
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPdf}>
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  </>
                )}
              </div>
            </div>

            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detalhes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                              {getTransactionTypeLabel(transaction.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                            <span className={
                              transaction.type === 'INCOME' || transaction.type === 'LIVESTOCK_SALE' || transaction.type === 'ASSET_SALE'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }>
                              {formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(transaction.type === 'LIVESTOCK_PURCHASE' || transaction.type === 'LIVESTOCK_SALE') && (
                              <span>{transaction.quantity} cabeças</span>
                            )}
                            {(transaction.type === 'ASSET_PURCHASE' || transaction.type === 'ASSET_SALE') && transaction.assetDetails && (
                              <span>
                                {transaction.assetDetails.addToTaxDeclaration
                                  ? 'Adicionar ao IR'
                                  : 'Excluir do IR'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum lançamento encontrado com os filtros aplicados.</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default LookupPage;