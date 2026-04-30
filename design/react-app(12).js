import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  fontFamily: "'Poppins', sans-serif",
};

const subscriptions = [
  {
    id: 1,
    name: 'YouTube Premium',
    plan: 'Student Plan',
    price: '$6.99',
    date: 'Oct 12',
    urgent: true,
    iconClass: 'ph-fill ph-youtube-logo',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  {
    id: 2,
    name: 'Spotify',
    plan: 'Premium Duo',
    price: '$14.99',
    date: 'Oct 15',
    urgent: false,
    iconClass: 'ph-fill ph-spotify-logo',
    iconBg: 'bg-[#E8F8F0]',
    iconColor: 'text-[#10B981]',
  },
  {
    id: 3,
    name: 'Adobe Creative Cloud',
    plan: 'Student & Teacher',
    price: '$19.99',
    date: 'Oct 22',
    urgent: false,
    iconClass: 'ph-fill ph-pen-nib',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    id: 4,
    name: 'Figma',
    plan: 'Professional Plan',
    price: '$12.00',
    date: 'Oct 28',
    urgent: false,
    iconClass: 'ph-fill ph-figma-logo',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-800',
  },
  {
    id: 5,
    name: 'Anytime Fitness',
    plan: 'Monthly Membership',
    price: '$74.98',
    date: 'Nov 01',
    urgent: false,
    iconClass: 'ph-fill ph-barbell',
    iconBg: 'bg-[#F4F0FF]',
    iconColor: 'text-[#7B42FF]',
  },
];

const SubscriptionCard = ({ sub }) => (
  <div className="flex items-center p-4 bg-white rounded-[24px] border border-transparent shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer group">
    <div className={`w-12 h-12 rounded-full ${sub.iconBg} flex items-center justify-center ${sub.iconColor} mr-4 shrink-0`}>
      <i className={`${sub.iconClass} text-[26px]`}></i>
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-slate-900 text-base truncate">{sub.name}</h3>
      <p className="text-sm text-slate-500 font-medium truncate mt-0.5">{sub.plan}</p>
    </div>
    <div className="hidden sm:flex flex-col items-end mr-6">
      {sub.urgent ? (
        <span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-[10px] font-bold uppercase tracking-wider rounded">{sub.date}</span>
      ) : (
        <span className="text-slate-400 text-xs font-medium">{sub.date}</span>
      )}
    </div>
    <div className="text-right pl-2 border-l border-slate-100 sm:border-none md:min-w-[80px] flex flex-col items-end">
      <p className="font-bold text-slate-900 text-base">{sub.price}</p>
      {sub.urgent ? (
        <p className="inline-block px-2 py-0.5 bg-pink-100 text-pink-600 text-[10px] font-bold uppercase tracking-wider rounded sm:hidden mt-1">{sub.date}</p>
      ) : (
        <p className="text-slate-400 text-xs font-medium sm:hidden mt-1">{sub.date}</p>
      )}
    </div>
  </div>
);

const Sidebar = ({ onAddNew }) => (
  <aside className="hidden md:flex w-64 lg:w-72 bg-white border-r border-slate-100 flex-col p-6 lg:p-8 shrink-0 z-20">
    <div className="flex items-center gap-3 mb-12">
      <div className="w-10 h-10 bg-[#7B42FF] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#7B42FF]/20 shrink-0">
        <i className="ph-bold ph-squares-four text-xl"></i>
      </div>
      <span className="font-bold text-xl tracking-tight text-slate-800">SubTrack</span>
    </div>

    <nav className="flex flex-col gap-2 flex-1">
      <a href="#" className="flex items-center gap-3 px-4 py-3.5 bg-[#F4F0FF] rounded-2xl text-[#7B42FF] font-bold transition-all">
        <i className="ph-fill ph-house text-xl text-[#7B42FF]"></i>
        <span>Dashboard</span>
      </a>
      <a href="#" className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-2xl transition-all font-medium">
        <i className="ph ph-list-dashes text-xl"></i>
        <span>Subscriptions</span>
      </a>
      <a href="#" className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-2xl transition-all font-medium">
        <i className="ph ph-chart-pie-slice text-xl"></i>
        <span>Analytics</span>
      </a>
      <a href="#" className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-2xl transition-all font-medium">
        <i className="ph ph-wallet text-xl"></i>
        <span>Payment Methods</span>
      </a>
    </nav>

    <div className="mt-auto flex flex-col gap-6">
      <div className="p-5 rounded-[24px] bg-[#7B42FF] text-white relative overflow-hidden shadow-lg shadow-[#7B42FF]/20">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <i className="ph-fill ph-sparkle text-white text-sm"></i>
            </div>
            <span className="font-bold text-sm text-white">Upgrade to Pro</span>
          </div>
          <p className="text-[11px] text-white/80 font-medium leading-relaxed">
            Unlock advanced analytics &amp; alerts.
          </p>
          <button className="w-full mt-1 bg-white text-[#7B42FF] font-bold py-2 px-4 rounded-xl text-xs hover:bg-slate-50 active:scale-[0.98] transition-all">
            Learn More
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddNew}
        className="w-full bg-slate-900 text-white font-bold py-3.5 px-4 rounded-2xl hover:bg-slate-800 hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <i className="ph-bold ph-plus text-lg"></i>
        Add New
      </button>

      <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
        <div className="w-10 h-10 rounded-full bg-[#F4F0FF] text-[#7B42FF] font-bold flex items-center justify-center shrink-0">
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">Alex Student</p>
          <p className="text-xs text-slate-400 font-medium truncate">alex@university.edu</p>
        </div>
      </div>
    </div>
  </aside>
);

