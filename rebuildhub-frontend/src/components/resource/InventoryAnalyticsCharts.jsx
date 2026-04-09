import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

const PIE_COLORS = ['#0ea5e9', '#f59e0b', '#22c55e', '#8b5cf6', '#ef4444', '#06b6d4'];

const InventoryAnalyticsCharts = ({ inventory = [], donations = [] }) => {
  const inventoryByType = useMemo(() => {
    const stockCount = inventory.filter((item) => item.type === 'STOCK').length;
    const moneyCount = inventory.filter((item) => item.type === 'MONEY').length;

    return [
      { name: 'Stock', value: stockCount },
      { name: 'Funds', value: moneyCount }
    ].filter((entry) => entry.value > 0);
  }, [inventory]);

  const inventoryByCategory = useMemo(() => {
    const map = new Map();

    inventory
      .filter((item) => item.type === 'STOCK')
      .forEach((item) => {
        const key = item.category || 'Unknown';
        const quantity = Number(item.totalQuantity || 0);
        map.set(key, (map.get(key) || 0) + quantity);
      });

    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [inventory]);

  const donationByType = useMemo(() => {
    const moneyCount = donations.filter((donation) => donation.type === 'MONEY').length;
    const stockCount = donations.filter((donation) => donation.type === 'STOCK').length;

    return [
      { name: 'Money Donations', value: moneyCount },
      { name: 'Stock Donations', value: stockCount }
    ].filter((entry) => entry.value > 0);
  }, [donations]);

  const donationByCategory = useMemo(() => {
    const inventoryCategoryById = new Map(
      inventory
        .filter((item) => item._id)
        .map((item) => [item._id, item.category || 'Unknown'])
    );

    const map = new Map();

    donations
      .filter((donation) => donation.type === 'STOCK')
      .forEach((donation) => {
        const key = donation.category
          || inventoryCategoryById.get(donation.inventoryId)
          || 'Unknown';

        const quantity = Number(donation.quantity || 0) || 1;
        map.set(key, (map.get(key) || 0) + quantity);
      });

    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [donations, inventory]);

  const renderEmptyState = (message) => (
    <div className="resource-chart__empty" style={{ minHeight: '170px' }}>
      <p>{message}</p>
    </div>
  );

  return (
    <div className="resource-chart-grid" style={{ gap: '0.75rem' }}>
      <article className="resource-chart-card" style={{ padding: '0.6rem' }}>
        <div className="resource-chart-card__header">
          <span className="section-label">Inventory Distribution</span>
          <h3 className="page-title">Stock by Category</h3>
        </div>
        <div className="resource-chart-card__body" style={{ minHeight: '180px' }}>
          {inventoryByCategory.length === 0 ? renderEmptyState('No inventory category data available.') : (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={inventoryByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Quantity" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>

      <article className="resource-chart-card" style={{ padding: '0.6rem' }}>
        <div className="resource-chart-card__header">
          <span className="section-label">Inventory Distribution</span>
          <h3 className="page-title">By Type</h3>
        </div>
        <div className="resource-chart-card__body" style={{ minHeight: '180px' }}>
          {inventoryByType.length === 0 ? renderEmptyState('No inventory type data available.') : (
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={inventoryByType} dataKey="value" nameKey="name" outerRadius={62} label>
                  {inventoryByType.map((entry, index) => (
                    <Cell key={`inventory-type-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>

      <article className="resource-chart-card" style={{ padding: '0.6rem' }}>
        <div className="resource-chart-card__header">
          <span className="section-label">Donation Distribution</span>
          <h3 className="page-title">Stock Donations by Category</h3>
        </div>
        <div className="resource-chart-card__body" style={{ minHeight: '180px' }}>
          {donationByCategory.length === 0 ? renderEmptyState('No stock donation category data available.') : (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={donationByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Donated Quantity" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>

      <article className="resource-chart-card" style={{ padding: '0.6rem' }}>
        <div className="resource-chart-card__header">
          <span className="section-label">Donation Distribution</span>
          <h3 className="page-title">By Type</h3>
        </div>
        <div className="resource-chart-card__body" style={{ minHeight: '180px' }}>
          {donationByType.length === 0 ? renderEmptyState('No donation type data available.') : (
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={donationByType} dataKey="value" nameKey="name" outerRadius={62} label>
                  {donationByType.map((entry, index) => (
                    <Cell key={`donation-type-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>
    </div>
  );
};

export default InventoryAnalyticsCharts;
