import React, { useState } from 'react';

const initialSubscriptions = [
  {
    id: 1,
    name: 'Netflix',
    category: 'Entertainment',
    price: '19.99',
    status: 'Active',
    renewalLabel: 'Renews Tomorrow',
    renewalColor: 'bg-red-500',
    renewalShadow: 'shadow-[0_0_0_2px_rgba(239,68,68,0.2)]',
    icon: 'ph-film-strip',
    billingCycle: 'Monthly',
    renewalDate: '2024-11-01',
    paymentMethod: 'Visa •••• 4242',
    description: '',
    isActive: true,
  },
  {
    id: 2,
    name: 'Adobe CC',
    category: 'Software',
    price: '54.99',
    status: 'Active',
    renewalLabel: 'Renews in 12 days',
    renewalColor: 'bg-amber-400',
    renewalShadow: 'shadow-[0_0_0_2px_rgba(251,191,36,0.2)]',
    icon: 'ph-pen-nib',
    billingCycle: 'Monthly',
    renewalDate: '2024-11-15',
    paymentMethod: 'Visa •••• 4242',
    description: 'Creative Cloud all apps plan.',
    isActive: true,
  },
  {
    id: 3,
    name: 'Spotify',
    category: 'Entertainment',
    price: '10.99',
    status: 'Active',
    renewalLabel: 'Renews in 24 days',
    renewalColor: 'bg-emerald-500',
    renewalShadow: 'shadow-[0_0_0_2px_rgba(16,185,129,0.2)]',
    icon: 'ph-music-notes',
    billingCycle: 'Monthly',
    renewalDate: '2024-11-25',
    paymentMethod: 'MC •••• 5555',
    description: '',
    isActive: true,
  },
  {
    id: 4,
    name: 'Equinox',
    category: 'Fitness',
    price: '180.00',
    status: 'Paused',
    renewalLabel: 'Billing suspended',
    renewalColor: 'bg-slate-300',
    renewalShadow: '',
    icon: 'ph-barbell',
    billingCycle: 'Monthly',
    renewalDate: '2024-12-01',
    paymentMethod: 'Visa •••• 4242',
    description: '',
    isActive: false,
  },
];

const categoryOptions = ['Entertainment', 'Software', 'Fitness', 'Utilities'];
const billingCycleOptions = ['Monthly', 'Quarterly', 'Yearly'];
const paymentMethodOptions = ['Visa •••• 4242', 'MC •••• 5555', 'PayPal'];

const defaultNewSub = {
  name: '',
  category: 'Entertainment',
  price: '',
  status: 'Active',
  renewalLabel: 'Renews in 30 days',
  renewalColor: 'bg-emerald-500',
  renewalShadow: 'shadow-[0_0_0_2px_rgba(16,185,129,0.2)]',
  icon: 'ph-star',
  billingCycle: 'Monthly',
  renewalDate: '',
  paymentMethod: 'Visa •••• 4242',
  description: '',
  isActive: true,
};

