import React, { useState } from 'react';
import { STARTER_MONSTERS } from '../data/monsters';
import { TOPIC_3_DATA } from '../data/curriculumData';
import { sound } from '../utils/audio';
import {
  IgnisSprite,
  HydraSprite,
  VoltSprite,
  PixelShieldIcon,
  PixelCoinIcon
} from './PixelSprites';

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

  const renderMonsterSprite = (size = 64) => {
    if (monster?.id === 'hydra') return <HydraSprite size={size} />;
    if (monster?.id === 'volt') return <VoltSprite size={size} />;
    return <IgnisSprite size={size} />;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 md:p-6 select-none font-mono">
      {/* 1. TOP RETRO STATUS BANNER */}
      <div className="fft-box p-3 md:p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-black border-2 border-amber-400 flex items-center justify-center">
            {renderMonsterSprite(44)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-300 font-bold text-xs md:text-sm">
                {currentEvolution.name.toUpperCase()}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50">
                LV.{currentLevel}
              </span>
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">
              PIN: #{playerProfile?.pin} • CLASS: {currentEvolution.title.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1 text-emerald-400 bg-black/60 px-2.5 py-1.5 border border-emerald-700">
            <PixelShieldIcon size={16} />
            <span>{currentShields} SHIELDS</span>
          </div>

          <div className="flex items-center gap-1 text-amber-400 bg-black/60 px-2.5 py-1.5 border border-amber-700">
            <PixelCoinIcon size={16} />
            <span>{currentCoins} G</span>
          </div>

          <button
            onClick={() => { sound.move(); onOpenShop(); }}
            className="fft-btn px-3 py-1.5 text-[9px] text-amber-300 font-bold"
          >
            [ BAZAAR ]
          </button>

          <button
            onClick={() => { sound.move(); onLogout(); }}
            className="px-2 py-1.5 text-[9px] text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-700"
            title="Log out"
          >
            QUIT
          </button>
        </div>
      </div>

      {/* 2. WORLD MAP / ARENA SELECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stage List */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-[10px] text-amber-400 font-bold tracking-wider uppercase mb-1">
            ► SELECT MISSION:
          </div>

          {TOPIC_3_DATA.lessons.map((lesson) => {
            const isSelected = selectedLesson.id === lesson.id;
            return (
              <div
                key={lesson.id}
                onClick={() => { sound.move(); setSelectedLesson(lesson); }}
                className={`p-3 border-2 cursor-pointer transition ${
                  isSelected
                    ? 'bg-amber-950/70 border-amber-400 text-amber-200 shadow'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-600 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span>[3-{lesson.number}] {lesson.title.toUpperCase()}</span>
                  <span>{isSelected ? '◄' : ''}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mission Briefing Window */}
        <div className="lg:col-span-2 fft-box p-4 md:p-6 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-amber-500/60 pb-2 mb-3">
              <span className="text-[9px] text-amber-400 font-bold">
                LESSON 3-{selectedLesson.number} BRIEFING:
              </span>
              <h2 className="text-sm md:text-base font-black text-white mt-1">
                {selectedLesson.title.toUpperCase()}
              </h2>
            </div>

            {/* Objective & Grimoire */}
            <div className="space-y-3 mb-6">
              <div className="bg-black/80 border border-slate-700 p-3 text-[10px] leading-relaxed">
                <span className="text-amber-300 font-bold block mb-1">► OBJECTIVE ("I CAN"):</span>
                <p className="text-slate-200">{selectedLesson.iCan}</p>
              </div>

              <div className="bg-black/80 border border-indigo-700/80 p-3 text-[9px] leading-relaxed text-indigo-200">
                <span className="text-indigo-300 font-bold block mb-1">► FIELD GRIMOIRE (KEY CONCEPT):</span>
                <p>{selectedLesson.keyConceptSummary}</p>
              </div>
            </div>
          </div>

          {/* Action Choice: The Grind vs The Phantom Boss */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => handleStartGrind(selectedLesson)}
              className="fft-btn py-3 px-3 text-center flex flex-col items-center justify-center gap-1 text-[10px]"
            >
              <span className="text-emerald-400 font-bold">► THE GRIND</span>
              <span className="text-[8px] text-slate-400">Pre-Skill Ramping & Shields</span>
            </button>

            <button
              onClick={() => handleStartBoss(selectedLesson)}
              className="fft-btn-gold py-3 px-3 text-center flex flex-col items-center justify-center gap-1 text-[10px]"
            >
              <span className="text-slate-950 font-black">► PHANTOM RAID</span>
              <span className="text-[8px] text-slate-900 font-bold">2-Phase Boss Battle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
