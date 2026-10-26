// Web Audio API 8-Bit Retro Sound Effects & Chiptune Music Synthesizer
// 100% Procedural synthesis - no external audio files required!

let audioCtx = null;
let bgmGainNode = null;
let sfxGainNode = null;
let masterGainNode = null;

let isMuted = false;
let sfxVolume = 0.7;
let bgmVolume = 0.35;
let isBgmPlaying = false;
let bgmTimeoutId = null;

export function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGainNode = audioCtx.createGain();
      masterGainNode.gain.value = 1.0;
      masterGainNode.connect(audioCtx.destination);

      bgmGainNode = audioCtx.createGain();
      bgmGainNode.gain.value = bgmVolume;
      bgmGainNode.connect(masterGainNode);

      sfxGainNode = audioCtx.createGain();
      sfxGainNode.gain.value = sfxVolume;
      sfxGainNode.connect(masterGainNode);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function initAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}

export function toggleMute() {
  isMuted = !isMuted;
  const ctx = getAudioContext();
  if (ctx && masterGainNode) {
    masterGainNode.gain.setTargetAtTime(isMuted ? 0 : 1.0, ctx.currentTime, 0.05);
  }
  if (!isMuted && !isBgmPlaying) {
    startBGM();
  }
  return isMuted;
}

export function setMasterVolume(val) {
  const ctx = getAudioContext();
  if (ctx && masterGainNode) {
    masterGainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), ctx.currentTime, 0.05);
  }
}

export function setBgmVolume(val) {
  bgmVolume = Math.max(0, Math.min(1, val));
  const ctx = getAudioContext();
  if (ctx && bgmGainNode) {
    bgmGainNode.gain.setTargetAtTime(bgmVolume, ctx.currentTime, 0.05);
  }
}

export function setSfxVolume(val) {
  sfxVolume = Math.max(0, Math.min(1, val));
  const ctx = getAudioContext();
  if (ctx && sfxGainNode) {
    sfxGainNode.gain.setTargetAtTime(sfxVolume, ctx.currentTime, 0.05);
  }
}

export function getAudioState() {
  return {
    isMuted,
    bgmVolume,
    sfxVolume,
    isBgmPlaying
  };
}

// ==================== 8-BIT SOUND EFFECTS (SFX) ====================

// 🔘 Crisp UI Button Click (Soft tactile pop)
export function playUIClickSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

  gain.gain.setValueAtTime(0.22 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  osc.connect(gain);
  gain.connect(sfxGainNode);

  osc.start(now);
  osc.stop(now + 0.05);
}

// 🧱 Pick Tile / Select Brush Chime
export function playTileSelectSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, now); // C5
  osc.frequency.setValueAtTime(659.25, now + 0.04); // E5

  gain.gain.setValueAtTime(0.18 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(sfxGainNode);

  osc.start(now);
  osc.stop(now + 0.1);
}

// 🌱 Plant Seed Rustle (Soil digging & sowing)
export function playPlantSeedSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  // Rustling noise burst + sweet sprout note
  const bufferSize = Math.floor(ctx.sampleRate * 0.08);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(600, now);

  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.35 * sfxVolume, now);
  nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

  noise.connect(filter);
  filter.connect(nGain);
  nGain.connect(sfxGainNode);
  noise.start(now);

  // Soft high pop
  const osc = ctx.createOscillator();
  const oGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, now + 0.03);
  osc.frequency.setValueAtTime(880, now + 0.06);

  oGain.gain.setValueAtTime(0.2 * sfxVolume, now + 0.03);
  oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(oGain);
  oGain.connect(sfxGainNode);
  osc.start(now + 0.03);
  osc.stop(now + 0.13);
}

// 🍓 Harvest Plop & Bell (Juicy pop + reward chime)
export function playHarvestPlopSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;

  // Plop upward sweep
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(250, now);
  osc1.frequency.exponentialRampToValueAtTime(750, now + 0.08);

  gain1.gain.setValueAtTime(0.35 * sfxVolume, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

  osc1.connect(gain1);
  gain1.connect(sfxGainNode);
  osc1.start(now);
  osc1.stop(now + 0.095);

  // Ding bell harmonic
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(1174.66, now + 0.07); // D6
  osc2.frequency.setValueAtTime(1760.00, now + 0.12); // A6

  gain2.gain.setValueAtTime(0.25 * sfxVolume, now + 0.07);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

  osc2.connect(gain2);
  gain2.connect(sfxGainNode);
  osc2.start(now + 0.07);
  osc2.stop(now + 0.3);
}

