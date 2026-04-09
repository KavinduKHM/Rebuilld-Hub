import { Package, DollarSign, Edit2, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatCurrencyLKR } from "../../utils/formatters";

const statusConfig = {
  Available: {
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/30",
    icon: <CheckCircle size={12} />,
  },
  "Low Stock": {
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
    icon: <AlertTriangle size={12} />,
  },
  "Out of Stock": {
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
    icon: <XCircle size={12} />,
  },
  "Low Amount": {
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/30",
    icon: <AlertTriangle size={12} />,
  },
  "Not available": {
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/30",
    icon: <XCircle size={12} />,
  },
};

const categoryColors = {
  Food: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Cloth: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Sanitory: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

export default function ResourceList({ items, isAdmin, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Package size={28} className="text-gray-600" />
        </div>
        <p className="text-gray-400 font-medium">No inventory items found</p>
        <p className="text-gray-600 text-sm mt-1">
          {isAdmin ? "Add a new item to get started" : "Check back later"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const status = statusConfig[item.status] || statusConfig["Available"];
        const isStock = item.type === "STOCK";

        // Stock level percentage for progress bar
        let progressPct = 100;
        let progressColor = "bg-[#1976d2]";
        if (isStock) {
          if (item.totalQuantity === 0) { progressPct = 0; progressColor = "bg-red-500"; }
          else if (item.totalQuantity < 10) { progressPct = 15; progressColor = "bg-yellow-500"; }
          else if (item.totalQuantity < 50) { progressPct = 40; progressColor = "bg-yellow-400"; }
          else if (item.totalQuantity < 100) { progressPct = 65; progressColor = "bg-[#1976d2]"; }
          else { progressPct = 90; progressColor = "bg-green-500"; }
        }

        return (
          <div
            key={item._id}
            className="group flex items-center gap-4 bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/15 rounded-xl px-5 py-4 transition-all duration-200"
          >
            {/* Icon */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isStock ? "bg-[#1565c0]/20" : "bg-green-900/30"
              }`}
            >
              {isStock ? (
                <Package size={18} className="text-[#64b5f6]" />
              ) : (
                <DollarSign size={18} className="text-green-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-semibold text-sm truncate">{item.name}</span>
                {item.category && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${categoryColors[item.category] || "bg-white/10 text-gray-300 border-white/20"}`}>
                    {item.category}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-0.5 truncate font-mono">{item.inventoryCode}</p>

              {/* Progress bar for stock */}
              {isStock && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-32">
                    <div
                      className={`h-full rounded-full transition-all ${progressColor}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs whitespace-nowrap">
                    {item.totalQuantity} {item.unit}
                  </span>
                </div>
              )}

              {!isStock && (
                <p className="text-green-400 text-xs mt-1 font-semibold">
                  {formatCurrencyLKR(item.totalAmount || 0)}
                </p>
              )}
            </div>

            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold shrink-0 ${status.bg} ${status.color}`}>
              {status.icon}
              {item.status}
            </div>

            {/* Actions (admin only) */}
            {isAdmin && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 rounded-lg text-gray-400 hover:text-[#64b5f6] hover:bg-[#1565c0]/20 transition-all"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}