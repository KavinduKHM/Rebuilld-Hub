import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  DollarSign,
  Package
} from 'lucide-react';

const InventoryTable = ({ 
  inventory, 
  onEdit, 
  onDelete, 
  onView, 
  isAdmin = false,
  onDonationsClick 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.inventoryCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const styles = {
      'Available': 'bg-green-100 text-green-800',
      'Low Stock': 'bg-amber-100 text-amber-800',
      'Out of Stock': 'bg-red-100 text-red-800',
      'Not available': 'bg-gray-100 text-gray-800',
      'Low Amount': 'bg-yellow-100 text-yellow-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    return type === 'MONEY' ? 
      <DollarSign className="h-4 w-4 text-emerald-600" /> : 
      <Package className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with Filters */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, code, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="STOCK">Stock</option>
              <option value="MONEY">Money</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Food">Food</option>
              <option value="Cloth">Cloth</option>
              <option value="Sanitory">Sanitary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity/Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedInventory.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                  {item.inventoryCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {getTypeIcon(item.type)}
                    <span className="text-sm text-gray-700">{item.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {item.category || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {item.type === 'STOCK' 
                    ? `${item.totalQuantity} ${item.unit || 'units'}`
                    : `$${item.totalAmount?.toLocaleString() || 0}`
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView && onView(item)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEdit && onEdit(item)}
                          className="p-1 text-amber-600 hover:text-amber-800 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete && onDelete(item)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No inventory items found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInventory.length)} of {filteredInventory.length} items
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Donations Button (Admin only) */}
      {isAdmin && onDonationsClick && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onDonationsClick}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <DollarSign className="h-4 w-4" />
            View All Donations Received
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;