// 🏪 Market Sell "Ka-Ching!" (Cash register bell & cascade gold coins)
export function playMarketSellSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  // Cash bell ring
  const oscBell = ctx.createOscillator();
  const gainBell = ctx.createGain();
  oscBell.type = 'square';
  oscBell.frequency.setValueAtTime(1567.98, now); // G6
  oscBell.frequency.setValueAtTime(2093.00, now + 0.08); // C7

  gainBell.gain.setValueAtTime(0.22 * sfxVolume, now);
  gainBell.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  oscBell.connect(gainBell);
  gainBell.connect(sfxGainNode);
  oscBell.start(now);
  oscBell.stop(now + 0.36);

  // Cascading coin drops
  const coinTones = [1318.51, 1567.98, 1975.53, 2637.02];
  coinTones.forEach((freq, idx) => {
    const t = now + 0.06 + idx * 0.055;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    g.gain.setValueAtTime(0.28 * sfxVolume, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(g);
    g.connect(sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.13);
  });
}

// 🗺️ Land Chunk Unlocked Fanfare (Triumphant royal brass chime)
export function playLandExpandSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const notes = [
    { f: 392.00, d: 0.10 }, // G4
    { f: 523.25, d: 0.10 }, // C5
    { f: 659.25, d: 0.10 }, // E5
    { f: 783.99, d: 0.25 }  // G5
  ];

  let elapsed = 0;
  notes.forEach(n => {
    const t = now + elapsed;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.f, t);

    g.gain.setValueAtTime(0.3 * sfxVolume, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + n.d);

    osc.connect(g);
    g.connect(sfxGainNode);
    osc.start(t);
    osc.stop(t + n.d + 0.01);
    elapsed += n.d * 0.8;
  });
}

// 📖 Open Modal / Parchment Flip
export function playModalOpenSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(350, now);
  osc.frequency.exponentialRampToValueAtTime(700, now + 0.07);

  gain.gain.setValueAtTime(0.18 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(sfxGainNode);
  osc.start(now);
  osc.stop(now + 0.09);
}

// ❌ Close Modal
export function playModalCloseSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(550, now);
  osc.frequency.exponentialRampToValueAtTime(280, now + 0.06);

  gain.gain.setValueAtTime(0.16 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  osc.connect(gain);
  gain.connect(sfxGainNode);
  osc.start(now);
  osc.stop(now + 0.08);
}

// ⚠️ Error Buzz (Not enough gold / forbidden action)
export function playErrorSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  [0, 0.08].forEach(offset => {
    const t = now + offset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);

    gain.gain.setValueAtTime(0.18 * sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.07);
  });
}

// 🪙 Sweet Coin Collect / Harvest Ding
export function playCoinSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'square';
  osc2.type = 'triangle';

  osc1.frequency.setValueAtTime(987.77, now);
  osc1.frequency.setValueAtTime(1318.51, now + 0.08);

  osc2.frequency.setValueAtTime(987.77, now);
  osc2.frequency.setValueAtTime(1318.51, now + 0.08);

  gain.gain.setValueAtTime(0.25 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(sfxGainNode);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.36);
  osc2.stop(now + 0.36);
}

// 🔨 Wooden Hammer Build Sound
export function playBuildSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

  gain.gain.setValueAtTime(0.3 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  osc.connect(gain);
  gain.connect(sfxGainNode);

  osc.start(now);
  osc.stop(now + 0.15);
}

// ♻️ Demolish / Clear Rubble Sound
export function playDemolishSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const bufferSize = Math.floor(ctx.sampleRate * 0.15);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(450, now);
  filter.frequency.exponentialRampToValueAtTime(60, now + 0.15);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGainNode);

  noise.start(now);
}

// 🔄 Rotate Tile Sound
export function playRotateSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.setValueAtTime(660, now + 0.05);

  gain.gain.setValueAtTime(0.15 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(sfxGainNode);

  osc.start(now);
  osc.stop(now + 0.13);
}

