import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, FileText, Users, PlusCircle, Search, LogOut, UserCog } from 'lucide-react';
import { useClientContext } from '../../context/ClientContext';
import { useAuthContext } from '../../context/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { selectedClient, setSelectedClient } = useClientContext();
  const { currentUser, logout } = useAuthContext();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const handleNavigation = (path: string) => {
    setShowMobileMenu(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-emerald-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BarChart2 className="h-6 w-6" />
            <h1 className="text-xl font-bold">Sistema IR Rural</h1>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <button 
              onClick={() => handleNavigation('/')} 
              className="flex items-center text-white hover:text-emerald-200 transition-colors"
            >
              <Users className="w-5 h-5 mr-1" />
              <span>Clientes</span>
            </button>
            
            {selectedClient && (
              <>
                <button 
                  onClick={() => handleNavigation('/transactions')} 
                  className="flex items-center text-white hover:text-emerald-200 transition-colors"
                >
                  <PlusCircle className="w-5 h-5 mr-1" />
                  <span>Lançamentos</span>
                </button>
                
                <button 
                  onClick={() => handleNavigation('/reports')} 
                  className="flex items-center text-white hover:text-emerald-200 transition-colors"
                >
                  <FileText className="w-5 h-5 mr-1" />
                  <span>Relatórios</span>
                </button>
                
                <button 
                  onClick={() => handleNavigation('/lookup')} 
                  className="flex items-center text-white hover:text-emerald-200 transition-colors"
                >
                  <Search className="w-5 h-5 mr-1" />
                  <span>Consultas</span>
                </button>
              </>
            )}

            {currentUser?.role === 'admin' && (
              <button 
                onClick={() => handleNavigation('/users')} 
                className="flex items-center text-white hover:text-emerald-200 transition-colors"
              >
                <UserCog className="w-5 h-5 mr-1" />
                <span>Usuários</span>
              </button>
            )}
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            {selectedClient && (
              <div className="flex items-center">
                <span className="mr-2 text-sm">Cliente:</span>
                <span className="font-medium text-emerald-100">{selectedClient.name}</span>
                <button 
                  onClick={() => setSelectedClient(null)} 
                  className="ml-2 text-xs bg-emerald-800 hover:bg-emerald-900 rounded px-2 py-1"
                >
                  Trocar
                </button>
              </div>
            )}
            
            <div className="border-l border-emerald-600 pl-4">
              <div className="flex items-center">
                <span className="text-sm mr-2">{currentUser?.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-emerald-200 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        {showMobileMenu && (
          <nav className="md:hidden mt-2 pb-2">
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => handleNavigation('/')} 
                className="flex items-center text-white hover:text-emerald-200 transition-colors"
              >
                <Users className="w-5 h-5 mr-1" />
                <span>Clientes</span>
              </button>
              
              {selectedClient && (
                <>
                  <button 
                    onClick={() => handleNavigation('/transactions')} 
                    className="flex items-center text-white hover:text-emerald-200 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5 mr-1" />
                    <span>Lançamentos</span>
                  </button>
                  
                  <button 
                    onClick={() => handleNavigation('/reports')} 
                    className="flex items-center text-white hover:text-emerald-200 transition-colors"
                  >
                    <FileText className="w-5 h-5 mr-1" />
                    <span>Relatórios</span>
                  </button>
                  
                  <button 
                    onClick={() => handleNavigation('/lookup')} 
                    className="flex items-center text-white hover:text-emerald-200 transition-colors"
                  >
                    <Search className="w-5 h-5 mr-1" />
                    <span>Consultas</span>
                  </button>
                </>
              )}

              {currentUser?.role === 'admin' && (
                <button 
                  onClick={() => handleNavigation('/users')} 
                  className="flex items-center text-white hover:text-emerald-200 transition-colors"
                >
                  <UserCog className="w-5 h-5 mr-1" />
                  <span>Usuários</span>
                </button>
              )}
              
              <div className="pt-2 border-t border-emerald-600">
                {selectedClient && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="mr-2 text-sm">Cliente:</span>
                      <span className="font-medium text-emerald-100">{selectedClient.name}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedClient(null)} 
                      className="text-xs bg-emerald-800 hover:bg-emerald-900 rounded px-2 py-1"
                    >
                      Trocar
                    </button>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">{currentUser?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-emerald-200 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;