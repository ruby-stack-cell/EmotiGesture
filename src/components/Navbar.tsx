import React from 'react';
import { Sparkles, Camera, BookOpen, Clock, Settings2, Info, Shield, Sun, Moon } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCameraActive: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isCameraActive,
  isDarkMode,
  toggleDarkMode
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#0a0d14]/85 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-[#0a0d14]/85 light:border-slate-200 light:bg-white/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-2.5 text-left group focus:outline-none"
          aria-label="EmotiGesture Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-purple-500 to-cyan-400 p-[2px] shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent dark:from-white dark:to-slate-400 light:from-slate-900 light:to-slate-700">
                EmotiGesture
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Face & Gesture Translation</p>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'home'
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => setActiveTab('try')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'try'
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Try It</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'library'
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Emoji Library</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>History</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'custom'
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Settings2 className="w-4 h-4 text-emerald-400" />
            <span>Custom Mappings</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'about'
                ? 'text-brand-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'privacy'
                ? 'text-brand-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy</span>
          </button>
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center space-x-3">
          {/* Active Camera Indicator */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isCameraActive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800/50 text-slate-400 border-slate-700/50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isCameraActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span className="hidden sm:inline">
              {isCameraActive ? 'Camera Live' : 'Camera Off'}
            </span>
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors border border-slate-700/50 focus:outline-none"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Primary CTA button */}
          <button
            onClick={() => setActiveTab('try')}
            className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Camera className="w-4 h-4" />
            <span>Try It Now</span>
          </button>
        </div>

      </div>

      {/* Mobile Nav Drawer */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 py-2 px-3 bg-[#0c101a]">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            activeTab === 'home' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('try')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            activeTab === 'try' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Camera className="w-4 h-4 mb-0.5" />
          <span>Try It</span>
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            activeTab === 'library' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>Library</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            activeTab === 'history' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Clock className="w-4 h-4 mb-0.5" />
          <span>History</span>
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            activeTab === 'custom' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Settings2 className="w-4 h-4 mb-0.5" />
          <span>Custom</span>
        </button>
      </div>
    </header>
  );
};