// ⭐ Upgrade Level Up Fanfare
export function playUpgradeSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const noteTime = now + idx * 0.08;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.25 * sfxVolume, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

    osc.connect(gain);
    gain.connect(sfxGainNode);

    osc.start(noteTime);
    osc.stop(noteTime + 0.23);
  });
}

// ⚒️ Blacksmith Anvil Strike (Keng!)
export function playBlacksmithSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(2350, now);
  osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.2);

  osc2.type = 'square';
  osc2.frequency.setValueAtTime(1180, now);

  gain.gain.setValueAtTime(0.2 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(sfxGainNode);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.31);
  osc2.stop(now + 0.31);
}

// 🌾 Windmill Whirr
export function playWindmillSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(90, now);
  osc.frequency.linearRampToValueAtTime(130, now + 0.25);
  osc.frequency.linearRampToValueAtTime(80, now + 0.5);

  gain.gain.setValueAtTime(0.12 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

  osc.connect(gain);
  gain.connect(sfxGainNode);

  osc.start(now);
  osc.stop(now + 0.56);
}

// 🌊 Watermill Splash
export function playWatermillSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const bufferSize = Math.floor(ctx.sampleRate * 0.3);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.16 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGainNode);

  noise.start(now);
}

// 🌧️ Gentle Rain / Weather Ambiance Swoosh
export function playRainSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const bufferSize = Math.floor(ctx.sampleRate * 0.6);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.frequency.linearRampToValueAtTime(700, now + 0.6);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGainNode);

  noise.start(now);
}

// 🐦 Peaceful Bird Chirp
export function playBirdSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const chirps = [
    { startFreq: 2600, endFreq: 3400, dur: 0.07, delay: 0 },
    { startFreq: 2900, endFreq: 3800, dur: 0.08, delay: 0.09 },
    { startFreq: 3200, endFreq: 4200, dur: 0.10, delay: 0.20 }
  ];

  chirps.forEach(c => {
    const t = now + c.delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(c.startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(c.endFreq, t + c.dur * 0.7);
    osc.frequency.exponentialRampToValueAtTime(c.startFreq * 1.1, t + c.dur);

    gain.gain.setValueAtTime(0.08 * sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + c.dur);

    osc.connect(gain);
    gain.connect(sfxGainNode);

    osc.start(t);
    osc.stop(t + c.dur + 0.01);
  });
}

// 🚶 Villager Speak Blip (Animal Crossing style cute gibberish)
export function playVillagerSpeakSound(pitch = 1.0) {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const numBlips = 3;
  for (let i = 0; i < numBlips; i++) {
    const t = now + i * 0.055;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = (400 + Math.random() * 250) * pitch;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, t + 0.04);

    gain.gain.setValueAtTime(0.14 * sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.06);
  }
}

// 📜 Quest Claim Fanfare
export function playQuestRewardSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const melody = [
    { f: 523.25, d: 0.12 },
    { f: 783.99, d: 0.12 },
    { f: 880.00, d: 0.12 },
    { f: 1046.50, d: 0.35 }
  ];

  let elapsed = 0;
  melody.forEach(note => {
    const t = now + elapsed;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(note.f, t);

    gain.gain.setValueAtTime(0.28 * sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

    osc.connect(gain);
    gain.connect(sfxGainNode);

    osc.start(t);
    osc.stop(t + note.d + 0.01);

    elapsed += note.d * 0.85;
  });
}

// 🌾 Hay Day Sickle Blade Slash Swoosh
export function playSickleSlashSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

  gain.gain.setValueAtTime(0.24 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(sfxGainNode);

  osc.start(now);
  osc.stop(now + 0.13);
}

// 🪙 Hay Day Coin Hit Plaque (Crisp metallic clink)
export function playCoinFlyHitSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1760 + Math.random() * 200, now); // A6
  osc.frequency.exponentialRampToValueAtTime(2637, now + 0.08); // E7

  gain.gain.setValueAtTime(0.22 * sfxVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  gain.connect(sfxGainNode);

  osc.start(now);
  osc.stop(now + 0.10);
}

// 🐔 Hay Day Chicken Cluck Sound
export function playChickenCluckSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  [0, 0.09, 0.18].forEach((offset, idx) => {
    const t = now + offset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const baseFreq = idx === 1 ? 520 : 440;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, t + 0.06);

    gain.gain.setValueAtTime(0.18 * sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.08);
  });
}

// 🐄 Hay Day Cow Moo Sound
export function playCowMooSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(145, now);
  osc.frequency.linearRampToValueAtTime(175, now + 0.18);
  osc.frequency.exponentialRampToValueAtTime(115, now + 0.48);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.25 * sfxVolume, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.50);

  osc.connect(gain);
  gain.connect(sfxGainNode);

  osc.start(now);
  osc.stop(now + 0.51);
}

// 🐑 Hay Day Sheep Baa Sound
export function playSheepBaaSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);

  // Pitch bend with sheep bleat vibrato
  osc.frequency.setValueAtTime(270, now);
  osc.frequency.linearRampToValueAtTime(320, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(250, now + 0.42);

  // Volume envelope
  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.20 * sfxVolume, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGainNode);

  osc.start(now);
  osc.stop(now + 0.46);
}

// 🧵 Loom & Textile Mill Weaving Sound
export function playLoomWeaveSound() {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;

  const now = ctx.currentTime;
  [0, 0.09].forEach((offset, idx) => {
    const t = now + offset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(idx === 0 ? 820 : 640, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.06);

    gain.gain.setValueAtTime(0.18 * sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.08);
  });
}

// ==================== 8-BIT CHIPTUNE BGM SYNTHESIZER ====================

// Warm Medieval Pastoral Chiptune Loop (C Major / G Major Pentatonic)
const BGM_MELODY = [
  // Section A - Morning in town
  { f: 523.25, d: 0.40 }, // C5
  { f: 587.33, d: 0.20 }, // D5
  { f: 659.25, d: 0.40 }, // E5
  { f: 783.99, d: 0.60 }, // G5
  { f: 659.25, d: 0.40 }, // E5
  { f: 587.33, d: 0.40 }, // D5

  { f: 880.00, d: 0.40 }, // A5
  { f: 783.99, d: 0.40 }, // G5
  { f: 659.25, d: 0.40 }, // E5
  { f: 587.33, d: 0.80 }, // D5

  { f: 523.25, d: 0.40 }, // C5
  { f: 659.25, d: 0.40 }, // E5
  { f: 783.99, d: 0.40 }, // G5
  { f: 1046.50, d: 0.60 }, // C6
  { f: 880.00, d: 0.40 }, // A5

  { f: 783.99, d: 0.40 }, // G5
  { f: 587.33, d: 0.40 }, // D5
  { f: 523.25, d: 0.80 }, // C5

  // Section B - Pastoral harvest stroll
  { f: 659.25, d: 0.40 }, // E5
  { f: 783.99, d: 0.40 }, // G5
  { f: 880.00, d: 0.40 }, // A5
  { f: 987.77, d: 0.40 }, // B5
  { f: 1046.50, d: 0.60 }, // C6
  { f: 880.00, d: 0.40 }, // A5

  { f: 783.99, d: 0.40 }, // G5
  { f: 659.25, d: 0.40 }, // E5
  { f: 587.33, d: 0.60 }, // D5
  { f: 523.25, d: 0.80 }  // C5
];

const BGM_BASS = [
  130.81, // C3
  164.81, // E3
  174.61, // F3
  196.00, // G3
  130.81, // C3
  220.00, // A3
  174.61, // F3
  196.00, // G3
  164.81, // E3
  174.61, // F3
  196.00, // G3
  130.81  // C3
];

let bgmStep = 0;
let bassStep = 0;

export function startBGM() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      if (!isBgmPlaying) {
        isBgmPlaying = true;
        bgmStep = 0;
        bassStep = 0;
        playBgmLoop();
      }
    }).catch(e => console.warn('[Audio] resume error:', e));
    return;
  }

  if (isBgmPlaying) return;
  isBgmPlaying = true;
  bgmStep = 0;
  bassStep = 0;
  playBgmLoop();
}

function playBgmLoop() {
  if (!isBgmPlaying) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const tempoFactor = 0.60; // Peaceful, relaxing lofi pacing

  function scheduleNextNote() {
    if (!isBgmPlaying) return;

    const now = ctx.currentTime;
    const note = BGM_MELODY[bgmStep];
    const dur = note.d * tempoFactor;

    // Lead melody note (Triangle wave for flute/pastoral sound)
    if (!isMuted && bgmVolume > 0.01) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now);

      gain.gain.setValueAtTime(0.18 * bgmVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.92);

      osc.connect(gain);
      gain.connect(bgmGainNode);

      osc.start(now);
      osc.stop(now + dur);

      // Warm sine bass pulse on alternating beats
      if (bgmStep % 2 === 0) {
        const bassFreq = BGM_BASS[bassStep % BGM_BASS.length];
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();

        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0.24 * bgmVolume, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + dur * 1.8);

        bassOsc.connect(bassGain);
        bassGain.connect(bgmGainNode);

        bassOsc.start(now);
        bassOsc.stop(now + dur * 1.8);
        bassStep++;
      }
    }

    bgmStep = (bgmStep + 1) % BGM_MELODY.length;
    bgmTimeoutId = setTimeout(scheduleNextNote, dur * 1000);
  }

  scheduleNextNote();
}

export function stopBGM() {
  isBgmPlaying = false;
  if (bgmTimeoutId) {
    clearTimeout(bgmTimeoutId);
    bgmTimeoutId = null;
  }
}

/**
 * Âm thanh rung cây ăn quả (tiếng cành lá xào xạc & quả chín rụng vào rổ)
 */
export function playTreeRustleHarvestSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // White noise rustle
    const bufferSize = Math.floor(ctx.sampleRate * 0.22);
    if (bufferSize > 0) {
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(2.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    }

    // Plop tones (fruit dropping)
    [0, 0.07, 0.14].forEach((delay, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      const freq = 480 + idx * 80;
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + delay + 0.09);

      g.gain.setValueAtTime(0.22, now + delay);
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09);

      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.1);
    });
  } catch (err) {
    console.warn("[audioEngine] playTreeRustleHarvestSound error:", err);
  }
}

/**
 * Âm thanh chó cún sủa "Gâu gâu!" 🐶
 */
export function playDogBarkSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Two cheerful barks
  [0, 0.13].forEach((delay) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";

    osc.frequency.setValueAtTime(320, now + delay);
    osc.frequency.exponentialRampToValueAtTime(140, now + delay + 0.09);

    gain.gain.setValueAtTime(0.26, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.1);
  });
}

/**
 * Âm thanh mèo kêu "Meo meo~" 🐱
 */
export function playCatMeowSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.linearRampToValueAtTime(720, now + 0.18);
  osc.frequency.exponentialRampToValueAtTime(510, now + 0.45);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.46);
}

/**
 * Âm thanh thỏ trắng chít líu ríu 🐰
 */
export function playRabbitSqueakSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [0, 0.08].forEach((delay) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(950, now + delay);
    osc.frequency.exponentialRampToValueAtTime(1400, now + delay + 0.04);
    osc.frequency.exponentialRampToValueAtTime(1100, now + delay + 0.07);

    gain.gain.setValueAtTime(0.18, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.08);
  });
}

/**
 * Âm thanh bạch mã hí vang "Híii~" 🐴
 */
export function playHorseNeighSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const vibrato = ctx.createOscillator();
  const vibratoGain = ctx.createGain();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  vibrato.frequency.setValueAtTime(14, now);
  vibratoGain.gain.setValueAtTime(35, now);

  vibrato.connect(osc.frequency);

  osc.frequency.setValueAtTime(360, now);
  osc.frequency.linearRampToValueAtTime(760, now + 0.22);
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.55);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1600, now);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  vibrato.start(now);
  osc.start(now);
  vibrato.stop(now + 0.56);
  osc.stop(now + 0.56);
}

/**
 * Âm thanh còi tàu buồm rền vang "TOOT TOOT~" 🚢
 */
export function playShipHornSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [110, 164.81]; // A2 và E3 (quãng năm đồng vang kèn đồng)

  freqs.forEach(freq => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.linearRampToValueAtTime(freq * 1.02, now + 0.6);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(500, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18 * sfxVolume, now + 0.08);
    gain.gain.setValueAtTime(0.16 * sfxVolume, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.25);
  });
}
