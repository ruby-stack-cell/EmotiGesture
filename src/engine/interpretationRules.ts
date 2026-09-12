import { FaceExpression, HandGesture, InterpretationResult, CustomMapping } from '../types';

export interface RuleDefinition {
  id: string;
  expression: FaceExpression;
  gesture: HandGesture;
  expressionEmoji: string;
  gestureEmoji: string;
  comboEmoji: string;
  message: string;
  category: string;
}

// Preset mapping rules
export const PRESET_RULES: RuleDefinition[] = [
  // Happy & Agreement
  {
    id: 'happy_thumbs_up',
    expression: 'happy',
    gesture: 'thumbs_up',
    expressionEmoji: '😊',
    gestureEmoji: '👍',
    comboEmoji: '😊👍',
    message: "I'm happy and everything is good!",
    category: 'Agreement'
  },
  {
    id: 'happy_wave',
    expression: 'happy',
    gesture: 'wave',
    expressionEmoji: '😊',
    gestureEmoji: '👋',
    comboEmoji: '😊👋',
    message: 'Hey! Nice to see you!',
    category: 'Greetings'
  },
  {
    id: 'happy_peace',
    expression: 'happy',
    gesture: 'peace',
    expressionEmoji: '😊',
    gestureEmoji: '✌️',
    comboEmoji: '😊✌️',
    message: 'Spreading joy and peace!',
    category: 'Happy'
  },
  {
    id: 'happy_heart_hands',
    expression: 'happy',
    gesture: 'heart_hands',
    expressionEmoji: '❤️',
    gestureEmoji: '🫶',
    comboEmoji: '❤️🫶',
    message: 'Love you!',
    category: 'Love'
  },
  {
    id: 'happy_heart_hands_alt',
    expression: 'happy',
    gesture: 'heart_hands',
    expressionEmoji: '😊',
    gestureEmoji: '🫶',
    comboEmoji: '😊🫶',
    message: 'Sending love!',
    category: 'Love'
  },
  {
    id: 'happy_thumbs_up_great',
    expression: 'happy',
    gesture: 'thumbs_up',
    expressionEmoji: '😊',
    gestureEmoji: '👍',
    comboEmoji: '😊👍',
    message: "I'm feeling great!",
    category: 'Happy'
  },
  {
    id: 'happy_ok',
    expression: 'happy',
    gesture: 'ok',
    expressionEmoji: '😊',
    gestureEmoji: '👌',
    comboEmoji: '😊👌',
    message: "Everything is wonderful and on point!",
    category: 'Agreement'
  },

  // Laughing & Fun
  {
    id: 'laughing_thumbs_up',
    expression: 'laughing',
    gesture: 'thumbs_up',
    expressionEmoji: '😂',
    gestureEmoji: '👍',
    comboEmoji: '😂👍',
    message: "That's hilarious!",
    category: 'Reactions'
  },
  {
    id: 'laughing_peace',
    expression: 'laughing',
    gesture: 'peace',
    expressionEmoji: '😂',
    gestureEmoji: '✌️',
    comboEmoji: '😂✌️',
    message: "Living my best life laughing!",
    category: 'Happy'
  },
  {
    id: 'laughing_wave',
    expression: 'laughing',
    gesture: 'wave',
    expressionEmoji: '😂',
    gestureEmoji: '👋',
    comboEmoji: '😂👋',
    message: "Haha, stop it! You're cracking me up!",
    category: 'Reactions'
  },

  // Sad & Support
  {
    id: 'sad_thumbs_down',
    expression: 'sad',
    gesture: 'thumbs_down',
    expressionEmoji: '😢',
    gestureEmoji: '👎',
    comboEmoji: '😢👎',
    message: "I'm feeling sad.",
    category: 'Sad'
  },
  {
    id: 'sad_open_palm',
    expression: 'sad',
    gesture: 'open_palm',
    expressionEmoji: '😢',
    gestureEmoji: '✋',
    comboEmoji: '😢✋',
    message: 'I need some support.',
    category: 'Sad'
  },
  {
    id: 'sad_fist',
    expression: 'sad',
    gesture: 'fist',
    expressionEmoji: '😢',
    gestureEmoji: '✊',
    comboEmoji: '😢✊',
    message: 'Trying to stay strong despite everything.',
    category: 'Sad'
  },
  {
    id: 'sad_heart_hands',
    expression: 'sad',
    gesture: 'heart_hands',
    expressionEmoji: '😢',
    gestureEmoji: '🫶',
    comboEmoji: '😢🫶',
    message: 'Could really use some love right now.',
    category: 'Love'
  },

  // Angry & Frustration
  {
    id: 'angry_fist',
    expression: 'angry',
    gesture: 'fist',
    expressionEmoji: '😡',
    gestureEmoji: '✊',
    comboEmoji: '😡✊',
    message: "I'm frustrated.",
    category: 'Frustration'
  },
  {
    id: 'angry_thumbs_down',
    expression: 'angry',
    gesture: 'thumbs_down',
    expressionEmoji: '😡',
    gestureEmoji: '👎',
    comboEmoji: '😡👎',
    message: 'I completely disagree with this!',
    category: 'Disagreement'
  },
  {
    id: 'angry_open_palm',
    expression: 'angry',
    gesture: 'open_palm',
    expressionEmoji: '😡',
    gestureEmoji: '✋',
    comboEmoji: '😡✋',
    message: 'Stop right there!',
    category: 'Frustration'
  },

  // Surprised & Reactions
  {
    id: 'surprised_open_palm',
    expression: 'surprised',
    gesture: 'open_palm',
    expressionEmoji: '😮',
    gestureEmoji: '✋',
    comboEmoji: '😮✋',
    message: 'Wow! Wait!',
    category: 'Surprise'
  },
  {
    id: 'surprised_peace',
    expression: 'surprised',
    gesture: 'peace',
    expressionEmoji: '😮',
    gestureEmoji: '✌️',
    comboEmoji: '😲✌️',
    message: 'Amazing!',
    category: 'Surprise'
  },
  {
    id: 'surprised_pointing_right',
    expression: 'surprised',
    gesture: 'pointing_right',
    expressionEmoji: '😮',
    gestureEmoji: '👉',
    comboEmoji: '😮👉',
    message: 'Look at that!',
    category: 'Surprise'
  },
  {
    id: 'surprised_pointing_left',
    expression: 'surprised',
    gesture: 'pointing_left',
    expressionEmoji: '😮',
    gestureEmoji: '👈',
    comboEmoji: '😮👈',
    message: 'Did you see that over there?!',
    category: 'Surprise'
  },
  {
    id: 'surprised_pointing_up',
    expression: 'surprised',
    gesture: 'pointing_up',
    expressionEmoji: '😮',
    gestureEmoji: '☝️',
    comboEmoji: '😮☝️',
    message: 'Check that out above!',
    category: 'Surprise'
  },

  // Confused & Questions
  {
    id: 'confused_open_palm',
    expression: 'confused',
    gesture: 'open_palm',
    expressionEmoji: '😕',
    gestureEmoji: '🤷',
    comboEmoji: '😕🤷',
    message: "I'm confused.",
    category: 'Confusion'
  },
  {
    id: 'confused_open_palm_wait',
    expression: 'confused',
    gesture: 'open_palm',
    expressionEmoji: '😕',
    gestureEmoji: '✋',
    comboEmoji: '😕✋',
    message: "Wait, I don't understand.",
    category: 'Confusion'
  },
  {
    id: 'confused_thumbs_down',
    expression: 'confused',
    gesture: 'thumbs_down',
    expressionEmoji: '😕',
    gestureEmoji: '👎',
    comboEmoji: '😕👎',
    message: "This doesn't seem right to me.",
    category: 'Confusion'
  },
  {
    id: 'confused_pointing_up',
    expression: 'confused',
    gesture: 'pointing_up',
    expressionEmoji: '😕',
    gestureEmoji: '☝️',
    comboEmoji: '😕☝️',
    message: 'Can someone clarify this point?',
    category: 'Confusion'
  },

  // Neutral & Agreement
  {
    id: 'neutral_thumbs_up_control',
    expression: 'neutral',
    gesture: 'thumbs_up',
    expressionEmoji: '😎',
    gestureEmoji: '👍',
    comboEmoji: '😎👍',
    message: "Everything's under control.",
    category: 'Agreement'
  },
  {
    id: 'neutral_thumbs_up',
    expression: 'neutral',
    gesture: 'thumbs_up',
    expressionEmoji: '😐',
    gestureEmoji: '👍',
    comboEmoji: '😐👍',
    message: 'Sounds good.',
    category: 'Agreement'
  },
  {
    id: 'neutral_wave',
    expression: 'neutral',
    gesture: 'wave',
    expressionEmoji: '😐',
    gestureEmoji: '👋',
    comboEmoji: '🙂👋',
    message: 'Hello!',
    category: 'Greetings'
  },
  {
    id: 'neutral_peace',
    expression: 'neutral',
    gesture: 'peace',
    expressionEmoji: '😐',
    gestureEmoji: '✌️',
    comboEmoji: '✌️',
    message: 'Peace.',
    category: 'Greetings'
  },
  {
    id: 'neutral_ok',
    expression: 'neutral',
    gesture: 'ok',
    expressionEmoji: '😐',
    gestureEmoji: '👌',
    comboEmoji: '👌',
    message: 'Acknowledged and confirmed.',
    category: 'Agreement'
  },

  // Fearful & Disgusted
  {
    id: 'fearful_open_palm',
    expression: 'fearful',
    gesture: 'open_palm',
    expressionEmoji: '😨',
    gestureEmoji: '✋',
    comboEmoji: '😨✋',
    message: 'Back off! That scares me.',
    category: 'Reactions'
  },
  {
    id: 'disgusted_thumbs_down',
    expression: 'disgusted',
    gesture: 'thumbs_down',
    expressionEmoji: '🤢',
    gestureEmoji: '👎',
    comboEmoji: '🤢👎',
    message: "Gross! Definitely not for me.",
    category: 'Disagreement'
  },

  // Hope & Crossed fingers
  {
    id: 'happy_crossed_fingers',
    expression: 'happy',
    gesture: 'crossed_fingers',
    expressionEmoji: '😊',
    gestureEmoji: '🤞',
    comboEmoji: '😊🤞',
    message: 'Wishing for the best outcome!',
    category: 'Happy'
  }
];

// Fallback single-channel mappings
export const FACE_FALLBACKS: Record<FaceExpression, { emoji: string; message: string }> = {
  happy: { emoji: '😊', message: "I'm feeling happy!" },
  laughing: { emoji: '😂', message: "That's so hilarious!" },
  sad: { emoji: '😢', message: "I'm feeling down today." },
  angry: { emoji: '😡', message: "I'm feeling quite upset." },
  surprised: { emoji: '😮', message: "Whoa, that's surprising!" },
  fearful: { emoji: '😨', message: "That's terrifying!" },
  disgusted: { emoji: '🤢', message: "Ugh, no thanks!" },
  confused: { emoji: '😕', message: "I'm a bit confused." },
  neutral: { emoji: '😐', message: "Focused and ready." },
  none: { emoji: '👤', message: "Waiting for detection..." }
};

export const GESTURE_FALLBACKS: Record<HandGesture, { emoji: string; message: string }> = {
  thumbs_up: { emoji: '👍', message: 'Everything looks great!' },
  thumbs_down: { emoji: '👎', message: 'Not feeling this.' },
  peace: { emoji: '✌️', message: 'Peace and harmony!' },
  wave: { emoji: '👋', message: 'Hello there!' },
  open_palm: { emoji: '✋', message: 'Hold on a second.' },
  ok: { emoji: '👌', message: 'Everything is A-OK!' },
  fist: { emoji: '✊', message: 'Stay determined and strong!' },
  pointing_up: { emoji: '☝️', message: 'Look up here!' },
  pointing_right: { emoji: '👉', message: 'Check this out on the right.' },
  pointing_left: { emoji: '👈', message: 'Take a look on the left.' },
  crossed_fingers: { emoji: '🤞', message: 'Fingers crossed for good luck!' },
  heart_hands: { emoji: '🫶', message: 'Sending you big love!' },
  none: { emoji: '✋', message: '' }
};

