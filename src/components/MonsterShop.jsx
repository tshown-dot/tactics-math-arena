import React from 'react';
import { ShoppingBag, Shield, Zap, Sparkles, Check, ArrowLeft } from 'lucide-react';
import { SHOP_ITEMS } from '../data/monsters';
import { sound } from '../utils/audio';

export default function MonsterShop({ playerProfile, onUpdateProfile, onBack }) {
  const currentCoins = playerProfile?.coins || 0;
  const currentUpgrades = playerProfile?.upgrades || { armor: 0, magnet: 0, scrolls: 1 };

  const handleBuy = (item) => {
    if (currentCoins < item.cost) {
      sound.shieldBreak();
      return;
    }

    sound.coin();
    const updatedCoins = currentCoins - item.cost;
    const updatedUpgrades = {
      ...currentUpgrades,
      [item.upgradeKey]: (currentUpgrades[item.upgradeKey] || 0) + 1
    };

    // If bought shield armor, increase starting shields
    let updatedShields = playerProfile?.shields || 1;
    if (item.upgradeKey === 'armor') {
      updatedShields += 1;
    }

    onUpdateProfile({
      ...playerProfile,
      coins: updatedCoins,
      upgrades: updatedUpgrades,
      shields: updatedShields
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 select-none animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl font-mono text-xs flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Camp</span>
        </button>

        <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-600/70 px-4 py-1.5 rounded-full font-mono">
          <span className="text-amber-400 font-bold text-sm">💰 {currentCoins} Arena Coins</span>
        </div>
      </div>

      <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
            🛍️
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-amber-400 font-mono tracking-wide">
              The Monster Bazaar
            </h2>
            <p className="text-xs text-slate-400">
              Upgrade your battle gear and unlock abilities with coins earned from math mastery.
            </p>
          </div>
        </div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SHOP_ITEMS.map((item) => {
            const ownedCount = currentUpgrades[item.upgradeKey] || 0;
            const canAfford = currentCoins >= item.cost;

            return (
              <div
                key={item.id}
                className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800">
                      {item.icon}
                    </span>
                    <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-700/60 text-amber-300 font-mono font-bold text-xs rounded-lg">
                      💰 {item.cost}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-sm md:text-base font-mono mb-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Owned: <strong className="text-amber-400">{ownedCount}</strong>
                  </span>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-xl font-bold font-mono text-xs transition active:scale-95 ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Purchase
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
