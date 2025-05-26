import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client } from '../types';

interface ClientContextType {
  clients: Client[];
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  searchClients: (query: string) => Client[];
}

const ClientContext = createContext<ClientContextType>({
  clients: [],
  selectedClient: null,
  setSelectedClient: () => {},
  addClient: () => {},
  updateClient: () => {},
  deleteClient: () => {},
  searchClients: () => [],
});

export const useClientContext = () => useContext(ClientContext);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => {
    const savedClients = localStorage.getItem('clients');
    return savedClients ? JSON.parse(savedClients) : [];
  });
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  const addClient = (client: Client) => {
    setClients((prevClients) => [...prevClients, client]);
  };

  const updateClient = (updatedClient: Client) => {
    setClients((prevClients) => 
      prevClients.map((client) => 
        client.id === updatedClient.id ? updatedClient : client
      )
    );
  };

  const deleteClient = (id: string) => {
    setClients((prevClients) => 
      prevClients.filter((client) => client.id !== id)
    );
  };

  const searchClients = (query: string): Client[] => {
    const lowercaseQuery = query.toLowerCase();
    return clients.filter((client) => 
      client.name.toLowerCase().includes(lowercaseQuery) || 
      client.cpf.includes(query)
    );
  };

  return (
    <ClientContext.Provider 
      value={{ 
        clients, 
        selectedClient, 
        setSelectedClient, 
        addClient, 
        updateClient, 
        deleteClient,
        searchClients
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};