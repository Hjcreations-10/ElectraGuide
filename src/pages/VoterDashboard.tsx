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
  const [error, setError] = useState('');
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
      showToast('Failed to load election data', 'error');
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
    if (!window.confirm('Confirm your vote? This action is permanent and cannot be undone.')) return;
    setVoting(candidateId);
    try {
      await votingAPI.castVote(candidateId);
      showToast('Vote cast successfully!', 'success');
      setVoted(true);
      await refreshUser();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cast vote', 'error');
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
      showToast('AI Summary generated!', 'success');
    } catch (err) {
      showToast('AI Summarizer is currently offline', 'error');
    } finally {
      setSummarizing(null);
    }
  };

  const handleCompare = async () => {
    if (compareList.length !== 2) {
      showToast('Select exactly 2 candidates to compare', 'info');
      return;
    }
    setAnalyzing(true);
    setIsCompareModalOpen(true);
    try {
      const { data } = await aiAPI.compare(compareList);
      setAiAnalysis(data.analysis);
    } catch (err) {
      showToast('AI Analysis failed', 'error');
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
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}:${m}:${s}`;
  };

  if (loading) return <CandidateSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Regional Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <MapPin size={150} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tight mb-2">
              Welcome, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
            </h2>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                <MapPin size={12} className="text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest">{user?.state || 'National'} / {user?.constituency || 'General'}</span>
              </div>
              <p className="text-text-muted text-xs font-bold">Voter ID: <span className="font-mono text-primary">{user?.voterId}</span></p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="badge badge-success mb-2"><Shield size={10} /> Identity Secure</div>
            <p className="text-[10px] font-black text-text-faint uppercase tracking-widest italic">Digital Republic Voting System</p>
          </div>
        </div>
      </motion.div>

      {/* AI Comparison Control Bar */}
      {!voted && candidates.length > 1 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="bg-indigo-900/20 border border-primary/20 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl"><BrainCircuit className="text-primary" size={20} /></div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary">AI Candidate Comparison</p>
              <p className="text-[10px] text-text-muted font-bold">Select 2 candidates to compare their manifestos using AI</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
                {compareList.map(id => {
                  const cand = candidates.find(c => c._id === id);
                  return <div key={id} className="w-8 h-8 rounded-full border-2 border-bg bg-primary flex items-center justify-center text-[10px] font-black">{cand?.name[0]}</div>
                })}
             </div>
             <button 
               disabled={compareList.length !== 2}
               onClick={handleCompare}
               className="btn-primary py-2 px-6 shadow-primary/20 disabled:opacity-50"
             >
               <Sparkles size={14} /> Compare Now
             </button>
          </div>
        </motion.div>
      )}

      {/* Main Ballot Area */}
      {voted ? (
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass p-12 text-center space-y-6 border-l-8 border-l-success">
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-success/20">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-3xl font-black italic uppercase italic">Vote Recorded Securely</h3>
          <p className="text-text-muted max-w-md mx-auto">Your digital signature has been hashed and stored on the secure ledger. Results will be calculated once the election window closes.</p>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 inline-block">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-faint">Transaction ID</p>
             <p className="font-mono text-xs text-primary">{Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
          </div>
        </motion.div>
      ) : election ? (
        <div className="space-y-8">
           <div className="flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-black italic uppercase italic flex items-center gap-2">
                  <VoteIcon className="text-primary" /> Official Ballot
                </h3>
                <p className="text-xs font-bold text-text-muted">Candidates running in {user?.constituency || 'your area'}</p>
              </div>
              <div className="bg-black/30 px-6 py-2 rounded-xl border border-white/5 flex items-center gap-3">
                <Clock className="text-warning" size={16} />
                <span className="font-mono font-black text-xl text-warning">{formatTime(timeRemaining)}</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((cand) => (
                <motion.div 
                  key={cand._id}
                  whileHover={{ y: -5 }}
                  className={`glass relative group p-6 border-t-4`}
                  style={{ borderTopColor: cand.color }}
                >
                  {/* Candidate Profile Top */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                      <img src={cand.photo} alt={cand.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10" />
                      <div className="absolute -bottom-1 -right-1 bg-bg p-1 rounded-lg">
                         <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cand.color }} />
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleCompare(cand._id)}
                      className={`p-2 rounded-xl border transition-all ${compareList.includes(cand._id) ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white/5 border-white/10 text-text-faint hover:text-primary'}`}
                    >
                      <Search size={18} />
                    </button>
                  </div>

                  <h4 className="text-xl font-black italic uppercase tracking-tight">{cand.name}</h4>
                  <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: cand.color }}>{cand.party}</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase">
                       <Award size={12} className="text-primary" /> {cand.experience}
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-3">{cand.description}</p>
                  </div>

                  {/* AI Section */}
                  <div className="mb-8 p-4 bg-indigo-900/10 rounded-2xl border border-indigo-900/20">
                    <div className="flex justify-between items-center mb-2">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary italic">
                          <Sparkles size={12} /> AI Insight
                       </div>
                       {!summaries[cand._id] && (
                         <button 
                           onClick={() => handleSummarize(cand._id)}
                           disabled={summarizing === cand._id}
                           className="text-[9px] font-black uppercase tracking-widest text-text-faint hover:text-primary transition-colors disabled:opacity-50"
                         >
                           {summarizing === cand._id ? 'Analyzing...' : 'Summarize Promises'}
                         </button>
                       )}
                    </div>
                    {summaries[cand._id] ? (
                      <p className="text-[11px] text-text-muted italic leading-relaxed whitespace-pre-line">{summaries[cand._id]}</p>
                    ) : (
                      <p className="text-[9px] text-text-faint italic">Use AI to get a quick summary of this candidate's manifesto.</p>
                    )}
                  </div>

                  <button 
                    onClick={() => handleVote(cand._id)}
                    disabled={!!voting}
                    className="w-full btn-primary shadow-2xl py-4"
                    style={{ backgroundColor: cand.color, boxShadow: `0 10px 30px ${cand.color}30` }}
                  >
                    {voting === cand._id ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Cast Ballot'}
                  </button>
                </motion.div>
              ))}
           </div>
        </div>
      ) : (
        <div className="glass p-20 text-center space-y-4">
           <Shield className="mx-auto text-text-faint" size={60} />
           <h3 className="text-2xl font-black uppercase">No Active Election Cycle</h3>
           <p className="text-text-muted max-w-md mx-auto">The Central Election Commission has not launched an ongoing election window for your region yet. Check the schedule for updates.</p>
        </div>
      )}

      {/* AI Comparison Modal */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg/90 backdrop-blur-xl">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="glass w-full max-w-4xl max-h-[80vh] overflow-y-auto custom-scrollbar p-8 relative"
             >
                <button onClick={() => setIsCompareModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full text-text-faint">
                   <X size={24} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                   <div className="bg-primary/20 p-3 rounded-2xl text-primary"><BrainCircuit size={32} /></div>
                   <div>
                      <h3 className="text-3xl font-black italic uppercase tracking-tight">AI Intelligence Report</h3>
                      <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Side-by-side objective manifesto analysis</p>
                   </div>
                </div>

                {analyzing ? (
                  <div className="py-20 text-center space-y-6">
                     <Loader2 size={40} className="animate-spin mx-auto text-primary" />
                     <p className="text-lg font-black italic uppercase text-primary animate-pulse">Gemini AI is analyzing manifestos...</p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-8">
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/5 italic text-text-muted leading-relaxed">
                        "{aiAnalysis.overview}"
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <h4 className="text-sm font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Core Strengths A</h4>
                           <ul className="space-y-3">
                              {aiAnalysis.candidateA_pros?.map((pro: string, i: number) => (
                                <li key={i} className="text-xs text-text flex gap-3"><CheckCircle2 size={14} className="text-success shrink-0" /> {pro}</li>
                              ))}
                           </ul>
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-sm font-black uppercase tracking-widest text-accent border-b border-accent/20 pb-2">Core Strengths B</h4>
                           <ul className="space-y-3">
                              {aiAnalysis.candidateB_pros?.map((pro: string, i: number) => (
                                <li key={i} className="text-xs text-text flex gap-3"><CheckCircle2 size={14} className="text-success shrink-0" /> {pro}</li>
                              ))}
                           </ul>
                        </div>
                     </div>

                     <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
                        <h4 className="text-sm font-black uppercase tracking-widest text-warning mb-6">Key Strategic Differences</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {aiAnalysis.key_differences?.map((diff: string, i: number) => (
                             <div key={i} className="p-4 bg-white/5 rounded-2xl text-[11px] text-text-muted flex gap-3 border border-white/5">
                                <Sparkles size={14} className="text-warning shrink-0" /> {diff}
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                ) : null}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoterDashboard;
