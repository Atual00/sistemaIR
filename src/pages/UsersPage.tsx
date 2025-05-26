import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Users, UserPlus, Edit, Trash2 } from 'lucide-react';
import { User } from '../types';

const UsersPage: React.FC = () => {
  const { currentUser, users, addUser, updateUser, deleteUser } = useAuthContext();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        await updateUser({
          ...editingUser,
          ...formData,
        });
      } else {
        await addUser(formData as any);
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', name: '', role: 'user' });
    } catch (err) {
      setError('Erro ao salvar usuário');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      name: user.name,
      role: user.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (user: User) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUser(user.id);
      } catch (err) {
        setError('Erro ao excluir usuário');
      }
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <Layout>
        <Card>
          <p className="text-center text-gray-600">
            Acesso restrito a administradores
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Usuários"
            footer={
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {users.length} {users.length === 1 ? 'usuário' : 'usuários'}
                </span>
                <Button onClick={() => setShowForm(true)} size="sm">
                  <UserPlus className="w-4 h-4 mr-1" />
                  Novo Usuário
                </Button>
              </div>
            }
          >
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="text-gray-600 hover:text-emerald-600"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {users.length > 1 && (
                        <button
                          className="text-gray-600 hover:text-red-600"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {showForm && (
          <div>
            <Card
              title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              footer={
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingUser(null);
                      setFormData({ username: '', password: '', name: '', role: 'user' });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" form="user-form">
                    {editingUser ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </div>
              }
            >
              <form id="user-form" onSubmit={handleSubmit}>
                <Input
                  label="Nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  fullWidth
                />
                <Input
                  label="Usuário"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  fullWidth
                />
                <Input
                  type="password"
                  label={editingUser ? 'Nova Senha (opcional)' : 'Senha'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  fullWidth
                />
                <Select
                  label="Tipo de Usuário"
                  value={formData.role}
                  onChange={(value) => setFormData({ ...formData, role: value as 'admin' | 'user' })}
                  options={[
                    { value: 'user', label: 'Usuário' },
                    { value: 'admin', label: 'Administrador' },
                  ]}
                  required
                  fullWidth
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </form>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UsersPage;