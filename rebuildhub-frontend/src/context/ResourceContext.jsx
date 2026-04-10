import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import resourceService from '../services/resourceService';
import { useAuth } from './AuthContext';

const ResourceContext = createContext();

export const useResource = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResource must be used within ResourceProvider');
  }
  return context;
};

export const ResourceProvider = ({ children }) => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);

  // Fetch all inventory
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await resourceService.getAllInventory();
      setInventory(data);
      setStats(resourceService.getInventoryStats(data));
      setLowStockItems(resourceService.getLowStockItems(data));
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all donations (Admin only)
  const fetchDonations = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const data = await resourceService.getAllDonations();
      setDonations(data);
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    }
  }, [user]);

  // Create new inventory item
  const createInventory = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const newItem = await resourceService.createInventory(data);
      setInventory(prev => {
        const updatedInventory = [newItem, ...prev];
        setStats(resourceService.getInventoryStats(updatedInventory));
        setLowStockItems(resourceService.getLowStockItems(updatedInventory));
        return updatedInventory;
      });
      return newItem;
    } catch (err) {
      setError(err.message || 'Failed to create inventory');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update inventory item
  const updateInventory = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await resourceService.updateInventory(id, data);

      // Support APIs that may return a partial payload by merging with existing local item.
      setInventory((prev) => {
        const mergedInventory = prev.map((item) => {
          if (item._id !== id) return item;
          if (updated && typeof updated === 'object') {
            return { ...item, ...updated };
          }
          return { ...item, ...data, updatedAt: new Date().toISOString() };
        });

        setStats(resourceService.getInventoryStats(mergedInventory));
        setLowStockItems(resourceService.getLowStockItems(mergedInventory));
        return mergedInventory;
      });

      // Ensure table reflects canonical backend values after redirect/navigation.
      await fetchInventory();
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update inventory');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete inventory item
  const deleteInventory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await resourceService.deleteInventory(id);
      const updatedInventory = inventory.filter(item => item._id !== id);
      setInventory(updatedInventory);
      setStats(resourceService.getInventoryStats(updatedInventory));
      setLowStockItems(resourceService.getLowStockItems(updatedInventory));
    } catch (err) {
      setError(err.message || 'Failed to delete inventory');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create donation
  const createDonation = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await resourceService.createDonation(data);
      await fetchInventory(); // Refresh inventory after donation
      return result;
    } catch (err) {
      setError(err.message || 'Failed to create donation');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete donation (Admin)
  const deleteDonation = async (id) => {
    try {
      await resourceService.deleteDonation(id);
      setDonations(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete donation');
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDonations();
    }
  }, [user, fetchDonations]);

  const value = {
    inventory,
    donations,
    loading,
    error,
    stats,
    lowStockItems,
    fetchInventory,
    fetchDonations,
    createInventory,
    updateInventory,
    deleteInventory,
    createDonation,
    deleteDonation
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
};