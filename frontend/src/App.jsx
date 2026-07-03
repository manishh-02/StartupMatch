import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, User, ArrowRight, Globe, Sparkles, Code, Briefcase, Zap, 
  ArrowLeft, Terminal, Rocket, Shield, Loader2, LogOut, Users, 
  LayoutDashboard, MessageSquare, Settings, Bell, Search, Menu, 
  CheckCircle, ChevronRight, ChevronLeft, Target, Compass, Award,
  Send, MoreVertical, CheckCheck, Check, Activity, Lightbulb,
  Kanban, Plus, Clock, CheckSquare, ListTodo, Trash2, Edit2, Calculator, DollarSign,
  TrendingUp, FileText, PieChart, Network
} from 'lucide-react';
import { FaLinkedin, FaGithub, FaTwitter, FaProductHunt, FaDribbble, FaMedium } from 'react-icons/fa';

// ==========================================
// 🚀 SERVER CONFIGURATION (PERMANENT SOLUTION)
// ==========================================
// Bhai, Yahan par apne Render Backend ka URL daal do (Last mein '/' mat lagana)
// Example: 'https://startupmatch-backend.onrender.com'
const API_BASE_URL = 'https://YOUR_BACKEND_URL.onrender.com'; 

// WebSockets ke liye 'https' ki jagah 'wss' lagana hai
// Example: 'wss://startupmatch-backend.onrender.com/ws/chat'
const WS_BASE_URL = 'wss://YOUR_BACKEND_URL.onrender.com/ws/chat';

// ==========================================
// 0. GLOBAL HELPER FUNCTIONS
// ==========================================
const safeUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

const pageVariants = {
  initial: { opacity: 0, y: 15, filter: 'blur(10px)' },
  in: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: 'easeOut' } },
  out: { opacity: 0, y: -15, filter: 'blur(10px)', transition: { duration: 0.3, ease: 'easeIn' } }
};

const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const staggerItem = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

// ==========================================
// 1. REUSABLE ANIMATED COMPONENTS
// ==========================================
const AnimatedInput = ({ icon: Icon, type, placeholder, id, value, onChange, disabled=false }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="relative mb-4">
      <motion.div animate={{ color: isFocused || value ? '#a855f7' : '#6b7280', scale: isFocused ? 1.1 : 1 }} className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <Icon className="w-4 h-4 transition-colors duration-300" />
      </motion.div>
      <input
        id={id} type={type} value={value} onChange={onChange} disabled={disabled}
        onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
        className={`w-full bg-black/40 border border-white/10 text-white rounded-xl px-12 py-3 outline-none transition-all duration-300 peer focus:bg-white/5 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <motion.label
        htmlFor={id} initial={{ top: '50%', y: '-50%', left: '48px', fontSize: '14px' }}
        animate={{
          top: isFocused || value ? '0px' : '50%', y: isFocused || value ? '-50%' : '-50%',
          left: isFocused || value ? '12px' : '48px', fontSize: isFocused || value ? '10px' : '14px',
          color: isFocused || value ? '#a855f7' : '#6b7280', backgroundColor: isFocused || value ? '#0a0a0a' : 'transparent',
          padding: isFocused || value ? '0 6px' : '0 0'
        }}
        transition={{ duration: 0.2, type: 'tween' }}
        className="absolute pointer-events-none rounded-full cursor-text font-semibold tracking-wide"
      >
        {placeholder}
      </motion.label>
    </div>
  );
};

const AnimatedTextArea = ({ icon: Icon, placeholder, id, value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="relative mb-4">
      <motion.div animate={{ color: isFocused || value ? '#a855f7' : '#6b7280', scale: isFocused ? 1.1 : 1 }} className="absolute left-4 top-5 -translate-y-1/2 z-10">
        <Icon className="w-4 h-4 transition-colors duration-300" />
      </motion.div>
      <textarea
        id={id} value={value} onChange={onChange} rows={3}
        onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
        className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-12 py-3 outline-none transition-all duration-300 peer focus:bg-white/5 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] resize-none text-sm leading-relaxed"
      />
      <motion.label
        htmlFor={id} initial={{ top: '20px', y: '-50%', left: '48px', fontSize: '14px' }}
        animate={{
          top: isFocused || value ? '0px' : '20px', y: isFocused || value ? '-50%' : '-50%',
          left: isFocused || value ? '12px' : '48px', fontSize: isFocused || value ? '10px' : '14px',
          color: isFocused || value ? '#a855f7' : '#6b7280', backgroundColor: isFocused || value ? '#0a0a0a' : 'transparent',
          padding: isFocused || value ? '0 6px' : '0 0'
        }}
        transition={{ duration: 0.2, type: 'tween' }}
        className="absolute pointer-events-none rounded-full cursor-text font-semibold tracking-wide"
      >
        {placeholder}
      </motion.label>
    </div>
  );
};

const SelectionGrid = ({ options, selected, onSelect }) => (
  <div className="grid grid-cols-2 gap-3 mb-5">
    {options.map((opt) => (
      <motion.div
        key={opt} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(opt)}
        className={`p-3 rounded-xl border text-center cursor-pointer transition-all duration-300 font-bold text-xs tracking-wide ${selected === opt ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30 hover:bg-white/5'}`}
      >
        {opt}
      </motion.div>
    ))}
  </div>
);

// ==========================================
// 2. LANDING PAGE
// ==========================================
const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" className="min-h-screen bg-[#030303] text-white overflow-x-hidden selection:bg-purple-500/30 font-sans relative flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2], rotate: [0, 45, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-purple-900/10 via-transparent to-transparent blur-3xl mix-blend-screen"></motion.div>
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1], rotate: [0, -45, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute bottom-0 right-0 w-full h-full bg-linear-to-tl from-blue-900/10 via-transparent to-transparent blur-3xl mix-blend-screen"></motion.div>
        <div className="absolute inset-0 mask-image-[radial-gradient(ellipse_80%_80%_at_50%_50%,#000_10%,transparent_100%)]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      </div>

      <nav className="relative w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]"><Sparkles className="w-4 h-4 text-white" /></div>
            <span className="text-lg font-bold tracking-tight">StartupMatch</span>
          </motion.div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/auth')} className="px-5 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all font-semibold flex items-center gap-2 cursor-pointer text-xs backdrop-blur-md">
            Sign In <ArrowRight className="w-3 h-3" />
          </motion.button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col items-center w-full max-w-3xl">
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] uppercase font-bold mb-6 shadow-[0_0_15px_rgba(168,85,247,0.2)] tracking-widest">
            <Rocket className="w-3 h-3" /> The New Standard for Founders
          </motion.div>
          <motion.h1 variants={staggerItem} className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight drop-shadow-lg">
            Build the next <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-blue-400 to-purple-500">Unicorn Startup.</span>
          </motion.h1>
          <motion.p variants={staggerItem} className="text-gray-400 text-sm md:text-base mb-8 leading-relaxed font-medium max-w-xl mx-auto">
            An elite, AI-driven matchmaking engine designed for serious founders, engineers, and visionary investors to connect globally.
          </motion.p>
          <motion.div variants={staggerItem}>
            <motion.button whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(255,255,255,0.2)" }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/auth')} className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all">
              Join the Elite Network <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
};

