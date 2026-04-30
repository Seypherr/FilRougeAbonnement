import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

const categories = [
  { name: 'Entertainment', amount: '$35.97', color: '#8255FF', width: '42%' },
  { name: 'Software', amount: '$31.99', color: '#0055FF', width: '38%' },
  { name: 'Music', amount: '$5.99', color: '#00C48C', width: '7%' },
  { name: 'Other', amount: '$10.51', color: '#CBD5E1', width: '12%' },
];

const topExpenses = [
  {
    rank: '#1',
    bgColor: '#FFE8E8',
    textColor: '#FF3B30',
    name: 'Netflix',
    category: 'Entertainment',
    amount: '$19.99',
    badge: true,
  },
  {
    rank: '#2',
    bgColor: '#E8F0FF',
    textColor: '#0055FF',
    name: 'Adobe CC',
    category: 'Software',
    amount: '$19.99',
    badge: false,
  },
  {
    rank: '#3',
    bgColor: '#F4EBFF',
    textColor: '#8255FF',
    name: 'Figma',
    category: 'Software',
    amount: '$12.00',
    badge: false,
  },
];

const CategoryBar = ({ name, amount, color, width }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
          <span className="text-[14px] font-bold text-slate-800">{name}</span>
        </div>
        <span className="text-[14px] font-bold text-slate-800">{amount}</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            backgroundColor: color,
            width: animated ? width : '0%',
          }}
        ></div>
      </div>
    </div>
  );
};

const ExpenseCard = ({ rank, bgColor, textColor, name, category, amount, badge }) => (
  <div className="bg-white rounded-[24px] p-4 flex items-center gap-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] hover:shadow-md transition-all relative overflow-hidden group">
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: bgColor }}
    >
      <span className="text-[16px] font-bold" style={{ color: textColor }}>
        {rank}
      </span>
    </div>
    <div className="flex-1 flex flex-col justify-center">
      <h3 className="text-[15px] font-bold text-slate-800 leading-tight">{name}</h3>
      <p className="text-[13px] font-medium text-slate-500 mt-0.5">{category}</p>
    </div>
    <div className="flex flex-col items-end justify-center text-right">
      <span className="text-[15px] font-bold text-slate-800 leading-tight">{amount}</span>
      {badge ? (
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded mt-1 uppercase tracking-wider"
          style={{ color: textColor, backgroundColor: bgColor }}
        >
          /mo
        </span>
      ) : (
        <span className="text-[11px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide">/mo</span>
      )}
    </div>
  </div>
);

