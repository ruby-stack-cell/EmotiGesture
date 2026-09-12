import React, { useState } from 'react';
import { Plus, Trash2, RotateCcw, Check, Sparkles, Sliders } from 'lucide-react';
import { CustomMapping, FaceExpression, HandGesture } from '../types';

interface CustomMappingViewProps {
  customMappings: CustomMapping[];
  onSaveMapping: (
    expression: FaceExpression,
    gesture: HandGesture,
    emoji: string,
    message: string
  ) => void;
  onDeleteMapping: (id: string) => void;
  onResetMappings: () => void;
  onTestMapping?: (mapping: CustomMapping) => void;
}

const FACES: { value: FaceExpression; label: string; emoji: string }[] = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'laughing', label: 'Laughing', emoji: '😂' },
  { value: 'sad', label: 'Sad', emoji: '😢' },
  { value: 'angry', label: 'Angry', emoji: '😡' },
  { value: 'surprised', label: 'Surprised', emoji: '😮' },
  { value: 'confused', label: 'Confused', emoji: '😕' },
  { value: 'fearful', label: 'Fearful', emoji: '😨' },
  { value: 'disgusted', label: 'Disgusted', emoji: '🤢' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' }
];

const GESTURES: { value: HandGesture; label: string; emoji: string }[] = [
  { value: 'peace', label: 'Peace / V', emoji: '✌️' },
  { value: 'thumbs_up', label: 'Thumbs Up', emoji: '👍' },
  { value: 'thumbs_down', label: 'Thumbs Down', emoji: '👎' },
  { value: 'wave', label: 'Wave', emoji: '👋' },
  { value: 'open_palm', label: 'Open Palm', emoji: '✋' },
  { value: 'ok', label: 'OK Sign', emoji: '👌' },
  { value: 'fist', label: 'Fist', emoji: '✊' },
  { value: 'pointing_up', label: 'Pointing Up', emoji: '☝️' },
  { value: 'pointing_right', label: 'Pointing Right', emoji: '👉' },
  { value: 'pointing_left', label: 'Pointing Left', emoji: '👈' },
  { value: 'crossed_fingers', label: 'Crossed Fingers', emoji: '🤞' },
  { value: 'heart_hands', label: 'Heart Hands', emoji: '🫶' }
];

const QUICK_EMOJIS = ['🎉', '🚀', '🥳', '🔥', '🏆', '🍕', '☕', '💡', '🌈', '⚡', '💯', '✨'];

export const CustomMappingModal: React.FC<CustomMappingViewProps> = ({
  customMappings,
  onSaveMapping,
  onDeleteMapping,
  onResetMappings,
  onTestMapping
}) => {
  const [selectedFace, setSelectedFace] = useState<FaceExpression>('happy');
  const [selectedGesture, setSelectedGesture] = useState<HandGesture>('peace');
  const [customEmoji, setCustomEmoji] = useState('🎉');
  const [customMessage, setCustomMessage] = useState("Let's celebrate!");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    onSaveMapping(
      selectedFace,
      selectedGesture,
      customEmoji.trim() || '✨',
      customMessage.trim()
    );

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <Sliders className="w-3.5 h-3.5" />
          <span>Personalize Your Experience</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Custom Message Mappings
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Assign your own custom emojis and personalized phrases to any combination of face and gesture. Saved securely in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CREATOR FORM */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-2xl bg-[#121826]/90">
          <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-800">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Create New Mapping</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* 1. Expression Selector */}
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-2">
                1. Facial Expression
              </label>
              <select
                value={selectedFace}
                onChange={(e) => setSelectedFace(e.target.value as FaceExpression)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              >
                {FACES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.emoji} {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Hand Gesture Selector */}
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-2">
                2. Hand Gesture
              </label>
              <select
                value={selectedGesture}
                onChange={(e) => setSelectedGesture(e.target.value as HandGesture)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {GESTURES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.emoji} {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Output Emoji */}
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-2">
                3. Output Emoji
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  placeholder="🎉"
                  maxLength={6}
                  className="w-20 px-3 py-3 rounded-xl bg-slate-900 border border-slate-700 text-center text-2xl focus:outline-none focus:border-brand-500"
                />
                <div className="flex-1 flex flex-wrap gap-1.5">
                  {QUICK_EMOJIS.map((em) => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => setCustomEmoji(em)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm flex items-center justify-center transition-transform hover:scale-110"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Custom Message Text */}
            <div>
              <label className="block text-xs uppercase font-bold text-slate-400 mb-2">
                4. Custom Message
              </label>
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="e.g. Let's celebrate!"
                maxLength={90}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-purple-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved to Local Storage!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save Custom Mapping</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: ACTIVE CUSTOM MAPPINGS LIST */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Active Custom Shortcuts</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {customMappings.length}
              </span>
            </h3>

            <button
              onClick={onResetMappings}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-slate-800/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="space-y-3">
            {customMappings.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-500">
                <p className="text-sm">No custom mappings saved yet.</p>
                <p className="text-xs text-slate-600 mt-1">
                  Use the builder on the left to create your first customized shortcut!
                </p>
              </div>
            ) : (
              customMappings.map((map) => (
                <div
                  key={map.id}
                  className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group bg-[#121826]/80"
                >
                  <div className="flex items-center space-x-4">
                    {/* Big Emoji Result */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600/20 to-cyan-500/20 border border-brand-500/30 flex items-center justify-center text-3xl shrink-0">
                      {map.emoji}
                    </div>

                    <div>
                      {/* Combo Formula */}
                      <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                        <span className="capitalize text-purple-300 font-bold">{map.expression}</span>
                        <span>+</span>
                        <span className="capitalize text-cyan-300 font-bold">
                          {map.gesture.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Custom Phrase */}
                      <p className="text-base font-bold text-white mt-1">
                        “{map.message}”
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {onTestMapping && (
                      <button
                        onClick={() => onTestMapping(map)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        Test
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteMapping(map.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete mapping"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
