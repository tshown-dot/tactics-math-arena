import React, { useState, useEffect } from 'react';
import { Shield, Zap, Sparkles, BookOpen, AlertOctagon, Heart, Award } from 'lucide-react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import MathModal from './MathModal';

// 5 Columns x 3 Rows Tactical Micro-Grid
const GRID_COLS = 5;
const GRID_ROWS = 3;

export default function TacticsArena({
  lesson,
  playerProfile,
  monster,
  mode, // 'grind' or 'phantom_boss'
  onBattleComplete,
  onExitArena
}) {
  // Battle state
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 1 });
  const [bossPos, setBossPos] = useState({ x: 4, y: 1 });
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [shields, setShields] = useState(playerProfile?.shields || 1);
  const [turn, setTurn] = useState('player'); // 'player' | 'enemy'
  const [turnCount, setTurnCount] = useState(1);
  const [moveMode, setMoveMode] = useState(false);
  const [telegraphedTiles, setTelegraphedTiles] = useState([]);
  const [activeMathProblem, setActiveMathProblem] = useState(null);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [specialTiles, setSpecialTiles] = useState([
    { x: 1, y: 0, type: 'rune', icon: '⚡' },
    { x: 2, y: 2, type: 'shield', icon: '🛡️' },
    { x: 3, y: 0, type: 'coin', icon: '💰' }
  ]);
  const [floaters, setFloaters] = useState([]);
  const [isEnragedPhase, setIsEnragedPhase] = useState(false);
  const [bossPhase, setBossPhase] = useState(1); // 1 or 2
  const [bossPartIndex, setBossPartIndex] = useState(0); // for multipart
  const [grindIndex, setGrindIndex] = useState(0);

  // Statistics for teacher logging
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);

  // Initialize encounter
  useEffect(() => {
    if (mode === 'grind') {
      // Pick current grind mob
      const q = lesson.grindQueue[grindIndex % lesson.grindQueue.length];
      setActiveMathProblem(q);
    } else {
      // Boss battle initialized
      const p1Part = lesson.bossFight.phase1.partA;
      setActiveMathProblem({
        ...p1Part,
        mobName: `${lesson.bossFight.bossName} (Phase 1)`
      });
    }
    // Random initial telegraph for Boss
    generateTelegraph();
  }, [lesson, mode, grindIndex]);

  const addFloater = (text, color = '#f59e0b') => {
    const id = Date.now() + Math.random();
    setFloaters(prev => [...prev, { id, text, color }]);
    setTimeout(() => {
      setFloaters(prev => prev.filter(f => f.id !== id));
    }, 1500);
  };

  const generateTelegraph = () => {
    // Enemy targets 1 or 2 tiles in column 0 or 1
    const targetY = Math.floor(Math.random() * GRID_ROWS);
    const targetX = Math.floor(Math.random() * 2);
    setTelegraphedTiles([{ x: targetX, y: targetY }]);
  };

  const handleMoveAction = () => {
    setMoveMode(!moveMode);
    sound.move();
  };

  const handleTileClick = (x, y) => {
    if (!moveMode) return;

    // Check distance (Manhattan distance <= 2)
    const dist = Math.abs(x - playerPos.x) + Math.abs(y - playerPos.y);
    if (dist > 0 && dist <= 2 && !(x === bossPos.x && y === bossPos.y)) {
      setPlayerPos({ x, y });
      setMoveMode(false);
      sound.move();
      addFloater('Maneuvered!', '#38bdf8');

      // Check special tile triggers
      const tileIdx = specialTiles.findIndex(t => t.x === x && t.y === y);
      if (tileIdx !== -1) {
        const found = specialTiles[tileIdx];
        if (found.type === 'shield') {
          setShields(s => s + 1);
          sound.coin();
          addFloater('+1 Shield Rune!', '#10b981');
        } else if (found.type === 'coin') {
          sound.coin();
          addFloater('+25 Arena Coins!', '#fbbf24');
        } else if (found.type === 'rune') {
          sound.hit();
          addFloater('Attack Charged (+25%)!', '#a855f7');
        }
        // Consume tile
        setSpecialTiles(prev => prev.filter((_, idx) => idx !== tileIdx));
      }
    }
  };

  const handleCastAction = () => {
    setIsMathModalOpen(true);
    sound.move();
  };

  const handleGuardAction = () => {
    sound.move();
    setShields(s => s + 1);
    addFloater('Guarded! (+1 Shield)', '#10b981');
    endPlayerTurn();
  };

  const handleMathSolved = (problem) => {
    setIsMathModalOpen(false);
    setAttempted(a => a + 1);
    setCorrect(c => c + 1);

    if (mode === 'grind') {
      // Grind strike deals 34 dmg (3 questions = clear)
      const dmg = 35;
      sound.criticalHit();
      addFloater(`-${dmg} HP!`, '#ef4444');
      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);

      if (nextHp <= 0) {
        handleVictory();
      } else {
        setGrindIndex(idx => idx + 1);
        endPlayerTurn();
      }
    } else {
      // Boss Battle Multipart resolution
      const dmg = problem.damage || 25;
      sound.criticalHit();
      addFloater(`CRITICAL STRIKE! -${dmg} HP`, '#ef4444');
      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);

      // Phase 1 -> Phase 2 transition at 50% HP
      if (nextHp <= 50 && bossPhase === 1) {
        setBossPhase(2);
        setIsEnragedPhase(true);
        addFloater('⚠️ ENRAGED PHASE! Core Exposed!', '#f43f5e');
        // Load Phase 2 Part A
        const p2A = lesson.bossFight.phase2.partA;
        setActiveMathProblem({
          ...p2A,
          mobName: `${lesson.bossFight.bossName} (Enraged Phase)`
        });
        endPlayerTurn();
      } else if (nextHp <= 0) {
        handleVictory();
      } else {
        // Advance to next part in sequence
        advanceBossSequence();
        endPlayerTurn();
      }
    }
  };

  const advanceBossSequence = () => {
    if (bossPhase === 1) {
      const p1B = lesson.bossFight.phase1.partB;
      setActiveMathProblem({
        ...p1B,
        mobName: `${lesson.bossFight.bossName} (Phase 1)`
      });
    } else {
      // Phase 2 parts
      if (bossPartIndex === 0) {
        setBossPartIndex(1);
        const p2B = lesson.bossFight.phase2.partB;
        setActiveMathProblem({
          ...p2B,
          mobName: `${lesson.bossFight.bossName} (Enraged Core)`
        });
      } else {
        const p2C = lesson.bossFight.phase2.partC;
        setActiveMathProblem({
          ...p2C,
          mobName: `${lesson.bossFight.bossName} (Final Strike!)`
        });
      }
    }
  };

  const handleMathMistake = () => {
    setAttempted(a => a + 1);

    if (shields > 0) {
      setShields(s => s - 1);
      sound.shieldBreak();
      addFloater('SHIELD SHATTERED!', '#fb7185');
    } else {
      // Take direct HP damage
      setPlayerHp(hp => Math.max(0, hp - 35));
      sound.shieldBreak();
      addFloater('-35 HP Damage Taken!', '#e11d48');
      if (playerHp - 35 <= 0) {
        handleDefeat();
      }
    }
  };

  const endPlayerTurn = () => {
    setTurn('enemy');
    setTimeout(() => {
      resolveEnemyTurn();
    }, 1200);
  };

  const resolveEnemyTurn = () => {
    // Check if player is standing on telegraphed danger tile
    const hit = telegraphedTiles.some(t => t.x === playerPos.x && t.y === playerPos.y);
    if (hit) {
      if (shields > 0) {
        setShields(s => s - 1);
        sound.shieldBreak();
        addFloater('Phantom Blast Absorbed by Shield!', '#f43f5e');
      } else {
        setPlayerHp(hp => Math.max(0, hp - 25));
        sound.shieldBreak();
        addFloater('Direct Hit! -25 HP!', '#e11d48');
        if (playerHp - 25 <= 0) {
          handleDefeat();
          return;
        }
      }
    } else {
      addFloater('DODGED Phantom Blast!', '#38bdf8');
    }

    // Prepare next turn
    generateTelegraph();
    setTurn('player');
    setTurnCount(c => c + 1);
  };

  const handleVictory = () => {
    sound.victory();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

    setTimeout(() => {
      onBattleComplete({
        victory: true,
        bossDefeated: mode === 'phantom_boss',
        xpEarned: mode === 'phantom_boss' ? 150 : 50,
        coinsEarned: mode === 'phantom_boss' ? 80 : 30,
        attempted,
        correct
      });
    }, 1600);
  };

  const handleDefeat = () => {
    sound.shieldBreak();
    setTimeout(() => {
      onBattleComplete({
        victory: false,
        bossDefeated: false,
        xpEarned: 15,
        coinsEarned: 10,
        attempted,
        correct
      });
    }, 1200);
  };

  const currentOpponentName = mode === 'phantom_boss'
    ? lesson.bossFight.bossName
    : activeMathProblem?.mobName || 'Arena Opponent';

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-between min-h-[85vh] p-3 md:p-6 select-none">
      {/* 1. TURN TIMELINE BAR (FF Tactics Style) */}
      <div className="w-full bg-slate-950/90 border-2 border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-xl mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Timeline:</span>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 border transition ${
              turn === 'player'
                ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <span>{monster?.icon || '🦊'}</span>
              <span>{monster?.name || 'Player'}</span>
            </span>

            <span className="text-slate-600">➔</span>

            <span className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 border transition ${
              turn === 'enemy'
                ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-400/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <span>{mode === 'phantom_boss' ? '👻' : '👾'}</span>
              <span>{currentOpponentName}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1 text-emerald-400">
            <Shield className="w-4 h-4" />
            <span className="font-bold">{shields} Shields</span>
          </div>
          <span className="text-slate-400 font-bold">Turn {turnCount}</span>
        </div>
      </div>

      {/* 2. COMBAT HEADERS & HEALTH BARS */}
      <div className="w-full grid grid-cols-2 gap-4 mb-4">
        {/* Player Stats */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-2xl shadow">
            {monster?.icon || '🦊'}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-amber-400">{monster?.name} (Lvl {playerProfile?.level || 1})</span>
              <span className="text-slate-300">{playerHp}/100 HP</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full mt-1.5 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${playerHp}%` }}
              />
            </div>
          </div>
        </div>

        {/* Boss / Opponent Stats */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between items-center text-xs font-bold font-mono">
              <span className="text-purple-400">{currentOpponentName}</span>
              <span className="text-slate-300">{bossHp}/100 HP</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full mt-1.5 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  isEnragedPhase
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                }`}
                style={{ width: `${bossHp}%` }}
              />
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow ${
            isEnragedPhase ? 'bg-gradient-to-br from-purple-700 to-rose-800 animate-pulse' : 'bg-slate-800'
          }`}>
            {mode === 'phantom_boss' ? (isEnragedPhase ? '👾' : '👻') : '👾'}
          </div>
        </div>
      </div>

      {/* FLOATING TEXT NOTIFICATIONS */}
      <div className="absolute top-28 z-40 pointer-events-none flex flex-col items-center gap-1">
        {floaters.map(f => (
          <div
            key={f.id}
            className="px-4 py-1 rounded-full font-black text-sm md:text-base font-mono shadow-2xl animate-bounce"
            style={{ backgroundColor: 'rgba(0,0,0,0.85)', color: f.color, border: `2px solid ${f.color}` }}
          >
            {f.text}
          </div>
        ))}
      </div>

      {/* 3. TACTICAL MICRO-GRID (5x3 Tiles) */}
      <div className="relative w-full max-w-3xl my-auto py-4">
        <div className="grid grid-cols-5 gap-2.5 md:gap-3.5 p-3 md:p-5 bg-slate-950/80 rounded-2xl border-2 border-slate-800 shadow-2xl">
          {Array.from({ length: GRID_ROWS }).map((_, r) =>
            Array.from({ length: GRID_COLS }).map((_, c) => {
              const isPlayerHere = playerPos.x === c && playerPos.y === r;
              const isBossHere = bossPos.x === c && bossPos.y === r;
              const isTelegraphed = telegraphedTiles.some(t => t.x === c && t.y === r);
              const specialTile = specialTiles.find(t => t.x === c && t.y === r);

              // Movement reach calculation
              const dist = Math.abs(c - playerPos.x) + Math.abs(r - playerPos.y);
              const canMoveHere = moveMode && dist > 0 && dist <= 2 && !isBossHere;

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleTileClick(c, r)}
                  className={`relative aspect-square rounded-xl border-2 transition-all duration-200 flex items-center justify-center font-mono cursor-pointer ${
                    isPlayerHere
                      ? 'bg-amber-950/70 border-amber-400 ring-4 ring-amber-400/30 z-20 scale-105'
                      : isBossHere
                      ? isEnragedPhase
                        ? 'bg-rose-950/80 border-rose-500 ring-4 ring-rose-500/40 z-20'
                        : 'bg-purple-950/70 border-purple-500 ring-4 ring-purple-500/30 z-20'
                      : canMoveHere
                      ? 'bg-cyan-950/70 border-cyan-400 hover:bg-cyan-900/80 animate-pulse'
                      : isTelegraphed
                      ? 'bg-rose-950/50 border-rose-600/90 shadow-[inset_0_0_15px_rgba(244,63,94,0.4)]'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/90'
                  }`}
                >
                  {/* Danger Zone Telegraph Marker */}
                  {isTelegraphed && !isPlayerHere && !isBossHere && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-70">
                      <AlertOctagon className="w-5 h-5 text-rose-500 animate-spin" />
                    </div>
                  )}

                  {/* Special Rune / Coin Tile */}
                  {specialTile && !isPlayerHere && !isBossHere && (
                    <span className="text-xl md:text-2xl animate-bounce">{specialTile.icon}</span>
                  )}

                  {/* Player Sprite */}
                  {isPlayerHere && (
                    <div className="flex flex-col items-center">
                      <span className="text-3xl md:text-4xl filter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                        {monster?.icon || '🦊'}
                      </span>
                      <span className="text-[10px] font-bold text-amber-300 font-mono mt-0.5">YOU</span>
                    </div>
                  )}

                  {/* Boss Sprite */}
                  {isBossHere && (
                    <div className="flex flex-col items-center">
                      <span className="text-3xl md:text-4xl filter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] animate-pulse">
                        {mode === 'phantom_boss' ? (isEnragedPhase ? '👾' : '👻') : '👾'}
                      </span>
                      <span className="text-[10px] font-bold text-purple-300 font-mono mt-0.5">BOSS</span>
                    </div>
                  )}

                  {/* Move Target indicator */}
                  {canMoveHere && (
                    <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. TACTICAL COMMAND MENU (FF Tactics Style) */}
      <div className="w-full bg-slate-950/95 border-2 border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-2">
          {/* CAST / ACT (Opens Math Problem) */}
          <button
            onClick={handleCastAction}
            disabled={turn !== 'player'}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm md:text-base border-2 border-amber-300 shadow-lg active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>⚔️ CAST / ACT</span>
          </button>

          {/* MOVE */}
          <button
            onClick={handleMoveAction}
            disabled={turn !== 'player'}
            className={`px-4 py-3 rounded-xl font-bold text-sm md:text-base border-2 shadow active:scale-95 transition disabled:opacity-50 flex items-center gap-2 ${
              moveMode
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-2 ring-cyan-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <span>🏃 MOVE</span>
          </button>

          {/* GUARD */}
          <button
            onClick={handleGuardAction}
            disabled={turn !== 'player'}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm md:text-base border border-slate-700 shadow active:scale-95 transition disabled:opacity-50"
          >
            🛡️ GUARD
          </button>
        </div>

        {/* Exit & Grimoire Quick Access */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onExitArena()}
            className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition"
          >
            Retreat to Camp
          </button>
        </div>
      </div>

      {/* MATH ACTION MODAL */}
      <MathModal
        isOpen={isMathModalOpen}
        problem={activeMathProblem}
        lesson={lesson}
        monster={monster}
        shields={shields}
        onSolve={handleMathSolved}
        onMistake={handleMathMistake}
        onClose={() => setIsMathModalOpen(false)}
      />
    </div>
  );
}
