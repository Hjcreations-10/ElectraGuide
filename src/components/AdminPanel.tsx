import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Vote, Activity, Plus, BarChart3, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const AdminPanel = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', symbol: '', description: '' });

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/voting/admin/stats');
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/voting/admin/candidates', newCandidate);
      setShowAddCandidate(false);
      setNewCandidate({ name: '', party: '', symbol: '', description: '' });
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-20 text-center font-black italic text-gray-400 animate-pulse">LOADING ANALYTICS...</div>;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Voters</p>
              <p className="text-3xl font-black italic">{stats?.totalUsers}</p>
            </div>
          </div>
          <div className="h-1 bg-blue-50 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-2xl text-green-600">
              <Vote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Votes Cast</p>
              <p className="text-3xl font-black italic">{stats?.votesCast}</p>
            </div>
          </div>
          <div className="h-1 bg-green-50 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${stats?.turnout}%` }} className="h-full bg-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Turnout %</p>
              <p className="text-3xl font-black italic">{stats?.turnout}%</p>
            </div>
          </div>
          <div className="h-1 bg-purple-50 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${stats?.turnout}%` }} className="h-full bg-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Candidate Results */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black italic tracking-tight uppercase">Live Standings</h3>
            <button 
              onClick={() => setShowAddCandidate(true)}
              className="p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.candidateVotes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="voteCount" radius={[4, 4, 0, 0]}>
                  {stats?.candidateVotes.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#F97316', '#3B82F6', '#10B981', '#8B5CF6'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-black text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 className="w-32 h-32" />
          </div>
          <h3 className="text-xl font-black italic tracking-tight uppercase mb-6 relative z-10">Admin Controls</h3>
          
          <div className="space-y-4 relative z-10">
            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-2xl flex items-center justify-between transition-all">
              <span className="font-bold italic">Export Results (CSV)</span>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </button>
            <button className="w-full bg-red-600/20 hover:bg-red-600/40 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between transition-all text-red-400">
              <span className="font-bold italic uppercase tracking-widest text-xs">End Current Election</span>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showAddCandidate && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl">
            <h2 className="text-2xl font-black italic mb-6 uppercase">Add Candidate</h2>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <input 
                type="text" 
                placeholder="Candidate Name" 
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Party Name" 
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none"
                value={newCandidate.party}
                onChange={(e) => setNewCandidate({...newCandidate, party: e.target.value})}
              />
              <button type="submit" className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl">SAVE CANDIDATE</button>
              <button type="button" onClick={() => setShowAddCandidate(false)} className="w-full text-gray-500 font-bold">CANCEL</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
