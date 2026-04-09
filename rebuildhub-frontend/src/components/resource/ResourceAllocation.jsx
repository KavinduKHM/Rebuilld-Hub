import { useState, useEffect } from "react";
import { X, Package, DollarSign, AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import resourceService from '../../services/resourceService';
import { formatCurrencyLKR } from "../../utils/formatters";

const initialForm = {
  donorName: "",
  donorNIC: "",
  email: "",
  inventoryId: "",
  type: "STOCK",
  name: "",
  description: "",
  quantity: "",
  unit: "",
  amount: "",
};

export default function ResourceAllocation({ open, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [step, setStep] = useState(1); // 1 = form, 2 = payment info

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setErrors({});
      setSuccess(null);
      setClientSecret(null);
      setStep(1);
      loadInventories();
    }
  }, [open]);

  const loadInventories = async () => {
    try {
      const data = await resourceService.getAllInventory();
      setInventories(data);
    } catch (error) {
      console.error('Error loading inventories:', error);
      setInventories([]);
    }
  };

  const filteredInventories = inventories.filter((inv) => inv.type === form.type);

  const validate = () => {
    const errs = {};
    if (!form.donorName.trim()) errs.donorName = "Full name is required";
    else if (form.donorName.trim().length < 3) errs.donorName = "Name must be at least 3 characters";

    if (!form.donorNIC.trim()) errs.donorNIC = "NIC number is required";
    else if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(form.donorNIC.trim()))
      errs.donorNIC = "Enter valid NIC (e.g. 123456789V or 200012345678)";

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";

    if (!form.inventoryId) errs.inventoryId = "Please select an inventory";
    if (!form.name.trim()) errs.name = "Donation item name is required";

    if (form.type === "STOCK") {
      if (!form.quantity || Number(form.quantity) <= 0)
        errs.quantity = "Quantity must be greater than 0";
      if (!form.unit.trim()) errs.unit = "Unit is required";
    }

    if (form.type === "MONEY") {
      if (!form.amount || Number(form.amount) <= 0)
        errs.amount = "Amount must be greater than 0";
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      setForm((p) => ({ ...p, type: value, inventoryId: "" }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        donorName: form.donorName.trim(),
        donorNIC: form.donorNIC.trim(),
        email: form.email.trim(),
        inventoryId: form.inventoryId,
        type: form.type,
        name: form.name.trim(),
        description: form.description.trim(),
      };

      if (form.type === "STOCK") {
        payload.quantity = Number(form.quantity);
        payload.unit = form.unit.trim();
      } else {
        payload.amount = Number(form.amount);
      }

      const result = await resourceService.createDonation(payload);

      if (form.type === "MONEY" && result.clientSecret) {
        setClientSecret(result.clientSecret);
        setStep(2);
      } else {
        setSuccess("Thank you! Your donation has been recorded successfully.");
      }
    } catch (err) {
      setErrors({ submit: err.message || "Failed to process donation" });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg mx-4 bg-[#0d1b2a] border border-[#1e3a5f] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f] bg-gradient-to-r from-[#0d1b2a] to-[#0a2540]">
          <div>
            <h2 className="text-white font-bold text-lg">Make a Donation</h2>
            <p className="text-[#64b5f6] text-xs mt-0.5">Support disaster relief efforts</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
          {/* Success */}
          {success && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Donation Successful!</h3>
              <p className="text-gray-400 text-sm">{success}</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1565c0] to-[#1976d2] text-white text-sm font-semibold"
              >
                Close
              </button>
            </div>
          )}

          {/* Payment Info Step */}
          {!success && step === 2 && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#1565c0]/30 flex items-center justify-center mb-4">
                <CreditCard size={28} className="text-[#64b5f6]" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Payment Initiated</h3>
              <p className="text-gray-400 text-sm mb-4">
                Your donation of <span className="text-white font-semibold">{formatCurrencyLKR(form.amount || 0)}</span> has been registered.
                Use the client secret below with Stripe to complete payment.
              </p>
              <div className="w-full bg-black/40 rounded-xl p-3 text-left border border-white/10 mb-4">
                <p className="text-xs text-gray-500 mb-1">Stripe Client Secret</p>
                <p className="text-[#64b5f6] text-xs font-mono break-all">{clientSecret}</p>
              </div>
              <p className="text-yellow-400 text-xs">
                ⚠ In production, integrate Stripe.js on this screen to complete the card payment.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1565c0] to-[#1976d2] text-white text-sm font-semibold"
              >
                Done
              </button>
            </div>
          )}

          {/* Donation Form */}
          {!success && step === 1 && (
            <div className="space-y-4">
              {/* Error banner */}
              {errors.submit && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-[#90caf9] mb-2 uppercase tracking-widest">
                  Donation Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["STOCK", "MONEY"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, type: t, inventoryId: "" }))}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border font-semibold text-sm transition-all ${
                        form.type === t
                          ? t === "STOCK"
                            ? "bg-[#1565c0] border-[#1976d2] text-white"
                            : "bg-[#1b5e20] border-[#2e7d32] text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {t === "STOCK" ? <Package size={15} /> : <DollarSign size={15} />}
                      {t === "STOCK" ? "Physical Items" : "Money"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Donor Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#90caf9] mb-1.5 uppercase tracking-widest">
                    Full Name *
                  </label>
                  <input
                    name="donorName"
                    value={form.donorName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.donorName ? "border-red-500 focus:ring-red-500/30" : "border-white/10 focus:ring-[#1976d2]/50 focus:border-[#1976d2]"
                    }`}
                  />
                  {errors.donorName && <p className="text-red-400 text-xs mt-1">{errors.donorName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#90caf9] mb-1.5 uppercase tracking-widest">
                    NIC Number *
                  </label>
                  <input
                    name="donorNIC"
                    value={form.donorNIC}
                    onChange={handleChange}
                    placeholder="e.g. 123456789V"
                    className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.donorNIC ? "border-red-500 focus:ring-red-500/30" : "border-white/10 focus:ring-[#1976d2]/50 focus:border-[#1976d2]"
                    }`}
                  />
                  {errors.donorNIC && <p className="text-red-400 text-xs mt-1">{errors.donorNIC}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#90caf9] mb-1.5 uppercase tracking-widest">
                  Email (Optional)
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? "border-red-500 focus:ring-red-500/30" : "border-white/10 focus:ring-[#1976d2]/50 focus:border-[#1976d2]"
                  }`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Inventory Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#90caf9] mb-1.5 uppercase tracking-widest">
                  Target Inventory *
                </label>
                <select
                  name="inventoryId"
                  value={form.inventoryId}
                  onChange={handleChange}
                  className={`w-full bg-[#0a1628] border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.inventoryId ? "border-red-500 focus:ring-red-500/30" : "border-white/10 focus:ring-[#1976d2]/50 focus:border-[#1976d2]"
                  }`}
                >
                  <option value="">Select inventory...</option>
                  {filteredInventories.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.name} ({inv.inventoryCode})
                    </option>
                  ))}
                </select>
                {errors.inventoryId && <p className="text-red-400 text-xs mt-1">{errors.inventoryId}</p>}
              </div>

              {/* Donation Item Name */}
              <div>
                <label className="block text-xs font-semibold text-[#90caf9] mb-1.5 uppercase tracking-widest">
                  Donation Item Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rice, Medical Supplies, Cash Aid"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? "border-red-500 focus:ring-red-500/30" : "border-white/10 focus:ring-[#1976d2]/50 focus:border-[#1976d2]"
                  }`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#90caf9] mb-1.5 uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Additional details about your donation..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976d2]/50 focus:border-[#1976d2] transition-all resize-none"
                />
              </div>

              {/* STOCK specific */}
              {form.type === "STOCK" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#90caf9] mb-1.5 uppercase tracking-widest">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={form.quantity}
                      onChange={handleChange}
                      className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.quantity ? "border-red-500 focus:ring-red-500/30" : "border-white/10 focus:ring-[#1976d2]/50 focus:border-[#1976d2]"
                      }`}
                    />
                    {errors.quantity && <p className="text-red-400 text-xs mt-1">{errors.quantity}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#90caf9] mb-1.5 uppercase tracking-widest">
                      Unit *
                    </label>
                    <input
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                      placeholder="kg, L, pcs..."
                      className={`w-full bg-white/5 border rounded-xl px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.unit ? "border-red-500 focus:ring-red-500/30" : "border-white/10 focus:ring-[#1976d2]/50 focus:border-[#1976d2]"
                      }`}
                    />
                    {errors.unit && <p className="text-red-400 text-xs mt-1">{errors.unit}</p>}
                  </div>
                </div>
              )}

              {/* MONEY specific */}
              {form.type === "MONEY" && (
                <div>
                  <label className="block text-xs font-semibold text-[#90caf9] mb-1.5 uppercase tracking-widest">
                    Amount (LKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64b5f6] font-bold text-sm">Rs</span>
                    <input
                      type="number"
                      name="amount"
                      min="100"
                      step="100"
                      value={form.amount}
                      onChange={handleChange}
                      className={`w-full bg-white/5 border rounded-xl pl-12 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.amount ? "border-red-500 focus:ring-red-500/30" : "border-white/10 focus:ring-[#1976d2]/50 focus:border-[#1976d2]"
                      }`}
                    />
                  </div>
                  {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && step === 1 && (
          <div className="px-6 py-4 border-t border-[#1e3a5f] flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1565c0] to-[#1976d2] text-white text-sm font-semibold hover:from-[#1976d2] hover:to-[#1e88e5] transition-all disabled:opacity-50 shadow-lg shadow-blue-900/30"
            >
              {loading ? "Processing..." : form.type === "MONEY" ? "Donate & Pay" : "Submit Donation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}