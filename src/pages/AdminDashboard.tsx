import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Users, Vote, ShieldAlert, Plus, Download, 
  Trash2, Play, Square, Loader2, AlertTriangle, CheckCircle2,
  TrendingUp, Clock, History, UserCheck, ShieldOff
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, AreaChart, Area
} from 'recharts';
import { useToast } from '../context/ToastContext';
import { DashboardSkeleton } from '../components/Skeleton';

interface AdminDashboardProps {
  onSwitchTab?: (tab: 'dashboard' | 'admin' | 'analytics' | 'settings') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSwitchTab }) => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showStartElection, setShowStartElection] = useState(false);
  
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', description: '', color: '#6366f1' });
  const [newElection, setNewElection] = useState({ title: '', startTime: '', endTime: '' });

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await adminAPI.getStats();
      if (data.success) {
        setData(data);
      }
    } catch (err: any) {
      showToast('Failed to fetch intelligence metrics', 'error');
      setError('Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.addCandidate(newCandidate);
      showToast(`${newCandidate.name} added to the ballot`, 'success');
      setShowAddCandidate(false);
      setNewCandidate({ name: '', party: '', description: '', color: '#6366f1' });
      fetchStats();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add candidate', 'error');
    }
  };

  const handleStartElection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.startElection(newElection);
      showToast(`Election window "${newElection.title}" is now LIVE`, 'success');
      setShowStartElection(false);
      fetchStats();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to start election', 'error');
    }
  };

  const handleEndElection = async () => {
    if (!window.confirm('Are you sure you want to end the current election?')) return;
    try {
      await adminAPI.endElection();
      showToast('Election window has been closed successfully', 'success');
      fetchStats();
    } catch (err) {
      showToast('System failed to terminate the election cycle', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await adminAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'electraguide_export.csv');
      document.body.appendChild(link);
      link.click();
      showToast('Power BI Dataset ready for download', 'success');
    } catch (err) {
      showToast('Data export failed. Check server connection.', 'error');
    }
  };

  const handleUnflagUser = async (userId: string) => {
    try {
      await adminAPI.unflagUser(userId);
      showToast('User security flag cleared', 'info');
      fetchStats();
    } catch (err) {
      showToast('Failed to clear security flag', 'error');
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">Admin <span className="text-primary">Intelligence</span></h2>
          <p className="text-text-muted text-sm font-medium">Real-time voting metrics & system monitoring</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportCSV} className="btn-ghost">
            <Download className="w-4 h-4" /> Power BI Export
          </button>
          {!data?.stats?.hasActiveElection ? (
            <button onClick={() => setShowStartElection(true)} className="btn-accent">
              <Play className="w-4 h-4 fill-current" /> Start Election
            </button>
          ) : (
            <button onClick={handleEndElection} className="btn-danger">
              <Square className="w-4 h-4 fill-current" /> End Election
            </button>
          )}
          <button 
            onClick={() => onSwitchTab?.('analytics')} 
            className="btn-accent border-2 border-indigo-900/20 bg-indigo-900/10 text-indigo-400 group"
          >
            <BarChart2 className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Intelligence Hub
          </button>
          <button onClick={() => setShowAddCandidate(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Candidate
          </button>
        </div>
      </div>

      {/* Power BI Intelligence Engine */}
      <div className="glass p-8 border-l-4 border-l-accent relative overflow-hidden group">
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }} className="group-hover:scale-110 transition-transform duration-500">
          <BarChart3 size={200} />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </div>
              <span className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Live Data Engine Active</span>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tight mb-3 flex items-center gap-2">
              <BarChart3 className="text-accent" /> Power BI Analytics Sync
            </h3>
            <p className="text-text-muted text-sm leading-relaxed max-w-2xl">
              Our proprietary **BI Engine** maps real-time voting patterns to detect fraud, predict turnout, and analyze candidate share. This interface is optimized for **direct Power BI integration** via automated REST hooks and CSV forensic exports.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-text-faint tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-success rounded-full" /> Behavioral Trends
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-text-faint tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-success rounded-full" /> Demographic Share
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-text-faint tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" /> Fraud Anomaly Map
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <button onClick={handleExportCSV} className="btn-accent px-10 py-5 shadow-2xl shadow-accent/40 hover:shadow-accent/60 transition-all hover:-translate-y-1 active:translate-y-0 group">
              <Download className="w-6 h-6 group-hover:animate-bounce" /> 
              <span className="ml-2">Export Power BI Dataset</span>
            </button>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-3 h-3 text-text-faint" />
              <p className="text-[10px] text-center text-text-faint font-bold italic uppercase tracking-widest">Auto-Syncing: every 60s</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card purple">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Users className="w-6 h-6" /></div>
            <span className="badge badge-primary">Voters</span>
          </div>
          <p className="text-3xl font-black italic">{data?.stats?.totalUsers}</p>
          <p className="text-text-faint text-xs font-bold uppercase mt-1">Registered Citizens</p>
        </div>

        <div className="stat-card green">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-success/10 rounded-xl text-success"><Vote className="w-6 h-6" /></div>
            <span className="badge badge-success">Live</span>
          </div>
          <p className="text-3xl font-black italic">{data?.stats?.votesCast}</p>
          <p className="text-text-faint text-xs font-bold uppercase mt-1">Total Votes Cast</p>
        </div>

        <div className="stat-card orange">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-accent/10 rounded-xl text-accent"><TrendingUp className="w-6 h-6" /></div>
            <span className="badge badge-warning">Growth</span>
          </div>
          <p className="text-3xl font-black italic">{data?.stats?.turnout}%</p>
          <p className="text-text-faint text-xs font-bold uppercase mt-1">Voter Turnout Rate</p>
          <div className="progress-bar mt-4">
            <div className="progress-fill" style={{ width: `${data?.stats?.turnout}%` }} />
          </div>
        </div>

        <div className="stat-card red">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-danger/10 rounded-xl text-danger"><ShieldAlert className="w-6 h-6" /></div>
            <span className="badge badge-danger">High Risk</span>
          </div>
          <p className="text-3xl font-black italic">{data?.stats?.flaggedUsers}</p>
          <p className="text-text-faint text-xs font-bold uppercase mt-1">Suspicious Accounts</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Candidate Performance */}
        <div className="glass p-8">
          <h3 className="text-xl font-black italic uppercase tracking-tight mb-8">Candidate Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.candidateVotes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="voteCount" radius={[6, 6, 0, 0]}>
                  {data?.candidateVotes.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Voting Trends */}
        <div className="glass p-8">
          <h3 className="text-xl font-black italic uppercase tracking-tight mb-8">Peak Voting Hours</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.hourlyData}>
                <defs>
                  <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="votes" stroke="#6366f1" fillOpacity={1} fill="url(#colorVotes)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fraud Detection Table */}
      <div className="glass p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-danger/10 rounded-lg text-danger"><ShieldAlert className="w-5 h-5" /></div>
            <h3 className="text-xl font-black italic uppercase tracking-tight">Security Incident Monitor</h3>
          </div>
          <span className="text-text-faint text-[10px] font-black uppercase tracking-widest">Fraud Detection active</span>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Voter ID</th>
                <th>Name / Email</th>
                <th>Attempts</th>
                <th>Last Known IP</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.suspiciousActivity.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-faint font-medium italic">No suspicious activity detected in this cycle.</td>
                </tr>
              ) : (
                data?.suspiciousActivity.map((user: any) => (
                  <tr key={user._id}>
                    <td><span className="font-mono font-bold text-primary">{user.voterId}</span></td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold text-text">{user.name}</span>
                        <span className="text-[11px] text-text-faint">{user.email}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${user.loginAttempts > 3 ? 'badge-danger' : 'badge-warning'}`}>{user.loginAttempts}</span></td>
                    <td><span className="font-mono text-xs">{user.lastLoginIp || 'N/A'}</span></td>
                    <td><span className="badge badge-danger">Flagged</span></td>
                    <td>
                      <button onClick={() => handleUnflagUser(user._id)} className="btn-ghost py-1.5 px-3 text-xs">
                        <ShieldOff className="w-3 h-3" /> Restore
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddCandidate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass p-8 w-full max-w-md">
              <h3 className="text-2xl font-black italic uppercase mb-6">Register Candidate</h3>
              <form onSubmit={handleAddCandidate} className="space-y-4">
                <input className="input" placeholder="Candidate Name" value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} required />
                <input className="input" placeholder="Party Name" value={newCandidate.party} onChange={e => setNewCandidate({...newCandidate, party: e.target.value})} required />
                <textarea className="input min-h-[100px]" placeholder="Party Manifesto / Description" value={newCandidate.description} onChange={e => setNewCandidate({...newCandidate, description: e.target.value})} />
                <div className="flex items-center gap-4 p-2 bg-white/5 rounded-xl">
                  <span className="text-text-muted text-xs font-bold uppercase ml-2">Theme Color</span>
                  <input type="color" className="bg-transparent border-none w-10 h-10 cursor-pointer" value={newCandidate.color} onChange={e => setNewCandidate({...newCandidate, color: e.target.value})} />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddCandidate(false)} className="btn-ghost flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Save Candidate</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showStartElection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass p-8 w-full max-w-md">
              <h3 className="text-2xl font-black italic uppercase mb-6">Setup Election Window</h3>
              <form onSubmit={handleStartElection} className="space-y-4">
                <input className="input" placeholder="Election Title (e.g. Lok Sabha 2026)" value={newElection.title} onChange={e => setNewElection({...newElection, title: e.target.value})} required />
                <div>
                  <label className="text-[10px] font-black uppercase text-text-faint mb-2 block tracking-widest">Start Timestamp</label>
                  <input className="input" type="datetime-local" value={newElection.startTime} onChange={e => setNewElection({...newElection, startTime: e.target.value})} required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-faint mb-2 block tracking-widest">End Timestamp</label>
                  <input className="input" type="datetime-local" value={newElection.endTime} onChange={e => setNewElection({...newElection, endTime: e.target.value})} required />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowStartElection(false)} className="btn-ghost flex-1">Cancel</button>
                  <button type="submit" className="btn-accent flex-1">Launch Now</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
