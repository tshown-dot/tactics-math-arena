import React, { useState } from 'react';
import { loginStudent, DEFAULT_PROFILE } from '../services/supabase';
import { sound } from '../utils/audio';
import { IgnisSprite, HydraSprite, VoltSprite, PercentagePhantomSprite } from './PixelSprites';

export default function LoginScreen({ onLoginSuccess }) {
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!pin || !password) {
      setErrorMsg('ENTER 4-DIGIT PIN AND PASSCODE.');
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
      setErrorMsg(res.error || 'INVALID CREDENTIALS.');
    }
  };

  const handleGuestDemo = () => {
    sound.hit();
    onLoginSuccess({
      ...DEFAULT_PROFILE,
      pin: '1042',
      starter: 'ignis',
      level: 2,
      coins: 150,
      shields: 2,
      isGuest: true
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 bg-black scanlines select-none font-mono">
      <div className="fft-box max-w-md w-full p-6 md:p-8 flex flex-col items-center shadow-[0_0_80px_rgba(0,0,0,0.95)]">
        
        {/* Retro Title Screen Header */}
        <div className="flex items-center gap-4 mb-4">
          <IgnisSprite size={40} />
          <PercentagePhantomSprite size={44} />
        </div>

        <h1 className="text-xl md:text-2xl font-black text-amber-400 text-center tracking-wider mb-1">
          TACTICS MATH
        </h1>
        <div className="text-[10px] text-amber-300/80 tracking-widest text-center uppercase mb-1">
          ★ ARENA BATTLE ★
        </div>
        <p className="text-[8px] text-slate-400 text-center uppercase tracking-wider mb-6">
          enVision 2.0 • GRADE 7 PERCENTS
        </p>

        {/* Password Entry Slate */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="bg-black border-2 border-slate-700 p-3">
            <label className="block text-[9px] text-amber-400 uppercase mb-1">
              ► 4-DIGIT PIN:
            </label>
            <input
              type="text"
              maxLength={4}
              pattern="[0-9]*"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="0000"
              className="w-full bg-slate-950 border border-slate-700 text-center text-xl font-mono tracking-widest text-amber-300 py-2 outline-none focus:border-amber-400"
            />
          </div>

          <div className="bg-black border-2 border-slate-700 p-3">
            <label className="block text-[9px] text-amber-400 uppercase mb-1">
              ► SECRET PASSCODE:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700 text-center text-lg font-mono tracking-widest text-slate-200 py-2 outline-none focus:border-amber-400"
            />
          </div>

          {errorMsg && (
            <div className="p-2 bg-rose-950 border border-rose-600 text-rose-300 text-[8px] text-center font-bold">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 fft-btn-gold text-xs uppercase tracking-wider disabled:opacity-50"
          >
            {isLoading ? 'VERIFYING...' : '► PUSH START BUTTON'}
          </button>
        </form>

        {/* Demo Fast Track */}
        <div className="w-full pt-4 mt-6 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleGuestDemo}
            className="text-[9px] text-amber-400 hover:text-white underline tracking-wider"
          >
            [ FAST DEMO PLAY ]
          </button>
          <div className="text-[7px] text-slate-500 mt-2">
            PRESETS: PIN 1042 / star7 • PIN 7777 / math7
          </div>
          <div className="text-[7px] text-emerald-400/80 mt-1">
            ZERO NAMES STORED • FERPA COMPLIANT
          </div>
        </div>

      </div>
    </div>
  );
}
