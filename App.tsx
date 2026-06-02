/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, MapPin, Calendar, Heart, Shield, MessageSquare, BookOpen, 
  ChevronRight, Sparkles, RefreshCw, AlertTriangle, HelpCircle,
  TrendingUp, TreePine, Map, User, Globe
} from 'lucide-react';
import { UserProfile, DashboardData, ChatMessage } from './types';
import { DEFAULT_PROFILE, getMockDashboard } from './data/mockData';

// Modular Frontend Components
import UserProfileForm from './components/UserProfileForm';
import InteractiveMap from './components/InteractiveMap';
import HiddenGems from './components/HiddenGems';
import CulturalExperiences from './components/CulturalExperiences';
import WhyNowEngine from './components/WhyNowEngine';
import SafetyEngine from './components/SafetyEngine';
import NextDestination from './components/NextDestination';
import ItineraryGenerator from './components/ItineraryGenerator';
import AICompanion from './components/AICompanion';
import AnalyticalDashboard from './components/AnalyticalDashboard';
import VoiceCommandSystem from './components/VoiceCommandSystem';
import DestinationSoulAI from './components/DestinationSoulAI';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeSection, setActiveSection] = useState<'gems' | 'experiences' | 'whynow' | 'safety' | 'next' | 'itinerary' | 'companion' | 'analytics' | 'soul'>('gems');
  
  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map coordinate focus tracking
  const [activeLocation, setActiveLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);

  // Safety directory active focus state for hotels, stays and emergency numbers
  const [safetyLocation, setSafetyLocation] = useState<string>('Ziro Valley');

  const handleProfileSubmit = async (submittedProfile: UserProfile) => {
    setIsLoading(true);
    setError(null);
    setProfile(submittedProfile);

    try {
      const response = await fetch('/api/profile-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submittedProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights from sever-side API.');
      }

      const data: DashboardData & { warning?: string } = await response.json();
      setDashboardData(data);
      
      // Seed initial chatbot welcome message
      setChatMessages([
        {
          id: 'msg_welcome',
          sender: 'assistant',
          text: `Namaste, ${submittedProfile.name}! Welcome to Hidden India. I am your companion local guide.\n\nI have customized your timeline for your trip (${submittedProfile.startDate} to ${submittedProfile.endDate}) focusing in depth on ${submittedProfile.interests.join(' & ')}.\n\nAsk me any question about our tailored villages, or check road safety and local menus!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (data.warning) {
        setError(data.warning);
      }
    } catch (err) {
      console.error(err);
      setError('Connection to server API wrap lagged, loading direct local engine presets.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const chatHistory = chatMessages.map(m => ({ sender: m.sender, text: m.text }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          messages: chatHistory,
          latestMessage: text
        })
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      
      setChatMessages(prev => [...prev, {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: "Namaste, I encountered a minor signal issue on our mountain pass, but feel free to ask again or review our local safety tabs!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleFlyToLocation = (lat: number, lng: number, name: string) => {
    setActiveLocation({ lat, lng, name });
    // Scroll to map smooth
    const mapNode = document.getElementById('map-scroll-anchor');
    if (mapNode) {
      mapNode.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loadDemoPreset = () => {
    handleProfileSubmit(DEFAULT_PROFILE);
  };

  const handleTogglePriority = (interestId: string) => {
    if (!profile) return;
    
    let updatedInterests = [...profile.interests];
    if (updatedInterests.includes(interestId)) {
      if (updatedInterests.length > 1) {
        updatedInterests = updatedInterests.filter(id => id !== interestId);
      }
    } else {
      updatedInterests.push(interestId);
    }

    const updatedProfile = { ...profile, interests: updatedInterests };
    setProfile(updatedProfile);

    // Re-score programmatically
    const mockData = getMockDashboard(updatedProfile);
    setDashboardData(mockData);
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);
    
    // Refresh calculations and dashboard data
    const mockData = getMockDashboard(updatedProfile);
    setDashboardData(mockData);
  };

  const resetProfile = () => {
    setProfile(null);
    setDashboardData(null);
    setError(null);
    setActiveLocation(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-emerald-50 selection:text-emerald-900 leading-normal flex flex-col justify-between">
      
      {/* Platform Header */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30" id="global-navbar">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3.5 group cursor-pointer" id="navbar-logo-container">
            <div className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-950 shadow-inner group-hover:scale-105 group-hover:shadow-amber-500/10 transition-all duration-300">
              {/* Premium Geometric Indian-Inspired Compass Mandali Logo */}
              <svg className="w-7 h-7 text-amber-400 transition-transform duration-700 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-60" />
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" fillOpacity="0.15" />
                <path d="M12 7 L15 15 L9 15 Z" fill="currentColor" className="text-amber-500" />
                <path d="M12 7 L12 15" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
              </svg>
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 opacity-0 group-hover:opacity-10 blur-md transition-opacity duration-500" />
            </div>
            <div className="flex flex-col select-none">
              <span className="font-sans font-black text-slate-950 tracking-tight text-xl leading-none flex items-center gap-1">
                <span>Hidden India</span>
                <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-sm uppercase tracking-widest scale-90 origin-left">PRO</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 font-sans leading-none">
                AI ESCAPE DEVIATOR
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {profile && (
              <button
                onClick={resetProfile}
                id="reset-profile-btn"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Strategy</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Travel Algorithm</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Core View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6" id="applet-main-body">
        
        {/* State 1: Active Onboarding & Welcome screen */}
        {!profile && (
          <div className="py-8 md:py-16 space-y-12">
            
            {/* Visual Landing Hero */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-2xl mx-auto space-y-4"
              id="platform-hero-header"
            >
              <h1 className="text-4xl md:text-5xl font-sans font-black text-slate-900 tracking-tight leading-tight">
                Discover the real India that tourist brochures missed
              </h1>
              <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Connect deeply with sustainable homestays, centuries-old village performing traditions, and ancient trails calculated dynamically by Google Gemini.
              </p>

              {/* Spectacular high-impact hero image representing Ziro Valley mist */}
              <div className="relative rounded-[32px] overflow-hidden border border-black/5 card-shadow max-w-xl mx-auto my-6">
                <img 
                  src="/src/assets/images/ziro_valley_mist_1780391269642.png" 
                  alt="Scenic Misty Valley in Ziro Arunachal Pradesh India" 
                  className="w-full h-56 object-cover hover:scale-105 transition duration-500" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 justify-start">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#fcfcf0] bg-[#5a5a40]/90 px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#fcfcf0]" />
                    <span>Featured: Ziro Valley Sanctuary, East Himalayas</span>
                  </span>
                </div>
              </div>
              
              {/* Easy Preset Quick Loading Trigger (Elite hackathon UX) */}
              <div className="pt-2 flex items-center justify-center gap-3">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Short on time?</span>
                <button
                  onClick={loadDemoPreset}
                  id="preset-demo-trigger"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-850 text-xs font-bold rounded-full cursor-pointer hover:shadow-xs active:translate-y-0.5 transition"
                >
                  ⚡ Load Presets Demo Look (28yo Photographer Solo)
                </button>
              </div>
            </motion.div>

            {/* Profile onboarding form component */}
            <UserProfileForm onSubmit={handleProfileSubmit} isLoading={isLoading} />
          </div>
        )}

        {/* State 2: Personal Travel Onboarding - Loading visual feedback */}
        {profile && isLoading && (
          <div className="h-[480px] flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto" id="global-insights-progress">
            <svg className="animate-spin h-10 w-10 text-indigo-600 mb-2" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Calculating Authentic Coordinates...</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our server is mapping coordinates, reviewing village festival cycles for date ranges, and running safety calculations based on tourist density profiles.
              </p>
            </div>
          </div>
        )}

        {/* State 3: Active Profile Interactive Dashboard */}
        {profile && dashboardData && (
          <div className="space-y-6 md:space-y-8 animate-fade-in" id="traveler-dashboard">
            
            {/* Top Warning banner if any warning is dispatched from server */}
            {error && (
              <div className="p-5 bg-[#fefaf6] border border-brand-orange/10 rounded-[24px] flex items-start gap-3.5 card-shadow">
                <AlertTriangle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-serif font-bold text-slate-900">
                    {error.includes('leaked') ? 'Gemini API Key Warning' : 'Travel Demonstration Notification'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
                  {error.includes('leaked') && (
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-md">
                        Settings &gt; Secrets
                      </span>
                      <span className="text-[9px] md:text-[10px] text-[#5a5a40] font-sans font-semibold">
                        Replace your GEMINI_API_KEY with a secure key in your AI Studio sidebar settings. We have seamlessly loaded Hidden India in high-fidelity offline mode.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Banner */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden" id="dashboard-user-banner">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl" />
              
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-[#5a5a40] border border-white/10 flex items-center justify-center text-2xl select-none" id="user-avatar">
                  <User className="w-5 h-5 text-white/80" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl md:text-2xl font-sans font-bold tracking-tight">
                      Namaste, {profile.name}
                    </h2>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Level: {profile.travelExperience}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-xl">
                    Custom Offbeat Explorer Board • Planned dates: <strong>{profile.startDate} to {profile.endDate}</strong> • Travel style: <strong>{profile.travelStyle}</strong> • Budget scope: <strong>{profile.budget}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-2 text-right">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest block select-none">
                  Priority Settings (Click to Toggle)
                </span>
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-end" id="user-interests-badges">
                  {['nature', 'photography', 'food', 'adventure', 'culture', 'spiritual', 'wildlife'].map(interestId => {
                    const isActive = profile.interests.includes(interestId);
                    return (
                      <button 
                        key={interestId}
                        type="button"
                        onClick={() => handleTogglePriority(interestId)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-full uppercase transition-all duration-200 cursor-pointer border select-none ${
                          isActive 
                            ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs font-extrabold scale-102' 
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5 hover:text-white'
                        }`}
                        title={`Toggle ${interestId} priority on the fly`}
                      >
                        {interestId}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* HIGH-VISIBILTIY ANALYTICAL & FESTIVALS DISCOVERY INVITATION WIDGET */}
            <div className="bg-gradient-to-r from-emerald-50/70 to-[#fcfbf9] border border-[#5a5a40]/10 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-shadow" id="analytics-callout-panel">
              <div className="flex items-start sm:items-center gap-4">
                <span className="w-11 h-11 rounded-2xl bg-[#5a5a40]/10 text-xl flex items-center justify-center border border-[#5a5a40]/15 select-none flex-shrink-0 shadow-xs">
                  📊
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-bold text-[#5a5a40] uppercase tracking-widest font-sans">
                      Escape Analytics Dashboard Ready
                    </h4>
                    <span className="text-[8px] font-mono font-bold bg-[#D47E56]/10 text-[#D47E56] px-1.5 py-0.5 rounded uppercase animate-pulse">
                      Live Projections
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-2xl">
                    Your off-grid cost estimates, direct-to-artisan investment metrics, and solar-lunar astrology indicators are calculated. Press here to open the Interactive Intelligence board immediately.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveSection('analytics');
                  const element = document.getElementById('dashboard-tabs-navigation');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="w-full sm:w-auto px-5 py-3 bg-[#5a5a40] hover:bg-slate-900 text-white rounded-xl text-xs font-bold font-sans transition hover:shadow-md cursor-pointer select-none text-center flex items-center justify-center gap-2 flex-shrink-0"
              >
                <span>Open Intelligence Board ➔</span>
              </button>
            </div>

            {/* Interactive Grid: Left Dashboard Panel Controls & Details, Right Live Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 align-start">
              
              {/* Sidebar Tabs & Modules - spans 8 cols on desktop layout */}
              <div className="lg:col-span-8 space-y-6 flex flex-col">
                
                {/* Horizontal Dashboard quick sub-navigation */}
                <div 
                  className="bg-white border border-slate-100 rounded-2xl p-2 flex flex-wrap gap-1.5" 
                  id="dashboard-tabs-navigation"
                >
                  <button
                    onClick={() => setActiveSection('gems')}
                    id="section-nav-gems"
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                      activeSection === 'gems' ? 'bg-[#5a5a40] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Gems Discovery</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('experiences')}
                    id="section-nav-experiences"
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                      activeSection === 'experiences' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Village Events</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('whynow')}
                    id="section-nav-whynow"
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                      activeSection === 'whynow' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Why Now?</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('safety')}
                    id="section-nav-safety"
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                      activeSection === 'safety' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Safety Rating</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('next')}
                    id="section-nav-next"
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                      activeSection === 'next' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Next Predictor</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('itinerary')}
                    id="section-nav-itinerary"
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                      activeSection === 'itinerary' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Timelines</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('companion')}
                    id="section-nav-companion"
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                      activeSection === 'companion' ? 'bg-slate-900 text-slate-100 shadow-sm border border-slate-800' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>AI Guide Companion</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('analytics')}
                    id="section-nav-analytics"
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                      activeSection === 'analytics' ? 'bg-[#5a5a40] text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>Travel Analytics</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('soul')}
                    id="section-nav-soul"
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                      activeSection === 'soul' ? 'bg-[#5a5a40] text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-800 border border-slate-100'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Destination Soul AI™</span>
                  </button>
                </div>

                {/* Dashboard display core workspace render with transitions */}
                <div className="flex-1 min-h-[480px]">
                  <AnimatePresence mode="wait">
                    {activeSection === 'gems' && (
                      <motion.div
                        key="ui-gems"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <HiddenGems 
                          gems={dashboardData.hiddenGems} 
                          onFlyToLocation={handleFlyToLocation} 
                        />
                      </motion.div>
                    )}
                    
                    {activeSection === 'experiences' && (
                      <motion.div
                        key="ui-experiences"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CulturalExperiences 
                          experiences={dashboardData.experiences} 
                          onFlyToLocation={handleFlyToLocation} 
                        />
                      </motion.div>
                    )}

                    {activeSection === 'whynow' && (
                      <motion.div
                        key="ui-whynow"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <WhyNowEngine 
                          data={dashboardData.whyNow} 
                          startDate={profile.startDate} 
                        />
                      </motion.div>
                    )}

                    {activeSection === 'safety' && (
                      <motion.div
                        key="ui-safety"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SafetyEngine 
                          data={dashboardData.safety} 
                          travelStyle={profile.travelStyle} 
                          selectedSafetyLocation={safetyLocation}
                          onSetSafetyLocation={setSafetyLocation}
                        />
                      </motion.div>
                    )}

                    {activeSection === 'next' && (
                      <motion.div
                        key="ui-next"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <NextDestination data={dashboardData.nextDestinations} />
                      </motion.div>
                    )}

                    {activeSection === 'itinerary' && (
                      <motion.div
                        key="ui-itinerary"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ItineraryGenerator 
                          plan1D={dashboardData.itinerary1Day} 
                          plan3D={dashboardData.itinerary3Day} 
                          plan5D={dashboardData.itinerary5Day} 
                        />
                      </motion.div>
                    )}

                    {activeSection === 'companion' && (
                      <motion.div
                        key="ui-companion"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AICompanion 
                          profile={profile}
                          messages={chatMessages}
                          onSendMessage={handleSendMessage}
                          isLoading={isChatLoading}
                        />
                      </motion.div>
                    )}

                    {activeSection === 'analytics' && (
                      <motion.div
                        key="ui-analytics"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AnalyticalDashboard 
                          dashboardData={dashboardData}
                          profile={profile}
                        />
                      </motion.div>
                    )}

                    {activeSection === 'soul' && (
                      <motion.div
                        key="ui-soul"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <DestinationSoulAI />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Sidebar Leaflet Interactive Map Panel - spans 4 cols on desktop */}
              <div className="lg:col-span-4" id="map-scroll-anchor">
                <div className="sticky top-24 space-y-4">
                  <VoiceCommandSystem 
                    onTabChange={(tab: any) => setActiveSection(tab)}
                    onFlyToLocation={handleFlyToLocation}
                    onSendChatMessage={handleSendMessage}
                    hiddenGems={dashboardData.hiddenGems}
                    experiences={dashboardData.experiences}
                    onToggleInterest={handleTogglePriority}
                    activeInterests={profile ? profile.interests : []}
                    selectedSafetyLocation={safetyLocation}
                    onSetSafetyLocation={setSafetyLocation}
                    onUpdateProfile={handleUpdateProfile}
                  />

                  <div className="bg-white border border-slate-100 p-5 rounded-3xl flex justify-between items-center h-16">
                    <h3 className="text-sm font-sans font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <Map className="w-4.5 h-4.5 text-indigo-600" />
                      <span>Interactive Explorer Map</span>
                    </h3>
                    <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      Leaflet.js Active
                    </span>
                  </div>

                  <div className="h-[432px] md:h-[500px]">
                    <InteractiveMap 
                      gems={dashboardData.hiddenGems}
                      experiences={dashboardData.experiences}
                      activeLocation={activeLocation}
                    />
                  </div>

                  {activeLocation && (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-white">
                      <span className="truncate leading-normal">
                        Focused coordinating: <strong>{activeLocation.name}</strong>
                      </span>
                      <button
                        onClick={() => setActiveLocation(null)}
                        className="text-[10px] text-indigo-400 hover:text-white transition font-bold"
                      >
                        Unfocus
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Sustainable Footprints Platform Footer */}
      <footer className="w-full bg-white border-t border-slate-100 py-8 text-center text-slate-400 text-xs mt-16" id="global-footer">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p className="font-semibold text-slate-600 flex items-center justify-center gap-1.5">
            <span>Hidden India AI • Incidental Local Discovery Platform</span>
          </p>
          <p className="max-w-md mx-auto text-[11px] text-slate-450 leading-relaxed">
            Calculations are processed through Google Gemini client server proxies. We advocate for local carbon foot-print awareness, direct weaver/craft-fair financial support, and environmental conservation in mountain corridors.
          </p>
        </div>
      </footer>
    </div>
  );
}
