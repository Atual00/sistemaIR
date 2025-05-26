import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionType } from '../../types';
import { useTransactionContext } from '../../context/TransactionContext';
import { useClientContext } from '../../context/ClientContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

interface TransactionFormProps {
  transaction?: Transaction;
  clientId: string;
  onClose?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  transaction, 
  clientId, 
  onClose 
}) => {
  const { addTransaction, updateTransaction } = useTransactionContext();
  const { selectedClient } = useClientContext();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<Transaction>>(
    transaction || {
      clientId,
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
      description: '',
      amount: 0,
    }
  );

  // Show/hide asset fields based on transaction type
  const [showAssetFields, setShowAssetFields] = useState(
    transaction?.type === 'ASSET_PURCHASE' || transaction?.type === 'ASSET_SALE'
  );

  // Show/hide livestock fields based on transaction type
  const [showLivestockFields, setShowLivestockFields] = useState(
    transaction?.type === 'LIVESTOCK_PURCHASE' || transaction?.type === 'LIVESTOCK_SALE'
  );

  useEffect(() => {
    const isAssetTransaction = 
      formData.type === 'ASSET_PURCHASE' || formData.type === 'ASSET_SALE';
    setShowAssetFields(isAssetTransaction);

    const isLivestockTransaction = 
      formData.type === 'LIVESTOCK_PURCHASE' || formData.type === 'LIVESTOCK_SALE';
    setShowLivestockFields(isLivestockTransaction);
  }, [formData.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else if (name === 'quantity') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else if (name === 'type') {
      setFormData({ ...formData, [name]: value as TransactionType });
    } else if (name === 'addToTaxDeclaration') {
      setFormData({ 
        ...formData, 
        assetDetails: { 
          ...formData.assetDetails, 
          addToTaxDeclaration: (e.target as HTMLInputElement).checked 
        } 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) {
      newErrors.date = 'A data é obrigatória';
    }
    
    if (!formData.type) {
      newErrors.type = 'O tipo de lançamento é obrigatório';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'A descrição é obrigatória';
    }
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'O valor deve ser maior que zero';
    }
    
    if (showLivestockFields && (!formData.quantity || formData.quantity <= 0)) {
      newErrors.quantity = 'A quantidade de animais deve ser maior que zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const date = new Date(formData.date as string);
    
    if (transaction) {
      // Update existing transaction
      updateTransaction({
        ...transaction,
        ...formData,
        date,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      } as Transaction);
    } else {
      // Add new transaction
      addTransaction({
        ...formData,
        clientId,
        date,
      } as Omit<Transaction, 'id' | 'createdAt' | 'month' | 'year'>);
    }
    
    if (onClose) onClose();
  };

  const transactionTypeOptions = [
    { value: 'EXPENSE', label: 'Despesa' },
    { value: 'INCOME', label: 'Receita' },
    { value: 'LIVESTOCK_PURCHASE', label: 'Compra de Gado' },
    { value: 'LIVESTOCK_SALE', label: 'Venda de Gado' },
    { value: 'ASSET_PURCHASE', label: 'Compra de Bem' },
    { value: 'ASSET_SALE', label: 'Venda de Bem' },
  ];

  return (
    <Card 
      title={transaction ? 'Editar Lançamento' : 'Novo Lançamento'}
      footer={
        <div className="flex justify-end space-x-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          )}
          <Button type="submit" form="transaction-form">
            {transaction ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      }
    >
      {selectedClient && (
        <div className="mb-4 p-3 bg-emerald-50 rounded-md">
          <p className="text-sm text-emerald-800">
            <span className="font-medium">Cliente:</span> {selectedClient.name}
          </p>
        </div>
      )}
      
      <form id="transaction-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="date"
            name="date"
            type="date"
            label="Data"
            value={formData.date ? formData.date.toString().split('T')[0] : ''}
            onChange={handleChange}
            error={errors.date}
            fullWidth
            required
          />
          
          <Select
            id="type"
            name="type"
            label="Tipo de Lançamento"
            options={transactionTypeOptions}
            value={formData.type as string}
            onChange={(value) => handleChange({ target: { name: 'type', value } } as any)}
            error={errors.type}
            fullWidth
            required
          />
          
          <div className="md:col-span-2">
            <Input
              id="description"
              name="description"
              label="Descrição"
              value={formData.description || ''}
              onChange={handleChange}
              error={errors.description}
              fullWidth
              required
            />
          </div>
          
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            label="Valor (R$)"
            value={formData.amount?.toString() || ''}
            onChange={handleChange}
            error={errors.amount}
            fullWidth
            required
          />
          
          {showLivestockFields && (
            <Input
              id="quantity"
              name="quantity"
              type="number"
              label="Quantidade de Animais"
              value={formData.quantity?.toString() || ''}
              onChange={handleChange}
              error={errors.quantity}
              fullWidth
              required
            />
          )}
          
          {showAssetFields && (
            <div className="md:col-span-2 mt-2">
              <div className="flex items-center">
                <input
                  id="addToTaxDeclaration"
                  name="addToTaxDeclaration"
                  type="checkbox"
                  checked={formData.assetDetails?.addToTaxDeclaration || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="addToTaxDeclaration" className="ml-2 block text-sm text-gray-700">
                  {formData.type === 'ASSET_PURCHASE' 
                    ? 'Adicionar ao Imposto de Renda' 
                    : 'Excluir do Imposto de Renda (se listado)'}
                </label>
              </div>
            </div>
          )}
        </div>
      </form>
    </Card>
  );
};

export default TransactionForm;