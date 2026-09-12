import React, { useState } from 'react';
import { Trash2, Copy, Check, CornerDownLeft, Clock, MessageSquareQuote } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onReuseItem?: (item: HistoryItem) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onClearHistory,
  onReuseItem
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedEmojiId, setCopiedEmojiId] = useState<string | null>(null);

  const copyItemText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyItemEmoji = (id: string, emoji: string) => {
    navigator.clipboard.writeText(emoji);
    setCopiedEmojiId(id);
    setTimeout(() => setCopiedEmojiId(null), 2000);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col h-full bg-[#121826]/90">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-base text-white">Recent Expressions</h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {history.length}
          </span>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10"
            title="Clear detection history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3 max-h-[460px]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <MessageSquareQuote className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">No detected expressions yet.</p>
            <p className="text-xs text-slate-600 mt-1">
              Start your camera and make an expression or gesture to log here!
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                {/* Emojis and Combo Name */}
                <div className="flex items-center space-x-2">
                  <span className="text-xl select-none">{item.comboEmoji}</span>
                  <span className="text-xs font-bold text-slate-200">
                    {item.expressionLabel} {item.gesture !== 'none' ? `+ ${item.gestureLabel}` : ''}
                  </span>
                </div>

                {/* Timestamp */}
                <span className="text-[11px] font-mono text-slate-500">
                  {item.formattedTime}
                </span>
              </div>

              {/* Message quote */}
              <p className="text-xs text-slate-300 italic pl-1 border-l-2 border-brand-500/40 my-2">
                “{item.message}”
              </p>

              {/* Action Toolbar */}
              <div className="flex items-center justify-end space-x-1.5 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {/* Copy Text */}
                <button
                  onClick={() => copyItemText(item.id, item.message)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center space-x-1 transition-colors"
                  title="Copy message"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy Text'}</span>
                </button>

                {/* Copy Emoji */}
                <button
                  onClick={() => copyItemEmoji(item.id, item.comboEmoji)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center space-x-1 transition-colors"
                  title="Copy emoji"
                >
                  {copiedEmojiId === item.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <span className="text-xs">{item.comboEmoji}</span>
                  )}
                  <span>{copiedEmojiId === item.id ? 'Copied' : 'Copy Emoji'}</span>
                </button>

                {/* Reuse Previous Result */}
                {onReuseItem && (
                  <button
                    onClick={() => onReuseItem(item)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 text-[11px] flex items-center space-x-1 transition-colors"
                    title="Reuse this result"
                  >
                    <CornerDownLeft className="w-3 h-3" />
                    <span>Reuse</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
