import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '../../types';
import { useClientContext } from '../../context/ClientContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { validateCpf, formatCpf, cleanCpf } from '../../utils/formatters';

interface ClientFormProps {
  client?: Client;
  onClose?: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onClose }) => {
  const { addClient, updateClient } = useClientContext();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<Client>>(
    client || {
      name: '',
      cpf: '',
      address: '',
      phone: '',
      email: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      setFormData({ ...formData, cpf: formatCpf(value) });
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
    
    if (!formData.name?.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }
    
    if (!formData.cpf) {
      newErrors.cpf = 'O CPF é obrigatório';
    } else if (!validateCpf(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (client) {
      // Update existing client
      updateClient({
        ...client,
        ...formData,
        cpf: cleanCpf(formData.cpf || ''),
      } as Client);
    } else {
      // Add new client
      addClient({
        ...formData,
        id: uuidv4(),
        cpf: cleanCpf(formData.cpf || ''),
        createdAt: new Date(),
      } as Client);
    }
    
    if (onClose) onClose();
  };

  return (
    <Card 
      title={client ? 'Editar Cliente' : 'Novo Cliente'}
      footer={
        <div className="flex justify-end space-x-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          )}
          <Button type="submit" form="client-form">
            {client ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      }
    >
      <form id="client-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="name"
            name="name"
            label="Nome Completo"
            value={formData.name || ''}
            onChange={handleChange}
            error={errors.name}
            fullWidth
            required
          />
          <Input
            id="cpf"
            name="cpf"
            label="CPF"
            value={formData.cpf || ''}
            onChange={handleChange}
            error={errors.cpf}
            fullWidth
            required
            maxLength={14}
          />
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            value={formData.email || ''}
            onChange={handleChange}
            error={errors.email}
            fullWidth
          />
          <Input
            id="phone"
            name="phone"
            label="Telefone"
            value={formData.phone || ''}
            onChange={handleChange}
            fullWidth
          />
          <div className="md:col-span-2">
            <Input
              id="address"
              name="address"
              label="Endereço"
              value={formData.address || ''}
              onChange={handleChange}
              fullWidth
            />
          </div>
        </div>
      </form>
    </Card>
  );
};

export default ClientForm;