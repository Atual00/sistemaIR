import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  users: [],
  login: async () => false,
  logout: () => {},
  addUser: async () => {},
  updateUser: async () => {},
  deleteUser: async () => {},
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users');
    if (!saved) {
      // Create default admin user if no users exist
      const defaultAdmin: User = {
        id: uuidv4(),
        username: 'admin',
        password: bcrypt.hashSync('admin', 10),
        name: 'Administrador',
        role: 'admin',
        createdAt: new Date(),
      };
      localStorage.setItem('users', JSON.stringify([defaultAdmin]));
      return [defaultAdmin];
    }
    return JSON.parse(saved);
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.password)) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser: User = {
      ...userData,
      id: uuidv4(),
      password: hashedPassword,
      createdAt: new Date(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (userData: User) => {
    const hashedPassword = userData.password.startsWith('$2')
      ? userData.password
      : await bcrypt.hash(userData.password, 10);

    setUsers(prev =>
      prev.map(user =>
        user.id === userData.id
          ? { ...userData, password: hashedPassword }
          : user
      )
    );
  };

  const deleteUser = async (id: string) => {
    if (users.length === 1) {
      throw new Error('Cannot delete the last user');
    }
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};