// ==========================================
// 3. AUTHENTICATION PAGE
// ==========================================
const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg(''); setIsLoading(true);
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';

    try {
      const payload = isLogin 
        ? new URLSearchParams({ username: formData.email, password: formData.password })
        : JSON.stringify({ full_name: formData.name, email: formData.email, password: formData.password, role: "founder" });
      
      const headers = isLogin 
        ? { 'Content-Type': 'application/x-www-form-urlencoded' }
        : { 'Content-Type': 'application/json' };

      // 🌐 DYNAMIC URL USED HERE
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', headers, body: payload });
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMsg(isLogin ? 'Authentication Verified. Routing...' : 'Workspace allocated! Initializing...');
        if(isLogin) {
            localStorage.setItem('access_token', data.access_token);
            setTimeout(() => navigate('/dashboard'), 1500);
        } else {
            setFormData({ name: '', email: '', password: '' });
            setTimeout(() => setIsLogin(true), 2000);
        }
      } else { 
        setErrorMsg(data.detail || 'Authentication failed. Check credentials.'); 
      }
    } catch (err) { 
        setErrorMsg('Network Error: Database/Server is currently unreachable.'); 
    }
    setIsLoading(false);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" className="min-h-screen bg-[#050505] flex text-white relative overflow-hidden">
      <motion.button whileHover={{ x: -3 }} onClick={() => navigate('/')} className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer font-bold bg-white/5 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all text-xs">
        <ArrowLeft className="w-3 h-3" /> Back to Hub
      </motion.button>
      
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center items-center p-10 border-r border-white/10 bg-linear-to-br from-purple-900/10 to-black overflow-hidden">
        <div className="absolute inset-0 mask-image-[radial-gradient(ellipse_80%_80%_at_50%_50%,#000_30%,transparent_100%)]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="relative z-10 w-full max-w-sm">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }} className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] mb-6 border border-white/20">
             <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight mb-4">
            System Online. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">Ready to Build?</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            Authenticate to access the Neural Vector Feed, establish private workspaces, and connect globally.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative bg-black/40 backdrop-blur-3xl">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm bg-[#0b141a] p-8 rounded-2xl border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.6)] backdrop-blur-lg">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-1.5 text-white">{isLogin ? 'Welcome Back' : 'Initialize Account'}</h2>
            <p className="text-xs text-gray-400 font-medium">{isLogin ? 'Enter credentials to access command center.' : 'Join the elite startup network.'}</p>
          </div>
          
          <AnimatePresence mode="wait">
            {errorMsg && <motion.div key="err" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-xs text-center shadow-inner">{errorMsg}</motion.div>}
            {successMsg && <motion.div key="succ" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 font-semibold text-xs text-center shadow-inner">{successMsg}</motion.div>}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div initial={{ opacity: 0, x: -10, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} exit={{ opacity: 0, x: 10, height: 0 }}>
                  <AnimatedInput icon={User} type="text" placeholder="Full Name" id="name" value={formData.name} onChange={handleChange} />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatedInput icon={Mail} type="email" placeholder="Email Address" id="email" value={formData.email} onChange={handleChange} />
            <AnimatedInput icon={Lock} type="password" placeholder="Password" id="password" value={formData.password} onChange={handleChange} />
            
            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full rounded-xl bg-white text-black font-bold text-sm py-3 shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] mt-2 cursor-pointer disabled:opacity-70 transition-all flex items-center justify-center gap-2">
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{isLogin ? 'Access Workspace' : 'Deploy Account'} <ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </form>

          <div className="mt-5 text-center text-gray-400 font-medium text-xs tracking-wide">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setSuccessMsg(''); }} className="text-white hover:text-purple-400 cursor-pointer transition-colors border-b border-transparent hover:border-purple-400 pb-0.5 font-bold">{isLogin ? 'Create one' : 'Log in'}</button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ==========================================
// 4. MULTI-STEP ADVANCED PROFILE SETUP
// ==========================================
const ProfileSetup = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    primary_role: 'Technical', startup_stage: 'Idea Phase', commitment_level: 'Full-Time Ready',
    bio: '', tech_stack: '', project_plan: '', looking_for: '', experience_years: '',
    linkedin_url: '', github_url: '', twitter_url: '', portfolio_url: '', producthunt_url: '', dribbble_url: '', medium_url: ''
  });

  useEffect(() => { 
    if (!token) navigate('/auth'); 
    fetch(`${API_BASE_URL}/users/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if(data.profile) setFormData(prev => ({ ...prev, ...data.profile })); });
  }, [token, navigate]);

  const handleSelect = (field, val) => setFormData({ ...formData, [field]: val });
  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, experience_years: parseInt(formData.experience_years) || 0 })
      });
      if (response.ok) navigate('/dashboard'); else alert("Server Error occurred during profile save.");
    } catch (error) { alert("Network Error while saving profile!"); }
    setIsSubmitting(false);
  };

  const stepVariants = {
    hidden: { x: 30, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { x: -30, opacity: 0, transition: { duration: 0.2 } }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" className="min-h-screen bg-[#050505] flex items-center justify-center p-4 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-xl bg-[#0b141a] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 relative z-10 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
        <div className="mb-6 border-b border-white/5 pb-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-black tracking-tight text-white">AI Blueprint Configuration</h2>
            <span className="text-purple-400 text-[10px] font-bold bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-md shadow-inner uppercase tracking-wider">Step {step} / 4</span>
          </div>
          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-inner">
            <motion.div initial={{ width: '0%' }} animate={{ width: step === 1 ? '25%' : step === 2 ? '50%' : step === 3 ? '75%' : '100%' }} className="h-full bg-linear-to-r from-purple-500 to-blue-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="st1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
              <h3 className="text-base font-bold mb-4 text-purple-400 flex items-center gap-2"><Award className="w-4 h-4" /> Identity Matrix</h3>
              <SelectionGrid options={['Technical', 'Product', 'Growth/Marketing', 'Business/Ops']} selected={formData.primary_role} onSelect={(v) => handleSelect('primary_role', v)} />
              <AnimatedInput icon={Briefcase} type="number" placeholder="Total Years Experience" id="experience_years" value={formData.experience_years} onChange={handleChange} />
              <AnimatedTextArea icon={User} placeholder="Your Bio (Experience, Vision)" id="bio" value={formData.bio} onChange={handleChange} />
              <div className="flex justify-end mt-4"><button onClick={() => setStep(2)} className="bg-white text-black px-5 py-2 rounded-xl font-bold text-xs cursor-pointer hover:bg-gray-200 transition-colors">Continue &rarr;</button></div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="st2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
              <h3 className="text-base font-bold mb-4 text-blue-400 flex items-center gap-2"><Compass className="w-4 h-4" /> Venture Trajectory</h3>
              <SelectionGrid options={['Idea Phase', 'MVP Built', 'Early Traction', 'Revenue Generating']} selected={formData.startup_stage} onSelect={(v) => handleSelect('startup_stage', v)} />
              <AnimatedInput icon={Code} type="text" placeholder="Tech Stack (e.g. React, Node, Python)" id="tech_stack" value={formData.tech_stack || ''} onChange={handleChange} />
              <AnimatedTextArea icon={Terminal} placeholder="Project Plan & Architecture Vision..." id="project_plan" value={formData.project_plan || ''} onChange={handleChange} />
              <div className="flex justify-between mt-4">
                <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white font-bold text-xs cursor-pointer transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5">&larr; Back</button>
                <button onClick={() => setStep(3)} className="bg-white text-black px-5 py-2 rounded-xl font-bold text-xs cursor-pointer hover:bg-gray-200 transition-colors">Continue &rarr;</button>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="st3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
              <h3 className="text-base font-bold mb-4 text-green-400 flex items-center gap-2"><Target className="w-4 h-4" /> Intent Delta</h3>
              <SelectionGrid options={['Part-Time', 'Full-Time Ready', 'Incorporated']} selected={formData.commitment_level} onSelect={(v) => handleSelect('commitment_level', v)} />
              <AnimatedInput icon={Search} type="text" placeholder="Looking for (e.g. CTO, CMO)" id="looking_for" value={formData.looking_for || ''} onChange={handleChange} />
              <div className="flex justify-between mt-4">
                <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white font-bold text-xs cursor-pointer transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5">&larr; Back</button>
                <button onClick={() => setStep(4)} className="bg-white text-black px-5 py-2 rounded-xl font-bold text-xs cursor-pointer hover:bg-gray-200 transition-colors">Continue &rarr;</button>
              </div>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div key="st4" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
              <h3 className="text-base font-bold mb-4 text-pink-400 flex items-center gap-2"><Globe className="w-4 h-4" /> Digital Footprint</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                <AnimatedInput icon={FaLinkedin} type="url" placeholder="LinkedIn URL" id="linkedin_url" value={formData.linkedin_url || ''} onChange={handleChange} />
                <AnimatedInput icon={FaGithub} type="url" placeholder="GitHub URL" id="github_url" value={formData.github_url || ''} onChange={handleChange} />
                <AnimatedInput icon={FaTwitter} type="url" placeholder="Twitter URL" id="twitter_url" value={formData.twitter_url || ''} onChange={handleChange} />
                <AnimatedInput icon={Globe} type="url" placeholder="Website" id="portfolio_url" value={formData.portfolio_url || ''} onChange={handleChange} />
                <AnimatedInput icon={FaProductHunt} type="url" placeholder="ProductHunt URL" id="producthunt_url" value={formData.producthunt_url || ''} onChange={handleChange} />
                <AnimatedInput icon={FaDribbble} type="url" placeholder="Dribbble URL" id="dribbble_url" value={formData.dribbble_url || ''} onChange={handleChange} />
              </div>
              <AnimatedInput icon={FaMedium} type="url" placeholder="Medium Blog URL" id="medium_url" value={formData.medium_url || ''} onChange={handleChange} />
              <div className="flex justify-between mt-4">
                <button onClick={() => setStep(3)} className="text-gray-400 hover:text-white font-bold text-xs cursor-pointer transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5">&larr; Back</button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="bg-linear-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs cursor-pointer shadow-md disabled:opacity-50 transition-colors flex items-center gap-1.5">
                  {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3 h-3" /> Deploy Blueprint</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ==========================================
// 5. NETWORK FEED
// ==========================================
const NetworkFeed = ({ token, onMessageClick }) => {
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/users/feed`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setFeed(data); setIsLoading(false); })
      .catch(err => { console.error("Error fetching feed:", err); setIsLoading(false); });
  }, [token]);

  if (isLoading) return <div className="flex-1 flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;

  return (
    <div className="p-8 max-w-6xl w-full mx-auto relative z-10">
      <div className="mb-8 border-b border-white/5 pb-4">
        <h2 className="text-2xl font-black mb-1 tracking-tight text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400"/> Neural Vector Feed
        </h2>
        <p className="text-gray-400 text-xs font-medium">Cross-referencing startup matrices for synergistic algorithmic match.</p>
      </div>

      {feed.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center h-[40vh] bg-white/5 rounded-2xl border border-white/10">
          <Globe className="w-10 h-10 text-gray-500 mb-3 opacity-50" />
          <h3 className="text-lg font-bold mb-1 text-white">The network is calibrating.</h3>
          <p className="text-gray-400 text-xs font-medium">Waiting for other founders to deploy their profiles.</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {feed.map((f) => {
            const hasSocialLinks = f.profile?.linkedin_url || f.profile?.github_url || f.profile?.twitter_url || f.profile?.portfolio_url;
            return (
              <motion.div key={f.id} variants={staggerItem} whileHover={{ y: -4 }} className="bg-[#0b141a] border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between group relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:border-white/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500/20 to-blue-500/20 border border-white/10 text-white font-black text-lg flex items-center justify-center uppercase relative shadow-inner">
                        {f.full_name?.charAt(0) || 'U'}
                        <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                          {f.synergy_score}%
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold tracking-tight text-white">{f.full_name}</h4>
                        <p className="text-[10px] font-mono text-purple-400 font-bold uppercase mt-0.5">{f.profile?.primary_role || 'Founder'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {f.profile?.startup_stage && <span className="hidden sm:inline-block text-[9px] font-mono font-bold bg-white/5 border border-white/10 text-gray-300 px-2 py-1 rounded-md">{f.profile.startup_stage}</span>}
                      <button onClick={() => onMessageClick(f)} className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm" title={`Message ${f.full_name}`}>
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-black/40 p-3 rounded-xl border border-white/5 mb-4 shadow-inner">
                     <p className="text-xs text-gray-300 italic leading-relaxed">"{f.profile?.bio || 'Building the future.'}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3">
                    <div>
                      <span className="text-gray-500 block font-bold text-[9px] uppercase tracking-widest mb-1.5 flex items-center gap-1"><Code className="w-3 h-3 text-purple-400"/> Stack</span>
                      <p className="text-gray-300 font-mono text-[11px] truncate bg-black/40 p-1.5 rounded-md border border-white/5">{f.profile?.tech_stack || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block font-bold text-[9px] uppercase tracking-widest mb-1.5 flex items-center gap-1"><Terminal className="w-3 h-3 text-blue-400"/> Vision</span>
                      <p className="text-gray-300 text-[11px] truncate bg-black/40 p-1.5 rounded-md border border-white/5 font-medium">{f.profile?.project_plan || 'Undisclosed'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

// ==========================================
// 6. THE ULTIMATE CHAT UI (WITH SILENT POLLING & WEBSOCKETS) ⚡
// ==========================================
const MessagesView = ({ token, currentUser, selectedChatUser, setSelectedChatUser }) => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const activeChatUserIdRef = useRef(null);

  useEffect(() => { activeChatUserIdRef.current = selectedChatUser?.id || null; }, [selectedChatUser]);

  const loadInbox = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/conversations`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setConversations(await res.json());
    } catch(e) {}
  }, [token]);

  useEffect(() => { loadInbox(); }, [loadInbox, selectedChatUser]);

  // fetchHistory silent flag prevents UI scrolling on background polls
  const fetchHistory = useCallback(async (silent = false) => {
    if (!activeChatUserIdRef.current) return;
    try {
      await fetch(`${API_BASE_URL}/users/chat/read/${activeChatUserIdRef.current}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      const res = await fetch(`${API_BASE_URL}/users/chat/${activeChatUserIdRef.current}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if(res.ok) {
        setMessages(await res.json());
        if (!silent) {
           setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      }
    } catch(e) {}
  }, [token]);

  // Initial Load and Polling
  useEffect(() => {
    if (selectedChatUser) {
      fetchHistory(false); 
      const interval = setInterval(() => fetchHistory(true), 2500); // Background sync every 2.5s
      return () => clearInterval(interval);
    }
  }, [selectedChatUser, fetchHistory]);

  // WebSockets for instant broadcast
  useEffect(() => {
    if (!currentUser) return;
    let ws;
    let reconnectTimeout;

    const connectWS = () => {
      ws = new WebSocket(`${WS_BASE_URL}/${currentUser.id}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          if (activeChatUserIdRef.current) fetchHistory(false);
          loadInbox();
        } catch(err) {}
      };

      ws.onclose = () => { reconnectTimeout = setTimeout(connectWS, 3000); };
    };

    connectWS();
    return () => { clearTimeout(reconnectTimeout); if (ws) { ws.onclose = null; ws.close(); } };
  }, [currentUser, fetchHistory, loadInbox]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatUser) return;
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ receiver_id: selectedChatUser.id, content: newMessage }));
      setNewMessage(""); 
      setTimeout(() => fetchHistory(false), 100); 
    } else { alert("Network disconnected. Waiting for sync..."); }
  };

  const handleDeleteMessage = async (msgId) => {
    if(!window.confirm("Delete this message permanently?")) return;
    try {
      await fetch(`${API_BASE_URL}/users/messages/${msgId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchHistory(true); 
    } catch(e) {}
  };

  const handleEditMessage = async (msg) => {
    const newContent = window.prompt("Edit your message:", msg.content);
    if (!newContent || newContent === msg.content) return;
    try {
      await fetch(`${API_BASE_URL}/users/messages/${msg.id}`, {
         method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ content: newContent })
      });
      fetchHistory(true); 
    } catch(e) {}
  };

  return (
    <div className="p-6 max-w-6xl w-full mx-auto h-[85vh] flex relative z-10">
      <div className="flex w-full bg-[#111b21] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Inbox Sidebar */}
        <div className="w-1/3 border-r border-[#222d34] flex flex-col bg-[#0b141a]">
          <div className="p-4 border-b border-[#222d34] bg-[#202c33] flex items-center justify-between shadow-sm z-10">
            <h3 className="text-sm font-bold flex items-center gap-2 text-[#e9edef]"><MessageSquare className="w-4 h-4 text-green-400"/> Inbox Hub</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-gray-500 text-[11px] text-center mt-6 p-3 bg-white/5 rounded-xl border border-white/5 font-medium">No active synergies.</p>
            ) : (
              conversations.map(c => (
                <div key={c.id} onClick={() => setSelectedChatUser(c)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedChatUser?.id === c.id ? 'bg-[#2a3942] shadow-inner border border-white/10' : 'hover:bg-[#202c33] border border-transparent'}`}>
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500/20 to-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-sm uppercase shrink-0 border border-blue-500/30">{c.avatar}</div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-xs truncate text-[#e9edef]">{c.full_name}</h4>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5 font-mono uppercase">{c.role}</p>
                  </div>
                  {c.unread_count > 0 && <span className="bg-[#00a884] text-[#111b21] text-[9px] font-black px-2 py-0.5 rounded-full">{c.unread_count}</span>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0b141a] relative">
          {selectedChatUser ? (
            <>
              {/* Header */}
              <div className="h-16 border-b border-[#222d34] flex items-center px-5 bg-[#202c33] justify-between z-20 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-purple-500/20 to-blue-500/20 border border-white/10 text-white flex items-center justify-center font-bold text-sm uppercase">{selectedChatUser.avatar}</div>
                  <div>
                    <h3 className="font-bold text-sm text-white leading-tight">{selectedChatUser.full_name}</h3>
                    <span className="text-[9px] text-[#00a884] flex items-center gap-1 font-bold mt-0.5 uppercase"><span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse"></span> E2E Active</span>
                  </div>
                </div>
              </div>
              
              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-5 scroll-smooth" style={{ backgroundColor: '#0b141a', backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <div className="w-16 h-16 bg-[#202c33] rounded-full flex items-center justify-center mb-4 shadow-inner border border-white/5"><MessageSquare className="w-6 h-6 opacity-40" /></div>
                    <p className="bg-[#202c33] px-4 py-2 rounded-xl text-xs font-bold shadow-lg text-[#e9edef] border border-white/5">Start synergy with {selectedChatUser.full_name}.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = Number(msg.sender_id) === Number(currentUser.id);
                    return (
                      <div key={msg.id} className={`flex w-full mb-3 group ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`relative px-4 py-2.5 text-sm shadow-md ${isMe ? 'bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-sm' : 'bg-[#202c33] text-[#e9edef] rounded-2xl rounded-tl-sm border border-white/5'}`}>
                            <p style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: '1.4' }} className="font-medium">{msg.content}</p>
                            
                            <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-[9px] text-gray-400 font-bold tracking-wider">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMe && (msg.is_read ? <CheckCheck className="w-3 h-3 text-[#53bdeb]" /> : <Check className="w-3 h-3 text-gray-400" />)}
                            </div>
                            
                            {isMe && (
                              <div className="absolute top-1.5 -left-12 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-[#111b21] p-1 rounded-md border border-white/10 shadow-lg backdrop-blur-md z-10">
                                <Edit2 className="w-3 h-3 text-blue-400 cursor-pointer hover:scale-110 transition-transform" onClick={() => handleEditMessage(msg)} title="Edit" />
                                <Trash2 className="w-3 h-3 text-red-400 cursor-pointer hover:scale-110 transition-transform" onClick={() => handleDeleteMessage(msg.id)} title="Delete" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#202c33] flex gap-3 z-10 border-t border-white/5">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-[#2a3942] border border-white/10 text-white font-medium text-xs rounded-xl px-4 py-3 outline-none focus:border-[#00a884] focus:bg-[#2a3942] transition-colors shadow-inner" />
                <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 bg-[#00a884] text-[#111b21] rounded-xl flex items-center justify-center hover:bg-[#008f6f] transition-all cursor-pointer disabled:opacity-50"><Send className="w-4 h-4 ml-0.5" /></button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-black/20">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 shadow-xl border border-white/5"><Target className="w-8 h-8 opacity-30" /></div>
              <h3 className="text-lg font-bold text-[#e9edef] mb-1">StartupMatch Comms</h3>
              <p className="text-xs font-medium text-gray-400">Select a founder to chat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. IDEA BOARD
// ==========================================
const IdeaBoard = ({ token, currentUser, onMessageClick }) => {
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', elevator_pitch: '', target_audience: '', seeking: '' });

  const fetchIdeas = async () => {
    const res = await fetch(`${API_BASE_URL}/users/ideas`, { headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) setIdeas(await res.json());
    setIsLoading(false);
  };

  useEffect(() => { fetchIdeas(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE_URL}/users/ideas`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(newIdea) });
    setNewIdea({ title: '', elevator_pitch: '', target_audience: '', seeking: '' });
    setShowForm(false); fetchIdeas(); 
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this Idea Pitch permanently?")) return;
    try { await fetch(`${API_BASE_URL}/users/ideas/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }}); fetchIdeas(); } catch(e) {}
  };

  const handleEdit = async (idea) => {
    const newPitch = window.prompt("Update your Elevator Pitch:", idea.elevator_pitch);
    if (!newPitch || newPitch === idea.elevator_pitch) return;
    try { await fetch(`${API_BASE_URL}/users/ideas/${idea.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ elevator_pitch: newPitch }) }); fetchIdeas(); } catch(e) {}
  };

  if (isLoading) return <div className="flex-1 flex justify-center items-center h-[50vh]"><Loader2 className="w-10 h-10 animate-spin text-yellow-500" /></div>;

  return (
    <div className="p-8 max-w-6xl w-full mx-auto relative z-10">
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2 text-white tracking-tight"><div className="p-2 bg-yellow-500/20 rounded-xl"><Lightbulb className="text-yellow-400 w-5 h-5"/></div> Startup Idea Board</h2>
          <p className="text-gray-400 text-xs mt-1.5 font-medium">Pitch your vision globally or join an emerging unicorn.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all shadow-sm">
          {showForm ? 'Cancel Pitch' : 'Pitch New Idea 🚀'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }} onSubmit={handleSubmit} className="bg-black/60 border border-yellow-500/20 p-6 rounded-2xl mb-8 overflow-hidden shadow-lg backdrop-blur-xl">
            <h3 className="text-sm font-bold mb-4 text-yellow-400">Deploy New Concept</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">
              <AnimatedInput icon={Target} type="text" placeholder="Startup Name / Concept Title" id="title" value={newIdea.title} onChange={(e) => setNewIdea({...newIdea, title: e.target.value})} />
              <AnimatedInput icon={Users} type="text" placeholder="Who are you seeking?" id="seeking" value={newIdea.seeking} onChange={(e) => setNewIdea({...newIdea, seeking: e.target.value})} />
            </div>
            <AnimatedInput icon={Globe} type="text" placeholder="Target Audience / Market Size" id="target_audience" value={newIdea.target_audience} onChange={(e) => setNewIdea({...newIdea, target_audience: e.target.value})} />
            <AnimatedTextArea icon={Lightbulb} placeholder="The Elevator Pitch (Explain problem & solution)" id="elevator_pitch" value={newIdea.elevator_pitch} onChange={(e) => setNewIdea({...newIdea, elevator_pitch: e.target.value})} />
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={!newIdea.title || !newIdea.elevator_pitch} className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer hover:bg-gray-200 disabled:opacity-50 transition-colors">Broadcast to Network</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        {ideas.map((idea) => (
          <div key={idea.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl relative group hover:bg-white/10 transition-colors shadow-md hover:shadow-lg">
            {idea.founder_id === currentUser?.id && (
              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity bg-black/50 p-1.5 rounded-xl backdrop-blur-md border border-white/5">
                <button onClick={() => handleEdit(idea)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => handleDelete(idea.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white cursor-pointer transition-colors"><Trash2 className="w-4 h-4"/></button>
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-xl font-black mb-2 text-white pr-20">{idea.title}</h3>
              <div className="flex items-center gap-2 text-[11px] bg-black/40 w-fit px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                <div className="w-5 h-5 bg-purple-500/30 text-purple-300 rounded-full flex items-center justify-center font-bold">{idea.founder_name?.charAt(0)}</div>
                <span className="text-purple-400 font-bold">{idea.founder_name}</span>
                <span className="text-gray-600 font-bold">•</span>
                <span className="text-gray-400 font-mono uppercase font-bold">{idea.founder_role}</span>
              </div>
            </div>
            <div className="bg-[#0b141a] p-5 rounded-xl border border-white/5 mb-4 shadow-inner relative">
              <Lightbulb className="absolute top-3 right-3 w-8 h-8 text-yellow-500/10 pointer-events-none"/>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">"{idea.elevator_pitch}"</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center border-t border-white/5 pt-4 gap-3">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="bg-yellow-500/10 text-yellow-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-yellow-500/20 uppercase tracking-wide">Seeking: {idea.seeking}</span>
                <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Globe className="w-3.5 h-3.5 text-blue-400"/> Market: {idea.target_audience || 'Global'}</span>
              </div>
              {idea.founder_id !== currentUser?.id && (
                <button onClick={() => onMessageClick({ id: idea.founder_id, full_name: idea.founder_name })} className="text-[11px] font-bold bg-white text-black px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors shadow-sm flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5"/> Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 8. EQUITY CALCULATOR
// ==========================================
const EquityCalculator = ({ workspaceId, token, currentUser }) => {
  const [founders, setFounders] = useState([{ user_id: currentUser?.id || 1, name: currentUser?.full_name || "Founder A", brings_idea: true, is_technical: true, time: "Full-Time", capital: 0 }]);
  const [results, setResults] = useState(null);

  const calculateEquity = async () => {
    try {
      const payload = { founders: founders.map(f => ({ user_id: f.user_id, brings_idea: f.brings_idea, is_technical: f.is_technical, time_commitment: f.time, capital_invested: Number(f.capital) })) };
      const res = await fetch(`${API_BASE_URL}/users/workspaces/${workspaceId}/calculate-equity`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload)
      });
      if(res.ok) {
        const data = await res.json();
        setResults(data.algorithm_results);
      }
    } catch(e) {}
  };

  return (
    <div className="bg-black/40 p-6 rounded-3xl border border-blue-500/20 mt-8 shadow-xl backdrop-blur-xl">
      <h3 className="text-lg font-black flex items-center gap-2 mb-5 border-b border-white/5 pb-3 text-white"><div className="p-2 bg-blue-500/20 rounded-xl"><Calculator className="text-blue-400 w-5 h-5"/></div> Dynamic Equity Engine</h3>
      <div className="space-y-3 mb-6">
        {founders.map((f, idx) => (
          <div key={idx} className="bg-white/5 p-4 rounded-xl flex flex-wrap gap-4 items-center border border-white/5 hover:bg-white/10 transition-colors shadow-inner">
            <input type="text" value={f.name} onChange={e=>{const n=[...founders]; n[idx].name=e.target.value; setFounders(n)}} className="bg-transparent font-bold text-sm border-b border-white/20 outline-none w-28 focus:border-blue-500 text-white placeholder-gray-500 py-1"/>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-gray-300 hover:text-white transition-colors"><input type="checkbox" checked={f.brings_idea} onChange={e => {const n=[...founders]; n[idx].brings_idea=e.target.checked; setFounders(n)}} className="w-3.5 h-3.5 accent-blue-500 rounded-sm"/> Idea</label>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-gray-300 hover:text-white transition-colors"><input type="checkbox" checked={f.is_technical} onChange={e => {const n=[...founders]; n[idx].is_technical=e.target.checked; setFounders(n)}} className="w-3.5 h-3.5 accent-blue-500 rounded-sm"/> Tech</label>
            <select className="bg-[#111b21] border border-white/10 text-white px-3 py-2 rounded-lg text-xs outline-none cursor-pointer focus:border-blue-500 font-bold shadow-inner" value={f.time} onChange={e => {const n=[...founders]; n[idx].time=e.target.value; setFounders(n)}}>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
            </select>
            <div className="flex items-center gap-1.5 bg-[#111b21] border border-white/10 px-3 py-1.5 rounded-lg focus-within:border-green-500 transition-colors shadow-inner">
              <DollarSign className="w-3.5 h-3.5 text-green-400"/>
              <input type="number" value={f.capital} onChange={e => {const n=[...founders]; n[idx].capital=e.target.value; setFounders(n)}} className="bg-transparent text-white w-16 text-xs outline-none font-bold" placeholder="Capital"/>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setFounders([...founders, { user_id: Date.now(), name: `Founder ${founders.length+1}`, brings_idea: false, is_technical: false, time: "Full-Time", capital: 0 }])} className="bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10 shadow-sm hover:scale-105">Add Founder</button>
        <button onClick={calculateEquity} className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.4)] cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5"/> Compute Split</button>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="mt-6 border-t border-white/5 pt-5">
            <h4 className="font-bold mb-4 text-sm flex items-center gap-2 text-white"><CheckCircle className="text-green-400 w-4 h-4"/> AI Allocation Output:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((r, i) => {
                 const fName = founders.find(f => f.user_id === r.user_id)?.name;
                 return (
                   <div key={i} className="flex flex-col justify-center items-center bg-linear-to-b from-green-500/10 to-transparent p-4 rounded-xl border border-green-500/20 shadow-inner">
                      <span className="font-bold text-xs text-gray-300 mb-1">{fName}</span>
                      <span className="font-black text-2xl text-green-400">{r.suggested_equity_percentage}%</span>
                   </div>
                 );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 9. WORKSPACES (WITH KANBAN & DELETE)
// ==========================================
const WorkspacesView = ({ token, currentUser }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWs, setSelectedWs] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWs, setNewWs] = useState({ name: '', description: '' });
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");

  const fetchWorkspaces = async () => {
    const res = await fetch(`${API_BASE_URL}/users/workspaces`, { headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) setWorkspaces(await res.json());
  };

  const fetchTasks = async (wsId) => {
    const res = await fetch(`${API_BASE_URL}/users/workspaces/${wsId}/tasks`, { headers: { 'Authorization': `Bearer ${token}` } });
    if(res.ok) setTasks(await res.json());
  };

  useEffect(() => { fetchWorkspaces(); }, [token]);
  useEffect(() => { if(selectedWs) fetchTasks(selectedWs.id); }, [selectedWs, token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE_URL}/users/workspaces`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(newWs) });
    setNewWs({ name: '', description: '' }); setShowCreateForm(false); fetchWorkspaces();
  };

  const handleDeleteWs = async (id) => {
    if(!window.confirm("CRITICAL WARNING: Delete workspace? Data will be lost.")) return;
    try { await fetch(`${API_BASE_URL}/users/workspaces/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }}); fetchWorkspaces(); setSelectedWs(null); } catch(e) {}
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if(!newTaskText.trim()) return;
    await fetch(`${API_BASE_URL}/users/workspaces/${selectedWs.id}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ title: newTaskText }) });
    setNewTaskText(""); fetchTasks(selectedWs.id);
  };

  const moveTask = async (taskId, currentStatus, direction) => {
    const statuses = ['todo', 'in_progress', 'done'];
    const idx = statuses.indexOf(currentStatus);
    const newIdx = direction === 'forward' ? idx + 1 : idx - 1;
    if(newIdx < 0 || newIdx >= statuses.length) return;
    await fetch(`${API_BASE_URL}/users/tasks/${taskId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status: statuses[newIdx] }) });
    fetchTasks(selectedWs.id); 
  };

  const deleteTask = async (taskId) => {
    await fetch(`${API_BASE_URL}/users/tasks/${taskId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchTasks(selectedWs.id);
  };

  if (selectedWs) {
    return (
      <div className="p-8 max-w-7xl w-full mx-auto pb-16 relative z-10">
        <button onClick={() => setSelectedWs(null)} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer font-bold bg-white/5 px-4 py-2 rounded-lg w-fit transition-colors text-xs border border-white/5"><ArrowLeft className="w-4 h-4"/> Workspaces Hub</button>
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-5">
          <h2 className="text-3xl font-black flex items-center gap-3"><div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30 shadow-sm"><Briefcase className="w-6 h-6 text-blue-400"/></div> {selectedWs.name}</h2>
          <span className="bg-white/5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold text-gray-400 border border-white/10">ID: {selectedWs.id} • SECURE</span>
        </div>
        
        <div className="mb-10">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white"><Kanban className="w-4 h-4 text-purple-400"/> Execution Board</h3>
          <form onSubmit={handleAddTask} className="mb-6 flex gap-3">
            <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Define operational task..." className="flex-1 bg-black/50 border border-white/10 text-white rounded-xl px-5 py-2.5 outline-none focus:border-blue-500 focus:bg-[#111b21] transition-all text-sm shadow-inner placeholder-gray-500" />
            <button type="submit" disabled={!newTaskText.trim()} className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"><Plus className="w-4 h-4"/> Append</button>
          </form>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { id: 'todo', title: 'To Do', icon: ListTodo, color: 'text-gray-300', bg: 'bg-white/5', border: 'border-white/10' }, 
              { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/5', border: 'border-yellow-500/20' }, 
              { id: 'done', title: 'Completed', icon: CheckSquare, color: 'text-green-400', bg: 'bg-green-500/5', border: 'border-green-500/20' }
            ].map(col => (
              <div key={col.id} className={`${col.bg} border ${col.border} rounded-2xl p-5 min-h-[35vh] shadow-lg backdrop-blur-sm`}>
                <h3 className={`font-bold text-sm mb-4 flex items-center gap-2 ${col.color}`}><col.icon className="w-4 h-4"/> {col.title} <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md ml-auto border border-white/10">{tasks.filter(t => t.status === col.id).length}</span></h3>
                <div className="space-y-3">
                  <AnimatePresence>
                    {tasks.filter(t => t.status === col.id).map(task => (
                      <motion.div key={task.id} initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className="bg-[#0b141a] border border-white/10 p-4 rounded-xl flex items-center justify-between group relative shadow-md hover:border-white/30 transition-colors">
                        <p className="text-xs font-semibold pr-6 leading-relaxed text-gray-200">{task.title}</p>
                        <button onClick={()=>deleteTask(task.id)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer shadow-[0_3px_10px_rgba(239,68,68,0.5)] hover:bg-red-600 transition-all hover:scale-110"><Trash2 className="w-3 h-3"/></button>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2 bg-black/80 p-1 rounded-md backdrop-blur-md border border-white/10">
                          {col.id !== 'todo' && <button onClick={()=>moveTask(task.id, col.id, 'backward')} className="p-1 hover:text-white text-gray-400 cursor-pointer bg-white/10 rounded hover:bg-white/30 transition-colors"><ChevronLeft className="w-3 h-3"/></button>}
                          {col.id !== 'done' && <button onClick={()=>moveTask(task.id, col.id, 'forward')} className="p-1 hover:text-white text-gray-400 cursor-pointer bg-white/10 rounded hover:bg-white/30 transition-colors"><ChevronRight className="w-3 h-3"/></button>}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>
        <EquityCalculator workspaceId={selectedWs.id} token={token} currentUser={currentUser} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl w-full mx-auto relative z-10">
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight text-white"><div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30 shadow-sm"><Briefcase className="text-blue-400 w-5 h-5"/></div> Startup Workspaces</h2>
          <p className="text-gray-400 text-xs mt-1.5 font-medium">Encrypted operational chambers for team execution.</p>
        </div>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-xl font-bold text-xs cursor-pointer text-white shadow-sm transition-colors border border-blue-400">{showCreateForm ? 'Cancel' : 'Deploy Workspace'}</button>
      </div>
      
      <AnimatePresence>
        {showCreateForm && (
          <motion.form initial={{ opacity: 0, height: 0, y:-10 }} animate={{ opacity: 1, height: 'auto', y:0 }} exit={{ opacity: 0, height: 0 }} onSubmit={handleCreate} className="bg-[#0b141a] border border-blue-500/20 p-6 rounded-2xl mb-8 overflow-hidden shadow-lg backdrop-blur-xl">
            <h3 className="text-sm font-bold mb-4 text-blue-400">Initialize New System</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <AnimatedInput icon={Briefcase} type="text" placeholder="Workspace / Project Name" id="ws_name" value={newWs.name} onChange={(e) => setNewWs({...newWs, name: e.target.value})} />
               <AnimatedInput icon={Terminal} type="text" placeholder="Mission Description" id="ws_desc" value={newWs.description} onChange={(e) => setNewWs({...newWs, description: e.target.value})} />
            </div>
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={!newWs.name} className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer hover:bg-gray-200 disabled:opacity-50 transition-colors shadow-sm">Initialize Environment</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workspaces.map(ws => (
          <div key={ws.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl group relative overflow-hidden hover:bg-white/10 transition-all duration-300 hover:shadow-lg cursor-pointer hover:border-white/20" onClick={() => setSelectedWs(ws)}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
            {ws.is_admin && (
              <button onClick={(e) => { e.stopPropagation(); handleDeleteWs(ws.id); }} className="absolute top-5 right-5 z-20 p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white cursor-pointer shadow-md">
                <Trash2 className="w-4 h-4"/>
              </button>
            )}
            <div className="h-full flex flex-col justify-between relative z-10">
              <div>
                <div className="w-12 h-12 bg-linear-to-br from-blue-500/20 to-purple-500/20 text-blue-400 rounded-xl flex items-center justify-center font-black text-xl uppercase mb-4 border border-white/10 shadow-inner">{ws.name.charAt(0)}</div>
                <h3 className="font-bold text-lg mb-1.5 text-white tracking-tight">{ws.name}</h3>
                <p className="text-gray-400 text-xs mb-4 leading-relaxed font-medium">"{ws.description || 'Classified Operations Environment'}"</p>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-blue-400 mt-2 border-t border-white/10 pt-4">
                <span className="bg-blue-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-blue-500/20"><ListTodo className="w-3 h-3" /> Tasks: {ws.task_count}</span>
                <span className="flex items-center gap-1 group-hover:text-blue-300 transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 group-hover:border-white/20">Enter Board <ArrowRight className="w-3 h-3"/></span>
              </div>
            </div>
          </div>
        ))}
        {workspaces.length === 0 && !showCreateForm && (
          <div className="col-span-1 md:col-span-2 text-center p-14 bg-white/5 rounded-3xl border border-white/10 shadow-xl backdrop-blur-sm">
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-5 opacity-40" />
            <h3 className="text-xl font-bold mb-2 text-white">No active workspaces.</h3>
            <p className="text-gray-400 text-sm font-medium">Create a secure chamber to begin execution with your team.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 10. INVESTOR READINESS DASHBOARD
// ==========================================
const InvestorDashboard = () => {
  const [readiness, setReadiness] = useState({ pitchDeck: false, mvp: false, legal: false, traction: false, cofounderAgreements: false });
  const handleToggle = (key) => setReadiness(prev => ({ ...prev, [key]: !prev[key] }));
  const score = Object.values(readiness).filter(v => v).length * 20;

  return (
    <div className="p-8 max-w-6xl w-full mx-auto relative z-10">
      <div className="mb-8 border-b border-white/5 pb-5">
        <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight text-white"><div className="p-2 bg-green-500/20 rounded-xl shadow-sm"><TrendingUp className="text-green-400 w-6 h-6"/></div> Readiness Matrix</h2>
        <p className="text-gray-400 text-xs mt-1.5 font-medium">Track operational milestones to unlock seed funding.</p>
      </div>

      <div className="bg-linear-to-r from-white/5 to-transparent border border-white/10 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between shadow-lg overflow-hidden relative backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 mb-5 md:mb-0">
          <h3 className="text-xl font-bold mb-2 text-white">Fundability Score</h3>
          <p className="text-gray-400 text-xs max-w-sm leading-relaxed font-medium">Complete all milestones to alert Angel Investors in the network.</p>
          {score === 100 && <div className="mt-4 inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500/40 text-green-400 font-bold text-[10px] px-3 py-1.5 rounded-lg animate-pulse"><Sparkles className="w-3.5 h-3.5"/> VERIFIED INVESTOR READY</div>}
        </div>
        <div className="relative z-10">
          <div className="w-28 h-28 rounded-full border-[6px] border-white/5 flex items-center justify-center relative overflow-hidden bg-black/50 shadow-inner">
            <div className="absolute bottom-0 w-full bg-linear-to-t from-green-500/80 to-green-500/20 transition-all duration-1000 ease-out" style={{ height: `${score}%` }}></div>
            <span className="text-2xl font-black relative z-10 text-white">{score}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'pitchDeck', title: 'Pitch Deck Completed', desc: 'A compelling 10-15 slide presentation covering problem, solution, market, and team.', icon: FileText },
          { key: 'mvp', title: 'MVP Deployed', desc: 'Minimum Viable Product is live, functional, and accessible to early users.', icon: Rocket },
          { key: 'legal', title: 'Legal Incorporation', desc: 'Company is officially registered as a legal entity.', icon: Shield },
          { key: 'traction', title: 'Initial Traction', desc: 'Demonstrable active user growth or early revenue.', icon: PieChart },
          { key: 'cofounderAgreements', title: 'Co-Founder Agreements', desc: 'Equity split and vesting contracts are signed.', icon: CheckSquare }
        ].map((item) => (
          <div key={item.key} onClick={() => handleToggle(item.key)} className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 group shadow-sm ${readiness[item.key] ? 'bg-green-500/10 border-green-500/40' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${readiness[item.key] ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-gray-400 group-hover:text-white border border-white/5'}`}>
                   <item.icon className="w-5 h-5" />
                </div>
                <h4 className={`font-bold text-sm tracking-tight ${readiness[item.key] ? 'text-green-400' : 'text-white'}`}>{item.title}</h4>
              </div>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${readiness[item.key] ? 'bg-green-500 border-green-500' : 'border-gray-600 bg-black/50 group-hover:border-gray-400'}`}>
                {readiness[item.key] && <Check className="w-3.5 h-3.5 text-black font-black" />}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 ml-12 leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 11. DASHBOARD WRAPPER (THE COMMAND CENTER)
// ==========================================
const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  
  const [activeSynergiesCount, setActiveSynergiesCount] = useState(0);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [systemStats, setSystemStats] = useState({ founders: 0, ideas: 0, workspaces: 0 });

  useEffect(() => {
    if (!token) { navigate('/auth'); return; }
    
    const calculateCompleteness = (profile) => {
      if(!profile) return 0;
      const totalFields = 15;
      let filledFields = 0;
      Object.keys(profile).forEach(key => {
        if(profile[key] !== null && profile[key] !== '' && key !== 'id' && key !== 'user_id') filledFields++;
      });
      return Math.round((filledFields / totalFields) * 100);
    };

    const fetchAllData = async () => {
      try {
        const [meRes, convRes, feedRes, ideasRes, wsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/users/conversations`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/users/feed`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/users/ideas`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/users/workspaces`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (meRes.ok) {
          const data = await meRes.json();
          setUserData(data);
          setProfileCompleteness(calculateCompleteness(data.profile));
        } else { navigate('/'); }

        if(convRes.ok) {
          const convData = await convRes.json();
          setActiveSynergiesCount(Array.isArray(convData) ? convData.length : 0);
        }

        let fCount = 0, iCount = 0, wCount = 0;
        if(feedRes.ok) { const fd = await feedRes.json(); fCount = Array.isArray(fd) ? fd.length : 0; }
        if(ideasRes.ok) { const id = await ideasRes.json(); iCount = Array.isArray(id) ? id.length : 0; }
        if(wsRes.ok) { const wd = await wsRes.json(); wCount = Array.isArray(wd) ? wd.length : 0; }
        
        setSystemStats({ founders: fCount, ideas: iCount, workspaces: wCount });

      } catch (err) { console.error(err); } 
      finally { setIsLoading(false); }
    };
    fetchAllData();
  }, [token, navigate]);

  if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" /></div>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Absolute Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-125 h-125 bg-purple-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-100 h-100 bg-blue-900/5 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 mask-image-[radial-gradient(ellipse_100%_100%_at_50%_50%,#000_15%,transparent_100%)]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* FULL SIDEBAR */}
      <motion.aside initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-64 border-r border-white/5 bg-black/60 backdrop-blur-2xl p-5 hidden md:flex flex-col relative z-20 shadow-[5px_0_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]"><Sparkles className="w-4 h-4 text-white" /></div>
          <span className="font-black text-xl tracking-tight text-white">StartupMatch</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Overview', color: 'text-purple-400', bgHover: 'hover:bg-purple-500/10' },
            { icon: Users, label: 'Network', color: 'text-blue-400', bgHover: 'hover:bg-blue-500/10' },
            { icon: Lightbulb, label: 'Idea Board', color: 'text-yellow-400', bgHover: 'hover:bg-yellow-500/10' }, 
            { icon: Briefcase, label: 'Workspaces', color: 'text-blue-500', bgHover: 'hover:bg-blue-500/10' }, 
            { icon: TrendingUp, label: 'Investor Prep', color: 'text-green-400', bgHover: 'hover:bg-green-500/10' }, 
            { icon: MessageSquare, label: 'Messages', color: 'text-pink-400', bgHover: 'hover:bg-pink-500/10' },
            { icon: Settings, label: 'Settings', color: 'text-gray-400', bgHover: 'hover:bg-gray-500/10' },
          ].map((item, idx) => (
            <motion.button 
              key={idx} 
              onClick={() => { setActiveTab(item.label); if(item.label !== 'Messages') setSelectedChatUser(null); }}
              whileHover={{ x: 5 }} 
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer font-bold text-sm tracking-wide ${activeTab === item.label ? `bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10` : `text-gray-500 ${item.bgHover} hover:text-white`}`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.label ? item.color : ''}`} /> {item.label}
            </motion.button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-5 px-3 bg-black/40 p-3 rounded-2xl border border-white/5 shadow-inner hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500/30 to-blue-500/30 border border-white/20 flex items-center justify-center uppercase font-black text-lg text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              {userData?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate tracking-tight">{userData?.full_name}</p>
              <p className="text-[10px] text-purple-400 font-mono font-bold mt-1 truncate uppercase tracking-widest">
                {userData?.profile?.primary_role || userData?.role}
              </p>
            </div>
          </div>
          <motion.button whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.15)" }} onClick={() => { localStorage.removeItem('access_token'); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 transition-all cursor-pointer font-bold border border-transparent hover:border-red-500/30 text-sm">
            <LogOut className="w-4 h-4" /> Terminate Session
          </motion.button>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto bg-black/20">
        
        {/* HEADER */}
        <header className="h-16 border-b border-white/5 bg-[#050505]/90 backdrop-blur-2xl px-8 flex items-center justify-between z-30 sticky top-0 shadow-sm">
          <div className="md:hidden flex items-center gap-3">
            <Menu className="w-6 h-6 text-white cursor-pointer" />
            <Sparkles className="w-5 h-5 text-purple-500"/>
          </div>
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 w-96 focus-within:border-purple-500/50 focus-within:bg-black/50 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input type="text" placeholder="Search the elite network..." className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-gray-600 font-medium tracking-wide" />
          </div>
          <div className="flex items-center gap-4 relative">
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 relative shadow-sm transition-colors"
            >
              <Bell className="w-4 h-4 text-gray-300" />
              {activeSynergiesCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#050505] animate-pulse"></span>}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-12 right-0 w-72 bg-[#111b21] border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] overflow-hidden z-50 backdrop-blur-2xl"
                >
                  <div className="p-4 border-b border-white/5 bg-[#202c33]">
                    <h4 className="font-bold text-white text-xs tracking-wide">System Alerts</h4>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    {activeSynergiesCount > 0 ? (
                      <div className="flex gap-3 items-center cursor-pointer bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-colors border border-transparent hover:border-white/5" onClick={() => {setShowNotifications(false); setActiveTab('Messages');}}>
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30 shadow-inner"><MessageSquare className="w-4 h-4" /></div>
                        <div>
                          <p className="text-xs font-bold text-white mb-0.5">Active Synergy Ready</p>
                          <p className="text-[10px] text-gray-400 font-medium">You have {activeSynergiesCount} active channel(s).</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <Bell className="w-6 h-6 text-gray-600 mx-auto mb-2 opacity-40" />
                        <p className="text-[10px] text-gray-500 font-bold">No new alerts. The network is quiet.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* ========================================== */}
        {/* TAB 1: OVERVIEW (RESTORED SLEEK GOD LEVEL UI)*/}
        {/* ========================================== */}
        {activeTab === 'Overview' && (
          <div className="p-8 max-w-7xl w-full mx-auto">
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Main Command Center */}
              <motion.div variants={staggerItem} className="col-span-1 xl:col-span-2 bg-linear-to-br from-purple-900/30 to-blue-900/10 border border-white/10 p-8 rounded-3xl relative overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full group-hover:scale-110 group-hover:bg-blue-500/10 transition-all duration-1000 pointer-events-none"></div>
                <h2 className="text-3xl font-black mb-2 relative z-10 tracking-tight text-white">Command Center, <br/>{userData?.full_name?.split(' ')[0]}!</h2>
                <p className="text-gray-300 text-sm mb-6 relative z-10 font-medium">Welcome to your secure startup matching environment.</p>

                {userData?.profile ? (
                  <div className="relative z-10 bg-[#0b141a]/80 p-6 rounded-2xl border border-white/10 shadow-inner backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-5 bg-green-500/10 w-fit px-3 py-1.5 rounded-lg border border-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
                      <p className="text-green-400 font-bold text-[10px] tracking-widest uppercase">Blueprint Synchronized</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs max-w-md mb-6">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 shadow-sm">
                        <div className="text-gray-500 font-bold tracking-widest text-[9px] uppercase mb-1.5 flex items-center gap-1.5"><Award className="w-3 h-3"/> MATRIX ROLE</div>
                        <span className="text-purple-300 font-black text-lg drop-shadow-md">{userData.profile.primary_role}</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 shadow-sm">
                        <div className="text-gray-500 font-bold tracking-widest text-[9px] uppercase mb-1.5 flex items-center gap-1.5"><Compass className="w-3 h-3"/> VENTURE STAGE</div>
                        <span className="text-blue-300 font-black text-lg drop-shadow-md">{userData.profile.startup_stage}</span>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-white/10">
                      <span className="text-xs text-gray-400 font-bold mb-3 block uppercase tracking-widest flex items-center gap-1.5"><Globe className="w-3.5 h-3.5"/> Digital Footprint Matrix</span>
                      <div className="flex gap-3">
                        {userData.profile.linkedin_url && <a href={safeUrl(userData.profile.linkedin_url)} target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 rounded-lg hover:bg-blue-600 hover:text-white text-gray-400 transition-all cursor-pointer shadow-sm border border-white/5 hover:border-blue-500 hover:scale-110"><FaLinkedin className="w-4 h-4" /></a>}
                        {userData.profile.github_url && <a href={safeUrl(userData.profile.github_url)} target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 rounded-lg hover:bg-gray-700 hover:text-white text-gray-400 transition-all cursor-pointer shadow-sm border border-white/5 hover:border-gray-500 hover:scale-110"><FaGithub className="w-4 h-4" /></a>}
                        {userData.profile.twitter_url && <a href={safeUrl(userData.profile.twitter_url)} target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 rounded-lg hover:bg-blue-400 hover:text-white text-gray-400 transition-all cursor-pointer shadow-sm border border-white/5 hover:border-blue-400 hover:scale-110"><FaTwitter className="w-4 h-4" /></a>}
                        {userData.profile.portfolio_url && <a href={safeUrl(userData.profile.portfolio_url)} target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 rounded-lg hover:bg-purple-500 hover:text-white text-gray-400 transition-all cursor-pointer shadow-sm border border-white/5 hover:border-purple-500 hover:scale-110"><Globe className="w-4 h-4" /></a>}
                        {!userData.profile.linkedin_url && !userData.profile.github_url && !userData.profile.twitter_url && !userData.profile.portfolio_url && (
                          <span className="text-xs text-gray-500 font-bold italic bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">No external links mapped.</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                      <button onClick={() => navigate('/setup')} className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all cursor-pointer text-xs font-bold border border-white/20 shadow-md">Refactor Blueprint</button>
                      <button onClick={() => setActiveTab('Network')} className="px-5 py-2 bg-white text-black rounded-lg transition-transform hover:scale-105 cursor-pointer text-xs font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center gap-1.5">Open Core Feed <Rocket className="w-3.5 h-3.5"/></button>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 bg-black/50 p-8 rounded-2xl border border-white/10 text-center shadow-inner backdrop-blur-md">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-purple-500/30"><Settings className="w-8 h-8 text-purple-400 animate-spin-slow"/></div>
                    <p className="text-gray-300 text-sm mb-6 font-medium leading-relaxed max-w-sm mx-auto">Your AI matchmaking engine is calibrating. Complete your infrastructure blueprint to unlock the network.</p>
                    <motion.button onClick={() => navigate('/setup')} whileHover={{ scale: 1.05 }} className="px-6 py-2.5 bg-white text-black font-bold rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer text-xs flex items-center gap-2 mx-auto">
                      <Sparkles className="w-4 h-4"/> Setup AI Profile
                    </motion.button>
                  </div>
                )}
              </motion.div>

              {/* Dynamic Metrics & Telemetry Column */}
              <div className="col-span-1 flex flex-col gap-5">
                {/* Completeness */}
                <motion.div variants={staggerItem} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl hover:bg-white/10 transition-colors relative overflow-hidden shadow-lg group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full group-hover:bg-purple-500/20 transition-colors pointer-events-none"></div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400 border border-purple-500/30 shadow-inner"><Activity className="w-5 h-5" /></div>
                  </div>
                  <p className="text-4xl font-black mb-1.5 text-white tracking-tight relative z-10">{profileCompleteness}%</p>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest relative z-10">Profile Completeness</p>
                  <div className="w-full h-1 bg-black/60 rounded-full mt-5 overflow-hidden border border-white/10 shadow-inner relative z-10">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${profileCompleteness}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-linear-to-r from-purple-500 to-blue-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                  </div>
                </motion.div>

                {/* Global Telemetry */}
                <motion.div variants={staggerItem} className="bg-[#0b141a] border border-white/10 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-lg">
                   <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full pointer-events-none"></div>
                   <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-white tracking-tight border-b border-white/10 pb-2 relative z-10"><Network className="w-4 h-4 text-blue-400"/> Global Telemetry</h3>
                   <div className="space-y-2.5 relative z-10">
                     <div className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-2.5"><Users className="w-3.5 h-3.5 text-blue-400"/><span className="text-xs font-bold text-gray-300">Founders</span></div>
                        <span className="font-black text-base text-white">{systemStats.founders}</span>
                     </div>
                     <div className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-2.5"><Lightbulb className="w-3.5 h-3.5 text-yellow-400"/><span className="text-xs font-bold text-gray-300">Active Ideas</span></div>
                        <span className="font-black text-base text-white">{systemStats.ideas}</span>
                     </div>
                     <div className="bg-white/5 p-3 rounded-xl flex justify-between items-center border border-white/5 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-2.5"><Briefcase className="w-3.5 h-3.5 text-green-400"/><span className="text-xs font-bold text-gray-300">Workspaces</span></div>
                        <span className="font-black text-base text-white">{systemStats.workspaces}</span>
                     </div>
                   </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}

        {/* TAB 2: SETTINGS */}
        {activeTab === 'Settings' && (
          <div className="p-8 max-w-4xl w-full mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3 border-b border-white/10 pb-5 tracking-tight text-white"><div className="p-2.5 bg-gray-500/20 rounded-xl"><Settings className="w-6 h-6 text-gray-300"/></div> Workspace Config</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 text-white tracking-wide">Account Architecture</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/40 p-6 rounded-2xl border border-white/5 shadow-inner">
                    <AnimatedInput icon={User} type="text" placeholder="Registered Name" id="set_name" value={userData?.full_name || ''} disabled={true} onChange={()=>{}} />
                    <AnimatedInput icon={Mail} type="email" placeholder="Registered Email" id="set_email" value={userData?.email || ''} disabled={true} onChange={()=>{}} />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-3 ml-2 font-bold flex items-center gap-1.5 tracking-wide"><Shield className="w-3 h-3 text-purple-400"/> Core identity parameters are immutable.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4 text-red-400 border-b border-red-500/20 pb-2 tracking-wide">Danger Zone</h3>
                  <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20 shadow-inner">
                    <p className="text-gray-300 mb-5 text-xs font-medium leading-relaxed">Terminating your session disconnects the active WebSocket network.</p>
                    <button onClick={() => { localStorage.removeItem('access_token'); navigate('/'); }} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 px-6 py-2.5 rounded-lg font-bold transition-all cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] text-xs">
                      <LogOut className="w-4 h-4" /> Deactivate Session
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Dynamic Route Rendering based on Active Tab */}
        {activeTab === 'Network' && <AnimatePresence mode="wait"><motion.div key="network" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><NetworkFeed token={token} onMessageClick={(user) => { setSelectedChatUser(user); setActiveTab('Messages'); }} /></motion.div></AnimatePresence>}
        {activeTab === 'Idea Board' && <AnimatePresence mode="wait"><motion.div key="ideaboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><IdeaBoard token={token} currentUser={userData} onMessageClick={(user) => { setSelectedChatUser(user); setActiveTab('Messages'); }} /></motion.div></AnimatePresence>}
        {activeTab === 'Workspaces' && <AnimatePresence mode="wait"><motion.div key="workspaces" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><WorkspacesView token={token} currentUser={userData} /></motion.div></AnimatePresence>}
        {activeTab === 'Investor Prep' && <AnimatePresence mode="wait"><motion.div key="investor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}><InvestorDashboard /></motion.div></AnimatePresence>}
        {activeTab === 'Messages' && <AnimatePresence mode="wait"><motion.div key="messages" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}><MessagesView token={token} currentUser={userData} selectedChatUser={selectedChatUser} setSelectedChatUser={setSelectedChatUser} /></motion.div></AnimatePresence>}

      </main>
    </motion.div>
  );
};

// ==========================================
// 12. APP ROUTES
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/setup" element={<ProfileSetup />} /> 
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}