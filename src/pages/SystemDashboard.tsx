import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Users, Vote, ShieldAlert, Plus, Download, 
  Trash2, Play, Square, Loader2, AlertTriangle, CheckCircle2,
  TrendingUp, Clock, History, UserCheck, ShieldOff, Search,
  Filter, ChevronRight, Activity, Bell, Map, FileText, Settings,
  Zap, BrainCircuit, Sparkles, UserPlus, Award
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';
import { useToast } from '../context/ToastContext';
import { DashboardSkeleton } from '../components/Skeleton';

const SystemDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');

  // AI Predictions (Mocked for dashboard realism)
  const aiInsights = [
    { text: "Predict likely winning candidate: Arjun Sharma (Delhi)", type: 'prediction' },
    { text: "Highest voter turnout constituency: South Delhi (82%)", type: 'insight' },
    { text: "Anomaly detected: 3 login attempts from Kerala (Flagged)", type: 'alert' }
  ];

  const fetchAllData = useCallback(async () => {
    try {
      const [statsRes, feedRes] = await Promise.all([
        adminAPI.getStats(),
        (adminAPI as any).getActivityFeed ? (adminAPI as any).getActivityFeed() : fetch('/api/admin/activity-feed').then(r => r.json())
      ]);
      
      if (statsRes.data.success) setData(statsRes.data);
      if (feedRes.success) setFeed(feedRes.feed);
    } catch (err: any) {
      showToast('Failed to sync system data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const handleExport = async () => {
    try {
      const response = await adminAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `System_Audit_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      showToast('Power BI Audit log exported', 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
      {/* ─── 1. TOP NAVBAR / HEADER ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass p-6 rounded-3xl border-l-8 border-l-primary shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-2xl text-primary animate-pulse">
            <Zap size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">System <span className="text-primary">Control</span> Center</h2>
            <p className="text-[10px] font-black text-text-faint uppercase tracking-[0.3em]">National Election Management Interface v2.0</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
           <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase text-success tracking-widest">Server: Online</span>
           </div>
           <button onClick={handleExport} className="btn-ghost text-xs">
              <Download size={14} /> Power BI Audit
           </button>
           <button className="btn-primary text-xs shadow-primary/20">
              <Plus size={14} /> New Election
           </button>
        </div>
      </div>

      {/* ─── 2. ANALYTICS CARDS (Point 1) ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Registered Voters" value={data?.stats?.totalUsers} icon={<Users />} color="purple" trend="+12% today" />
        <MetricCard label="Total Votes Cast" value={data?.stats?.votesCast} icon={<Vote />} color="green" trend="Live Sync" />
        <MetricCard label="Voter Turnout %" value={`${data?.stats?.turnout}%`} icon={<TrendingUp />} color="orange" progress={data?.stats?.turnout} />
        <MetricCard label="Security Flags" value={data?.stats?.flaggedUsers} icon={<ShieldAlert />} color="red" trend="Requires Review" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* ─── 3. LIVE CHARTS & FEED (Points 2 & 4) ────────────────── */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Election Status Widget (Point 9) */}
          <div className="glass p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Map size={150} />
             </div>
             <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="badge badge-success">LIVE ELECTION</div>
                      <span className="text-[10px] font-black text-text-faint uppercase tracking-widest">Lok Sabha 2026 - Phase 1</span>
                   </div>
                   <h3 className="text-4xl font-black italic uppercase tracking-tight mb-2">{data?.stats?.election?.title || 'General Election'}</h3>
                   <p className="text-text-muted text-sm max-w-lg">Live monitoring of national voting centers. All security nodes are currently reporting stable connectivity with SHA-256 integrity checks.</p>
                </div>
                <div className="text-center md:text-right space-y-2">
                   <p className="text-[10px] font-black text-text-faint uppercase tracking-widest">Time Remaining</p>
                   <div className="text-5xl font-black italic text-warning tracking-tighter tabular-nums">04:12:55</div>
                   <div className="progress-bar h-2 mt-4">
                      <div className="progress-fill bg-warning" style={{ width: '72%' }} />
                   </div>
                   <p className="text-[10px] font-bold text-warning uppercase mt-2">72% National Participation</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Votes per Candidate (Point 2) */}
             <div className="glass p-8">
                <div className="flex justify-between items-center mb-8">
                   <h4 className="text-sm font-black uppercase tracking-widest text-primary italic">Live Ranking</h4>
                   <BarChart3 size={16} className="text-primary" />
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.candidateVotes}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                      <Bar dataKey="voteCount" radius={[6, 6, 0, 0]}>
                        {data?.candidateVotes.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Participation Trend (Point 2) */}
             <div className="glass p-8">
                <div className="flex justify-between items-center mb-8">
                   <h4 className="text-sm font-black uppercase tracking-widest text-accent italic">Voting Velocity</h4>
                   <TrendingUp size={16} className="text-accent" />
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.hourlyData}>
                      <defs>
                        <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                      <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="votes" stroke="#f97316" fillOpacity={1} fill="url(#colorVotes)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* ─── 4. CANDIDATE MANAGEMENT (Point 6) ───────────────────── */}
          <div className="glass p-8 overflow-hidden">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h4 className="text-xl font-black italic uppercase tracking-tight">Candidate Directory</h4>
                  <p className="text-xs font-bold text-text-faint uppercase tracking-widest">Manage official electoral ballot</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                   <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search candidate..." 
                        className="input pl-10 py-2 text-xs" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                   <select className="input py-2 text-xs w-32 appearance-none">
                      <option>All Regions</option>
                      <option>Delhi</option>
                      <option>Kerala</option>
                   </select>
                </div>
             </div>

             <div className="table-container">
                <table className="text-left w-full">
                   <thead>
                      <tr className="border-b border-white/5">
                         <th className="pb-4">Candidate</th>
                         <th className="pb-4">Party</th>
                         <th className="pb-4">Region</th>
                         <th className="pb-4">Votes</th>
                         <th className="pb-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {data?.candidateVotes?.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((cand: any) => (
                        <tr key={cand._id} className="group hover:bg-white/5 transition-colors">
                           <td className="py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20">
                                    {cand.name[0]}
                                 </div>
                                 <span className="font-bold text-sm">{cand.name}</span>
                              </div>
                           </td>
                           <td className="py-4"><span className="text-xs font-black uppercase tracking-widest" style={{ color: cand.color }}>{cand.party}</span></td>
                           <td className="py-4 text-xs text-text-muted font-bold italic">National</td>
                           <td className="py-4 font-mono font-black text-primary">{cand.voteCount}</td>
                           <td className="py-4 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-2 hover:bg-success/10 text-success rounded-lg"><UserCheck size={16}/></button>
                                 <button className="p-2 hover:bg-danger/10 text-danger rounded-lg"><Trash2 size={16}/></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* ─── 5. SIDEBAR / FEED (Points 4, 13, 15) ──────────────────── */}
        <div className="space-y-8">
           
           {/* AI Prediction Widget (Point 15) */}
           <div className="glass p-6 border-t-4 border-t-indigo-500 bg-indigo-900/10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                    <BrainCircuit size={24} />
                 </div>
                 <div>
                    <h4 className="text-sm font-black italic uppercase tracking-tight text-indigo-400">AI Intelligence</h4>
                    <p className="text-[9px] font-black uppercase text-text-faint tracking-widest">Predictive Analytics Hub</p>
                 </div>
              </div>
              <div className="space-y-4">
                 {aiInsights.map((insight, i) => (
                   <div key={i} className="p-4 bg-black/30 rounded-2xl border border-white/5 flex gap-3 group hover:border-indigo-500/50 transition-all cursor-pointer">
                      <div className="mt-0.5">
                        {insight.type === 'alert' ? <AlertTriangle size={14} className="text-rose-400" /> : <Sparkles size={14} className="text-indigo-400" />}
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed font-medium group-hover:text-text transition-colors">"{insight.text}"</p>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-3 bg-indigo-600/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 hover:bg-indigo-600/30 transition-all">
                 Generate New Predictions
              </button>
           </div>

           {/* Live Activity Feed (Point 4) */}
           <div className="glass p-6">
              <div className="flex justify-between items-center mb-6">
                 <h4 className="text-sm font-black italic uppercase tracking-tight">System Heartbeat</h4>
                 <Activity size={16} className="text-success animate-pulse" />
              </div>
              <div className="space-y-6 relative">
                 <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/5" />
                 {feed.map((item, i) => (
                   <div key={i} className="flex gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-bg border border-white/10 flex items-center justify-center shrink-0 z-10">
                         {item.icon === 'Vote' ? <Vote size={14} className="text-success" /> : 
                          item.icon === 'UserPlus' ? <UserPlus size={14} className="text-primary" /> : 
                          <Award size={14} className="text-accent" />}
                      </div>
                      <div>
                         <p className="text-xs font-black italic text-text leading-tight">{item.title}</p>
                         <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{item.description}</p>
                         <p className="text-[9px] text-text-faint font-bold uppercase mt-2">{new Date(item.timestamp).toLocaleTimeString()}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Security Status (Point 8) */}
           <div className="glass p-6 border-l-4 border-l-rose-500">
              <div className="flex items-center gap-3 mb-4 text-rose-500">
                 <ShieldAlert size={20} />
                 <h4 className="text-sm font-black italic uppercase tracking-tight">Anomalies Detected</h4>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <span className="text-[10px] font-bold text-rose-500 uppercase">Suspicious Login</span>
                    <span className="text-[10px] font-black tabular-nums text-rose-500">2m ago</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 opacity-50">
                    <span className="text-[10px] font-bold text-text-faint uppercase">Duplicate Vote Blocked</span>
                    <span className="text-[10px] font-black tabular-nums text-text-faint">1h ago</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: any; icon: any; color: string; trend?: string; progress?: number }> = ({ label, value, icon, color, trend, progress }) => {
  const colorMap: any = {
    purple: 'border-l-indigo-500 text-indigo-400 bg-indigo-900/10',
    green: 'border-l-emerald-500 text-emerald-400 bg-emerald-900/10',
    orange: 'border-l-amber-500 text-amber-400 bg-amber-900/10',
    red: 'border-l-rose-500 text-rose-400 bg-rose-900/10'
  };

  return (
    <motion.div whileHover={{ y: -5 }} className={`p-6 rounded-3xl glass border-l-4 ${colorMap[color]} shadow-xl`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white/5 rounded-xl">{icon}</div>
        {trend && <span className="text-[9px] font-black uppercase bg-white/5 px-2 py-1 rounded-lg italic">{trend}</span>}
      </div>
      <p className="text-3xl font-black italic tabular-nums tracking-tighter mb-1">{value}</p>
      <p className="text-[10px] font-black uppercase text-text-faint tracking-widest">{label}</p>
      {progress !== undefined && (
        <div className="progress-bar h-1 mt-4">
          <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: 'currentColor' }} />
        </div>
      )}
    </motion.div>
  );
};

export default SystemDashboard;
