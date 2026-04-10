import api from './api';

const API_BASE = '/Rebuildhub';

const resourceService = {
  // ==================== INVENTORY CRUD ====================
  
  // Get all inventory items
  getAllInventory: async () => {
    try {
      const response = await api.get(`${API_BASE}/inventory`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch inventory' };
    }
  },

  // Get inventory by ID
  getInventoryById: async (id) => {
    try {
      const response = await api.get(`${API_BASE}/inventory/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch inventory item' };
    }
  },

  // Create new inventory (Admin only)
  createInventory: async (data) => {
    try {
      const response = await api.post(`${API_BASE}/inventory`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create inventory' };
    }
  },

  // Update inventory (Admin only)
  updateInventory: async (id, data) => {
    try {
      const response = await api.put(`${API_BASE}/inventory/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update inventory' };
    }
  },

  // Delete inventory (Admin only)
  deleteInventory: async (id) => {
    try {
      const response = await api.delete(`${API_BASE}/inventory/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete inventory' };
    }
  },

  // ==================== DONATIONS ====================

  // Create donation (User)
  createDonation: async (data) => {
    try {
      const response = await api.post(`${API_BASE}/donations`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create donation' };
    }
  },

  // Get all donations (Admin)
  getAllDonations: async () => {
    try {
      const response = await api.get(`${API_BASE}/donations`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch donations' };
    }
  },

  // Get donation by ID
  getDonationById: async (id) => {
    try {
      const response = await api.get(`${API_BASE}/donations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch donation' };
    }
  },

  // Delete donation (Admin)
  deleteDonation: async (id) => {
    try {
      const response = await api.delete(`${API_BASE}/donations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete donation' };
    }
  },

  // ==================== STATISTICS & UTILITIES ====================

  // Get low stock items
  getLowStockItems: (inventory) => {
    if (!inventory) return [];
    return inventory.filter(item => 
      item.type === 'STOCK' && 
      item.status === 'Low Stock'
    );
  },

  // Get out of stock items
  getOutOfStockItems: (inventory) => {
    if (!inventory) return [];
    return inventory.filter(item => 
      item.type === 'STOCK' && 
      item.status === 'Out of Stock'
    );
  },

  // Get inventory statistics
  getInventoryStats: (inventory) => {
    if (!inventory) return {
      totalItems: 0,
      totalStockValue: 0,
      totalMoneyAmount: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      availableCount: 0
    };

    const stockItems = inventory.filter(i => i.type === 'STOCK');
    const moneyItems = inventory.filter(i => i.type === 'MONEY');

    return {
      totalItems: inventory.length,
      totalStockValue: stockItems.reduce((sum, i) => sum + (i.totalQuantity || 0), 0),
      totalMoneyAmount: moneyItems.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
      lowStockCount: inventory.filter(i => i.status === 'Low Stock').length,
      outOfStockCount: inventory.filter(i => i.status === 'Out of Stock').length,
      availableCount: inventory.filter(i => i.status === 'Available').length
    };
  },

  // Get category distribution
  getCategoryDistribution: (inventory) => {
    const categories = {};

    inventory.forEach(item => {
      if (item.type === 'MONEY') {
        categories.Money = (categories.Money || 0) + (item.totalAmount || 0);
      } else if (item.category) {
        categories[item.category] = (categories[item.category] || 0) + (item.totalQuantity || 0);
      }
    });

    return categories;
  }
};

export default resourceService;