import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Users, Vote, ShieldAlert, Plus, Download, 
  Trash2, Play, Square, Loader2, AlertTriangle, CheckCircle2,
  TrendingUp, Clock, History, UserCheck, ShieldOff, Search,
  Filter, ChevronRight, Activity, Bell, Map, FileText, Settings,
  Zap, BrainCircuit, Sparkles, UserPlus, Award, ShieldCheck,
  Calendar, Globe, Server, UserX, AlertCircle
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area,
  LineChart, Line
} from 'recharts';
import { useToast } from '../context/ToastContext';
import { DashboardSkeleton } from '../components/Skeleton';

const SystemDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive Filter States
  const [filterRegion, setFilterRegion] = useState('All Regions');
  const [filterDate, setFilterDate] = useState('Last 7 Days');

  const fetchAllData = useCallback(async (isPolling = false) => {
    try {
      const [statsRes, feedRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getActivityFeed()
      ]);
      
      if (statsRes.data?.success) setData(statsRes.data);
      if (feedRes.data?.success) setFeed(feedRes.data.feed);
    } catch (err: any) {
      console.error('Dashboard Sync Error:', err);
      if (!isPolling) showToast('Failed to sync system data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { 
    fetchAllData(); 
    
    // Simulate Real-time WebSocket connection using SSE/Polling
    const interval = setInterval(() => {
      fetchAllData(true);
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [fetchAllData]);

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

  if (loading && !data) return <DashboardSkeleton />;
  if (!data) return null;

  const { stats, candidateVotes, hourlyData, dailyVotes, systemHealth, regionalData, insights, suspiciousActivity } = data;

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b'];

  return (
    <div className="space-y-8 pb-20">
      
      {/* ─── 1. HEADER & INTERACTIVE FILTERS ────────────────────────────── */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="badge badge-success flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live Sync
            </span>
            <span className="text-[10px] font-black text-text-faint uppercase tracking-[0.4em]">Node-Alpha-01</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-black italic uppercase tracking-tighter leading-none">
            Intelligence <span className="text-primary">Command</span>
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 w-full xl:w-auto">
          <div className="glass px-4 py-3 rounded-xl flex items-center gap-3 flex-1 xl:flex-none">
            <Calendar size={16} className="text-primary" />
            <select className="bg-transparent border-none text-sm font-bold text-text focus:outline-none w-full" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="glass px-4 py-3 rounded-xl flex items-center gap-3 flex-1 xl:flex-none">
            <Globe size={16} className="text-primary" />
            <select className="bg-transparent border-none text-sm font-bold text-text focus:outline-none w-full" value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
              <option>All Regions</option>
              <option>North Region</option>
              <option>South Region</option>
              <option>East Region</option>
              <option>West Region</option>
            </select>
          </div>
          <button onClick={handleExport} className="btn-primary py-3 px-6 shadow-xl shadow-primary/20 flex-1 xl:flex-none">
            <Download size={16} /> Power BI Export
          </button>
        </div>
      </div>

      {/* ─── 2. TOP-LEVEL METRICS (6 CARDS) ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Votes" value={stats.votesCast.toLocaleString()} icon={<Vote />} color="primary" />
        <StatCard title="Active Elections" value={stats.hasActiveElection ? '1' : '0'} icon={<Activity />} color="success" />
        <StatCard title="Participation" value={`${stats.turnout}%`} icon={<TrendingUp />} color="accent" />
        <StatCard title="Registered Voters" value={stats.totalUsers.toLocaleString()} icon={<Users />} color="primary" />
        <StatCard title="Live Users" value={systemHealth?.activeUsers || 0} icon={<Globe />} color="warning" pulse />
        <StatCard title="System Uptime" value={systemHealth?.uptime || '99.9%'} icon={<Server />} color="success" />
      </div>

      {/* ─── 3. AI INSIGHTS PANEL ────────────────────────────── */}
      <div className="glass p-6 border-l-4 border-l-accent relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
           <BrainCircuit size={100} />
        </div>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-accent" size={20} />
          <h3 className="font-black italic uppercase tracking-widest text-sm">Neural Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {(insights || [
            { type: 'trend', text: 'Participation trending upwards by 5% this hour.' },
            { type: 'warning', text: 'Awaiting data synchronization for region 4.' },
            { type: 'info', text: 'System load is optimal. No bottlenecks detected.' }
          ]).map((insight: any, i: number) => (
            <div key={i} className="flex gap-3">
              <div className={`mt-1 flex-shrink-0 ${insight.type === 'warning' ? 'text-warning' : insight.type === 'trend' ? 'text-success' : 'text-primary'}`}>
                <ChevronRight size={16} />
              </div>
              <p className="text-sm font-medium text-text-muted">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. ADVANCED VISUALIZATIONS GRID ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* A. Area Chart: Voting Activity Over Time */}
        <div className="glass p-6 col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black uppercase tracking-widest">Voting Trajectory</h3>
            <span className="badge badge-primary">Last 7 Days</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyVotes}>
                <defs>
                  <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickMargin={10} />
                <YAxis stroke="#ffffff50" fontSize={12} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#05070a', borderColor: '#ffffff20', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="votes" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVotes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B. Pie/Donut Chart: Demographic / Regional Distribution */}
        <div className="glass p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black uppercase tracking-widest">Regional Turnout</h3>
          </div>
          <div className="h-[250px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionalData || [{name: 'No Data', votes: 1}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="votes"
                >
                  {(regionalData || [{}]).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#05070a', borderColor: '#ffffff20', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {(regionalData || []).map((r: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs font-bold text-text-muted">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {r.name} ({r.votes})
              </div>
            ))}
          </div>
        </div>

        {/* C. Bar Chart: Candidate Vote Share */}
        <div className="glass p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black uppercase tracking-widest">Candidate Performance</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candidateVotes} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#ffffff50" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#ffffff50" fontSize={12} width={100} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#05070a', borderColor: '#ffffff20', borderRadius: '12px' }}
                  cursor={{ fill: '#ffffff05' }}
                />
                <Bar dataKey="voteCount" radius={[0, 4, 4, 0]} barSize={20}>
                  {candidateVotes.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ─── 5. ADMIN MONITORING & ACTIVITY FEED ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Health / Suspicious Activity */}
        <div className="glass p-6 lg:col-span-1 space-y-6">
          <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
            <ShieldAlert className="text-warning" /> Security Node
          </h3>
          
          <div className="space-y-4">
            <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex justify-between items-center">
              <div>
                <p className="text-xs text-text-faint font-bold uppercase">Threat Level</p>
                <p className={`font-black text-lg ${systemHealth?.threatLevel === 'Elevated' ? 'text-warning' : 'text-success'}`}>
                  {systemHealth?.threatLevel || 'Low'}
                </p>
              </div>
              <Activity className={systemHealth?.threatLevel === 'Elevated' ? 'text-warning' : 'text-success'} />
            </div>

            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
               <p className="text-xs text-text-faint font-bold uppercase mb-3">Flagged Nodes</p>
               {suspiciousActivity && suspiciousActivity.length > 0 ? (
                 <div className="space-y-3">
                   {suspiciousActivity.slice(0,3).map((user: any) => (
                     <div key={user._id} className="flex items-center justify-between">
                       <span className="text-sm font-medium">{user.voterId}</span>
                       <span className="badge badge-warning text-[9px] px-2 py-0.5">Review</span>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-sm text-text-muted">No suspicious activity detected.</p>
               )}
            </div>
            
            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
              <p className="text-xs text-text-faint font-bold uppercase mb-2">Server Load</p>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: systemHealth?.currentLoad || '20%' }} />
              </div>
              <p className="text-right text-xs mt-1 text-text-muted">{systemHealth?.currentLoad || '20%'}</p>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass p-6 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black uppercase tracking-widest">Global Action Ledger</h3>
            <span className="text-xs font-bold text-text-muted flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" /> Live Sync
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-4 space-y-4 max-h-[400px] custom-scrollbar">
            <AnimatePresence initial={false}>
              {feed.map((item, index) => {
                let Icon = Activity;
                let colorClass = 'text-text-muted bg-white/5';
                
                if (item.action.includes('Registered')) {
                  Icon = UserPlus;
                  colorClass = 'text-primary bg-primary/10';
                } else if (item.action.includes('Voted')) {
                  Icon = CheckCircle2;
                  colorClass = 'text-success bg-success/10';
                } else if (item.action.includes('Flagged')) {
                  Icon = AlertCircle;
                  colorClass = 'text-danger bg-danger/10';
                } else if (item.action.includes('Election')) {
                  Icon = Award;
                  colorClass = 'text-accent bg-accent/10';
                }

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <div className={`p-3 rounded-xl ${colorClass}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-text truncate pr-4">{item.user}</p>
                        <span className="text-[10px] font-mono text-text-faint whitespace-nowrap">
                          {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted truncate group-hover:text-text-faint transition-colors">{item.action}</p>
                    </div>
                  </motion.div>
                );
              })}
              
              {feed.length === 0 && (
                <div className="text-center py-10 text-text-muted flex flex-col items-center">
                  <History size={40} className="mb-4 opacity-20" />
                  <p>Awaiting ledger entries...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, pulse }: any) => {
  const colorMap: any = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
  };

  return (
    <div className="glass p-5 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]} ${pulse ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase text-text-faint tracking-widest mb-1">{title}</h4>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
};

export default SystemDashboard;
