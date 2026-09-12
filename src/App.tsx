import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroLanding } from './components/HeroLanding';
import { CameraDetector } from './components/CameraDetector';
import { ResultDisplay } from './components/ResultDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { EmojiLibrary } from './components/EmojiLibrary';
import { CustomMappingModal } from './components/CustomMappingModal';
import { PrivacyView } from './components/PrivacyView';
import { AboutView } from './components/AboutView';

import { 
  ActiveTab, FaceDetectionResult, HandDetectionResult, 
  InterpretationResult, HistoryItem, CustomMapping, FaceExpression, HandGesture 
} from './types';
import { TemporalSmoother } from './vision/temporalSmoother';
import { interpret, RuleDefinition } from './engine/interpretationRules';
import { getCustomMappings, saveCustomMapping, deleteCustomMapping, resetCustomMappings } from './store/customMappingStorage';
import { getHistory, addHistoryItem, clearHistory } from './store/historyStorage';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

function getInitialTab(): ActiveTab {
  try {
    const path = window.location.pathname.replace(/^\/+/, '').toLowerCase();
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    const route = hash || path;
    if (route === 'try' || route === 'demo') return 'try';
    if (route === 'library' || route === 'dictionary') return 'library';
    if (route === 'history') return 'history';
    if (route === 'custom' || route === 'mapping' || route === 'mappings') return 'custom';
    if (route === 'about') return 'about';
    if (route === 'privacy') return 'privacy';
  } catch {
    // ignore
  }
  return 'home';
}

export function App() {
  const [activeTab, setActiveTabState] = useState<ActiveTab>(getInitialTab);

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    try {
      const targetHash = tab === 'home' ? '' : `#/${tab}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash || window.location.pathname);
      }
    } catch {
      // ignore
    }
  };

  // Sync tab on browser back/forward and hash changes
  useEffect(() => {
    const handleUrlChange = () => {
      setActiveTabState(getInitialTab());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sound and TTS toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Storage states
  const [customMappings, setCustomMappings] = useState<CustomMapping[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Detection and result state
  const [currentResult, setCurrentResult] = useState<InterpretationResult | null>(null);
  const [currentFaceResult, setCurrentFaceResult] = useState<FaceDetectionResult>({
    expression: 'none',
    confidence: 0,
    label: 'No Face',
    emoji: '👤'
  });
  const [currentHandResult, setCurrentHandResult] = useState<HandDetectionResult>({
    gesture: 'none',
    confidence: 0,
    label: 'No Hand',
    emoji: '✋'
  });

  // Smoother instance
  const smootherRef = useRef<TemporalSmoother>(new TemporalSmoother());

  // Load custom mappings & history on mount
  useEffect(() => {
    setCustomMappings(getCustomMappings());
    setHistory(getHistory());
  }, []);

  // Handle dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Handle detection results from CameraDetector
  const handleDetectionResults = (face: FaceDetectionResult, hand: HandDetectionResult) => {
    setCurrentFaceResult(face);
    setCurrentHandResult(hand);

    // Apply temporal smoothing to prevent flicker
    const smoothed = smootherRef.current.update(
      face.expression,
      face.confidence,
      hand.gesture,
      hand.confidence
    );

    // If a stable expressive state is achieved
    if (smoothed.isStableTrigger || !currentResult) {
      if (smoothed.face !== 'none' || smoothed.gesture !== 'none') {
        const avgConfidence = (smoothed.faceConfidence + smoothed.gestureConfidence) / 2;
        const newResult = interpret(
          smoothed.face,
          smoothed.gesture,
          customMappings,
          avgConfidence
        );
        setCurrentResult(newResult);

        // Add to history
        const updatedHistory = addHistoryItem(
          smoothed.face,
          smoothed.gesture,
          face.emoji,
          hand.emoji,
          newResult.comboEmoji,
          face.label,
          hand.label,
          newResult.message,
          avgConfidence
        );
        setHistory(updatedHistory);
      }
    }
  };

  // Custom mappings handlers
  const handleSaveCustomMapping = (
    expression: FaceExpression,
    gesture: HandGesture,
    emoji: string,
    message: string
  ) => {
    const updated = saveCustomMapping(expression, gesture, emoji, message);
    setCustomMappings(updated);
  };

  const handleDeleteCustomMapping = (id: string) => {
    const updated = deleteCustomMapping(id);
    setCustomMappings(updated);
  };

  const handleResetCustomMappings = () => {
    const updated = resetCustomMappings();
    setCustomMappings(updated);
  };

  // History handlers
  const handleClearHistory = () => {
    const updated = clearHistory();
    setHistory(updated);
  };

  const handleReuseHistoryItem = (item: HistoryItem) => {
    const reusedResult: InterpretationResult = {
      id: `reused_${Date.now()}`,
      expression: item.expression,
      gesture: item.gesture,
      expressionEmoji: item.expressionEmoji,
      gestureEmoji: item.gestureEmoji,
      comboEmoji: item.comboEmoji,
      message: item.message,
      category: 'Recent',
      confidence: item.confidence,
      timestamp: Date.now()
    };
    setCurrentResult(reusedResult);
    setActiveTab('try');
  };

  // Test rule from library
  const handleTestLibraryRule = (rule: RuleDefinition) => {
    const testResult: InterpretationResult = {
      id: `test_${rule.id}_${Date.now()}`,
      expression: rule.expression,
      gesture: rule.gesture,
      expressionEmoji: rule.expressionEmoji,
      gestureEmoji: rule.gestureEmoji,
      comboEmoji: rule.comboEmoji,
      message: rule.message,
      category: rule.category,
      confidence: 0.98,
      timestamp: Date.now()
    };
    setCurrentResult(testResult);
    setActiveTab('try');
  };

  // Test custom mapping
  const handleTestCustomMapping = (mapping: CustomMapping) => {
    const testResult: InterpretationResult = {
      id: `test_custom_${mapping.id}_${Date.now()}`,
      expression: mapping.expression,
      gesture: mapping.gesture,
      expressionEmoji: '😊',
      gestureEmoji: '✌️',
      comboEmoji: mapping.emoji,
      message: mapping.message,
      category: mapping.category,
      confidence: 0.98,
      timestamp: Date.now(),
      isCustom: true
    };
    setCurrentResult(testResult);
    setActiveTab('try');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100 dark:bg-[#0a0d14] dark:text-slate-100 light:bg-slate-50 light:text-slate-900 transition-colors">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCameraActive={isCameraActive}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HeroLanding
            onStartTry={() => setActiveTab('try')}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'try' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Top Toolbar: Audio / Speech Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Real-Time AI Detection Console
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Point your camera, make an expression, and watch the AI translate in real time.
                </p>
              </div>

              {/* Preferences: Sound Chimes & TTS */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    soundEnabled
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                  title="Toggle sound effects"
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-purple-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>Chime Sound</span>
                </button>

                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    ttsEnabled
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                  title="Toggle automatic speech synthesis"
                >
                  {ttsEnabled ? <Mic className="w-3.5 h-3.5 text-cyan-400" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span>Auto Read-Aloud (TTS)</span>
                </button>
              </div>
            </div>

            {/* Split Screen Grid: Live Camera & Result Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Live Camera Detector */}
              <div className="lg:col-span-7">
                <CameraDetector
                  onResults={handleDetectionResults}
                  isCameraActive={isCameraActive}
                  setIsCameraActive={setIsCameraActive}
                />
              </div>

              {/* Right Column: Prominent Result Panel */}
              <div className="lg:col-span-5 flex flex-col">
                <ResultDisplay
                  result={currentResult}
                  faceLabel={currentFaceResult.label}
                  faceConfidence={currentFaceResult.confidence}
                  faceEmoji={currentFaceResult.emoji}
                  gestureLabel={currentHandResult.label}
                  gestureConfidence={currentHandResult.confidence}
                  gestureEmoji={currentHandResult.emoji}
                  soundEnabled={soundEnabled}
                  ttsEnabled={ttsEnabled}
                />
              </div>

            </div>

            {/* Bottom History Drawer in Try View */}
            <div className="pt-4">
              <HistoryPanel
                history={history}
                onClearHistory={handleClearHistory}
                onReuseItem={handleReuseHistoryItem}
              />
            </div>

          </div>
        )}

        {activeTab === 'library' && (
          <EmojiLibrary onSelectRule={handleTestLibraryRule} />
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <HistoryPanel
              history={history}
              onClearHistory={handleClearHistory}
              onReuseItem={handleReuseHistoryItem}
            />
          </div>
        )}

        {activeTab === 'custom' && (
          <CustomMappingModal
            customMappings={customMappings}
            onSaveMapping={handleSaveCustomMapping}
            onDeleteMapping={handleDeleteCustomMapping}
            onResetMappings={handleResetCustomMappings}
            onTestMapping={handleTestCustomMapping}
          />
        )}

        {activeTab === 'about' && <AboutView />}

        {activeTab === 'privacy' && (
          <PrivacyView
            isCameraActive={isCameraActive}
            onStopCamera={() => setIsCameraActive(false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070a10] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">EmotiGesture</span>
            <span>—</span>
            <span>Real-time On-Device AI Expression Translation</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveTab('privacy')} className="hover:text-slate-300">Privacy Policy</button>
            <button onClick={() => setActiveTab('about')} className="hover:text-slate-300">About</button>
            <button onClick={() => setActiveTab('library')} className="hover:text-slate-300">Dictionary</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
export default App;
