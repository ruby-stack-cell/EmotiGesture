import React, { useState, useEffect } from 'react';
import { Copy, Check, Volume2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { InterpretationResult } from '../types';
import { soundSynthesizer } from '../engine/audioSynthesizer';

interface ResultDisplayProps {
  result: InterpretationResult | null;
  faceLabel: string;
  faceConfidence: number;
  faceEmoji: string;
  gestureLabel: string;
  gestureConfidence: number;
  gestureEmoji: string;
  soundEnabled: boolean;
  ttsEnabled: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  faceLabel,
  faceConfidence,
  faceEmoji,
  gestureLabel,
  gestureConfidence,
  gestureEmoji,
  soundEnabled,
  ttsEnabled
}) => {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedEmoji, setCopiedEmoji] = useState(false);
  const [prevId, setPrevId] = useState<string>('');

  const displayEmoji = result?.comboEmoji || '✨';
  const displayMessage = result?.message || 'Awaiting facial cue or gesture...';

  // Trigger bounce animation, audio chime, and optional speech on new result
  useEffect(() => {
    if (!result || result.id === prevId) return;
    setPrevId(result.id);

    // Audio chime
    if (soundEnabled) {
      soundSynthesizer.playDetectionChime();
    }

    // TTS speech
    if (ttsEnabled && result.message) {
      soundSynthesizer.speakMessage(result.message);
    }

    // Gentle celebratory confetti for special loving or hilarious gestures
    if (result.expression === 'laughing' || result.gesture === 'heart_hands') {
      try {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#a855f7', '#06b6d4', '#ec4899']
        });
      } catch {
        // ignore
      }
    }
  }, [result, prevId, soundEnabled, ttsEnabled]);

  const handleCopyMessage = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.message);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleCopyEmoji = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.comboEmoji);
    setCopiedEmoji(true);
    setTimeout(() => setCopiedEmoji(false), 2000);
  };

  const handleSpeak = () => {
    if (!result) return;
    soundSynthesizer.speakMessage(result.message);
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full bg-gradient-to-b from-[#121826]/90 to-[#0c101a]/95">
      
      {/* Top Status Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Live Interpretation
          </span>
        </div>

        {result?.isCustom && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/40">
            Custom Shortcut
          </span>
        )}
      </div>

      {/* CENTER STAGE: LARGE ANIMATED EMOJI & MESSAGE */}
      <div className="my-auto py-8 text-center flex flex-col items-center justify-center">
        
        {/* Animated Pop Emoji */}
        <div
          key={displayEmoji}
          className="text-7xl sm:text-8xl my-3 select-none filter drop-shadow-2xl animate-pop transition-transform hover:scale-110 cursor-pointer"
          onClick={handleCopyEmoji}
          title="Click to copy emoji"
        >
          {displayEmoji}
        </div>

        {/* Generated Message Quote */}
        <div className="mt-3 px-4 max-w-lg">
          <blockquote className="text-xl sm:text-2xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-900 leading-snug">
            “{displayMessage}”
          </blockquote>
        </div>

        {/* Detected Status Badge */}
        {result && (
          <div className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Detected & Translated</span>
          </div>
        )}

      </div>

      {/* BOTTOM GAUGES: FACE & HAND BREAKDOWN */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        
        {/* Dual Meter Row */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Face Gauge */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-purple-500/20">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-purple-300 font-semibold flex items-center space-x-1">
                <span>{faceEmoji}</span>
                <span>{faceLabel}</span>
              </span>
              <span className="font-mono font-bold text-white text-xs">
                {Math.round(faceConfidence * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${Math.round(faceConfidence * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mt-1 block">
              Expression
            </span>
          </div>

          {/* Hand Gauge */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-cyan-500/20">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-cyan-300 font-semibold flex items-center space-x-1">
                <span>{gestureEmoji}</span>
                <span>{gestureLabel}</span>
              </span>
              <span className="font-mono font-bold text-white text-xs">
                {Math.round(gestureConfidence * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300"
                style={{ width: `${Math.round(gestureConfidence * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mt-1 block">
              Hand Gesture
            </span>
          </div>

        </div>

        {/* Quick Actions (Copy, TTS, Share) */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyMessage}
              disabled={!result}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
            >
              {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMessage ? 'Copied Message!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleCopyEmoji}
              disabled={!result}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
            >
              {copiedEmoji ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmoji ? 'Copied Emoji!' : 'Copy Emoji'}</span>
            </button>
          </div>

          <button
            onClick={handleSpeak}
            disabled={!result}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 transition-colors disabled:opacity-50"
            title="Read aloud (Text-to-Speech)"
            aria-label="Read message aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