const BottomNav = ({ activeTab, setActiveTab }) => (
  <div className="fixed bottom-6 left-0 w-full px-6 z-50 pointer-events-none">
    <nav className="bg-white rounded-[32px] p-2 flex justify-between items-center shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.08)] pointer-events-auto relative">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex-1 py-3 flex justify-center items-center transition-colors group ${activeTab === 'home' ? 'text-[#8255FF]' : 'text-slate-300 hover:text-[#8255FF]'}`}
      >
        <div className="flex flex-col items-center gap-1">
          <i className="ph-fill ph-house text-2xl group-hover:-translate-y-1 transition-transform"></i>
          <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'home' ? 'bg-[#8255FF]' : 'bg-transparent'}`}></div>
        </div>
      </button>

      <button
        onClick={() => setActiveTab('grid')}
        className={`flex-1 py-3 flex justify-center items-center transition-colors group ${activeTab === 'grid' ? 'text-[#8255FF]' : 'text-slate-300 hover:text-[#8255FF]'}`}
      >
        <div className="flex flex-col items-center gap-1">
          <i className="ph ph-squares-four text-2xl group-hover:-translate-y-1 transition-transform"></i>
          <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'grid' ? 'bg-[#8255FF]' : 'bg-transparent'}`}></div>
        </div>
      </button>

      <div className="flex-1 flex justify-center relative -top-7">
        <button className="w-14 h-14 bg-[#8255FF] text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(130,85,255,0.4)] border-[6px] border-white hover:bg-[#6E3BEA] hover:scale-105 active:scale-95 transition-all">
          <i className="ph-bold ph-plus text-2xl"></i>
        </button>
      </div>

      <button
        onClick={() => setActiveTab('analytics')}
        className={`flex-1 py-3 flex justify-center items-center group ${activeTab === 'analytics' ? 'text-[#8255FF]' : 'text-slate-300 hover:text-[#8255FF]'} transition-colors`}
      >
        <div className="flex flex-col items-center gap-1">
          <i className="ph-fill ph-chart-pie-slice text-2xl group-hover:-translate-y-1 transition-transform"></i>
          <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'analytics' ? 'bg-[#8255FF]' : 'bg-transparent'}`}></div>
        </div>
      </button>

      <button
        onClick={() => setActiveTab('profile')}
        className={`flex-1 py-3 flex justify-center items-center transition-colors group ${activeTab === 'profile' ? 'text-[#8255FF]' : 'text-slate-300 hover:text-[#8255FF]'}`}
      >
        <div className="flex flex-col items-center gap-1">
          <i className="ph ph-user text-2xl group-hover:-translate-y-1 transition-transform"></i>
          <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'profile' ? 'bg-[#8255FF]' : 'bg-transparent'}`}></div>
        </div>
      </button>
    </nav>
  </div>
);

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [activePeriod, setActivePeriod] = useState('month');

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const iconScript = document.createElement('script');
    iconScript.src = 'https://unpkg.com/@phosphor-icons/web';
    document.head.appendChild(iconScript);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div
      className="w-full min-h-screen text-slate-800 antialiased relative overflow-x-hidden flex flex-col"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#F8F9FB' }}
    >
      {/* Purple header background */}
      <div
        className="absolute top-0 left-0 w-full"
        style={{
          height: '390px',
          backgroundColor: '#8255FF',
          borderBottomLeftRadius: '40px',
          borderBottomRightRadius: '40px',
          zIndex: 0,
        }}
      ></div>

      <main className="w-full h-full pb-32 flex flex-col flex-1 relative" style={{ zIndex: 10 }}>
        {/* Header */}
        <header className="px-6 pt-12 pb-4 flex justify-between items-center relative" style={{ zIndex: 30 }}>
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 shadow-sm border border-white/20 text-white cursor-pointer hover:bg-white/20 transition-colors">
            <i className="ph-bold ph-caret-left text-lg"></i>
          </div>
          <h1 className="text-[18px] font-bold text-white tracking-tight">Analytics</h1>
          <div className="w-10"></div>
        </header>

        {/* Period Toggle */}
        <div className="px-6 mb-6 mt-2 relative" style={{ zIndex: 20 }}>
          <div className="bg-[#6E3BEA] p-1.5 rounded-xl flex items-center w-full relative">
            <div
              className="absolute top-1.5 bottom-1.5 bg-white rounded-lg shadow-sm transition-transform duration-300"
              style={{
                width: 'calc(50% - 6px)',
                left: activePeriod === 'month' ? '6px' : 'calc(50%)',
              }}
            ></div>
            <button
              onClick={() => setActivePeriod('month')}
              className="flex-1 py-2 text-[13px] font-bold relative z-10 transition-colors"
              style={{ color: activePeriod === 'month' ? '#8255FF' : 'rgba(255,255,255,0.8)' }}
            >
              This Month
            </button>
            <button
              onClick={() => setActivePeriod('year')}
              className="flex-1 py-2 text-[13px] font-semibold relative z-10 transition-colors"
              style={{ color: activePeriod === 'year' ? '#8255FF' : 'rgba(255,255,255,0.8)' }}
            >
              This Year
            </button>
          </div>
        </div>

        {/* Total Spend */}
        <section className="px-6 mb-6 relative" style={{ zIndex: 10 }}>
          <div className="bg-transparent p-4 border-none flex flex-col items-center relative overflow-hidden">
            <span className="text-[13px] font-medium text-white/80 tracking-wide mb-2">Total Spend</span>
            <div className="flex items-baseline justify-center gap-1.5 mb-2">
              <span className="text-4xl font-semibold text-white/70">$</span>
              <span className="text-[64px] font-bold tracking-tight text-white leading-none">84.46</span>
            </div>
            <div
              className="flex items-center justify-center rounded-[12px] px-4 py-2 w-max mx-auto gap-3 mt-2"
              style={{ backgroundColor: '#6E3BEA' }}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center">
                  <i className="ph-fill ph-calendar-blank text-white/90 text-[15px]"></i>
                </div>
                <span className="text-[12px] font-medium text-white/90">Yearly Est.</span>
              </div>
              <span className="text-[13px] font-bold text-white">$1,013.52</span>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="px-6 mb-8 relative" style={{ zIndex: 10 }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[24px] p-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] grid gap-x-3 gap-y-0.5 items-center" style={{ gridTemplateColumns: 'auto 1fr' }}>
              <div className="w-11 h-11 rounded-full bg-[#E8F8F0] flex items-center justify-center row-span-2">
                <i className="ph-bold ph-trend-up text-xl text-[#00C48C]"></i>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest self-end mt-1">Avg Cost</span>
              <span className="text-[20px] font-bold text-slate-800 self-start leading-none">$10.55</span>
            </div>

            <div className="bg-white rounded-[24px] p-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] grid gap-x-3 gap-y-0.5 items-center" style={{ gridTemplateColumns: 'auto 1fr' }}>
              <div className="w-11 h-11 rounded-full bg-[#F1F3F5] flex items-center justify-center row-span-2">
                <i className="ph-bold ph-crown text-xl text-slate-500"></i>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest self-end mt-1">Highest</span>
              <span className="text-[20px] font-bold text-slate-800 self-start leading-none">$19.99</span>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="px-6 mb-8 relative" style={{ zIndex: 10 }}>
          <h2 className="text-[17px] font-bold text-slate-800 mb-4 px-1">Categories</h2>
          <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] flex flex-col gap-5">
            {categories.map((cat) => (
              <CategoryBar key={cat.name} {...cat} />
            ))}
          </div>
        </section>

        {/* Top Expenses */}
        <section className="px-6 mb-4 relative" style={{ zIndex: 10 }}>
          <h2 className="text-[17px] font-bold text-slate-800 mb-4 px-1">Top Expenses</h2>
          <div className="flex flex-col gap-3.5">
            {topExpenses.map((expense) => (
              <ExpenseCard key={expense.rank} {...expense} />
            ))}
          </div>

          <div className="mt-6 mb-8 flex justify-center items-center gap-2">
            <i className="ph-fill ph-check-circle text-emerald-500 text-lg"></i>
            <p className="text-[13px] font-semibold text-slate-500">You're keeping costs low!</p>
          </div>
        </section>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const App = () => {
  return (
    <Router basename="/">
      <AnalyticsPage />
    </Router>
  );
};

export default App;