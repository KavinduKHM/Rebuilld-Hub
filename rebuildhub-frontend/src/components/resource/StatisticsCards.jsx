import React from 'react';
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown,
  Box
} from 'lucide-react';

const StatisticsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Inventory Items',
      value: stats?.totalItems || 0,
      icon: Package,
      color: 'bg-blue-500',
      bgGradient: 'from-blue-500 to-blue-600',
      valueColor: 'text-blue-600'
    },
    {
      title: 'Total Stock Quantity',
      value: stats?.totalStockValue || 0,
      icon: Box,
      color: 'bg-green-500',
      bgGradient: 'from-green-500 to-green-600',
      valueColor: 'text-green-600',
      suffix: ' units'
    },
    {
      title: 'Total Funds Available',
      value: `$${(stats?.totalMoneyAmount || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgGradient: 'from-emerald-500 to-emerald-600',
      valueColor: 'text-emerald-600'
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'bg-amber-500',
      bgGradient: 'from-amber-500 to-amber-600',
      valueColor: 'text-amber-600'
    },
    {
      title: 'Out of Stock',
      value: stats?.outOfStockCount || 0,
      icon: TrendingDown,
      color: 'bg-red-500',
      bgGradient: 'from-red-500 to-red-600',
      valueColor: 'text-red-600'
    },
    {
      title: 'Available Items',
      value: stats?.availableCount || 0,
      icon: CheckCircle,
      color: 'bg-teal-500',
      bgGradient: 'from-teal-500 to-teal-600',
      valueColor: 'text-teal-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                    {card.title}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${card.valueColor}`}>
                    {card.value}
                    {card.suffix && <span className="text-sm font-normal text-gray-400 ml-1">{card.suffix}</span>}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-full bg-opacity-10`}>
                  <Icon className={`h-6 w-6 ${card.valueColor}`} />
                </div>
              </div>
            </div>
            <div className={`h-1 bg-gradient-to-r ${card.bgGradient}`}></div>
          </div>
        );
      })}
    </div>
  );
};

export default StatisticsCards;