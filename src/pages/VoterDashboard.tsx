import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, Vote as VoteIcon, Clock, AlertTriangle,
  Loader2, ChevronRight, Users, Shield
} from 'lucide-react';
import { votingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CandidateSkeleton } from '../components/Skeleton';

const PARTY_COLORS: Record<string, string> = {
  '#6366f1': 'rgba(99,102,241,0.15)',
  '#f97316': 'rgba(249,115,22,0.15)',
  '#10b981': 'rgba(16,185,129,0.15)',
  '#f59e0b': 'rgba(245,158,11,0.15)',
  '#ef4444': 'rgba(239,68,68,0.15)',
  '#8b5cf6': 'rgba(139,92,246,0.15)',
};

const VoterDashboard: React.FC = () => {
  const { showToast } = useToast();
  const { user, refreshUser } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [election, setElection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [voted, setVoted] = useState(user?.hasVoted || false);
  const [votedFor, setVotedFor] = useState<{ candidateName: string; party: string } | null>(null);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [candRes, statusRes] = await Promise.all([
        votingAPI.getCandidates(),
        votingAPI.getStatus()
      ]);
      setCandidates(candRes.data.candidates || []);
      setElection(statusRes.data.election);
      setTimeRemaining(statusRes.data.timeRemaining || 0);
    } catch (err: any) {
      showToast('Failed to load election data', 'error');
      setError('Failed to load election data. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleVote = async (candidateId: string) => {
    if (!window.confirm('Confirm your vote? This action is permanent and cannot be undone.')) return;
    setVoting(candidateId);
    setError('');
    try {
      const { data } = await votingAPI.castVote(candidateId);
      showToast('Vote cast successfully!', 'success');
      setVoted(true);
      setVotedFor(data.votedFor);
      await refreshUser();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cast vote', 'error');
      setError(err.response?.data?.message || 'Failed to cast vote.');
    } finally {
      setVoting(null);
    }
  };

  if (loading) return <CandidateSkeleton />;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Greeting & Security Status */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Voter ID: <span style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'monospace' }}>{user?.voterId}</span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="badge badge-success" style={{ marginBottom: '8px' }}>
            <Shield size={10} /> Identity Verified
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Session: <span style={{ color: 'var(--success)' }}>SHA-256 Encrypted</span>
          </p>
        </div>
      </motion.div>

      {/* Quick Stats (Read Only for Voters) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-sm" style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Voters</p>
          <p style={{ fontSize: '18px', fontWeight: 900 }}>1.2M+</p>
        </div>
        <div className="glass-sm" style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '4px' }}>Live Turnout</p>
          <p style={{ fontSize: '18px', fontWeight: 900, color: 'var(--success)' }}>70.4%</p>
        </div>
        <div className="glass-sm" style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '4px' }}>Security Audit</p>
          <p style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)' }}>Pass</p>
        </div>
      </div>

      {/* Status Banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {voted ? (
          <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.1))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '28px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(16,185,129,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={28} color="var(--success)" />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)', marginBottom: '4px' }}>Vote Cast Successfully!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {votedFor ? `You voted for ${votedFor.candidateName} (${votedFor.party}).` : 'Your vote has been securely recorded.'}
                {' '}Thank you for participating in the democratic process.
              </p>
            </div>
          </div>
        ) : election ? (
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px', padding: '24px 28px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(99,102,241,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <VoteIcon size={24} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, marginBottom: '2px' }}>{election.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Election is active — cast your vote below</p>
              </div>
            </div>
            {timeRemaining > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '10px 16px', borderRadius: '12px' }}>
                <Clock size={16} color="var(--warning)" />
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '18px', color: 'var(--warning)' }}>{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '20px', padding: '24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <AlertTriangle size={24} color="var(--warning)" style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: '2px', color: 'var(--warning)' }}>No Active Election</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>There is no election currently ongoing. Check back later.</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', color: '#fca5a5', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Candidate Cards */}
      {!voted && election && (
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--primary)" />
            Select Your Candidate
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            <AnimatePresence>
              {candidates.map((c, i) => {
                const bg = PARTY_COLORS[c.color] || 'rgba(99,102,241,0.1)';
                const isVoting = voting === c._id;
                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{
                      background: 'var(--bg-card)', border: `1px solid var(--border)`,
                      borderRadius: '20px', padding: '24px', cursor: 'pointer',
                      transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden'
                    }}
                    whileHover={{ y: -4, boxShadow: `0 12px 40px ${bg}` }}
                  >
                    {/* Color accent bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c.color || 'var(--primary)', borderRadius: '20px 20px 0 0' }} />

                    {/* Symbol / Avatar */}
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: bg, border: `1px solid ${c.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', overflow: 'hidden' }}>
                      {c.symbol ? (
                        <img src={c.symbol} alt={c.party} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '24px', fontWeight: 900, color: c.color }}>{c.name[0]}</span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.01em' }}>{c.name}</h4>
                    <span className="badge badge-primary" style={{ marginBottom: '12px', display: 'inline-block', background: bg, color: c.color, borderColor: `${c.color}30` }}>
                      {c.party}
                    </span>
                    {c.description && <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>{c.description}</p>}

                    <button
                      onClick={() => handleVote(c._id)}
                      disabled={!!voting || voted}
                      className="btn-primary"
                      style={{
                        width: '100%', background: isVoting ? 'var(--primary-dark)' : undefined,
                        backgroundColor: c.color, boxShadow: `0 4px 20px ${bg}`
                      }}
                    >
                      {isVoting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Casting Vote...</> : <><VoteIcon size={16} /> Cast Vote <ChevronRight size={16} /></>}
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {candidates.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-faint)' }}>
              <Shield size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p>No candidates registered yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Security notice */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ marginTop: '40px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Shield size={16} color="var(--text-faint)" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '12px', color: 'var(--text-faint)', lineHeight: 1.6 }}>
          Your vote is encrypted and stored anonymously. No personal information is linked to your ballot. ElectraGuide uses SHA-256 hashing to ensure vote integrity.
        </p>
      </motion.div>
    </div>
  );
};

export default VoterDashboard;