const MobileHeader = ({ showNotification }) => (
  <header className="md:hidden flex items-center justify-between px-5 pt-6 pb-2 bg-[#7B42FF] text-white sticky top-0 z-30">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white text-[#7B42FF] font-bold flex items-center justify-center shrink-0 shadow-sm">
        A
      </div>
      <div>
        <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Good Morning,</p>
        <p className="text-base font-bold text-white">Alex Student</p>
      </div>
    </div>
    <button
      onClick={showNotification}
      className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/10 text-white transition-colors relative"
    >
      <i className="ph ph-bell text-lg"></i>
      <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-400 rounded-full border-2 border-[#7B42FF]"></span>
    </button>
  </header>
);

const DesktopHeader = ({ searchValue, onSearchChange, showNotification }) => (
  <div className="hidden md:flex justify-between items-end mb-8">
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-1">Overview</h1>
      <p className="text-slate-500 font-medium text-sm">Track and manage your recurring expenses.</p>
    </div>
    <div className="flex items-center gap-4">
      <div className="relative">
        <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input
          type="text"
          placeholder="Search subscriptions..."
          value={searchValue}
          onChange={onSearchChange}
          className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B42FF]/20 focus:border-[#7B42FF] w-64 transition-all shadow-sm"
        />
      </div>
      <button
        onClick={showNotification}
        className="w-11 h-11 bg-white hover:bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 text-slate-600 shadow-sm transition-colors relative"
      >
        <i className="ph ph-bell text-xl"></i>
        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-pink-400 rounded-full border-2 border-white"></span>
      </button>
    </div>
  </div>
);

const StatsCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
    <div className="md:col-span-2 bg-[#7B42FF] text-white relative overflow-hidden flex flex-col justify-center min-h-[180px] md:rounded-[32px] md:shadow-lg md:shadow-[#7B42FF]/20 -mx-5 px-5 -mt-6 pt-6 pb-20 rounded-b-[40px] md:mx-0 md:mt-0 md:pt-8 md:pb-8 shadow-none mb-4 md:mb-0">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-center mb-2 relative">
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-sm font-medium tracking-wide">Monthly Total</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className="text-[56px] leading-none font-bold tracking-tight text-white">$142</span>
            <span className="text-[56px] leading-none font-bold tracking-tight text-white">.95</span>
          </div>
          <p className="text-sm font-medium text-white/70 mt-2 text-center">Due next 7 days: $26.98</p>
        </div>
      </div>
    </div>

    <div className="relative z-10 bg-[#7B42FF] md:bg-[#7B42FF] rounded-full md:rounded-[28px] p-3 md:p-6 flex flex-row md:flex-col items-center md:items-start justify-center md:justify-between min-h-[40px] md:min-h-[160px] shadow-sm max-w-xs mx-auto -mt-14 mb-8 md:mt-0 md:mb-0 md:max-w-none md:mx-0 w-max md:w-auto">
      <div className="flex items-center md:mb-4 mr-2 md:mr-0">
        <div className="w-6 h-6 md:w-10 md:h-10 rounded-md md:rounded-2xl bg-white/20 flex items-center justify-center text-white">
          <i className="ph-fill ph-calendar-blank text-xs md:text-xl"></i>
        </div>
      </div>
      <div className="flex flex-row md:flex-col items-baseline md:items-start gap-1 md:gap-0">
        <p className="text-[10px] md:text-xs text-white/80 font-medium md:font-bold md:uppercase md:tracking-wider md:mb-1.5">Estimated Yearly</p>
        <div className="flex items-baseline gap-0.5 md:gap-1">
          <span className="text-sm md:text-3xl font-bold text-white">$1,715</span>
          <span className="text-[10px] md:text-sm font-bold text-white/80">.40</span>
        </div>
      </div>
    </div>

    <div className="flex flex-row md:flex-col gap-4 min-h-[160px]">
      <div className="flex-1 bg-white rounded-[24px] md:rounded-[28px] p-4 md:p-6 shadow-sm border border-transparent flex flex-col justify-center relative overflow-hidden transition-all hover:scale-[1.01]">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-transparent rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-end gap-3 w-full flex-row-reverse md:flex-row md:justify-between">
          <div className="flex flex-col items-start text-left">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Active</p>
            <p className="text-2xl font-bold text-slate-800">8</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#12B76A] shrink-0">
            <i className="ph-fill ph-check-circle text-2xl"></i>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[24px] md:rounded-[28px] p-4 md:p-6 shadow-sm border border-transparent flex flex-col justify-center relative overflow-hidden transition-all hover:scale-[1.01]">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-transparent rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-end gap-3 w-full flex-row-reverse md:flex-row md:justify-between">
          <div className="flex flex-col items-start text-left">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Archived</p>
            <p className="text-2xl font-bold text-slate-800">3</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] shrink-0">
            <i className="ph-fill ph-archive-box text-2xl"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AddNewModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', plan: '', price: '', date: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', plan: '', price: '', date: '' });
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Add New Subscription</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <i className="ph ph-x text-lg"></i>
          </button>
        </div>
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-16 h-16 rounded-full bg-[#E8F5EE] flex items-center justify-center text-[#12B76A]">
              <i className="ph-fill ph-check-circle text-4xl"></i>
            </div>
            <p className="font-bold text-slate-800 text-lg">Added Successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Service Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Netflix"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B42FF]/20 focus:border-[#7B42FF] transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Plan</label>
              <input
                type="text"
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                placeholder="e.g. Basic Plan"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B42FF]/20 focus:border-[#7B42FF] transition-all"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Price / Month</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B42FF]/20 focus:border-[#7B42FF] transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Next Renewal</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7B42FF]/20 focus:border-[#7B42FF] transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-2 bg-[#7B42FF] text-white font-bold py-3.5 px-4 rounded-2xl hover:bg-[#6A35E0] hover:shadow-lg hover:shadow-[#7B42FF]/20 active:scale-[0.98] transition-all"
            >
              Add Subscription
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const NotificationToast = ({ show }) => {
  if (!show) return null;
  return (
    <div className="fixed top-6 right-6 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-center gap-3 animate-bounce">
      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
        <i className="ph-fill ph-bell text-xl"></i>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">No new notifications</p>
        <p className="text-xs text-slate-400 font-medium">You're all caught up!</p>
      </div>
    </div>
  );
};

const MobileBottomNav = ({ onAddNew }) => (
  <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white pt-2 px-6 flex justify-between items-center z-50 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}>
    <a href="#" className="flex flex-col items-center gap-1 p-2 min-w-[56px] text-[#7B42FF]">
      <i className="ph-fill ph-house text-[26px]"></i>
      <span className="text-[10px] font-bold tracking-wide mt-0.5 text-[#7B42FF]">Home</span>
    </a>
    <a href="#" className="flex flex-col items-center gap-1 p-2 min-w-[56px] text-slate-400 hover:text-slate-600 transition-colors">
      <i className="ph ph-squares-four text-[26px]"></i>
      <span className="text-[10px] font-medium tracking-wide mt-0.5">Subs</span>
    </a>
    <div className="relative -top-6 px-2">
      <button
        onClick={onAddNew}
        className="w-14 h-14 bg-[#7B42FF] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#7B42FF]/30 border-[6px] border-[#F7F8FA] hover:scale-105 active:scale-95 transition-all"
      >
        <i className="ph-bold ph-plus text-2xl"></i>
      </button>
    </div>
    <a href="#" className="flex flex-col items-center gap-1 p-2 min-w-[56px] text-slate-400 hover:text-slate-600 transition-colors">
      <i className="ph ph-chart-pie-slice text-[26px]"></i>
      <span className="text-[10px] font-medium tracking-wide mt-0.5">Stats</span>
    </a>
    <a href="#" className="flex flex-col items-center gap-1 p-2 min-w-[56px] text-slate-400 hover:text-slate-600 transition-colors">
      <i className="ph ph-user text-[26px]"></i>
      <span className="text-[10px] font-medium tracking-wide mt-0.5">Profile</span>
    </a>
  </nav>
);

const DashboardPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleNotification = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2500);
  };

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      sub.plan.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <>
      <NotificationToast show={showNotification} />
      <AddNewModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      <div className="flex-1 w-full h-full bg-[#F7F8FA] md:bg-[#F7F8FA] md:rounded-[40px] shadow-sm flex flex-col md:flex-row overflow-hidden relative border-0 md:border md:border-slate-200">
        <Sidebar onAddNew={() => setIsAddModalOpen(true)} />

        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F7F8FA] z-10">
          <MobileHeader showNotification={handleNotification} />

          <div className="flex-1 overflow-y-auto w-full px-5 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10 pb-32 md:pb-10">
            <DesktopHeader
              searchValue={searchValue}
              onSearchChange={(e) => setSearchValue(e.target.value)}
              showNotification={handleNotification}
            />

            <StatsCards />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-5 rounded-[24px] border border-transparent shadow-sm mb-8 md:hidden">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 bg-[#F4F0FF] rounded-2xl flex items-center justify-center text-[#7B42FF] shrink-0">
                  <i className="ph-fill ph-sparkle text-2xl"></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Discover Student Plans</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Find discounts on essentials.</p>
                </div>
              </div>
              <button className="w-full sm:w-auto bg-[#7B42FF] text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-[#6A35E0] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-[#7B42FF]/20">
                Explore
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-5 px-1">
                <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
                  Upcoming Renewals
                </h2>
                <button className="text-[13px] font-bold text-[#7B42FF] bg-[#F4F0FF] px-3.5 py-1.5 rounded-lg hover:bg-[#EAE0FF] transition-colors flex items-center gap-1">
                  View All
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {filteredSubscriptions.length > 0 ? (
                  filteredSubscriptions.map((sub) => (
                    <SubscriptionCard key={sub.id} sub={sub} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <i className="ph ph-magnifying-glass text-4xl mb-3"></i>
                    <p className="font-medium text-sm">No subscriptions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav onAddNew={() => setIsAddModalOpen(true)} />
    </>
  );
};

const App = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const iconScript = document.createElement('script');
    iconScript.src = 'https://unpkg.com/@phosphor-icons/web';
    document.head.appendChild(iconScript);

    const style = document.createElement('style');
    style.textContent = `
      body { font-family: 'Poppins', sans-serif; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Router basename="/">
      <div
        className="w-full h-screen text-slate-900 antialiased flex flex-col bg-[#F7F8FA] p-0 md:p-4 lg:p-6 overflow-hidden"
        style={customStyles}
      >
        <Routes>
          <Route path="/" element={<DashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;