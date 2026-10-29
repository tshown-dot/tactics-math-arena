import React from 'react';

// Common SVG pixel renderer using 16x16 or 24x24 grid with crispEdges
export function PixelCanvas({ size = 48, viewBox = "0 0 16 16", children, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      className={`pixel-art shrink-0 ${className}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      {children}
    </svg>
  );
}

// 1. IGNIS - Fire Beast / Knight (16x16 Pixel Art)
export function IgnisSprite({ size = 48, animate = true }) {
  return (
    <div className={`relative inline-block ${animate ? 'animate-bounce-slight' : ''}`}>
      <PixelCanvas size={size} viewBox="0 0 16 16">
        {/* Shadow */}
        <ellipse cx="8" cy="15" rx="5" ry="1" fill="#050814" opacity="0.6" />
        
        {/* Tail Flames */}
        <rect x="1" y="8" width="2" height="3" fill="#ea580c" />
        <rect x="2" y="7" width="2" height="4" fill="#f97316" />
        <rect x="2" y="9" width="1" height="2" fill="#fde047" />

        {/* Body Armor */}
        <rect x="5" y="7" width="6" height="5" fill="#b91c1c" />
        <rect x="6" y="8" width="4" height="4" fill="#dc2626" />
        <rect x="7" y="9" width="2" height="2" fill="#fbbf24" /> {/* Core plate */}

        {/* Legs / Boots */}
        <rect x="5" y="12" width="2" height="3" fill="#7f1d1d" />
        <rect x="9" y="12" width="2" height="3" fill="#7f1d1d" />

        {/* Head & Ears */}
        <rect x="4" y="2" width="2" height="3" fill="#ea580c" /> {/* Left ear */}
        <rect x="10" y="2" width="2" height="3" fill="#ea580c" /> {/* Right ear */}
        <rect x="5" y="4" width="6" height="4" fill="#f97316" /> {/* Face */}
        <rect x="6" y="3" width="4" height="2" fill="#ea580c" />

        {/* Glowing Eyes */}
        <rect x="6" y="5" width="1" height="1" fill="#fef08a" />
        <rect x="9" y="5" width="1" height="1" fill="#fef08a" />

        {/* Snout */}
        <rect x="7" y="6" width="2" height="1" fill="#450a0a" />

        {/* Flame Crest / Aura */}
        <rect x="7" y="1" width="2" height="2" fill="#fef08a" />
        <rect x="6" y="2" width="4" height="1" fill="#f97316" />

        {/* Right Blade / Paw */}
        <rect x="12" y="6" width="1" height="5" fill="#e2e8f0" />
        <rect x="11" y="8" width="3" height="1" fill="#cbd5e1" />
        <rect x="12" y="11" width="1" height="2" fill="#78350f" />
      </PixelCanvas>
    </div>
  );
}

// 2. HYDRA - Tide Drake (16x16 Pixel Art)
export function HydraSprite({ size = 48, animate = true }) {
  return (
    <div className={`relative inline-block ${animate ? 'animate-bounce-slight' : ''}`}>
      <PixelCanvas size={size} viewBox="0 0 16 16">
        {/* Shadow */}
        <ellipse cx="8" cy="15" rx="5" ry="1" fill="#050814" opacity="0.6" />

        {/* Tail */}
        <rect x="2" y="10" width="3" height="2" fill="#0284c7" />
        <rect x="1" y="9" width="2" height="2" fill="#38bdf8" />

        {/* Body */}
        <rect x="5" y="7" width="6" height="5" fill="#0369a1" />
        <rect x="6" y="8" width="4" height="4" fill="#0284c7" />
        <rect x="7" y="9" width="2" height="3" fill="#bae6fd" />

        {/* Legs */}
        <rect x="5" y="12" width="2" height="3" fill="#075985" />
        <rect x="9" y="12" width="2" height="3" fill="#075985" />

        {/* Aquatic Head & Horns */}
        <rect x="4" y="2" width="2" height="3" fill="#38bdf8" />
        <rect x="10" y="2" width="2" height="3" fill="#38bdf8" />
        <rect x="5" y="4" width="6" height="4" fill="#0284c7" />

        {/* Glowing Eyes */}
        <rect x="6" y="5" width="1" height="1" fill="#a7f3d0" />
        <rect x="9" y="5" width="1" height="1" fill="#a7f3d0" />

        {/* Snout */}
        <rect x="7" y="6" width="2" height="2" fill="#0369a1" />

        {/* Water Crest */}
        <rect x="7" y="1" width="2" height="2" fill="#e0f2fe" />
      </PixelCanvas>
    </div>
  );
}

// 3. VOLT - Spark Golem (16x16 Pixel Art)
export function VoltSprite({ size = 48, animate = true }) {
  return (
    <div className={`relative inline-block ${animate ? 'animate-bounce-slight' : ''}`}>
      <PixelCanvas size={size} viewBox="0 0 16 16">
        {/* Shadow */}
        <ellipse cx="8" cy="15" rx="5" ry="1" fill="#050814" opacity="0.6" />

        {/* Heavy Stone Body */}
        <rect x="4" y="6" width="8" height="6" fill="#334155" />
        <rect x="5" y="7" width="6" height="4" fill="#475569" />

        {/* Glowing Thunder Core */}
        <rect x="7" y="8" width="2" height="2" fill="#facc15" />
        <rect x="6" y="9" width="4" height="1" fill="#fef08a" />

        {/* Heavy Fists */}
        <rect x="2" y="8" width="2" height="4" fill="#1e293b" />
        <rect x="12" y="8" width="2" height="4" fill="#1e293b" />
        <rect x="2" y="7" width="2" height="1" fill="#eab308" />
        <rect x="12" y="7" width="2" height="1" fill="#eab308" />

        {/* Heavy Legs */}
        <rect x="5" y="12" width="2" height="3" fill="#1e293b" />
        <rect x="9" y="12" width="2" height="3" fill="#1e293b" />

        {/* Golem Visor / Head */}
        <rect x="5" y="3" width="6" height="3" fill="#334155" />
        {/* Visor Slit */}
        <rect x="6" y="4" width="4" height="1" fill="#fef08a" />

        {/* Lightning Rods */}
        <rect x="4" y="1" width="1" height="3" fill="#eab308" />
        <rect x="11" y="1" width="1" height="3" fill="#eab308" />
      </PixelCanvas>
    </div>
  );
}

// 4. THE PERCENTAGE PHANTOM - 20x20 Boss Sprite
export function PercentagePhantomSprite({ size = 64, enraged = false }) {
  const robeColor = enraged ? "#4c0519" : "#2e1065";
  const robeShade = enraged ? "#881337" : "#581c87";
  const glowColor = enraged ? "#ef4444" : "#a855f7";
  const eyeColor = enraged ? "#ff0000" : "#38bdf8";
  const coreColor = enraged ? "#f43f5e" : "#c084fc";

  return (
    <div className="relative inline-block animate-float">
      <PixelCanvas size={size} viewBox="0 0 20 20">
        {/* Void Shadow */}
        <ellipse cx="10" cy="18" rx="7" ry="1.5" fill="#000000" opacity="0.7" />

        {/* Spectral Fog / Aura */}
        <rect x="4" y="14" width="2" height="2" fill={glowColor} opacity="0.5" />
        <rect x="14" y="13" width="2" height="2" fill={glowColor} opacity="0.5" />
        <rect x="2" y="11" width="2" height="3" fill={glowColor} opacity="0.4" />
        <rect x="16" y="10" width="2" height="3" fill={glowColor} opacity="0.4" />

        {/* Robes / Ghost Cloak */}
        <rect x="6" y="6" width="8" height="9" fill={robeColor} />
        <rect x="7" y="7" width="6" height="7" fill={robeShade} />
        
        {/* Tattered Bottom Edges */}
        <rect x="5" y="15" width="2" height="2" fill={robeColor} />
        <rect x="8" y="15" width="1" height="3" fill={robeColor} />
        <rect x="10" y="15" width="2" height="2" fill={robeColor} />
        <rect x="13" y="15" width="2" height="3" fill={robeColor} />

        {/* Ghost Hands / Claws */}
        <rect x="3" y="9" width="3" height="3" fill="#cbd5e1" />
        <rect x="2" y="10" width="1" height="2" fill="#94a3b8" />
        <rect x="14" y="9" width="3" height="3" fill="#cbd5e1" />
        <rect x="17" y="10" width="1" height="2" fill="#94a3b8" />

        {/* Mysterious Cowl / Hood */}
        <rect x="5" y="2" width="10" height="5" fill={robeColor} />
        <rect x="6" y="1" width="8" height="2" fill={robeColor} />
        <rect x="6" y="3" width="8" height="3" fill="#05020c" /> {/* Deep shadow inside hood */}

        {/* Glowing Piercing Eyes */}
        <rect x="7" y="4" width="2" height="1" fill={eyeColor} />
        <rect x="11" y="4" width="2" height="1" fill={eyeColor} />

        {/* Pulsing Mathematical Core (The % Symbol in pixel art!) */}
        <rect x="8" y="9" width="1" height="1" fill={coreColor} />
        <rect x="11" y="11" width="1" height="1" fill={coreColor} />
        <rect x="10" y="9" width="1" height="1" fill={coreColor} />
        <rect x="9" y="10" width="1" height="1" fill={coreColor} />
        <rect x="8" y="11" width="1" height="1" fill={coreColor} />

        {/* Crown Horns on Enraged */}
        {enraged && (
          <>
            <rect x="4" y="0" width="2" height="3" fill="#e11d48" />
            <rect x="14" y="0" width="2" height="3" fill="#e11d48" />
            <rect x="9" y="0" width="2" height="2" fill="#facc15" />
          </>
        )}
      </PixelCanvas>
    </div>
  );
}

// 5. SLIME SPRITE (16x16 Pixel Art)
export function SlimeSprite({ size = 36 }) {
  return (
    <div className="relative inline-block animate-bounce-slight">
      <PixelCanvas size={size} viewBox="0 0 16 16">
        <ellipse cx="8" cy="15" rx="5" ry="1" fill="#000" opacity="0.5" />
        <rect x="4" y="8" width="8" height="6" fill="#15803d" />
        <rect x="5" y="6" width="6" height="3" fill="#16a34a" />
        <rect x="7" y="5" width="2" height="2" fill="#4ade80" />
        {/* Shine */}
        <rect x="5" y="7" width="2" height="2" fill="#86efac" />
        {/* Cute Eyes */}
        <rect x="6" y="9" width="1" height="2" fill="#052e16" />
        <rect x="9" y="9" width="1" height="2" fill="#052e16" />
      </PixelCanvas>
    </div>
  );
}

// 6. PIXEL RETRO ICONS
export function PixelHeartIcon({ size = 20 }) {
  return (
    <PixelCanvas size={size} viewBox="0 0 12 12">
      <rect x="2" y="1" width="3" height="2" fill="#ef4444" />
      <rect x="7" y="1" width="3" height="2" fill="#ef4444" />
      <rect x="1" y="3" width="10" height="4" fill="#ef4444" />
      <rect x="2" y="7" width="8" height="2" fill="#dc2626" />
      <rect x="3" y="9" width="6" height="1" fill="#b91c1c" />
      <rect x="4" y="10" width="4" height="1" fill="#991b1b" />
      <rect x="5" y="11" width="2" height="1" fill="#7f1d1d" />
      <rect x="2" y="2" width="1" height="2" fill="#fecaca" />
    </PixelCanvas>
  );
}

export function PixelShieldIcon({ size = 20 }) {
  return (
    <PixelCanvas size={size} viewBox="0 0 12 12">
      <rect x="2" y="1" width="8" height="2" fill="#0284c7" />
      <rect x="1" y="3" width="10" height="4" fill="#0ea5e9" />
      <rect x="2" y="7" width="8" height="2" fill="#0284c7" />
      <rect x="3" y="9" width="6" height="1" fill="#0369a1" />
      <rect x="4" y="10" width="4" height="1" fill="#075985" />
      <rect x="5" y="11" width="2" height="1" fill="#0c4a6e" />
      {/* Emblem */}
      <rect x="5" y="4" width="2" height="4" fill="#fef08a" />
      <rect x="4" y="5" width="4" height="2" fill="#fef08a" />
    </PixelCanvas>
  );
}

export function PixelCoinIcon({ size = 20 }) {
  return (
    <PixelCanvas size={size} viewBox="0 0 12 12">
      <rect x="3" y="1" width="6" height="1" fill="#ca8a04" />
      <rect x="2" y="2" width="8" height="1" fill="#eab308" />
      <rect x="1" y="3" width="10" height="6" fill="#facc15" />
      <rect x="2" y="9" width="8" height="1" fill="#eab308" />
      <rect x="3" y="10" width="6" height="1" fill="#ca8a04" />
      {/* Coin Center */}
      <rect x="5" y="4" width="2" height="4" fill="#a16207" />
      <rect x="3" y="3" width="1" height="2" fill="#fef9c3" />
    </PixelCanvas>
  );
}
