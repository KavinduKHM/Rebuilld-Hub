import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, DollarSign, Package, Trash2 } from 'lucide-react';
import { useResource } from '../../context/ResourceContext';
import { useAuth } from '../../context/AuthContext';
import { clearAuthSession } from '../../services/authSession';
import InventoryTable from '../../components/resource/InventoryTable';
import InventoryForm from '../../components/resource/InventoryForm';
import StatisticsCards from '../../components/resource/StatisticsCards';
import LowStockAlert from '../../components/resource/LowStockAlert';
import ResourceCharts from '../../components/resource/ResourceCharts';
import "./ResourcePage.css";

const ResourceManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    inventory,
    donations,
    stats,
    lowStockItems,
    loading,
    error,
    fetchInventory,
    fetchDonations,
    createInventory,
    updateInventory,
    deleteInventory,
    deleteDonation
  } = useResource();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeDonationTable, setActiveDonationTable] = useState('MONEY');
  const [showFullLedger, setShowFullLedger] = useState(false);

  // Check if user is admin
  const role = user?.role || localStorage.getItem('role');
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
  }, [isAdmin]);

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

  const handleDeleteDonation = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation record?')) {
      try {
        await deleteDonation(id);
      } catch (err) {
        alert('Failed to delete donation: ' + err.message);
      }
    }
  };

  const moneyDonations = useMemo(
    () => (donations || []).filter((donation) => donation.type === 'MONEY'),
    [donations]
  );

  const stockDonations = useMemo(
    () => (donations || []).filter((donation) => donation.type === 'STOCK'),
    [donations]
  );

  const recentDonations = useMemo(() => {
    const sorted = [...(donations || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    return sorted.slice(0, 3);
  }, [donations]);

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
            <div className="page-card resource-hero">
              <div className="page-header">
                <div>
                  <span className="section-label">Resource Command</span>
                  <h1 className="page-title">Resource & Inventory Management</h1>
                  <p className="page-subtitle">Manage disaster relief resources, track inventory, and monitor donations.</p>
                </div>
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
              </div>
            </div>

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
                {/* Statistics Cards */}
                <div className="page-card resource-panel">
                  <StatisticsCards stats={stats} />
                </div>

                {/* Low Stock Alert */}
                <div className="page-card resource-panel">
                  <LowStockAlert 
                    lowStockItems={lowStockItems} 
                    onViewItem={handleViewItem}
                  />
                </div>

                {/* Charts Section */}
                <div className="page-card resource-panel">
                  <ResourceCharts inventory={inventory} />
                </div>

                {/* Inventory Table */}
                <div className="page-card resource-panel">
                  <InventoryTable
                    inventory={inventory}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    onView={handleViewItem}
                    isAdmin={isAdmin}
                  />
                </div>

                <div className="page-card resource-panel">
                  <div className="resource-ledger__header">
                    <div>
                      <span className="section-label">Ledger: Recent Donations</span>
                      <h3 className="page-title">Processing logs from verified partners</h3>
                    </div>
                    <button
                      type="button"
                      className="resource-ledger__link"
                      onClick={() => setShowFullLedger((prev) => !prev)}
                    >
                      {showFullLedger ? 'Hide Full Ledger' : 'View Full Ledger'}
                    </button>
                  </div>
                  <div className="resource-ledger">
                    {recentDonations.length === 0 ? (
                      <div className="resource-ledger__empty">
                        <Package className="h-10 w-10" />
                        <p>No donations recorded yet.</p>
                      </div>
                    ) : (
                      recentDonations.map((donation) => (
                        <article key={donation._id} className="resource-ledger__item">
                          <div className="resource-ledger__meta">
                            <span className="resource-ledger__icon">
                              {donation.type === 'MONEY' ? <DollarSign className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                            </span>
                            <div>
                              <p className="resource-ledger__name">{donation.donorName || 'Anonymous donor'}</p>
                              <p className="resource-ledger__note">
                                {donation.type === 'MONEY'
                                  ? (donation.name || 'Monetary Donation')
                                  : (donation.name || 'Stock Donation')}
                              </p>
                            </div>
                          </div>
                          <div className="resource-ledger__value">
                            <strong>
                              {donation.type === 'STOCK'
                                ? `${donation.quantity ?? 0} ${donation.unit || 'units'}`
                                : `LKR ${Number(donation.amount || 0).toLocaleString()}`}
                            </strong>
                            <span>{donation.paymentStatus || donation.status || 'Pending'}</span>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>

                {selectedItem && (
                  <div className="page-card resource-panel">
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

                {/* Donation Tables */}
                {showFullLedger && (
                <div className="page-card resource-panel resource-ledger-full" id="donations-ledger">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <span className="section-label">Donations Ledger</span>
                      <h3 className="page-title">Donation Records</h3>
                      <p className="page-subtitle">View money contributions and physical item donations separately.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className={`btn-secondary ${activeDonationTable === 'MONEY' ? 'btn-secondary--active' : ''}`}
                        onClick={() => setActiveDonationTable('MONEY')}
                      >
                        <DollarSign className="h-4 w-4" />
                        View Money Donations
                      </button>
                      <button
                        type="button"
                        className={`btn-secondary ${activeDonationTable === 'STOCK' ? 'btn-secondary--active' : ''}`}
                        onClick={() => setActiveDonationTable('STOCK')}
                      >
                        <Package className="h-4 w-4" />
                        View Physical Item Donations
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden resource-ledger-table">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donation ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor NIC</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donation Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity/Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {(activeDonationTable === 'MONEY' ? moneyDonations : stockDonations).map((donation) => (
                            <tr key={donation._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600">{donation._id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.donorName || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{donation.donorNIC || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{donation.email || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600">{donation.inventoryId || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.name || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{donation.description || '-'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {donation.type === 'STOCK'
                                  ? `${donation.quantity ?? 0} ${donation.unit || ''}`
                                  : `LKR ${Number(donation.amount || 0).toLocaleString()}`
                                }
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {donation.paymentStatus || 'PENDING'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {formatDateTime(donation.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  type="button"
                                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                  onClick={() => handleDeleteDonation(donation._id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {(activeDonationTable === 'MONEY' ? moneyDonations : stockDonations).length === 0 && (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No donations found for this category.</p>
                      </div>
                    )}
                  </div>
                </div>
                )}
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