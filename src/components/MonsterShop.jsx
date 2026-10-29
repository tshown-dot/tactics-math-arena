import React from 'react';
import { SHOP_ITEMS } from '../data/monsters';
import { sound } from '../utils/audio';
import { PixelShieldIcon, PixelCoinIcon } from './PixelSprites';

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
    <div className="w-full max-w-4xl mx-auto p-3 md:p-6 select-none font-mono">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="fft-btn px-3 py-1.5 text-[9px] text-slate-200"
        >
          ◄ BACK TO CAMP
        </button>

        <div className="flex items-center gap-1.5 bg-black px-3 py-1.5 border border-amber-600 text-amber-400 text-[10px]">
          <PixelCoinIcon size={16} />
          <span>{currentCoins} G</span>
        </div>
      </div>

      <div className="fft-box p-5 md:p-6">
        <div className="border-b-2 border-amber-500/80 pb-3 mb-5">
          <h2 className="text-sm md:text-base font-black text-amber-400 uppercase tracking-wider">
            ★ ITEM BAZAAR ★
          </h2>
          <p className="text-[8px] text-slate-400 mt-0.5">
            EXCHANGE COINS FOR PERMANENT TACTICAL GEAR
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SHOP_ITEMS.map((item) => {
            const owned = currentUpgrades[item.upgradeKey] || 0;
            const canAfford = currentCoins >= item.cost;

            return (
              <div
                key={item.id}
                className="bg-black/90 border-2 border-slate-700 hover:border-amber-400 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-amber-300 font-bold uppercase">
                      {item.name}
                    </span>
                    <span className="text-[9px] text-amber-400 font-mono">
                      {item.cost} G
                    </span>
                  </div>

                  <p className="text-[8px] text-slate-300 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[8px]">
                  <span className="text-slate-400">
                    OWNED: <strong className="text-amber-400">{owned}</strong>
                  </span>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 text-[8px] font-bold ${
                      canAfford ? 'fft-btn-gold' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    BUY
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
