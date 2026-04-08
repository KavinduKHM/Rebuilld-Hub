import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Package, Heart, 
  Search, Filter, TrendingDown,
  Droplets, Tent, Briefcase, DollarSign,
  Gift, Shield, BarChart3, Users, Clock,
  ChevronDown, ChevronUp, X, PlusCircle
} from 'lucide-react';
import DonationForm from '../../components/resource/DonationForm';
import MoneyDonationForm from '../../components/resource/MoneyDonationForm';
import DonationFlow from '../../components/resource/DonationFlow'; // This is actually DonationFlow

const ResourcePage = () => {
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

  // Fetch inventory from database
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/Rebuildhub/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      const data = await response.json();
      console.log('Fetched inventory:', data);
      setInventoryItems(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to load inventory. Please check if backend is running.');
    } finally {
      setLoading(false);
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

  // Low monetary funds - funds with < 2000 LKR
  const lowMoneyItems = [...moneyItems].filter(item => 
    (item.totalAmount && item.totalAmount < 2000) || 
    item.status === 'Low Stock' || 
    item.status === 'Out of Stock'
  ).sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));

  // Critical items (Out of Stock)
  const criticalItems = stockItems.filter(item => 
    item.status === 'Out of Stock' || item.totalQuantity === 0
  );

  // Critical money items (funds with < 500 LKR - critically low)
  const criticalMoneyItems = moneyItems.filter(item => 
    item.status === 'Out of Stock' || (item.totalAmount && item.totalAmount < 500)
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
      <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center">
        <div className="text-center bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchInventory}
            className="mt-4 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4ff]">
      {/* Hero Section with Blue Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100/30 to-white">
        {/* Animated gradient blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-950 to-blue-600 bg-clip-text text-transparent">
              Disaster Relief Resources
            </h1>
            <p className="text-blue-600 max-w-2xl mx-auto text-lg">
              Support communities in need by donating essential supplies or funds. Your contribution directly helps 
              disaster-affected families receive critical aid.
            </p>
            <div className="flex gap-4 justify-center mt-8">
              <button 
                onClick={handleDonateNowClick}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Donate Now
              </button>
              <button className="px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold border border-blue-200 hover:bg-blue-50 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Critical Alerts Banner - Combined Stock and Money */}
        {(criticalItems.length > 0 || criticalMoneyItems.length > 0) && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-5 animate-pulse">
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
          <div className="mb-8">
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
              
              {/* Low Monetary Funds - Showing funds with < 2000 LKR */}
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
                      &lt;2000 LKR
                    </span>
                  </div>
                  
                  <p className="text-2xl font-bold text-red-700 mb-3">
                    LKR {(item.totalAmount || 0).toLocaleString()}
                  </p>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-600">Funds Remaining</span>
                      <span className="text-red-700 font-medium">{(item.totalAmount || 0) < 2000 ? 'Critical' : 'Low'}</span>
                    </div>
                    <div className="w-full bg-red-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-red-500 to-amber-500"
                        style={{ width: `${Math.min(100, ((item.totalAmount || 0) / 2000) * 100)}%` }}
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
          </div>
        )}

        {/* Combined Card: Monetary Funds & Available Supplies */}
        <div className="bg-white rounded-2xl border border-blue-200 shadow-xl shadow-blue-200/40 overflow-hidden mb-8">
          {/* Toggle Header */}
          <div className="flex border-b border-blue-200 bg-blue-50/50">
            <button
              onClick={() => setExpandedSection('money')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all flex items-center justify-center gap-2 ${
                expandedSection === 'money' 
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-white' 
                  : 'text-blue-500 hover:text-blue-700'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              Monetary Funds (LKR)
              {expandedSection === 'money' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setExpandedSection('supplies')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all flex items-center justify-center gap-2 ${
                expandedSection === 'supplies' 
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-white' 
                  : 'text-blue-500 hover:text-blue-700'
              }`}
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
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search funds by name..."
                    value={searchMoneyTerm}
                    onChange={(e) => setSearchMoneyTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <select
                    value={moneyCategoryFilter}
                    onChange={(e) => setMoneyCategoryFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      item.totalAmount < 2000 ? 'border-red-300 bg-red-50/30' : 'border-blue-200'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            item.totalAmount < 2000 ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            <DollarSign className={`w-5 h-5 ${
                              item.totalAmount < 2000 ? 'text-red-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-900">{item.name}</h3>
                            <p className="text-xs text-blue-500 font-mono">{item.inventoryCode}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.totalAmount < 2000 
                            ? 'bg-red-500/20 text-red-700 border-red-500/30 animate-pulse' 
                            : getStatusColor(item.status)
                        } border`}>
                          {item.totalAmount < 2000 ? 'Low Funds (<2000 LKR)' : item.status}
                        </span>
                      </div>
                      
                      <p className={`text-2xl font-bold mb-3 ${
                        item.totalAmount < 2000 ? 'text-red-700' : 'text-blue-700'
                      }`}>
                        LKR {(item.totalAmount || 0).toLocaleString()}
                      </p>
                      
                      {item.totalAmount < 2000 && (
                        <div className="mb-3">
                          <div className="w-full bg-red-100 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full bg-red-500"
                              style={{ width: `${Math.min(100, ((item.totalAmount || 0) / 2000) * 100)}%` }}
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
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search supplies by name, category, or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        </div>

        {/* Statistics Section - Moved to End of Page */}
        <div className="mt-12 pt-8 border-t border-blue-200">
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
                <p className="text-blue-600 text-sm">Low Funds (&lt;2000 LKR)</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{lowMoneyItems.length}</p>
            </div>
          </div>
        </div>
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

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ResourcePage;