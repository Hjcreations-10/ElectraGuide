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

  const fetchAllData = useCallback(async () => {
    try {
      const [statsRes, feedRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getActivityFeed()
      ]);
      
      if (statsRes.data?.success) setData(statsRes.data);
      if (feedRes.data?.success) setFeed(feedRes.data.feed);
    } catch (err: any) {
      console.error('Dashboard Sync Error:', err);
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
      link.setAttribute('download', `ElectraGuide_Audit_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      showToast('Power BI Audit log exported successfully', 'success');
    } catch (err) {
      showToast('Export failed. Please check server logs.', 'error');
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-10 pb-20">
      {/* ─── 1. COMMAND CENTER HEADER ────────────────────────────── */}
      <div className="glass p-10 border-l-[12px] border-l-primary relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
           <Activity size={240} />
        </div>
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20 shadow-2xl shadow-primary/20 animate-pulse-slow">
              <Zap size={40} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <span className="badge badge-success">System Online</span>
                 <span className="text-[10px] font-black text-text-faint uppercase tracking-[0.4em]">Node-Alpha-01</span>
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">
                Intelligence <span className="text-primary">Command</span>
              </h2>
              <p className="text-xs font-bold text-text-muted max-w-md">Real-time election oversight and security monitoring interface. All data nodes are synchronized with 256-bit encryption.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full xl:w-auto">
             <button onClick={handleExport} className="btn-ghost flex-1 xl:flex-none py-4 px-8 border-primary/20 text-primary hover:bg-primary/5">
                <Download size={18} /> Power BI Dataset
             </button>
             <button className="btn-primary flex-1 xl:flex-none py-4 px-10 shadow-2xl">
                <Plus size={18} /> Create Election
             </button>
          </div>
        </div>
      </div>

      {/* ─── 2. CRITICAL METRICS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard label="Total Voters" value={data?.stats?.totalUsers} icon={<Users size={24} />} color="indigo" trend="+4% this week" />
        <MetricCard label="Votes Secured" value={data?.stats?.votesCast} icon={<ShieldCheck size={24} />} color="emerald" trend="Live Sync" />
        <MetricCard label="Global Turnout" value={`${data?.stats?.turnout}%`} icon={<TrendingUp size={24} />} color="amber" progress={data?.stats?.turnout} />
        <MetricCard label="Risk Anomalies" value={data?.stats?.flaggedUsers} icon={<ShieldAlert size={24} />} color="rose" trend="Immediate Attention" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* ─── 3. ANALYTICS HUB ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Active Election Widget */}
          <div className="glass p-10 border-t border-white/5 relative overflow-hidden">
             <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex-1 space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-success uppercase tracking-widest">Ongoing Election Stream</span>
                   </div>
                   <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-tight">
                     {data?.stats?.election?.title || 'Electoral Window Active'}
                   </h3>
                   <div className="flex gap-8">
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-text-faint uppercase tracking-widest">Participation</p>
                         <p className="text-xl font-black text-text italic">{data?.stats?.turnout || 0}%</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-text-faint uppercase tracking-widest">Node Status</p>
                         <p className="text-xl font-black text-success italic">STABLE</p>
                      </div>
                   </div>
                </div>
                
                <div className="w-full md:w-auto text-center md:text-right space-y-4 bg-black/20 p-8 rounded-[2.5rem] border border-white/5">
                   <p className="text-[10px] font-black text-text-faint uppercase tracking-[0.2em]">Ballot Window Closes In</p>
                   <div className="text-5xl font-black italic text-warning tracking-tighter tabular-nums drop-shadow-lg">04:22:15</div>
                   <div className="progress-bar h-2 w-full mt-6">
                      <div className="progress-fill bg-warning" style={{ width: '68%' }} />
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             {/* Live Ranking */}
             <div className="glass p-10">
                <div className="flex justify-between items-center mb-10">
                   <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary italic">Live Candidate Delta</h4>
                   <div className="bg-primary/10 p-2 rounded-lg text-primary"><BarChart3 size={18} /></div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.candidateVotes}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.02)'}}
                        contentStyle={{ background: '#0b0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} 
                      />
                      <Bar dataKey="voteCount" radius={[8, 8, 0, 0]} barSize={40}>
                        {data?.candidateVotes?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Voting Velocity */}
             <div className="glass p-10">
                <div className="flex justify-between items-center mb-10">
                   <h4 className="text-sm font-black uppercase tracking-[0.2em] text-accent italic">Voting Velocity</h4>
                   <div className="bg-accent/10 p-2 rounded-lg text-accent"><TrendingUp size={18} /></div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.hourlyData}>
                      <defs>
                        <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                      <Tooltip contentStyle={{ background: '#0b0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                      <Area type="monotone" dataKey="votes" stroke="#f97316" fillOpacity={1} fill="url(#colorVotes)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* ─── 4. CANDIDATE MANAGEMENT ─────────────────────────────── */}
          <div className="glass overflow-hidden">
             <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <h4 className="text-2xl font-black italic uppercase tracking-tight mb-1">Ballot Registry</h4>
                  <p className="text-[10px] font-black text-text-faint uppercase tracking-widest">Management of official electoral nodes</p>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-faint" size={18} />
                  <input 
                    type="text" 
                    placeholder="Filter records..." 
                    className="input pl-12 py-3 text-xs" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
             </div>

             <div className="table-container border-none rounded-none">
                <table className="w-full">
                   <thead>
                      <tr>
                         <th>Identity</th>
                         <th>Electoral Party</th>
                         <th>Regionality</th>
                         <th>Ballot Weight</th>
                         <th className="text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {data?.candidateVotes?.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((cand: any) => (
                        <tr key={cand._id} className="group transition-all">
                           <td>
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-text-muted border border-white/5 group-hover:border-primary/40 group-hover:text-primary transition-all">
                                    {cand.name[0]}
                                 </div>
                                 <span className="font-bold text-sm tracking-tight">{cand.name}</span>
                              </div>
                           </td>
                           <td>
                             <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cand.color }} />
                               <span className="text-[10px] font-black uppercase tracking-widest">{cand.party}</span>
                             </div>
                           </td>
                           <td><span className="badge bg-white/5 text-text-faint italic border-none lowercase">national_stream</span></td>
                           <td className="font-mono font-black text-primary text-lg">{cand.voteCount}</td>
                           <td className="text-right">
                              <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                 <button className="p-2.5 hover:bg-success/10 text-success rounded-xl transition-colors"><UserCheck size={18}/></button>
                                 <button className="p-2.5 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors"><Trash2 size={18}/></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* ─── 5. INTELLIGENCE FEED & SECURITY ─────────────────────── */}
        <div className="space-y-10">
           
           {/* AI Insight Widget */}
           <div className="glass p-8 border-t-8 border-t-indigo-500 bg-indigo-500/5">
              <div className="flex items-center gap-4 mb-8">
                 <div className="bg-indigo-500 p-3 rounded-2xl text-white shadow-xl shadow-indigo-500/30 animate-pulse">
                    <BrainCircuit size={28} />
                 </div>
                 <div>
                    <h4 className="text-sm font-black italic uppercase tracking-tight text-indigo-400">AI Neural Engine</h4>
                    <p className="text-[9px] font-black uppercase text-text-faint tracking-widest">Predictive Logic Cluster</p>
                 </div>
              </div>
              <div className="space-y-4">
                 {[
                   { text: "Proprietary vote-share prediction: Candidate B leading by 4.2%", type: 'prediction' },
                   { text: "System anomaly detected: Multiple voter collisions in sector-09", type: 'alert' },
                   { text: "Efficiency insight: High voting throughput detected in urban hubs", type: 'insight' }
                 ].map((insight, i) => (
                   <div key={i} className="p-5 bg-black/40 rounded-3xl border border-white/5 hover:border-indigo-500/40 transition-all group cursor-pointer">
                      <div className="flex gap-4">
                        <div className="mt-1">
                          {insight.type === 'alert' ? <AlertTriangle size={16} className="text-rose-400" /> : <Sparkles size={16} className="text-indigo-400" />}
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed font-medium group-hover:text-text transition-colors italic">"{insight.text}"</p>
                      </div>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-8 py-4 bg-indigo-600/10 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/20 hover:bg-indigo-600/20 transition-all">
                 Initialize Neural Sweep
              </button>
           </div>

           {/* System Heartbeat */}
           <div className="glass p-8">
              <div className="flex justify-between items-center mb-8">
                 <h4 className="text-sm font-black italic uppercase tracking-tight">System Heartbeat</h4>
                 <Activity size={18} className="text-success animate-pulse" />
              </div>
              <div className="space-y-8 relative">
                 <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/5" />
                 {feed.length > 0 ? feed.map((item, i) => (
                   <div key={i} className="flex gap-6 relative group">
                      <div className="w-10 h-10 rounded-2xl bg-[#05070a] border border-white/10 flex items-center justify-center shrink-0 z-10 group-hover:border-primary/40 transition-colors">
                         {item.icon === 'Vote' ? <VoteIcon size={16} className="text-success" /> : 
                          item.icon === 'UserPlus' ? <UserPlus size={16} className="text-primary" /> : 
                          <Award size={16} className="text-accent" />}
                      </div>
                      <div>
                         <p className="text-xs font-black italic text-text leading-none mb-1">{item.title}</p>
                         <p className="text-[10px] text-text-muted leading-relaxed mb-2">{item.description}</p>
                         <p className="text-[9px] text-text-faint font-bold uppercase tracking-widest">{new Date(item.timestamp).toLocaleTimeString()}</p>
                      </div>
                   </div>
                 )) : (
                   <p className="text-[10px] text-text-faint italic text-center py-4">No recent activity logged</p>
                 )}
              </div>
           </div>

           {/* Security Perimeter */}
           <div className="glass p-8 border-l-8 border-l-rose-600">
              <div className="flex items-center gap-4 mb-6">
                 <ShieldAlert size={24} className="text-rose-600" />
                 <h4 className="text-sm font-black italic uppercase tracking-tight text-rose-600">Perimeter Breach Log</h4>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between items-center p-4 bg-rose-600/10 rounded-[1.5rem] border border-rose-600/20 group hover:bg-rose-600/20 transition-all cursor-crosshair">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Unauthorized Access Blocked</span>
                    <span className="text-[10px] font-black tabular-nums text-rose-600/50">2m ago</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-white/5 rounded-[1.5rem] border border-white/5 opacity-40 grayscale group hover:grayscale-0 transition-all">
                    <span className="text-[10px] font-black text-text-faint uppercase tracking-widest group-hover:text-text-muted">Injection Attempt Nullified</span>
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
    indigo: 'border-l-indigo-500 text-indigo-400 bg-indigo-500/5 hover:border-indigo-500/50',
    emerald: 'border-l-emerald-500 text-emerald-400 bg-emerald-500/5 hover:border-emerald-500/50',
    amber: 'border-l-amber-500 text-amber-400 bg-amber-500/5 hover:border-amber-500/50',
    rose: 'border-l-rose-500 text-rose-400 bg-rose-500/5 hover:border-rose-500/50'
  };

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }} 
      className={`p-10 rounded-[2.5rem] glass border-l-[6px] ${colorMap[color]} transition-all duration-500`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-white/5 rounded-2xl shadow-inner">{icon}</div>
        {trend && <span className="text-[9px] font-black uppercase bg-white/10 px-3 py-1.5 rounded-full italic tracking-widest">{trend}</span>}
      </div>
      <p className="text-4xl font-black italic tabular-nums tracking-tighter mb-2 leading-none">{value || '0'}</p>
      <p className="text-[10px] font-black uppercase text-text-faint tracking-[0.2em]">{label}</p>
      {progress !== undefined && (
        <div className="progress-bar h-1.5 mt-6">
          <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: 'currentColor' }} />
        </div>
      )}
    </motion.div>
  );
};ng-widest">{label}</p>
      {progress !== undefined && (
        <div className="progress-bar h-1 mt-4">
          <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: 'currentColor' }} />
        </div>
      )}
    </motion.div>
  );
};

export default SystemDashboard;
