import { FaceExpression, FaceDetectionResult } from '../types';

export interface RawBlendshape {
  categoryName: string;
  score: number;
}

export interface Landmark3D {
  x: number;
  y: number;
  z?: number;
}

/**
 * Classifies facial emotion from MediaPipe blendshapes or 478 face landmarks.
 */
export function classifyFace(
  blendshapes?: RawBlendshape[],
  landmarks?: Landmark3D[],
  numFacesDetected = 1
): FaceDetectionResult {
  if (!landmarks || landmarks.length === 0) {
    return {
      expression: 'none',
      confidence: 0,
      label: 'No Face Detected',
      emoji: '👤',
      multipleFacesDetected: numFacesDetected > 1
    };
  }

  // Calculate bounding box from landmarks
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const pt of landmarks) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  const boundingBox = {
    xMin: Math.max(0, minX),
    yMin: Math.max(0, minY),
    width: Math.min(1, maxX - minX),
    height: Math.min(1, maxY - minY)
  };

  // Convert blendshapes array to a quick lookup map if present
  const bsMap: Record<string, number> = {};
  if (blendshapes && blendshapes.length > 0) {
    for (const bs of blendshapes) {
      bsMap[bs.categoryName] = bs.score;
    }
  }

  // Expression candidate scores
  const scores: Record<FaceExpression, number> = {
    none: 0,
    neutral: 0.25, // default baseline
    happy: 0,
    laughing: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    fearful: 0,
    disgusted: 0,
    confused: 0
  };

  const hasBlendshapes = Object.keys(bsMap).length > 0;

  if (hasBlendshapes) {
    const smileL = bsMap['mouthSmileLeft'] || 0;
    const smileR = bsMap['mouthSmileRight'] || 0;
    const avgSmile = (smileL + smileR) / 2;

    const frownL = bsMap['mouthFrownLeft'] || 0;
    const frownR = bsMap['mouthFrownRight'] || 0;
    const avgFrown = (frownL + frownR) / 2;

    const jawOpen = bsMap['jawOpen'] || 0;
    const browDownL = bsMap['browDownLeft'] || 0;
    const browDownR = bsMap['browDownRight'] || 0;
    const avgBrowDown = (browDownL + browDownR) / 2;

    const browInnerUp = bsMap['browInnerUp'] || 0;
    const browOuterUpL = bsMap['browOuterUpLeft'] || 0;
    const browOuterUpR = bsMap['browOuterUpRight'] || 0;
    const avgBrowOuterUp = (browOuterUpL + browOuterUpR) / 2;

    const eyeWideL = bsMap['eyeWideLeft'] || 0;
    const eyeWideR = bsMap['eyeWideRight'] || 0;
    const avgEyeWide = (eyeWideL + eyeWideR) / 2;

    const eyeSquintL = bsMap['eyeSquintLeft'] || 0;
    const eyeSquintR = bsMap['eyeSquintRight'] || 0;
    const avgEyeSquint = (eyeSquintL + eyeSquintR) / 2;

    const noseSneerL = bsMap['noseSneerLeft'] || 0;
    const noseSneerR = bsMap['noseSneerRight'] || 0;
    const avgSneer = (noseSneerL + noseSneerR) / 2;

    // 1. Laughing: Big smile + jaw open + squint
    if (avgSmile > 0.55 && jawOpen > 0.35) {
      scores.laughing = Math.min(0.99, avgSmile * 0.6 + jawOpen * 0.4 + avgEyeSquint * 0.2);
    }

    // 2. Happy: Smiling mouth
    scores.happy = Math.min(0.98, avgSmile * 1.35);

    // 3. Surprised: High jaw open + wide eyes + raised brows
    const surpriseSignal = (jawOpen * 0.5 + avgBrowOuterUp * 0.3 + avgEyeWide * 0.2);
    if (surpriseSignal > 0.3) {
      scores.surprised = Math.min(0.98, surpriseSignal * 1.4);
    }

    // 4. Sad: Frowning mouth corners + inner brow raise
    const sadSignal = (avgFrown * 0.6 + browInnerUp * 0.4);
    if (sadSignal > 0.25) {
      scores.sad = Math.min(0.96, sadSignal * 1.5);
    }

    // 5. Angry: Brows pulled down + squint/narrowing
    const angrySignal = (avgBrowDown * 0.7 + (1 - avgSmile) * 0.3);
    if (avgBrowDown > 0.35 && avgSmile < 0.2) {
      scores.angry = Math.min(0.96, angrySignal * 1.3);
    }

    // 6. Fearful: Inner brow up + wide eyes + slight mouth stretch
    const fearSignal = (browInnerUp * 0.4 + avgEyeWide * 0.4 + (bsMap['mouthStretchLeft'] || 0) * 0.2);
    if (browInnerUp > 0.35 && avgEyeWide > 0.25 && avgSmile < 0.2) {
      scores.fearful = Math.min(0.95, fearSignal * 1.3);
    }

    // 7. Disgusted: Nose sneer + upper lip raise
    if (avgSneer > 0.25 || (bsMap['mouthShrugLower'] || 0) > 0.35) {
      scores.disgusted = Math.min(0.95, avgSneer * 1.5 + (bsMap['mouthShrugLower'] || 0) * 0.5);
    }

    // 8. Confused: Asymmetry between eyebrows or one brow raised while other is down
    const browAsymmetry = Math.abs(browOuterUpL - browOuterUpR) + Math.abs(browDownL - browDownR);
    if (browAsymmetry > 0.3 && avgSmile < 0.35) {
      scores.confused = Math.min(0.94, browAsymmetry * 1.3);
    }

    // 9. Neutral baseline
    const maxAffective = Math.max(
      scores.happy,
      scores.laughing,
      scores.sad,
      scores.angry,
      scores.surprised,
      scores.fearful,
      scores.disgusted,
      scores.confused
    );
    if (maxAffective < 0.45) {
      scores.neutral = 0.85 - maxAffective * 0.5;
    }
  } else if (landmarks.length >= 468) {
    // Landmark-based geometrical heuristic fallback
    // MediaPipe face landmark indexes:
    // Left mouth corner: 61, Right mouth corner: 291
    // Upper lip top: 0 / 13, Lower lip bottom: 14 / 17
    // Left eyebrow: 70, Right eyebrow: 300
    // Nose bridge: 168, Nose tip: 1
    // Left eye top/bottom: 159, 145; Right eye top/bottom: 386, 374
    const leftCorner = landmarks[61];
    const rightCorner = landmarks[291];
    const upperLip = landmarks[13];
    const lowerLip = landmarks[14];
    const leftBrow = landmarks[70];
    const rightBrow = landmarks[300];
    const noseBridge = landmarks[168];

    const mouthWidth = Math.hypot(rightCorner.x - leftCorner.x, rightCorner.y - leftCorner.y);
    const mouthOpen = Math.hypot(lowerLip.x - upperLip.x, lowerLip.y - upperLip.y);
    const mouthRatio = mouthOpen / (mouthWidth || 1);

    // Smile: mouth corners are higher (lower y) than center of lips
    const cornerAvgY = (leftCorner.y + rightCorner.y) / 2;
    const lipCenterY = (upperLip.y + lowerLip.y) / 2;
    const smileDelta = lipCenterY - cornerAvgY;

    if (smileDelta > 0.015) {
      if (mouthRatio > 0.35) {
        scores.laughing = Math.min(0.98, smileDelta * 20 + mouthRatio * 0.8);
      } else {
        scores.happy = Math.min(0.97, smileDelta * 25);
      }
    } else if (smileDelta < -0.01) {
      scores.sad = Math.min(0.95, Math.abs(smileDelta) * 25);
    }

    if (mouthRatio > 0.45) {
      scores.surprised = Math.min(0.97, mouthRatio * 1.5);
    }

    // Eyebrow asymmetry for confusion
    const browDiff = Math.abs((leftBrow.y - noseBridge.y) - (rightBrow.y - noseBridge.y));
    if (browDiff > 0.035) {
      scores.confused = Math.min(0.92, browDiff * 15);
    }

    const maxAffective = Math.max(
      scores.happy, scores.laughing, scores.sad, scores.angry,
      scores.surprised, scores.fearful, scores.disgusted, scores.confused
    );
    if (maxAffective < 0.45) {
      scores.neutral = 0.82;
    }
  }

  // Find dominant expression
  let dominant: FaceExpression = 'neutral';
  let maxScore = scores.neutral;

  const candidateExpressions: FaceExpression[] = [
    'laughing', 'happy', 'surprised', 'angry', 'sad', 'confused', 'disgusted', 'fearful', 'neutral'
  ];

  for (const exp of candidateExpressions) {
    if (scores[exp] > maxScore) {
      maxScore = scores[exp];
      dominant = exp;
    }
  }

  // Map to metadata
  const meta: Record<FaceExpression, { label: string; emoji: string }> = {
    neutral: { label: 'Neutral', emoji: '😐' },
    happy: { label: 'Happy', emoji: '😊' },
    laughing: { label: 'Laughing', emoji: '😂' },
    sad: { label: 'Sad', emoji: '😢' },
    angry: { label: 'Angry', emoji: '😡' },
    surprised: { label: 'Surprised', emoji: '😮' },
    fearful: { label: 'Fearful', emoji: '😨' },
    disgusted: { label: 'Disgusted', emoji: '🤢' },
    confused: { label: 'Confused', emoji: '😕' },
    none: { label: 'No Face', emoji: '👤' }
  };

  return {
    expression: dominant,
    confidence: Math.round(Math.min(0.99, Math.max(0.40, maxScore)) * 100) / 100,
    label: meta[dominant].label,
    emoji: meta[dominant].emoji,
    boundingBox,
    landmarks,
    multipleFacesDetected: numFacesDetected > 1
  };
}
