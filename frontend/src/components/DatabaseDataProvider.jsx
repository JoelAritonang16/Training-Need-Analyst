import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { trainingProposalAPI } from '../utils/api';

const DatabaseDataContext = createContext();

export const useDatabaseData = () => {
  const context = useContext(DatabaseDataContext);
  if (!context) {
    throw new Error('useDatabaseData must be used within a DatabaseDataProvider');
  }
  return context;
};

export const DatabaseDataProvider = ({ children }) => {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProposals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Anda belum login. Silakan login terlebih dahulu.');
      }

      const data = await trainingProposalAPI.getAll();
      const proposalsData = data.proposals || data.data || [];
      setProposals(proposalsData);
    } catch (err) {
      // Handle timeout and network errors gracefully
      if (err?.isTimeout || err?.name === 'TimeoutError') {
        setError('Request timeout: Server tidak merespons. Silakan coba lagi.');
        setProposals([]);
      } else if (err?.isNetworkError || err?.name === 'NetworkError') {
        setError('Tidak dapat terhubung ke server. Pastikan server backend berjalan.');
        setProposals([]);
      } else if (err.message.includes('login')) {
        setError(err.message);
        setProposals([]);
      } else if (err.message.includes('500')) {
        setError('Server sedang mengalami masalah. Silakan coba lagi nanti.');
        setProposals([]);
      } else {
        setError(err.message);
        setProposals([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchProposals();
  }, [fetchProposals]);

  useEffect(() => {
    // Only fetch proposals if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchProposals();
    }
  }, [fetchProposals]);

  const value = {
    proposals,
    isLoading,
    error,
    fetchProposals,
    refreshData,
    setProposals
  };

  return (
    <DatabaseDataContext.Provider value={value}>
      {children}
    </DatabaseDataContext.Provider>
  );
};
