import React, { useState } from 'react';
import { Transaction, TransactionType } from '../../types';
import { useTransactionContext } from '../../context/TransactionContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  Search, PlusCircle, Edit, Trash2, Download, FileSpreadsheet 
} from 'lucide-react';

interface TransactionListProps {
  clientId: string;
  onEdit: (transactionId: string) => void;
  onDelete: (transactionId: string) => void;
  onAdd: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  clientId, 
  onEdit, 
  onDelete, 
  onAdd,
  onExportPdf,
  onExportExcel
}) => {
  const { getClientTransactions, filterTransactions } = useTransactionContext();
  const allTransactions = getClientTransactions(clientId);
  
  // Filter state
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    description: '',
  });
  
  // Apply filters
  const filteredTransactions = filters.startDate || filters.endDate || filters.type || filters.description
    ? filterTransactions(clientId, {
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        type: filters.type as TransactionType || undefined,
        description: filters.description || undefined,
      })
    : allTransactions;
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };
  
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: '',
      description: '',
    });
  };
  
  const confirmDelete = (transactionId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      onDelete(transactionId);
    }
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
    <Card 
      title="Lançamentos" 
      className="h-full flex flex-col"
      footer={
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'lançamento' : 'lançamentos'}
          </span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onExportExcel}>
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={onExportPdf}>
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
            <Button onClick={onAdd} size="sm">
              <PlusCircle className="w-4 h-4 mr-1" />
              Novo Lançamento
            </Button>
          </div>
        </div>
      }
    >
      {/* Filters */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="relative">
            <Input
              name="description"
              label="Descrição"
              value={filters.description}
              onChange={handleFilterChange}
              fullWidth
            />
            <Search className="absolute right-3 bottom-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Limpar filtros
          </Button>
        </div>
      </div>
      
      {/* Transactions list */}
      <div className="overflow-y-auto flex-grow">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredTransactions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((transaction) => (
                <div key={transaction.id} className="py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                          {getTransactionTypeLabel(transaction.type)}
                        </span>
                        <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                      </div>
                      <p className="text-sm text-gray-600">Data: {formatDate(transaction.date)}</p>
                      {(transaction.type === 'LIVESTOCK_PURCHASE' || transaction.type === 'LIVESTOCK_SALE') && (
                        <p className="text-sm text-gray-600">Quantidade: {transaction.quantity} cabeças</p>
                      )}
                      {(transaction.type === 'ASSET_PURCHASE' || transaction.type === 'ASSET_SALE') && transaction.assetDetails && (
                        <p className="text-sm text-gray-600">
                          {transaction.assetDetails.addToTaxDeclaration
                            ? 'Adicionar ao IR'
                            : 'Excluir do IR (se listado)'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-lg font-medium ${
                        transaction.type === 'INCOME' || transaction.type === 'LIVESTOCK_SALE' || transaction.type === 'ASSET_SALE'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          className="text-gray-600 hover:text-emerald-600"
                          onClick={() => onEdit(transaction.id)}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-red-600"
                          onClick={() => confirmDelete(transaction.id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum lançamento encontrado.</p>
            <Button variant="outline" className="mt-2" onClick={onAdd}>
              Adicionar Lançamento
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TransactionList;