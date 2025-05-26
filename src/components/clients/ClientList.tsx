import React, { useState, useEffect } from 'react';
import { useClientContext } from '../../context/ClientContext';
import { formatCpf } from '../../utils/formatters';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { Search, UserPlus, Edit, Trash2 } from 'lucide-react';

interface ClientListProps {
  onSelect: (clientId: string) => void;
  onEdit: (clientId: string) => void;
  onDelete: (clientId: string) => void;
  onAdd: () => void;
}

const ClientList: React.FC<ClientListProps> = ({ onSelect, onEdit, onDelete, onAdd }) => {
  const { clients, searchClients } = useClientContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState(clients);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredClients(searchClients(searchQuery));
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients, searchClients]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const confirmDelete = (clientId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      onDelete(clientId);
    }
  };

  return (
    <Card 
      title="Clientes" 
      className="h-full flex flex-col"
      footer={
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {filteredClients.length} {filteredClients.length === 1 ? 'cliente' : 'clientes'}
          </span>
          <Button onClick={onAdd} size="sm">
            <UserPlus className="w-4 h-4 mr-1" />
            Novo Cliente
          </Button>
        </div>
      }
    >
      <div className="mb-4 relative">
        <Input
          placeholder="Buscar por nome ou CPF..."
          value={searchQuery}
          onChange={handleSearchChange}
          fullWidth
        />
        <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
      </div>
      
      <div className="overflow-y-auto flex-grow">
        {filteredClients.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <div key={client.id} className="py-3">
                <div className="flex justify-between items-start">
                  <div className="cursor-pointer" onClick={() => onSelect(client.id)}>
                    <h4 className="font-medium text-gray-900">{client.name}</h4>
                    <p className="text-sm text-gray-600">CPF: {formatCpf(client.cpf)}</p>
                    {client.phone && <p className="text-sm text-gray-600">Tel: {client.phone}</p>}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="text-gray-600 hover:text-emerald-600"
                      onClick={() => onEdit(client.id)}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      className="text-gray-600 hover:text-red-600"
                      onClick={() => confirmDelete(client.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum cliente encontrado.</p>
            <Button variant="outline" className="mt-2" onClick={onAdd}>
              Adicionar Cliente
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ClientList;