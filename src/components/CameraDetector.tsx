import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Camera, CameraOff, Pause, Play, RefreshCw, FlipHorizontal, 
  Smile, Hand, Shield, AlertTriangle, SunMedium, Sparkles, Check,
  HelpCircle, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import { CameraSettings, FaceDetectionResult, HandDetectionResult, FaceExpression, HandGesture } from '../types';
import { VisionPipeline } from '../vision/visionPipeline';
import { drawDetectionOverlay } from '../vision/canvasOverlay';

interface CameraDetectorProps {
  onResults: (face: FaceDetectionResult, hand: HandDetectionResult) => void;
  isCameraActive: boolean;
  setIsCameraActive: (active: boolean) => void;
}

export const CameraDetector: React.FC<CameraDetectorProps> = ({
  onResults,
  isCameraActive,
  setIsCameraActive
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pipelineRef = useRef<VisionPipeline | null>(null);

  // Settings
  const [settings, setSettings] = useState<CameraSettings>({
    mirror: true,
    facingMode: 'user',
    detectFace: true,
    detectHand: true,
    simulationMode: false,
    soundEnabled: true,
    ttsEnabled: false
  });

  const [isPaused, setIsPaused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [fps, setFps] = useState(30);

  // Device enumeration
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Current detection readings for HUD display
  const [currentFace, setCurrentFace] = useState<FaceDetectionResult>({
    expression: 'none',
    confidence: 0,
    label: 'No Face',
    emoji: '👤'
  });

  const [currentHand, setCurrentHand] = useState<HandDetectionResult>({
    gesture: 'none',
    confidence: 0,
    label: 'No Hand',
    emoji: '✋'
  });

  // Simulated control state for fallback/testing
  const [simulatedFace, setSimulatedFace] = useState<FaceExpression>('happy');
  const [simulatedGesture, setSimulatedGesture] = useState<HandGesture>('thumbs_up');

  const settingsRef = useRef(settings);
  const onResultsRef = useRef(onResults);
  settingsRef.current = settings;
  onResultsRef.current = onResults;

  // Enumerate video devices
  const enumerateDevices = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(videoInputs);
    } catch (e) {
      console.warn('Could not enumerate devices:', e);
    }
  };

  // Handle detection results from the pipeline
  const handleResults = useCallback((
    face: FaceDetectionResult,
    hand: HandDetectionResult,
    currentFps: number
  ) => {
    setFps(currentFps);
    setCurrentFace(face);
    setCurrentHand(hand);
    onResultsRef.current(face, hand);

    // Draw on overlay canvas
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video && video.videoWidth > 0) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawDetectionOverlay(
          ctx,
          canvas.width,
          canvas.height,
          face,
          hand,
          {
            showFace: settingsRef.current.detectFace,
            showHand: settingsRef.current.detectHand,
            mirror: settingsRef.current.mirror
          },
          currentFps
        );
      }
    }
  }, []);

  // Initialize pipeline
  useEffect(() => {
    const pipeline = new VisionPipeline(settings, {
      onResults: handleResults,
      onError: (err) => {
        setErrorMessage(err);
        setShowTroubleshooting(true);
      },
      onModelLoaded: () => setIsModelLoading(false)
    });
    pipelineRef.current = pipeline;

    setIsModelLoading(true);
    pipeline.initializeModels().catch(() => {
      setIsModelLoading(false);
    });

    enumerateDevices();

    return () => {
      pipeline.dispose();
      pipelineRef.current = null;
    };
  }, [handleResults]);

  // Update pipeline settings when settings change
  useEffect(() => {
    pipelineRef.current?.updateSettings(settings);
  }, [settings]);

  // Start webcam
  const handleStartCamera = async (simulationMode = settings.simulationMode) => {
    setErrorMessage(null);
    setIsStartingCamera(true);

    if (!videoRef.current || !pipelineRef.current) {
      setIsStartingCamera(false);
      return;
    }

    pipelineRef.current.updateSettings({ ...settingsRef.current, simulationMode });
    const success = await pipelineRef.current.startCamera(videoRef.current);
    setIsStartingCamera(false);

    if (success) {
      setIsCameraActive(true);
      setIsPaused(false);
      setShowTroubleshooting(false);
      enumerateDevices();
    } else {
      setShowTroubleshooting(true);
    }
  };

  // Stop webcam
  const handleStopCamera = () => {
    pipelineRef.current?.stopCamera();
    setIsCameraActive(false);
    setIsPaused(false);
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    // Reset indicators
    const noFace: FaceDetectionResult = { expression: 'none', confidence: 0, label: 'No Face', emoji: '👤' };
    const noHand: HandDetectionResult = { gesture: 'none', confidence: 0, label: 'No Hand', emoji: '✋' };
    setCurrentFace(noFace);
    setCurrentHand(noHand);
    onResults(noFace, noHand);
  };

  // Pause / Resume
  const handleTogglePause = () => {
    if (!pipelineRef.current) return;
    pipelineRef.current.pauseDetection();
    setIsPaused(pipelineRef.current.isPausedState());
  };

  // Switch camera between front and environment
  const handleSwitchCamera = () => {
    const newFacing = settingsRef.current.facingMode === 'user' ? 'environment' : 'user';
    setSettings((prev) => ({ ...prev, facingMode: newFacing }));
    if (isCameraActive && videoRef.current && pipelineRef.current) {
      pipelineRef.current.updateSettings({ ...settingsRef.current, facingMode: newFacing });
      pipelineRef.current.startCamera(videoRef.current);
    }
  };

  // Change specific video device
  const handleDeviceChange = (deviceId: string) => {
    setSettings((prev) => ({ ...prev, deviceId }));
    if (isCameraActive && videoRef.current && pipelineRef.current) {
      pipelineRef.current.updateSettings({ ...settings, deviceId });
      pipelineRef.current.startCamera(videoRef.current);
    }
  };

  // Trigger simulated testing update
  const triggerSimulation = (face: FaceExpression, gesture: HandGesture) => {
    setSimulatedFace(face);
    setSimulatedGesture(gesture);

    const faceMeta: Record<FaceExpression, { label: string; emoji: string }> = {
      happy: { label: 'Happy', emoji: '😊' },
      sad: { label: 'Sad', emoji: '😢' },
      angry: { label: 'Angry', emoji: '😡' },
      surprised: { label: 'Surprised', emoji: '😮' },
      fearful: { label: 'Fearful', emoji: '😨' },
      disgusted: { label: 'Disgusted', emoji: '🤢' },
      confused: { label: 'Confused', emoji: '😕' },
      laughing: { label: 'Laughing', emoji: '😂' },
      neutral: { label: 'Neutral', emoji: '😐' },
      none: { label: 'None', emoji: '👤' }
    };

    const gestureMeta: Record<HandGesture, { label: string; emoji: string }> = {
      thumbs_up: { label: 'Thumbs Up', emoji: '👍' },
      thumbs_down: { label: 'Thumbs Down', emoji: '👎' },
      peace: { label: 'Peace / V', emoji: '✌️' },
      wave: { label: 'Wave', emoji: '👋' },
      open_palm: { label: 'Open Palm', emoji: '✋' },
      ok: { label: 'OK Sign', emoji: '👌' },
      fist: { label: 'Fist', emoji: '✊' },
      pointing_up: { label: 'Pointing Up', emoji: '☝️' },
      pointing_right: { label: 'Pointing Right', emoji: '👉' },
      pointing_left: { label: 'Pointing Left', emoji: '👈' },
      crossed_fingers: { label: 'Crossed Fingers', emoji: '🤞' },
      heart_hands: { label: 'Heart Hands', emoji: '🫶' },
      none: { label: 'None', emoji: '✋' }
    };

    const faceResult: FaceDetectionResult = {
      expression: face,
      confidence: 0.96,
      label: faceMeta[face].label,
      emoji: faceMeta[face].emoji,
      boundingBox: { xMin: 0.25, yMin: 0.2, width: 0.5, height: 0.5 }
    };

    const handResult: HandDetectionResult = {
      gesture: gesture,
      confidence: 0.94,
      label: gestureMeta[gesture].label,
      emoji: gestureMeta[gesture].emoji
    };

    setCurrentFace(faceResult);
    setCurrentHand(handResult);
    onResults(faceResult, handResult);
  };

  return (
    <div className="space-y-4">
      {/* CAMERA VIEWFINDER CONTAINER */}
      <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
        
        {/* Actual Video Element - ALWAYS present in DOM so dimensions and metadata load properly */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-transform duration-200 ${
            settings.mirror ? 'scale-x-[-1]' : ''
          }`}
        />

        {/* Overlay Canvas for landmarks & HUD */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${
            !isCameraActive ? 'hidden' : 'block'
          }`}
        />

        {/* INACTIVE STATE OVERLAY */}
        {!isCameraActive && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#121826] to-[#0a0d14]">
            
            <div className="w-20 h-20 rounded-3xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mb-5 text-brand-400 shadow-xl shadow-brand-500/10 animate-float">
              <Camera className="w-10 h-10" />
            </div>

            {isModelLoading && (
              <div className="mb-4 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Loading Vision Models in Browser...</span>
              </div>
            )}

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Ready to Detect Facial Cues & Gestures
            </h3>
            
            <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
              Enable your webcam to start real-time classification. Your video stream is processed exclusively in your browser and is never uploaded or saved.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => handleStartCamera()}
                disabled={isStartingCamera}
                className="flex items-center space-x-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-brand-500/30 transition-all hover:scale-105 disabled:opacity-50"
              >
                {isStartingCamera ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Accessing Camera...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Start Camera Feed</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setSettings((prev) => ({ ...prev, simulationMode: true }));
                  handleStartCamera(true);
                  triggerSimulation('happy', 'thumbs_up');
                }}
                className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-sm border border-slate-700/60"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Test With Simulated Mode</span>
              </button>
            </div>

            <div className="mt-6 flex items-center space-x-4">
              <button
                onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 underline underline-offset-4"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Camera not working? Click for troubleshooting</span>
              </button>
            </div>

            <div className="mt-4 flex items-center space-x-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Camera permission is requested only while this tab is active.</span>
            </div>
          </div>
        )}

        {/* PAUSED BANNER OVERLAY */}
        {isCameraActive && isPaused && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
            <Pause className="w-12 h-12 text-cyan-400 mb-2 animate-pulse" />
            <h4 className="text-lg font-bold">Detection Paused</h4>
            <p className="text-xs text-slate-300 mt-1">Camera feed is running, AI analysis is frozen.</p>
            <button
              onClick={handleTogglePause}
              className="mt-4 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Resume Detection
            </button>
          </div>
        )}

        {/* REAL-TIME CAMERA TOP HUD (When camera is live) */}
        {isCameraActive && !isPaused && (
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            {/* Live Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-medium text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-emerald-300 font-semibold">REC // LIVE</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-300 font-mono">{fps} FPS</span>
            </div>

            {/* Quick Live Readings pill */}
            <div className="hidden sm:flex items-center space-x-3 px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-purple-400 font-semibold">Face:</span>
                <span className="text-white font-mono">{currentFace.emoji} {currentFace.label}</span>
                <span className="text-purple-300 font-mono text-[10px]">
                  ({Math.round(currentFace.confidence * 100)}%)
                </span>
              </div>
              <span className="text-slate-600">/</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-cyan-400 font-semibold">Hand:</span>
                <span className="text-white font-mono">{currentHand.emoji} {currentHand.label}</span>
                <span className="text-cyan-300 font-mono text-[10px]">
                  ({Math.round(currentHand.confidence * 100)}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK HELPER BANNERS (Poor lighting, no hand, multi-face) */}
        {isCameraActive && !isPaused && (
          <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
            {currentFace.multipleFacesDetected && (
              <div className="px-3 py-2 rounded-xl bg-rose-500/25 border border-rose-500/50 text-rose-200 text-xs flex items-center space-x-2 backdrop-blur-md">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Please make sure only one person is in the frame for the best results.</span>
              </div>
            )}
            {currentFace.expression === 'none' && (
              <div className="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center space-x-2 backdrop-blur-md">
                <SunMedium className="w-4 h-4 text-amber-400 shrink-0" />
                <span>We can't see your face clearly. Try moving into better lighting.</span>
              </div>
            )}
            {currentFace.expression !== 'none' && currentHand.gesture === 'none' && (
              <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 text-xs flex items-center space-x-2 backdrop-blur-md">
                <Hand className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>No hand detected. Place your hand inside the camera frame.</span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ERROR NOTIFICATION BANNER */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <span className="font-bold block text-rose-300">Camera Issue Detected:</span>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white font-bold text-sm px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* CAMERA TROUBLESHOOTING DRAWER */}
      {showTroubleshooting && (
        <div className="p-5 rounded-2xl bg-[#121826] border border-cyan-500/30 text-xs space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
              <HelpCircle className="w-4 h-4" />
              <span>Camera Troubleshooting Guide</span>
            </div>
            <button
              onClick={() => setShowTroubleshooting(false)}
              className="text-slate-400 hover:text-white"
            >
              {showTroubleshooting ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="font-bold text-white block">1. Browser Permissions</span>
              <p className="text-slate-400 leading-relaxed">
                Click the <strong>Padlock 🔒 or Tune 🎚️ icon</strong> on the left side of your browser URL address bar. Ensure <strong>Camera</strong> is set to <strong>"Allow"</strong>, then refresh the page.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="font-bold text-white block">2. Windows Privacy Settings</span>
              <p className="text-slate-400 leading-relaxed">
                Open Windows <strong>Settings → Privacy & Security → Camera</strong>. Make sure <strong>"Camera access"</strong> and <strong>"Let desktop apps access your camera"</strong> are turned <strong>ON</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span className="font-bold text-white block">3. Close Conflicting Apps</span>
              <p className="text-slate-400 leading-relaxed">
                If <strong>Zoom, Microsoft Teams, Skype, Discord, OBS, or another browser tab</strong> is currently using your webcam, close them so Windows releases the camera hardware.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <span className="text-slate-400">Can't use a physical webcam right now?</span>
            <button
              onClick={() => {
                setSettings((prev) => ({ ...prev, simulationMode: true }));
                handleStartCamera(true);
                triggerSimulation('happy', 'thumbs_up');
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use Simulated Mode (No Camera Required)</span>
            </button>
          </div>
        </div>
      )}

      {/* HARDWARE & DETECTION CONTROLS BAR */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Main Power Controls */}
        <div className="flex items-center space-x-2">
          {!isCameraActive ? (
            <button
              onClick={() => handleStartCamera()}
              disabled={isStartingCamera}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              {isStartingCamera ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleStopCamera}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          )}

          {isCameraActive && (
            <button
              onClick={handleTogglePause}
              className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
              title="Pause/Resume AI detection"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}

          <button
            onClick={handleSwitchCamera}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
            title="Switch Camera (Front/Rear)"
            aria-label="Switch camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSettings((s) => ({ ...s, mirror: !s.mirror }))}
            className={`p-2.5 rounded-xl border transition-colors ${
              settings.mirror
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Mirror Camera Feed"
            aria-label="Toggle camera mirror"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Camera Device Selector Dropdown (when devices enumerated) */}
          {videoDevices.length > 1 && (
            <div className="relative">
              <select
                value={settings.deviceId || ''}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 max-w-[140px] truncate"
                title="Select webcam device"
              >
                <option value="">Default Camera</option>
                {videoDevices.map((dev, idx) => (
                  <option key={dev.deviceId || idx} value={dev.deviceId}>
                    {dev.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Feature Toggles */}
        <div className="flex items-center space-x-2">
          {/* Toggle Face */}
          <button
            onClick={() => setSettings((s) => ({ ...s, detectFace: !s.detectFace }))}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              settings.detectFace
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Face AI</span>
            {settings.detectFace && <Check className="w-3 h-3 text-purple-400 ml-1" />}
          </button>

          {/* Toggle Hand */}
          <button
            onClick={() => setSettings((s) => ({ ...s, detectHand: !s.detectHand }))}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              settings.detectHand
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Hand AI</span>
            {settings.detectHand && <Check className="w-3 h-3 text-cyan-400 ml-1" />}
          </button>

          {/* Simulation Toggle */}
          <button
            onClick={() => {
              const newSim = !settings.simulationMode;
              setSettings((s) => ({ ...s, simulationMode: newSim }));
              if (newSim) {
                triggerSimulation(simulatedFace, simulatedGesture);
              }
            }}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              settings.simulationMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle simulated controls"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate</span>
          </button>

          {/* Troubleshoot trigger */}
          <button
            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 border border-slate-700 transition-colors"
            title="Help / Troubleshoot camera"
            aria-label="Camera troubleshooting"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* SIMULATION TESTING PALETTE (When simulate mode is enabled) */}
      {settings.simulationMode && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>Interactive Simulated Controls (Zero Camera Needed)</span>
            <span className="text-[11px] text-slate-400">Click to instantly test gestures</span>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400">Facial Expression:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(['happy', 'laughing', 'sad', 'angry', 'surprised', 'confused', 'fearful', 'neutral'] as FaceExpression[]).map((exp) => (
                  <button
                    key={exp}
                    onClick={() => triggerSimulation(exp, simulatedGesture)}
                    className={`px-2.5 py-1 rounded-lg text-xs capitalize ${
                      simulatedFace === exp
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400">Hand Gesture:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(['thumbs_up', 'thumbs_down', 'peace', 'wave', 'open_palm', 'ok', 'fist', 'pointing_up', 'pointing_right', 'heart_hands', 'crossed_fingers'] as HandGesture[]).map((gest) => (
                  <button
                    key={gest}
                    onClick={() => triggerSimulation(simulatedFace, gest)}
                    className={`px-2.5 py-1 rounded-lg text-xs capitalize ${
                      simulatedGesture === gest
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {gest.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
