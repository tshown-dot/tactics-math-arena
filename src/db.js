/**
 * enVision 2.0 Math Companion - Database & Gradebook Service
 * 
 * Hybrid Architecture:
 * 1. Supabase Client: Anonymous student state (PIN, level, coins) via public publishable anon key.
 * 2. Google Apps Script (GAS) POST: Gradebook summary logging via native fetch (no-cors) with localStorage fallback.
 * 
 * FERPA Compliant: Strictly zero student PII (names, emails) stored or transmitted.
 * Dependencies: Zero runtime build dependencies (uses browser window.supabase CDN or local fallback).
 */

// ==============================================================================
// CONFIGURATION CONSTANTS (Replace placeholders with deployment credentials)
// ==============================================================================
export const SUPABASE_URL = (typeof window !== 'undefined' && window.ENV?.SUPABASE_URL) 
  || 'https://gorvcvovtxykqzrscayg.supabase.co';

export const SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.ENV?.SUPABASE_ANON_KEY) 
  || 'sb_publishable_CFzz592giYGX2XLp2rryeg_ohUSmG4o';

export const GAS_ENDPOINT_URL = (typeof window !== 'undefined' && window.ENV?.GAS_ENDPOINT_URL) 
  || 'https://script.google.com/macros/s/AKfycbxYOUR_GAS_EXEC_ID/exec';

const LOCAL_STORAGE_PROFILE_PREFIX = 'math_station_student_';
const OFFLINE_QUEUE_KEY = 'math_station_offline_queue';

/**
 * Initializes and returns the Supabase client if CDN is present.
 */
export function getSupabaseClient() {
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      if (!window._cachedSupabaseClient) {
        window._cachedSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      }
      return window._cachedSupabaseClient;
    } catch (e) {
      console.warn('[db.js] Error initializing Supabase client:', e);
    }
  }
  return null;
}

// Exported client reference
export const supabaseClient = getSupabaseClient();

/**
 * Load student profile anonymously by 4-digit PIN.
 * Checks Supabase first; falls back to localStorage if offline.
 *
 * @param {string} pin - 4-digit student PIN
 * @returns {Promise<{ success: boolean, profile: Object, source: string }>}
 */
export async function loadStudentProfile(pin) {
  const cleanPin = String(pin).trim();
  const client = getSupabaseClient();

  if (client && navigator.onLine) {
    try {
      const { data, error } = await client
        .from('students')
        .select('*')
        .eq('pin', cleanPin)
        .single();

      if (!error && data) {
        saveLocalProfile(data);
        return { success: true, profile: data, source: 'supabase' };
      }
    } catch (err) {
      console.warn('[db.js] Supabase fetch error, checking local storage:', err);
    }
  }

  const local = getLocalProfile(cleanPin);
  if (local) {
    return { success: true, profile: local, source: 'localStorage' };
  }

  const newProfile = {
    pin: cleanPin,
    level: 1,
    coins: 50,
    shields: 1,
    lastActive: new Date().toISOString()
  };
  saveLocalProfile(newProfile);

  return { success: true, profile: newProfile, source: 'local_created' };
}

/**
 * Syncs end-of-session gradebook summary to Google Sheets via Google Apps Script Web App.
 * Uses native fetch with 'no-cors' mode and falls back to localStorage if offline.
 *
 * @param {Object} params
 * @param {string} [params.gasUrl] - Google Apps Script Web App Executable URL
 * @param {string} params.pin - Anonymous 4-digit student PIN
 * @param {string} params.lessonId - e.g. "G07_U03_L01"
 * @param {number} params.score - Number of problems correct on first try
 * @param {number} params.total - Total number of problems
 * @param {number} params.durationSeconds - Station completion time in seconds
 * @returns {Promise<{ success: boolean, source: string, queued?: boolean, error?: string }>}
 */
export async function syncToGoogleSheets({
  gasUrl = GAS_ENDPOINT_URL,
  pin,
  lessonId = 'G07_U03_L01',
  score,
  total = 8,
  durationSeconds = 0
}) {
  const payload = {
    timestamp: new Date().toISOString(),
    pin: String(pin || 'anonymous').trim(),
    lessonId: String(lessonId),
    score: Number(score),
    total: Number(total),
    accuracy: total > 0 ? Math.round((Number(score) / Number(total)) * 100) : 0,
    durationSeconds: Number(durationSeconds)
  };

  // Optional background log to Supabase
  const client = getSupabaseClient();
  if (client && navigator.onLine && pin) {
    client.from('session_logs').insert({
      pin: String(pin),
      lesson_id: String(lessonId),
      mode: 'station_practice',
      problems_attempted: total,
      problems_correct: score,
      accuracy: payload.accuracy
    }).catch(err => console.warn('[db.js] Background Supabase log notice:', err));
  }

  // Check placeholder URL
  if (!gasUrl || gasUrl.includes('YOUR_GAS_EXEC_ID')) {
    console.info('[db.js] GAS URL is placeholder. Summary cached in localStorage:', payload);
    queueOfflinePayload(payload);
    return { success: true, source: 'local_cached', queued: true };
  }

  // Attempt fetch POST if online
  if (navigator.onLine) {
    try {
      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      console.log('[db.js] Dispatched summary log to Google Apps Script');
      return { success: true, source: 'google_sheets' };
    } catch (err) {
      console.warn('[db.js] Error posting to GAS; queuing in localStorage:', err);
      queueOfflinePayload(payload);
      return { success: false, queued: true, error: err.message };
    }
  } else {
    console.info('[db.js] Device offline. Queuing summary log in localStorage.');
    queueOfflinePayload(payload);
    return { success: true, queued: true, source: 'offline_queue' };
  }
}

/**
 * Saves a payload to the offline queue in localStorage.
 */
export function queueOfflinePayload(payload) {
  try {
    const queue = getOfflineQueue();
    queue.push(payload);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('[db.js] Failed to queue offline payload:', err);
  }
}

/**
 * Retrieves the offline queue from localStorage.
 */
export function getOfflineQueue() {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Flushes the offline queue by posting each stored entry to Google Sheets.
 */
export async function flushOfflineQueue(gasUrl = GAS_ENDPOINT_URL) {
  if (!navigator.onLine || !gasUrl || gasUrl.includes('YOUR_GAS_EXEC_ID')) return;
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  const remaining = [];
  for (const item of queue) {
    try {
      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    } catch {
      remaining.push(item);
    }
  }

  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  } catch (err) {
    console.warn('[db.js] Could not update offline queue after flush:', err);
  }
}

export function getLocalProfile(pin) {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PROFILE_PREFIX}${pin}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile) {
  if (!profile || !profile.pin) return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PROFILE_PREFIX}${profile.pin}`, JSON.stringify(profile));
  } catch (err) {
    console.warn('[db.js] Failed to save local profile:', err);
  }
}
