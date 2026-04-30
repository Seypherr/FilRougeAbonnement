import React, { useState, useEffect } from 'react';

const customStyles = {
  fontFamily: "'Poppins', sans-serif",
};

const cardNumberDisplay = (last4, isExpired = false) => (
  <div className={`text-[16px] font-medium tracking-[0.15em] text-[#1B1D28] mb-1.5 flex items-center gap-2 ${isExpired ? 'opacity-70' : ''}`}>
    <span className={`${isExpired ? 'text-[#8E95A9]' : 'text-[#8E95A9]'} text-xl`}>••••</span>
    <span className={`${isExpired ? 'text-[#8E95A9]' : 'text-[#8E95A9]'} text-xl`}>••••</span>
    <span className={`${isExpired ? 'text-[#8E95A9]' : 'text-[#8E95A9]'} text-xl`}>••••</span>
    <span className={`font-bold font-mono tracking-widest ${isExpired ? 'line-through' : ''}`}>{last4}</span>
  </div>
);

const VisaLogo = () => (
  <div className="w-12 h-8 bg-[#1A1F71] rounded-lg flex items-center justify-center shadow-inner">
    <span className="text-white font-extrabold italic text-[11px] tracking-wider relative top-[1px]">VISA</span>
  </div>
);

const MastercardLogo = () => (
  <div className="w-12 h-8 bg-slate-50 rounded-lg flex items-center justify-center relative border border-slate-100">
    <div className="w-[18px] h-[18px] rounded-full bg-[#EB001B] mix-blend-multiply opacity-90 absolute left-[12px]"></div>
    <div className="w-[18px] h-[18px] rounded-full bg-[#F79E1B] mix-blend-multiply opacity-90 absolute right-[12px]"></div>
  </div>
);

const AmexLogo = () => (
  <div className="w-12 h-8 bg-[#2E77BC] rounded-lg flex items-center justify-center shadow-inner">
    <span className="text-white font-bold text-[7px] tracking-widest text-center leading-[1.1] relative top-[1px]">AMERICAN<br />EXPRESS</span>
  </div>
);

const AddCardModal = ({ isOpen, onClose }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isDefault, setIsDefault] = useState(true);

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-[#1B1D28]/40 backdrop-blur-sm z-50 flex flex-col justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`bg-white rounded-t-[40px] p-6 pb-10 w-full shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#1B1D28]">Add Card</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[#8E95A9] hover:bg-slate-200 hover:text-[#1B1D28] transition-colors"
          >
            <i className="ph-bold ph-x text-sm"></i>
          </button>
        </div>

        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-semibold text-[#1B1D28] mb-2 pl-1">Card Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="ph-fill ph-credit-card text-[#8E95A9] text-xl"></i>
              </div>
              <input
                type="tel"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="block w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-[#EAECEF] bg-[#F8F9FB] text-[#1B1D28] placeholder-[#8E95A9] focus:outline-none focus:ring-4 focus:ring-[#7047EB]/20 focus:border-[#7047EB] focus:bg-white transition-all text-[15px] font-semibold font-mono tracking-widest"
                placeholder="0000 0000 0000 0000"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <div className="w-8 h-5 bg-[#1A1F71] rounded flex items-center justify-center opacity-40">
                  <span className="text-white font-bold italic text-[7px]">VISA</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1B1D28] mb-2 pl-1">Expiry Date</label>
              <input
                type="tel"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="block w-full px-4 py-4 rounded-2xl border-2 border-[#EAECEF] bg-[#F8F9FB] text-[#1B1D28] placeholder-[#8E95A9] focus:outline-none focus:ring-4 focus:ring-[#7047EB]/20 focus:border-[#7047EB] focus:bg-white transition-all text-[15px] font-semibold"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1B1D28] mb-2 pl-1">CVV</label>
              <div className="relative">
                <input
                  type="tel"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="block w-full px-4 py-4 rounded-2xl border-2 border-[#EAECEF] bg-[#F8F9FB] text-[#1B1D28] placeholder-[#8E95A9] focus:outline-none focus:ring-4 focus:ring-[#7047EB]/20 focus:border-[#7047EB] focus:bg-white transition-all text-[15px] font-semibold"
                  placeholder="123"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <i className="ph-fill ph-info text-[#8E95A9] text-lg"></i>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1B1D28] mb-2 pl-1">Cardholder Name</label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="block w-full px-4 py-4 rounded-2xl border-2 border-[#EAECEF] bg-[#F8F9FB] text-[#1B1D28] placeholder-[#8E95A9] focus:outline-none focus:ring-4 focus:ring-[#7047EB]/20 focus:border-[#7047EB] focus:bg-white transition-all text-[15px] font-semibold"
              placeholder="Name on card"
            />
          </div>

          <div className="bg-[#F8F9FB] border border-[#EAECEF] rounded-2xl p-4 flex items-center justify-between mt-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#1B1D28]">Set as default</span>
              <span className="text-xs font-medium text-[#8E95A9] mt-0.5">Use for future subscriptions</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-[#EAECEF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7047EB]"></div>
            </label>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-full bg-[#1B1D28] text-white font-bold py-4 rounded-full mt-4 shadow-[0_8px_20px_-6px_rgba(27,29,40,0.4)] hover:bg-black active:scale-[0.98] transition-all"
          >
            Save Card
          </button>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed inset-0 bg-[#1B1D28]/40 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300 p-6 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-white rounded-[32px] p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}
      >
        <div className="absolute -top-10 w-20 h-20 bg-white rounded-full flex items-center justify-center p-2 shadow-sm">
          <div className="w-full h-full bg-[#FFF0F3] text-[#FF3E5D] rounded-full flex items-center justify-center">
            <i className="ph-fill ph-warning-circle text-4xl"></i>
          </div>
        </div>

        <div className="mt-10 mb-2">
          <h3 className="text-xl font-bold tracking-tight text-[#1B1D28] mb-2">Delete Payment Method?</h3>
          <p className="text-[#8E95A9] text-sm font-medium leading-relaxed px-2">
            Are you sure you want to remove this Visa card? It is currently linked to <strong className="text-[#1B1D28]">3 active subscriptions</strong>.
          </p>
        </div>

        <div className="bg-[#FFF0F3] border border-[#FF3E5D]/20 rounded-xl p-3 w-full flex items-start gap-2 text-left mb-6">
          <i className="ph-fill ph-info text-[#FF3E5D] text-lg shrink-0 mt-0.5"></i>
          <p className="text-xs font-semibold text-[#FF3E5D] leading-snug">You will need to set a new payment method for these subscriptions to avoid interruptions.</p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-[#F8F9FB] border border-[#EAECEF] text-[#1B1D28] font-bold rounded-full hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-[#FF3E5D] text-white font-bold rounded-full shadow-[0_8px_20px_-6px_rgba(255,62,93,0.4)] hover:bg-[#E63854] transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const phosphorScript = document.createElement('script');
    phosphorScript.src = 'https://unpkg.com/@phosphor-icons/web';
    document.head.appendChild(phosphorScript);

    const style = document.createElement('style');
    style.textContent = `
      body { -webkit-tap-highlight-color: transparent; }
      ::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      className="w-full min-h-screen text-[#1B1D28] antialiased bg-[#F8F9FB] relative flex flex-col"
      style={customStyles}
    >
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center sticky top-0 bg-[#F8F9FB]/95 backdrop-blur-xl z-30 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <button className="w-10 h-10 bg-white rounded-[14px] flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] text-[#1B1D28] hover:bg-gray-50 transition-colors border border-slate-100">
          <i className="ph-bold ph-arrow-left text-lg"></i>
        </button>
        <h1 className="text-lg font-bold tracking-tight text-[#1B1D28]">Payment Methods</h1>
        <button
          onClick={() => setAddModalOpen(true)}
          className="w-10 h-10 bg-[#7047EB]/10 rounded-[14px] flex items-center justify-center text-[#7047EB] hover:bg-[#7047EB]/20 transition-colors"
        >
          <i className="ph-bold ph-plus text-lg"></i>
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 pt-6 pb-32 flex flex-col flex-1 relative z-10">
        <div className="flex flex-col gap-4">

          {/* Visa Card - Default */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.04)] border border-slate-100 transition-transform active:scale-[0.99]">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <VisaLogo />
                <span className="text-[10px] font-bold text-[#7047EB] bg-[#F4F1FF] px-2 py-1 rounded-md uppercase tracking-widest border border-[#7047EB]/10">Default</span>
              </div>
              <div className="flex gap-1.5 text-[#8E95A9]">
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 hover:text-[#7047EB] transition-colors"
                >
                  <i className="ph-bold ph-pencil-simple text-[17px]"></i>
                </button>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FFF0F3] hover:text-[#FF3E5D] transition-colors"
                >
                  <i className="ph-bold ph-trash text-[17px]"></i>
                </button>
              </div>
            </div>

            <div className="mb-5 pl-1">
              {cardNumberDisplay('4242')}
              <div className="flex justify-between text-sm text-[#8E95A9] font-medium">
                <span>Alex Student</span>
                <span>12/25</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between pl-1">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#7047EB] bg-[#F4F1FF] px-3 py-1.5 rounded-lg">
                <i className="ph-fill ph-link text-base"></i>
                <span>3 subscriptions</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
            </div>
          </div>

          {/* Mastercard */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.04)] border border-slate-100 transition-transform active:scale-[0.99]">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <MastercardLogo />
              </div>
              <div className="flex gap-1.5 text-[#8E95A9]">
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 hover:text-[#7047EB] transition-colors"
                >
                  <i className="ph-bold ph-pencil-simple text-[17px]"></i>
                </button>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FFF0F3] hover:text-[#FF3E5D] transition-colors"
                >
                  <i className="ph-bold ph-trash text-[17px]"></i>
                </button>
              </div>
            </div>

            <div className="mb-5 pl-1">
              {cardNumberDisplay('8888')}
              <div className="flex justify-between text-sm text-[#8E95A9] font-medium">
                <span>Alex Student</span>
                <span>08/26</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between pl-1">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                <i className="ph-fill ph-link text-base"></i>
                <span>2 subscriptions</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
            </div>
          </div>

          {/* Amex - Expired */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_-6px_rgba(255,62,93,0.08)] border border-[#FF3E5D]/30 transition-transform active:scale-[0.99] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#FF3E5D]"></div>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3 pl-2">
                <AmexLogo />
                <span className="text-[10px] font-bold text-[#FF3E5D] bg-[#FFF0F3] px-2 py-1 rounded-md uppercase tracking-widest border border-[#FF3E5D]/20 flex items-center gap-1">
                  <i className="ph-bold ph-warning"></i> Expired
                </span>
              </div>
              <div className="flex gap-1.5 text-[#8E95A9]">
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-50 hover:text-[#7047EB] transition-colors"
                >
                  <i className="ph-bold ph-pencil-simple text-[17px]"></i>
                </button>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FFF0F3] hover:text-[#FF3E5D] transition-colors text-[#FF3E5D]"
                >
                  <i className="ph-bold ph-trash text-[17px]"></i>
                </button>
              </div>
            </div>

            <div className="mb-5 pl-3">
              <div className="text-[16px] font-medium tracking-[0.15em] text-[#8E95A9] mb-1.5 flex items-center gap-2 opacity-70">
                <span className="text-xl">••••</span>
                <span className="text-xl">••••</span>
                <span className="text-xl">••••</span>
                <span className="font-bold font-mono tracking-widest line-through">1001</span>
              </div>
              <div className="flex justify-between text-sm text-[#FF3E5D] font-medium opacity-80">
                <span>Alex Student</span>
                <span className="font-bold">01/23</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between pl-3">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#8E95A9]">
                <i className="ph ph-link-break text-base"></i>
                <span>0 subscriptions</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"></div>
            </div>
          </div>

        </div>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-[#8E95A9] mt-10">
          <i className="ph-fill ph-lock-key text-lg"></i>
          <span className="text-xs font-semibold">Your payment data is encrypted and secure</span>
        </div>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full px-6 pb-8 pt-6 bg-gradient-to-t from-[#F8F9FB] via-[#F8F9FB] to-transparent z-20">
        <button
          onClick={() => setAddModalOpen(true)}
          className="w-full bg-[#7047EB] text-white font-bold py-4 rounded-full shadow-[0_8px_24px_-6px_rgba(112,71,235,0.4)] hover:bg-[#5E35D9] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <i className="ph-bold ph-plus text-xl"></i>
          Add Payment Method
        </button>
      </div>

      {/* Add Card Modal */}
      <AddCardModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />

      {/* Delete Modal */}
      <DeleteModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </div>
  );
};

export default App;