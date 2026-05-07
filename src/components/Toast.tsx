import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { ToastType } from '../context/ToastContext';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const config = {
    success: { icon: <CheckCircle2 size={18} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    error: { icon: <AlertCircle size={18} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    warning: { icon: <AlertTriangle size={18} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    info: { icon: <Info size={18} />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      style={{
        minWidth: '300px',
        maxWidth: '450px',
        background: 'rgba(17,24,39,0.95)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${config.color}33`,
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 16px ${config.color}11`,
      }}
    >
      <div style={{ color: config.color, display: 'flex' }}>{config.icon}</div>
      <p style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: 'white' }}>{message}</p>
      <button 
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '4px', borderRadius: '8px', display: 'flex' }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export default Toast;
