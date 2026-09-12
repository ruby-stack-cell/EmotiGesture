import { CustomMapping, FaceExpression, HandGesture } from '../types';

const STORAGE_KEY = 'emotigesture_custom_mappings';

const DEFAULT_CUSTOM_MAPPINGS: CustomMapping[] = [
  {
    id: 'custom_example_1',
    expression: 'happy',
    gesture: 'peace',
    emoji: '🎉',
    message: "Let's celebrate!",
    category: 'Happy',
    createdAt: Date.now() - 3600000
  },
  {
    id: 'custom_example_2',
    expression: 'happy',
    gesture: 'thumbs_up',
    emoji: '😎👍',
    message: 'Everything is completely under control!',
    category: 'Agreement',
    createdAt: Date.now() - 7200000
  }
];

export function getCustomMappings(): CustomMapping[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOM_MAPPINGS));
      return DEFAULT_CUSTOM_MAPPINGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CUSTOM_MAPPINGS;
  }
}

export function saveCustomMapping(
  expression: FaceExpression,
  gesture: HandGesture,
  emoji: string,
  message: string,
  category = 'Custom'
): CustomMapping[] {
  const current = getCustomMappings();
  // Filter out any existing mapping with same expression and gesture
  const filtered = current.filter(
    (m) => !(m.expression === expression && m.gesture === gesture)
  );

  const newMapping: CustomMapping = {
    id: `map_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    expression,
    gesture,
    emoji,
    message,
    category,
    createdAt: Date.now()
  };

  const updated = [newMapping, ...filtered];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
  return updated;
}

export function deleteCustomMapping(id: string): CustomMapping[] {
  const current = getCustomMappings();
  const updated = current.filter((m) => m.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update localStorage', err);
  }
  return updated;
}

export function resetCustomMappings(): CustomMapping[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOM_MAPPINGS));
  } catch {
    // ignore
  }
  return DEFAULT_CUSTOM_MAPPINGS;
}
