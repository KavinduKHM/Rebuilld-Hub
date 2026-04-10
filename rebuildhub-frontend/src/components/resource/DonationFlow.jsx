import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Package, DollarSign, Heart, Shield, 
  AlertTriangle, User, Mail, CheckCircle, 
  Lock, Building, Loader2, Globe, CreditCard
} from 'lucide-react';

const DonationFlow = ({ onClose }) => {
  const MIN_DONATION_AMOUNT = 200;
  const DONATION_STEP = 50;
  const USD_MIN_DONATION_AMOUNT = 5;
  const USD_DONATION_STEP = 10;

  const navigate = useNavigate();
  const [step, setStep] = useState('select');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [donationResult, setDonationResult] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Stock form state
  const [stockForm, setStockForm] = useState({
    donorName: '',
    donorNIC: '',
    email: '',
    inventoryId: '',
    name: '',
    description: '',
    quantity: 1,
    unit: '',
    category: '',
    isInternational: false,
  });
  
  // Money form state
  const [moneyForm, setMoneyForm] = useState({
    donorName: '',
    donorNIC: '',
    email: '',
    inventoryId: '',
    fundName: '',
    description: '',
    amount: '',
    isInternational: false,
    currency: 'LKR',
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [inventoryList, setInventoryList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [itemsByCategory, setItemsByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [availableFunds, setAvailableFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);

  // Exchange rates
  const exchangeRates = { LKR: 1, USD: 0.0033, EUR: 0.0031, GBP: 0.0026, JPY: 0.50, AUD: 0.0050, CAD: 0.0045 };
  
  const currencies = [
    { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', flag: '🇱🇰', minAmount: 100 },
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', minAmount: 5 },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', minAmount: 5 },
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', minAmount: 5 },
  ];

  const getAmountRules = (isInternational, currency) => {
    if (isInternational && currency === 'USD') {
      return { minAmount: USD_MIN_DONATION_AMOUNT, stepAmount: USD_DONATION_STEP };
    }

    return { minAmount: MIN_DONATION_AMOUNT, stepAmount: DONATION_STEP };
  };

  // Check for payment return parameters - runs when component mounts and when URL changes
  useEffect(() => {
    const checkPaymentStatus = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const sessionId = urlParams.get('session_id');
      const donationId = urlParams.get('donation_id');
      
      console.log("=== PAYMENT RETURN CHECK ===");
      console.log("Payment status:", paymentStatus);
      console.log("Session ID:", sessionId);
      console.log("Donation ID:", donationId);
      
      if (paymentStatus === 'success' && sessionId && !isVerifying) {
        verifyPayment(sessionId, donationId);
      }
    };
    
    checkPaymentStatus();
  }, []);

  const verifyPayment = async (sessionId, donationId) => {
    if (isVerifying) return;
    setIsVerifying(true);
    
    try {
      console.log("Verifying payment with session:", sessionId);
      
      const response = await fetch(`http://localhost:5000/Rebuildhub/donations/verify-payment?session_id=${sessionId}&donation_id=${donationId}`);
      const result = await response.json();
      
      console.log("Verification result:", result);
      
      if (result.success) {
        setSubmitSuccess(true);
        setDonationResult(result.donation);
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        // Auto close after 3 seconds
        setTimeout(() => {
          if (onClose) onClose();
          else navigate('/resources');
        }, 3000);
      } else {
        setPaymentError(result.message || 'Payment verification failed');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setPaymentError('Failed to verify payment. Please contact support.');
      window.history.replaceState({}, document.title, window.location.pathname);
    } finally {
      setIsVerifying(false);
    }
  };

  // Fetch inventory data
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5000/Rebuildhub/inventory');
      const data = await response.json();
      setInventoryList(data);
      
      const stockItems = data.filter(item => item.type === 'STOCK');
      const uniqueCategories = [...new Set(stockItems.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      const grouped = {};
      uniqueCategories.forEach(cat => {
        grouped[cat] = stockItems.filter(item => item.category === cat);
      });
      setItemsByCategory(grouped);
      
      const moneyItems = data.filter(item => item.type === 'MONEY');
      setAvailableFunds(moneyItems);
      
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
    else navigate('/resources');
  };

  // Validation functions
  const validateDonorName = (name) => {
    if (!name?.trim()) return 'Donor name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return null;
  };

  const validateNIC = (nic, isInternational) => {
    if (isInternational) {
      if (!nic?.trim()) return 'ID number is required for international donors';
      return null;
    }
    if (!nic?.trim()) return 'NIC is required';
    const oldPattern = /^[0-9]{9}[VvXx]$/;
    const newPattern = /^[0-9]{12}$/;
    if (!oldPattern.test(nic) && !newPattern.test(nic)) {
      return 'Please enter a valid Sri Lankan NIC (e.g., 123456789V)';
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return true;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  const getEmailError = (email) => {
    if (!email) return '';
    return validateEmail(email) ? '' : 'Please enter a valid email';
  };

  const validateQuantity = (quantity) => {
    const num = Number(quantity);
    if (isNaN(num) || num <= 0) return 'Quantity must be greater than 0';
    if (!Number.isInteger(num)) return 'Quantity must be a whole number';
    return null;
  };

  const validateAmount = (amount, isInternational, currency) => {
    if (!amount || amount <= 0) return 'Please enter a valid amount';
    const { minAmount, stepAmount } = getAmountRules(isInternational, currency);
    if (amount < minAmount) return `Minimum amount is ${minAmount}`;
    if (Number(amount) % stepAmount !== 0) return `Amount should increase by ${stepAmount}`;
    return null;
  };

  const handleFieldBlur = (formType, fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    let error = null;
    if (formType === 'stock') {
      switch (fieldName) {
        case 'donorName': error = validateDonorName(stockForm.donorName); break;
        case 'donorNIC': error = validateNIC(stockForm.donorNIC, stockForm.isInternational); break;
        case 'email': error = getEmailError(stockForm.email); break;
        case 'quantity': error = validateQuantity(stockForm.quantity); break;
        default: error = null;
      }
    } else {
      switch (fieldName) {
        case 'donorName': error = validateDonorName(moneyForm.donorName); break;
        case 'donorNIC': error = validateNIC(moneyForm.donorNIC, moneyForm.isInternational); break;
        case 'email': error = getEmailError(moneyForm.email); break;
        case 'amount': error = validateAmount(moneyForm.amount, moneyForm.isInternational, moneyForm.currency); break;
        default: error = null;
      }
    }
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleStockChange = (e) => {
    const { name, value } = e.target;
    setStockForm(prev => ({ ...prev, [name]: value }));

    if (name === 'email') {
      setTouched(prev => ({ ...prev, email: true }));
      setErrors(prev => ({ ...prev, email: getEmailError(value) }));
      return;
    }

    if (touched[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    setMoneyForm(prev => ({ ...prev, [name]: value }));

    if (name === 'email') {
      setTouched(prev => ({ ...prev, email: true }));
      setErrors(prev => ({ ...prev, email: getEmailError(value) }));
      return;
    }

    if (touched[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleInternationalToggle = (formType, isInternational) => {
    if (formType === 'stock') {
      setStockForm(prev => ({ ...prev, isInternational, donorNIC: '' }));
    } else {
      setMoneyForm(prev => ({ ...prev, isInternational, donorNIC: '', currency: isInternational ? 'USD' : 'LKR' }));
    }
    setErrors(prev => ({ ...prev, donorNIC: '' }));
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedItem(null);
    setStockForm(prev => ({
      ...prev,
      category,
      inventoryId: '',
      name: '',
      unit: '',
      quantity: 1
    }));
  };

  const handleItemSelect = (itemId) => {
    const item = itemsByCategory[selectedCategory]?.find(i => i._id === itemId);
    setSelectedItem(item);
    setStockForm(prev => ({
      ...prev,
      inventoryId: itemId,
      name: item?.name || '',
      unit: item?.unit || '',
      quantity: 1
    }));
  };

  const handleFundSelect = (fundId) => {
    const fund = availableFunds.find(f => f._id === fundId);
    setSelectedFund(fund);
    setMoneyForm(prev => ({
      ...prev,
      inventoryId: fundId,
      fundName: fund?.name || ''
    }));
  };

  const convertToLKR = (amount, fromCurrency) => {
    if (fromCurrency === 'LKR') return amount;
    const rate = exchangeRates[fromCurrency];
    return rate ? Math.round(amount / rate) : amount;
  };

  const amountRules = getAmountRules(moneyForm.isInternational, moneyForm.currency);
  const suggestedAmounts = moneyForm.isInternational && moneyForm.currency === 'USD'
    ? [10, 20, 50, 100]
    : [200, 250, 500, 1000];

  const validateStockFormSubmit = () => {
    const newErrors = {};
    const nameError = validateDonorName(stockForm.donorName);
    if (nameError) newErrors.donorName = nameError;
    
    const nicError = validateNIC(stockForm.donorNIC, stockForm.isInternational);
    if (nicError) newErrors.donorNIC = nicError;
    
    if (stockForm.email && !validateEmail(stockForm.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!stockForm.inventoryId) newErrors.inventoryId = 'Please select an item';
    const qtyError = validateQuantity(stockForm.quantity);
    if (qtyError) newErrors.quantity = qtyError;
    if (!stockForm.unit) newErrors.unit = 'Unit is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMoneyFormSubmit = () => {
    const newErrors = {};
    const nameError = validateDonorName(moneyForm.donorName);
    if (nameError) newErrors.donorName = nameError;
    
    const nicError = validateNIC(moneyForm.donorNIC, moneyForm.isInternational);
    if (nicError) newErrors.donorNIC = nicError;
    
    if (moneyForm.email && !validateEmail(moneyForm.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!moneyForm.inventoryId) newErrors.inventoryId = 'Please select a fund';
    const amountError = validateAmount(moneyForm.amount, moneyForm.isInternational, moneyForm.currency);
    if (amountError) newErrors.amount = amountError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!validateStockFormSubmit()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        donorName: stockForm.donorName.trim(),
        donorNIC: stockForm.donorNIC.trim(),
        email: stockForm.email?.trim() || '',
        type: 'STOCK',
        inventoryId: stockForm.inventoryId,
        name: stockForm.name,
        description: stockForm.description?.trim() || '',
        quantity: parseInt(stockForm.quantity),
        unit: stockForm.unit,
      };

      console.log('Submitting stock donation:', submitData);

      const response = await fetch('http://localhost:5000/Rebuildhub/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Donation failed');
      }
      
      setSubmitSuccess(true);
      setDonationResult({ type: 'STOCK', amount: stockForm.quantity, item: stockForm.name });
      setTimeout(() => handleClose(), 2500);
    } catch (error) {
      console.error('Stock donation error:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoneySubmit = async (e) => {
    e.preventDefault();
    if (!validateMoneyFormSubmit()) return;

    setIsSubmitting(true);
    setErrors({});
    setPaymentError(null);
    
    try {
      let amountInLKR = parseFloat(moneyForm.amount);
      if (moneyForm.isInternational && moneyForm.currency !== 'LKR') {
        amountInLKR = convertToLKR(amountInLKR, moneyForm.currency);
      }
      
      const submitData = {
        donorName: moneyForm.donorName.trim(),
        donorNIC: moneyForm.donorNIC.trim(),
        email: moneyForm.email?.trim() || '',
        type: 'MONEY',
        inventoryId: moneyForm.inventoryId,
        name: selectedFund?.name || moneyForm.fundName,
        description: moneyForm.description?.trim() || '',
        amount: amountInLKR,
        isInternational: moneyForm.isInternational,
        originalCurrency: moneyForm.isInternational ? moneyForm.currency : 'LKR',
        originalAmount: moneyForm.isInternational ? parseFloat(moneyForm.amount) : null,
      };

      console.log('Sending money donation data:', submitData);

      const response = await fetch('http://localhost:5000/Rebuildhub/donations/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();
      console.log('Checkout response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create checkout session');
      }

      if (result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      console.error('Money donation error:', error);
      setErrors({ submit: error.message });
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={handleClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div className="relative bg-white rounded-2xl p-8 text-center max-w-md shadow-xl z-[101]">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-blue-900 mb-2">Thank You!</h3>
          <p className="text-blue-600 mb-2">
            Your donation has been received successfully!
          </p>
          {donationResult?.type === 'STOCK' ? (
            <p className="text-gray-500 text-sm mb-4">
              You donated {donationResult.amount} {donationResult.item ? `of ${donationResult.item}` : 'items'}.
            </p>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-2">
                Amount: LKR {donationResult?.amount?.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Your contribution will help save lives and support disaster-affected communities.
              </p>
            </>
          )}
          <button onClick={handleClose} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all">
            Close
          </button>
        </div>
      </div>
    );
  }

  // Error Screen
  if (paymentError) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={handleClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div className="relative bg-white rounded-2xl p-8 text-center max-w-md shadow-xl z-[101]">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-red-600 mb-2">Payment Error</h3>
          <p className="text-gray-600 mb-4">{paymentError}</p>
          <button onClick={handleClose} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all">
            Close
          </button>
        </div>
      </div>
    );
  }

  // Selection Screen
  if (step === 'select') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center donation-modal" onClick={handleClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div
          className="relative bg-white rounded-2xl max-w-md w-full p-6 border border-blue-200 shadow-xl z-[101] donation-modal__card donation-modal__card--select"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-blue-900">Choose Donation Type</h2>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-blue-600 mb-6 text-center">How would you like to contribute?</p>
          <div className="space-y-4">
            <button onClick={() => setStep('stock')} className="w-full p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-500 transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-xl group-hover:bg-blue-600 transition-colors">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-blue-900">Physical Items</h3>
                  <p className="text-sm text-blue-600">Donate food, clothing, sanitary items</p>
                </div>
              </div>
            </button>
            <button onClick={() => setStep('money')} className="w-full p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:border-green-500 transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-xl group-hover:bg-green-600 transition-colors">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-green-900">Monetary Donation</h3>
                  <p className="text-sm text-green-600">Support with financial contributions</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Stock Donation Form
  if (step === 'stock') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center donation-modal" onClick={handleClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div
          className="relative bg-white rounded-2xl w-full max-w-lg mx-4 border border-blue-200 shadow-xl z-[101] max-h-[90vh] overflow-y-auto donation-modal__card donation-modal__card--stock"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 rounded-t-2xl donation-modal__header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-white" />
                <h3 className="text-lg font-semibold text-white">Donate Physical Items</h3>
              </div>
              <button onClick={() => setStep('select')} className="text-white/80 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <form onSubmit={handleStockSubmit} className="px-6 py-4 donation-modal__scroll">
            <div className="space-y-4">
              <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Donor Information</h4>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-blue-800 mb-2">Donor Type</label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => handleInternationalToggle('stock', false)} className={`flex-1 py-2 px-3 rounded-lg border transition-all ${!stockForm.isInternational ? 'bg-blue-600 text-white' : 'bg-white border-blue-200 text-blue-700'}`}>Sri Lankan</button>
                    <button type="button" onClick={() => handleInternationalToggle('stock', true)} className={`flex-1 py-2 px-3 rounded-lg border transition-all ${stockForm.isInternational ? 'bg-blue-600 text-white' : 'bg-white border-blue-200 text-blue-700'}`}>International</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">Full Name *</label>
                    <input type="text" name="donorName" value={stockForm.donorName} onChange={handleStockChange} onBlur={() => handleFieldBlur('stock', 'donorName')} className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter your full name" />
                    {errors.donorName && <p className="text-red-500 text-xs mt-1">{errors.donorName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">{stockForm.isInternational ? 'ID Number *' : 'NIC Number *'}</label>
                    <input type="text" name="donorNIC" value={stockForm.donorNIC} onChange={handleStockChange} onBlur={() => handleFieldBlur('stock', 'donorNIC')} className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder={stockForm.isInternational ? "Passport or National ID" : "123456789V or 123456789012"} />
                    {errors.donorNIC && <p className="text-red-500 text-xs mt-1">{errors.donorNIC}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      name="email"
                      value={stockForm.email}
                      onChange={handleStockChange}
                      onBlur={() => handleFieldBlur('stock', 'email')}
                      className={`w-full px-3 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.email ? 'border-red-400' : 'border-blue-200'}`}
                      placeholder="your@email.com"
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Category *</label>
                <select value={selectedCategory} onChange={(e) => handleCategorySelect(e.target.value)} className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl">
                  <option value="">-- Select Category --</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {selectedCategory && itemsByCategory[selectedCategory] && (
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Item Name *</label>
                  <select value={stockForm.inventoryId} onChange={(e) => handleItemSelect(e.target.value)} className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl">
                    <option value="">-- Select Item --</option>
                    {itemsByCategory[selectedCategory].map(item => (
                      <option key={item._id} value={item._id}>{item.name} (Available: {item.totalQuantity} {item.unit})</option>
                    ))}
                  </select>
                  {errors.inventoryId && <p className="text-red-500 text-xs mt-1">{errors.inventoryId}</p>}
                </div>
              )}

              {selectedItem && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">Quantity *</label>
                    <input type="number" name="quantity" value={stockForm.quantity} onChange={handleStockChange} onBlur={() => handleFieldBlur('stock', 'quantity')} min="1" className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl" />
                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                    <p className="text-blue-500 text-xs mt-1">Available: {selectedItem.totalQuantity} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">Unit</label>
                    <input type="text" value={selectedItem.unit} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Additional Notes</label>
                <textarea name="description" value={stockForm.description} onChange={handleStockChange} rows="2" className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl resize-none" placeholder="Any special instructions..." />
              </div>

              {errors.submit && <div className="bg-red-50 p-3 rounded-xl text-red-600 text-sm">{errors.submit}</div>}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button type="button" onClick={() => setStep('select')} className="px-4 py-2 border border-blue-200 rounded-xl text-blue-600">Back</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                <Package className="h-4 w-4" />
                {isSubmitting ? 'Processing...' : 'Donate Supplies'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Money Donation Form
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center donation-modal" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div
        className="relative bg-white rounded-2xl w-full max-w-lg mx-4 border border-green-200 shadow-xl z-[101] max-h-[90vh] overflow-y-auto donation-modal__card donation-modal__card--money"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-green-700 to-green-600 px-6 py-4 rounded-t-2xl donation-modal__header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Monetary Donation</h3>
            </div>
            <button onClick={() => setStep('select')} className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-green-100 text-sm mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Secure payment powered by Stripe
          </p>
        </div>
        <form onSubmit={handleMoneySubmit} className="px-6 py-4 donation-modal__scroll">
          <div className="space-y-4">
            <div className="bg-green-50/30 p-4 rounded-xl border border-green-100">
              <h4 className="text-sm font-semibold text-green-900 mb-3">Donor Information</h4>
              <div className="mb-3">
                <label className="block text-sm font-medium text-green-800 mb-2">Donor Type</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => handleInternationalToggle('money', false)} className={`flex-1 py-2 px-3 rounded-lg border transition-all ${!moneyForm.isInternational ? 'bg-green-600 text-white' : 'bg-white border-green-200 text-green-700'}`}>Sri Lankan</button>
                  <button type="button" onClick={() => handleInternationalToggle('money', true)} className={`flex-1 py-2 px-3 rounded-lg border transition-all ${moneyForm.isInternational ? 'bg-green-600 text-white' : 'bg-white border-green-200 text-green-700'}`}>International</button>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1">Full Name *</label>
                  <input type="text" name="donorName" value={moneyForm.donorName} onChange={handleMoneyChange} onBlur={() => handleFieldBlur('money', 'donorName')} className="w-full px-3 py-2 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="Enter your full name" />
                  {errors.donorName && <p className="text-red-500 text-xs mt-1">{errors.donorName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1">{moneyForm.isInternational ? 'ID Number *' : 'NIC Number *'}</label>
                  <input type="text" name="donorNIC" value={moneyForm.donorNIC} onChange={handleMoneyChange} onBlur={() => handleFieldBlur('money', 'donorNIC')} className="w-full px-3 py-2 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder={moneyForm.isInternational ? "Passport or National ID" : "123456789V or 123456789012"} />
                  {errors.donorNIC && <p className="text-red-500 text-xs mt-1">{errors.donorNIC}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={moneyForm.email}
                    onChange={handleMoneyChange}
                    onBlur={() => handleFieldBlur('money', 'email')}
                    className={`w-full px-3 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-green-500 outline-none ${errors.email ? 'border-red-400' : 'border-green-200'}`}
                    placeholder="your@email.com"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {moneyForm.isInternational && (
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">
                  <Globe className="w-4 h-4 inline mr-1" /> Currency *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {currencies.filter(c => c.code !== 'LKR').map(currency => (
                    <button key={currency.code} type="button" onClick={() => setMoneyForm(prev => ({ ...prev, currency: currency.code, amount: '' }))} className={`p-2 rounded-lg border transition-all flex items-center justify-center gap-1 ${moneyForm.currency === currency.code ? 'bg-green-600 text-white' : 'bg-white border-green-200 text-green-700'}`}>
                      <span>{currency.flag}</span>
                      <span className="text-xs">{currency.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Select Fund *</label>
              <select value={moneyForm.inventoryId} onChange={(e) => handleFundSelect(e.target.value)} className="w-full px-3 py-2 bg-white border border-green-200 rounded-xl">
                <option value="">-- Select a fund --</option>
                {availableFunds.map(fund => (
                  <option key={fund._id} value={fund._id}>{fund.name} (Balance: LKR {(fund.totalAmount || 0).toLocaleString()})</option>
                ))}
              </select>
              {errors.inventoryId && <p className="text-red-500 text-xs mt-1">{errors.inventoryId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Amount ({moneyForm.isInternational ? moneyForm.currency : 'LKR'}) *</label>
              <div className="relative">
                <input type="number" name="amount" value={moneyForm.amount} onChange={handleMoneyChange} onBlur={() => handleFieldBlur('money', 'amount')} min={amountRules.minAmount} step={amountRules.stepAmount} className="w-full px-3 py-2 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder={`Minimum ${amountRules.minAmount} (increments of ${amountRules.stepAmount})`} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedAmounts.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setMoneyForm((prev) => ({ ...prev, amount: String(value) }));
                      setTouched((prev) => ({ ...prev, amount: true }));
                      setErrors((prev) => ({ ...prev, amount: validateAmount(value, moneyForm.isInternational, moneyForm.currency) }));
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all ${String(moneyForm.amount) === String(value) ? 'bg-green-600 text-white border-green-600' : 'bg-white border-green-200 text-green-700 hover:border-green-400'}`}
                  >
                    {moneyForm.isInternational && moneyForm.currency === 'USD' ? `$${value}` : value}
                  </button>
                ))}
              </div>
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              {moneyForm.isInternational && moneyForm.amount > 0 && moneyForm.currency !== 'LKR' && (
                <p className="text-green-600 text-xs mt-1">≈ LKR {convertToLKR(parseFloat(moneyForm.amount), moneyForm.currency).toLocaleString()}</p>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <strong>Secure Payment</strong> - You'll be redirected to Stripe to complete your payment.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Additional Notes</label>
              <textarea name="description" value={moneyForm.description} onChange={handleMoneyChange} rows="2" className="w-full px-3 py-2 bg-white border border-green-200 rounded-xl resize-none" placeholder="Any special instructions..." />
            </div>

            {errors.submit && <div className="bg-red-50 p-3 rounded-xl text-red-600 text-sm">{errors.submit}</div>}
          </div>

          <div className="mt-6 flex gap-3 justify-end donation-modal__footer">
            <button type="button" onClick={() => setStep('select')} className="px-4 py-2 border border-green-200 rounded-xl text-green-600">Back</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationFlow;