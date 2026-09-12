export type FaceExpression = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'fearful'
  | 'disgusted'
  | 'confused'
  | 'laughing'
  | 'none';

export type HandGesture = 
  | 'thumbs_up'
  | 'thumbs_down'
  | 'peace'
  | 'wave'
  | 'open_palm'
  | 'ok'
  | 'fist'
  | 'pointing_up'
  | 'pointing_right'
  | 'pointing_left'
  | 'crossed_fingers'
  | 'heart_hands'
  | 'none';

export interface FaceDetectionResult {
  expression: FaceExpression;
  confidence: number; // 0 to 1
  label: string;
  emoji: string;
  boundingBox?: {
    xMin: number;
    yMin: number;
    width: number;
    height: number;
  };
  landmarks?: { x: number; y: number; z?: number }[];
  multipleFacesDetected?: boolean;
}

export interface HandDetectionResult {
  gesture: HandGesture;
  confidence: number; // 0 to 1
  label: string;
  emoji: string;
  landmarks?: { x: number; y: number; z?: number }[];
  handedness?: 'Left' | 'Right';
}

export interface InterpretationResult {
  id: string;
  expression: FaceExpression;
  gesture: HandGesture;
  expressionEmoji: string;
  gestureEmoji: string;
  comboEmoji: string;
  message: string;
  category: string;
  confidence: number;
  timestamp: number;
  isCustom?: boolean;
}

export interface HistoryItem {
  id: string;
  expression: FaceExpression;
  gesture: HandGesture;
  expressionEmoji: string;
  gestureEmoji: string;
  comboEmoji: string;
  expressionLabel: string;
  gestureLabel: string;
  message: string;
  confidence: number;
  timestamp: number;
  formattedTime: string;
}

export interface CustomMapping {
  id: string;
  expression: FaceExpression;
  gesture: HandGesture;
  emoji: string;
  message: string;
  category: string;
  createdAt: number;
}

export type ActiveTab = 'home' | 'try' | 'library' | 'history' | 'custom' | 'about' | 'privacy';

export interface CameraSettings {
  mirror: boolean;
  facingMode: 'user' | 'environment';
  deviceId?: string;
  detectFace: boolean;
  detectHand: boolean;
  simulationMode: boolean;
  soundEnabled: boolean;
  ttsEnabled: boolean;
}
