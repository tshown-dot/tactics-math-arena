import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gorvcvovtxykqzrscayg.supabase.co';
// Client uses public anon/publishable key only (safe for frontend)
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_CFzz592giYGX2XLp2rryeg_ohUSmG4o';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LOCAL_STORAGE_KEY = 'tactics_math_player_profile';

// Default initial guest profile
export const DEFAULT_PROFILE = {
  pin: 'guest',
  password: '',
  starter: 'ignis',
  level: 1,
  xp: 0,
  coins: 100,
  shields: 1,
  upgrades: { armor: 0, magnet: 0, scrolls: 1 },
  badges: [],
  current_topic: 'G07_U03',
  unlocked_lessons: ['G07_U03_L01'],
  isGuest: true
};

/**
 * Log in student using 4-digit PIN and Password.
 * Privacy-First: Absolutely NO names or PII transmitted.
 */
export async function loginStudent(pin, password) {
  const cleanPin = String(pin).trim();
  const cleanPass = String(password).trim();

  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('pin', cleanPin)
      .eq('password', cleanPass)
      .single();

    if (error || !data) {
      console.warn('Supabase login query notice:', error?.message);
      // Fallback check in local storage if already logged in offline
      const local = getLocalProfile();
      if (local && local.pin === cleanPin && local.password === cleanPass) {
        return { success: true, profile: local, source: 'offline_local' };
      }
      return { success: false, error: 'Invalid 4-digit PIN or Passcode. Check with your teacher!' };
    }

    const studentProfile = {
      ...data,
      isGuest: false
    };

    saveLocalProfile(studentProfile);
    return { success: true, profile: studentProfile, source: 'supabase' };
  } catch (err) {
    console.error('Network error during Supabase login:', err);
    // If offline, allow logging into locally cached profile
    const local = getLocalProfile();
    if (local && local.pin === cleanPin && local.password === cleanPass) {
      return { success: true, profile: local, source: 'offline_local' };
    }
    return { success: false, error: 'Connection error. Please try again or notify teacher.' };
  }
}

/**
 * Save updated student profile (XP, level, coins, shields, badges, unlocked lessons)
 */
export async function saveStudentProfile(profile) {
  if (!profile) return;
  saveLocalProfile(profile);

  if (profile.isGuest || profile.pin === 'guest') {
    return; // Don't push anonymous guest to database
  }

  try {
    await supabase
      .from('students')
      .update({
        starter: profile.starter,
        level: profile.level,
        xp: profile.xp,
        coins: profile.coins,
        shields: profile.shields,
        upgrades: profile.upgrades,
        badges: profile.badges,
        unlocked_lessons: profile.unlocked_lessons,
        last_active: new Date().toISOString()
      })
      .eq('pin', profile.pin);
  } catch (err) {
    console.warn('Could not sync profile to Supabase (offline):', err);
  }
}

/**
 * Log session results for teacher accountability & gradebook
 */
export async function logSessionResult({ pin, lessonId, mode, attempted, correct, bossDefeated, xpEarned, coinsEarned }) {
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  
  if (!pin || pin === 'guest') return;

  try {
    await supabase
      .from('session_logs')
      .insert({
        pin,
        lesson_id: lessonId,
        mode,
        problems_attempted: attempted,
        problems_correct: correct,
        accuracy,
        boss_defeated: Boolean(bossDefeated),
        xp_earned: xpEarned || 0,
        coins_earned: coinsEarned || 0
      });
  } catch (err) {
    console.warn('Could not write session log to Supabase:', err);
  }
}

export function getLocalProfile() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}
