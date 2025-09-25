import { Howl, Howler } from 'howler';

export enum SoundType {
  TIMER_COMPLETE = 'timer_complete',
  TIMER_START = 'timer_start',
  TIMER_PAUSE = 'timer_pause',
  TIMER_RESET = 'timer_reset',
  REMINDER_GENTLE = 'reminder_gentle',
  REMINDER_URGENT = 'reminder_urgent',
  EVENT_WARNING = 'event_warning',
  TASK_COMPLETE = 'task_complete',
  SUCCESS = 'success',
  ERROR = 'error'
}

interface SoundConfig {
  src: string[];
  volume: number;
  loop?: boolean;
  preload?: boolean;
}

class SoundService {
  private sounds: Map<SoundType, Howl> = new Map();
  private failedSounds: Set<SoundType> = new Set();
  private isEnabled: boolean = true;
  private globalVolume: number = 0.7;
  private initialized: boolean = false;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds(): void {
    const soundConfigs: Record<SoundType, SoundConfig> = {
      [SoundType.TIMER_COMPLETE]: {
        src: ['/sounds/timer-complete.wav'], // Try WAV only first
        volume: 0.8,
        preload: false // Disable preloading
      },
      [SoundType.TIMER_START]: {
        src: ['/sounds/timer-start.wav'],
        volume: 0.5,
        preload: false
      },
      [SoundType.TIMER_PAUSE]: {
        src: ['/sounds/timer-pause.wav'],
        volume: 0.4,
        preload: false
      },
      [SoundType.TIMER_RESET]: {
        src: ['/sounds/timer-reset.wav'],
        volume: 0.4,
        preload: false
      },
      [SoundType.REMINDER_GENTLE]: {
        src: ['/sounds/reminder-gentle.wav'],
        volume: 0.6,
        preload: false
      },
      [SoundType.REMINDER_URGENT]: {
        src: ['/sounds/reminder-urgent.wav'],
        volume: 0.8,
        preload: false
      },
      [SoundType.EVENT_WARNING]: {
        src: ['/sounds/event-warning.wav'],
        volume: 0.7,
        preload: false
      },
      [SoundType.TASK_COMPLETE]: {
        src: ['/sounds/task-complete.wav'],
        volume: 0.6,
        preload: false
      },
      [SoundType.SUCCESS]: {
        src: ['/sounds/success.wav'],
        volume: 0.5,
        preload: false
      },
      [SoundType.ERROR]: {
        src: ['/sounds/error.wav'],
        volume: 0.6,
        preload: false
      }
    };

    // Initialize each sound
    Object.entries(soundConfigs).forEach(([soundType, config]) => {
      try {
        const sound = new Howl({
          src: config.src,
          volume: config.volume * this.globalVolume,
          preload: config.preload || false,
          onloaderror: (id, error) => {
            console.warn(`Failed to load sound ${soundType}:`, error);
            this.failedSounds.add(soundType as SoundType);
          },
          onload: () => {
            console.log(`Successfully loaded sound: ${soundType}`);
          }
        });

        this.sounds.set(soundType as SoundType, sound);
      } catch (error) {
        console.warn(`Error initializing sound ${soundType}:`, error);
      }
    });

    this.initialized = true;
  }

  /**
   * Fallback: Generate sound using Web Audio API
   */
  private async playFallbackBeep(frequency: number, duration: number, volume: number = 0.3): Promise<void> {
    if (!this.isAudioSupported()) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      // Envelope for smooth attack/release
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume * this.globalVolume, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);

