import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('student@university');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(true);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
      body { font-family: 'Poppins', sans-serif; }
      ::-webkit-scrollbar { display: none; }
      ::selection { background: rgba(112,71,235,0.2); color: #7047EB; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const validateEmail = (val) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(!re.test(val));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  };

  return (
    <div
      className="w-full h-full min-h-screen text-[#1B1D28] antialiased flex flex-col bg-[#EEF0F4] p-4"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="flex-1 bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden relative">

        {/* Header */}
        <header className="flex justify-between items-center p-6 pb-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#7047EB] rounded-2xl flex items-center justify-center text-white shadow-[0_4px_16px_rgba(112,71,235,0.3)]">
              <i className="ph ph-squares-four text-xl"></i>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#7047EB] hover:text-[#5E35D9] bg-[#F4F1FF] hover:bg-[#EAE5FF] px-3 py-1.5 rounded-full border border-transparent transition-colors"
          >
            <i className="ph ph-globe text-base"></i>
            <span>EN</span>
            <i className="ph ph-caret-down text-xs ml-0.5"></i>
          </button>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col relative z-10">

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#1B1D28] mb-2">Welcome back! 👋</h1>
            <p className="text-[#8E95A9] text-sm font-medium">Enter your credentials to access your dashboard.</p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-[#F8F9FB] p-1.5 rounded-full flex mb-8 shrink-0 border border-[#EAECEF]">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] text-[#1B1D28]'
                  : 'text-[#8E95A9] hover:text-[#1B1D28] font-medium'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 text-sm transition-all rounded-full ${
                activeTab === 'register'
                  ? 'bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] text-[#1B1D28] font-bold'
                  : 'font-medium text-[#8E95A9] hover:text-[#1B1D28]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-5 flex-1" onSubmit={(e) => e.preventDefault()}>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1B1D28] mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className={`ph-fill ph-envelope-simple text-lg ${emailError ? 'text-[#FF3E5D]' : 'text-[#8E95A9]'}`}></i>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`block w-full pl-11 pr-11 py-3.5 rounded-full border-2 text-[#1B1D28] placeholder-[#8E95A9] focus:outline-none transition-all sm:text-sm font-medium ${
                    emailError
                      ? 'border-[#FF3E5D]/30 bg-[#FFF0F3] focus:ring-4 focus:ring-[#FF3E5D]/20 focus:border-[#FF3E5D]'
                      : 'border-[#EAECEF] bg-[#F8F9FB] focus:ring-4 focus:ring-[#7047EB]/20 focus:border-[#7047EB] focus:bg-white'
                  }`}
                  placeholder="name@example.com"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  {emailError && <i className="ph-fill ph-warning-circle text-[#FF3E5D] text-lg"></i>}
                </div>
              </div>
              {emailError && (
                <p className="text-sm text-[#FF3E5D] mt-2 flex items-start gap-1.5 ml-1 font-medium">
                  Please enter a valid email format.
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label htmlFor="password" className="block text-sm font-semibold text-[#1B1D28]">Password</label>
                <a href="#" className="text-sm font-semibold text-[#7047EB] hover:text-[#5B33D6] transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="ph-fill ph-lock-key text-[#8E95A9] text-lg"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 rounded-full border-2 border-[#EAECEF] bg-[#F8F9FB] text-[#1B1D28] placeholder-[#8E95A9] focus:outline-none focus:ring-4 focus:ring-[#7047EB]/20 focus:border-[#7047EB] focus:bg-white transition-all sm:text-sm font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8E95A9] hover:text-[#1B1D28] transition-colors"
                >
                  <i className={`ph-fill ${showPassword ? 'ph-eye' : 'ph-eye-slash'} text-lg`}></i>
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              className="w-full bg-[#7047EB] text-white font-bold py-4 rounded-full mt-4 shadow-[0_8px_24px_-6px_rgba(112,71,235,0.4)] hover:bg-[#5E35D9] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {activeTab === 'login' ? 'Sign In' : 'Create Account'}
              <i className="ph-bold ph-arrow-right text-lg"></i>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-3">
              <div className="h-[2px] bg-[#EAECEF] flex-1 rounded-full"></div>
              <span className="text-xs text-[#8E95A9] font-bold uppercase tracking-widest">Or</span>
              <div className="h-[2px] bg-[#EAECEF] flex-1 rounded-full"></div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3 pb-2">
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 py-3.5 border-2 border-[#EAECEF] rounded-2xl hover:bg-[#F8F9FB] active:scale-[0.98] transition-all bg-white shadow-sm"
              >
                <i className="ph-fill ph-google-logo text-xl text-[#1B1D28]"></i>
                <span className="text-sm font-bold text-[#1B1D28]">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 py-3.5 border-2 border-[#EAECEF] rounded-2xl hover:bg-[#F8F9FB] active:scale-[0.98] transition-all bg-white shadow-sm"
              >
                <i className="ph-fill ph-apple-logo text-xl text-[#1B1D28]"></i>
                <span className="text-sm font-bold text-[#1B1D28]">Apple</span>
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<AuthPage />} />
      </Routes>
    </Router>
  );
};

export default App;