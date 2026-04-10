import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrencyLKR } from '../../utils/formatters';

const ResourceCharts = ({ inventory }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Insights</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {inventory?.filter(i => i.type === 'STOCK').length || 0}
            </p>
            <p className="text-sm text-gray-600">Stock Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrencyLKR(
                inventory?.filter(i => i.type === 'MONEY').reduce((sum, i) => sum + (i.totalAmount || 0), 0) || 0
              )}
            </p>
            <p className="text-sm text-gray-600">Total Funds</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">
              {inventory?.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length || 0}
            </p>
            <p className="text-sm text-gray-600">Critical Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {inventory?.length || 0}
            </p>
            <p className="text-sm text-gray-600">Total Items</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCharts;