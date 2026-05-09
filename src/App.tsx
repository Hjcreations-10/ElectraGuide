import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Vote, LayoutDashboard, ShieldCheck, LogOut, 
  Menu, X, Bell, User as UserIcon, Settings, BarChart2, History, Shield
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import VoterDashboard from './pages/VoterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const App: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admin' | 'analytics' | 'settings'>('dashboard');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center"
        >
          <Vote className="text-white w-6 h-6" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Voter Hub', icon: LayoutDashboard, roles: ['voter', 'admin'] },
    { id: 'admin', label: 'Admin Hub', icon: ShieldCheck, roles: ['admin'] },
    { id: 'analytics', label: 'Intelligence', icon: BarChart2, roles: ['admin'] },
    { id: 'settings', label: 'Security', icon: Settings, roles: ['voter', 'admin'] },
  ];

  return (
    <div className="flex min-h-screen bg-bg text-text">
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50 h-screen transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-72' : 'w-20'}
        bg-bg-card border-r border-border flex flex-col
      `}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary-glow">
                <Vote className="text-white w-5 h-5" />
              </div>
              <span className="font-black italic tracking-tighter text-xl">ELECTRA</span>
            </motion.div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg text-text-muted">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.filter(item => item.roles.includes(user.role)).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200
                ${activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary-glow' : 'hover:bg-white/5 text-text-muted'}
              `}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-primary'} />
              {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className={`flex items-center gap-4 p-4 ${isSidebarOpen ? 'bg-white/5 rounded-2xl' : ''}`}>
            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center shrink-0">
              <UserIcon className="text-accent w-5 h-5" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 truncate">
                <p className="font-bold text-xs truncate">{user.name}</p>
                <p className="text-[10px] text-text-faint font-black uppercase tracking-widest">{user.role}</p>
              </div>
            )}
            {isSidebarOpen && (
              <button onClick={logout} className="p-2 hover:text-danger transition-colors">
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 h-20 bg-bg/80 backdrop-blur-md border-b border-border px-8 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-text-faint">
            System / {activeTab}
          </h2>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-text-muted hover:text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full ring-2 ring-bg" />
            </button>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold">{user.voterId}</p>
                <p className="text-[9px] text-success font-black uppercase tracking-widest">Verified Session</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-primary-glow p-1">
                <div className="w-full h-full bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {user.name[0]}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && <VoterDashboard />}
              {activeTab === 'admin' && user.role === 'admin' && <AdminDashboard />}
              {activeTab === 'analytics' && user.role === 'admin' && <AnalyticsDashboard />}
              {activeTab === 'settings' && (
                <div className="glass p-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-success/10 text-success rounded-3xl flex items-center justify-center mx-auto">
                    <ShieldCheck size={40} />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase">Security Configuration</h3>
                  <p className="text-text-muted max-w-md mx-auto">Your account is secured with military-grade SHA-256 encryption. Multi-factor authentication is active on this session.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
                    <div className="p-4 bg-white/5 rounded-xl border border-border">
                      <p className="text-[10px] font-black uppercase text-text-faint mb-1">Session Integrity</p>
                      <p className="text-xs font-bold text-success flex items-center gap-2">
                        <span className="w-2 h-2 bg-success rounded-full animate-pulse" /> Identity Verified
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-border">
                      <p className="text-[10px] font-black uppercase text-text-faint mb-1">One-User-One-Vote</p>
                      <p className="text-xs font-bold text-primary flex items-center gap-2">
                        <Shield size={12} /> Active Enforcement
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 text-left max-w-lg mx-auto">
                    <h4 className="text-[10px] font-black uppercase text-text-faint mb-4 tracking-[0.2em] flex items-center gap-2">
                      <History size={12} /> Real-time Security Log
                    </h4>
                    <div className="space-y-3 font-mono text-[11px] bg-black/20 p-4 rounded-xl border border-white/5">
                      <p className="text-success flex justify-between"><span>[SEC-AUTH] JWT Handshake Success</span> <span className="opacity-40">just now</span></p>
                      <p className="text-primary flex justify-between"><span>[SEC-BAL] One-Vote Logic Active</span> <span className="opacity-40">active</span></p>
                      <p className="text-text-muted flex justify-between"><span>[SEC-ENC] SHA-256 Tunnel Established</span> <span className="opacity-40">encrypted</span></p>
                      <p className="text-orange-400 flex justify-between"><span>[SEC-FRA] Fraud Monitor Heartbeat</span> <span className="opacity-40">listening</span></p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
