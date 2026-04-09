import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { useResource } from '../../context/ResourceContext';
import { useAuth } from '../../context/AuthContext';
import { clearAuthSession } from '../../services/authSession';
import InventoryTable from '../../components/resource/InventoryTable';
import InventoryForm from '../../components/resource/InventoryForm';
import StatisticsCards from '../../components/resource/StatisticsCards';
import LowStockAlert from '../../components/resource/LowStockAlert';
import InventoryAnalyticsCharts from '../../components/resource/InventoryAnalyticsCharts';
import "./ResourcePage.css";

const themedHeaderStyle = {
  background: 'linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(239, 245, 255, 0.92))',
  border: '1px solid rgba(191, 219, 254, 0.72)',
  boxShadow: '0 16px 36px rgba(147, 197, 253, 0.24)'
};

const themedPanelStyle = {
  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 255, 0.92))',
  border: '1px solid rgba(191, 219, 254, 0.72)',
  boxShadow: '0 14px 30px rgba(147, 197, 253, 0.2)'
};

const ResourceManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    inventory,
    donations,
    stats,
    loading,
    error,
    fetchInventory,
    fetchDonations,
    createInventory,
    updateInventory,
    deleteInventory
  } = useResource();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user is admin
  const role = user?.role || localStorage.getItem('role');
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/', { replace: true });
  };

  const handleRefresh = async () => {
    await fetchInventory();
    await fetchDonations();
  };

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
        setSuccessMessage(`Inventory item "${item.name || 'Item'}" deleted successfully.`);
      } catch (err) {
        alert('Failed to delete item: ' + err.message);
      }
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
  };

  const handleFormSubmit = async (data) => {
    if (editingItem) {
      await updateInventory(editingItem._id, data);
    } else {
      await createInventory(data);
    }
  };

  const quickInsights = useMemo(() => ({
    stockItems: inventory?.filter((item) => item.type === 'STOCK').length || 0,
    totalFunds: inventory?.filter((item) => item.type === 'MONEY').reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0,
    criticalItems: inventory?.filter((item) => item.status === 'Low Stock' || item.status === 'Out of Stock').length || 0,
    totalItems: inventory?.length || 0
  }), [inventory]);

  const criticalAlertItems = useMemo(
    () => (inventory || []).filter(
      (item) => item.status === 'Low Stock' || item.status === 'Out of Stock'
    ),
    [inventory]
  );

  const formatDateTime = (value) => {
    if (!value) return 'Unknown';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Unknown';
    return parsed.toLocaleString();
  };

  if (!isAdmin) {
    return (
      <div className="page-shell resource-shell resource-shell--center">
        <div className="page-card resource-card text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tac-shell">
      <aside className="tac-sidebar">
        <div>
          <h1>Tactical Command</h1>
          <span className="tac-sidebar-subtitle">Sector 7G - Active</span>
        </div>

        <nav className="admin-nav">
          <Link to="/admin/dashboard" className="admin-nav-link">Disasters</Link>
          <Link to="/admin/volunteers" className="admin-nav-link">Volunteers</Link>
          <Link to="/admin/resources" className="admin-nav-link admin-nav-link--active">Resources</Link>
          <Link to="/admin/donations" className="admin-nav-link">Donations</Link>
          <Link to="/admin/aid-requests" className="admin-nav-link">Aid Requests</Link>
        </nav>

        <div className="tac-sidebar-footer">
          <button className="btn-secondary" type="button" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="tac-main">
        <div className="page-shell resource-shell">
          <div className="container container--wide resource-shell__inner">
            {/* Header */}
            <div className="page-card resource-hero" style={themedHeaderStyle}>
              <div className="page-header">
                <div>
                  <span className="section-label">Resource Command</span>
                  <h1 className="page-title">Resource & Inventory Management</h1>
                  <p className="page-subtitle">Manage disaster relief resources, track inventory, and monitor donations.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
                  <div className="resource-hero__actions">
                    <button
                      type="button"
                      onClick={handleRefresh}
                      className="btn-secondary"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="btn-primary"
                    >
                      <Plus className="h-4 w-4" />
                      Add Inventory Item
                    </button>
                  </div>

                  <div
                    className="admin-topbar__meta"
                    style={{
                      marginLeft: 'auto',
                      minWidth: '420px',
                      padding: '0.45rem 0.25rem',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.86)',
                      border: '1px solid rgba(191, 219, 254, 0.8)',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1fr',
                      gap: 0,
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ textAlign: 'center', padding: '0.45rem 0.2rem', borderRight: '1px solid rgba(191, 219, 254, 0.72)' }}>
                      <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2b63c9' }}>Stock</p>
                      <strong style={{ fontSize: '1.4rem', lineHeight: 1.05, color: '#142d59' }}>{quickInsights.stockItems}</strong>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.45rem 0.2rem', borderRight: '1px solid rgba(191, 219, 254, 0.72)' }}>
                      <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0f766e' }}>Funds</p>
                      <strong style={{ fontSize: '1.4rem', lineHeight: 1.05, color: '#142d59' }}>LKR {quickInsights.totalFunds.toLocaleString()}</strong>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.45rem 0.2rem', borderRight: '1px solid rgba(191, 219, 254, 0.72)' }}>
                      <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d04146' }}>Critical</p>
                      <strong style={{ fontSize: '1.4rem', lineHeight: 1.05, color: '#142d59' }}>{quickInsights.criticalItems}</strong>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.45rem 0.2rem' }}>
                      <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6d28d9' }}>Total</p>
                      <strong style={{ fontSize: '1.4rem', lineHeight: 1.05, color: '#142d59' }}>{quickInsights.totalItems}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {successMessage && (
              <div className="page-card resource-card" style={{ borderColor: 'rgba(16, 185, 129, 0.35)', background: '#ecfdf5' }}>
                <p className="text-green-700">{successMessage}</p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="page-card resource-card resource-alert">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="page-card resource-card resource-shell--center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Content */}
            {!loading && (
              <>
                {/* Low Stock Alert */}
                <LowStockAlert 
                  lowStockItems={criticalAlertItems} 
                  onViewItem={handleViewItem}
                />

                {/* Inventory Table */}
                <div className="page-card resource-panel" style={themedPanelStyle}>
                  <InventoryTable
                    inventory={inventory}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    onView={handleViewItem}
                    isAdmin={isAdmin}
                  />
                </div>

                <div className="page-card resource-panel" style={themedPanelStyle}>
                  <div className="resource-ledger__header">
                    <div>
                      <span className="section-label">Inventory Analytics</span>
                      <h3 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Distribution Charts</h3>
                      <p className="page-subtitle">Inventory and donation distribution by category and type.</p>
                    </div>
                  </div>
                  <InventoryAnalyticsCharts inventory={inventory} donations={donations} />
                </div>

                {selectedItem && (
                  <div className="page-card resource-panel" style={themedPanelStyle}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="section-label">Selected Item</span>
                        <h3 className="page-title">Inventory Details</h3>
                        <p className="page-subtitle">Full details for the selected inventory item.</p>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setSelectedItem(null)}
                      >
                        Clear Selection
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="resource-card">
                        <p className="text-xs text-gray-500">Item Name</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedItem.name || '-'}</p>
                      </div>
                      <div className="resource-card">
                        <p className="text-xs text-gray-500">Inventory Code</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedItem.inventoryCode || '-'}</p>
                      </div>
                      <div className="resource-card">
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedItem.type || '-'}</p>
                      </div>
                      <div className="resource-card">
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedItem.status || '-'}</p>
                      </div>
                      <div className="resource-card">
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedItem.category || '-'}</p>
                      </div>
                      <div className="resource-card">
                        <p className="text-xs text-gray-500">Unit</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedItem.unit || '-'}</p>
                      </div>
                      <div className="resource-card">
                        <p className="text-xs text-gray-500">Quantity</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedItem.totalQuantity ?? '-'}</p>
                      </div>
                      <div className="resource-card">
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedItem.totalAmount ?? '-'}</p>
                      </div>
                      <div className="resource-card md:col-span-2">
                        <p className="text-xs text-gray-500">Description</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedItem.description || '-'}</p>
                      </div>
                      <div className="resource-card">
                        <p className="text-xs text-gray-500">Created At</p>
                        <p className="text-sm font-semibold text-gray-900">{formatDateTime(selectedItem.createdAt)}</p>
                      </div>
                      <div className="resource-card">
                        <p className="text-xs text-gray-500">Updated At</p>
                        <p className="text-sm font-semibold text-gray-900">{formatDateTime(selectedItem.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Details */}
                <div className="page-card resource-panel" style={themedPanelStyle}>
                  <StatisticsCards stats={stats} />
                </div>
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
      </main>
    </div>
  );
};

export default ResourceManagementPage;