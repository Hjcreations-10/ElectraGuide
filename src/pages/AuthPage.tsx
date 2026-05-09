import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Vote, Mail, Lock, User, ShieldCheck, Eye, EyeOff, AlertCircle, Loader2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  onSuccess?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', voterId: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      onSuccess?.();
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.response?.data?.message || err.message || 'Identity synchronization failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#05070a]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-100px] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-20 pointer-events-none mix-blend-overlay" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[480px] relative z-10"
      >
        {/* Brand Identity */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/40 relative group"
          >
            <div className="absolute inset-0 bg-white/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Vote size={40} className="text-white relative z-10" />
          </motion.div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
            ELECTRA<span className="text-primary">GUIDE</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
             <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-faint">Secure Verification Protocol Active</p>
          </div>
        </div>

        <div className="glass p-10 border-t-4 border-t-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] rotate-12">
             <ShieldCheck size={160} />
          </div>

          {/* Tab Selector */}
          <div className="flex bg-black/40 rounded-2xl p-1.5 mb-10 border border-white/5 relative z-10">
            {['Login', 'Register'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(tab === 'Login'); setError(''); }}
                className={`
                  flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300
                  ${(tab === 'Login') === isLogin 
                    ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]' 
                    : 'text-text-faint hover:text-text-muted'}
                `}
              >{tab}</button>
            ))}
          </div>

          {/* Alerts */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-danger/10 border border-danger/20 rounded-2xl p-4 mb-8 flex items-center gap-4 text-danger text-xs font-bold relative z-10"
              >
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  key="name-field"
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="relative group">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint group-focus-within:text-primary transition-colors" />
                    <input className="input pl-12" type="text" placeholder="Full Legal Name" required value={form.name} onChange={set('name')} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint group-focus-within:text-primary transition-colors" />
              <input className="input pl-12" type="email" placeholder="Credential Identifier (Email)" required value={form.email} onChange={set('email')} />
            </div>

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div 
                  key="voter-id-field"
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <div className="relative group">
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-success group-focus-within:text-success/80 transition-colors" />
                    <input className="input pl-12 border-success/20 focus:border-success/40 focus:bg-success/5" type="text" placeholder="Voter ID (EPIC Number)" required value={form.voterId} onChange={set('voterId')} />
                  </div>
                  <div className="flex items-center gap-2 px-1">
                     <ShieldCheck size={12} className="text-success" />
                     <p className="text-[10px] font-black text-success uppercase tracking-widest">Electoral Node Verification Active</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint group-focus-within:text-primary transition-colors" />
              <input className="input pl-12 pr-12" type={showPassword ? 'text' : 'password'} placeholder="Security Access Key" required value={form.password} onChange={set('password')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-faint hover:text-text transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="btn-primary w-full py-5 rounded-2xl group shadow-2xl mt-4" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-3">
                   <Loader2 size={20} className="animate-spin" />
                   <span className="animate-pulse">Authorizing...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-3">
                   {isLogin ? 'Establish Secure Session' : 'Register Identity'}
                   <ShieldCheck size={18} className="group-hover:rotate-12 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Demo Access */}
          <div className="mt-10 p-6 bg-primary/5 rounded-[2rem] border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
               <Lock size={64} />
            </div>
            <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-4 flex items-center gap-2">
               <Zap size={12} /> Sandbox Access
            </p>
            <div className="space-y-3 font-mono text-[11px] text-text-muted">
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                 <span className="text-text-faint">ADMIN</span>
                 <span className="text-text font-black">admin@electra.gov</span>
              </div>
              <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                 <span className="text-text-faint">VOTER</span>
                 <span className="text-text font-black">voter@electra.gov</span>
              </div>
              <p className="text-[9px] text-center text-text-faint italic mt-2">Passcode: Admin@123 | Voter@123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
