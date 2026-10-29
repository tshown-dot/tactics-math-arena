import React, { useState } from 'react';
import { Shield, Zap, Sparkles, ShoppingBag, Trophy, LogOut, ChevronRight, BookOpen, AlertCircle, Play } from 'lucide-react';
import { STARTER_MONSTERS } from '../data/monsters';
import { TOPIC_3_DATA } from '../data/curriculumData';
import { sound } from '../utils/audio';

export default function CampHub({
  playerProfile,
  onSelectEncounter,
  onOpenShop,
  onLogout
}) {
  const [selectedLesson, setSelectedLesson] = useState(TOPIC_3_DATA.lessons[0]);
  const currentStarterKey = playerProfile?.starter || 'ignis';
  const monster = STARTER_MONSTERS[currentStarterKey] || STARTER_MONSTERS.ignis;

  const currentLevel = playerProfile?.level || 1;
  const currentXp = playerProfile?.xp || 0;
  const currentCoins = playerProfile?.coins || 0;
  const currentShields = playerProfile?.shields || 1;

  // Evolution lookup
  const currentEvolution = monster.evolutions.reduce((best, evo) => {
    return currentLevel >= evo.level ? evo : best;
  }, monster.evolutions[0]);

  const handleStartGrind = (lesson) => {
    sound.hit();
    onSelectEncounter({ lesson, mode: 'grind' });
  };

  const handleStartBoss = (lesson) => {
    sound.criticalHit();
    onSelectEncounter({ lesson, mode: 'phantom_boss' });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 md:p-6 select-none animate-in fade-in">
      {/* 1. TOP STATUS BAR */}
      <div className="bg-slate-950/90 border-2 border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Monster Avatar & Level */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-lg animate-pulse">
            {monster.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono font-black text-amber-400 text-lg md:text-xl">
                {currentEvolution.name}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                Lvl {currentLevel}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {currentEvolution.title} • PIN: <strong className="text-slate-200">#{playerProfile?.pin}</strong>
            </p>
          </div>
        </div>

        {/* Resources & Quick Actions */}
        <div className="flex items-center gap-3 md:gap-5 font-mono text-xs md:text-sm">
          {/* XP Bar */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-slate-400 text-[11px] font-bold">XP: {currentXp} / {currentLevel * 100}</span>
            <div className="w-28 h-2 bg-slate-900 border border-slate-700 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
                style={{ width: `${Math.min(100, (currentXp % 100))}%` }}
              />
            </div>
          </div>

          {/* Shields */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/70 border border-emerald-600/70 rounded-xl text-emerald-300 font-bold">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>{currentShields} Shields</span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/70 border border-amber-600/70 rounded-xl text-amber-300 font-bold">
            <span>💰</span>
            <span>{currentCoins}</span>
          </div>

          {/* Shop Button */}
          <button
            onClick={() => { sound.move(); onOpenShop(); }}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow active:scale-95 transition flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => { sound.move(); onLogout(); }}
            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 rounded-xl transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MAIN CAMPAIGN ARENA SELECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lesson Stages List */}
        <div className="lg:col-span-1 space-y-2.5">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
              Topic 3 Arenas (6 Lessons)
            </span>
            <span className="text-[11px] font-mono text-amber-400 font-semibold">
              enVision 2.0
            </span>
          </div>

          {TOPIC_3_DATA.lessons.map((lesson) => {
            const isSelected = selectedLesson.id === lesson.id;
            return (
              <div
                key={lesson.id}
                onClick={() => { sound.move(); setSelectedLesson(lesson); }}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-[1.02]'
                    : 'bg-slate-950/70 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-amber-400">
                      3-{lesson.number}
                    </span>
                    <h3 className="font-bold text-slate-200 text-xs md:text-sm font-mono truncate max-w-[190px]">
                      {lesson.title}
                    </h3>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-amber-400 translate-x-1' : 'text-slate-600'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Lesson Mission Control */}
        <div className="lg:col-span-2 bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
                  Lesson 3-{selectedLesson.number}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-100 font-mono">
                  {selectedLesson.title}
                </h2>
              </div>
              <span className="text-2xl">👻</span>
            </div>

            {/* Essential Question & I Can */}
            <div className="space-y-3 mb-6">
              <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  🎯 Mission Objective ("I Can"):
                </span>
                <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed">
                  {selectedLesson.iCan}
                </p>
              </div>

              <div className="bg-indigo-950/40 rounded-xl p-3.5 border border-indigo-900/50">
                <span className="text-[11px] font-mono font-bold text-indigo-300 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  Key Concept Grimoire:
                </span>
                <p className="text-xs text-indigo-200/90 leading-relaxed">
                  {selectedLesson.keyConceptSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Action Choice: The Grind vs The Percentage Phantom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
            {/* The Grind Button */}
            <button
              onClick={() => handleStartGrind(selectedLesson)}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-mono font-bold border-2 border-emerald-400/80 shadow-lg active:scale-95 transition flex flex-col items-center justify-center text-center gap-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">⚔️</span>
                <span className="text-base uppercase tracking-wider">The Grind</span>
              </div>
              <span className="text-[11px] text-emerald-200/90 font-normal">
                Rapid-Fire Pre-skills & Core Fluency (Earns Shields & XP)
              </span>
            </button>

            {/* The Percentage Phantom Boss Button */}
            <button
              onClick={() => handleStartBoss(selectedLesson)}
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white font-mono font-bold border-2 border-purple-400/80 shadow-lg active:scale-95 transition flex flex-col items-center justify-center text-center gap-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">👻</span>
                <span className="text-base uppercase tracking-wider">Phantom Boss</span>
              </div>
              <span className="text-[11px] text-purple-200/90 font-normal">
                2-Phase Boss Fight • Multi-Step Extension Challenge
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
