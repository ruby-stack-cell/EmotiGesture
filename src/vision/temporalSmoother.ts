import { FaceExpression, HandGesture } from '../types';

export interface SmootherOptions {
  historySize?: number;
  minDominanceThreshold?: number; // Fraction of recent frames required (e.g. 0.6)
  confidenceAlpha?: number; // EMA smoothing factor (0 to 1)
  cooldownMs?: number; // Cooldown between new interpretation triggers
}

export class TemporalSmoother {
  private faceHistory: FaceExpression[] = [];
  private gestureHistory: HandGesture[] = [];
  private currentFace: FaceExpression = 'neutral';
  private currentGesture: HandGesture = 'none';
  private smoothedFaceConfidence = 0.8;
  private smoothedGestureConfidence = 0.8;

  private historySize: number;
  private minDominanceThreshold: number;
  private confidenceAlpha: number;
  private cooldownMs: number;
  private lastTriggerTime = 0;

  constructor(options: SmootherOptions = {}) {
    this.historySize = options.historySize || 7;
    this.minDominanceThreshold = options.minDominanceThreshold || 0.55;
    this.confidenceAlpha = options.confidenceAlpha || 0.35;
    this.cooldownMs = options.cooldownMs || 800; // 800ms cooldown between new triggerings
  }

  public update(
    rawFace: FaceExpression,
    rawFaceConfidence: number,
    rawGesture: HandGesture,
    rawGestureConfidence: number
  ): {
    face: FaceExpression;
    faceConfidence: number;
    gesture: HandGesture;
    gestureConfidence: number;
    hasStateChanged: boolean;
    isStableTrigger: boolean;
  } {
    // 1. Update rolling histories
    this.faceHistory.push(rawFace);
    if (this.faceHistory.length > this.historySize) {
      this.faceHistory.shift();
    }

    this.gestureHistory.push(rawGesture);
    if (this.gestureHistory.length > this.historySize) {
      this.gestureHistory.shift();
    }

    // 2. Smooth confidences with Exponential Moving Average (EMA)
    this.smoothedFaceConfidence = 
      this.confidenceAlpha * rawFaceConfidence + (1 - this.confidenceAlpha) * this.smoothedFaceConfidence;
    this.smoothedGestureConfidence = 
      this.confidenceAlpha * rawGestureConfidence + (1 - this.confidenceAlpha) * this.smoothedGestureConfidence;

    // 3. Find dominant face expression in buffer
    const faceCounts = new Map<FaceExpression, number>();
    for (const f of this.faceHistory) {
      faceCounts.set(f, (faceCounts.get(f) || 0) + 1);
    }
    let dominantFace = this.currentFace;
    let maxFaceCount = 0;
    faceCounts.forEach((count, f) => {
      if (count > maxFaceCount) {
        maxFaceCount = count;
        dominantFace = f;
      }
    });

    const faceThreshold = Math.ceil(this.faceHistory.length * this.minDominanceThreshold);
    let faceChanged = false;
    if (dominantFace !== this.currentFace && maxFaceCount >= faceThreshold) {
      this.currentFace = dominantFace;
      faceChanged = true;
    }

    // 4. Find dominant gesture in buffer
    const gestureCounts = new Map<HandGesture, number>();
    for (const g of this.gestureHistory) {
      gestureCounts.set(g, (gestureCounts.get(g) || 0) + 1);
    }
    let dominantGesture = this.currentGesture;
    let maxGestureCount = 0;
    gestureCounts.forEach((count, g) => {
      if (count > maxGestureCount) {
        maxGestureCount = count;
        dominantGesture = g;
      }
    });

    const gestureThreshold = Math.ceil(this.gestureHistory.length * this.minDominanceThreshold);
    let gestureChanged = false;
    if (dominantGesture !== this.currentGesture && maxGestureCount >= gestureThreshold) {
      this.currentGesture = dominantGesture;
      gestureChanged = true;
    }

    const hasStateChanged = faceChanged || gestureChanged;
    const now = Date.now();
    let isStableTrigger = false;

    // Trigger when changed to an expressive state and cooldown passed
    if (hasStateChanged && (now - this.lastTriggerTime > this.cooldownMs)) {
      if (this.currentFace !== 'none' || this.currentGesture !== 'none') {
        isStableTrigger = true;
        this.lastTriggerTime = now;
      }
    }

    return {
      face: this.currentFace,
      faceConfidence: Math.round(this.smoothedFaceConfidence * 100) / 100,
      gesture: this.currentGesture,
      gestureConfidence: Math.round(this.smoothedGestureConfidence * 100) / 100,
      hasStateChanged,
      isStableTrigger
    };
  }

  public reset() {
    this.faceHistory = [];
    this.gestureHistory = [];
    this.currentFace = 'neutral';
    this.currentGesture = 'none';
    this.smoothedFaceConfidence = 0.8;
    this.smoothedGestureConfidence = 0.8;
    this.lastTriggerTime = 0;
  }
}
