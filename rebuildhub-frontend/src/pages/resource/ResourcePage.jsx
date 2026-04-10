import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  AlertTriangle, Package, Heart, 
  Search, Filter, TrendingDown,
  Droplets, Tent, Briefcase, DollarSign,
  Gift, Shield, BarChart3, Users, Clock,
  ChevronDown, ChevronUp, PlusCircle
} from 'lucide-react';
import DonationForm from '../../components/resource/DonationForm';
import MoneyDonationForm from '../../components/resource/MoneyDonationForm';
import DonationFlow from '../../components/resource/DonationFlow'; // This is actually DonationFlow
import { useAlert } from '../../context/AlertContext';
import { API_BASE_URL } from '../../services/api';
import "./ResourcePage.css";

const ResourcePage = () => {
  const location = useLocation();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMoneyTerm, setSearchMoneyTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [moneyCategoryFilter, setMoneyCategoryFilter] = useState('all');
  const [error, setError] = useState(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showMoneyDonationForm, setShowMoneyDonationForm] = useState(false);
  const [showDonationFlow, setShowDonationFlow] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFund, setSelectedFund] = useState(null);
  const [expandedSection, setExpandedSection] = useState('money');
  const { showAlert } = useAlert();

  // Fetch inventory from database
  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');
    const donationId = params.get('donation_id');
    const cleanResourcesUrl = window.location.pathname;

    if (payment === 'success' && sessionId) {
      // Clean URL immediately, then verify in background.
      window.history.replaceState({}, document.title, cleanResourcesUrl);
      showAlert('Verifying your payment. Please wait a moment...', { variant: 'info' });
      verifyPayment(sessionId, donationId);
      return;
    }

    if (payment === 'canceled') {
      showAlert('Payment was canceled. You can try again when you are ready.', {
        variant: 'warning',
      });
      window.history.replaceState({}, document.title, cleanResourcesUrl);
    }
  }, [location.search]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/Rebuildhub/inventory`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      const data = await response.json();
      console.log('Fetched inventory:', data);
      setInventoryItems(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to load inventory. Please check if backend is running.');
      showAlert('Failed to load inventory. Please check if backend is running.', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (sessionId, donationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/Rebuildhub/donations/verify-payment?session_id=${sessionId}&donation_id=${donationId || ''}`
      );
      const result = await response.json();

      if (result.success) {
        showAlert('Payment verified. Thank you for your donation!', { variant: 'success' });
        await fetchInventory();
      } else {
        showAlert(result.message || 'Payment verification failed. Please contact support.', {
          variant: 'error',
        });
      }
    } catch (err) {
      showAlert('Unable to verify payment. Please contact support.', { variant: 'error' });
    }
  };

  // Filter stock items based on search and category
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.inventoryCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory && item.type === 'STOCK';
  });

  // Filter money items - categorized by 'name' for search
  const filteredMoneyItems = inventoryItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchMoneyTerm.toLowerCase());
    const matchesCategory = moneyCategoryFilter === 'all' || item.category === moneyCategoryFilter;
    return matchesSearch && matchesCategory && item.type === 'MONEY';
  }).sort((a, b) => a.name?.localeCompare(b.name));

  // Separate stock and money items
  const stockItems = inventoryItems.filter(item => item.type === 'STOCK');
  const moneyItems = inventoryItems.filter(item => item.type === 'MONEY');
  
  // Low stock items (stock items with low quantity) - sorted by lowest quantity first
  const lowStockItems = [...stockItems].filter(item => 
    item.status === 'Low Stock' || item.status === 'Out of Stock' || 
    item.totalQuantity < 10
  ).sort((a, b) => a.totalQuantity - b.totalQuantity);

  // Low monetary funds - funds with < 500 LKR
  const lowMoneyItems = [...moneyItems].filter(item => 
    (item.totalAmount ?? 0) < 500
  ).sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));

  // Critical items (Out of Stock)
  const criticalItems = stockItems.filter(item => 
    item.status === 'Out of Stock' || item.totalQuantity === 0
  );

  // Critical money items (funds with < 500 LKR - critically low)
  const criticalMoneyItems = moneyItems.filter(item => 
    (item.totalAmount ?? 0) < 500
  );

  // Get unique categories from stock items
  const categories = ['all', ...new Set(stockItems.map(item => item.category).filter(Boolean))];
  const moneyCategories = ['all', ...new Set(moneyItems.map(item => item.category).filter(Boolean))];

  // Handle stock item donation click
  const handleDonateClick = (item) => {
    setSelectedItem(item);
    setShowDonationForm(true);
  };

  // Handle money fund donation click - opens Stripe payment form
  const handleMoneyDonateClick = (fund) => {
    setSelectedFund(fund);
    setShowMoneyDonationForm(true);
  };

  // Handle Donate Now button click - opens DonationFlow for new donation
  const handleDonateNowClick = () => {
    setShowDonationFlow(true);
  };

  const handleCloseForm = () => {
    setShowDonationForm(false);
    setSelectedItem(null);
    fetchInventory();
  };

  const handleCloseMoneyForm = () => {
    setShowMoneyDonationForm(false);
    setSelectedFund(null);
    fetchInventory();
  };

  const handleCloseDonationFlow = () => {
    setShowDonationFlow(false);
    fetchInventory();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'Low Stock': return 'bg-amber-500/20 text-amber-600 border-amber-500/30 animate-pulse';
      case 'Out of Stock': return 'bg-red-500/20 text-red-600 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-600';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Food': return <Package className="w-5 h-5 text-amber-500" />;
      case 'Sanitory': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'Cloth': return <Tent className="w-5 h-5 text-emerald-500" />;
      default: return <Briefcase className="w-5 h-5 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="page-shell resource-shell resource-shell--center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell resource-shell resource-shell--center">
        <div className="text-center page-card resource-card">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchInventory}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell resource-shell resource-shell--public">
      <div className="container container--wide resource-shell__inner">
        <section className="page-card resource-hero">
          <div className="resource-hero__halo" aria-hidden="true" />
          <div className="resource-hero__content">
            <span className="section-label">Relief Supplies</span>
            <h1 className="page-title">Disaster Relief Resources</h1>
            <p className="page-subtitle">
              Support communities in need by donating essential supplies or funds. Your contribution directly helps
              disaster-affected families receive critical aid.
            </p>
            <div className="resource-hero__actions">
              <button type="button" onClick={handleDonateNowClick} className="btn-primary">
                <PlusCircle className="w-5 h-5" />
                Donate Now
              </button>
              <button type="button" className="btn-secondary">
                Learn More
              </button>
            </div>
          </div>
        </section>
        {/* Critical Alerts Banner - Combined Stock and Money */}
        {(criticalItems.length > 0 || criticalMoneyItems.length > 0) && (
          <div className="page-card resource-alert">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-700 text-lg">CRITICAL SHORTAGE ALERT</h3>
                <p className="text-red-600 text-sm mb-3">
                  {criticalItems.length + criticalMoneyItems.length} item(s) require immediate donation:
                </p>
                <div className="flex flex-wrap gap-2">
                  {criticalItems.slice(0, 3).map(item => (
                    <span key={item._id} className="px-3 py-1 bg-red-500/20 text-red-700 rounded-full text-sm">
                      {item.name} (Stock)
                    </span>
                  ))}
                  {criticalMoneyItems.slice(0, 3).map(item => (
                    <span key={item._id} className="px-3 py-1 bg-red-500/20 text-red-700 rounded-full text-sm">
                      {item.name} (Funds - LKR {(item.totalAmount || 0).toLocaleString()})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Urgent Needs - Low Stock Items & Low Monetary Funds */}
        {(lowStockItems.length > 0 || lowMoneyItems.length > 0) && (
          <section className="page-card resource-panel">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Urgent Needs - Low Stock & Low Funds
                </h2>
                <p className="text-blue-600 text-sm mt-1">These items and funds are running low and need immediate replenishment</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Low Stock Items */}
              {lowStockItems.slice(0, 4).map((item) => (
                <div key={item._id} className="bg-gradient-to-r from-amber-50 to-white rounded-xl border border-amber-200 p-5 hover:shadow-lg hover:border-amber-300 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-amber-900">{item.name}</h3>
                        <p className="text-xs text-amber-600">{item.category}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)} border`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-amber-600">Remaining Stock</span>
                      <span className="text-amber-700 font-medium">{item.totalQuantity} {item.unit}</span>
                    </div>
                    <div className="w-full bg-amber-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                        style={{ width: `${Math.min(100, (item.totalQuantity / 100) * 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDonateClick(item)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    Donate to Replenish
                  </button>
                </div>
              ))}
              
              {/* Low Monetary Funds - Showing funds with < 500 LKR */}
              {lowMoneyItems.slice(0, 4).map((item) => (
                <div key={item._id} className="bg-gradient-to-r from-red-50 to-white rounded-xl border border-red-200 p-5 hover:shadow-lg hover:border-red-300 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <DollarSign className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-900">{item.name}</h3>
                        <p className="text-xs text-red-600">{item.category || 'General Fund'}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-700 border border-red-500/30 animate-pulse">
                      &lt;500 LKR
                    </span>
                  </div>
                  
                  <p className="text-2xl font-bold text-red-700 mb-3">
                    LKR {(item.totalAmount || 0).toLocaleString()}
                  </p>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-600">Funds Remaining</span>
                      <span className="text-red-700 font-medium">{(item.totalAmount || 0) < 500 ? 'Critical' : 'Low'}</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-red-500 to-amber-500"
                        style={{ width: `${Math.min(100, ((item.totalAmount || 0) / 500) * 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleMoneyDonateClick(item)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Donate Funds
                  </button>
                </div>
              ))}
            </div>
            
            {/* Show more indicator if there are more items */}
            {(lowStockItems.length > 4 || lowMoneyItems.length > 4) && (
              <div className="text-center mt-4">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  + {Math.max(0, lowStockItems.length - 4) + Math.max(0, lowMoneyItems.length - 4)} more urgent needs
                </button>
              </div>
            )}
          </section>
        )}

        {/* Combined Card: Monetary Funds & Available Supplies */}
        <section className="page-card resource-panel resource-panel--tabs">
          {/* Toggle Header */}
          <div className="resource-panel__tabs">
            <button
              onClick={() => setExpandedSection('money')}
              className={`resource-panel__tab ${expandedSection === 'money' ? 'resource-panel__tab--active' : ''}`}
            >
              <DollarSign className="w-5 h-5" />
              Monetary Funds (LKR)
              {expandedSection === 'money' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setExpandedSection('supplies')}
              className={`resource-panel__tab ${expandedSection === 'supplies' ? 'resource-panel__tab--active' : ''}`}
            >
              <Package className="w-5 h-5" />
              All Available Supplies
              {expandedSection === 'supplies' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Monetary Funds Section */}
          {expandedSection === 'money' && (
            <div className="p-6">
              {/* Search by Name only for Money */}
              <div className="resource-search">
                <div className="resource-search__field">
                  <Search className="resource-search__icon" />
                  <input
                    type="text"
                    placeholder="Search funds by name..."
                    value={searchMoneyTerm}
                    onChange={(e) => setSearchMoneyTerm(e.target.value)}
                    className="resource-search__input"
                  />
                </div>
                <div className="resource-search__select">
                  <Filter className="resource-search__icon" />
                  <select
                    value={moneyCategoryFilter}
                    onChange={(e) => setMoneyCategoryFilter(e.target.value)}
                    className="resource-search__select-input"
                  >
                    <option value="all">All Categories</option>
                    {moneyCategories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredMoneyItems.length === 0 ? (
                <div className="text-center py-12 bg-blue-50/50 rounded-xl border border-blue-200">
                  <DollarSign className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-blue-600">No monetary funds found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMoneyItems.map((item) => (
                    <div key={item._id} className={`bg-gradient-to-br from-blue-50 to-white rounded-xl border p-5 hover:shadow-lg transition-all ${
                      item.totalAmount < 500 ? 'border-red-300 bg-red-50/30' : 'border-blue-200'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            item.totalAmount < 500 ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            <DollarSign className={`w-5 h-5 ${
                              item.totalAmount < 500 ? 'text-red-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-900">{item.name}</h3>
                            <p className="text-xs text-blue-500 font-mono">{item.inventoryCode}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.totalAmount < 500 
                            ? 'bg-red-500/20 text-red-700 border-red-500/30 animate-pulse' 
                            : getStatusColor(item.status)
                        } border`}>
                          {item.totalAmount < 500 ? 'Low Funds (<500 LKR)' : item.status}
                        </span>
                      </div>
                      
                      <p className={`text-2xl font-bold mb-3 ${
                        item.totalAmount < 500 ? 'text-red-700' : 'text-blue-700'
                      }`}>
                        LKR {(item.totalAmount || 0).toLocaleString()}
                      </p>
                      
                      {item.totalAmount < 500 && (
                        <div className="mb-3">
                          <div className="w-full bg-red-100 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full bg-red-500"
                              style={{ width: `${Math.min(100, ((item.totalAmount || 0) / 500) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleMoneyDonateClick(item)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <Heart className="w-4 h-4" />
                        Donate Funds
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Available Supplies Section */}
          {expandedSection === 'supplies' && (
            <div className="p-6">
              {/* Search and Filter for Supplies */}
              <div className="resource-search">
                <div className="resource-search__field">
                  <Search className="resource-search__icon" />
                  <input
                    type="text"
                    placeholder="Search supplies by name, category, or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="resource-search__input"
                  />
                </div>
                <div className="resource-search__select">
                  <Filter className="resource-search__icon" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="resource-search__select-input"
                  >
                    <option value="all">All Categories</option>
                    {categories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-blue-50/50 rounded-xl border border-blue-200">
                  <Package className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-blue-600">No supplies found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <div key={item._id} className="bg-white rounded-xl border border-blue-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">{item.name}</h3>
                            <p className="text-xs text-blue-500 font-mono">{item.inventoryCode}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)} border`}>
                          {item.status}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-blue-500">Available Stock</span>
                          <span className="text-blue-900 font-medium">{item.totalQuantity} {item.unit}</span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              item.status === 'Available' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                              item.status === 'Low Stock' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                              'bg-gradient-to-r from-red-500 to-red-600'
                            }`}
                            style={{ width: `${Math.min(100, (item.totalQuantity / 100) * 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDonateClick(item)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <Gift className="w-4 h-4" />
                        Donate Supplies
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Statistics Section - Moved to End of Page */}
        <section className="page-card resource-panel">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-blue-600 text-sm">Stock Items</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stockItems.length}</p>
            </div>
            
            <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-blue-600 text-sm">Total Funds (LKR)</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                LKR {moneyItems.reduce((sum, i) => sum + (i.totalAmount || 0), 0).toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-blue-600 text-sm">Low Stock Items</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">{lowStockItems.length}</p>
            </div>
            
            <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-blue-600 text-sm">Low Funds (&lt;500 LKR)</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{lowMoneyItems.length}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Stock Donation Form Modal */}
      {showDonationForm && (
        <DonationForm
          initialItem={selectedItem}
          onClose={handleCloseForm}
        />
      )}

      {/* Money Donation Form Modal with Stripe */}
      {showMoneyDonationForm && (
        <MoneyDonationForm
          initialFund={selectedFund}
          onClose={handleCloseMoneyForm}
          onSuccess={handleCloseMoneyForm}
        />
      )}

      {/* Donation Flow Modal - Opens when clicking "Donate Now" button */}
      {showDonationFlow && (
        <DonationFlow
          onClose={handleCloseDonationFlow}
        />
      )}

    </div>
  );
};

export default ResourcePage;