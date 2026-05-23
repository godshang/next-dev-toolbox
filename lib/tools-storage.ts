const RECENT_KEY = 'dev-toolbox-recent';
const FAVORITE_KEY = 'dev-toolbox-favorites';
const MAX_RECENT = 5;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getRecentTools(): string[] {
  return readJSON<string[]>(RECENT_KEY, []);
}

export function addRecentTool(toolId: string): void {
  const recent = getRecentTools().filter(id => id !== toolId);
  recent.unshift(toolId);
  writeJSON(RECENT_KEY, recent.slice(0, MAX_RECENT));
}

export function getFavoriteTools(): string[] {
  return readJSON<string[]>(FAVORITE_KEY, []);
}

export function toggleFavorite(toolId: string): boolean {
  const favorites = getFavoriteTools();
  const index = favorites.indexOf(toolId);
  if (index >= 0) {
    favorites.splice(index, 1);
    writeJSON(FAVORITE_KEY, favorites);
    return false;
  }
  favorites.push(toolId);
  writeJSON(FAVORITE_KEY, favorites);
  return true;
}

export function isFavorite(toolId: string): boolean {
  return getFavoriteTools().includes(toolId);
}
