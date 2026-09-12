import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, ShieldCheck, Zap, Heart, ArrowRight, Video, Cpu, MessageSquare } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeroLandingProps {
  onStartTry: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

const DEMO_CYCLES = [
  { face: '😊 Happy', gesture: '👍 Thumbs Up', emoji: '😊👍', message: "I'm happy and everything is good!", color: 'from-amber-400 to-emerald-400' },
  { face: '😮 Surprised', gesture: '✋ Open Palm', emoji: '😮✋', message: 'Wow! Wait!', color: 'from-purple-400 to-cyan-400' },
  { face: '😂 Laughing', gesture: '👍 Thumbs Up', emoji: '😂👍', message: "That's hilarious!", color: 'from-yellow-400 to-orange-400' },
  { face: '❤️ Loving', gesture: '🫶 Heart Hands', emoji: '😊🫶', message: 'Sending you so much love!', color: 'from-pink-400 to-rose-500' },
  { face: '😡 Angry', gesture: '✊ Fist', emoji: '😡✊', message: "I'm frustrated.", color: 'from-red-400 to-amber-500' }
];

export const HeroLanding: React.FC<HeroLandingProps> = ({ onStartTry, setActiveTab }) => {
  const [cycleIndex, setCycleIndex] = useState(0);

  // Auto-cycle through preview combinations every 3.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % DEMO_CYCLES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const activeDemo = DEMO_CYCLES[cycleIndex];

  return (
    <div className="relative overflow-hidden pt-6 pb-20">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-brand-600/20 via-cyan-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 -right-48 w-96 h-96 bg-purple-600/15 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO HEADER */}
        <div className="text-center max-w-4xl mx-auto pt-8 pb-12">
          
          {/* Tag Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Next-Gen Computer Vision In Your Browser</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-900 leading-[1.15] mb-6">
            Express Yourself <br />
            <span className="bg-gradient-to-r from-brand-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Without Typing.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-300 dark:text-slate-300 light:text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Turn your facial expressions and hand gestures into emojis and messages in real time using AI. 100% private, client-side, and instant.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartTry}
              className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-purple-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-base shadow-xl shadow-brand-500/25 transition-all duration-200 hover:scale-105 active:scale-95 group"
            >
              <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Try It Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-7 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-base border border-slate-700/60 transition-all hover:border-slate-500"
            >
              <span>How It Works</span>
            </a>
          </div>

          {/* Privacy & Speed Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs font-medium text-slate-400">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% On-Device Privacy (No Video Uploads)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Zero-Latency WebAssembly Engine</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Heart className="w-4 h-4 text-pink-400" />
              <span>Free & Accessible to Everyone</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE ANIMATED DEMO VISUAL */}
        <div className="relative max-w-4xl mx-auto my-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/60 shadow-2xl relative overflow-hidden bg-gradient-to-b from-[#121826]/90 to-[#0c101a]/95">
            
            {/* Header / Tabs for Interactive Switching */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-slate-300 font-semibold">
                  Live AI Interpretation Simulation
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_CYCLES.map((demo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCycleIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      idx === cycleIndex
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {demo.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Conversion Pipeline Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center py-8">
              
              {/* Step A: Detected Face & Hand */}
              <div className="flex flex-col items-center p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center relative group">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  Camera Analysis
                </span>
                <div className="space-y-3 w-full">
                  <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-between">
                    <span className="text-xs text-purple-300 font-medium">Face</span>
                    <span className="text-xs font-mono font-bold text-white">{activeDemo.face}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-between">
                    <span className="text-xs text-cyan-300 font-medium">Hand</span>
                    <span className="text-xs font-mono font-bold text-white">{activeDemo.gesture}</span>
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
                  <span>Confidence: 96%</span>
                </div>
              </div>

              {/* Step B: The AI Fusion Engine */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-pulse">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <span className="mt-2 text-xs font-mono uppercase tracking-wider text-brand-300 font-semibold">
                  Rule Matrix Engine
                </span>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                  Fuses multimodal landmarks into emotional intent
                </p>
              </div>

              {/* Step C: Real-Time Animated Emoji & Message Result */}
              <div className="flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700 text-center relative overflow-hidden">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  Instant Output
                </span>
                
                {/* Bouncing Emoji */}
                <div
                  key={activeDemo.emoji}
                  className="text-6xl sm:text-7xl my-2 animate-bounce-short select-none filter drop-shadow-lg"
                >
                  {activeDemo.emoji}
                </div>

                {/* Generated Message Quote */}
                <p className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                  “{activeDemo.message}”
                </p>

                <span className="mt-3 inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Detected & Translated
                </span>
              </div>

            </div>

            {/* Bottom bar */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
              <span>Try your own combinations live with your webcam.</span>
              <button
                onClick={onStartTry}
                className="mt-2 sm:mt-0 font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>Open Live Detection Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="pt-24 pb-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-mono tracking-widest text-brand-400 font-bold">
              Simple & Intuitive
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              How It Works
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Four steps from your facial cue or hand motion to instant emoji expression.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6 text-brand-400" />
              </div>
              <div className="text-xs font-mono font-bold text-slate-500 mb-1">01 / PERMISSION</div>
              <h3 className="text-lg font-bold text-white mb-2">Turn On Your Camera</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Click Start. Your browser grants webcam access. No footage is ever uploaded or stored externally.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-xs font-mono font-bold text-slate-500 mb-1">02 / EXPRESSION</div>
              <h3 className="text-lg font-bold text-white mb-2">Make A Gesture Or Face</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Smile, show a thumbs up, wave, peace sign, or make surprised eyes. The AI analyzes both simultaneously.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-xs font-mono font-bold text-slate-500 mb-1">03 / INFERENCE</div>
              <h3 className="text-lg font-bold text-white mb-2">AI Detects In Real Time</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                MediaPipe neural models extract 478 face landmarks and 21 hand joints at 30+ frames per second.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-xs font-mono font-bold text-slate-500 mb-1">04 / OUTPUT</div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Emoji & Message</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Receive the translated emoji and expressive caption instantly. Copy to clipboard or read aloud with voice!
              </p>
            </div>

          </div>
        </section>

        {/* FEATURE HIGHLIGHT CALLOUT */}
        <div className="mt-8 p-8 rounded-3xl bg-gradient-to-r from-brand-900/30 via-slate-900 to-cyan-950/30 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Ready to communicate without words?</h3>
            <p className="text-slate-400 text-sm mt-1">
              Explore 25+ expressive combinations or customize your own shortcuts.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('library')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-200 border border-slate-700"
            >
              Browse Library
            </button>
            <button
              onClick={onStartTry}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-sm font-semibold text-white shadow-lg shadow-brand-600/30"
            >
              Start Live Camera
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
