import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Vote, CheckCircle2, User, ChevronRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const VotingSection = ({ user, onVoteSuccess }: { user: any, onVoteSuccess: () => void }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(user?.hasVoted || false);

  const fetchCandidates = async () => {
    try {
      const { data } = await api.get('/voting/candidates');
      setCandidates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleVote = async (candidateId: string) => {
    if (!window.confirm('Are you sure you want to cast your vote for this candidate? This action cannot be undone.')) return;
    
    setVoting(true);
    try {
      await api.post('/voting/vote', { candidateId });
      setVoted(true);
      onVoteSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Voting failed');
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold italic text-gray-400">Loading Candidates...</div>;

  if (voted) {
    return (
      <div className="bg-green-50 border-2 border-green-100 rounded-[32px] p-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-3xl font-black italic text-green-800 uppercase tracking-tight mb-4">Vote Confirmed</h3>
        <p className="text-green-700 font-medium max-w-md mx-auto">
          Thank you for participating in the democratic process. Your vote has been securely recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {candidates.length === 0 && (
        <div className="col-span-2 p-10 bg-gray-50 rounded-3xl text-center text-gray-500 font-bold italic">
          No active candidates at this time.
        </div>
      )}
      {candidates.map((c: any) => (
        <motion.div 
          key={c._id}
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-50">
               {c.symbol ? <img src={c.symbol} alt={c.party} className="w-full h-full object-cover" /> : <ShieldCheck className="w-8 h-8 text-gray-300" />}
            </div>
            <div>
              <h4 className="text-xl font-black italic uppercase tracking-tight">{c.name}</h4>
              <p className="text-orange-600 font-bold text-xs uppercase tracking-widest">{c.party}</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-6 line-clamp-2 italic font-serif">
            {c.description || "Official candidate representing the platform's vision for growth and equity."}
          </p>
          <button 
            onClick={() => handleVote(c._id)}
            disabled={voting}
            className="w-full bg-black hover:bg-orange-600 text-white font-black italic uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
          >
            {voting ? "Processing..." : "Cast Vote"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      ))}
    </div>
  );
};

export default VotingSection;
