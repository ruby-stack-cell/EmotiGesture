import { HandGesture, HandDetectionResult } from '../types';
import { Landmark3D } from './faceClassifier';

export interface HandVelocityHistory {
  wristXHistory: number[];
  lastTimestamp: number;
}

// Global velocity buffer for wave detection
const velocityState: HandVelocityHistory = {
  wristXHistory: [],
  lastTimestamp: 0
};

function dist(p1: Landmark3D, p2: Landmark3D): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function classifyHand(
  allHandsLandmarks?: Landmark3D[][],
  mediapipeGestureCategory?: string,
  mediapipeScore?: number,
  handedness: 'Left' | 'Right' = 'Right'
): HandDetectionResult {
  if (!allHandsLandmarks || allHandsLandmarks.length === 0) {
    // Reset wave history when hand disappears
    velocityState.wristXHistory = [];
    return {
      gesture: 'none',
      confidence: 0,
      label: 'No Hand Detected',
      emoji: '✋'
    };
  }

  // Check for two-handed Heart Hands first
  if (allHandsLandmarks.length >= 2) {
    const hand1 = allHandsLandmarks[0];
    const hand2 = allHandsLandmarks[1];
    if (hand1.length >= 21 && hand2.length >= 21) {
      const h1Thumb = hand1[4];
      const h2Thumb = hand2[4];
      const h1Index = hand1[8];
      const h2Index = hand2[8];

      const thumbsDist = dist(h1Thumb, h2Thumb);
      const indexDist = dist(h1Index, h2Index);

      if (thumbsDist < 0.12 && indexDist < 0.15) {
        return {
          gesture: 'heart_hands',
          confidence: 0.94,
          label: 'Heart Hands',
          emoji: '🫶',
          landmarks: hand1,
          handedness
        };
      }
    }
  }

  const landmarks = allHandsLandmarks[0];
  if (landmarks.length < 21) {
    return {
      gesture: 'none',
      confidence: 0,
      label: 'Partial Hand',
      emoji: '✋'
    };
  }

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];

  const indexTip = landmarks[8];
  const indexPIP = landmarks[6];
  const indexMCP = landmarks[5];

  const middleTip = landmarks[12];
  const middlePIP = landmarks[10];
  const middleMCP = landmarks[9];

  const ringTip = landmarks[16];
  const ringPIP = landmarks[14];

  const pinkyTip = landmarks[20];
  const pinkyPIP = landmarks[18];

  // Palm scale reference (wrist to middle MCP)
  const palmScale = Math.max(0.08, dist(wrist, middleMCP));

  // Determine if fingers are extended or curled
  // A finger is extended if tip is farther from wrist than PIP joint
  const isIndexExtended = dist(indexTip, wrist) > dist(indexPIP, wrist) * 1.15 && indexTip.y < indexPIP.y + 0.05;
  const isMiddleExtended = dist(middleTip, wrist) > dist(middlePIP, wrist) * 1.15 && middleTip.y < middlePIP.y + 0.05;
  const isRingExtended = dist(ringTip, wrist) > dist(ringPIP, wrist) * 1.15 && ringTip.y < ringPIP.y + 0.05;
  const isPinkyExtended = dist(pinkyTip, wrist) > dist(pinkyPIP, wrist) * 1.15 && pinkyTip.y < pinkyPIP.y + 0.05;

  // Track wrist horizontal movement for Wave detection
  const now = performance.now();
  if (now - velocityState.lastTimestamp > 40) {
    velocityState.wristXHistory.push(wrist.x);
    if (velocityState.wristXHistory.length > 15) {
      velocityState.wristXHistory.shift();
    }
    velocityState.lastTimestamp = now;
  }

  let isWaving = false;
  if (velocityState.wristXHistory.length >= 8) {
    let directionChanges = 0;
    for (let i = 2; i < velocityState.wristXHistory.length; i++) {
      const d1 = velocityState.wristXHistory[i - 1] - velocityState.wristXHistory[i - 2];
      const d2 = velocityState.wristXHistory[i] - velocityState.wristXHistory[i - 1];
      if ((d1 > 0.008 && d2 < -0.008) || (d1 < -0.008 && d2 > 0.008)) {
        directionChanges++;
      }
    }
    if (directionChanges >= 2) {
      isWaving = true;
    }
  }

  // Candidate evaluation
  let detectedGesture: HandGesture = 'none';
  let confidence = 0.85;

  // 1. Check OK Sign: Thumb tip & Index tip very close, middle/ring/pinky extended
  const thumbIndexTipDist = dist(thumbTip, indexTip) / palmScale;
  if (thumbIndexTipDist < 0.45 && isMiddleExtended && isRingExtended) {
    detectedGesture = 'ok';
    confidence = Math.min(0.97, 0.75 + (0.45 - thumbIndexTipDist) * 0.8);
  }
  // 2. Check Crossed Fingers: Index & middle extended and crossing coordinates
  else if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    const fingerCrossDist = dist(indexTip, middleTip) / palmScale;
    // Check if tips cross each other horizontally relative to MCPs
    const mcpDX = middleMCP.x - indexMCP.x;
    const tipDX = middleTip.x - indexTip.x;
    if (fingerCrossDist < 0.35 && ((mcpDX > 0 && tipDX < 0) || (mcpDX < 0 && tipDX > 0))) {
      detectedGesture = 'crossed_fingers';
      confidence = 0.93;
    } else {
      // 3. Peace / V sign: Index & middle extended and separated
      detectedGesture = 'peace';
      confidence = 0.96;
    }
  }
  // 4. Check Fist: All 4 main fingers curled tight
  else if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    // Check Thumbs Up / Thumbs Down vs Closed Fist
    const isThumbVerticalUp = thumbTip.y < thumbIP.y && thumbTip.y < wrist.y - palmScale * 0.4;
    const isThumbVerticalDown = thumbTip.y > thumbIP.y && thumbTip.y > wrist.y + palmScale * 0.4;

    if (isThumbVerticalUp) {
      detectedGesture = 'thumbs_up';
      confidence = 0.97;
    } else if (isThumbVerticalDown) {
      detectedGesture = 'thumbs_down';
      confidence = 0.95;
    } else {
      detectedGesture = 'fist';
      confidence = 0.95;
    }
  }
  // 5. Check Pointing: Index extended, middle/ring/pinky curled
  else if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    const dx = indexTip.x - indexMCP.x;
    const dy = indexTip.y - indexMCP.y;

    if (Math.abs(dy) > Math.abs(dx) * 1.3 && dy < 0) {
      detectedGesture = 'pointing_up';
      confidence = 0.96;
    } else if (dx > 0.08) {
      detectedGesture = 'pointing_right';
      confidence = 0.94;
    } else if (dx < -0.08) {
      detectedGesture = 'pointing_left';
      confidence = 0.94;
    } else {
      detectedGesture = 'pointing_up';
      confidence = 0.88;
    }
  }
  // 6. Check Open Palm vs Wave
  else if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
    if (isWaving) {
      detectedGesture = 'wave';
      confidence = 0.94;
    } else {
      detectedGesture = 'open_palm';
      confidence = 0.96;
    }
  }
  // 7. Single hand finger heart gesture: Thumb tip near index PIP/tip with other fingers curled
  else if (!isRingExtended && !isPinkyExtended && dist(thumbTip, indexTip) / palmScale < 0.4) {
    detectedGesture = 'heart_hands';
    confidence = 0.90;
  }
  // Fallback check against MediaPipe gesture recognizer if available
  else if (mediapipeGestureCategory) {
    switch (mediapipeGestureCategory) {
      case 'Thumb_Up':
        detectedGesture = 'thumbs_up';
        confidence = mediapipeScore || 0.95;
        break;
      case 'Thumb_Down':
        detectedGesture = 'thumbs_down';
        confidence = mediapipeScore || 0.95;
        break;
      case 'Victory':
        detectedGesture = 'peace';
        confidence = mediapipeScore || 0.95;
        break;
      case 'Open_Palm':
        detectedGesture = isWaving ? 'wave' : 'open_palm';
        confidence = mediapipeScore || 0.95;
        break;
      case 'Closed_Fist':
        detectedGesture = 'fist';
        confidence = mediapipeScore || 0.95;
        break;
      case 'Pointing_Up':
        detectedGesture = 'pointing_up';
        confidence = mediapipeScore || 0.95;
        break;
      case 'ILoveYou':
        detectedGesture = 'heart_hands';
        confidence = mediapipeScore || 0.92;
        break;
      default:
        detectedGesture = 'open_palm';
        confidence = 0.70;
    }
  }

  const meta: Record<HandGesture, { label: string; emoji: string }> = {
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
    none: { label: 'No Gesture', emoji: '✋' }
  };

  return {
    gesture: detectedGesture,
    confidence: Math.round(confidence * 100) / 100,
    label: meta[detectedGesture].label,
    emoji: meta[detectedGesture].emoji,
    landmarks,
    handedness
  };
}
