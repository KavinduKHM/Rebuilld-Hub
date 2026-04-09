import React, { useMemo, useState } from 'react';
import {
  Edit,
  Trash2,
  ChevronDown,
  Eye,
  DollarSign,
  Package,
  MoreVertical
} from 'lucide-react';

const InventoryTable = ({ 
  inventory, 
  onEdit, 
  onDelete, 
  onView, 
  isAdmin = false,
  onDonationsClick 
}) => {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const categoryOptions = useMemo(() => {
    const values = new Set((inventory || []).map((item) => item.category).filter(Boolean));
    return ['ALL', ...Array.from(values)];
  }, [inventory]);

  const statusOptions = useMemo(() => {
    const values = new Set((inventory || []).map((item) => item.status).filter(Boolean));
    return ['ALL', ...Array.from(values)];
  }, [inventory]);

  // Pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const styles = {
      'Available': 'resource-status resource-status--available',
      'Low Stock': 'resource-status resource-status--low',
      'Out of Stock': 'resource-status resource-status--critical',
      'Not available': 'resource-status resource-status--muted',
      'Low Amount': 'resource-status resource-status--low'
    };
    return styles[status] || 'resource-status resource-status--muted';
  };

  const getConditionLabel = (item) => {
    if (item.condition) return item.condition;
    if (item.type === 'MONEY') return 'Certified';
    return 'Inspected';
  };

  const maxStockValue = useMemo(() => {
    const values = (filteredInventory || []).map((item) => {
      if (item.type === 'MONEY') return Number(item.totalAmount || 0);
      return Number(item.totalQuantity || 0);
    });
    return Math.max(1, ...values);
  }, [filteredInventory]);

  const getTypeIcon = (type) => {
    return type === 'MONEY'
      ? <DollarSign className="h-4 w-4" />
      : <Package className="h-4 w-4" />;
  };

  return (
    <div className="resource-table">
      <div className="resource-table__toolbar">
        <div className="resource-table__filters">
          <label className="resource-table__filter">
            <span>Category</span>
            <div className="resource-table__select">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4" />
            </div>
          </label>
          <label className="resource-table__filter">
            <span>Status</span>
            <div className="resource-table__select">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4" />
            </div>
          </label>
        </div>
        <div className="resource-table__meta">
          Viewing {Math.min(startIndex + itemsPerPage, filteredInventory.length)} of {filteredInventory.length}
        </div>
      </div>

      {/* Table */}
      <div className="resource-table__wrap">
        <table className="resource-table__grid">
          <thead>
            <tr>
              <th>Item Details</th>
              <th>Code</th>
              <th>Stock Level</th>
              <th>Condition</th>
              <th>Status</th>
              <th>Timestamp</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.map((item) => (
              <tr key={item._id}>
                <td>
                  <div className="resource-table__item">
                    <span className="resource-table__icon" aria-hidden="true">
                      {getTypeIcon(item.type)}
                    </span>
                    <div>
                      <p className="resource-table__name">{item.name || 'Unknown Item'}</p>
                      <p className="resource-table__meta-line">
                        {item.category || 'Uncategorized'} · {item.type === 'MONEY' ? 'Monetary' : 'Stock'}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="resource-table__code">{item.inventoryCode || '-'}</div>
                </td>
                <td>
                  <div className="resource-table__stock">
                    <span>
                      {item.type === 'STOCK'
                        ? `${item.totalQuantity || 0} ${item.unit || 'units'}`
                        : `LKR ${Number(item.totalAmount || 0).toLocaleString()}`
                      }
                    </span>
                    <div className="resource-table__bar">
                      <span
                        style={{
                          width: `${Math.min(100, Math.round(((item.type === 'MONEY' ? Number(item.totalAmount || 0) : Number(item.totalQuantity || 0)) / maxStockValue) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <span className="resource-table__condition">{getConditionLabel(item)}</span>
                </td>
                <td>
                  <span className={getStatusBadge(item.status)}>{item.status || 'Unknown'}</span>
                </td>
                <td>
                  <div className="resource-table__timestamp">{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'}</div>
                </td>
                <td>
                  <div className="resource-table__actions">
                    <button
                      type="button"
                      onClick={() => onView && onView(item)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit && onEdit(item)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete && onDelete(item)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <span className="resource-table__menu" aria-hidden="true">
                      <MoreVertical className="h-4 w-4" />
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredInventory.length === 0 && (
        <div className="resource-table__empty">
          <Package className="h-10 w-10" />
          <p>No inventory items found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && currentPage < totalPages && (
        <div className="resource-table__footer">
          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            Load More Operations Data
          </button>
        </div>
      )}

      {/* Donations Button (Admin only) */}
      {isAdmin && onDonationsClick && (
        <div className="resource-table__footer">
          <button type="button" onClick={onDonationsClick}>
            View All Donations Received
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;