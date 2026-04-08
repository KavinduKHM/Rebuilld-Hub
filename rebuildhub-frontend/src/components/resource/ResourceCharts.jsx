import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ResourceCharts = ({ inventory }) => {
  // Prepare category distribution data
  const categoryData = [
    { name: 'Food', value: inventory?.filter(i => i.category === 'Food').reduce((sum, i) => sum + (i.totalQuantity || 0), 0) || 0 },
    { name: 'Clothing', value: inventory?.filter(i => i.category === 'Cloth').reduce((sum, i) => sum + (i.totalQuantity || 0), 0) || 0 },
    { name: 'Sanitary', value: inventory?.filter(i => i.category === 'Sanitory').reduce((sum, i) => sum + (i.totalQuantity || 0), 0) || 0 }
  ].filter(item => item.value > 0);

  // Prepare stock status data
  const statusData = [
    { name: 'Available', value: inventory?.filter(i => i.status === 'Available').length || 0 },
    { name: 'Low Stock', value: inventory?.filter(i => i.status === 'Low Stock').length || 0 },
    { name: 'Out of Stock', value: inventory?.filter(i => i.status === 'Out of Stock').length || 0 }
  ].filter(item => item.value > 0);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-gray-600">Value: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Distribution Pie Chart */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Stock Status Bar Chart */}
      {statusData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock Status Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" name="Number of Items" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-4 lg:col-span-2">
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
              ${inventory?.filter(i => i.type === 'MONEY').reduce((sum, i) => sum + (i.totalAmount || 0), 0).toLocaleString() || 0}
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