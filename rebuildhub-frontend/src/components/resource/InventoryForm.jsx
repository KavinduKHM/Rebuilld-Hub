import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign } from 'lucide-react';

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
      if (formData.totalAmount < 0) {
        newErrors.totalAmount = 'Amount cannot be negative';
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
          totalAmount: formData.totalAmount || 0
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
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'number' ? parseFloat(value) || 0 : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {formData.type === 'STOCK' ? 
                  <Package className="h-5 w-5 text-white" /> : 
                  <DollarSign className="h-5 w-5 text-white" />
                }
                <h3 className="text-lg font-semibold text-white">
                  {isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                </h3>
              </div>
              <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
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
                  <label className="flex items-center gap-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="Food">Food</option>
                      <option value="Cloth">Clothing</option>
                      <option value="Sanitory">Sanitary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                        errors.unit ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., kg, boxes, liters, pieces"
                    />
                    {errors.unit && <p className="mt-1 text-xs text-red-500">{errors.unit}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Quantity
                    </label>
                    <input
                      type="number"
                      name="totalQuantity"
                      value={formData.totalQuantity}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </>
              )}

              {/* Money-specific fields */}
              {formData.type === 'MONEY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Amount (USD)
                  </label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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

            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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