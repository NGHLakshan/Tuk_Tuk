import React, { useState, useEffect } from 'react';
import { useFinance } from './hooks/useFinance';
import {
  PlusCircle,
  MinusCircle,
  BarChart3,
  Settings as SettingsIcon,
  Wallet,
  TrendingUp,
  TrendingDown,
  Fuel,
  History,
  FileText,
  Lock,
  Trash2,
  AlertTriangle,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Analytics } from './components/Analytics';

const App = () => {
  const { data, settings, updateSettings, exportData, addTransaction, deleteTransaction, updateTransaction, getDaySummary, resetData, today } = useFinance();
  const [activeTab, setActiveTab] = useState('wallet');
  const [showEntry, setShowEntry] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!settings.pinEnabled);
  const [pinInput, setPinInput] = useState('');
  const [pinEditState, setPinEditState] = useState('idle'); // 'idle', 'verify', 'new'
  const [tempPin, setTempPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [pinError, setPinError] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const summary = getDaySummary();

  const handleTransaction = (details) => {
    addTransaction(details);
    setShowEntry(null);
  };

  const handleDeleteTransaction = (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowEntry(transaction.type);
  };

  const verifyPin = (digit) => {
    setPinInput(prev => {
      const newPin = (prev + digit).slice(0, 4);
      if (newPin.length === 4) {
        if (newPin === settings.pin) {
          setIsAuthenticated(true);
        } else {
          // Play error animation or reset
          setTimeout(() => setPinInput(''), 300);
        }
      }
      return newPin;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isAuthenticated && settings.pinEnabled) {
        if (/[0-9]/.test(e.key)) {
          verifyPin(e.key);
        } else if (e.key === 'Backspace') {
          setPinInput(p => p.slice(0, -1));
        } else if (e.key === 'Escape') {
          setPinInput('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, settings.pinEnabled, pinInput]);

  if (!isAuthenticated && settings.pinEnabled) {
    return (
      <div className="min-h-screen bg-tuk-dark flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-tuk-amber/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-tuk-amber/20 shadow-lg shadow-tuk-amber/5">
            <Lock className="text-tuk-amber" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Security Lock</h2>
          <p className="text-slate-500 text-sm">Enter the 4-digit PIN to continue</p>
          {settings.pin === '1234' && (
            <p className="text-tuk-amber/50 text-[10px] mt-4 uppercase tracking-widest">Default PIN: 1234</p>
          )}
        </motion.div>

        <div className="flex gap-4 mb-16">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pinInput.length > i ? 'bg-tuk-amber border-tuk-amber scale-110 shadow-lg shadow-tuk-amber/20' : 'border-slate-800 bg-slate-900'
                }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-xs w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map((btn, i) => (
            <button
              key={i}
              onClick={() => {
                if (btn === 'C') setPinInput('');
                else if (btn === '←') setPinInput(p => p.slice(0, -1));
                else verifyPin(btn);
              }}
              className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 text-white text-xl font-bold active:bg-tuk-amber active:text-tuk-dark transition-all flex items-center justify-center"
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-24 pt-6 px-4 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl text-tuk-amber">Tuk-Tuk Finance</h1>
          <p className="text-slate-400 text-sm">{format(new Date(), 'EEEE, do MMMM')}</p>
        </div>
        <button
          onClick={() => setActiveTab('settings')}
          className="glass-card !p-2 active:scale-95 transition-transform"
        >
          <SettingsIcon className={activeTab === 'settings' ? 'text-tuk-amber' : 'text-slate-400'} size={20} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'wallet' && (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Main Status Card */}
            <div className="glass-card mb-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-tuk-amber/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-tuk-amber/10 rounded-lg">
                  <Wallet className="text-tuk-amber" size={24} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Estimated Cash in Hand</p>
                  <h2 className="text-4xl font-black text-white leading-none">Rs. {(Number(settings.startingBalance) + summary.profit).toLocaleString()}</h2>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-700/30">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Income</p>
                  <p className="text-sm font-bold text-tuk-emerald">Rs. {summary.income.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-700/30">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Expenses</p>
                  <p className="text-sm font-bold text-tuk-rose">Rs. {summary.expenses.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-700/30">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Rent</p>
                  <p className="text-sm font-bold text-slate-400">Rs. {Number(settings.dailyRent).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Today's Profit</span>
                <span className={`text-sm font-black ${summary.profit >= 0 ? 'text-tuk-emerald' : 'text-tuk-rose'}`}>
                  {summary.profit >= 0 ? '+' : ''} Rs. {summary.profit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setShowEntry('income')}
                className="btn-secondary !bg-tuk-emerald/5 !border-tuk-emerald/20 flex flex-col items-center gap-2 py-6 hover:bg-tuk-emerald/10"
              >
                <div className="p-3 bg-tuk-emerald/20 rounded-2xl">
                  <PlusCircle className="text-tuk-emerald" size={24} />
                </div>
                <span className="text-tuk-emerald font-bold">Income</span>
              </button>
              <button
                onClick={() => setShowEntry('expense')}
                className="btn-secondary !bg-tuk-rose/5 !border-tuk-rose/20 flex flex-col items-center gap-2 py-6 hover:bg-tuk-rose/10"
              >
                <div className="p-3 bg-tuk-rose/20 rounded-2xl">
                  <MinusCircle className="text-tuk-rose" size={24} />
                </div>
                <span className="text-tuk-rose font-bold">Expense</span>
              </button>
            </div>

            {/* Fuel Card */}
            <div className="glass-card mb-8 border-slate-700/30 flex items-center justify-between group cursor-pointer active:bg-slate-800/80 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-700">
                  <Fuel className="text-tuk-amber" size={20} />
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Fuel Efficiency</span>
                  <span className="text-white font-bold">Rs. {summary.fuelEfficiency.toFixed(2)} / km</span>
                </div>
              </div>
              <TrendingUp className={summary.fuelEfficiency > 0 ? "text-tuk-rose opacity-50" : "text-slate-700"} size={16} />
            </div>

            {/* Recent Activity */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} className="text-tuk-amber" />
                  Activities
                </h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-[10px] text-tuk-amber font-bold uppercase tracking-widest hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {summary.transactions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
                    No records for today yet
                  </div>
                ) : (
                  summary.transactions.slice(0, 5).reverse().map(t => (
                    <div key={t.id} className="glass-card !p-3 flex justify-between items-center hover:bg-slate-800/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-tuk-emerald/10' : 'bg-tuk-rose/10'}`}>
                          {t.type === 'income' ? <TrendingUp size={16} className="text-tuk-emerald" /> : <TrendingDown size={16} className="text-tuk-rose" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200">{t.note || (t.type === 'income' ? 'Trip' : 'Expense')}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{format(new Date(t.timestamp), 'hh:mm a')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <p className={`font-bold mr-2 ${t.type === 'income' ? 'text-tuk-emerald' : 'text-tuk-rose'}`}>
                          {t.type === 'income' ? '+' : '-'} Rs. {Number(t.amount).toLocaleString()}
                        </p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditTransaction(t); }}
                          className="p-2 text-slate-600 hover:text-tuk-amber transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(t.id); }}
                          className="p-2 text-slate-600 hover:text-tuk-rose transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <BarChart3 className="text-tuk-amber" size={20} />
              Performance Analysis
            </h3>
            <Analytics transactions={data.transactions} />

            <div className="mt-8 space-y-4">
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Monthly Summary</h4>
              <div className="glass-card grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-white">Rs. {data.transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-white">Rs. {data.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <History className="text-tuk-amber" size={20} />
              Activity History
            </h3>
            <div className="space-y-4">
              {data.transactions.length === 0 ? (
                <div className="text-center py-20 text-slate-500">No history available.</div>
              ) : (
                [...data.transactions].reverse().map(t => (
                  <div key={t.id} className="glass-card !p-3 flex justify-between items-center bg-slate-800/20">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-tuk-emerald/10' : 'bg-tuk-rose/10'}`}>
                        {t.type === 'income' ? <TrendingUp size={16} className="text-tuk-emerald" /> : <TrendingDown size={16} className="text-tuk-rose" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200">{t.note || (t.type === 'income' ? 'Trip' : 'Expense')}</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {format(new Date(t.timestamp), 'MMM dd, hh:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <p className={`font-bold mr-2 ${t.type === 'income' ? 'text-tuk-emerald' : 'text-tuk-rose'}`}>
                        {t.type === 'income' ? '+' : '-'} Rs. {Number(t.amount).toLocaleString()}
                      </p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditTransaction(t); }}
                        className="p-2 text-slate-600 hover:text-tuk-amber transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(t.id); }}
                        className="p-2 text-slate-600 hover:text-tuk-rose transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <SettingsIcon className="text-tuk-amber" size={20} />
              App Settings
            </h3>

            <div className="space-y-4">
              <div className="glass-card space-y-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block tracking-widest">Fixed Daily Rent (Rs.)</label>
                  <input
                    type="number"
                    value={settings.dailyRent}
                    onChange={(e) => updateSettings({ dailyRent: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:ring-2 focus:ring-tuk-amber"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block tracking-widest">Starting Hand Cash (Rs.)</label>
                  <input
                    type="number"
                    value={settings.startingBalance}
                    onChange={(e) => updateSettings({ startingBalance: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold focus:ring-2 focus:ring-tuk-amber"
                  />
                </div>
              </div>

              <div className="glass-card flex items-center justify-between p-5 border-tuk-emerald/10">
                <div>
                  <p className="font-bold text-white">Data Backup</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Export your records to Excel</p>
                </div>
                <button
                  onClick={exportData}
                  className="p-3 bg-tuk-emerald/10 rounded-xl text-tuk-emerald hover:bg-tuk-emerald/20 transition-colors"
                >
                  <FileText size={20} />
                </button>
              </div>

              <div className="glass-card p-5 border-tuk-rose/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-white">PIN Lock Security</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Protect your financial data</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ pinEnabled: !settings.pinEnabled })}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.pinEnabled ? 'bg-tuk-amber' : 'bg-slate-800'}`}
                  >
                    <motion.div
                      animate={{ x: settings.pinEnabled ? 24 : 4 }}
                      className={`absolute top-1 bottom-1 w-4 rounded-full ${settings.pinEnabled ? 'bg-tuk-dark' : 'bg-slate-600'}`}
                    />
                  </button>
                </div>

                {settings.pinEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-4 mt-2 border-t border-slate-800"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] text-slate-500 uppercase font-bold block tracking-widest leading-none">
                        Change 4-Digit PIN
                      </label>
                      {pinMessage && (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-[10px] text-tuk-emerald bg-tuk-emerald/10 px-2 py-0.5 rounded-md font-bold"
                        >
                          {pinMessage}
                        </motion.span>
                      )}
                    </div>
                    
                    {pinEditState === 'idle' ? (
                       <button 
                         onClick={() => { setPinEditState('verify'); setTempPin(''); setPinMessage(''); setPinError(false); }} 
                         className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 text-slate-400 font-bold tracking-[0.7em] text-center focus:outline-none hover:border-slate-700 hover:text-white hover:bg-slate-800/50 transition-all flex justify-center items-center h-[60px]"
                       >
                         ••••
                       </button>
                    ) : (
                       <div className="space-y-4">
                         <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-4">
                           <p className="text-center text-xs text-slate-400 font-bold mb-4">
                             {pinEditState === 'verify' ? 'Confirm your current PIN' : 'Enter your new PIN'}
                           </p>
                           
                           <div className="flex justify-center gap-3 mb-2 relative">
                             {/* Floating invisible input to capture mobile keyboard correctly */}
                             <input
                               type="text"
                               inputMode="numeric"
                               maxLength={4}
                               autoFocus
                               value={tempPin}
                               onChange={(e) => {
                                 const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                                 setTempPin(val);
                                 setPinError(false);
                               }}
                               className="absolute inset-0 w-full h-full opacity-0 text-transparent bg-transparent cursor-text focus:outline-none z-10"
                             />
                             
                             {/* Visual boxes representing the 4 digits */}
                             {[0, 1, 2, 3].map((index) => (
                               <div 
                                 key={index}
                                 className={`w-12 h-14 rounded-lg flex items-center justify-center text-xl font-bold transition-all ${
                                   pinError 
                                    ? 'bg-tuk-rose/10 border-2 border-tuk-rose text-tuk-rose' 
                                    : tempPin.length === index 
                                      ? 'bg-slate-800 border-2 border-tuk-amber shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                                      : tempPin.length > index
                                        ? 'bg-slate-800 border border-slate-600 text-white'
                                        : 'bg-slate-900 border border-slate-800'
                                 }`}
                               >
                                 {tempPin[index] ? '•' : ''}
                               </div>
                             ))}
                           </div>
                           
                           {pinError && (
                             <motion.p 
                               initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                               className="text-[10px] text-tuk-rose font-bold text-center mt-2"
                             >
                               Incorrect PIN. Please try again.
                             </motion.p>
                           )}
                         </div>

                         <div className="flex gap-3">
                           <button 
                             onClick={() => { setPinEditState('idle'); setTempPin(''); setPinError(false); }}
                             className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 hover:text-white hover:bg-slate-800 transition-colors"
                           >
                             Cancel
                           </button>
                           <button 
                             disabled={tempPin.length !== 4}
                             onClick={() => {
                               if (pinEditState === 'verify') {
                                 if (tempPin === settings.pin) {
                                   setPinEditState('new');
                                   setTempPin('');
                                   setPinError(false);
                                 } else {
                                   setPinError(true);
                                   setTempPin('');
                                 }
                               } else {
                                 updateSettings({ pin: tempPin });
                                 setPinEditState('idle');
                                 setTempPin('');
                                 setPinMessage('Successfully Updated');
                                 setTimeout(() => setPinMessage(''), 3000);
                               }
                             }}
                             className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all shadow-lg ${
                               tempPin.length === 4 
                                 ? 'bg-tuk-amber text-tuk-dark shadow-tuk-amber/20 hover:scale-[1.02] active:scale-[0.98]' 
                                 : 'bg-slate-800 text-slate-500 shadow-none'
                             }`}
                           >
                             {pinEditState === 'verify' ? 'Next' : 'Save'}
                           </button>
                         </div>
                       </div>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="glass-card p-5 border-tuk-rose/20 bg-tuk-rose/5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-tuk-rose/20 rounded-2xl text-tuk-rose">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-white">Danger Zone</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Irreversible Actions</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('CRITICAL: This will PERMANENTLY DELETE all your transactions and reset settings to default. Are you absolutely sure?')) {
                      resetData();
                      setActiveTab('wallet');
                      alert('App has been reset successfully.');
                    }
                  }}
                  className="w-full py-4 bg-tuk-rose/10 border border-tuk-rose/30 rounded-xl text-tuk-rose font-bold hover:bg-tuk-rose hover:text-white transition-all active:scale-[0.98]"
                >
                  Reset All Data
                </button>
              </div>

              <div className="text-center pt-4">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Tuk-Tuk Finance v1.0.0</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/90 backdrop-blur-2xl border-t border-slate-800 flex justify-around py-4 px-6 safe-area-bottom rounded-t-[32px] shadow-2xl z-40">
        <NavButton
          icon={<Wallet size={20} />}
          label="Wallet"
          active={activeTab === 'wallet'}
          onClick={() => setActiveTab('wallet')}
        />
        <NavButton
          icon={<BarChart3 size={20} />}
          label="Reports"
          active={activeTab === 'reports'}
          onClick={() => setActiveTab('reports')}
        />
        <NavButton
          icon={<History size={20} />}
          label="History"
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        />
        <NavButton
          icon={<SettingsIcon size={20} />}
          label="Settings"
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        />
      </div>

      {/* Entry Modal Overlay */}
      <AnimatePresence>
        {showEntry && (
          <TransactionModal
            type={showEntry}
            initialData={editingTransaction}
            onClose={() => { setShowEntry(null); setEditingTransaction(null); }}
            onSubmit={(val) => {
              if (editingTransaction) {
                updateTransaction(editingTransaction.id, val);
              } else {
                addTransaction({ ...val, type: showEntry });
              }
              setShowEntry(null);
              setEditingTransaction(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-tuk-amber scale-110' : 'text-slate-500 active:scale-95'}`}
  >
    <div className={active ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''}>
      {icon}
    </div>
    <span className="text-[10px] uppercase tracking-tighter font-extrabold">{label}</span>
  </button>
);

const TransactionModal = ({ type, onClose, onSubmit, initialData }) => {
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [category, setCategory] = useState(initialData?.category || (type === 'income' ? 'passenger' : 'food'));
  const [distance, setDistance] = useState(initialData?.distance || '');

  const categories = type === 'income'
    ? ['passenger', 'service', 'other']
    : ['fuel', 'rent', 'food', 'repair', 'parking', 'other'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end justify-center px-0 pb-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="bg-[#0f172a] w-full max-w-md rounded-t-[40px] p-8 border-t border-slate-800 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-8" />

        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
            <div className={`p-2 rounded-xl ${type === 'income' ? 'bg-tuk-emerald/20 text-tuk-emerald' : 'bg-tuk-rose/20 text-tuk-rose'}`}>
              {type === 'income' ? <PlusCircle size={24} /> : <MinusCircle size={24} />}
            </div>
            {initialData ? 'Edit Entry' : (type === 'income' ? 'Add Income' : 'Add Expense')}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white">
            <SettingsIcon className="rotate-45" size={24} />
          </button>
        </div>

        <div className="space-y-6 mb-10">
          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold mb-3 block tracking-widest">Select Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${category === cat
                    ? 'bg-tuk-amber text-tuk-dark border-tuk-amber'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={category === 'fuel' ? 'col-span-1' : 'col-span-2'}>
              <label className="text-[10px] text-slate-500 uppercase font-bold mb-3 block tracking-widest">Amount (Rs.)</label>
              <input
                autoFocus
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-2xl font-bold text-white focus:ring-2 focus:ring-tuk-amber outline-none transition-all"
              />
            </div>

            {category === 'fuel' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <label className="text-[10px] text-slate-500 uppercase font-bold mb-3 block tracking-widest">Distance (km)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={e => setDistance(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-2xl font-bold text-white focus:ring-2 focus:ring-tuk-amber outline-none"
                />
              </motion.div>
            )}
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase font-bold mb-3 block tracking-widest">Notes</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="E.g. Morning shift, 95 Octane..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-tuk-amber outline-none"
            />
          </div>
        </div>

        <button
          onClick={() => onSubmit({ amount, note, category, distance })}
          disabled={!amount}
          className={`w-full py-5 rounded-[22px] font-bold text-lg transition-all shadow-2xl ${type === 'income'
            ? 'bg-tuk-emerald text-white shadow-tuk-emerald/20 hover:bg-tuk-emerald/90'
            : 'bg-tuk-rose text-white shadow-tuk-rose/20 hover:bg-tuk-rose/90'
            } disabled:opacity-30 active:scale-[0.98] mb-4`}
        >
          {initialData ? 'Update Record' : (type === 'income' ? 'Record Earnings' : 'Record Expense')}
        </button>
      </motion.div>
    </motion.div>
  )
}

export default App;
