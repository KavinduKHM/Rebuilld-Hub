import React, { useState, useEffect } from 'react';
// Added missing imports for used icons
import {
  Heart, CreditCard, X, Lock, AlertTriangle, Globe, Loader2
} from 'lucide-react';

// Exchange rates for display
const exchangeRates = {
  LKR: 1,
  USD: 0.0033,
  EUR: 0.0031,
  GBP: 0.0026,
  JPY: 0.50,
  AUD: 0.0050,
  CAD: 0.0045,
};

const currencies = [
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', flag: '🇱🇰', minAmount: 100 },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', minAmount: 5 },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', minAmount: 5 },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', minAmount: 5 },
];

// Internal form component that uses Stripe
const MoneyDonationFormInner = ({ initialFund, onClose, onSuccess, availableFunds }) => {
  const [formData, setFormData] = useState({
    donorName: '',
    donorNIC: '',
    email: '',
    inventoryId: initialFund?._id || '',
    fundName: initialFund?.name || '',
    amount: '',
    description: '',
    isInternational: false,
    currency: 'LKR',
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFund, setSelectedFund] = useState(initialFund || null);

  const convertToLKR = (amount, fromCurrency) => {
    if (fromCurrency === 'LKR') return amount;
    const rate = exchangeRates[fromCurrency];
    if (!rate) return amount;
    return Math.round(amount / rate);
  };

  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency?.symbol || 'Rs';
  };

  const getMinAmount = (currencyCode, isInternational) => {
    if (!isInternational) return 200;
    const currency = currencies.find(c => c.code === currencyCode);
    return currency?.minAmount || 5;
  };

  // NIC Validation (Sri Lankan NIC format) - only for local donors
  const validateNIC = (nic, isInternational) => {
    if (isInternational) return null;
    if (!nic || nic.trim() === '') return 'NIC is required';
    const oldNicPattern = /^[0-9]{9}[VvXx]$/;
    const newNicPattern = /^[0-9]{12}$/;
    if (!oldNicPattern.test(nic) && !newNicPattern.test(nic)) {
      return 'Please enter a valid Sri Lankan NIC';
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return true;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validateAmount = (amount, isInternational, currency) => {
    if (!amount || amount <= 0) return 'Please enter a valid amount';
    const minAmount = getMinAmount(currency, isInternational);
    if (amount < minAmount) {
      return `Minimum donation amount is ${getCurrencySymbol(currency)}${minAmount.toLocaleString()}`;
    }
    if (!isInternational && Number(amount) % 50 !== 0) {
      return 'Amount should increase by LKR 50';
    }
    if (amount > 10000000) return `Maximum donation amount is ${isInternational ? 'equivalent to' : 'LKR'} 10,000,000`;
    return null;
  };

  const validateDonorName = (name) => {
    if (!name || name.trim() === '') return 'Donor name is required';
    if (/\d/.test(name)) return 'Name cannot contain numbers';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > 100) return 'Name must be less than 100 characters';
    return null;
  };

  const validateFund = (fundId) => {
    if (!fundId && !initialFund) return 'Please select a fund to donate to';
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
        error = validateNIC(formData.donorNIC, formData.isInternational);
        break;
      case 'email':
        if (formData.email && !validateEmail(formData.email)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'amount':
        error = validateAmount(formData.amount, formData.isInternational, formData.currency);
        break;
      case 'inventoryId':
        error = validateFund(formData.inventoryId);
        break;
      default: {
        // Default case explicitly added for ESLint
        error = undefined;
        break;
      }
    }
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'donorName') {
      const sanitizedValue = value.replace(/\d/g, '');
      setFormData(prev => ({ ...prev, donorName: sanitizedValue }));
      if (touched.donorName) {
        const error = validateDonorName(sanitizedValue);
        setErrors(prev => ({ ...prev, donorName: error }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      let error = null;
      switch (name) {
        case 'donorName':
          error = validateDonorName(value);
          break;
        case 'donorNIC':
          error = validateNIC(value, formData.isInternational);
          break;
        case 'email':
          if (value && !validateEmail(value)) {
            error = 'Please enter a valid email address';
          }
          break;
        case 'amount':
          error = validateAmount(value, formData.isInternational, formData.currency);
          break;
        default:
          break;
      }
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleFundSelect = (e) => {
    const fundId = e.target.value;
    const fund = availableFunds.find(f => f._id === fundId);
    setSelectedFund(fund);
    setFormData(prev => ({
      ...prev,
      inventoryId: fundId,
      fundName: fund?.name || ''
    }));
    setTouched(prev => ({ ...prev, inventoryId: true }));
    setErrors(prev => ({ ...prev, inventoryId: validateFund(fundId) }));
  };

  const handleInternationalToggle = (isInternational) => {
    setFormData(prev => ({
      ...prev,
      isInternational,
      donorNIC: '',
      currency: isInternational ? 'USD' : 'LKR',
      amount: '',
    }));
    setErrors(prev => ({ ...prev, donorNIC: '', amount: '' }));
  };

  const handleCurrencyChange = (currencyCode) => {
    setFormData(prev => ({
      ...prev,
      currency: currencyCode,
      amount: '',
    }));
    setErrors(prev => ({ ...prev, amount: '' }));
  };

  const validateForm = () => {
    const allTouched = {
      donorName: true,
      donorNIC: true,
      amount: true,
      inventoryId: true,
    };
    setTouched(allTouched);

    const newErrors = {};
    
    const nameError = validateDonorName(formData.donorName);
    if (nameError) newErrors.donorName = nameError;
    
    const nicError = validateNIC(formData.donorNIC, formData.isInternational);
    if (nicError) newErrors.donorNIC = nicError;
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    const amountError = validateAmount(formData.amount, formData.isInternational, formData.currency);
    if (amountError) newErrors.amount = amountError;
    
    const fundError = validateFund(formData.inventoryId);
    if (fundError) newErrors.inventoryId = fundError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    
    try {
      // Calculate amount in LKR for backend
      let amountInLKR = parseFloat(formData.amount);
      if (formData.isInternational && formData.currency !== 'LKR') {
        amountInLKR = convertToLKR(amountInLKR, formData.currency);
      }
      
      // Create Stripe checkout session and redirect
      const donationData = {
        donorName: formData.donorName.trim(),
        donorNIC: formData.donorNIC.trim() || (formData.isInternational ? 'INTERNATIONAL' : 'N/A'),
        email: formData.email?.trim() || '',
        type: 'MONEY',
        inventoryId: formData.inventoryId,
        name: selectedFund?.name || initialFund?.name,
        description: formData.description?.trim() || '',
        amount: amountInLKR,
        paymentStatus: 'PENDING',
        isInternational: formData.isInternational,
        originalCurrency: formData.isInternational ? formData.currency : 'LKR',
        originalAmount: formData.isInternational ? parseFloat(formData.amount) : null,
      };

      const response = await fetch('http://localhost:5000/Rebuildhub/donations/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create checkout session');
      }

      if (result.url) {
        window.location.href = result.url;
        return;
      }

      throw new Error('No checkout URL received from server');
    } catch (error) {
      console.error('Payment error:', error);
      setErrors({ submit: error.message || 'Payment failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center donation-modal">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl w-full max-w-lg mx-4 border border-blue-200 shadow-xl z-[101] max-h-[90vh] overflow-y-auto donation-modal__card donation-modal__card--money">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 rounded-t-2xl donation-modal__header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Donate with Credit Card
              </h3>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Secure payment powered by Stripe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* Donor Type Toggle */}
            <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Donor Information</h4>
              <div className="mb-3">
                <label className="block text-sm font-medium text-blue-800 mb-2">Donor Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleInternationalToggle(false)}
                    className={`flex-1 py-2 px-3 rounded-lg border transition-all ${!formData.isInternational ? 'bg-blue-600 text-white' : 'bg-white border-blue-200 text-blue-700'}`}
                  >
                    Sri Lankan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInternationalToggle(true)}
                    className={`flex-1 py-2 px-3 rounded-lg border transition-all ${formData.isInternational ? 'bg-blue-600 text-white' : 'bg-white border-blue-200 text-blue-700'}`}
                  >
                    International
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="donorName"
                    value={formData.donorName}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('donorName')}
                    className={`w-full px-3 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-blue-900 ${
                      errors.donorName && touched.donorName ? 'border-red-500' : 'border-blue-200'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.donorName && touched.donorName && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.donorName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">
                    {formData.isInternational ? 'ID Number (Optional)' : 'NIC Number *'}
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
                    placeholder={formData.isInternational ? "Optional - You can leave this blank" : "e.g., 123456789V"}
                  />
                  {errors.donorNIC && touched.donorNIC && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {errors.donorNIC}
                    </p>
                  )}
                  {formData.isInternational && !errors.donorNIC && (
                    <p className="mt-1 text-xs text-blue-500">ID number is optional for international donors</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">
                    Email <span className="text-blue-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('email')}
                    className={`w-full px-3 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-blue-900 ${
                      errors.email && touched.email ? 'border-red-500' : 'border-blue-200'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && touched.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Currency Selection - Only for International Donors */}
            {formData.isInternational && (
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    Currency *
                  </div>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {currencies.filter(c => c.code !== 'LKR').map(currency => (
                    <button
                      key={currency.code}
                      type="button"
                      onClick={() => handleCurrencyChange(currency.code)}
                      className={`h-8 px-1.5 rounded-md border transition-all flex items-center justify-center min-w-0 ${
                        formData.currency === currency.code
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      <span className="text-[10px] font-semibold tracking-wider">{currency.code}</span>
                    </button>
                  ))}
                </div>
                <p className="text-blue-600 text-xs mt-1">
                  Amount will be converted to LKR for local processing
                </p>
              </div>
            )}

            {/* Fund Selection */}
            {!initialFund && availableFunds.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Select Fund <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.inventoryId}
                  onChange={handleFundSelect}
                  className={`w-full px-3 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-blue-900 ${
                    errors.inventoryId && touched.inventoryId ? 'border-red-500' : 'border-blue-200'
                  }`}
                >
                  <option value="">-- Select a fund --</option>
                  {availableFunds.map(fund => (
                    <option key={fund._id} value={fund._id}>
                      {fund.name} - Balance: LKR {(fund.totalAmount || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
                {errors.inventoryId && touched.inventoryId && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.inventoryId}
                  </p>
                )}
              </div>
            )}

            {/* Display selected fund */}
            {(initialFund || selectedFund) && (
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                <p className="text-xs text-blue-600 mb-1">Donating to:</p>
                <p className="font-semibold text-blue-900">{initialFund?.name || selectedFund?.name}</p>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">
                Amount ({formData.isInternational ? formData.currency : 'LKR'}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  onBlur={() => handleFieldBlur('amount')}
                  min={getMinAmount(formData.currency, formData.isInternational)}
                  step={formData.isInternational ? 1 : 50}
                  className={`w-full px-3 py-2 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-blue-900 ${
                    errors.amount && touched.amount ? 'border-red-500' : 'border-blue-200'
                  }`}
                  placeholder={`Minimum ${getCurrencySymbol(formData.currency)}${getMinAmount(formData.currency, formData.isInternational).toLocaleString()}`}
                />
              </div>
              {errors.amount && touched.amount && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.amount}
                </p>
              )}
              
              {/* Show approximate LKR value for international donors */}
              {formData.isInternational && formData.amount > 0 && formData.currency !== 'LKR' && (
                <p className="text-blue-600 text-xs mt-1">
                  ≈ LKR {convertToLKR(parseFloat(formData.amount), formData.currency).toLocaleString()}
                </p>
              )}
              
              <div className="mt-2 flex gap-2 flex-wrap">
                {!formData.isInternational ? (
                  // Local quick amounts
                  [200, 250, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, amount: amt }));
                        setTouched(prev => ({ ...prev, amount: true }));
                      }}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      LKR {amt.toLocaleString()}
                    </button>
                  ))
                ) : formData.currency === 'USD' && (
                  [10, 25, 50, 100].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, amount: amt }));
                        setTouched(prev => ({ ...prev, amount: true }));
                      }}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      ${amt}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <strong>Secure Payment</strong> - You'll be redirected to Stripe to complete your payment.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">
                Additional Notes
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-blue-900 resize-none"
                placeholder="Any special instructions..."
              />
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 rounded-xl p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Donation Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600">Donor:</span>
                  <span className="text-blue-900 font-medium">{formData.donorName || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Donor Type:</span>
                  <span className="text-blue-900 font-medium">{formData.isInternational ? 'International' : 'Sri Lankan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Fund:</span>
                  <span className="text-blue-900 font-medium">{initialFund?.name || selectedFund?.name || 'Not selected'}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2 mt-1">
                  <span className="text-blue-800 font-semibold">Total:</span>
                  <span className="text-blue-900 font-bold text-lg">
                    {formData.isInternational ? formData.currency : 'LKR'} {formData.amount ? parseFloat(formData.amount).toLocaleString() : '0'}
                  </span>
                </div>
                {formData.isInternational && formData.amount > 0 && formData.currency !== 'LKR' && (
                  <div className="flex justify-between text-xs text-blue-600">
                    <span>≈ LKR:</span>
                    <span>{convertToLKR(parseFloat(formData.amount), formData.currency).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3 justify-end sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2 font-medium"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  Proceed to Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MoneyDonationForm = ({ initialFund, onClose, onSuccess }) => {
  const [availableFunds, setAvailableFunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableFunds();
  }, []);

  const fetchAvailableFunds = async () => {
    try {
      const response = await fetch('http://localhost:5000/Rebuildhub/inventory');
      const data = await response.json();
      const moneyFunds = data.filter(item => item.type === 'MONEY');
      setAvailableFunds(moneyFunds);
    } catch (error) {
      console.error('Error fetching funds:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div className="relative bg-white rounded-2xl p-8 shadow-xl z-[101]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-blue-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MoneyDonationFormInner
      initialFund={initialFund}
      onClose={onClose}
      onSuccess={onSuccess}
      availableFunds={availableFunds}
    />
  );
};

export default MoneyDonationForm;