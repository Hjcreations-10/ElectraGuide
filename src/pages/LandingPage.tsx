import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { 
  Vote, ShieldCheck, BarChart3, BrainCircuit, Lock, 
  ChevronRight, Users, Globe, Activity, Star, Play
} from 'lucide-react';

interface LandingPageProps {
  onEnterPortal: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterPortal }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-text overflow-x-hidden selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-20 mix-blend-overlay" />
        <motion.div 
          className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px]"
          animate={{ 
            x: mousePosition.x * 50, 
            y: mousePosition.y * 50 
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div 
          className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-accent/10 rounded-full blur-[100px]"
          animate={{ 
            x: mousePosition.x * -50, 
            y: mousePosition.y * -50 
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center backdrop-blur-md bg-[#05070a]/50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Vote className="text-white w-5 h-5" />
          </div>
          <span className="font-black italic tracking-tighter text-xl">ELECTRA<span className="text-primary">GUIDE</span></span>
        </div>
        <button onClick={onEnterPortal} className="btn-primary py-3 px-6 rounded-xl text-xs">
          Access Portal
        </button>
      </nav>

      <main className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-40">
        
        {/* 1. Hero Section */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-10 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full border-dashed animate-spin-slow opacity-20 pointer-events-none"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-black uppercase tracking-widest"
          >
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            V2.0 Enterprise Release Live
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]"
          >
            The Future of <br/>
            <span className="gradient-text">Secure Democracy.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-text-muted max-w-2xl font-medium"
          >
            Military-grade encryption meets AI-driven analytics. ElectraGuide is the next-generation digital voting infrastructure built for absolute transparency and immutable trust.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button onClick={onEnterPortal} className="btn-primary py-5 px-10 rounded-2xl text-base group">
              Initialize Secure Session 
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn-ghost py-5 px-10 rounded-2xl text-base group">
              <Play size={18} className="text-text-muted group-hover:text-primary transition-colors" />
              View Architecture
            </button>
          </motion.div>
        </section>

        {/* 2. Stats Section */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Votes Secured', value: '1.2M+', icon: <ShieldCheck /> },
              { label: 'Uptime', value: '99.99%', icon: <Activity /> },
              { label: 'Fraud Prevented', value: '100%', icon: <Lock /> },
              { label: 'Active Regions', value: '45+', icon: <Globe /> }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 text-center space-y-4 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 mx-auto bg-white/5 rounded-2xl flex items-center justify-center text-primary">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-black italic tracking-tighter">{stat.value}</h3>
                <p className="text-[10px] font-black uppercase text-text-faint tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. Features Section */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Enterprise Grade Features</h2>
            <p className="text-text-muted">Built from the ground up to prevent tampering and ensure verifiable results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Lock size={32} />}
              title="Immutable Ledger"
              desc="Every ballot is secured using SHA-256 cryptographic hashing, ensuring complete tamper resistance and an auditable paperless trail."
              color="primary"
            />
            <FeatureCard 
              icon={<BrainCircuit size={32} />}
              title="Neural AI Synthesis"
              desc="Integrated Gemini 1.5-flash analyzes complex candidate manifestos, providing voters with unbiased, strictly factual summaries."
              color="accent"
            />
            <FeatureCard 
              icon={<BarChart3 size={32} />}
              title="Real-Time Intelligence"
              desc="Administrators get instant access to live turnout metrics, demographic heatmaps, and security anomaly detection."
              color="success"
            />
          </div>
        </section>

        {/* 4. Testimonial Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-primary/5 rounded-[4rem] transform -skew-y-3" />
          <div className="relative z-10 py-20 px-10 text-center space-y-12">
            <div className="flex justify-center gap-2 text-warning">
              {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" />)}
            </div>
            <h3 className="text-3xl md:text-5xl font-medium leading-tight max-w-4xl mx-auto italic">
              "ElectraGuide is the most robust digital voting architecture I have reviewed. The implementation of AI for voter education combined with military-grade ballot hashing sets a new standard for GovTech."
            </h3>
            <div>
              <p className="font-black text-lg">Dr. Sarah Chen</p>
              <p className="text-text-faint text-sm font-bold uppercase tracking-widest">Lead Tech Auditor, Global Gov Solutions</p>
            </div>
          </div>
        </section>

        {/* 5. Final CTA */}
        <section className="text-center space-y-8 pb-32">
          <h2 className="text-4xl font-black italic tracking-tighter">Ready to Deploy?</h2>
          <p className="text-text-muted max-w-xl mx-auto">Experience the platform first-hand. Log in using our secure Sandbox access to explore both Voter and Admin interfaces.</p>
          <button onClick={onEnterPortal} className="btn-primary py-5 px-12 rounded-2xl text-lg shadow-2xl shadow-primary/20">
            Access Sandbox Environment
          </button>
        </section>

      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }: any) => {
  const colorMap: any = {
    primary: 'border-primary/20 hover:border-primary text-primary',
    accent: 'border-accent/20 hover:border-accent text-accent',
    success: 'border-success/20 hover:border-success text-success',
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`glass p-10 border-t-4 transition-all duration-300 ${colorMap[color]}`}
    >
      <div className="mb-6 w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <h4 className="text-xl font-black mb-4 text-text">{title}</h4>
      <p className="text-sm text-text-muted font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
};

export default LandingPage;
