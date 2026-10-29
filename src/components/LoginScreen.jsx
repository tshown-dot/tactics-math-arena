import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, Sparkles, ArrowRight } from 'lucide-react';
import { loginStudent, DEFAULT_PROFILE } from '../services/supabase';
import { sound } from '../utils/audio';

export default function LoginScreen({ onLoginSuccess }) {
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!pin || !password) {
      setErrorMsg('Please enter both your 4-digit PIN and Passcode.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    sound.move();

    const res = await loginStudent(pin, password);
    setIsLoading(false);

    if (res.success) {
      sound.hit();
      onLoginSuccess(res.profile);
    } else {
      sound.shieldBreak();
      setErrorMsg(res.error || 'Login failed. Please check with your teacher.');
    }
  };

  const handleGuestDemo = () => {
    sound.hit();
    onLoginSuccess({
      ...DEFAULT_PROFILE,
      pin: 'guest_demo',
      starter: 'ignis',
      level: 2,
      coins: 150,
      shields: 2,
      isGuest: true
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black select-none">
      <div className="max-w-md w-full bg-slate-900/90 border-2 border-amber-500/70 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col items-center">
        {/* Game Logo & Emblem */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-red-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl border-2 border-amber-300 mb-4 animate-bounce">
          ⚔️
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-amber-400 font-mono tracking-wider text-center uppercase">
          Tactics Math Arena
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono tracking-wide text-center">
          enVision 2.0 • 7th Grade Percents
        </p>

        {/* Privacy FERPA Assurance Badge */}
        <div className="mt-4 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/60 flex items-center gap-2 text-[11px] text-emerald-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Zero Names Stored • 100% FERPA Protected</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full mt-6 space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>4-Digit Student PIN:</span>
            </label>
            <input
              type="text"
              maxLength={4}
              pattern="[0-9]*"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 1042"
              className="w-full bg-black/70 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-amber-300 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Secret Passcode:</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black/70 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-slate-100 outline-none transition"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-300 text-xs text-center font-medium animate-in shake">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-base uppercase tracking-wider border-2 border-amber-300 shadow-xl active:scale-95 transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter the Arena</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Bypass for Testing */}
        <div className="w-full pt-4 mt-4 border-t border-slate-800/80 flex flex-col items-center">
          <button
            type="button"
            onClick={handleGuestDemo}
            className="text-xs text-slate-400 hover:text-amber-300 font-mono flex items-center gap-1.5 py-1 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Demo / Guest Mode</span>
          </button>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            (Preset accounts: PIN 1042 / star7 or PIN 7777 / math7)
          </p>
        </div>
      </div>
    </div>
  );
}
