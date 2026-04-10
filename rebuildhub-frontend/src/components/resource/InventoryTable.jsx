import React, { useMemo, useState } from 'react';
import {
  Edit,
  Trash2,
  ChevronDown,
  Search,
  DollarSign,
  Package,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle
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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSearch = !normalizedSearchTerm
      || (item.name || '').toLowerCase().includes(normalizedSearchTerm)
      || (item.inventoryCode || '').toLowerCase().includes(normalizedSearchTerm)
      || (item.category || '').toLowerCase().includes(normalizedSearchTerm)
      || (item.type || '').toLowerCase().includes(normalizedSearchTerm);
    return matchesCategory && matchesStatus && matchesSearch;
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
      'Out of Stock': 'resource-status resource-status--critical'
    };
    return styles[status] || 'resource-status resource-status--muted';
  };

  const getConditionLabel = (item) => {
    if (item.condition) return item.condition;
    if (item.type === 'MONEY') return 'Certified';
    return 'Inspected';
  };

  const maxStockQuantity = useMemo(() => {
    const values = (filteredInventory || [])
      .filter((item) => item.type === 'STOCK')
      .map((item) => Number(item.totalQuantity || 0));
    return Math.max(1, ...values);
  }, [filteredInventory]);

  const getStockLevelBarWidth = (item) => {
    if (item.type === 'MONEY') {
      const amount = Number(item.totalAmount || 0);
      // Align with backend status logic where 1000+ is considered healthy/available.
      return Math.min(100, Math.round((amount / 1000) * 100));
    }

    const quantity = Number(item.totalQuantity || 0);
    return Math.min(100, Math.round((quantity / maxStockQuantity) * 100));
  };

  const getTypeIcon = (type) => {
    return type === 'MONEY'
      ? <DollarSign className="h-4 w-4" />
      : <Package className="h-4 w-4" />;
  };

  const getStatusIcon = (status) => {
    if (status === 'Available') return <CheckCircle className="h-3.5 w-3.5" />;
    if (status === 'Low Stock' || status === 'Low Amount') return <AlertTriangle className="h-3.5 w-3.5" />;
    if (status === 'Out of Stock') return <XCircle className="h-3.5 w-3.5" />;
    return <Package className="h-3.5 w-3.5" />;
  };

  const formatTimestamp = (value) => {
    if (!value) return 'No timestamp available';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'No timestamp available';
    return parsed.toLocaleString();
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
        <div className="resource-table__tools">
          <label className="resource-table__search" aria-label="Search inventory">
            <Search className="h-4 w-4" />
            <input
              type="text"
              placeholder="Search inventory"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
          <div className="resource-table__meta">
            Viewing {Math.min(startIndex + itemsPerPage, filteredInventory.length)} of {filteredInventory.length}
          </div>
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.map((item) => (
              <tr key={item._id}>
                <td>
                  <div className="resource-table__item">
                    <span
                      className={`resource-table__icon ${item.type === 'MONEY' ? 'resource-table__icon--money' : 'resource-table__icon--stock'}`}
                      aria-hidden="true"
                    >
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
                          width: `${getStockLevelBarWidth(item)}%`
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <span className="resource-table__condition">{getConditionLabel(item)}</span>
                </td>
                <td>
                  <span className={getStatusBadge(item.status)}>
                    <span className="resource-status__icon" aria-hidden="true">{getStatusIcon(item.status)}</span>
                    {item.status || 'Unknown'}
                  </span>
                </td>
                <td>
                  <div className="resource-table__actions">
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          className="resource-table__action-btn resource-table__action-btn--edit"
                          onClick={() => onEdit && onEdit(item)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="resource-table__action-btn resource-table__action-btn--delete"
                          onClick={() => onDelete && onDelete(item)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <span className="resource-table__menu-wrapper">
                      <span className="resource-table__menu" aria-label="Item timestamp">
                        <MoreVertical className="h-4 w-4" />
                      </span>
                      <span className="resource-table__menu-tooltip">Updated: {formatTimestamp(item.updatedAt)}</span>
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