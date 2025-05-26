import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientContext } from '../context/ClientContext';
import Layout from '../components/layout/Layout';
import ClientList from '../components/clients/ClientList';
import ClientForm from '../components/clients/ClientForm';
import Card from '../components/ui/Card';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { clients, setSelectedClient, deleteClient } = useClientContext();
  const [showAddClient, setShowAddClient] = useState(false);
  const [editClientId, setEditClientId] = useState<string | null>(null);

  const handleSelectClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      navigate('/transactions');
    }
  };

  const handleEditClient = (clientId: string) => {
    setEditClientId(clientId);
  };

  const handleDeleteClient = (clientId: string) => {
    deleteClient(clientId);
  };

  const handleAddClient = () => {
    setShowAddClient(true);
  };

  const handleCloseForm = () => {
    setShowAddClient(false);
    setEditClientId(null);
  };

  const editingClient = editClientId ? clients.find((c) => c.id === editClientId) : undefined;

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClientList
            onSelect={handleSelectClient}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onAdd={handleAddClient}
          />
        </div>

        <div>
          {showAddClient || editClientId ? (
            <ClientForm
              client={editingClient}
              onClose={handleCloseForm}
            />
          ) : (
            <Card title="Gerenciamento de Clientes">
              <div className="py-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Bem-vindo ao Sistema IR Rural</h3>
                <p className="text-gray-600 mb-4">
                  Gerencie os dados de seus clientes para facilitar a declaração do Imposto de Renda Rural.
                </p>
                <ul className="list-disc pl-5 text-gray-600 mb-4">
                  <li>Cadastre novos clientes</li>
                  <li>Edite informações cadastrais</li>
                  <li>Realize lançamentos financeiros</li>
                  <li>Acompanhe a movimentação de rebanho</li>
                  <li>Gere relatórios para o IR Rural</li>
                </ul>
                <p className="text-gray-600">
                  Selecione um cliente na lista ou adicione um novo para começar.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ClientsPage;