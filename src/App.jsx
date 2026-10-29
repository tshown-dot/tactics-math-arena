import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import CampHub from './components/CampHub';
import TacticsArena from './components/TacticsArena';
import MonsterShop from './components/MonsterShop';
import ProofScreen from './components/ProofScreen';
import { getLocalProfile, saveStudentProfile, logSessionResult } from './services/supabase';
import { STARTER_MONSTERS } from './data/monsters';
import { sound } from './utils/audio';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login' | 'camp' | 'shop' | 'arena'
  const [activeEncounter, setActiveEncounter] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Check for auto-saved profile on mount
  useEffect(() => {
    const cached = getLocalProfile();
    if (cached && cached.pin) {
      setProfile(cached);
      setCurrentScreen('camp');
    }
  }, []);

  const handleLoginSuccess = (studentProfile) => {
    setProfile(studentProfile);
    setCurrentScreen('camp');
  };

  const handleSelectEncounter = ({ lesson, mode }) => {
    setActiveEncounter({ lesson, mode });
    setCurrentScreen('arena');
  };

  const handleBattleComplete = async (result) => {
    setBattleResult(result);

    // Update player XP and Coins
    if (profile) {
      const updatedXp = (profile.xp || 0) + (result.xpEarned || 0);
      const updatedCoins = (profile.coins || 0) + (result.coinsEarned || 0);
      const updatedLevel = 1 + Math.floor(updatedXp / 100);

      const updatedBadges = [...(profile.badges || [])];
      if (result.bossDefeated && !updatedBadges.includes('phantom_slayer')) {
        updatedBadges.push('phantom_slayer');
      }

      const updatedProfile = {
        ...profile,
        xp: updatedXp,
        coins: updatedCoins,
        level: updatedLevel,
        badges: updatedBadges
      };

      setProfile(updatedProfile);
      await saveStudentProfile(updatedProfile);

      // Log session to Supabase for teacher
      await logSessionResult({
        pin: profile.pin,
        lessonId: activeEncounter?.lesson?.id || 'G07_U03',
        mode: activeEncounter?.mode || 'grind',
        attempted: result.attempted,
        correct: result.correct,
        bossDefeated: result.bossDefeated,
        xpEarned: result.xpEarned,
        coinsEarned: result.coinsEarned
      });
    }
  };

  const handleReturnToCamp = () => {
    setBattleResult(null);
    setActiveEncounter(null);
    setCurrentScreen('camp');
  };

  const handleUpdateProfile = async (newProfile) => {
    setProfile(newProfile);
    await saveStudentProfile(newProfile);
  };

  const handleLogout = () => {
    setProfile(null);
    setCurrentScreen('login');
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const starterKey = profile?.starter || 'ignis';
  const currentMonster = STARTER_MONSTERS[starterKey] || STARTER_MONSTERS.ignis;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Navigation Strip */}
      <header className="w-full bg-slate-950/80 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold uppercase tracking-wider">
            ⚔️ Tactics Math Arena
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">enVision 2.0 Companion</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* Main Screen Views */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {currentScreen === 'login' && (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        )}

        {currentScreen === 'camp' && profile && (
          <CampHub
            playerProfile={profile}
            onSelectEncounter={handleSelectEncounter}
            onOpenShop={() => setCurrentScreen('shop')}
            onLogout={handleLogout}
          />
        )}

        {currentScreen === 'shop' && profile && (
          <MonsterShop
            playerProfile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => setCurrentScreen('camp')}
          />
        )}

        {currentScreen === 'arena' && activeEncounter && profile && (
          <TacticsArena
            lesson={activeEncounter.lesson}
            playerProfile={profile}
            monster={currentMonster}
            mode={activeEncounter.mode}
            onBattleComplete={handleBattleComplete}
            onExitArena={() => setCurrentScreen('camp')}
          />
        )}
      </main>

      {/* Proof Screen Modal on Battle Result */}
      {battleResult && (
        <ProofScreen
          result={battleResult}
          lesson={activeEncounter?.lesson}
          onReturnToCamp={handleReturnToCamp}
        />
      )}
    </div>
  );
}
