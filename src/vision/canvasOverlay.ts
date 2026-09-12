import { FaceDetectionResult, HandDetectionResult } from '../types';

export interface OverlayOptions {
  showFace: boolean;
  showHand: boolean;
  mirror: boolean;
}

// MediaPipe Hand connections
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [9, 10], [10, 11], [11, 12],
  // Ring
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm Knuckles
  [5, 9], [9, 13], [13, 17]
];

export function drawDetectionOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  face: FaceDetectionResult,
  hand: HandDetectionResult,
  options: OverlayOptions,
  fps = 30
) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // If mirrored, flip context horizontally for drawing so coordinates match the flipped video
  if (options.mirror) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }

  // 1. Draw Hand Skeleton & Landmarks
  if (options.showHand && hand.landmarks && hand.landmarks.length >= 21) {
    const pts = hand.landmarks.map(p => ({
      x: p.x * width,
      y: p.y * height
    }));

    // Draw skeletal bones
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const p1 = pts[startIdx];
      const p2 = pts[endIdx];
      if (!p1 || !p2) continue;

      const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      gradient.addColorStop(0, '#06b6d4');
      gradient.addColorStop(1, '#a855f7');
      ctx.strokeStyle = gradient;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Draw landmark joint nodes
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const isTip = [4, 8, 12, 16, 20].includes(i);
      ctx.beginPath();
      ctx.arc(p.x, p.y, isTip ? 6 : 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = isTip ? '#38bdf8' : '#e0e7ff';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw Hand Gesture tag near wrist
    if (hand.gesture !== 'none') {
      const wrist = pts[0];
      ctx.save();
      // Unmirror text if canvas is mirrored so text reads correctly
      if (options.mirror) {
        ctx.translate(wrist.x, wrist.y + 28);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(wrist.x, wrist.y + 28);
      }

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      const tagText = `${hand.emoji} ${hand.label} ${Math.round(hand.confidence * 100)}%`;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(tagText).width;

      ctx.beginPath();
      ctx.roundRect(-textWidth / 2 - 8, -14, textWidth + 16, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.fillText(tagText, 0, 2);
      ctx.restore();
    }
  }

  // 2. Draw Face Bounding Box & HUD
  if (options.showFace && face.boundingBox && face.expression !== 'none') {
    const bb = face.boundingBox;
    const x = bb.xMin * width;
    const y = bb.yMin * height;
    const w = bb.width * width;
    const h = bb.height * height;

    // Futuristic corner brackets
    const cornerLen = Math.min(28, w * 0.2);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 12;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(x, y + cornerLen);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerLen, y);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + w - cornerLen, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + cornerLen);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x, y + h - cornerLen);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + cornerLen, y + h);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + w - cornerLen, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h - cornerLen);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Face tag above box
    ctx.save();
    if (options.mirror) {
      ctx.translate(x + w / 2, Math.max(26, y - 12));
      ctx.scale(-1, 1);
    } else {
      ctx.translate(x + w / 2, Math.max(26, y - 12));
    }

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    const faceText = `${face.emoji} ${face.label} ${Math.round(face.confidence * 100)}%`;
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    const textWidth = ctx.measureText(faceText).width;

    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - 8, -14, textWidth + 16, 24, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e9d5ff';
    ctx.textAlign = 'center';
    ctx.fillText(faceText, 0, 2);
    ctx.restore();
  }

  // Restore orientation for non-mirrored UI overlays (HUD, warnings)
  ctx.restore();

  // 3. Multi-face Warning Banner
  if (face.multipleFacesDetected) {
    ctx.save();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    const warningText = '⚠️ Multiple faces detected! Please ensure only one person is in the frame.';
    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    const tw = ctx.measureText(warningText).width;
    const wx = (width - tw - 24) / 2;

    ctx.beginPath();
    ctx.roundRect(wx, 16, tw + 24, 30, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(warningText, width / 2, 35);
    ctx.restore();
  }

  // 4. Subtle HUD in bottom-left corner
  ctx.save();
  ctx.fillStyle = 'rgba(10, 13, 20, 0.7)';
  ctx.beginPath();
  ctx.roundRect(14, height - 36, 110, 24, 6);
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 11px "JetBrains Mono", monospace';
  ctx.fillText(`FPS: ${fps} | AI: ON`, 22, height - 20);
  ctx.restore();
}
