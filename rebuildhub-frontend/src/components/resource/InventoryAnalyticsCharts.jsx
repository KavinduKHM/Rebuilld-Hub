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

  const emptyState = (
    <div className="resource-chart__empty">
      <p>No chart data available yet.</p>
    </div>
  );

  return (
    <div className="resource-chart-grid">
      <article className="resource-chart-card">
        <div className="resource-chart-card__header">
          <span className="section-label">Inventory Distribution</span>
          <h3 className="page-title">By Category (Stock)</h3>
        </div>
        <div className="resource-chart-card__body">
          {inventoryByCategory.length === 0 ? emptyState : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={inventoryByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Quantity" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>

      <article className="resource-chart-card">
        <div className="resource-chart-card__header">
          <span className="section-label">Inventory Distribution</span>
          <h3 className="page-title">By Type</h3>
        </div>
        <div className="resource-chart-card__body">
          {inventoryByType.length === 0 ? emptyState : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={inventoryByType} dataKey="value" nameKey="name" outerRadius={88} label>
                  {inventoryByType.map((entry, index) => (
                    <Cell key={`inventory-type-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>

      <article className="resource-chart-card">
        <div className="resource-chart-card__header">
          <span className="section-label">Donation Distribution</span>
          <h3 className="page-title">By Category (Stock Donations)</h3>
        </div>
        <div className="resource-chart-card__body">
          {donationByCategory.length === 0 ? emptyState : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={donationByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Donated Quantity" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>

      <article className="resource-chart-card">
        <div className="resource-chart-card__header">
          <span className="section-label">Donation Distribution</span>
          <h3 className="page-title">By Type</h3>
        </div>
        <div className="resource-chart-card__body">
          {donationByType.length === 0 ? emptyState : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={donationByType} dataKey="value" nameKey="name" outerRadius={88} label>
                  {donationByType.map((entry, index) => (
                    <Cell key={`donation-type-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>
    </div>
  );
};

export default InventoryAnalyticsCharts;
