import { FilesetResolver, FaceLandmarker, HandLandmarker } from '@mediapipe/tasks-vision';
import { FaceDetectionResult, HandDetectionResult, CameraSettings } from '../types';
import { classifyFace } from './faceClassifier';
import { classifyHand } from './gestureClassifier';

export interface VisionPipelineCallbacks {
  onResults: (face: FaceDetectionResult, hand: HandDetectionResult, fps: number) => void;
  onError: (error: string) => void;
  onModelLoaded: () => void;
}

export class VisionPipeline {
  private faceLandmarker: FaceLandmarker | null = null;
  private handLandmarker: HandLandmarker | null = null;
  private isModelLoading = false;
  private isModelReady = false;
  private isRunning = false;
  private isPaused = false;

  private videoElement: HTMLVideoElement | null = null;
  private mediaStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private lastVideoTime = -1;

  // FPS calculation
  private frameCount = 0;
  private lastFpsTimestamp = performance.now();
  private currentFps = 30;

  // Settings
  private settings: CameraSettings;
  private callbacks: VisionPipelineCallbacks;

  constructor(settings: CameraSettings, callbacks: VisionPipelineCallbacks) {
    this.settings = settings;
    this.callbacks = callbacks;
  }

  public async initializeModels(): Promise<boolean> {
    if (this.isModelReady) return true;
    if (this.isModelLoading) return false;

    this.isModelLoading = true;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );

