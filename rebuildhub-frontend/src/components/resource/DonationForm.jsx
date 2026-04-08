import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CreditCard, Package, AlertCircle, User, Mail, DollarSign, Heart, Shield, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';

const DonationForm = ({ initialItem, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    donorName: '',
    donorNIC: '',
    email: '',
    type: initialItem?.type === 'MONEY' ? 'MONEY' : 'STOCK',
    inventoryId: initialItem?._id || '',
    name: initialItem?.name || '',
    description: '',
    quantity: 1,
    unit: initialItem?.unit || '',
    amount: 0,
    paymentStatus: 'PENDING'
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(initialItem || null);
  const [inventoryList, setInventoryList] = useState([]);
  const [moneyInventoryList, setMoneyInventoryList] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [donationResult, setDonationResult] = useState(null);
  const [isLowStock, setIsLowStock] = useState(false);
  const [selectedMoneyFund, setSelectedMoneyFund] = useState(initialItem || null);

  // Fetch inventory for stock selection if no initialItem
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5000/Rebuildhub/inventory');
      const data = await response.json();
      
      // Filter STOCK items and sort: low stock first
      const stockItems = data.filter(item => item.type === 'STOCK');
      const sortedStockItems = stockItems.sort((a, b) => {
        const aIsLow = a.status === 'Low Stock' || a.status === 'Out of Stock' || a.totalQuantity < 10;
        const bIsLow = b.status === 'Low Stock' || b.status === 'Out of Stock' || b.totalQuantity < 10;
        if (aIsLow && !bIsLow) return -1;
        if (!aIsLow && bIsLow) return 1;
        return a.name.localeCompare(b.name);
      });
      setInventoryList(sortedStockItems);
      
      // Filter MONEY items
      const moneyItems = data.filter(item => item.type === 'MONEY');
      setMoneyInventoryList(moneyItems);
      
      // If initialItem is provided, set it
      if (initialItem) {
        if (initialItem.type === 'STOCK') {
          setSelectedInventory(initialItem);
          setIsLowStock(initialItem.status === 'Low Stock' || initialItem.status === 'Out of Stock' || initialItem.totalQuantity < 10);
        } else {
          setSelectedMoneyFund(initialItem);
        }
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/resources');
    }
  };

  // NIC Validation (Sri Lankan NIC format)
  const validateNIC = (nic) => {
    if (!nic || nic.trim() === '') return false;
    const oldNicPattern = /^[0-9]{9}[VvXx]$/;
    const newNicPattern = /^[0-9]{12}$/;
    return oldNicPattern.test(nic) || newNicPattern.test(nic);
  };

  // Email validation
  const validateEmail = (email) => {
    if (!email) return true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  // Validate quantity (no decimals, no zero, positive integer only)
  const validateQuantity = (quantity) => {
    if (!quantity && quantity !== 0) return 'Quantity is required';
    const num = Number(quantity);
    if (isNaN(num)) return 'Please enter a valid number';
    if (!Number.isInteger(num)) return 'Quantity must be a whole number (no decimals)';
    if (num <= 0) return 'Quantity must be greater than 0';
    return null;
  };

  // Real-time validation functions
  const validateDonorName = (name) => {
    if (!name || name.trim() === '') return 'Donor name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > 100) return 'Name must be less than 100 characters';
    return null;
  };

  const validateDonorNIC = (nic) => {
    if (!nic || nic.trim() === '') return 'NIC is required';
    if (!validateNIC(nic.trim())) return 'Please enter a valid Sri Lankan NIC (e.g., 123456789V or 123456789012)';
    return null;
  };

  const validateEmailField = (email) => {
    if (email && !validateEmail(email)) return 'Please enter a valid email address (e.g., name@example.com)';
    return null;
  };

  const validateInventoryId = (id) => {
    if (!id && !initialItem && formData.type === 'STOCK') return 'Please select an item to donate';
    return null;
  };

  const validateMoneyFundId = (id) => {
    if (!id && !initialItem && formData.type === 'MONEY') return 'Please select a fund to donate to';
    return null;
  };

  const validateAmount = (amount) => {
    if (!amount || amount <= 0) return 'Please enter a valid amount (greater than 0)';
    if (amount < 100) return 'Minimum donation amount is LKR 100';
    if (amount > 10000000) return 'Maximum donation amount is LKR 10,000,000';
    return null;
  };

  const handleFieldBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    let error = null;
    switch (fieldName) {
      case 'donorName':
        error = validateDonorName(formData.donorName);
        break;
      case 'donorNIC':
        error = validateDonorNIC(formData.donorNIC);
        break;
      case 'email':
        error = validateEmailField(formData.email);
        break;
      case 'inventoryId':
        error = validateInventoryId(formData.inventoryId);
        break;
      case 'moneyFundId':
        error = validateMoneyFundId(formData.inventoryId);
        break;
      case 'quantity':
        error = validateQuantity(formData.quantity);
        break;
      case 'amount':
        error = validateAmount(formData.amount);
        break;
    }
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'quantity') {
      if (value === '') {
        setFormData(prev => ({ ...prev, quantity: '' }));
        if (touched.quantity) {
          const error = validateQuantity('');
          setErrors(prev => ({ ...prev, quantity: error }));
        }
        return;
      }
      
      const intValue = parseInt(value, 10);
      if (!isNaN(intValue)) {
        setFormData(prev => ({ ...prev, quantity: intValue }));
        if (touched.quantity) {
          const error = validateQuantity(intValue);
          setErrors(prev => ({ ...prev, quantity: error }));
        }
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
    
    if (touched[name]) {
      let error = null;
      switch (name) {
        case 'donorName':
          error = validateDonorName(value);
          break;
        case 'donorNIC':
          error = validateDonorNIC(value);
          break;
        case 'email':
          error = validateEmailField(value);
          break;
        case 'quantity':
          error = validateQuantity(value);
          break;
        case 'amount':
          error = validateAmount(value);
          break;
      }
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleInventorySelect = (e) => {
    const itemId = e.target.value;
    const item = inventoryList.find(i => i._id === itemId);
    setSelectedInventory(item);
    setIsLowStock(item?.status === 'Low Stock' || item?.status === 'Out of Stock' || item?.totalQuantity < 10);
    setFormData(prev => ({
      ...prev,
      inventoryId: itemId,
      name: item?.name || '',
      unit: item?.unit || '',
      quantity: 1
    }));
    
    setTouched(prev => ({ ...prev, inventoryId: true, quantity: true }));
    setErrors(prev => ({ 
      ...prev, 
      inventoryId: validateInventoryId(itemId),
      quantity: validateQuantity(1)
    }));
  };

  const handleMoneyFundSelect = (e) => {
    const fundId = e.target.value;
    const fund = moneyInventoryList.find(f => f._id === fundId);
    setSelectedMoneyFund(fund);
    setFormData(prev => ({
      ...prev,
      inventoryId: fundId,
      name: fund?.name || ''
    }));
    
    setTouched(prev => ({ ...prev, moneyFundId: true }));
    setErrors(prev => ({ 
      ...prev, 
      moneyFundId: validateMoneyFundId(fundId)
    }));
  };

  const validateForm = () => {
    const allTouched = {
      donorName: true,
      donorNIC: true,
      email: true,
      ...(formData.type === 'STOCK' ? { inventoryId: true, quantity: true } : {}),
      ...(formData.type === 'MONEY' ? { moneyFundId: true, amount: true } : {})
    };
    setTouched(allTouched);
    
    const newErrors = {};
    
    const nameError = validateDonorName(formData.donorName);
    if (nameError) newErrors.donorName = nameError;
    
    const nicError = validateDonorNIC(formData.donorNIC);
    if (nicError) newErrors.donorNIC = nicError;
    
    const emailError = validateEmailField(formData.email);
    if (emailError) newErrors.email = emailError;
    
    if (formData.type === 'STOCK') {
      if (!initialItem) {
        const inventoryError = validateInventoryId(formData.inventoryId);
        if (inventoryError) newErrors.inventoryId = inventoryError;
      }
      const quantityError = validateQuantity(formData.quantity);
      if (quantityError) newErrors.quantity = quantityError;
    } 
    else if (formData.type === 'MONEY') {
      if (!initialItem) {
        const fundError = validateMoneyFundId(formData.inventoryId);
        if (fundError) newErrors.moneyFundId = fundError;
      }
      const amountError = validateAmount(formData.amount);
      if (amountError) newErrors.amount = amountError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        donorName: formData.donorName.trim(),
        donorNIC: formData.donorNIC.trim(),
        email: formData.email?.trim() || '',
        type: formData.type,
        inventoryId: formData.inventoryId,
        name: formData.type === 'STOCK' ? (selectedInventory?.name || initialItem?.name) : (selectedMoneyFund?.name || initialItem?.name),
        description: formData.description?.trim() || '',
        paymentStatus: 'PENDING'
      };

      if (formData.type === 'STOCK') {
        submitData.quantity = parseInt(formData.quantity);
        submitData.unit = selectedInventory?.unit || initialItem?.unit;
      } else {
        submitData.amount = parseFloat(formData.amount);
      }

      console.log('Submitting donation:', submitData);

      const response = await fetch('http://localhost:5000/Rebuildhub/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Donation failed');
      }

      const result = await response.json();
      console.log('Donation successful:', result);
      setDonationResult(result);
      setSubmitSuccess(true);
      
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          navigate('/resources');
        }
      }, 2500);
      
    } catch (error) {
      console.error('Donation submission error:', error);
      setErrors({ submit: error.message || 'Failed to submit donation. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-blue-900 bg-opacity-75" onClick={handleClose}></div>
          <div className="relative bg-white rounded-2xl p-8 text-center max-w-md shadow-xl border border-blue-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Thank You!</h3>
            <p className="text-blue-600 mb-4">
              Your donation has been received successfully. Your contribution will help save lives and support disaster-affected communities.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md"
            >
              Return to Resources
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-blue-900 bg-opacity-50 backdrop-blur-sm" onClick={handleClose}></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-blue-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Make a Donation
                </h3>
              </div>
              <button 
                onClick={handleClose} 
                className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {initialItem && (
              <div className={`mt-2 p-2 rounded-lg ${isLowStock ? 'bg-amber-500/20' : 'bg-white/10'}`}>
                <p className="text-white text-sm">
                  Supporting: {initialItem.name}
                  {isLowStock && (
                    <span className="ml-2 inline-flex items-center gap-1 text-amber-200">
                      <TrendingDown className="w-3 h-3" />
                      Low Stock - Urgent Need
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Donor Information */}
              <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Donor Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <input
                        type="text"
                        name="donorName"
                        value={formData.donorName}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur('donorName')}
                        className={`w-full pl-10 pr-3 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-blue-900 ${
                          errors.donorName && touched.donorName ? 'border-red-500' : 'border-blue-200'
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.donorName && touched.donorName && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.donorName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      NIC Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="donorNIC"
                      value={formData.donorNIC}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur('donorNIC')}
                      className={`w-full px-3 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-blue-900 ${
                        errors.donorNIC && touched.donorNIC ? 'border-red-500' : 'border-blue-200'
                      }`}
                      placeholder="e.g., 123456789V or 123456789012"
                    />
                    {errors.donorNIC && touched.donorNIC && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.donorNIC}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Email <span className="text-blue-400 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur('email')}
                        className={`w-full pl-10 pr-3 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-blue-900 ${
                          errors.email && touched.email ? 'border-red-500' : 'border-blue-200'
                        }`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.email && touched.email && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock Donation Fields */}
              {formData.type === 'STOCK' && (
                <>
                  {!initialItem && inventoryList.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">
                        Select Item to Donate <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.inventoryId}
                        onChange={handleInventorySelect}
                        className={`w-full px-3 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-blue-900 ${
                          errors.inventoryId && touched.inventoryId ? 'border-red-500' : 'border-blue-200'
                        }`}
                      >
                        <option value="">-- Select an item --</option>
                        {inventoryList.map(item => {
                          const isLow = item.status === 'Low Stock' || item.status === 'Out of Stock' || item.totalQuantity < 10;
                          return (
                            <option key={item._id} value={item._id} className={isLow ? 'text-amber-600' : ''}>
                              {item.name} - Available: {item.totalQuantity} {item.unit}
                              {isLow ? ' ⚠️ LOW STOCK' : ''}
                            </option>
                          );
                        })}
                      </select>
                      {errors.inventoryId && touched.inventoryId && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {errors.inventoryId}
                        </p>
                      )}
                      {selectedInventory && (
                        <p className="mt-1 text-xs text-blue-500">
                          Current available stock: {selectedInventory.totalQuantity} {selectedInventory.unit}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Quantity to Donate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur('quantity')}
                      min="1"
                      step="1"
                      className={`w-full px-3 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-blue-900 ${
                        errors.quantity && touched.quantity ? 'border-red-500' : 'border-blue-200'
                      }`}
                      placeholder="Enter quantity (whole numbers only)"
                    />
                    {errors.quantity && touched.quantity && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.quantity}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Money Donation Fields */}
              {formData.type === 'MONEY' && (
                <>
                  {!initialItem && moneyInventoryList.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">
                        Select Fund to Donate <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.inventoryId}
                        onChange={handleMoneyFundSelect}
                        className={`w-full px-3 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-blue-900 ${
                          errors.moneyFundId && touched.moneyFundId ? 'border-red-500' : 'border-blue-200'
                        }`}
                      >
                        <option value="">-- Select a fund --</option>
                        {moneyInventoryList.map(fund => (
                          <option key={fund._id} value={fund._id}>
                            {fund.name} - Current Balance: LKR {(fund.totalAmount || 0).toLocaleString()}
                          </option>
                        ))}
                      </select>
                      {errors.moneyFundId && touched.moneyFundId && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {errors.moneyFundId}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">
                      Amount (LKR) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur('amount')}
                        min="100"
                        step="100"
                        className={`w-full pl-10 pr-3 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-blue-900 ${
                          errors.amount && touched.amount ? 'border-red-500' : 'border-blue-200'
                        }`}
                        placeholder="Minimum LKR 100"
                      />
                    </div>
                    {errors.amount && touched.amount && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.amount}
                      </p>
                    )}
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, amount: 1000 }));
                          setTouched(prev => ({ ...prev, amount: true }));
                          setErrors(prev => ({ ...prev, amount: validateAmount(1000) }));
                        }}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        LKR 1,000
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, amount: 5000 }));
                          setTouched(prev => ({ ...prev, amount: true }));
                          setErrors(prev => ({ ...prev, amount: validateAmount(5000) }));
                        }}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        LKR 5,000
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, amount: 10000 }));
                          setTouched(prev => ({ ...prev, amount: true }));
                          setErrors(prev => ({ ...prev, amount: validateAmount(10000) }));
                        }}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        LKR 10,000
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  maxLength="500"
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-blue-900"
                  placeholder="Any special instructions or notes..."
                />
              </div>

              {/* Summary Card */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 rounded-xl p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Donation Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Donor:</span>
                    <span className="text-blue-900 font-medium">{formData.donorName || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">NIC:</span>
                    <span className="text-blue-900 font-medium">{formData.donorNIC || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Type:</span>
                    <span className="text-blue-900 font-medium">{formData.type === 'STOCK' ? 'Physical Items' : 'Monetary'}</span>
                  </div>
                  {formData.type === 'STOCK' && selectedInventory && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Item:</span>
                        <span className="text-blue-900 font-medium">{selectedInventory.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Quantity:</span>
                        <span className="text-blue-900 font-medium">{formData.quantity} {selectedInventory.unit}</span>
                      </div>
                    </>
                  )}
                  {formData.type === 'MONEY' && (selectedMoneyFund || initialItem) && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Fund:</span>
                        <span className="text-blue-900 font-medium">{selectedMoneyFund?.name || initialItem?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Amount:</span>
                        <span className="text-blue-900 font-medium">LKR {formData.amount.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2 font-medium"
              >
                {formData.type === 'MONEY' && <CreditCard className="h-4 w-4" />}
                {formData.type === 'STOCK' && <Package className="h-4 w-4" />}
                <Heart className="h-4 w-4" />
                {isSubmitting ? 'Processing...' : 'Complete Donation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonationForm;