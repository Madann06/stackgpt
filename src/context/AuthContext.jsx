import React, { createContext, useContext, useState, useEffect } from 'react';
import { stockApi } from '../services/stockApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Load user profile on startup if JWT token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoadingUser(false);
        return;
      }
      try {
        const userData = await stockApi.getMe();
        setUser({
          id: userData.id,
          name: userData.full_name,
          email: userData.email,
          role: 'Senior Portfolio Analyst',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          watchlist: ['AAPL', 'NVDA', 'MSFT']
        });
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await stockApi.login(email, password);
    if (res && res.access_token) {
      try {
        const userData = await stockApi.getMe();
        setUser({
          id: userData.id,
          name: userData.full_name,
          email: userData.email,
          role: 'Investment Analyst',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          watchlist: ['AAPL', 'NVDA', 'MSFT']
        });
      } catch (e) {
        setUser({
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          email: email,
          role: 'Investment Analyst',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          watchlist: ['AAPL', 'NVDA', 'MSFT']
        });
      }
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const register = async (fullName, email, password) => {
    const userRes = await stockApi.register(fullName, email, password);
    if (userRes) {
      return await login(email, password);
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const toggleWatchlist = (symbol) => {
    if (!user) return;
    setUser(prev => {
      const watchlist = prev.watchlist || [];
      const exists = watchlist.includes(symbol);
      const newWatchlist = exists
        ? watchlist.filter(s => s !== symbol)
        : [...watchlist, symbol];
      return { ...prev, watchlist: newWatchlist };
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoadingUser, login, register, logout, toggleWatchlist }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
