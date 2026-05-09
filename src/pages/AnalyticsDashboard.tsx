import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Users, MapPin, TrendingUp, Award, BarChart2, Filter, 
  ChevronLeft, ChevronRight, Download, Share2, Activity
} from 'lucide-react';

const COLORS = ['#FF9933', '#138808', '#000080', '#FF0000', '#8B0000'];

const NATIONAL_DATA = {
  voterTurnout: '67.4%',
  turnoutGrowth: '1.4%',
  genderRatio: '0.95',
  seatShare: '55.8%',
  nationalShare: '100.0%',
  urbanRuralGap: '2.3%',
  nationalAvg: '73.3%',
  turnoutDeviation: '-5.9%',
  youthParticipation: '21.9%',
  registrationRate: '68.2%'
};

const PARTY_DATA = [
  { name: 'BJP+', seats: 303, color: '#FF9933' },
  { name: 'INC+', seats: 52, color: '#0000FF' },
  { name: 'AITC', seats: 22, color: '#20C67A' },
  { name: 'YSRCP', seats: 22, color: '#000080' },
  { name: 'DMK', seats: 24, color: '#FF0000' }
];

const STATE_OPTIONS = ['NATIONAL', 'UTTAR PRADESH', 'KARNATAKA', 'MAHARASHTRA', 'WEST BENGAL'];

const AnalyticsDashboard: React.FC = () => {
  const [selectedState, setSelectedState] = useState('NATIONAL');

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-lg text-white">
            <BarChart2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Analytics Dashboard</h1>
            <p className="text-xs text-gray-500 font-medium italic">Secure Digital Voting System Intelligence</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all">
            <Download size={16} /> Export Power BI
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 shadow-md transition-all">
            <Share2 size={16} /> Share Insights
          </button>
        </div>
      </div>

      {/* State Selector Bar */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center bg-white p-3 rounded-2xl shadow-md border-t-4 border-orange-500">
        <div className="flex items-center gap-4 px-6 border-r border-gray-200">
          <img src="https://flagcdn.com/in.svg" alt="India" className="w-10 h-7 rounded shadow-sm" />
          <h2 className="text-2xl font-black text-indigo-900 italic uppercase">INDIA ({selectedState}) ANALYTICS</h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center gap-4 overflow-x-auto px-4">
          <button className="p-2 text-indigo-900 hover:bg-indigo-50 rounded-full"><ChevronLeft size={20}/></button>
          {STATE_OPTIONS.map((state) => (
            <button
              key={state}
              onClick={() => setSelectedState(state)}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                selectedState === state 
                ? 'bg-indigo-900 text-white shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {state}
            </button>
          ))}
          <button className="p-2 text-indigo-900 hover:bg-indigo-50 rounded-full"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Activity size={120} className="text-indigo-900" />
            </div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-center italic">
              INTERACTIVE MAP DASHBOARD: SELECTION CHANGES ANALYTICAL DATA BELOW
            </h3>
            
            <div className="flex justify-center items-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              {/* This would be an SVG map component, using placeholder image from user photo */}
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/India_administrative_map.png/640px-India_administrative_map.png" 
                alt="Map of India" 
                className="max-h-[500px] object-contain filter drop-shadow-2xl hover:scale-[1.02] transition-transform cursor-pointer"
              />
              
              {/* Floating Hotspots (Visual representation) */}
              <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute top-1/3 left-1/2 w-12 h-12 bg-indigo-500/20 rounded-full animate-pulse border border-indigo-500/40"></div>
                 <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-orange-500/10 rounded-full animate-pulse border border-orange-500/30"></div>
              </div>
            </div>
          </div>

          {/* Lower Visuals: Party Analytics */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-2xl font-black text-indigo-900 italic uppercase">FULL PARTY ANALYTICS</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Detailed vote share vs seats breakdown</p>
              </div>
              <div className="flex gap-2">
                {PARTY_DATA.slice(0, 3).map((p) => (
                   <div key={p.name} className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase">{p.name}</p>
                      <p className={`text-lg font-black italic`} style={{ color: p.color }}>{p.seats} Seats</p>
                   </div>
                ))}
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PARTY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#F9FAFB' }}
                  />
                  <Bar dataKey="seats" radius={[10, 10, 0, 0]}>
                    {PARTY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Key Metrics & Pie Chart */}
        <div className="space-y-8">
          {/* Priority Analytics Cards */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 italic text-center">PRIORITY ANALYTICS</h3>
             <div className="grid grid-cols-2 gap-4">
                <MetricCard label="Voter Turnout" value={NATIONAL_DATA.voterTurnout} color="emerald" />
                <MetricCard label="Turnout Growth" value={NATIONAL_DATA.turnoutGrowth} color="blue" />
                <MetricCard label="Gender Ratio" value={NATIONAL_DATA.genderRatio} color="pink" />
                <MetricCard label="Seat Share %" value={NATIONAL_DATA.seatShare} color="orange" />
                <MetricCard label="National Share" value={NATIONAL_DATA.nationalShare} color="indigo" />
                <MetricCard label="Urban Rural Gap" value={NATIONAL_DATA.urbanRuralGap} color="amber" />
                <MetricCard label="National Avg" value={NATIONAL_DATA.nationalAvg} color="cyan" />
                <MetricCard label="Turnout Deviation" value={NATIONAL_DATA.turnoutDeviation} color="rose" />
                <MetricCard label="Youth Participation" value={NATIONAL_DATA.youthParticipation} color="teal" />
                <MetricCard label="Registration Rate" value={NATIONAL_DATA.registrationRate} color="slate" />
             </div>
          </div>

          {/* Seat Distribution Pie */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
             <div className="h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PARTY_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="seats"
                    >
                      {PARTY_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-3xl font-black text-indigo-900 italic">67.4%</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Successful Turnout</p>
                </div>
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase text-center mt-4 tracking-widest italic">REGIONAL SEAT DISTRIBUTION</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => {
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    pink: 'bg-pink-50 text-pink-600',
    orange: 'bg-orange-50 text-orange-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    rose: 'bg-rose-50 text-rose-600',
    teal: 'bg-teal-50 text-teal-600',
    slate: 'bg-slate-50 text-slate-600'
  };

  return (
    <div className={`p-4 rounded-2xl ${colorMap[color]} border border-gray-50 flex flex-col gap-1 shadow-sm`}>
      <p className="text-[9px] font-black uppercase tracking-tighter opacity-80">{label}</p>
      <p className="text-xl font-black italic">{value}</p>
    </div>
  );
};

export default AnalyticsDashboard;
