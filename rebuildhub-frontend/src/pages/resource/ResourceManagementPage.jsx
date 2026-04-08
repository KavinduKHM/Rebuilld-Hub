import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, TrendingUp } from 'lucide-react';
import { useResource } from '../../context/ResourceContext';
import { useAuth } from '../../context/AuthContext';
import InventoryTable from '../../components/resource/InventoryTable';
import InventoryForm from '../../components/resource/InventoryForm';
import StatisticsCards from '../../components/resource/StatisticsCards';
import LowStockAlert from '../../components/resource/LowStockAlert';
import ResourceCharts from '../../components/resource/ResourceCharts';

const ResourceManagementPage = () => {
  const { user } = useAuth();
  const {
    inventory,
    donations,
    stats,
    lowStockItems,
    loading,
    error,
    fetchInventory,
    createInventory,
    updateInventory,
    deleteInventory,
    deleteDonation
  } = useResource();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDonationsOpen, setIsDonationsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      // Redirect or show unauthorized message
      window.location.href = '/dashboard';
    }
  }, [isAdmin]);

  const handleAddItem = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      try {
        await deleteInventory(item._id);
      } catch (err) {
        alert('Failed to delete item: ' + err.message);
      }
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    // You can implement a detailed view modal here
    alert(`Item Details:\nName: ${item.name}\nCode: ${item.inventoryCode}\nStatus: ${item.status}\nType: ${item.type}`);
  };

  const handleFormSubmit = async (data) => {
    if (editingItem) {
      await updateInventory(editingItem._id, data);
    } else {
      await createInventory(data);
    }
  };

  const handleDeleteDonation = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation record?')) {
      try {
        await deleteDonation(id);
      } catch (err) {
        alert('Failed to delete donation: ' + err.message);
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Resource & Inventory Management</h1>
              <p className="text-gray-600 mt-1">Manage disaster relief resources, track inventory, and monitor donations</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => fetchInventory()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 shadow-md"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 shadow-md"
              >
                <Plus className="h-4 w-4" />
                Add Inventory Item
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Statistics Cards */}
            <StatisticsCards stats={stats} />

            {/* Low Stock Alert */}
            <LowStockAlert 
              lowStockItems={lowStockItems} 
              onViewItem={handleViewItem}
            />

            {/* Charts Section */}
            <div className="mb-8">
              <ResourceCharts inventory={inventory} />
            </div>

            {/* Inventory Table */}
            <InventoryTable
              inventory={inventory}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onView={handleViewItem}
              isAdmin={isAdmin}
              onDonationsClick={() => setIsDonationsOpen(true)}
            />
          </>
        )}

        {/* Forms and Modals */}
        <InventoryForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingItem}
          isEditing={!!editingItem}
        />

      </div>
    </div>
  );
};

export default ResourceManagementPage;