/**
 * Resolves combined interpretation given face and gesture, checking custom user mappings first.
 */
export function interpret(
  face: FaceExpression,
  gesture: HandGesture,
  customMappings: CustomMapping[] = [],
  confidence = 0.9
): InterpretationResult {
  const timestamp = Date.now();

  // 1. Check custom user mappings first (priority)
  const custom = customMappings.find(
    (m) => m.expression === face && m.gesture === gesture
  );
  if (custom) {
    return {
      id: `custom_${custom.id}_${timestamp}`,
      expression: face,
      gesture: gesture,
      expressionEmoji: FACE_FALLBACKS[face]?.emoji || '😊',
      gestureEmoji: GESTURE_FALLBACKS[gesture]?.emoji || '👍',
      comboEmoji: custom.emoji,
      message: custom.message,
      category: custom.category,
      confidence,
      timestamp,
      isCustom: true
    };
  }

  // 2. Check preset dual combination rules
  const preset = PRESET_RULES.find(
    (r) => r.expression === face && r.gesture === gesture
  );
  if (preset) {
    return {
      id: `${preset.id}_${timestamp}`,
      expression: face,
      gesture: gesture,
      expressionEmoji: preset.expressionEmoji,
      gestureEmoji: preset.gestureEmoji,
      comboEmoji: preset.comboEmoji,
      message: preset.message,
      category: preset.category,
      confidence,
      timestamp
    };
  }

  // 3. Fallback: If gesture is active but no combo matches
  if (gesture !== 'none') {
    const gMeta = GESTURE_FALLBACKS[gesture] || { emoji: '✋', message: '' };
    const fMeta = FACE_FALLBACKS[face] || { emoji: '😐', message: '' };
    return {
      id: `fallback_${gesture}_${timestamp}`,
      expression: face,
      gesture: gesture,
      expressionEmoji: fMeta.emoji,
      gestureEmoji: gMeta.emoji,
      comboEmoji: `${fMeta.emoji} ${gMeta.emoji}`,
      message: gMeta.message || fMeta.message,
      category: 'Reactions',
      confidence,
      timestamp
    };
  }

  // 4. Fallback: If only face is detected
  const fMeta = FACE_FALLBACKS[face] || { emoji: '😐', message: 'Focused and ready.' };
  return {
    id: `face_${face}_${timestamp}`,
    expression: face,
    gesture: 'none',
    expressionEmoji: fMeta.emoji,
    gestureEmoji: '',
    comboEmoji: fMeta.emoji,
    message: fMeta.message,
    category: 'Reactions',
    confidence,
    timestamp
  };
}
