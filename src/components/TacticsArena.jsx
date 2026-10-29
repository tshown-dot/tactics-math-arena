import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import MathModal from './MathModal';
import {
  IgnisSprite,
  HydraSprite,
  VoltSprite,
  PercentagePhantomSprite,
  SlimeSprite,
  PixelHeartIcon,
  PixelShieldIcon,
  PixelCoinIcon
} from './PixelSprites';

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
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 1 });
  const [bossPos, setBossPos] = useState({ x: 4, y: 1 });
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [shields, setShields] = useState(playerProfile?.shields || 1);
  const [turn, setTurn] = useState('player');
  const [turnCount, setTurnCount] = useState(1);
  const [moveMode, setMoveMode] = useState(false);
  const [telegraphedTiles, setTelegraphedTiles] = useState([]);
  const [activeMathProblem, setActiveMathProblem] = useState(null);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [specialTiles, setSpecialTiles] = useState([
    { x: 1, y: 0, type: 'rune' },
    { x: 2, y: 2, type: 'shield' },
    { x: 3, y: 0, type: 'coin' }
  ]);
  const [floaters, setFloaters] = useState([]);
  const [isEnragedPhase, setIsEnragedPhase] = useState(false);
  const [bossPhase, setBossPhase] = useState(1);
  const [bossPartIndex, setBossPartIndex] = useState(0);
  const [grindIndex, setGrindIndex] = useState(0);

  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    if (mode === 'grind') {
      const q = lesson.grindQueue[grindIndex % lesson.grindQueue.length];
      setActiveMathProblem(q);
    } else {
      const p1Part = lesson.bossFight.phase1.partA;
      setActiveMathProblem({
        ...p1Part,
        mobName: `${lesson.bossFight.bossName} [PHASE 1]`
      });
    }
    generateTelegraph();
  }, [lesson, mode, grindIndex]);

  const addFloater = (text, color = '#facc15') => {
    const id = Date.now() + Math.random();
    setFloaters(prev => [...prev, { id, text, color }]);
    setTimeout(() => {
      setFloaters(prev => prev.filter(f => f.id !== id));
    }, 1400);
  };

  const generateTelegraph = () => {
    const targetY = Math.floor(Math.random() * GRID_ROWS);
    const targetX = Math.floor(Math.random() * 2);
    setTelegraphedTiles([{ x: targetX, y: targetY }]);
  };

  const handleTileClick = (x, y) => {
    if (!moveMode) return;

    const dist = Math.abs(x - playerPos.x) + Math.abs(y - playerPos.y);
    if (dist > 0 && dist <= 2 && !(x === bossPos.x && y === bossPos.y)) {
      setPlayerPos({ x, y });
      setMoveMode(false);
      sound.move();
      addFloater('STEP', '#38bdf8');

      const tileIdx = specialTiles.findIndex(t => t.x === x && t.y === y);
      if (tileIdx !== -1) {
        const found = specialTiles[tileIdx];
        if (found.type === 'shield') {
          setShields(s => s + 1);
          sound.coin();
          addFloater('+1 SHIELD!', '#10b981');
        } else if (found.type === 'coin') {
          sound.coin();
          addFloater('+25 COINS!', '#fbbf24');
        } else if (found.type === 'rune') {
          sound.hit();
          addFloater('ATK SURGE!', '#c084fc');
        }
        setSpecialTiles(prev => prev.filter((_, idx) => idx !== tileIdx));
      }
    }
  };

  const handleCastAction = () => {
    sound.move();
    setIsMathModalOpen(true);
  };

  const handleGuardAction = () => {
    sound.move();
    setShields(s => s + 1);
    addFloater('+1 SHIELD', '#10b981');
    endPlayerTurn();
  };

  const handleMathSolved = (problem) => {
    setIsMathModalOpen(false);
    setAttempted(a => a + 1);
    setCorrect(c => c + 1);

    if (mode === 'grind') {
      const dmg = 35;
      sound.criticalHit();
      addFloater(`CRIT! -${dmg} HP`, '#ef4444');
      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);

      if (nextHp <= 0) {
        handleVictory();
      } else {
        setGrindIndex(idx => idx + 1);
        endPlayerTurn();
      }
    } else {
      const dmg = problem.damage || 25;
      sound.criticalHit();
      addFloater(`SLASH! -${dmg} HP`, '#f43f5e');
      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);

      if (nextHp <= 50 && bossPhase === 1) {
        setBossPhase(2);
        setIsEnragedPhase(true);
        addFloater('⚠️ ENRAGED CORE EXPOSED!', '#ff0000');
        const p2A = lesson.bossFight.phase2.partA;
        setActiveMathProblem({
          ...p2A,
          mobName: `${lesson.bossFight.bossName} [ENRAGED]`
        });
        endPlayerTurn();
      } else if (nextHp <= 0) {
        handleVictory();
      } else {
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
        mobName: `${lesson.bossFight.bossName} [PHASE 1]`
      });
    } else {
      if (bossPartIndex === 0) {
        setBossPartIndex(1);
        const p2B = lesson.bossFight.phase2.partB;
        setActiveMathProblem({
          ...p2B,
          mobName: `${lesson.bossFight.bossName} [ENRAGED]`
        });
      } else {
        const p2C = lesson.bossFight.phase2.partC;
        setActiveMathProblem({
          ...p2C,
          mobName: `${lesson.bossFight.bossName} [FINAL]`
        });
      }
    }
  };

  const handleMathMistake = () => {
    setAttempted(a => a + 1);

    if (shields > 0) {
      setShields(s => s - 1);
      sound.shieldBreak();
      addFloater('SHIELD BROKEN!', '#fb7185');
    } else {
      setPlayerHp(hp => Math.max(0, hp - 35));
      sound.shieldBreak();
      addFloater('-35 HP HIT!', '#e11d48');
      if (playerHp - 35 <= 0) {
        handleDefeat();
      }
    }
  };

  const endPlayerTurn = () => {
    setTurn('enemy');
    setTimeout(() => {
      resolveEnemyTurn();
    }, 1100);
  };

  const resolveEnemyTurn = () => {
    const hit = telegraphedTiles.some(t => t.x === playerPos.x && t.y === playerPos.y);
    if (hit) {
      if (shields > 0) {
        setShields(s => s - 1);
        sound.shieldBreak();
        addFloater('SHIELD BLOCKED BLAST!', '#f43f5e');
      } else {
        setPlayerHp(hp => Math.max(0, hp - 25));
        sound.shieldBreak();
        addFloater('BLAST! -25 HP', '#e11d48');
        if (playerHp - 25 <= 0) {
          handleDefeat();
          return;
        }
      }
    } else {
      addFloater('EVADED BLAST!', '#38bdf8');
    }

    generateTelegraph();
    setTurn('player');
    setTurnCount(c => c + 1);
  };

  const handleVictory = () => {
    sound.victory();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      onBattleComplete({
        victory: true,
        bossDefeated: mode === 'phantom_boss',
        xpEarned: mode === 'phantom_boss' ? 150 : 50,
        coinsEarned: mode === 'phantom_boss' ? 80 : 30,
        attempted,
        correct
      });
    }, 1500);
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

  const renderPlayerSprite = (size = 48) => {
    if (monster?.id === 'hydra') return <HydraSprite size={size} />;
    if (monster?.id === 'volt') return <VoltSprite size={size} />;
    return <IgnisSprite size={size} />;
  };

  const renderOpponentSprite = (size = 54) => {
    if (mode === 'phantom_boss') {
      return <PercentagePhantomSprite size={size} enraged={isEnragedPhase} />;
    }
    return <SlimeSprite size={size - 10} />;
  };

  const opponentName = mode === 'phantom_boss' ? 'PHANTOM' : (activeMathProblem?.mobName || 'SLIME');

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-between min-h-[90vh] p-2 md:p-4 select-none">
      
      {/* 1. TOP CT TURN TIMELINE & COMBAT STATUS (16-Bit Style) */}
      <div className="w-full fft-box p-3 mb-2 flex items-center justify-between">
        {/* Left: Player CT Tag */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 border-2 border-amber-400 flex items-center justify-center">
            {renderPlayerSprite(32)}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-amber-300 font-bold">{monster?.name?.toUpperCase()}</span>
              <span className="text-slate-400">LV.{playerProfile?.level || 1}</span>
            </div>
            {/* Pixel HP Bar */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] text-emerald-400">HP</span>
              <div className="w-20 md:w-28 h-2.5 bg-black border border-slate-700">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${playerHp}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-300">{playerHp}</span>
            </div>
          </div>
        </div>

        {/* Center: Turn Indicator */}
        <div className="text-center font-mono">
          <div className={`px-2 py-0.5 text-[9px] uppercase border ${
            turn === 'player'
              ? 'bg-amber-500 text-black border-amber-300 font-black'
              : 'bg-purple-950 text-purple-300 border-purple-600 font-bold'
          }`}>
            {turn === 'player' ? '► PLAYER TURN' : 'ENEMY CAST'}
          </div>
          <div className="text-[8px] text-slate-400 mt-1">TURN {turnCount}</div>
        </div>

        {/* Right: Boss CT Tag */}
        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="flex items-center justify-end gap-1.5 text-[10px]">
              <span className={isEnragedPhase ? 'text-rose-400 font-bold' : 'text-purple-300 font-bold'}>
                {opponentName}
              </span>
            </div>
            {/* Boss Pixel HP Bar */}
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <span className="text-[9px] text-slate-300">{bossHp}</span>
              <div className="w-20 md:w-28 h-2.5 bg-black border border-slate-700">
                <div
                  className={`h-full transition-all duration-300 ${isEnragedPhase ? 'bg-rose-500' : 'bg-purple-500'}`}
                  style={{ width: `${bossHp}%` }}
                />
              </div>
              <span className="text-[9px] text-purple-400">HP</span>
            </div>
          </div>
          <div className={`w-10 h-10 border-2 flex items-center justify-center ${
            isEnragedPhase ? 'bg-rose-950 border-rose-500' : 'bg-slate-900 border-purple-500'
          }`}>
            {renderOpponentSprite(36)}
          </div>
        </div>
      </div>

      {/* Floating Retro Damage Text */}
      <div className="absolute top-24 z-50 pointer-events-none flex flex-col items-center gap-1 font-mono">
        {floaters.map(f => (
          <div
            key={f.id}
            className="px-3 py-1 bg-black border-2 text-xs md:text-sm font-black shadow-2xl animate-bounce"
            style={{ borderColor: f.color, color: f.color }}
          >
            {f.text}
          </div>
        ))}
      </div>

      {/* 2. ISOMETRIC 3D TACTICAL BATTLEFIELD */}
      <div className="tactics-board-container my-auto py-8 w-full flex items-center justify-center">
        <div className="tactics-board grid grid-cols-5 gap-3 p-4 bg-slate-950/90 border-4 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
          {Array.from({ length: GRID_ROWS }).map((_, r) =>
            Array.from({ length: GRID_COLS }).map((_, c) => {
              const isPlayer = playerPos.x === c && playerPos.y === r;
              const isBoss = bossPos.x === c && bossPos.y === r;
              const isTelegraph = telegraphedTiles.some(t => t.x === c && t.y === r);
              const specialTile = specialTiles.find(t => t.x === c && t.y === r);

              const dist = Math.abs(c - playerPos.x) + Math.abs(r - playerPos.y);
              const canMove = moveMode && dist > 0 && dist <= 2 && !isBoss;

              let tileClass = "tactics-tile w-14 h-14 md:w-20 md:h-20 bg-slate-900 flex items-center justify-center cursor-pointer ";
              if (isPlayer) tileClass += "tactics-tile-active bg-amber-950/40 ";
              else if (isBoss) tileClass += isEnragedPhase ? "tactics-tile-danger " : "border-purple-600 bg-purple-950/40 ";
              else if (canMove) tileClass += "tactics-tile-move ";
              else if (isTelegraph) tileClass += "tactics-tile-danger ";

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleTileClick(c, r)}
                  className={tileClass}
                >
                  {/* Danger Zone Marker */}
                  {isTelegraph && !isPlayer && !isBoss && (
                    <div className="text-[9px] text-rose-500 font-bold animate-pulse">
                      ⚡DANGER
                    </div>
                  )}

                  {/* Special Tiles */}
                  {specialTile && !isPlayer && !isBoss && (
                    <div className="animate-bounce-slight">
                      {specialTile.type === 'shield' && <PixelShieldIcon size={24} />}
                      {specialTile.type === 'coin' && <PixelCoinIcon size={24} />}
                      {specialTile.type === 'rune' && <span className="text-purple-400 font-black text-sm">⚡</span>}
                    </div>
                  )}

                  {/* Character Sprites */}
                  {isPlayer && renderPlayerSprite(48)}
                  {isBoss && renderOpponentSprite(52)}

                  {/* Valid Move Indicator Dot */}
                  {canMove && (
                    <div className="w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. CLASSIC FFT BATTLE COMMAND WINDOW */}
      <div className="w-full fft-box p-3 md:p-4 mt-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Action Commands */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCastAction}
              disabled={turn !== 'player'}
              className="fft-btn-gold px-4 py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>⚔️</span>
              <span>ATTACK</span>
            </button>

            <button
              onClick={() => { sound.move(); setMoveMode(!moveMode); }}
              disabled={turn !== 'player'}
              className={`fft-btn px-4 py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-50 ${
                moveMode ? 'bg-cyan-600 border-cyan-300 text-white' : ''
              }`}
            >
              <span>🏃</span>
              <span>MOVE</span>
            </button>

            <button
              onClick={handleGuardAction}
              disabled={turn !== 'player'}
              className="fft-btn px-4 py-2.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>🛡️</span>
              <span>WAIT</span>
            </button>
          </div>

          {/* Shields & Retreat */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-300 text-[10px]">
              <PixelShieldIcon size={16} />
              <span>{shields} SHIELDS</span>
            </div>

            <button
              onClick={onExitArena}
              className="px-2.5 py-1.5 text-[9px] text-slate-400 hover:text-white bg-slate-900 border border-slate-700 hover:border-slate-500 rounded transition"
            >
              RETREAT
            </button>
          </div>
        </div>
      </div>

      {/* MATH ACTION WINDOW (FFT Dialogue Style) */}
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
