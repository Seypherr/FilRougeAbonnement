import React, { useState, useEffect } from 'react';

const initialUsers = [
  { id: 1, name: 'Alex Student', email: 'alex@university.edu', role: 'Admin', active: true, color: 'purple' },
  { id: 2, name: 'Jamie Doe', email: 'jamie.d@example.com', role: 'User', active: true, color: 'blue' },
  { id: 3, name: 'Casey Smith', email: 'casey@test.org', role: 'Guest', active: false, color: 'slate' },
];

const initialSubscriptions = [
  { id: 1, service: 'Netflix', user: 'Alex', price: '$19.99', period: '/mo', status: 'Active', icon: 'ph-film-strip', iconBg: 'bg-rose-50', iconColor: 'text-rose-500', cancelled: false },
  { id: 2, service: 'Spotify', user: 'Jamie', price: '$5.99', period: '/mo', status: 'Active', icon: 'ph-music-notes', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', cancelled: false },
  { id: 3, service: 'Adobe CC', user: 'Casey', price: '$54.99', period: '', status: 'Cancelled', icon: 'ph-pen-nib', iconBg: 'bg-blue-50', iconColor: 'text-blue-500', cancelled: true },
];

const getUserColors = (color) => {
  if (color === 'purple') return { avatar: 'bg-[#6C51FF]/10', text: 'text-[#6C51FF]', badge: 'bg-[#6C51FF]/15 text-[#6C51FF]', dot: 'bg-[#6C51FF]/10 text-[#6C51FF]' };
  if (color === 'blue') return { avatar: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-600' };
  return { avatar: 'bg-slate-100 border border-slate-200', text: 'text-slate-500', badge: 'bg-slate-200 text-slate-600' };
};

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
    <div className="w-8 bg-[#6B7280] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[14px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#10B981]" style={{ height: '18px' }}></div>
  </label>
);

const UserCardMobile = ({ user, onToggle, onDelete }) => {
  const colors = getUserColors(user.color);
  return (
    <div className={`bg-white rounded-[20px] p-4 flex flex-col gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] border border-slate-100 ${!user.active ? 'opacity-75' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-full ${colors.avatar} flex items-center justify-center shrink-0`}>
          <span className={`text-[16px] font-bold ${colors.text}`}>{user.name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`text-[15px] font-bold truncate leading-tight ${user.active ? 'text-slate-800' : 'text-slate-600'}`}>{user.name}</h3>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${colors.badge}`}>{user.role}</span>
          </div>
          <p className={`text-[12px] truncate mt-0.5 ${user.active ? 'text-slate-500' : 'text-slate-400'}`}>{user.email}</p>
        </div>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Toggle checked={user.active} onChange={() => onToggle(user.id)} />
          <span className={`text-[11px] font-semibold ${user.active ? 'text-[#10B981]' : 'text-[#6B7280]'}`}>{user.active ? 'Active' : 'Inactive'}</span>
        </div>
        <button onClick={() => onDelete(user.id)} className="w-8 h-8 rounded-lg bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center hover:bg-[#EF4444] hover:text-white transition-colors">
          <i className="ph-bold ph-trash text-sm"></i>
        </button>
      </div>
    </div>
  );
};

const UserRowDesktop = ({ user, onDelete }) => {
  const colors = getUserColors(user.color);
  return (
    <tr className={`hover:bg-slate-50/50 transition-colors ${!user.active ? 'opacity-75' : ''}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${colors.avatar} flex items-center justify-center shrink-0`}>
            <span className={`text-[15px] font-bold ${colors.text}`}>{user.name[0]}</span>
          </div>
          <div>
            <h3 className={`text-[14px] font-bold ${user.active ? 'text-slate-800' : 'text-slate-600'}`}>{user.name}</h3>
            <p className={`text-[12px] ${user.active ? 'text-slate-500' : 'text-slate-400'}`}>{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${colors.badge}`}>{user.role}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${user.active ? 'bg-[#10B981]' : 'bg-[#6B7280]'}`}></div>
          <span className={`text-[13px] font-semibold ${user.active ? 'text-slate-700' : 'text-slate-500'}`}>{user.active ? 'Active' : 'Inactive'}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <button className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <i className="ph-bold ph-pencil-simple text-sm"></i>
          </button>
          <button onClick={() => onDelete(user.id)} className="w-9 h-9 rounded-xl bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center hover:bg-[#EF4444] hover:text-white transition-colors">
            <i className="ph-bold ph-trash text-sm"></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

const SubscriptionCard = ({ sub, onDelete }) => (
  <div className={`bg-white rounded-[20px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] border border-slate-100 ${sub.cancelled ? 'opacity-80' : ''}`}>
    <div className="flex items-center gap-4">
      <div className={`w-[48px] h-[48px] rounded-[14px] ${sub.iconBg} flex items-center justify-center shrink-0`}>
        <i className={`ph-fill ${sub.icon} text-2xl ${sub.iconColor}`}></i>
      </div>
      <div className="flex flex-col">
        <h3 className="text-[15px] font-bold text-slate-800 leading-tight">
          {sub.service} <span className="text-slate-400 font-medium ml-1 text-[13px]">· {sub.user}</span>
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {sub.cancelled ? (
            <>
              <span className="text-[13px] font-bold text-slate-500 line-through decoration-slate-300">{sub.price}</span>
              <div className="w-1 h-1 rounded-full bg-slate-300 mx-1"></div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-[#EF4444] bg-[#EF4444]/10 uppercase tracking-widest">Cancelled</span>
            </>
          ) : (
            <>
              <span className="text-[13px] font-bold text-slate-700">{sub.price}</span>
              <span className="text-[12px] text-slate-400">{sub.period}</span>
              <div className="w-1 h-1 rounded-full bg-slate-300 mx-1"></div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-[#10B981] bg-[#10B981]/10 uppercase tracking-widest">Active</span>
            </>
          )}
        </div>
      </div>
    </div>
    <div className="flex sm:justify-end gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
      <button className="flex-1 sm:flex-none h-10 sm:w-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center font-semibold text-sm hover:bg-slate-100 transition-colors">
        <i className="ph-bold ph-pencil-simple sm:text-base mr-2 sm:mr-0"></i>
        <span className="sm:hidden">Edit</span>
      </button>
      <button onClick={() => onDelete(sub.id)} className="flex-1 sm:flex-none h-10 sm:w-10 rounded-xl bg-[#EF4444]/5 text-[#EF4444] flex items-center justify-center font-semibold text-sm hover:bg-[#EF4444] hover:text-white transition-colors">
        <i className="ph-bold ph-trash sm:text-base mr-2 sm:mr-0"></i>
        <span className="sm:hidden">Delete</span>
      </button>
    </div>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState(initialUsers);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [subFilter, setSubFilter] = useState('All Services');
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user', active: true });
  const [purgeConfirm, setPurgeConfirm] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #F8F9FB; -webkit-tap-highlight-color: transparent; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleToggleUser = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleDeleteSubscription = (id) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    const roleColors = { admin: 'purple', user: 'blue', guest: 'slate' };
    const roleLabel = newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1);
    setUsers([...users, {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: roleLabel,
      active: newUser.active,
      color: roleColors[newUser.role] || 'slate'
    }]);
    setNewUser({ name: '', email: '', role: 'user', active: true });
  };

  const handlePurge = () => {
    if (purgeConfirm) {
      setUsers(users.filter(u => u.active));
      setPurgeConfirm(false);
    } else {
      setPurgeConfirm(true);
      setTimeout(() => setPurgeConfirm(false), 3000);
    }
  };

  const filteredSubs = subscriptions.filter(s => {
    if (subFilter === 'All Services') return true;
    if (subFilter === 'Pending') return !s.cancelled && s.status !== 'Active';
    if (subFilter === 'Cancelled') return s.cancelled;
    return true;
  });

  return (
    <div className="w-full min-h-screen text-slate-800 antialiased" style={{ backgroundColor: '#F8F9FB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header className="bg-white sticky top-0 z-50 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="px-5 pt-12 pb-4 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6C51FF]/10 flex items-center justify-center text-[#6C51FF]">
              <i className="ph-fill ph-shield-check text-lg"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Admin Panel</h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">
            <i className="ph ph-gear text-xl"></i>
          </button>
        </div>
        <div className="flex px-5 gap-6 border-b border-slate-100 max-w-7xl mx-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'users' ? 'border-[#6C51FF] text-[#6C51FF]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-3 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'subscriptions' ? 'border-[#6C51FF] text-[#6C51FF]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Subscriptions
          </button>
        </div>
      </header>

      <main className="p-5 space-y-8 max-w-7xl mx-auto pb-24">

        {activeTab === 'users' && (
          <>
            <section id="users" className="scroll-mt-32">
              <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)] border border-slate-100">
                <h2 className="text-[16px] font-bold mb-4 flex items-center gap-2 text-slate-800">
                  <i className="ph-fill ph-user-plus text-[#6C51FF] text-lg"></i>
                  Create New User
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-4 md:space-y-0 md:flex md:gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newUser.name}
                      onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full bg-[#F8F9FB] border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#6C51FF] focus:ring-1 focus:ring-[#6C51FF] transition-all placeholder:font-normal"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full bg-[#F8F9FB] border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#6C51FF] focus:ring-1 focus:ring-[#6C51FF] transition-all placeholder:font-normal"
                    />
                  </div>
                  <div className="flex gap-3 md:w-auto">
                    <div className="relative flex-1 md:w-40">
                      <select
                        value={newUser.role}
                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full bg-[#F8F9FB] border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#6C51FF] focus:ring-1 focus:ring-[#6C51FF] transition-all appearance-none cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="guest">Guest</option>
                      </select>
                      <i className="ph-bold ph-caret-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer bg-[#F8F9FB] border border-slate-200 rounded-xl px-4 py-2.5 min-w-[100px] justify-between">
                      <span className="text-xs font-bold text-slate-600 mr-2">Active</span>
                      <div className="relative w-9 h-5">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={newUser.active}
                          onChange={e => setNewUser({ ...newUser, active: e.target.checked })}
                        />
                        <div className="w-9 h-5 bg-[#6B7280] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </div>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUser}
                    className="w-full md:w-auto bg-[#6C51FF] text-white rounded-xl px-6 py-3 text-sm font-bold shadow-[0_8px_20px_-6px_rgba(108,81,255,0.4)] hover:bg-[#5a46e0] active:scale-95 transition-all whitespace-nowrap"
                  >
                    Add User
                  </button>
                </div>
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-[18px] font-bold text-slate-800">User Management</h2>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-md uppercase tracking-wider">{users.length} Users</span>
              </div>

              <div className="space-y-3 md:hidden">
                {users.map(user => (
                  <UserCardMobile key={user.id} user={user} onToggle={handleToggleUser} onDelete={handleDeleteUser} />
                ))}
              </div>

              <div className="hidden md:block bg-white rounded-[24px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">User Details</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                      <UserRowDesktop key={user.id} user={user} onDelete={handleDeleteUser} />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="w-full h-[1px] bg-slate-200 my-8"></div>

            <section className="mt-12 bg-white border-2 border-[#EF4444]/20 rounded-[24px] p-5 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#EF4444]"></div>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center shrink-0">
                    <i className="ph-fill ph-warning-circle text-[#EF4444] text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#EF4444]">Danger Zone</h3>
                    <p className="text-[13px] text-slate-600 mt-1 leading-relaxed max-w-md">
                      Destructive actions cannot be undone. This will permanently delete all inactive user data from the database.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handlePurge}
                  className={`w-full md:w-auto mt-2 md:mt-0 rounded-xl px-6 py-3 text-sm font-bold transition-all whitespace-nowrap shadow-sm border-2 ${purgeConfirm ? 'bg-[#EF4444] text-white border-[#EF4444]' : 'bg-white text-[#EF4444] border-[#EF4444]/20 hover:bg-[#EF4444] hover:text-white hover:border-[#EF4444]'}`}
                >
                  {purgeConfirm ? 'Click again to confirm' : 'Purge Inactive Users'}
                </button>
              </div>
            </section>
          </>
        )}

        {activeTab === 'subscriptions' && (
          <section id="subscriptions" className="scroll-mt-32">
            <div className="flex justify-between items-end mb-4 px-1">
              <h2 className="text-[18px] font-bold text-slate-800">All Subscriptions</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
              {['All Services', 'Pending', 'Cancelled'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSubFilter(filter)}
                  className={`px-5 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${subFilter === filter ? 'bg-[#6C51FF] text-white shadow-[0_4px_12px_-4px_rgba(108,81,255,0.4)]' : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredSubs.map(sub => (
                <SubscriptionCard key={sub.id} sub={sub} onDelete={handleDeleteSubscription} />
              ))}
              {filteredSubs.length === 0 && (
                <div className="bg-white rounded-[20px] p-8 text-center border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]">
                  <p className="text-slate-400 font-medium text-sm">No subscriptions found</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default App;