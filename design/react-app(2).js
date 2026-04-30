import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  gradientBg: {
    background: 'linear-gradient(145deg, #6C51FF 0%, #9542FF 100%)',
  },
  bodyBefore: {
    content: "''",
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '360px',
    background: 'linear-gradient(145deg, #6C51FF 0%, #9542FF 100%)',
    borderBottomLeftRadius: '48px',
    borderBottomRightRadius: '48px',
    zIndex: -1,
  }
};

const subscriptions = [
  {
    id: 1,
    name: 'Netflix',
    plan: 'Premium Plan',
    amount: '$19.99',
    dueLabel: 'Tomorrow',
    dueLabelStyle: 'urgent',
    iconClass: 'ph-fill ph-film-strip',
    iconColor: 'text-rose-500',
    bgColor: 'bg-rose-50',
  },
  {
    id: 2,
    name: 'Spotify',
    plan: 'Student Plan',
    amount: '$5.99',
    dueLabel: 'In 3 days',
    dueLabelStyle: 'normal',
    iconClass: 'ph-fill ph-music-notes',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    id: 3,
    name: 'Adobe CC',
    plan: 'All Apps',
    amount: '$19.99',
    dueLabel: 'In 12 days',
    dueLabelStyle: 'normal',
    iconClass: 'ph-fill ph-pen-nib',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    id: 4,
    name: 'Figma',
    plan: 'Professional',
    amount: '$12.00',
    dueLabel: 'In 15 days',
    dueLabelStyle: 'normal',
    iconClass: 'ph-fill ph-figma-logo',
    iconColor: 'text-fuchsia-500',
    bgColor: 'bg-fuchsia-50',
  },
];

const SubscriptionCard = ({ sub }) => (
  <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)] border-none hover:shadow-md transition-all cursor-pointer group">
    <div className={`w-[52px] h-[52px] rounded-full ${sub.bgColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
      <i className={`${sub.iconClass} text-2xl ${sub.iconColor}`}></i>
    </div>
    <div className="flex-1 flex flex-col justify-center">
      <h3 className="text-[15px] font-bold text-slate-800 leading-tight">{sub.name}</h3>
      <p className="text-[13px] font-medium text-slate-500 mt-0.5">{sub.plan}</p>
    </div>
    <div className="flex flex-col items-end justify-center text-right gap-1">
      <span className="text-[15px] font-bold text-slate-800 leading-tight">{sub.amount}</span>
      {sub.dueLabelStyle === 'urgent' ? (
        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-md mt-0.5 uppercase tracking-widest leading-none">{sub.dueLabel}</span>
      ) : (
        <span className="text-[12px] font-medium text-slate-400 mt-1">{sub.dueLabel}</span>
      )}
    </div>
  </div>
);

const NavButton = ({ icon, active, onClick, filled }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 flex justify-center items-center ${active ? 'text-[#6C51FF]' : 'text-slate-400 hover:text-[#6C51FF]'} transition-colors group`}
  >
    <div className="flex flex-col items-center gap-1">
      <i className={`${filled && active ? icon.replace('ph ', 'ph-fill ') : icon} text-2xl group-hover:-translate-y-1 transition-transform`}></i>
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#6C51FF]' : 'bg-transparent'}`}></div>
    </div>
  </button>
);

const AddModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', plan: '', amount: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.plan && formData.amount) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', plan: '', amount: '' });
        onClose();
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-[32px] p-6 pb-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>
        <h2 className="text-[18px] font-bold text-slate-800 mb-5">Add Subscription</h2>
        {submitted ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
              <i className="ph-fill ph-check-circle text-3xl text-emerald-500"></i>
            </div>
            <p className="text-[15px] font-semibold text-slate-700">Subscription Added!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Service Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Netflix"
                className="w-full border border-slate-200 rounded-[14px] px-4 py-3 text-[15px] text-slate-800 font-medium focus:outline-none focus:border-[#6C51FF] transition-colors"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Plan</label>
              <input
                type="text"
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                placeholder="e.g. Premium Plan"
                className="w-full border border-slate-200 rounded-[14px] px-4 py-3 text-[15px] text-slate-800 font-medium focus:outline-none focus:border-[#6C51FF] transition-colors"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Monthly Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full border border-slate-200 rounded-[14px] px-4 py-3 text-[15px] text-slate-800 font-medium focus:outline-none focus:border-[#6C51FF] transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-2 w-full py-4 bg-[#6C51FF] text-white font-bold text-[15px] rounded-[16px] hover:bg-[#5a46e0] active:scale-95 transition-all shadow-[0_8px_20px_-6px_rgba(108,81,255,0.4)]"
            >
              Add Subscription
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const AllSubscriptionsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-[32px] p-6 pb-10 shadow-xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[18px] font-bold text-slate-800">All Subscriptions</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="ph ph-x text-xl"></i>
          </button>
        </div>
        <div className="flex flex-col gap-3.5">
          {subscriptions.map((sub) => (
            <SubscriptionCard key={sub.id} sub={sub} />
          ))}
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [allSubsModalOpen, setAllSubsModalOpen] = useState(false);
  const [notifActive, setNotifActive] = useState(true);

  return (
    <div
      className="w-full min-h-screen text-slate-800 antialiased relative overflow-x-hidden"
      style={{ backgroundColor: '#F8F9FB' }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '360px',
          background: 'linear-gradient(145deg, #6C51FF 0%, #9542FF 100%)',
          borderBottomLeftRadius: '48px',
          borderBottomRightRadius: '48px',
          zIndex: 0,
        }}
      />

      <main className="w-full h-full pb-32 flex flex-col relative">
        <header className="px-6 pt-12 pb-6 flex justify-between items-center relative z-20">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Welcome back,</span>
            <h1 className="text-xl font-bold text-white tracking-tight">Alex Student</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotifActive(!notifActive)}
              className="relative w-11 h-11 flex items-center justify-center bg-transparent border border-white/30 rounded-[14px] text-white hover:bg-white/10 transition-colors"
            >
              <i className="ph ph-bell text-xl"></i>
              {notifActive && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-transparent"></span>
              )}
            </button>
            <div className="w-11 h-11 rounded-[14px] bg-transparent border border-white/30 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
              <img
                src="https://ui-avatars.com/api/?name=Alex+Student&background=E0E7FF&color=4338CA&bold=true"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        <section className="px-6 relative z-10">
          <div className="w-full pt-2 pb-8 text-white relative flex flex-col items-center">
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="flex justify-center items-center w-full relative">
                <span className="text-[13px] font-medium text-white/80">Monthly Spending</span>
              </div>
              <div className="flex items-baseline justify-center gap-1 mt-4">
                <span className="text-4xl font-semibold text-white/70">$</span>
                <span className="text-[64px] font-bold tracking-tight text-white leading-none">84.46</span>
              </div>
              <div className="mt-6 flex justify-center w-full">
                <div className="flex items-center gap-2 px-4 py-2 bg-black/15 backdrop-blur-md rounded-xl border border-white/5">
                  <i className="ph-fill ph-calendar-blank text-white/80 text-sm"></i>
                  <span className="text-xs font-medium text-white/80">
                    Yearly Est.{' '}
                    <strong className="text-white font-semibold ml-1">$1,013.52</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 mt-2 relative z-20">
          <div className="flex gap-4">
            <div className="flex-1 bg-white rounded-[24px] p-4 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] border-none flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <i className="ph-fill ph-check-circle text-[22px] text-emerald-500"></i>
              </div>
              <div className="flex flex-col-reverse items-start">
                <span className="text-[26px] font-bold text-slate-800 leading-none mt-1">8</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-[24px] p-4 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)] border-none flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <i className="ph-fill ph-archive-box text-[22px] text-slate-500"></i>
              </div>
              <div className="flex flex-col-reverse items-start">
                <span className="text-[26px] font-bold text-slate-800 leading-none mt-1">3</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Archived</span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 mt-8 flex-1 flex flex-col relative z-20">
          <div className="flex justify-between items-center mb-5 px-1">
            <h2 className="text-[18px] font-bold text-slate-800">Upcoming Renewals</h2>
            <button
              onClick={() => setAllSubsModalOpen(true)}
              className="text-[13px] font-semibold text-[#6C51FF] bg-[#6C51FF]/10 px-3 py-1.5 rounded-lg hover:bg-[#6C51FF]/20 transition-colors"
            >
              See all
            </button>
          </div>
          <div className="flex flex-col gap-3.5">
            {subscriptions.map((sub) => (
              <SubscriptionCard key={sub.id} sub={sub} />
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-6 left-0 w-full px-6 z-50 pointer-events-none">
        <nav className="bg-white/95 backdrop-blur-xl rounded-[32px] p-2 flex justify-between items-center shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] border border-slate-100/50 pointer-events-auto relative">
          <button
            onClick={() => setActiveNav('home')}
            className={`flex-1 py-3 flex justify-center items-center ${activeNav === 'home' ? 'text-[#6C51FF]' : 'text-slate-400 hover:text-[#6C51FF]'} transition-colors group`}
          >
            <div className="flex flex-col items-center gap-1">
              <i className={`${activeNav === 'home' ? 'ph-fill ph-house' : 'ph ph-house'} text-2xl group-hover:-translate-y-1 transition-transform`}></i>
              <div className={`w-1.5 h-1.5 rounded-full ${activeNav === 'home' ? 'bg-[#6C51FF]' : 'bg-transparent'}`}></div>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('grid')}
            className={`flex-1 py-3 flex justify-center items-center ${activeNav === 'grid' ? 'text-[#6C51FF]' : 'text-slate-400 hover:text-[#6C51FF]'} transition-colors group`}
          >
            <div className="flex flex-col items-center gap-1">
              <i className={`${activeNav === 'grid' ? 'ph-fill ph-squares-four' : 'ph ph-squares-four'} text-2xl group-hover:-translate-y-1 transition-transform`}></i>
              <div className={`w-1.5 h-1.5 rounded-full ${activeNav === 'grid' ? 'bg-[#6C51FF]' : 'bg-transparent'}`}></div>
            </div>
          </button>

          <div className="flex-1 flex justify-center relative -top-6">
            <button
              onClick={() => setAddModalOpen(true)}
              className="w-14 h-14 bg-[#6C51FF] text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(108,81,255,0.4)] border-4 border-white hover:bg-[#5a46e0] hover:scale-105 active:scale-95 transition-all"
            >
              <i className="ph-bold ph-plus text-2xl"></i>
            </button>
          </div>

          <button
            onClick={() => setActiveNav('chart')}
            className={`flex-1 py-3 flex justify-center items-center ${activeNav === 'chart' ? 'text-[#6C51FF]' : 'text-slate-400 hover:text-[#6C51FF]'} transition-colors group`}
          >
            <div className="flex flex-col items-center gap-1">
              <i className={`${activeNav === 'chart' ? 'ph-fill ph-chart-pie-slice' : 'ph ph-chart-pie-slice'} text-2xl group-hover:-translate-y-1 transition-transform`}></i>
              <div className={`w-1.5 h-1.5 rounded-full ${activeNav === 'chart' ? 'bg-[#6C51FF]' : 'bg-transparent'}`}></div>
            </div>
          </button>

          <button
            onClick={() => setActiveNav('user')}
            className={`flex-1 py-3 flex justify-center items-center ${activeNav === 'user' ? 'text-[#6C51FF]' : 'text-slate-400 hover:text-[#6C51FF]'} transition-colors group`}
          >
            <div className="flex flex-col items-center gap-1">
              <i className={`${activeNav === 'user' ? 'ph-fill ph-user' : 'ph ph-user'} text-2xl group-hover:-translate-y-1 transition-transform`}></i>
              <div className={`w-1.5 h-1.5 rounded-full ${activeNav === 'user' ? 'bg-[#6C51FF]' : 'bg-transparent'}`}></div>
            </div>
          </button>
        </nav>
      </div>

      <AddModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
      <AllSubscriptionsModal isOpen={allSubsModalOpen} onClose={() => setAllSubsModalOpen(false)} />
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const phosphorScript = document.createElement('script');
    phosphorScript.src = 'https://unpkg.com/@phosphor-icons/web';
    document.head.appendChild(phosphorScript);

    const style = document.createElement('style');
    style.textContent = `
      body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;