      console.log(`Playing fallback beep: ${frequency}Hz for ${duration}s`);
    } catch (error) {
      console.warn('Fallback beep failed:', error);
    }
  }

  /**
   * Play a specific sound type
   */
  async play(soundType: SoundType, options?: { volume?: number; loop?: boolean }): Promise<void> {
    if (!this.isEnabled || !this.initialized) {
      console.log(`Sound disabled or not initialized. Enabled: ${this.isEnabled}, Initialized: ${this.initialized}`);
      return;
    }

    // Check if this sound previously failed to load
    if (this.failedSounds.has(soundType)) {
      console.log(`Sound ${soundType} previously failed to load, using fallback`);
      await this.playFallbackSound(soundType);
      return;
    }

    try {
      // Request audio context interaction if needed (for browser autoplay policies)
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        console.log('Resuming suspended audio context...');
        await Howler.ctx.resume();
      }

      const sound = this.sounds.get(soundType);
      if (!sound) {
        console.warn(`Sound ${soundType} not found, trying fallback`);
        await this.playFallbackSound(soundType);
        return;
      }

      // Load sound on-demand if not loaded
      if (sound.state() === 'unloaded') {
        console.log(`Loading sound ${soundType} on-demand...`);

        // Create a promise that resolves when sound loads or fails
        const loadPromise = new Promise<boolean>((resolve) => {
          const timeoutId = setTimeout(() => {
            console.warn(`Sound ${soundType} load timeout`);
            this.failedSounds.add(soundType);
            resolve(false);
          }, 3000); // 3 second timeout

          sound.once('load', () => {
            clearTimeout(timeoutId);
            console.log(`Successfully loaded ${soundType} on-demand`);
            resolve(true);
          });

          sound.once('loaderror', () => {
            clearTimeout(timeoutId);
            console.warn(`Failed to load ${soundType} on-demand`);
            this.failedSounds.add(soundType);
            resolve(false);
          });

          sound.load();
        });

        const loaded = await loadPromise;
        if (!loaded) {
          console.log(`Sound ${soundType} failed to load, using fallback`);
          await this.playFallbackSound(soundType);
          return;
        }
      }

      // Set temporary volume if specified
      if (options?.volume !== undefined) {
        sound.volume(options.volume * this.globalVolume);
      }

      // Set loop if specified
      if (options?.loop !== undefined) {
        sound.loop(options.loop);
      }

      console.log(`Playing sound: ${soundType}`);
      const playId = sound.play();

      if (!playId) {
        console.warn(`Failed to play sound: ${soundType}, trying fallback`);
        this.failedSounds.add(soundType);
        await this.playFallbackSound(soundType);
      }

    } catch (error) {
      console.warn(`Error playing sound ${soundType}:`, error, 'trying fallback');
      this.failedSounds.add(soundType);
      await this.playFallbackSound(soundType);
    }
  }

  /**
   * Play fallback sound for different types
   */
  private async playFallbackSound(soundType: SoundType): Promise<void> {
    switch (soundType) {
      case SoundType.TIMER_START:
        await this.playFallbackBeep(440, 0.2, 0.2);
        break;
      case SoundType.TIMER_PAUSE:
        await this.playFallbackBeep(330, 0.3, 0.15);
        break;
      case SoundType.TIMER_RESET:
        await this.playFallbackBeep(350, 0.15, 0.15);
        break;
      case SoundType.TIMER_COMPLETE:
        await this.playFallbackBeep(523, 0.3, 0.25);
        setTimeout(() => this.playFallbackBeep(659, 0.3, 0.25), 200);
        setTimeout(() => this.playFallbackBeep(784, 0.4, 0.25), 400);
        break;
      case SoundType.REMINDER_GENTLE:
        await this.playFallbackBeep(523, 0.5, 0.18);
        break;
      case SoundType.REMINDER_URGENT:
        await this.playFallbackBeep(659, 0.4, 0.22);
        break;
      case SoundType.EVENT_WARNING:
        await this.playFallbackBeep(659, 0.3, 0.2);
        setTimeout(() => this.playFallbackBeep(523, 0.3, 0.2), 300);
        break;
      case SoundType.SUCCESS:
        await this.playFallbackBeep(440, 0.2, 0.18);
        setTimeout(() => this.playFallbackBeep(659, 0.3, 0.18), 150);
        break;
      case SoundType.TASK_COMPLETE:
        await this.playFallbackBeep(523, 0.3, 0.2);
        break;
      case SoundType.ERROR:
        await this.playFallbackBeep(330, 0.4, 0.15);
        break;
      default:
        await this.playFallbackBeep(440, 0.3, 0.2);
    }
  }

  /**
   * Stop a specific sound type
   */
  stop(soundType: SoundType): void {
    const sound = this.sounds.get(soundType);
    if (sound) {
      sound.stop();
    }
  }

  /**
   * Stop all currently playing sounds
   */
  stopAll(): void {
    this.sounds.forEach(sound => sound.stop());
  }

  /**
   * Enable or disable all sounds
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;

    if (!enabled) {
      this.stopAll();
    }
  }

  /**
   * Get current enabled state
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Set global volume (0.0 to 1.0)
   */
  setGlobalVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));

    // Update all sound volumes
    this.sounds.forEach(sound => {
      const currentVolume = sound.volume();
      sound.volume(currentVolume * this.globalVolume);
    });
  }

  /**
   * Get current global volume
   */
  getGlobalVolume(): number {
    return this.globalVolume;
  }

  /**
   * Set volume for a specific sound type
   */
  setSoundVolume(soundType: SoundType, volume: number): void {
    const sound = this.sounds.get(soundType);
    if (sound) {
      sound.volume(Math.max(0, Math.min(1, volume)) * this.globalVolume);
    }
  }

  /**
   * Check if browser supports audio
   */
  isAudioSupported(): boolean {
    return typeof Audio !== 'undefined';
  }

  /**
   * Request user interaction to enable audio (for autoplay policies)
   */
  async requestAudioPermission(): Promise<boolean> {
    if (!this.isAudioSupported()) {
      return false;
    }

    try {
      // Try to resume audio context
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        await Howler.ctx.resume();
        return Howler.ctx.state === 'running';
      }
      return true;
    } catch (error) {
      console.warn('Error requesting audio permission:', error);
      return false;
    }
  }

  /**
   * Preload all sounds
   */
  preloadAll(): Promise<void[]> {
    const preloadPromises = Array.from(this.sounds.entries()).map(([soundType, sound]) => {
      return new Promise<void>((resolve) => {
        if (sound.state() === 'loaded') {
          resolve();
        } else {
          sound.once('load', () => resolve());
          sound.once('loaderror', () => {
            console.warn(`Failed to preload sound: ${soundType}`);
            resolve();
          });
        }
      });
    });

    return Promise.all(preloadPromises);
  }

  /**
   * Get loading state of all sounds
   */
  getLoadingState(): Record<string, 'unloaded' | 'loading' | 'loaded'> {
    const state: Record<string, 'unloaded' | 'loading' | 'loaded'> = {};

    this.sounds.forEach((sound, soundType) => {
      state[soundType] = sound.state();
    });

    return state;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.sounds.forEach(sound => {
      sound.unload();
    });
    this.sounds.clear();
    this.initialized = false;
  }
}

// Create and export a singleton instance
export const soundService = new SoundService();

// Export convenience functions
export const playSound = (soundType: SoundType, options?: { volume?: number; loop?: boolean }) =>
  soundService.play(soundType, options);

export const stopSound = (soundType: SoundType) => soundService.stop(soundType);

export const stopAllSounds = () => soundService.stopAll();

export const setSoundEnabled = (enabled: boolean) => soundService.setEnabled(enabled);

export const isSoundEnabled = () => soundService.getEnabled();

export const setSoundVolume = (volume: number) => soundService.setGlobalVolume(volume);

export const getSoundVolume = () => soundService.getGlobalVolume();

export default soundService;