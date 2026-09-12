import React from 'react';
import { 
  Sparkles, HeartHandshake, Eye, ShieldCheck, Rocket, Code2, AlertCircle 
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>About EmotiGesture</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Pioneering Hands-Free, Non-Verbal Expression
        </h2>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          Bridging the gap between human emotional expression and digital communication through private, client-side computer vision.
        </p>
      </div>

      {/* Experimental Tool Disclaimer Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Note:</strong> EmotiGesture is an experimental communication and assistive interaction tool. AI predictions and emotion classifications are based on probabilistic visual heuristics and facial blendshapes, and may occasionally misinterpret expressions under varying lighting or angles. It is intended for expressive communication, accessibility experimentation, and entertainment.
        </p>
      </div>

      {/* 3 Core Aspects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 bg-[#121826]/75">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Why It Was Created</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Typing can be slow, tiring, or physically inaccessible for people with motor impairments, RSI, or non-verbal communication needs. EmotiGesture empowers anyone to communicate complex intent with simple natural facial expressions and gestures.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 bg-[#121826]/75">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Computer Vision & AI</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            We extract 478 high-precision 3D facial landmarks and 52 facial blendshapes, coupled with 21 hand joint spatial coordinates. Temporal smoothing filters with hysteresis stabilize rapid transitions to prevent flickering.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 bg-[#121826]/75">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Privacy by Principle</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Privacy isn't an afterthought—it's foundational. All video inference happens locally on your CPU/GPU using WebAssembly. No video is ever stored, streamed, or sold.
          </p>
        </div>

      </div>

      {/* Technologies Used */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 bg-[#121826]/85">
        <div className="flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Technology Stack</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-brand-400 font-mono font-bold block">FRONTEND</span>
            <span className="text-sm font-bold text-white mt-1 block">React 18 & TypeScript</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-cyan-400 font-mono font-bold block">NEURAL VISION</span>
            <span className="text-sm font-bold text-white mt-1 block">MediaPipe Tasks Vision</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-purple-400 font-mono font-bold block">ACCELERATION</span>
            <span className="text-sm font-bold text-white mt-1 block">WebAssembly & WebGL</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-emerald-400 font-mono font-bold block">AUDIO & SPEECH</span>
            <span className="text-sm font-bold text-white mt-1 block">Web Audio + SpeechSynthesis</span>
          </div>
        </div>
      </div>

      {/* Future Roadmap */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 bg-[#121826]/85">
        <div className="flex items-center space-x-2">
          <Rocket className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Future Roadmap & Capabilities</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1">
            <span className="font-bold text-white">🎙️ Voice-to-Emoji Augmentation</span>
            <p className="text-slate-400">Combine tone-of-voice inflection with facial landmarks for triple-factor sentiment scoring.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1">
            <span className="font-bold text-white">🤟 Sign Language (ASL/BSL) Recognition</span>
            <p className="text-slate-400">Expand hand tracking to translate continuous fingerspelling and sign vocabulary into sentences.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1">
            <span className="font-bold text-white">👥 Multi-Person Detection & Dialog</span>
            <p className="text-slate-400">Track multiple people in the room to transcribe non-verbal interactions and group reactions.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-1">
            <span className="font-bold text-white">💬 Messaging Platforms Integration</span>
            <p className="text-slate-400">Export live reactions as webcam overlays or virtual camera plugins for Zoom, Meet, and Discord.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
