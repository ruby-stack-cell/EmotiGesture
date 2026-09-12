import { HistoryItem, FaceExpression, HandGesture } from '../types';

const STORAGE_KEY = 'emotigesture_history';
const MAX_HISTORY = 40;

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Provide an initial sample history item for immediate visual reference
      const initial: HistoryItem[] = [
        {
          id: 'hist_sample_1',
          expression: 'happy',
          gesture: 'thumbs_up',
          expressionEmoji: '😊',
          gestureEmoji: '👍',
          comboEmoji: '😊👍',
          expressionLabel: 'Happy',
          gestureLabel: 'Thumbs Up',
          message: "I'm feeling great!",
          confidence: 0.96,
          timestamp: Date.now() - 120000,
          formattedTime: formatTime(Date.now() - 120000)
        },
        {
          id: 'hist_sample_2',
          expression: 'surprised',
          gesture: 'open_palm',
          expressionEmoji: '😮',
          gestureEmoji: '✋',
          comboEmoji: '😮✋',
          expressionLabel: 'Surprised',
          gestureLabel: 'Open Palm',
          message: 'Wow! Wait!',
          confidence: 0.94,
          timestamp: Date.now() - 240000,
          formattedTime: formatTime(Date.now() - 240000)
        },
        {
          id: 'hist_sample_3',
          expression: 'laughing',
          gesture: 'wave',
          expressionEmoji: '😂',
          gestureEmoji: '👋',
          comboEmoji: '😂👋',
          expressionLabel: 'Laughing',
          gestureLabel: 'Wave',
          message: "That's hilarious!",
          confidence: 0.95,
          timestamp: Date.now() - 360000,
          formattedTime: formatTime(Date.now() - 360000)
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addHistoryItem(
  expression: FaceExpression,
  gesture: HandGesture,
  expressionEmoji: string,
  gestureEmoji: string,
  comboEmoji: string,
  expressionLabel: string,
  gestureLabel: string,
  message: string,
  confidence: number
): HistoryItem[] {
  const current = getHistory();
  const timestamp = Date.now();

  // Don't add duplicate if message is identical to the most recent item within 4 seconds
  if (current.length > 0 && current[0].message === message && timestamp - current[0].timestamp < 4000) {
    return current;
  }

  const newItem: HistoryItem = {
    id: `item_${timestamp}_${Math.random().toString(36).substr(2, 4)}`,
    expression,
    gesture,
    expressionEmoji,
    gestureEmoji,
    comboEmoji,
    expressionLabel,
    gestureLabel,
    message,
    confidence,
    timestamp,
    formattedTime: formatTime(timestamp)
  };

  const updated = [newItem, ...current].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to write history to localStorage', err);
  }
  return updated;
}

export function clearHistory(): HistoryItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return [];
}