      // Load FaceLandmarker with blendshapes
      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 2
      });

      // Load HandLandmarker
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 2
      });

      this.isModelReady = true;
      this.isModelLoading = false;
      this.callbacks.onModelLoaded();
      return true;
    } catch (err: unknown) {
      console.warn('Could not load online MediaPipe models directly, fallback available:', err);
      this.isModelLoading = false;
      // In offline/restricted environments, the pipeline will still support simulation mode
      this.callbacks.onError('AI models could not be loaded from CDN. You can continue using Simulation Mode.');
      return false;
    }
  }

  public async startCamera(videoElement: HTMLVideoElement): Promise<boolean> {
    this.videoElement = videoElement;

    if (this.settings.simulationMode) {
      this.isRunning = true;
      this.startLoop();
      return true;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      this.callbacks.onError('Your browser does not support camera access (navigator.mediaDevices.getUserMedia is unavailable). Please use Chrome, Edge, or Firefox, and ensure you are accessing via http://localhost or HTTPS.');
      return false;
    }

    try {
      if (this.mediaStream) {
        this.stopCamera();
      }

      let stream: MediaStream | null = null;

      // Tier 1: Try requested specific constraints (or deviceId)
      const primaryConstraints: MediaStreamConstraints = {
        video: this.settings.deviceId
          ? { deviceId: { exact: this.settings.deviceId } }
          : {
              facingMode: this.settings.facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 }
            },
        audio: false
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
      } catch (tier1Err) {
        console.warn('Primary camera constraints failed, attempting fallback resolution:', tier1Err);

        // Tier 2: Try basic resolution without facingMode
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
          });
        } catch (tier2Err) {
          console.warn('Secondary camera constraints failed, attempting raw video fallback:', tier2Err);

          // Tier 3: Absolute fallback to bare minimum
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
      }

      if (!stream) {
        throw new Error('Unable to obtain video stream from device.');
      }

      this.mediaStream = stream;
      this.videoElement.srcObject = stream;

      // Safe ready listener with 2.5-second timeout safeguard so it never hangs
      await new Promise<void>((resolve) => {
        if (!this.videoElement) return resolve();

        let resolved = false;
        const markReady = () => {
          if (!resolved) {
            resolved = true;
            this.videoElement?.play().catch((e) => console.warn('Video play delayed:', e));
            resolve();
          }
        };

        if (this.videoElement.readyState >= 1) {
          markReady();
          return;
        }

        this.videoElement.onloadedmetadata = markReady;
        this.videoElement.oncanplay = markReady;

        // Fallback timeout to ensure execution continues even if browser delays metadata
        setTimeout(markReady, 2000);
      });

      this.isRunning = true;
      this.startLoop();
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const errorName = err instanceof Error ? err.name : '';

      if (errorName === 'NotAllowedError' || errorMsg.includes('Permission') || errorMsg.includes('NotAllowedError')) {
        this.callbacks.onError('Camera permission was denied. Please click the camera/lock icon in your browser URL address bar and change permissions to "Allow". Also ensure Windows Camera Privacy settings are enabled.');
      } else if (errorName === 'NotReadableError' || errorMsg.includes('NotReadableError') || errorMsg.includes('Could not start video source')) {
        this.callbacks.onError('Camera is currently busy or in use by another application (e.g. Zoom, Teams, Discord, Skype, OBS, or another browser tab). Please close other apps and try again.');
      } else if (errorName === 'NotFoundError' || errorMsg.includes('NotFoundError') || errorMsg.includes('DevicesNotFoundError')) {
        this.callbacks.onError('No webcam device was found on your system. Please connect a webcam or switch to Simulation Mode.');
      } else if (errorName === 'OverconstrainedError') {
        this.callbacks.onError('The selected camera does not support the requested resolution or settings. Try selecting another device.');
      } else {
        this.callbacks.onError(`Camera error: ${errorMsg}`);
      }
      return false;
    }
  }

  public stopCamera() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  public pauseDetection() {
    this.isPaused = !this.isPaused;
  }

  public isPausedState(): boolean {
    return this.isPaused;
  }

  public updateSettings(newSettings: CameraSettings) {
    const wasSimulation = this.settings.simulationMode;
    this.settings = newSettings;

    if (wasSimulation !== newSettings.simulationMode && this.videoElement) {
      this.startCamera(this.videoElement);
    }
  }

  private startLoop() {
    const processFrame = () => {
      if (!this.isRunning) return;

      // Measure FPS
      this.frameCount++;
      const now = performance.now();
      if (now - this.lastFpsTimestamp >= 1000) {
        this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTimestamp));
        this.frameCount = 0;
        this.lastFpsTimestamp = now;
      }

      if (!this.isPaused && this.videoElement) {
        this.detectCurrentFrame(now);
      }

      this.animFrameId = requestAnimationFrame(processFrame);
    };

    this.animFrameId = requestAnimationFrame(processFrame);
  }

  private detectCurrentFrame(timestamp: number) {
    if (!this.videoElement) return;

    // If simulation mode
    if (this.settings.simulationMode) {
      return; // Simulation handles its own tick updates from UI
    }

    // Video stream frame check
    if (this.videoElement.readyState < 2) return;
    if (this.videoElement.currentTime === this.lastVideoTime) return;
    this.lastVideoTime = this.videoElement.currentTime;

    let faceResult: FaceDetectionResult = {
      expression: 'none',
      confidence: 0,
      label: 'No Face',
      emoji: '👤'
    };

    let handResult: HandDetectionResult = {
      gesture: 'none',
      confidence: 0,
      label: 'No Hand',
      emoji: '✋'
    };

    // 1. Process Face
    if (this.settings.detectFace && this.faceLandmarker && this.isModelReady) {
      try {
        const faceResults = this.faceLandmarker.detectForVideo(this.videoElement, timestamp);
        if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
          const numFaces = faceResults.faceLandmarks.length;
          const blendshapes = faceResults.faceBlendshapes?.[0]?.categories;
          const landmarks = faceResults.faceLandmarks[0];
          faceResult = classifyFace(blendshapes, landmarks, numFaces);
        }
      } catch (e) {
        console.error('Error detecting face:', e);
      }
    }

    // 2. Process Hand
    if (this.settings.detectHand && this.handLandmarker && this.isModelReady) {
      try {
        const handResults = this.handLandmarker.detectForVideo(this.videoElement, timestamp);
        if (handResults.landmarks && handResults.landmarks.length > 0) {
          const handedness = (handResults.handednesses?.[0]?.[0]?.categoryName as 'Left' | 'Right') || 'Right';
          handResult = classifyHand(handResults.landmarks, undefined, undefined, handedness);
        }
      } catch (e) {
        console.error('Error detecting hand:', e);
      }
    }

    this.callbacks.onResults(faceResult, handResult, this.currentFps);
  }

  public dispose() {
    this.stopCamera();
    try {
      this.faceLandmarker?.close();
      this.handLandmarker?.close();
    } catch {
      // ignore
    }
    this.faceLandmarker = null;
    this.handLandmarker = null;
    this.isModelReady = false;
  }
}
