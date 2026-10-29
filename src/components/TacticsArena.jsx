import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import MathModal from './MathModal';

export default function TacticsArena({
  lesson,
  playerProfile,
  monster,
  mode, // 'grind' or 'phantom_boss'
  onBattleComplete,
  onExitArena
}) {
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [shields, setShields] = useState(playerProfile?.shields || 2);
  const [selectedAction, setSelectedAction] = useState('ATTACK'); // 'MOVE' | 'ATTACK' | 'SKILL' | 'END'
  const [turn, setTurn] = useState('player');
  const [turnCount, setTurnCount] = useState(1);
  const [floaters, setFloaters] = useState([]);
  const [isMathOpen, setIsMathOpen] = useState(false);
  const [activeProblem, setActiveProblem] = useState(null);
  const [isPhantomEnraged, setIsPhantomEnraged] = useState(false);
  const [bossPhase, setBossPhase] = useState(1);
  const [grindIndex, setGrindIndex] = useState(0);
  const [bossPartIndex, setBossPartIndex] = useState(0);
  const [attackAnimation, setAttackAnimation] = useState(null); // 'fire' | 'water' | 'phantom'

  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);

  // Tactical positions on the floating island (percentage-based on 1024x572 image)
  const [playerPos, setPlayerPos] = useState({ x: 30, y: 55, name: 'Flame Warrior' });
  const [activeMoveTile, setActiveMoveTile] = useState(null);

  // Valid move tiles on the stone island
  const moveTiles = [
    { id: 1, x: 28, y: 53, label: 'High Step' },
    { id: 2, x: 36, y: 48, label: 'Rune Tile' },
    { id: 3, x: 44, y: 55, label: 'Center Flag' },
    { id: 4, x: 50, y: 64, label: 'Water Spring' },
    { id: 5, x: 56, y: 46, label: 'Near Boss' }
  ];

  useEffect(() => {
    if (mode === 'grind') {
      const q = lesson.grindQueue[grindIndex % lesson.grindQueue.length];
      setActiveProblem(q);
    } else {
      const p1Part = lesson.bossFight.phase1.partA;
      setActiveProblem({
        ...p1Part,
        mobName: `${lesson.bossFight.bossName} [PHASE 1]`
      });
    }
  }, [lesson, mode, grindIndex]);

  const addFloater = (text, color = '#facc15', position = 'boss') => {
    const id = Date.now() + Math.random();
    setFloaters(prev => [...prev, { id, text, color, position }]);
    setTimeout(() => {
      setFloaters(prev => prev.filter(f => f.id !== id));
    }, 1400);
  };

  const handleMenuClick = (action) => {
    sound.move();
    setSelectedAction(action);

    if (action === 'ATTACK' || action === 'SKILL') {
      setIsMathOpen(true);
    } else if (action === 'MOVE') {
      addFloater('SELECT BLUE TILE', '#38bdf8', 'center');
    } else if (action === 'END') {
      endPlayerTurn();
    }
  };

  const handleTileClick = (tile) => {
    if (selectedAction !== 'MOVE') return;
    sound.move();
    setPlayerPos({ x: tile.x, y: tile.y, name: tile.label });
    addFloater('MOVED!', '#38bdf8', 'player');
    setSelectedAction('ATTACK');
  };

  const handleMathSolved = (problem) => {
    setIsMathOpen(false);
    setAttempted(a => a + 1);
    setCorrect(c => c + 1);

    // Trigger visual elemental attack lunge
    setAttackAnimation('fire');
    sound.criticalHit();

    setTimeout(() => {
      setAttackAnimation(null);
    }, 600);

    if (mode === 'grind') {
      const dmg = 35;
      addFloater(`-${dmg} HP!`, '#ef4444', 'boss');
      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);

      if (nextHp <= 0) {
        handleVictory();
      } else {
        setGrindIndex(i => i + 1);
        endPlayerTurn();
      }
    } else {
      const dmg = problem.damage || 25;
      addFloater(`CRIT! -${dmg} HP`, '#f43f5e', 'boss');
      const nextHp = Math.max(0, bossHp - dmg);
      setBossHp(nextHp);

      if (nextHp <= 50 && bossPhase === 1) {
        setBossPhase(2);
        setIsPhantomEnraged(true);
        addFloater('⚠️ ENRAGED CORE!', '#ff0000', 'boss');
        const p2A = lesson.bossFight.phase2.partA;
        setActiveProblem({
          ...p2A,
          mobName: `${lesson.bossFight.bossName} [ENRAGED]`
        });
        endPlayerTurn();
      } else if (nextHp <= 0) {
        handleVictory();
      } else {
        advanceBossPart();
        endPlayerTurn();
      }
    }
  };

  const advanceBossPart = () => {
    if (bossPhase === 1) {
      const p1B = lesson.bossFight.phase1.partB;
      setActiveProblem({
        ...p1B,
        mobName: `${lesson.bossFight.bossName} [PHASE 1]`
      });
    } else {
      if (bossPartIndex === 0) {
        setBossPartIndex(1);
        const p2B = lesson.bossFight.phase2.partB;
        setActiveProblem({
          ...p2B,
          mobName: `${lesson.bossFight.bossName} [ENRAGED]`
        });
      } else {
        const p2C = lesson.bossFight.phase2.partC;
        setActiveProblem({
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
      addFloater('SHIELD BROKEN!', '#38bdf8', 'player');
    } else {
      setPlayerHp(hp => Math.max(0, hp - 35));
      sound.shieldBreak();
      addFloater('-35 HP DAMAGE!', '#e11d48', 'player');
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
    // Phantom counter attacks
    setAttackAnimation('phantom');
    sound.shieldBreak();

    setTimeout(() => {
      setAttackAnimation(null);
    }, 600);

    if (shields > 0) {
      setShields(s => s - 1);
      addFloater('BLOCKED BY SHIELD!', '#38bdf8', 'player');
    } else {
      setPlayerHp(hp => Math.max(0, hp - 20));
      addFloater('PHANTOM STRIKE -20 HP!', '#e11d48', 'player');
      if (playerHp - 20 <= 0) {
        handleDefeat();
        return;
      }
    }

    setTurn('player');
    setTurnCount(c => c + 1);
  };

  const handleVictory = () => {
    sound.victory();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    setTimeout(() => {
      onBattleComplete({
        victory: true,
        bossDefeated: mode === 'phantom_boss',
        xpEarned: mode === 'phantom_boss' ? 160 : 60,
        coinsEarned: mode === 'phantom_boss' ? 90 : 35,
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

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-between min-h-[92vh] p-2 md:p-3 select-none bg-black">
      
      {/* 1. TOP RETRO TURN TIMELINE (Exact match to Image 2) */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800 font-mono text-[10px]">
        {/* Timeline queue with character portraits */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <div className="w-6 h-6 rounded bg-indigo-950 border border-indigo-500 flex items-center justify-center text-[10px] text-indigo-300 font-bold">
            ⚔️
          </div>
          <div className="h-0.5 w-3 bg-slate-700" />
          
          {[
            { id: 1, name: 'Dragon', color: 'border-slate-500 bg-slate-800' },
            { id: 2, name: 'Flame', color: 'border-amber-400 bg-amber-950' },
            { id: 3, name: 'Nature', color: 'border-emerald-400 bg-emerald-950' },
            { id: 4, name: 'Phantom', color: 'border-purple-500 bg-purple-950' },
            { id: 5, name: 'Water', color: 'border-cyan-400 bg-cyan-950' },
            { id: 6, name: 'Phantom', color: 'border-purple-500 bg-purple-950' },
            { id: 7, name: 'Flame', color: 'border-amber-400 bg-amber-950' }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`w-5 h-5 rounded-sm border flex items-center justify-center text-[8px] font-bold ${item.color} ${
                idx === 1 && turn === 'player' ? 'ring-2 ring-amber-300 scale-110' : ''
              }`}
            >
              {item.name[0]}
            </div>
          ))}
        </div>

        {/* Resources & Status */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-emerald-400 font-bold">🛡️ {shields} SHIELDS</span>
          <span className="text-amber-400 font-bold">💰 {playerProfile?.coins || 0} G</span>
          <button
            onClick={onExitArena}
            className="px-2 py-0.5 text-[8px] text-slate-400 hover:text-white bg-slate-900 border border-slate-700 rounded"
          >
            EXIT
          </button>
        </div>
      </div>

      {/* 2. THE CELESTIAL TACTICAL ISLAND (Direct from Image 2!) */}
      <div className="relative w-full max-w-4xl aspect-[1024/572] my-auto rounded-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] border-2 border-slate-800">
        
        {/* Background Artwork Image */}
        <img
          src="/assets/celestial_tactics_bg.jpg"
          alt="Celestial Tactics Arena"
          className="w-full h-full object-cover object-center select-none pointer-events-none"
        />

        {/* FLOATING HEALTH & STATUS BARS OVER CHARACTERS */}
        {/* Flame Warrior HP Bar */}
        <div className="absolute top-[41%] left-[26%] flex flex-col items-center pointer-events-none">
          <div className="bg-black/90 border border-amber-400/80 px-2 py-0.5 rounded text-[8px] font-mono text-amber-300 font-bold flex items-center gap-1 shadow">
            <span>🔥 HE/AP</span>
            <div className="w-12 h-1.5 bg-slate-900 border border-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${playerHp}%` }}
              />
            </div>
          </div>
        </div>

        {/* Percentage Phantom Boss HP Bar */}
        <div className="absolute top-[23%] left-[58%] flex flex-col items-center pointer-events-none">
          <div className="bg-black/90 border border-purple-500 px-2.5 py-0.5 rounded text-[8px] font-mono text-purple-300 font-bold flex items-center gap-1 shadow">
            <span>👻 PHANTOM</span>
            <div className="w-16 h-2 bg-slate-900 border border-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isPhantomEnraged ? 'bg-rose-500' : 'bg-purple-500'}`}
                style={{ width: `${bossHp}%` }}
              />
            </div>
          </div>
        </div>

        {/* INTERACTIVE CLICKABLE MOVEMENT TILES (Directly on stone steps) */}
        {selectedAction === 'MOVE' && moveTiles.map((tile) => (
          <div
            key={tile.id}
            onClick={() => handleTileClick(tile)}
            style={{ top: `${tile.y}%`, left: `${tile.x}%` }}
            className="absolute w-12 h-8 -ml-6 -mt-4 bg-cyan-400/35 border-2 border-cyan-300 rounded cursor-pointer animate-pulse hover:bg-cyan-300/60 shadow-[0_0_15px_#38bdf8] flex items-center justify-center"
          >
            <span className="text-[9px] font-mono font-bold text-white drop-shadow">►</span>
          </div>
        ))}

        {/* ATTACK ANIMATION OVERLAY */}
        {attackAnimation === 'fire' && (
          <div className="absolute top-[28%] left-[62%] -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none animate-ping">
            <span className="text-5xl">💥🔥</span>
          </div>
        )}

        {attackAnimation === 'phantom' && (
          <div className="absolute top-[48%] left-[32%] -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none animate-ping">
            <span className="text-5xl">⚡💜</span>
          </div>
        )}

        {/* FLOATING DAMAGE NUMBERS */}
        {floaters.map(f => (
          <div
            key={f.id}
            style={{
              top: f.position === 'boss' ? '22%' : f.position === 'player' ? '42%' : '50%',
              left: f.position === 'boss' ? '68%' : f.position === 'player' ? '28%' : '50%',
              borderColor: f.color,
              color: f.color
            }}
            className="absolute z-40 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-black/90 border border-slate-700 font-mono font-black text-xs md:text-sm animate-bounce shadow-2xl rounded"
          >
            {f.text}
          </div>
        ))}

        {/* 3. RETRO TACTICAL ACTION MENU (Bottom Right - Exact Match to Image 2!) */}
        <div className="absolute bottom-3 right-3 z-30">
          <div className="bg-[#182032]/95 border-2 border-[#54627a] rounded px-3 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.9)] font-mono text-xs w-32">
            {[
              { key: 'MOVE', label: 'MOVE' },
              { key: 'ATTACK', label: 'ATTACK' },
              { key: 'SKILL', label: 'SKILL' },
              { key: 'END', label: 'END' }
            ].map((cmd) => (
              <div
                key={cmd.key}
                onClick={() => handleMenuClick(cmd.key)}
                className={`py-1 px-1 cursor-pointer flex items-center gap-1.5 transition ${
                  selectedAction === cmd.key
                    ? 'text-white font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className="w-2.5 text-slate-100 font-bold">
                  {selectedAction === cmd.key ? '►' : ''}
                </span>
                <span className="tracking-wider">{cmd.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. MATH ACTION WINDOW (Slides open on ATTACK / SKILL) */}
      <MathModal
        isOpen={isMathOpen}
        problem={activeProblem}
        lesson={lesson}
        monster={monster}
        shields={shields}
        onSolve={handleMathSolved}
        onMistake={handleMathMistake}
        onClose={() => setIsMathOpen(false)}
      />
    </div>
  );
}
