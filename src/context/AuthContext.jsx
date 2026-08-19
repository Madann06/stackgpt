import React, { createContext, useContext, useState, useEffect } from 'react';
import { stockApi } from '../services/stockApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Restore authenticated session from stored JWT on startup
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const cachedUser = localStorage.getItem('user_profile');

      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoadingUser(false);
        }
        return;
      }

      // Optimistically restore cached profile while verifying with backend
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          if (isMounted) {
            setUser(parsed);
            setIsAuthenticated(true);
          }
        } catch (e) {
          localStorage.removeItem('user_profile');
        }
      }

      try {
        const userData = await stockApi.getMe();
        if (userData && userData.email) {
          const profile = {
            id: userData.id,
            name: userData.full_name,
            email: userData.email,
            auth_provider: userData.auth_provider || 'local',
            role: userData.auth_provider === 'google' ? 'Verified Google Analyst' : 'Senior Portfolio Analyst',
            avatar: userData.auth_provider === 'google'
              ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            watchlist: ['RELIANCE.NS', 'TCS.NS', 'NVDA', 'AAPL']
          };
          if (isMounted) {
            setUser(profile);
            setIsAuthenticated(true);
            localStorage.setItem('user_profile', JSON.stringify(profile));
          }
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user_profile');
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const res = await stockApi.login(email, password);
    if (res && res.access_token) {
      const uData = res.user;
      const profile = {
        id: uData?.id || 1,
        name: uData?.full_name || email.split('@')[0].toUpperCase(),
        email: uData?.email || email,
        auth_provider: uData?.auth_provider || 'local',
        role: 'Senior Portfolio Analyst',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        watchlist: ['RELIANCE.NS', 'TCS.NS', 'NVDA', 'AAPL']
      };
      setUser(profile);
      setIsAuthenticated(true);
      localStorage.setItem('user_profile', JSON.stringify(profile));
      return res;
    }
    return null;
  };

  const register = async (fullName, email, password) => {
    const userRes = await stockApi.register(fullName, email, password);
    if (userRes) {
      return await login(email, password);
    }
    return null;
  };

  const loginWithGoogle = async () => {
    try {
      const data = await stockApi.getGoogleAuthUrl();
      if (data && data.url) {
        window.location.href = data.url;
        return;
      }
    } catch (e) {
      console.warn("Unable to fetch Google Auth URL:", e);
    }
  };

  const loginWithFacebook = async () => {
    try {
      const data = await stockApi.getFacebookAuthUrl();
      if (data && data.url) {
        window.location.href = data.url;
        return;
      }
    } catch (e) {
      console.warn("Unable to fetch Facebook Auth URL:", e);
    }
  };

  const handleOAuthToken = async (token) => {
    if (!token) return false;
    localStorage.setItem('token', token);
    try {
      const userData = await stockApi.getMe();
      if (userData && userData.email) {
        const profile = {
          id: userData.id,
          name: userData.full_name,
          email: userData.email,
          auth_provider: userData.auth_provider || 'google',
          role: 'Verified Google Analyst',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          watchlist: ['RELIANCE.NS', 'TCS.NS', 'NVDA', 'AAPL']
        };
        setUser(profile);
        setIsAuthenticated(true);
        localStorage.setItem('user_profile', JSON.stringify(profile));
        return true;
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_profile');
      setUser(null);
      setIsAuthenticated(false);
    }
    return false;
  };

  const logout = async () => {
    await stockApi.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    setIsAuthenticated(false);
    setUser(null);
  };

  const forgotPassword = async (email) => {
    return await stockApi.forgotPassword(email);
  };

  const toggleWatchlist = (symbol) => {
    if (!user) return;
    setUser(prev => {
      const watchlist = prev?.watchlist || [];
      const exists = watchlist.includes(symbol);
      const newWatchlist = exists
        ? watchlist.filter(s => s !== symbol)
        : [...watchlist, symbol];
      return { ...prev, watchlist: newWatchlist };
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingUser,
      login,
      register,
      loginWithGoogle,
      loginWithFacebook,
      handleOAuthToken,
      logout,
      forgotPassword,
      toggleWatchlist
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


