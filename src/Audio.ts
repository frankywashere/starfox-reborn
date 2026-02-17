export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];
  muted = false;

  init(): void {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.08;
    this.musicGain.connect(this.masterGain);
  }

  private ensure(): AudioContext | null {
    if (!this.ctx) return null;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  playLaser(): void {
    const ctx = this.ensure();
    if (!ctx || !this.masterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  playEnemyLaser(): void {
    const ctx = this.ensure();
    if (!ctx || !this.masterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }

  playExplosion(): void {
    const ctx = this.ensure();
    if (!ctx || !this.masterGain) return;
    // Noise burst
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.4);
  }

  playBigExplosion(): void {
    const ctx = this.ensure();
    if (!ctx || !this.masterGain) return;
    const bufferSize = ctx.sampleRate * 1.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 1.0);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 1.0);
  }

  playHit(): void {
    const ctx = this.ensure();
    if (!ctx || !this.masterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  playPowerUp(): void {
    const ctx = this.ensure();
    if (!ctx || !this.masterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  playBarrelRoll(): void {
    const ctx = this.ensure();
    if (!ctx || !this.masterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }

  playBomb(): void {
    const ctx = this.ensure();
    if (!ctx || !this.masterGain) return;
    // Rising tone then explosion
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    // Delayed explosion
    setTimeout(() => this.playBigExplosion(), 300);
  }

  startMusic(): void {
    const ctx = this.ensure();
    if (!ctx || !this.musicGain) return;
    this.stopMusic();

    const bpm = 140;
    const beatLen = 60 / bpm;

    // Bass pattern (root notes)
    const bassPattern = [
      110, 110, 110, 110,
      130.81, 130.81, 130.81, 130.81,
      146.83, 146.83, 164.81, 164.81,
      110, 110, 130.81, 130.81,
    ];

    // Lead melody
    const melodyPattern = [
      440, 0, 523.25, 0,
      659.25, 0, 523.25, 440,
      392, 0, 440, 0,
      523.25, 0, 392, 0,
    ];

    const loopLen = bassPattern.length * beatLen;

    const createLoop = () => {
      if (!this.musicGain) return;
      const now = ctx.currentTime;

      // Bass line with filter
      for (let i = 0; i < bassPattern.length; i++) {
        const freq = bassPattern[i];
        if (freq === 0) continue;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now + i * beatLen);
        filter.frequency.linearRampToValueAtTime(200, now + i * beatLen + beatLen * 0.8);
        filter.Q.value = 5;

        gain.gain.setValueAtTime(0.35, now + i * beatLen);
        gain.gain.setValueAtTime(0.35, now + i * beatLen + beatLen * 0.7);
        gain.gain.linearRampToValueAtTime(0, now + i * beatLen + beatLen * 0.95);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain!);
        osc.start(now + i * beatLen);
        osc.stop(now + i * beatLen + beatLen);
        this.musicOscillators.push(osc);
      }

      // Lead melody
      for (let i = 0; i < melodyPattern.length; i++) {
        const freq = melodyPattern[i];
        if (freq === 0) continue;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.08, now + i * beatLen);
        gain.gain.setValueAtTime(0.08, now + i * beatLen + beatLen * 0.6);
        gain.gain.linearRampToValueAtTime(0, now + i * beatLen + beatLen * 0.9);

        osc.connect(gain);
        gain.connect(this.musicGain!);
        osc.start(now + i * beatLen);
        osc.stop(now + i * beatLen + beatLen);
        this.musicOscillators.push(osc);
      }

      // Kick drum on beats 1 and 3
      for (let i = 0; i < bassPattern.length; i += 2) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now + i * beatLen);
        osc.frequency.exponentialRampToValueAtTime(40, now + i * beatLen + 0.1);
        gain.gain.setValueAtTime(0.4, now + i * beatLen);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * beatLen + 0.15);
        osc.connect(gain);
        gain.connect(this.musicGain!);
        osc.start(now + i * beatLen);
        osc.stop(now + i * beatLen + 0.15);
        this.musicOscillators.push(osc);
      }

      // Hi-hat on every beat
      for (let i = 0; i < bassPattern.length; i++) {
        const bufferSize = Math.floor(ctx.sampleRate * 0.05);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / bufferSize, 8);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        gain.gain.setValueAtTime(0.06, now + i * beatLen);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * beatLen + 0.05);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain!);
        noise.start(now + i * beatLen);
        noise.stop(now + i * beatLen + 0.05);
      }
    };

    createLoop();
    const interval = setInterval(() => {
      if (!this.musicGain) { clearInterval(interval); return; }
      this.musicOscillators = [];
      createLoop();
    }, loopLen * 1000);
    (this as any)._musicInterval = interval;
  }

  stopMusic(): void {
    this.musicOscillators.forEach(o => { try { o.stop(); } catch {} });
    this.musicOscillators = [];
    if ((this as any)._musicInterval) {
      clearInterval((this as any)._musicInterval);
      (this as any)._musicInterval = null;
    }
  }
}
