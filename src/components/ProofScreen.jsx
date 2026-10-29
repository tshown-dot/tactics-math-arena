import React from 'react';
import { sound } from '../utils/audio';
import { PixelCoinIcon, PixelShieldIcon } from './PixelSprites';

export default function ProofScreen({ result, lesson, onReturnToCamp }) {
  const isVictory = result?.victory;
  const attempted = result?.attempted || 0;
  const correct = result?.correct || 0;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 select-none font-mono">
      <div className="fft-box max-w-md w-full p-6 flex flex-col items-center text-center shadow-[0_0_80px_rgba(0,0,0,0.95)]">
        
        {/* Victory Header */}
        <div className="text-amber-400 text-base md:text-lg font-black tracking-wider mb-1">
          {isVictory ? '★ VICTORY ★' : 'TACTICAL RETREAT'}
        </div>
        <div className="text-[9px] text-slate-400 uppercase tracking-widest mb-4">
          {lesson?.title?.toUpperCase() || 'ENCOUNTER COMPLETE'}
        </div>

        {/* Stats Table */}
        <div className="w-full bg-black border-2 border-slate-700 p-3 mb-4 space-y-2 text-[9px]">
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-slate-400">ACCURACY:</span>
            <span className={`font-black ${accuracy >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {accuracy}%
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-slate-400">TARGETS SOLVED:</span>
            <span className="text-white font-bold">{correct} / {attempted}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="text-slate-400">BOUNTY:</span>
            <span className="text-amber-400 font-bold">+{result?.coinsEarned || 0} G</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">EXPERIENCE:</span>
            <span className="text-cyan-400 font-bold">+{result?.xpEarned || 0} EXP</span>
          </div>
        </div>

        {/* 2-Second Teacher Station Verification Stamp */}
        {isVictory && (
          <div className="w-full border-2 border-emerald-500 bg-emerald-950/80 py-2 px-3 mb-5 text-[8px] text-emerald-300 font-bold uppercase tracking-wider">
            ★ TEACHER VERIFIED: TOPIC 3 MASTERY ★
          </div>
        )}

        <button
          onClick={() => {
            sound.move();
            onReturnToCamp();
          }}
          className="w-full py-3 fft-btn-gold text-xs uppercase tracking-wider"
        >
          ► RETURN TO CAMP
        </button>
      </div>
    </div>
  );
}
