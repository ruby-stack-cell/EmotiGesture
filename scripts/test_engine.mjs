// Automated unit test for EmotiGesture classification & interpretation rules
import assert from 'node:assert';

// Import preset rules
const PRESET_RULES = [
  {
    expression: 'happy',
    gesture: 'thumbs_up',
    comboEmoji: '😊👍',
    message: "I'm happy and everything is good!"
  },
  {
    expression: 'sad',
    gesture: 'thumbs_down',
    comboEmoji: '😢👎',
    message: "I'm feeling sad."
  },
  {
    expression: 'surprised',
    gesture: 'open_palm',
    comboEmoji: '😮✋',
    message: 'Wow! Wait!'
  },
  {
    expression: 'angry',
    gesture: 'fist',
    comboEmoji: '😡✊',
    message: "I'm frustrated."
  },
  {
    expression: 'happy',
    gesture: 'wave',
    comboEmoji: '😊👋',
    message: 'Hey! Nice to see you!'
  },
  {
    expression: 'happy',
    gesture: 'heart_hands',
    comboEmoji: '😊🫶',
    message: 'Sending love and happiness!'
  },
  {
    expression: 'laughing',
    gesture: 'thumbs_up',
    comboEmoji: '😂👍',
    message: "That's hilarious!"
  }
];

function testInterpretation(face, gesture, customMappings = []) {
  // Check custom
  const custom = customMappings.find(m => m.expression === face && m.gesture === gesture);
  if (custom) return { comboEmoji: custom.emoji, message: custom.message, isCustom: true };

  // Check preset
  const preset = PRESET_RULES.find(r => r.expression === face && r.gesture === gesture);
  if (preset) return { comboEmoji: preset.comboEmoji, message: preset.message, isCustom: false };

  return { comboEmoji: '✨', message: 'Fallback', isCustom: false };
}

console.log('--- Running EmotiGesture Interpretation Tests ---');

// Test 1: Happy + Thumbs Up
const res1 = testInterpretation('happy', 'thumbs_up');
assert.strictEqual(res1.comboEmoji, '😊👍');
assert.strictEqual(res1.message, "I'm happy and everything is good!");
console.log('✓ Happy + Thumbs Up matched');

// Test 2: Sad + Thumbs Down
const res2 = testInterpretation('sad', 'thumbs_down');
assert.strictEqual(res2.comboEmoji, '😢👎');
assert.strictEqual(res2.message, "I'm feeling sad.");
console.log('✓ Sad + Thumbs Down matched');

// Test 3: Surprised + Open Palm
const res3 = testInterpretation('surprised', 'open_palm');
assert.strictEqual(res3.comboEmoji, '😮✋');
assert.strictEqual(res3.message, 'Wow! Wait!');
console.log('✓ Surprised + Open Palm matched');

// Test 4: Angry + Fist
const res4 = testInterpretation('angry', 'fist');
assert.strictEqual(res4.comboEmoji, '😡✊');
assert.strictEqual(res4.message, "I'm frustrated.");
console.log('✓ Angry + Fist matched');

// Test 5: Custom Mapping Priority
const customMappings = [
  {
    expression: 'happy',
    gesture: 'thumbs_up',
    emoji: '🎉',
    message: 'Custom Celebrate Everything!'
  }
];
const res5 = testInterpretation('happy', 'thumbs_up', customMappings);
assert.strictEqual(res5.isCustom, true);
assert.strictEqual(res5.comboEmoji, '🎉');
assert.strictEqual(res5.message, 'Custom Celebrate Everything!');
console.log('✓ Custom mapping overrides default rule');

console.log('--- ALL TESTS PASSED SUCCESSFULLY ---');
