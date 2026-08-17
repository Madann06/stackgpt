import React, { createContext, useContext, useState, useEffect } from 'react';

const UserFeaturesContext = createContext();

export const useUserFeatures = () => useContext(UserFeaturesContext);

export const UserFeaturesProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const item = localStorage.getItem('stockai_wishlist');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      return [];
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      const item = localStorage.getItem('stockai_history');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('stockai_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('stockai_history', JSON.stringify(history));
  }, [history]);

  const addToWishlist = (company) => {
    setWishlist((prev) => {
      if (prev.find(i => i.symbol === company.symbol)) return prev;
      return [...prev, { ...company, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromWishlist = (symbol) => {
    setWishlist((prev) => prev.filter(i => i.symbol !== symbol));
  };

  const isInWishlist = (symbol) => {
    return wishlist.some(i => i.symbol === symbol);
  };

  const addToHistory = (company) => {
    setHistory((prev) => {
      const filtered = prev.filter(i => i.symbol !== company.symbol);
      return [{ ...company, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 50); // Keep max 50
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <UserFeaturesContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      history,
      addToHistory,
      clearHistory
    }}>
      {children}
    </UserFeaturesContext.Provider>
  );
};
