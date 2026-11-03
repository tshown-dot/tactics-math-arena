/**
 * Realm of Numeria - Database & Cloud Persistence Service
 * 
 * Hybrid Architecture:
 * 1. Supabase Client: Anonymous student profiles & progress logs using Anon/Publishable key.
 * 2. Google Apps Script (GAS) POST: Optional summary logging for teacher gradebook.
 * 3. Offline First: Immediate transparent fallback to localStorage when disconnected.
 * 
 * FERPA / Privacy: Strictly zero student names or PII stored or transmitted.
 */

export const SUPABASE_URL = (typeof window !== 'undefined' && window.ENV?.SUPABASE_URL)
  || 'https://gorvcvovtxykqzrscayg.supabase.co';

export const SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.ENV?.SUPABASE_ANON_KEY)
  || 'sb_publishable_CFzz592giYGX2XLp2rryeg_ohUSmG4o';

export const GAS_ENDPOINT_URL = (typeof window !== 'undefined' && window.ENV?.GAS_ENDPOINT_URL)
  || 'https://script.google.com/macros/s/AKfycbytcIs1xic99kfW2OxkfC8kfpUeUTz_FMGx1QbJc5tyMImTmkBWjkpYZJINXt3gjxly/exec';

let _cachedClient = null;

export function getSupabase() {
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    if (!_cachedClient) {
      try {
        _cachedClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } catch (e) {
        console.warn('[db.js] Error initializing Supabase client:', e);
      }
    }
    return _cachedClient;
  }
  return null;
}

/**
 * Fetch student profile by PIN.
 */
export async function fetchStudentProfile(pin) {
  let profile = null;

  // 1. Try Supabase
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('students')
        .select('*')
        .eq('pin', pin)
        .single();

      if (!error && data) {
        profile = data;
      }
    } catch (e) {
      console.warn('[db.js] Remote Supabase profile fetch failed:', e);
    }
  }

  // 2. Try Google Sheets Webhook Roster (for real-time Full Access & Passcode sync)
  if (GAS_ENDPOINT_URL && typeof fetch === 'function') {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 2000) : null;
      const res = await fetch(`${GAS_ENDPOINT_URL}?action=lookup&pin=${encodeURIComponent(pin)}`, {
        signal: controller ? controller.signal : undefined,
      });
      if (timeoutId) clearTimeout(timeoutId);

      if (res.ok) {
        const gasData = await res.json();
        if (gasData && gasData.found) {
          profile = {
            ...(profile || {}),
            pin: pin,
            password: gasData.passcode || profile?.password,
            full_access: gasData.full_access || (gasData.fullAccess ? 'yes' : 'no'),
            fullAccess: gasData.fullAccess,
          };
        }
      }
    } catch (e) {
      // Offline fallback
    }
  }

  // 3. Local storage fallback if neither remote returned
  if (!profile) {
    const localKey = `numeria_student_${pin}`;
    if (typeof localStorage !== 'undefined') {
      const localData = localStorage.getItem(localKey);
      if (localData) {
        try {
          profile = JSON.parse(localData);
        } catch (e) {}
      }
    }
  }

  return profile;
}

/**
 * Save or update student profile.
 */
export async function saveStudentProfile(profile) {
  if (!profile || !profile.pin) return;

  // Always save locally first for instant offline responsiveness
  const localKey = `numeria_student_${profile.pin}`;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(localKey, JSON.stringify(profile));
  }

  const client = getSupabase();
  if (client) {
    try {
      const payload = {
        pin: profile.pin,
        password: profile.password || 'star7',
        level: profile.level || 1,
        xp: profile.xp || 0,
        coins: profile.coins || 50,
        unlocked_lessons: profile.unlockedNodes || ['node_3_1'],
        badges: profile.badges || [],
        full_access: profile.isFullAccess ? 'yes' : (profile.full_access || 'no'),
        last_active: new Date().toISOString(),
      };

      await client
        .from('students')
        .upsert(payload, { onConflict: 'pin' });
    } catch (e) {
      console.warn('[db.js] Remote profile sync failed, cached locally:', e);
    }
  }
}

/**
 * Log cartridge run summary.
 */
export async function logCartridgeSession(logData) {
  const client = getSupabase();
  if (client) {
    try {
      await client.from('session_logs').insert({
        pin: logData.pin,
        lesson_id: logData.lessonId,
        mode: logData.mode || 'adventure',
        problems_attempted: logData.total || 0,
        problems_correct: logData.score || 0,
        accuracy: logData.accuracy || 100,
        boss_defeated: logData.bossDefeated || false,
        xp_earned: logData.xpEarned || 0,
        coins_earned: logData.coinsEarned || 0,
      });
    } catch (e) {
      console.warn('[db.js] Could not log session to Supabase:', e);
    }
  }

  // Optional GAS teacher spreadsheet sync
  if (GAS_ENDPOINT_URL && typeof fetch === 'function') {
    try {
      await fetch(GAS_ENDPOINT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
    } catch (e) {
      // no-cors silently succeeds or drops offline
    }
  }
}
