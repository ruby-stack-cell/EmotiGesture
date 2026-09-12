import React from 'react';
import { ShieldCheck, Lock, EyeOff, ServerOff, Cpu, Camera, CheckCircle2 } from 'lucide-react';

interface PrivacyViewProps {
  isCameraActive: boolean;
  onStopCamera?: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ isCameraActive, onStopCamera }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero-Knowledge Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Your Privacy Is Our Core Architecture
        </h2>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          “Your camera feed stays on your device.” We built EmotiGesture so you never have to choose between advanced AI capabilities and complete privacy.
        </p>
      </div>

      {/* Active Camera Status Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-[#121826]/90 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isCameraActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-white">Live Camera Hardware State:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isCameraActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isCameraActive ? 'Active & Running' : 'Completely Inactive'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isCameraActive
                ? 'Camera stream is being analyzed in browser memory. No network requests are being made.'
                : 'Webcam sensor is off and disconnected from the browser.'}
            </p>
          </div>
        </div>

        {isCameraActive && onStopCamera && (
          <button
            onClick={onStopCamera}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all"
          >
            Turn Off Camera Now
          </button>
        )}
      </div>

      {/* 4 Pillars of Privacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pillar 1 */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 bg-[#121826]/70">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ServerOff className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">No Server Video Streaming</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Unlike cloud-based computer vision APIs, your camera stream never leaves your browser tab. All neural models execute directly on your device CPU or GPU via WebAssembly (WASM).
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 bg-[#121826]/70">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">No Footage Storage</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            No video clips, photos, or biometric face vectors are stored to hard disk or transmitted over the internet. Video frames are discarded instantly after landmark coordinates are extracted.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 bg-[#121826]/70">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Local-Only Preferences</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your custom emoji mappings, history log, and camera preferences are stored strictly inside your browser's private <code className="text-xs text-brand-300 font-mono">localStorage</code> container on your computer.
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 bg-[#121826]/70">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Hardware Control Transparency</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            You maintain complete hardware control. Pause detection anytime, switch front or back lenses, or shut down the webcam feed completely with one tap.
          </p>
        </div>

      </div>

      {/* Permission FAQ / Instructions */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4 bg-[#121826]/80">
        <h3 className="text-xl font-bold text-white">Camera Permission Instructions</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          When you click <strong className="text-white">“Start Camera”</strong>, your web browser displays a standard security prompt asking for webcam permission.
        </p>
        <ul className="space-y-2.5 text-sm text-slate-400">
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>Click <strong>“Allow”</strong> to enable real-time detection in this tab.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>You can revoke this permission anytime by clicking the padlock icon in your browser URL address bar.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>If you prefer not to use your camera, you can use the built-in <strong>Simulation Mode</strong> to experience all gestures and emoji translations risk-free.</span>
          </li>
        </ul>
      </div>

    </div>
  );
};
