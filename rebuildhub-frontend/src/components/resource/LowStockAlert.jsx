import React, { useState } from 'react';
import { AlertTriangle, Package, X } from 'lucide-react';

const LowStockAlert = ({ lowStockItems, onViewItem }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !lowStockItems || lowStockItems.length === 0) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg shadow-md mb-6 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <h3 className="text-sm font-medium text-amber-800">
              Low Stock Alert
            </h3>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-amber-400 hover:text-amber-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="mt-3">
          <p className="text-sm text-amber-700 mb-2">
            The following items are running low and need immediate attention:
          </p>
          <div className="space-y-2">
            {lowStockItems.slice(0, 5).map((item) => (
              <div 
                key={item._id}
                className="flex items-center justify-between bg-white rounded-lg p-2 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onViewItem && onViewItem(item)}
              >
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-amber-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Code: {item.inventoryCode} | Category: {item.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-600">
                    {item.totalQuantity} {item.unit} left
                  </p>
                  <p className="text-xs text-red-500">⚠️ Low Stock</p>
                </div>
              </div>
            ))}
          </div>
          {lowStockItems.length > 5 && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              +{lowStockItems.length - 5} more items low in stock
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert;