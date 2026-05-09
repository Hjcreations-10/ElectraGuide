import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Vote, LayoutDashboard, ShieldCheck, LogOut, 
  Menu, X, Bell, User as UserIcon, Settings, BarChart2, History, Shield, Zap
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import VoterDashboard from './pages/VoterDashboard';
import SystemDashboard from './pages/SystemDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const App: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'system' | 'settings'>('dashboard');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#05070a]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20"
        >
          <Vote className="text-white w-8 h-8" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Voter Hub', icon: LayoutDashboard, roles: ['voter', 'admin'], desc: 'Ballot & AI Insights' },
    { id: 'system', label: 'Intelligence', icon: Zap, roles: ['admin'], desc: 'Real-time Analytics' },
    { id: 'settings', label: 'Identity', icon: Shield, roles: ['voter', 'admin'], desc: 'Security Settings' },
  ];

  return (
    <div className="flex h-screen bg-[#05070a] text-text overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50 h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isSidebarOpen ? 'w-80' : 'w-24'}
        bg-[#0b0f1a]/80 backdrop-blur-xl border-r border-white/5 flex flex-col
      `}>
        {/* Brand Logo */}
        <div className="p-8 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div 
                key="logo-full"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                  <Vote className="text-white w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black italic tracking-tighter text-xl leading-none">ELECTRA</span>
                  <span className="text-[9px] font-black tracking-[0.4em] text-primary">GUIDE v2.0</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="logo-mini"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mx-auto"
              >
                <Vote className="text-primary w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="hidden lg:flex p-2 hover:bg-white/5 rounded-lg text-text-faint hover:text-text transition-colors"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto custom-scrollbar">
          {menuItems.filter(item => item.roles.includes(user.role)).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative
                ${activeTab === item.id 
                  ? 'bg-gradient-to-r from-primary/20 to-transparent text-white border border-primary/20' 
                  : 'hover:bg-white/5 text-text-muted hover:text-text border border-transparent'}
              `}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute left-0 w-1.5 h-8 bg-primary rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`
                p-2.5 rounded-xl transition-all duration-300
                ${activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-white/5 group-hover:bg-primary/10 group-hover:text-primary'}
              `}>
                <item.icon size={20} />
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="font-bold text-sm tracking-tight whitespace-nowrap">{item.label}</span>
                  <span className="text-[10px] font-medium text-text-faint group-hover:text-text-muted transition-colors">{item.desc}</span>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-6">
          <div className={`
            flex items-center gap-4 p-4 transition-all duration-300
            ${isSidebarOpen ? 'bg-gradient-to-br from-white/5 to-transparent rounded-3xl border border-white/5' : ''}
          `}>
            <div className="relative shrink-0">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center border border-accent/20">
                <UserIcon className="text-accent w-5 h-5" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-[#0b0f1a]" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 truncate">
                <p className="font-black text-xs truncate uppercase tracking-tight">{user.name}</p>
                <p className="text-[9px] text-text-faint font-bold uppercase tracking-[0.2em]">{user.role}</p>
              </div>
            )}
            {isSidebarOpen && (
              <button 
                onClick={logout} 
                className="p-2 text-text-faint hover:text-danger transition-colors hover:bg-danger/10 rounded-lg"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Header */}
        <header className="h-24 bg-[#05070a]/50 backdrop-blur-md border-b border-white/5 px-8 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black italic uppercase tracking-tight">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-success">Live Session Secure</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-[10px] font-black text-text-faint uppercase tracking-[0.3em]">Identity Verification</p>
              <p className="text-xs font-mono font-bold text-primary">{user.voterId}</p>
            </div>
            
            <div className="h-10 w-px bg-white/5" />
            
            <div className="flex items-center gap-4">
              <button className="relative p-2.5 text-text-faint hover:text-text transition-all hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full border-2 border-[#05070a]" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-600/20 p-px">
                <div className="w-full h-full bg-[#05070a] rounded-2xl flex items-center justify-center text-primary font-black text-lg italic border border-primary/20">
                  {user.name[0]}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
          <div className="max-w-[1600px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                {activeTab === 'dashboard' && <VoterDashboard />}
                {activeTab === 'system' && user.role === 'admin' && <SystemDashboard />}
                {activeTab === 'settings' && (
                  <div className="glass p-16 text-center space-y-8 max-w-4xl mx-auto border-t-8 border-t-success relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 opacity-5">
                      <ShieldCheck size={200} />
                    </div>
                    <div className="w-24 h-24 bg-success/10 text-success rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-success/20">
                      <ShieldCheck size={48} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-4xl font-black italic uppercase tracking-tight">Identity & Security</h3>
                      <p className="text-text-muted text-lg max-w-2xl mx-auto">Your account is protected by ElectraGuide's state-of-the-art encryption protocols. We use SHA-256 hashing to ensure your vote remains truly anonymous and untraceable.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                      <SecurityModule label="Identity Status" value="Verified" status="success" icon={<UserIcon size={16} />} />
                      <SecurityModule label="Encryption" value="AES-256-GCM" status="primary" icon={<Shield size={16} />} />
                      <SecurityModule label="Session State" value="Encrypted" status="success" icon={<Zap size={16} />} />
                    </div>

                    <div className="pt-8 text-left">
                       <h4 className="text-xs font-black uppercase text-text-faint mb-4 tracking-[0.3em] flex items-center gap-2">
                         <History size={14} className="text-primary" /> Live Audit Log
                       </h4>
                       <div className="space-y-4 font-mono text-xs bg-black/40 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
                         <div className="flex justify-between items-center group">
                           <span className="text-success flex items-center gap-3">
                             <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> 
                             [SEC-01] Handshake protocol initialized successfully
                           </span>
                           <span className="opacity-30 group-hover:opacity-100 transition-opacity">0ms</span>
                         </div>
                         <div className="flex justify-between items-center group">
                           <span className="text-primary flex items-center gap-3">
                             <div className="w-1.5 h-1.5 bg-primary rounded-full" /> 
                             [SEC-02] Anonymization layer (SHA-256) activated
                           </span>
                           <span className="opacity-30 group-hover:opacity-100 transition-opacity">12ms</span>
                         </div>
                         <div className="flex justify-between items-center group">
                           <span className="text-text-muted flex items-center gap-3 pl-4.5">
                             [SEC-03] Secure tunnel established: 2048-bit RSA
                           </span>
                           <span className="opacity-30 group-hover:opacity-100 transition-opacity">45ms</span>
                         </div>
                       </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

const SecurityModule: React.FC<{ label: string; value: string; status: string; icon: any }> = ({ label, value, status, icon }) => (
  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-primary/20 transition-all group">
    <div className={`p-2 rounded-xl mb-4 w-fit ${status === 'success' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
      {icon}
    </div>
    <p className="text-[10px] font-black uppercase text-text-faint mb-1 tracking-widest">{label}</p>
    <p className={`text-sm font-black italic uppercase ${status === 'success' ? 'text-success' : 'text-primary'}`}>{value}</p>
  </div>
);

export default App;
