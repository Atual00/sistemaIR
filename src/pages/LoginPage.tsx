import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { BarChart2, LogIn } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/');
      } else {
        setError('Usuário ou senha inválidos');
      }
    } catch (err) {
      setError('Erro ao fazer login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BarChart2 className="h-12 w-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Sistema IR Rural</h2>
          <p className="mt-2 text-gray-600">Faça login para continuar</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <Input
              id="username"
              label="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
            />
            <Input
              id="password"
              type="password"
              label="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
            />
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}
            <Button type="submit" fullWidth>
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-gray-600">
          Usuário padrão: admin / Senha: admin
        </p>
      </div>
    </div>
  );
};

export default LoginPage;