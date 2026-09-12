import React, { useState, useMemo } from 'react';
import { Search, Filter, Copy, Check, Play, BookOpen } from 'lucide-react';
import { PRESET_RULES, RuleDefinition } from '../engine/interpretationRules';

interface EmojiLibraryProps {
  onSelectRule?: (rule: RuleDefinition) => void;
}

const CATEGORIES = [
  'All',
  'Happy',
  'Sad',
  'Love',
  'Greetings',
  'Reactions',
  'Agreement',
  'Disagreement',
  'Confusion',
  'Surprise',
  'Frustration'
];

export const EmojiLibrary: React.FC<EmojiLibraryProps> = ({ onSelectRule }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRules = useMemo(() => {
    return PRESET_RULES.filter((rule) => {
      const matchCategory =
        selectedCategory === 'All' || rule.category.toLowerCase() === selectedCategory.toLowerCase();
      
      const q = searchQuery.toLowerCase();
      const matchSearch =
        rule.message.toLowerCase().includes(q) ||
        rule.expression.toLowerCase().includes(q) ||
        rule.gesture.toLowerCase().includes(q) ||
        rule.category.toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title & Search Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Multimodal Expression Dictionary</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Emoji & Message Library
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Browse all official expression and gesture mappings. Search by emotion, gesture, category, or keyword.
        </p>
      </div>

      {/* Search Bar & Category Filter Chips */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mappings (e.g. 'happy', 'thumbs up', 'amazing', 'wait')..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1 mr-2" />
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-brand-600 to-cyan-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Mappings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRules.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            <p className="text-base font-semibold">No mappings found matching your search.</p>
            <p className="text-xs text-slate-600 mt-1">Try searching for a different keyword or category.</p>
          </div>
        ) : (
          filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group hover:shadow-xl hover:shadow-brand-500/5 bg-[#121826]/75"
            >
              {/* Card Top: Category Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                  {rule.category}
                </span>

                <button
                  onClick={() => handleCopy(rule.id, rule.message)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                  title="Copy message"
                >
                  {copiedId === rule.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Equation Display: Face + Gesture -> Emoji */}
              <div className="flex items-center justify-center space-x-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800/70 mb-4">
                <div className="text-center">
                  <div className="text-2xl">{rule.expressionEmoji}</div>
                  <span className="text-[10px] text-slate-400 capitalize">{rule.expression}</span>
                </div>
                <span className="text-slate-500 font-bold text-sm">+</span>
                <div className="text-center">
                  <div className="text-2xl">{rule.gestureEmoji}</div>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {rule.gesture.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-cyan-400 font-bold text-base">➔</span>
                <div className="text-center">
                  <div className="text-3xl filter drop-shadow-md">{rule.comboEmoji}</div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase font-mono">Output</span>
                </div>
              </div>

              {/* Generated Message Quote */}
              <blockquote className="text-sm font-bold text-slate-200 mb-4 min-h-[40px] flex items-center">
                “{rule.message}”
              </blockquote>

              {/* Action: Test in Live View */}
              {onSelectRule && (
                <button
                  onClick={() => onSelectRule(rule)}
                  className="w-full mt-auto py-2 rounded-xl bg-slate-800 hover:bg-gradient-to-r hover:from-brand-600 hover:to-cyan-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all group-hover:border-transparent"
                >
                  <Play className="w-3 h-3" />
                  <span>Test This Mapping</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
