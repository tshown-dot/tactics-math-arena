import React from 'react';
import { Award, CheckCircle2, XCircle, ArrowRight, Shield, Zap, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

export default function ProofScreen({ result, lesson, onReturnToCamp }) {
  const isVictory = result?.victory;
  const attempted = result?.attempted || 0;
  const correct = result?.correct || 0;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 select-none">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center text-center">
        {/* Victory Emblem */}
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl border-2 mb-4 animate-bounce ${
          isVictory
            ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 border-amber-200'
            : 'bg-slate-800 border-slate-700'
        }`}>
          {isVictory ? '🏆' : '🛡️'}
        </div>

        <h2 className="text-2xl md:text-3xl font-black font-mono tracking-wide uppercase text-amber-400">
          {isVictory ? 'Arena Victory!' : 'Tactical Retreat'}
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          {lesson?.title || 'Math Encounter'}
        </p>

        {/* Accountability Stat Card for Teacher Check */}
        <div className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-4 my-5 grid grid-cols-3 gap-2 font-mono">
          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Accuracy</span>
            <span className={`text-lg md:text-xl font-black ${accuracy >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {accuracy}%
            </span>
          </div>

          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Solved</span>
            <span className="text-lg md:text-xl font-black text-slate-200">
              {correct}/{attempted}
            </span>
          </div>

          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Earned</span>
            <span className="text-lg md:text-xl font-black text-amber-400">
              +{result?.coinsEarned || 0} 💰
            </span>
          </div>
        </div>

        {/* 2-Second Flash Verification Badge */}
        {isVictory && (
          <div className="w-full bg-emerald-950/70 border border-emerald-500/80 rounded-xl py-2 px-3 mb-5 flex items-center justify-center gap-2 text-xs font-mono text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold uppercase tracking-wider">Teacher Station Verified • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}

        <button
          onClick={() => {
            sound.move();
            onReturnToCamp();
          }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-base font-mono uppercase tracking-wider border-2 border-amber-300 shadow-xl active:scale-95 transition flex items-center justify-center gap-2"
        >
          <span>Return to Camp</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