const StatusBadge = ({ status }) => {
  if (status === 'Active') {
    return (
      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide rounded border border-emerald-200/60 leading-none">
        Active
      </span>
    );
  }
  if (status === 'Paused') {
    return (
      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wide rounded border border-amber-200/60 leading-none">
        Paused
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide rounded border border-slate-200/60 leading-none">
      Archived
    </span>
  );
};

const SubscriptionCard = ({ sub, onEdit, onArchive }) => {
  const isArchived = sub.status === 'Archived';
  const isPaused = sub.status === 'Paused';

  return (
    <div className="bg-white rounded-[20px] p-4 border border-slate-200 shadow-sm flex flex-col gap-3.5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <i
              className={`ph-fill ${sub.icon} ${isArchived || isPaused ? 'text-slate-400' : 'text-slate-700'} text-2xl`}
            ></i>
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-900 text-[15px] leading-tight">{sub.name}</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5">{sub.category}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <p className={`font-bold text-[15px] leading-tight ${isArchived || isPaused ? 'text-slate-400' : 'text-slate-900'}`}>
            ${sub.price}
          </p>
          <StatusBadge status={sub.status} />
        </div>
      </div>

      <div className="h-px bg-slate-100 w-full"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
          {sub.renewalColor !== 'bg-slate-300' ? (
            <div className={`w-2 h-2 rounded-full ${sub.renewalColor} ${sub.renewalShadow}`}></div>
          ) : (
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
          )}
          <span className={`text-[12px] font-semibold ${isArchived || isPaused ? 'text-slate-500 font-medium' : 'text-slate-700'}`}>
            {sub.renewalLabel}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(sub)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors active:scale-95"
          >
            <i className="ph ph-pencil-simple text-[15px]"></i>
          </button>
          <button
            onClick={() => onArchive(sub.id)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-red-600 transition-colors active:scale-95"
          >
            <i className="ph ph-archive text-[15px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const EditModal = ({ sub, onClose, onSave }) => {
  const [form, setForm] = useState({ ...sub });
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleActive = () => {
    const newIsActive = !form.isActive;
    setForm((prev) => ({
      ...prev,
      isActive: newIsActive,
      status: newIsActive ? 'Active' : 'Paused',
    }));
  };

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 flex flex-col justify-end">
      <div className="bg-white w-full rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh]">
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 rounded-t-[32px] z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Subscription</h2>
            <p className="text-xs text-slate-500 font-medium">Update {form.name} details</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <i className="ph-bold ph-x text-sm"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 bg-white">
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200/60 rounded-[14px] p-3 flex items-start gap-3">
              <i className="ph-fill ph-check-circle text-emerald-600 text-[20px] mt-0.5 shrink-0"></i>
              <div>
                <p className="text-[13px] font-bold text-emerald-800">Changes saved successfully</p>
                <p className="text-[12px] text-emerald-600 font-medium mt-0.5">
                  Your subscription details have been updated.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-[3]">
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Spotify"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
              />
            </div>
            <div className="flex-[2]">
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 text-[14px] font-medium">$</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Category
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer appearance-none"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
                <i className="ph ph-caret-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Billing Cycle
              </label>
              <div className="relative">
                <select
                  value={form.billingCycle}
                  onChange={(e) => handleChange('billingCycle', e.target.value)}
                  className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer appearance-none"
                >
                  {billingCycleOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
                <i className="ph ph-caret-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Renewal Date
              </label>
              <input
                type="date"
                value={form.renewalDate}
                onChange={(e) => handleChange('renewalDate', e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Payment Method
              </label>
              <div className="relative">
                <select
                  value={form.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer appearance-none"
                >
                  {paymentMethodOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
                <i className="ph ph-caret-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 mt-1">
            <div>
              <span className="block text-[14px] font-bold text-slate-900">Active Status</span>
              <span className="block text-[12px] font-medium text-slate-500 mt-0.5">
                Pause to stop tracking this cost
              </span>
            </div>
            <button
              onClick={handleToggleActive}
              className={`w-12 h-7 rounded-full relative transition-colors shadow-inner flex items-center ${form.isActive ? 'bg-[#7B42FF] pl-0.5' : 'bg-slate-300 pl-0.5'}`}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`}
              ></span>
            </button>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Description{' '}
              <span className="text-slate-400 normal-case font-medium">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add notes, e.g. shared with family..."
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-slate-100 bg-white flex gap-3 pb-8">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 border border-slate-200 rounded-[14px] text-slate-700 font-bold text-[15px] hover:bg-slate-50 transition-colors active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-[1.5] py-3.5 px-4 bg-[#7B42FF] border border-[#7B42FF] rounded-[14px] text-white font-bold text-[15px] hover:bg-[#6B32EF] transition-colors shadow-[0_4px_12px_rgba(123,66,255,0.25)] active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const AddModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ ...defaultNewSub, id: Date.now() });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleToggleActive = () => {
    const newIsActive = !form.isActive;
    setForm((prev) => ({
      ...prev,
      isActive: newIsActive,
      status: newIsActive ? 'Active' : 'Paused',
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.price || isNaN(parseFloat(form.price))) newErrors.price = 'Valid price required';
    return newErrors;
  };

  const handleAdd = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const newSub = {
      ...form,
      id: Date.now(),
      renewalLabel: form.isActive ? 'Renews in 30 days' : 'Billing suspended',
      renewalColor: form.isActive ? 'bg-emerald-500' : 'bg-slate-300',
      renewalShadow: form.isActive ? 'shadow-[0_0_0_2px_rgba(16,185,129,0.2)]' : '',
    };
    onAdd(newSub);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 flex flex-col justify-end">
      <div className="bg-white w-full rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh]">
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 rounded-t-[32px] z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add Subscription</h2>
            <p className="text-xs text-slate-500 font-medium">Enter your new subscription details</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <i className="ph-bold ph-x text-sm"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 bg-white">
          <div className="flex gap-4">
            <div className="flex-[3]">
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Spotify"
                className={`w-full px-3.5 py-3 bg-slate-50 border rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
            </div>
            <div className="flex-[2]">
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400 text-[14px] font-medium">$</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-7 pr-3 py-3 bg-slate-50 border rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all ${errors.price ? 'border-red-400' : 'border-slate-200'}`}
                />
              </div>
              {errors.price && <p className="text-red-500 text-[11px] mt-1">{errors.price}</p>}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Category
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer appearance-none"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
                <i className="ph ph-caret-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Billing Cycle
              </label>
              <div className="relative">
                <select
                  value={form.billingCycle}
                  onChange={(e) => handleChange('billingCycle', e.target.value)}
                  className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer appearance-none"
                >
                  {billingCycleOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
                <i className="ph ph-caret-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Renewal Date
              </label>
              <input
                type="date"
                value={form.renewalDate}
                onChange={(e) => handleChange('renewalDate', e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Payment Method
              </label>
              <div className="relative">
                <select
                  value={form.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer appearance-none"
                >
                  {paymentMethodOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
                <i className="ph ph-caret-down absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 mt-1">
            <div>
              <span className="block text-[14px] font-bold text-slate-900">Active Status</span>
              <span className="block text-[12px] font-medium text-slate-500 mt-0.5">
                Pause to stop tracking this cost
              </span>
            </div>
            <button
              onClick={handleToggleActive}
              className={`w-12 h-7 rounded-full relative transition-colors shadow-inner flex items-center ${form.isActive ? 'bg-[#7B42FF] pl-0.5' : 'bg-slate-300 pl-0.5'}`}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`}
              ></span>
            </button>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Description{' '}
              <span className="text-slate-400 normal-case font-medium">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add notes, e.g. shared with family..."
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-slate-100 bg-white flex gap-3 pb-8">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 border border-slate-200 rounded-[14px] text-slate-700 font-bold text-[15px] hover:bg-slate-50 transition-colors active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-[1.5] py-3.5 px-4 bg-[#7B42FF] border border-[#7B42FF] rounded-[14px] text-white font-bold text-[15px] hover:bg-[#6B32EF] transition-colors shadow-[0_4px_12px_rgba(123,66,255,0.25)] active:scale-95"
          >
            Add Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSub, setEditingSub] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filters = ['All', 'Active', 'Paused', 'Archived'];

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesFilter = activeFilter === 'All' || sub.status === activeFilter;
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleArchive = (id) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              status: sub.status === 'Archived' ? 'Active' : 'Archived',
              renewalLabel: sub.status === 'Archived' ? 'Renews in 30 days' : 'Archived',
              isActive: sub.status === 'Archived',
            }
          : sub
      )
    );
  };

  const handleSaveEdit = (updatedSub) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.id === updatedSub.id ? { ...sub, ...updatedSub } : sub))
    );
    setEditingSub(updatedSub);
  };

  const handleAddSubscription = (newSub) => {
    setSubscriptions((prev) => [...prev, newSub]);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent; background-color: #F8FAFC; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
      `}</style>

      <div className="w-full min-h-screen text-slate-900 antialiased relative overflow-x-hidden bg-[#F8FAFC]">
        <main className="w-full h-full flex flex-col pb-8">
          <header className="px-5 pt-12 pb-4 bg-white sticky top-0 z-10 border-b border-slate-100 flex items-center justify-between shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Subscriptions</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage your recurring costs</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 bg-[#7B42FF] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#6B32EF] transition-colors active:scale-95"
            >
              <i className="ph-bold ph-plus text-lg"></i>
            </button>
          </header>

          <section className="px-5 py-4 bg-white border-b border-slate-100">
            <div className="relative">
              <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subscriptions..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-slate-400 focus:bg-white placeholder:text-slate-400 transition-all"
              />
            </div>

            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === filter
                      ? 'bg-[#7B42FF] text-white border border-[#7B42FF] shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </section>

          <section className="px-5 pt-5 pb-32 flex flex-col gap-4">
            {filteredSubs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                  <i className="ph ph-receipt text-slate-400 text-2xl"></i>
                </div>
                <p className="text-slate-600 font-semibold text-[15px]">No subscriptions found</p>
                <p className="text-slate-400 text-[13px] mt-1">Try adjusting your search or filter</p>
              </div>
            ) : (
              filteredSubs.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  sub={sub}
                  onEdit={setEditingSub}
                  onArchive={handleArchive}
                />
              ))
            )}
          </section>
        </main>

        {editingSub && (
          <EditModal
            sub={editingSub}
            onClose={() => setEditingSub(null)}
            onSave={handleSaveEdit}
          />
        )}

        {showAddModal && (
          <AddModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddSubscription}
          />
        )}
      </div>
    </>
  );
};

export default App;