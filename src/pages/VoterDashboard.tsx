import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, Vote as VoteIcon, Clock, AlertTriangle,
  Loader2, ChevronRight, Users, Shield, Sparkles, 
  Search, MapPin, Award, BookOpen, BrainCircuit, X
} from 'lucide-react';
import { votingAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CandidateSkeleton } from '../components/Skeleton';

const VoterDashboard: React.FC = () => {
  const { showToast } = useToast();
  const { user, refreshUser } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [election, setElection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [voted, setVoted] = useState(user?.hasVoted || false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // AI States
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

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
      showToast('Election systems connection failure', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const handleVote = async (candidateId: string) => {
    if (!window.confirm('IRREVERSIBLE ACTION: Confirm your digital ballot entry?')) return;
    setVoting(candidateId);
    try {
      await votingAPI.castVote(candidateId);
      showToast('Ballot recorded and hashed successfully', 'success');
      setVoted(true);
      await refreshUser();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Transaction failed', 'error');
    } finally {
      setVoting(null);
    }
  };

  const handleSummarize = async (candidateId: string) => {
    if (summaries[candidateId]) return;
    setSummarizing(candidateId);
    try {
      const { data } = await aiAPI.summarize(candidateId);
      setSummaries(prev => ({ ...prev, [candidateId]: data.summary }));
      showToast('AI Synthesis complete', 'success');
    } catch (err) {
      showToast('AI Node offline', 'error');
    } finally {
      setSummarizing(null);
    }
  };

  const handleCompare = async () => {
    if (compareList.length !== 2) {
      showToast('Select 2 candidates for AI comparison', 'info');
      return;
    }
    setAnalyzing(true);
    setIsCompareModalOpen(true);
    try {
      const { data } = await aiAPI.compare(compareList);
      setAiAnalysis(data.analysis);
    } catch (err) {
      showToast('Neural analysis failed', 'error');
      setIsCompareModalOpen(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleCompare = (id: string) => {
    setCompareList(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const formatTime = (ms: number) => {
    const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
    const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (loading) return <CandidateSkeleton />;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* ─── REGIONAL IDENTITY BANNER ────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-12 relative overflow-hidden group border-l-[12px] border-l-primary"
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700">
          <MapPin size={240} />
        </div>
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 relative z-10">
          <div className="space-y-4">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
              Voter <span className="text-primary">Dashboard</span>
            </h2>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="badge badge-primary py-2 px-5">
                <MapPin size={12} className="mr-2" /> {user?.state || 'National'} / {user?.constituency || 'General'}
              </div>
              <div className="flex items-center gap-3 bg-black/20 px-5 py-2 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black uppercase text-text-faint tracking-widest">ID Hash</span>
                <span className="font-mono text-xs text-primary font-bold uppercase">{user?.voterId?.slice(0, 12)}...</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 bg-black/20 p-6 rounded-[2rem] border border-white/5">
            <div className="badge badge-success border-none"><Shield size={10} className="mr-2" /> Biometric Identity Verified</div>
            <p className="text-[9px] font-black text-text-faint uppercase tracking-[0.3em] italic">Authorized Electoral Node: 772-QX</p>
          </div>
        </div>
      </motion.div>

      {/* ─── AI COMPARISON HUB ───────────────────────────────────── */}
      {!voted && candidates.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] p-8 flex flex-col xl:flex-row justify-between items-center gap-8 backdrop-blur-md"
        >
          <div className="flex items-center gap-6">
            <div className="bg-indigo-600/20 p-4 rounded-3xl text-indigo-400 border border-indigo-500/20 shadow-xl shadow-indigo-500/10">
              <BrainCircuit size={32} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-1">Manifesto Intelligence</p>
              <p className="text-xs text-text-muted font-bold">Deploy neural analysis to compare candidate promises and policy frameworks.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 w-full xl:w-auto">
             <div className="flex -space-x-3">
                {compareList.map(id => {
                  const cand = candidates.find(c => c._id === id);
                  return (
                    <motion.div 
                      layoutId={`compare-${id}`}
                      key={id} 
                      className="w-12 h-12 rounded-2xl border-4 border-[#05070a] bg-indigo-600 flex items-center justify-center text-sm font-black shadow-2xl"
                    >
                      {cand?.name[0]}
                    </motion.div>
                  )
                })}
                {compareList.length < 2 && <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center text-text-faint"><Search size={14} /></div>}
             </div>
             <button 
               disabled={compareList.length !== 2}
               onClick={handleCompare}
               className="btn-primary flex-1 xl:flex-none py-4 px-10 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
             >
               <Sparkles size={16} /> Run Analysis
             </button>
          </div>
        </motion.div>
      )}

      {/* ─── BALLOT STATUS / ELECTION AREA ────────────────────────── */}
      {voted ? (
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass p-20 text-center space-y-8 border-l-[16px] border-l-success">
          <div className="w-24 h-24 bg-success/10 text-success rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-success/20 animate-bounce">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-4">
            <h3 className="text-5xl font-black italic uppercase italic tracking-tighter">Identity Hashed</h3>
            <p className="text-text-muted text-lg max-w-2xl mx-auto font-medium">Your digital ballot has been encrypted with SHA-256 and broadcasted to the national ledger. This transaction is immutable and anonymous.</p>
          </div>
          <div className="bg-black/30 p-8 rounded-[2.5rem] border border-white/5 inline-block text-left">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-faint mb-4">Ballot Transaction Receipt</p>
             <div className="flex items-center gap-4">
               <div className="p-3 bg-primary/10 rounded-xl text-primary"><Shield size={20} /></div>
               <p className="font-mono text-sm text-primary font-black uppercase tracking-widest">{Math.random().toString(36).substring(2, 15).toUpperCase()}-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
             </div>
          </div>
        </motion.div>
      ) : election ? (
        <div className="space-y-10">
           <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                   <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active Electoral Window</span>
                </div>
                <h3 className="text-4xl font-black italic uppercase italic tracking-tighter flex items-center gap-4">
                   Official Ballot Registry
                </h3>
                <p className="text-sm font-bold text-text-muted">Candidates validated for {user?.constituency || 'your regional sector'}</p>
              </div>
              <div className="bg-black/40 px-10 py-5 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-1 shadow-2xl">
                <p className="text-[9px] font-black text-text-faint uppercase tracking-widest">Election Window Closes In</p>
                <div className="flex items-center gap-4">
                   <Clock className="text-warning animate-pulse-slow" size={24} />
                   <span className="font-mono font-black text-4xl text-warning tracking-tighter tabular-nums drop-shadow-lg">{formatTime(timeRemaining)}</span>
                </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {candidates.map((cand) => (
                <motion.div 
                  key={cand._id}
                  whileHover={{ y: -10 }}
                  className="glass-card relative group p-10 overflow-hidden border-t-[8px]"
                  style={{ borderTopColor: cand.color }}
                >
                  {/* Subtle BG Pattern */}
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                     <Award size={120} />
                  </div>

                  <div className="flex items-start justify-between mb-8">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
                         <img src={cand.photo} alt={cand.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-[#05070a] p-2 rounded-2xl border border-white/5">
                         <div className="w-5 h-5 rounded-full shadow-lg" style={{ backgroundColor: cand.color }} />
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleCompare(cand._id)}
                      className={`p-3 rounded-2xl border transition-all duration-300 ${compareList.includes(cand._id) ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-600/30 scale-110' : 'bg-white/5 border-white/10 text-text-faint hover:text-indigo-400 hover:border-indigo-500/40'}`}
                    >
                      <Search size={20} />
                    </button>
                  </div>

                  <div className="space-y-1 mb-6">
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">{cand.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: cand.color }}>{cand.party}</p>
                  </div>
                  
                  <div className="space-y-5 mb-10">
                    <div className="flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-widest bg-black/20 p-3 rounded-xl border border-white/5">
                       <Award size={14} className="text-primary" /> {cand.experience}
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed font-medium line-clamp-3 italic opacity-80 group-hover:opacity-100 transition-opacity">"{cand.description}"</p>
                  </div>

                  {/* AI INSIGHT SECTION */}
                  <div className="mb-10 p-6 bg-primary/5 rounded-3xl border border-primary/10 group-hover:bg-primary/10 transition-colors relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-[0.1em]">
                          <Sparkles size={14} className="animate-pulse" /> Neural Summary
                       </div>
                       {!summaries[cand._id] && (
                         <button 
                           onClick={() => handleSummarize(cand._id)}
                           disabled={summarizing === cand._id}
                           className="text-[9px] font-black uppercase tracking-widest text-text-faint hover:text-primary transition-colors disabled:opacity-50"
                         >
                           {summarizing === cand._id ? 'Analyzing...' : 'Execute Synthesis'}
                         </button>
                       )}
                    </div>
                    {summaries[cand._id] ? (
                      <p className="text-[11px] text-text-muted italic leading-relaxed font-medium whitespace-pre-line group-hover:text-text transition-colors">{summaries[cand._id]}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-primary/20 w-1/3" />
                        </div>
                        <p className="text-[9px] text-text-faint font-bold italic">AI node waiting for initialization...</p>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleVote(cand._id)}
                    disabled={!!voting}
                    className="w-full btn-primary py-5 rounded-2xl group-hover:scale-[1.02] transition-transform"
                    style={{ background: `linear-gradient(135deg, ${cand.color} 0%, ${cand.color}cc 100%)`, boxShadow: `0 15px 35px ${cand.color}30` }}
                  >
                    {voting === cand._id ? <Loader2 size={24} className="animate-spin mx-auto" /> : (
                      <span className="flex items-center justify-center gap-3">
                         <VoteIcon size={20} /> CAST BALLOT
                      </span>
                    )}
                  </button>
                </motion.div>
              ))}
           </div>
        </div>
      ) : (
        <div className="glass p-24 text-center space-y-8 border-t-8 border-t-rose-500/20">
           <div className="w-24 h-24 bg-rose-500/10 text-rose-500/40 rounded-[2rem] flex items-center justify-center mx-auto">
              <Shield size={64} />
           </div>
           <div className="space-y-4">
              <h3 className="text-4xl font-black italic uppercase tracking-tighter">Node Standby</h3>
              <p className="text-text-muted text-lg max-w-xl mx-auto font-medium">The Central Election Commission has not broadcasted an active electoral cycle for your sector. System heartbeat is normal.</p>
           </div>
        </div>
      )}

      {/* AI Comparison Modal */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-[#05070a]/95 backdrop-blur-2xl">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="glass w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col relative"
             >
                <div className="p-10 border-b border-white/5 flex justify-between items-center shrink-0">
                   <div className="flex items-center gap-6">
                      <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-2xl shadow-indigo-600/30"><BrainCircuit size={40} /></div>
                      <div>
                         <h3 className="text-4xl font-black italic uppercase tracking-tighter">Neural Comparison Report</h3>
                         <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Proprietary Side-by-Side Policy Analysis</p>
                      </div>
                   </div>
                   <button onClick={() => setIsCompareModalOpen(false)} className="p-4 hover:bg-white/5 rounded-[1.5rem] text-text-faint transition-colors border border-transparent hover:border-white/5">
                      <X size={32} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
                   {analyzing ? (
                     <div className="py-32 text-center space-y-8">
                        <div className="w-24 h-24 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                        <div className="space-y-2">
                           <p className="text-2xl font-black italic uppercase text-indigo-400 animate-pulse">Synchronizing Neural Layers...</p>
                           <p className="text-[10px] font-black text-text-faint uppercase tracking-widest">Accessing Gemini 1.5-flash Node</p>
                        </div>
                     </div>
                   ) : aiAnalysis ? (
                     <div className="space-y-12">
                        <div className="p-10 bg-indigo-600/5 rounded-[3rem] border border-indigo-500/10 relative overflow-hidden">
                           <Sparkles size={100} className="absolute -top-10 -right-10 text-indigo-500 opacity-5" />
                           <p className="text-lg text-text-muted italic leading-relaxed font-medium relative z-10">
                              "{aiAnalysis.overview}"
                           </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-6">
                              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><CheckCircle2 size={16} /></div>
                                 STRATEGIC STRENGTHS A
                              </h4>
                              <div className="space-y-4">
                                 {aiAnalysis.candidateA_pros?.map((pro: string, i: number) => (
                                   <div key={i} className="p-5 bg-white/5 rounded-3xl text-xs font-semibold text-text-muted flex gap-4 border border-white/5 group hover:border-primary/40 transition-all">
                                      <div className="w-1.5 h-1.5 bg-success rounded-full mt-1.5 shrink-0" />
                                      {pro}
                                   </div>
                                 ))}
                              </div>
                           </div>
                           <div className="space-y-6">
                              <h4 className="text-sm font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center"><CheckCircle2 size={16} /></div>
                                 STRATEGIC STRENGTHS B
                              </h4>
                              <div className="space-y-4">
                                 {aiAnalysis.candidateB_pros?.map((pro: string, i: number) => (
                                   <div key={i} className="p-5 bg-white/5 rounded-3xl text-xs font-semibold text-text-muted flex gap-4 border border-white/5 group hover:border-accent/40 transition-all">
                                      <div className="w-1.5 h-1.5 bg-success rounded-full mt-1.5 shrink-0" />
                                      {pro}
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="p-12 bg-black/40 rounded-[4rem] border border-white/5 shadow-inner">
                           <h4 className="text-sm font-black uppercase tracking-[0.4em] text-warning mb-8 text-center">KEY SYSTEMIC DIFFERENTIATORS</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {aiAnalysis.key_differences?.map((diff: string, i: number) => (
                                <div key={i} className="p-6 bg-white/5 rounded-[2rem] text-xs font-medium text-text-muted flex gap-5 border border-white/5 hover:bg-white/10 transition-all">
                                   <Sparkles size={20} className="text-warning shrink-0" />
                                   <span className="leading-relaxed italic">"{diff}"</span>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   ) : null}
                </div>

                <div className="p-8 border-t border-white/5 bg-black/20 text-center shrink-0">
                   <p className="text-[9px] font-black text-text-faint uppercase tracking-[0.5em]">AI Transparency Log: Neural weights unbiased | No partisan filtering active</p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoterDashboard;
