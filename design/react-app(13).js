import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const ProfilePage = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      * { selection-color: rgba(108,81,255,0.2); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const languages = ['EN', 'ES', 'FR', 'DE', 'PT', 'IT'];

  return (
    <div className="w-full min-h-screen bg-[#F8F9FB] text-slate-800 antialiased flex flex-col relative overflow-x-hidden">

      {/* Personal Info Modal */}
      {showPersonalInfoModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowPersonalInfoModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full bg-white rounded-t-[28px] p-6 pb-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-800 mb-6">Personal Info</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  defaultValue="Alex Student"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-[15px] font-semibold text-slate-800 outline-none focus:border-[#6C51FF] focus:ring-2 focus:ring-[#6C51FF]/20 transition-all"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Email</label>
                <input
                  type="email"
                  defaultValue="alex@student.edu"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-[15px] font-semibold text-slate-800 outline-none focus:border-[#6C51FF] focus:ring-2 focus:ring-[#6C51FF]/20 transition-all"
                />
              </div>
              <button
                onClick={() => setShowPersonalInfoModal(false)}
                className="w-full py-4 bg-[#6C51FF] rounded-[16px] text-white font-bold text-[15px] mt-2 hover:bg-[#5a42e0] active:scale-[0.98] transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowPasswordModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full bg-white rounded-t-[28px] p-6 pb-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-800 mb-6">Change Password</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-[15px] font-semibold text-slate-800 outline-none focus:border-[#6C51FF] focus:ring-2 focus:ring-[#6C51FF]/20 transition-all"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-[15px] font-semibold text-slate-800 outline-none focus:border-[#6C51FF] focus:ring-2 focus:ring-[#6C51FF]/20 transition-all"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-[15px] font-semibold text-slate-800 outline-none focus:border-[#6C51FF] focus:ring-2 focus:ring-[#6C51FF]/20 transition-all"
                />
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-full py-4 bg-[#6C51FF] rounded-[16px] text-white font-bold text-[15px] mt-2 hover:bg-[#5a42e0] active:scale-[0.98] transition-all"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowHelpModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full bg-white rounded-t-[28px] p-6 pb-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Help & Support</h3>
            <p className="text-[14px] text-slate-500 mb-6">Get help with your account or subscriptions.</p>
            <div className="flex flex-col gap-3">
              {['FAQ', 'Contact Support', 'Report a Bug', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <button
                  key={item}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 rounded-[14px] hover:bg-slate-100 transition-colors"
                >
                  <span className="text-[15px] font-semibold text-slate-700">{item}</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-4 bg-slate-100 rounded-[16px] text-slate-600 font-bold text-[15px] mt-4 hover:bg-slate-200 active:scale-[0.98] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowSignOutModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full bg-white rounded-t-[28px] p-6 pb-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Sign Out?</h3>
              <p className="text-[14px] text-slate-500">Are you sure you want to sign out of your account?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-4 bg-slate-100 rounded-[16px] text-slate-600 font-bold text-[15px] hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 py-4 bg-rose-500 rounded-[16px] text-white font-bold text-[15px] hover:bg-rose-600 active:scale-[0.98] transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Dropdown */}
      {showLanguageDropdown && (
        <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={() => setShowLanguageDropdown(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full bg-white rounded-t-[28px] p-6 pb-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-800 mb-4">Select Language</h3>
            <div className="flex flex-col gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setSelectedLanguage(lang); setShowLanguageDropdown(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[14px] transition-colors ${selectedLanguage === lang ? 'bg-[#6C51FF]/10 text-[#6C51FF]' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                >
                  <span className="text-[15px] font-semibold">{lang === 'EN' ? 'English' : lang === 'ES' ? 'Español' : lang === 'FR' ? 'Français' : lang === 'DE' ? 'Deutsch' : lang === 'PT' ? 'Português' : 'Italiano'}</span>
                  <span className={`text-[13px] font-bold ${selectedLanguage === lang ? 'text-[#6C51FF]' : 'text-slate-400'}`}>{lang}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center sticky top-0 bg-[#F8F9FB]/90 backdrop-blur-md z-30">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200/50 transition-colors group">
          <svg className="w-5 h-5 text-slate-600 group-hover:text-[#6C51FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Profile</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="w-full flex-1 flex flex-col pb-10">

        {/* Avatar Section */}
        <section className="flex flex-col items-center pt-4 pb-6 px-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#6C51FF] to-[#9542FF] shadow-[0_8px_24px_-8px_rgba(108,81,255,0.5)] flex items-center justify-center text-4xl font-extrabold text-white tracking-tight border-4 border-white">
              AS
            </div>
            <div className="absolute bottom-1 right-2 w-5 h-5 bg-emerald-500 border-4 border-[#F8F9FB] rounded-full z-10 shadow-sm" />
          </div>

          <h2 className="text-[24px] font-bold text-slate-800 mt-5 leading-none">Alex Student</h2>
          <p className="text-[14px] font-medium text-slate-500 mt-1.5">alex@student.edu</p>

          <div className="flex items-center gap-2 mt-4">
            <div className="px-3 py-1 bg-[#6C51FF]/10 text-[#6C51FF] text-[11px] font-bold rounded-lg tracking-widest uppercase flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 256 256">
                <path d="M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87V168a15.92,15.92,0,0,0,4.69,11.31C49.12,191.74,78.51,208,128,208s78.88-16.26,91.31-28.69A15.92,15.92,0,0,0,224,168V117.87l24-12.81a8,8,0,0,0,0-14.12ZM208,168c0,10.64-32.43,24-80,24s-80-13.36-80-24V126.64l76.24,40.66a8,8,0,0,0,7.52,0L208,126.64ZM128,151.26,37.28,96,128,40.74,218.72,96Z" />
              </svg>
              Student
            </div>
            <div className="px-3 py-1 bg-slate-200/50 text-slate-500 text-[11px] font-bold rounded-lg tracking-widest uppercase flex items-center gap-1.5">
              Active Account
            </div>
          </div>
        </section>

        {/* Account Settings Section */}
        <section className="px-6 mt-4">
          <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Account Settings</h3>

          <div className="bg-white rounded-[20px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden">

            {/* Personal Info */}
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50/80 group"
              onClick={() => setShowPersonalInfoModal(true)}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-[14px] bg-indigo-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8C53.49,193.63,79.7,176,108,176a64,64,0,1,1,40-0,8,8,0,0,1-4,1H128a64,64,0,0,1-20.05-3.16C79.7,176,53.49,193.63,39,220a8,8,0,0,0,13.85,8h0Z" />
                    <path d="M128,160a72,72,0,1,0-72-72A72.08,72.08,0,0,0,128,160Zm0-128a56,56,0,1,1-56,56A56.06,56.06,0,0,1,128,32Z" />
                  </svg>
                </div>
                <div className="text-left flex flex-col justify-center">
                  <span className="text-[15px] font-bold text-slate-800 leading-tight">Personal Info</span>
                  <span className="text-[13px] font-medium text-slate-500 mt-0.5">Alex Student</span>
                </div>
              </div>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Email Address */}
            <div className="w-full flex items-center justify-between p-4 border-b border-slate-50/80">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-[14px] bg-emerald-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z" />
                  </svg>
                </div>
                <div className="text-left flex flex-col justify-center">
                  <span className="text-[15px] font-bold text-slate-800 leading-tight">Email Address</span>
                  <span className="text-[13px] font-medium text-slate-500 mt-0.5">alex@student.edu</span>
                </div>
              </div>
            </div>

            {/* Language */}
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50/80 group"
              onClick={() => setShowLanguageDropdown(true)}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-[14px] bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm85.23,104H175.9c-1-31.28-10.64-59.82-26.6-81.27A88.23,88.23,0,0,1,213.23,128ZM96,128c1.1-32.16,11.58-61,32-82.44C148.43,67,158.91,95.84,160,128ZM96,144h64c-1.1,32.16-11.58,61-32,82.44C107.57,205,97.09,176.16,96,144Zm10.7,65.27C90.74,187.82,81.1,159.28,80.1,128H42.77A88.23,88.23,0,0,0,106.7,209.27ZM42.77,112H80.1c1-31.28,10.64-59.82,26.6-81.27A88.23,88.23,0,0,0,42.77,112Zm106.53,97.27A88.23,88.23,0,0,0,213.23,144H175.9C174.9,175.28,165.26,203.82,149.3,209.27Z" />
                  </svg>
                </div>
                <span className="text-[15px] font-bold text-slate-800">Language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-slate-500 uppercase">{selectedLanguage}</span>
                <svg className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Push Notifications */}
            <div className="w-full flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-[14px] bg-amber-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.63-16h45.26A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z" />
                  </svg>
                </div>
                <span className="text-[15px] font-bold text-slate-800">Push Notifications</span>
              </div>

              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative w-[44px] h-6 rounded-full transition-colors duration-300 shadow-inner ${notificationsEnabled ? 'bg-[#6C51FF]' : 'bg-slate-200'}`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white border border-gray-300 rounded-full shadow transition-transform duration-300 ${notificationsEnabled ? 'translate-x-full border-white' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Security & Support Section */}
        <section className="px-6 mt-8">
          <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Security &amp; Support</h3>

          <div className="bg-white rounded-[20px] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden">

            {/* Change Password */}
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50/80 group"
              onClick={() => setShowPasswordModal(true)}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-[14px] bg-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM80,128a48,48,0,1,1,48,48A48.05,48.05,0,0,1,80,128Zm48,32a32,32,0,1,0-32-32A32,32,0,0,0,128,160Zm0-48a16,16,0,1,1-16,16A16,16,0,0,1,128,112Z" />
                  </svg>
                </div>
                <span className="text-[15px] font-bold text-slate-800">Change Password</span>
              </div>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Help & Support */}
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
              onClick={() => setShowHelpModal(true)}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-[14px] bg-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72C152.41,140,168,123.61,168,108,168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
                  </svg>
                </div>
                <span className="text-[15px] font-bold text-slate-800">Help &amp; Support</span>
              </div>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </section>

        {/* Sign Out */}
        <section className="px-6 mt-10 mb-8">
          <button
            onClick={() => setShowSignOutModal(true)}
            className="w-full py-4 bg-rose-50 border border-rose-100 rounded-[16px] text-rose-500 font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-rose-100 hover:text-rose-600 active:scale-[0.98] transition-all group"
          >
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </section>

      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
};

export default App;