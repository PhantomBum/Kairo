export const EFFECTS = {
  none: { label: 'None', elite: false },

  // Free effects
  crimson_flames:      { label: 'Crimson Flames',      elite: false, desc: 'Realistic flames rising from below' },
  cherry_blossoms:     { label: 'Cherry Blossoms',     elite: false, desc: 'Gentle petal drift' },
  golden_stars:        { label: 'Golden Stars',         elite: false, desc: 'Twinkling star shapes' },
  neon_lines:          { label: 'Neon Lines',           elite: false, desc: 'Circuit board light paths' },
  ink_wash:            { label: 'Ink Wash',             elite: false, desc: 'Slow watercolor blooms' },
  aurora:              { label: 'Aurora',               elite: false, desc: 'Northern lights ribbons' },
  embers:              { label: 'Embers',               elite: false, desc: 'Rising warm particles' },
  ocean_waves:         { label: 'Ocean Waves',          elite: false, desc: 'Rhythmic wave shapes' },
  lightning_storm:     { label: 'Lightning Storm',      elite: false, desc: 'Electric bolt flashes' },
  holographic_shimmer: { label: 'Holographic Shimmer',  elite: false, desc: 'Rainbow prismatic sweep' },

  // Elite only
  solar_flare:         { label: 'Solar Flare',          elite: true, desc: 'Plasma arcs in orange and gold' },
  deep_space:          { label: 'Deep Space',           elite: true, desc: 'Nebula drifts and stars' },
  sakura_storm:        { label: 'Sakura Storm',         elite: true, desc: 'Intense petal gusts' },
  void_rift:           { label: 'Void Rift',            elite: true, desc: 'Dark cracks with purple energy' },
  crystalline:         { label: 'Crystalline',          elite: true, desc: 'Rotating crystal refractions' },
  dragon_scale:        { label: 'Dragon Scale',         elite: true, desc: 'Shimmering scale textures' },
};

export const FREE_EFFECTS = Object.entries(EFFECTS).filter(([k, v]) => !v.elite && k !== 'none').map(([k]) => k);
export const ELITE_EFFECTS = Object.entries(EFFECTS).filter(([, v]) => v.elite).map(([k]) => k);