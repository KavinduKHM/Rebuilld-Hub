import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign } from 'lucide-react';
import '../../pages/resource/ResourcePage.css';

const InventoryForm = ({ isOpen, onClose, onSubmit, initialData, isEditing }) => {
  const [formData, setFormData] = useState({
    type: 'STOCK',
    category: 'Food',
    unit: '',
    name: '',
    description: '',
    totalQuantity: 0,
    totalAmount: 0
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        type: initialData.type || 'STOCK',
        category: initialData.category || 'Food',
        unit: initialData.unit || '',
        name: initialData.name || '',
        description: initialData.description || '',
        totalQuantity: initialData.totalQuantity || 0,
        totalAmount: initialData.totalAmount || 0
      });
    } else {
      resetForm();
    }
  }, [initialData, isEditing, isOpen]);

  const resetForm = () => {
    setFormData({
      type: 'STOCK',
      category: 'Food',
      unit: '',
      name: '',
      description: '',
      totalQuantity: 0,
      totalAmount: 0
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (formData.type === 'STOCK') {
      if (!formData.category) {
        newErrors.category = 'Category is required for stock items';
      }
      if (!formData.unit) {
        newErrors.unit = 'Unit is required for stock items';
      } else if (formData.unit.length > 20) {
        newErrors.unit = 'Unit must be less than 20 characters';
      }
      if (formData.totalQuantity < 0) {
        newErrors.totalQuantity = 'Quantity cannot be negative';
      }
    } else if (formData.type === 'MONEY') {
      const moneyAmount = Number(formData.totalAmount);
      if (!Number.isInteger(moneyAmount)) {
        newErrors.totalAmount = 'Amount must be a whole number (no decimals)';
      } else if (moneyAmount < 0) {
        newErrors.totalAmount = 'Amount must be greater than 0';
      }
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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
        type: formData.type,
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        ...(formData.type === 'STOCK' && {
          category: formData.category,
          unit: formData.unit,
          totalQuantity: formData.totalQuantity || 0
        }),
        ...(formData.type === 'MONEY' && {
          totalAmount: Number(formData.totalAmount) || 0
        })
      };
      
      await onSubmit(submitData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: error.message || 'Failed to save inventory item' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type: inputType } = e.target;

    if ((name === 'totalQuantity' || name === 'totalAmount') && value !== '' && !/^\d+$/.test(value)) {
      setErrors(prev => ({ ...prev, [name]: 'Only non-negative whole numbers are allowed' }));
      return;
    }

    const parsedNumber = (() => {
      if (inputType !== 'number') return value;
      if (value === '') return name === 'totalAmount' ? '' : 0;
      if (name === 'totalAmount') return Number.parseInt(value, 10) || 0;
      return parseFloat(value) || 0;
    })();

    setFormData(prev => ({
      ...prev,
      [name]: parsedNumber
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberKeyDown = (event) => {
    if (['-', '+', '.', 'e', 'E'].includes(event.key)) {
      event.preventDefault();
    }
  };

  const handleNumberPaste = (event, fieldName) => {
    const pastedText = event.clipboardData?.getData('text') || '';
    if (pastedText && !/^\d+$/.test(pastedText.trim())) {
      event.preventDefault();
      setErrors(prev => ({ ...prev, [fieldName]: 'Only non-negative whole numbers are allowed' }));
    }
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #1d4ed8, #2563eb 45%, #3b82f6)',
    color: '#ffffff'
  };

  const closeStyle = {
    width: '2rem',
    height: '2rem',
    borderRadius: '999px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.18)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  };

  const footerStyle = {
    borderTop: '1px solid rgba(226, 232, 240, 0.7)',
    background: 'rgba(248, 250, 252, 0.9)',
    paddingTop: '0.75rem',
    borderBottomLeftRadius: '1.2rem',
    borderBottomRightRadius: '1.2rem'
  };

  const primaryButtonStyle = {
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#ffffff',
    border: '1px solid transparent',
    boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto inventory-modal">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 inventory-modal__shell">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 inventory-modal__backdrop" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full inventory-modal__card">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 inventory-modal__header" style={headerStyle}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 inventory-modal__title">
                {formData.type === 'STOCK' ? 
                  <Package className="h-5 w-5 text-white" /> : 
                  <DollarSign className="h-5 w-5 text-white" />
                }
                <h3 className="text-lg font-semibold text-white">
                  {isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                </h3>
              </div>
              <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors inventory-modal__close" style={closeStyle}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 inventory-modal__body">
            <div className="space-y-4 inventory-modal__fields">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 inventory-modal__label">
                  Item Type *
                </label>
                <div className="flex gap-4 inventory-modal__toggle">
                  <label className="flex items-center gap-2 inventory-modal__radio">
                    <input
                      type="radio"
                      name="type"
                      value="STOCK"
                      checked={formData.type === 'STOCK'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Stock (Physical Items)</span>
                  </label>
                  <label className="flex items-center gap-2 inventory-modal__radio">
                    <input
                      type="radio"
                      name="type"
                      value="MONEY"
                      checked={formData.type === 'MONEY'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Money (Funds)</span>
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 inventory-modal__label">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all inventory-modal__input ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Rice, Medical Kits, Water Bottles"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Stock-specific fields */}
              {formData.type === 'STOCK' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 inventory-modal__label">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none inventory-modal__input"
                    >
                      <option value="Food">Food</option>
                      <option value="Clothing - Child">Clothing - Child</option>
                      <option value="Clothing - Adult">Clothing - Adult</option>
                      <option value="Clothing - Male">Clothing - Male</option>
                      <option value="Clothing - Female">Clothing - Female</option>
                      <option value="Sanitary Items">Sanitary Items</option>
                      <option value="Medicines">Medicines</option>
                      <option value="Water & Beverages">Water & Beverages</option>
                      <option value="Shelter Supplies">Shelter Supplies</option>
                      <option value="Baby Care">Baby Care</option>
                      <option value="Other Essentials">Other Essentials</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 inventory-modal__label">
                      Unit *
                    </label>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none inventory-modal__input ${
                        errors.unit ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., kg, boxes, liters, pieces"
                    />
                    {errors.unit && <p className="mt-1 text-xs text-red-500">{errors.unit}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 inventory-modal__label">
                      Initial Quantity
                    </label>
                    <input
                      type="number"
                      name="totalQuantity"
                      value={formData.totalQuantity}
                      onChange={handleChange}
                      onKeyDown={handleNumberKeyDown}
                      onPaste={(event) => handleNumberPaste(event, 'totalQuantity')}
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none inventory-modal__input"
                    />
                    {errors.totalQuantity && <p className="mt-1 text-xs text-red-500">{errors.totalQuantity}</p>}
                  </div>
                </>
              )}

              {/* Money-specific fields */}
              {formData.type === 'MONEY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 inventory-modal__label">
                    Initial Amount (USD)
                  </label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleChange}
                    onKeyDown={handleNumberKeyDown}
                    onPaste={(event) => handleNumberPaste(event, 'totalAmount')}
                    min="0"
                    step="50"
                    inputMode="numeric"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none inventory-modal__input"
                  />
                  <p className="mt-1 text-xs text-gray-500">Use whole numbers only. Step increment is 50.</p>
                  {errors.totalAmount && <p className="mt-1 text-xs text-red-500">{errors.totalAmount}</p>}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 inventory-modal__label">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none inventory-modal__input"
                  placeholder="Additional details about this item..."
                />
                {formData.description && (
                  <p className="mt-1 text-xs text-gray-500 text-right">
                    {formData.description.length}/500 characters
                  </p>
                )}
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3 justify-end inventory-modal__actions" style={footerStyle}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inventory-modal__button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md inventory-modal__button inventory-modal__button--primary"
                style={primaryButtonStyle}
              >
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Item' : 'Add Item')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryForm;