import { SoundSettings } from '../types/wellness';

const SOUND_STORAGE_KEY = 'carenova_sound_settings';

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  enabled: true,
  volume: 0.7,
};

// Track played session IDs to prevent duplicate sound triggers
const playedSessionIds = new Set<string>();

export function getStoredSoundSettings(): SoundSettings {
  try {
    const raw = localStorage.getItem(SOUND_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
        volume: typeof parsed.volume === 'number' ? Math.max(0, Math.min(1, parsed.volume)) : 0.7,
      };
    }
  } catch (e) {
    console.warn('Could not read sound settings from localStorage', e);
  }
  return { ...DEFAULT_SOUND_SETTINGS };
}

export function saveSoundSettings(settings: SoundSettings): void {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Could not save sound settings to localStorage', e);
  }
}

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioCtx();
  }
  return sharedAudioContext;
}

/**
 * Synthesizes a calming, harmonic two-tone meditation chime (528 Hz + 792 Hz)
 * using the Web Audio API with a gentle ADSR envelope and lowpass warmth.
 * Returns a promise resolving to true if sound successfully played, false otherwise.
 */
export async function playWellnessChime(volume: number = 0.7): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const effectiveVolume = Math.max(0, Math.min(1, volume));
    if (effectiveVolume <= 0) return true;

    const now = ctx.currentTime;
    const duration = 2.4; // 2.4 seconds soothing resonant chime

    // Master gain for user volume control
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(effectiveVolume * 0.45, now);
    masterGain.connect(ctx.destination);

    // Warm low-pass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + duration);
    filter.connect(masterGain);

    // Two harmonic frequencies: 528 Hz (healing/calm) and 792 Hz (perfect fifth harmonic)
    const tones = [
      { freq: 528, delay: 0, decay: 2.2, gainPeak: 0.7 },
      { freq: 792, delay: 0.12, decay: 1.9, gainPeak: 0.4 },
      { freq: 1056, delay: 0.24, decay: 1.5, gainPeak: 0.2 },
    ];

    tones.forEach(({ freq, delay, decay, gainPeak }) => {
      const startTime = now + delay;
      const osc = ctx.createOscillator();
      const toneGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth attack and natural exponential exponential decay
      toneGain.gain.setValueAtTime(0.0001, startTime);
      toneGain.gain.exponentialRampToValueAtTime(gainPeak, startTime + 0.05);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

      osc.connect(toneGain);
      toneGain.connect(filter);

      osc.start(startTime);
      osc.stop(startTime + decay + 0.1);
    });

    return true;
  } catch (err) {
    console.warn('Web Audio playback error or autoplay restriction:', err);
    return false;
  }
}

/**
 * Plays completion chime for a finished session with duplicate guard and settings verification.
 */
export async function playSessionCompletionSound(
  sessionId: string,
  settings?: SoundSettings
): Promise<{ played: boolean; blocked: boolean }> {
  // Prevent duplicate sounds for the same session ID
  if (playedSessionIds.has(sessionId)) {
    return { played: false, blocked: false };
  }

  const soundConfig = settings || getStoredSoundSettings();

  if (!soundConfig.enabled || soundConfig.volume <= 0) {
    playedSessionIds.add(sessionId);
    return { played: false, blocked: false };
  }

  const success = await playWellnessChime(soundConfig.volume);
  playedSessionIds.add(sessionId);

  return { played: success, blocked: !success };
}

export function resetPlayedSessionGuards(): void {
  playedSessionIds.clear();
}
