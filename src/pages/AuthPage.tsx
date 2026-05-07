import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Vote, Mail, Lock, User, ShieldCheck, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
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
      setError(err.response?.data?.message || err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-200px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
            <Vote size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '6px' }}>
            <span className="gradient-text">ElectraGuide</span>
          </h1>
          <p style={{ color: 'var(--text-faint)', fontSize: '14px' }}>Secure Digital Voting System</p>
        </div>

        <div className="glass" style={{ padding: '36px' }}>
          {/* Tab toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '28px' }}>
            {['Login', 'Register'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(tab === 'Login'); setError(''); }}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 700, transition: 'all 0.2s ease',
                  background: (tab === 'Login') === isLogin ? 'var(--primary)' : 'transparent',
                  color: (tab === 'Login') === isLogin ? 'white' : 'var(--text-faint)',
                  boxShadow: (tab === 'Login') === isLogin ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
                }}
              >{tab}</button>
            ))}
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fca5a5', fontSize: '13px', fontWeight: 500 }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name (register only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
                    <input className="input" type="text" placeholder="Full Name" required value={form.name} onChange={set('name')} style={{ paddingLeft: '42px' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input className="input" type="email" placeholder="Email Address" required value={form.email} onChange={set('email')} style={{ paddingLeft: '42px' }} />
            </div>

            {/* Voter ID (register only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <ShieldCheck size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--success)' }} />
                    <input className="input" type="text" placeholder="Voter ID (EPIC Number)" required value={form.voterId} onChange={set('voterId')} style={{ paddingLeft: '42px', border: '1px solid rgba(16,185,129,0.2)' }} />
                  </div>
                  <p style={{ marginTop: '6px', fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>🛡️ Official Election Commission Identity Verification</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input className="input" type={showPassword ? 'text' : 'password'} placeholder="Password" required value={form.password} onChange={set('password')} style={{ paddingLeft: '42px', paddingRight: '42px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', display: 'flex' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '4px' }}>
              {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : (isLogin ? 'Sign In Securely' : 'Create Account')}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(99,102,241,0.08)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.15)' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>🔑 Demo Credentials</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text)' }}>Admin:</strong> admin@electra.gov · pass: Admin@123</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text)' }}>Voter:</strong> voter@electra.gov · pass: Voter@123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
