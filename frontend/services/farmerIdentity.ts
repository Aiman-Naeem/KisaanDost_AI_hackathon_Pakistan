/**
 * Persistent farmer identity service.
 *
 * Provides a stable `farmerId` that survives app restarts by reading/writing
 * AsyncStorage. If no id exists yet, one is generated in the format
 * `farmer_<timestamp>_<random6>` and persisted for future sessions.
 *
 * Concurrent calls to `getFarmerId()` share a single in-flight promise so
 * that two different ids are never created or written.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'kisaandost:farmerId';

/** Module-level guard — ensures only one read/write cycle runs at a time. */
let inflight: Promise<string> | null = null;

/**
 * Generate a simple UUID-like farmer id.
 * Format: `farmer_<epochMs>_<6 random alphanumeric chars>`
 */
function generateFarmerId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `farmer_${Date.now()}_${rand}`;
}

/**
 * Internal implementation — called once and cached via the `inflight` guard.
 *
 * 1. Try to read existing id from AsyncStorage.
 * 2. If found, return it.
 * 3. If not found, generate a new id, persist it, and return it.
 * 4. If AsyncStorage throws at any point, log a warning and fall back to a
 *    session-only in-memory id (never throws).
 */
async function resolveFarmerId(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
  } catch (readErr) {
    console.warn('[farmerIdentity] AsyncStorage read failed, using fallback id:', readErr);
    return generateFarmerId();
  }

  const newId = generateFarmerId();

  try {
    await AsyncStorage.setItem(STORAGE_KEY, newId);
  } catch (writeErr) {
    console.warn('[farmerIdentity] AsyncStorage write failed, id is session-only:', writeErr);
  }

  return newId;
}

/**
 * Get the persistent farmer id. Safe to call multiple times concurrently —
 * all callers receive the same resolved value.
 */
export function getFarmerId(): Promise<string> {
  if (!inflight) {
    inflight = resolveFarmerId().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}
