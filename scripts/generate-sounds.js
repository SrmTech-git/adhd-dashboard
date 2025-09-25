#!/usr/bin/env node

/**
 * Sound Generator Script for ADHD Dashboard
 * Generates basic audio files using Web Audio API and saves them as WAV files
 */

const fs = require('fs');
const path = require('path');

class WaveGenerator {
  constructor(sampleRate = 44100) {
    this.sampleRate = sampleRate;
  }

  // Generate a sine wave tone
  generateTone(frequency, duration, volume = 0.3) {
    const samples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const t = i / this.sampleRate;
      buffer[i] = Math.sin(2 * Math.PI * frequency * t) * volume;
    }

    return buffer;
  }

  // Generate a gentle chime (multiple harmonics)
  generateChime(baseFreq, duration, volume = 0.2) {
    const samples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const t = i / this.sampleRate;
      const envelope = Math.exp(-3 * t); // Natural decay

      // Multiple harmonics for richer sound
      const fundamental = Math.sin(2 * Math.PI * baseFreq * t);
      const harmonic2 = Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.5;
      const harmonic3 = Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.25;

      buffer[i] = (fundamental + harmonic2 + harmonic3) * envelope * volume;
    }

    return buffer;
  }

  // Generate a soft beep
  generateSoftBeep(frequency, duration, volume = 0.15) {
    const samples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const t = i / this.sampleRate;
      // Soft attack and release
      let envelope = 1;
      const attackTime = 0.05;
      const releaseTime = 0.1;

      if (t < attackTime) {
        envelope = t / attackTime;
      } else if (t > duration - releaseTime) {
        envelope = (duration - t) / releaseTime;
      }

      buffer[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
    }

    return buffer;
  }

  // Generate ascending or descending sequence
  generateSequence(startFreq, endFreq, duration, steps = 3, volume = 0.2) {
    const stepDuration = duration / steps;
    const samples = Math.floor(this.sampleRate * duration);
    const buffer = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const t = i / this.sampleRate;
      const step = Math.floor(t / stepDuration);
      const stepT = (t % stepDuration) / stepDuration;

      const freq = startFreq + (endFreq - startFreq) * (step / (steps - 1));
      const envelope = Math.exp(-2 * stepT); // Decay for each step

      buffer[i] = Math.sin(2 * Math.PI * freq * t) * envelope * volume;
    }

    return buffer;
  }

  // Convert Float32Array to WAV buffer
  encodeWAV(samples, sampleRate = 44100) {
    const length = samples.length;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true); // File size - 8
    writeString(8, 'WAVE');

    // Format chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Chunk size
    view.setUint16(20, 1, true); // Audio format (1 = PCM)
    view.setUint16(22, 1, true); // Number of channels (mono)
    view.setUint32(24, sampleRate, true); // Sample rate
    view.setUint32(28, sampleRate * 2, true); // Byte rate (sample rate * channels * bits per sample / 8)
    view.setUint16(32, 2, true); // Block align (channels * bits per sample / 8)
    view.setUint16(34, 16, true); // Bits per sample

    // Data chunk
    writeString(36, 'data');
    view.setUint32(40, length * 2, true); // Data size

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      // Clamp sample to [-1, 1] range and convert to 16-bit signed integer
      const sample = Math.max(-1, Math.min(1, samples[i]));
      const pcmSample = Math.round(sample * 32767);
      view.setInt16(offset, pcmSample, true);
      offset += 2;
    }

    return buffer;
  }

  // Save audio buffer to file
  saveWAV(samples, filename, sampleRate = 44100) {
    const wavBuffer = this.encodeWAV(samples, sampleRate);
    const uint8Array = new Uint8Array(wavBuffer);
    fs.writeFileSync(filename, uint8Array);
    console.log(`Generated: ${filename}`);
  }
}

// Main function to generate all sound files
function generateAllSounds() {
  const generator = new WaveGenerator();
  const soundsDir = path.join(__dirname, '..', 'public', 'sounds');

  // Ensure sounds directory exists
  if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
  }

  console.log('Generating ADHD-friendly sound files...\n');

  // Timer sounds
  console.log('🎵 Timer Sounds:');

  // Timer Complete - Pleasant ascending chimes
  const timerComplete = generator.generateSequence(523, 784, 1.5, 3, 0.25); // C5 to G5
  generator.saveWAV(timerComplete, path.join(soundsDir, 'timer-complete.wav'));

  // Timer Start - Gentle single chime
  const timerStart = generator.generateChime(440, 0.8, 0.2); // A4
  generator.saveWAV(timerStart, path.join(soundsDir, 'timer-start.wav'));

  // Timer Pause - Soft descending tone
  const timerPause = generator.generateSequence(440, 330, 0.6, 2, 0.15); // A4 to E4
  generator.saveWAV(timerPause, path.join(soundsDir, 'timer-pause.wav'));

  // Timer Reset - Quick soft beep
  const timerReset = generator.generateSoftBeep(350, 0.3, 0.15);
  generator.saveWAV(timerReset, path.join(soundsDir, 'timer-reset.wav'));

  // Reminder sounds
  console.log('🔔 Reminder Sounds:');

  // Gentle Reminder - Soft bell-like chime
  const reminderGentle = generator.generateChime(523, 1.2, 0.18); // C5
  generator.saveWAV(reminderGentle, path.join(soundsDir, 'reminder-gentle.wav'));

  // Urgent Reminder - Slightly more prominent but still gentle
  const reminderUrgent = generator.generateSequence(523, 659, 1.0, 2, 0.22); // C5 to E5
  generator.saveWAV(reminderUrgent, path.join(soundsDir, 'reminder-urgent.wav'));

  // Event sounds
  console.log('📅 Event Sounds:');

  // Event Warning - Attention-getting but not harsh
  const eventWarning = generator.generateSequence(659, 523, 1.2, 3, 0.2); // E5 to C5
  generator.saveWAV(eventWarning, path.join(soundsDir, 'event-warning.wav'));

  // General feedback sounds
  console.log('✨ Feedback Sounds:');

  // Success - Pleasant upward sequence
  const success = generator.generateSequence(440, 659, 0.8, 3, 0.18); // A4 to E5
  generator.saveWAV(success, path.join(soundsDir, 'success.wav'));

  // Task Complete - Similar to success but shorter
  const taskComplete = generator.generateChime(523, 0.6, 0.2); // C5
  generator.saveWAV(taskComplete, path.join(soundsDir, 'task-complete.wav'));

  // Error - Gentle descending tone (not harsh)
  const error = generator.generateSequence(440, 330, 0.8, 2, 0.15); // A4 to E4
  generator.saveWAV(error, path.join(soundsDir, 'error.wav'));

  console.log('\n✅ All sound files generated successfully!');
  console.log('📁 Files saved to:', soundsDir);
  console.log('\n🎧 These are gentle, ADHD-friendly sounds designed to provide');
  console.log('   feedback without being startling or overwhelming.');
}

// Run the generator
try {
  generateAllSounds();
} catch (error) {
  console.error('❌ Error generating sounds:', error.message);
  process.exit(1);
}