export class HUD {
  private scoreEl: HTMLElement;
  private livesEl: HTMLElement;
  private healthBarInner: HTMLElement;
  private shieldBarInner: HTMLElement;
  private bossContainer: HTMLElement;
  private bossNameEl: HTMLElement;
  private bossBarInner: HTMLElement;
  private bombEl: HTMLElement;
  private laserEl: HTMLElement;
  private levelDisplay: HTMLElement;
  private levelNameEl: HTMLElement;
  private levelSubEl: HTMLElement;
  private crosshair: HTMLElement;
  private hudEl: HTMLElement;
  private comboEl: HTMLElement;
  private hitMarkerContainer: HTMLElement;

  private levelDisplayTimer = 0;
  private comboCount = 0;
  private comboTimer = 0;
  private comboDecay = 2; // seconds before combo resets
  private displayedScore = 0;

  constructor() {
    this.hudEl = document.getElementById('hud')!;
    this.scoreEl = document.getElementById('score-display')!;
    this.livesEl = document.getElementById('lives-display')!;
    this.healthBarInner = document.querySelector('#health-bar .bar-inner')! as HTMLElement;
    this.shieldBarInner = document.querySelector('#shield-bar .bar-inner')! as HTMLElement;
    this.bossContainer = document.getElementById('boss-health-container')!;
    this.bossNameEl = document.getElementById('boss-name')!;
    this.bossBarInner = document.querySelector('#boss-health-bar .bar-inner')! as HTMLElement;
    this.bombEl = document.getElementById('bomb-display')!;
    this.laserEl = document.getElementById('laser-display')!;
    this.levelDisplay = document.getElementById('level-display')!;
    this.levelNameEl = document.getElementById('level-name')!;
    this.levelSubEl = document.getElementById('level-subtitle')!;
    this.crosshair = document.getElementById('crosshair')!;

    // Create combo display
    this.comboEl = document.createElement('div');
    this.comboEl.style.cssText = `
      position: absolute; top: 50%; right: 40px; transform: translateY(-50%);
      font-family: 'Courier New', monospace; font-size: 28px;
      color: #ff0; text-shadow: 0 0 15px #ff0; display: none;
      transition: transform 0.1s;
    `;
    this.hudEl.appendChild(this.comboEl);

    // Create hit marker container
    this.hitMarkerContainer = document.createElement('div');
    this.hitMarkerContainer.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none; overflow: hidden;
    `;
    this.hudEl.appendChild(this.hitMarkerContainer);
  }

  show(): void {
    this.hudEl.style.display = 'block';
    this.crosshair.style.display = 'block';
  }

  hide(): void {
    this.hudEl.style.display = 'none';
  }

  updateCrosshair(mouseX: number, mouseY: number): void {
    // mouseX/mouseY are -1 to 1 normalized
    const cx = (mouseX + 1) * 0.5 * window.innerWidth;
    const cy = (-mouseY + 1) * 0.5 * window.innerHeight;
    this.crosshair.style.left = `${cx}px`;
    this.crosshair.style.top = `${cy}px`;
  }

  addComboHit(): void {
    this.comboCount++;
    this.comboTimer = this.comboDecay;
  }

  getComboMultiplier(): number {
    if (this.comboCount < 3) return 1;
    if (this.comboCount < 6) return 2;
    if (this.comboCount < 10) return 3;
    return 5;
  }

  showHitMarker(screenX: number, screenY: number, points: number): void {
    const marker = document.createElement('div');
    marker.textContent = `+${points}`;
    marker.style.cssText = `
      position: absolute;
      left: ${screenX}px; top: ${screenY}px;
      font-family: 'Courier New', monospace;
      font-size: 16px; color: #0f0;
      text-shadow: 0 0 8px #0f0;
      pointer-events: none;
      animation: hitMarkerFloat 0.8s ease-out forwards;
    `;
    this.hitMarkerContainer.appendChild(marker);

    // Add animation style if not exists
    if (!document.getElementById('hit-marker-style')) {
      const style = document.createElement('style');
      style.id = 'hit-marker-style';
      style.textContent = `
        @keyframes hitMarkerFloat {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(1.3); }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => marker.remove(), 800);
  }

  showMissionComplete(): void {
    this.levelNameEl.textContent = 'MISSION COMPLETE';
    this.levelSubEl.textContent = 'Advancing to next sector...';
    this.levelDisplayTimer = 3;
  }

  update(dt: number, data: {
    score: number;
    lives: number;
    health: number;
    maxHealth: number;
    shields: number;
    maxShields: number;
    bombs: number;
    laserLevel?: number;
    bossHealth?: number;
    bossMaxHealth?: number;
    bossName?: string;
  }): void {
    // Animated score counter
    const scoreDiff = data.score - this.displayedScore;
    if (scoreDiff > 0) {
      this.displayedScore += Math.ceil(scoreDiff * Math.min(1, dt * 8));
    }
    this.scoreEl.textContent = `SCORE: ${this.displayedScore.toString().padStart(8, '0')}`;

    // Lives as ship icons
    let livesStr = 'LIVES: ';
    for (let i = 0; i < data.lives; i++) livesStr += '\u2708 ';
    this.livesEl.textContent = livesStr;

    // Health bar with color change
    const healthPercent = Math.max(0, (data.health / data.maxHealth) * 100);
    this.healthBarInner.style.width = `${healthPercent}%`;
    if (healthPercent < 30) {
      this.healthBarInner.style.background = `linear-gradient(90deg, #f00, #f44)`;
    } else if (healthPercent < 60) {
      this.healthBarInner.style.background = `linear-gradient(90deg, #f80, #ff0)`;
    } else {
      this.healthBarInner.style.background = `linear-gradient(90deg, #0a0, #0f0)`;
    }

    // Shield bar
    const shieldPercent = Math.max(0, (data.shields / data.maxShields) * 100);
    this.shieldBarInner.style.width = `${shieldPercent}%`;

    // Bombs
    let bombStr = 'BOMBS: ';
    for (let i = 0; i < data.bombs; i++) bombStr += '\u25C9 ';
    this.bombEl.textContent = bombStr;

    // Laser level
    if (data.laserLevel !== undefined) {
      const lvl = data.laserLevel;
      const labels = ['', 'LASER: SINGLE', 'LASER: DUAL', 'LASER: SPREAD'];
      this.laserEl.textContent = labels[lvl] || '';
      if (lvl >= 3) this.laserEl.style.color = '#f80';
      else if (lvl >= 2) this.laserEl.style.color = '#ff0';
      else this.laserEl.style.color = '#0f0';
    }

    // Boss health
    if (data.bossHealth !== undefined && data.bossMaxHealth !== undefined) {
      this.bossContainer.style.display = 'block';
      this.bossNameEl.textContent = data.bossName || 'BOSS';
      const bossPercent = Math.max(0, (data.bossHealth / data.bossMaxHealth) * 100);
      this.bossBarInner.style.width = `${bossPercent}%`;
    } else {
      this.bossContainer.style.display = 'none';
    }

    // Combo display
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboCount >= 3) {
        this.comboEl.style.display = 'block';
        const mult = this.getComboMultiplier();
        this.comboEl.textContent = `${this.comboCount} HIT COMBO x${mult}`;
        this.comboEl.style.transform = `translateY(-50%) scale(${1 + Math.sin(this.comboTimer * 10) * 0.05})`;
        if (mult >= 3) this.comboEl.style.color = '#f80';
        else if (mult >= 2) this.comboEl.style.color = '#ff0';
        else this.comboEl.style.color = '#0f0';
      }
    } else {
      this.comboCount = 0;
      this.comboEl.style.display = 'none';
    }

    // Level display timer
    if (this.levelDisplayTimer > 0) {
      this.levelDisplayTimer -= dt;
      this.levelDisplay.style.display = 'block';
      this.levelDisplay.style.opacity = String(Math.min(1, this.levelDisplayTimer));
    } else {
      this.levelDisplay.style.display = 'none';
    }
  }

  showLevelTitle(name: string, subtitle: string): void {
    this.levelNameEl.textContent = name;
    this.levelSubEl.textContent = subtitle;
    this.levelDisplayTimer = 3;
  }

  reset(): void {
    this.levelDisplayTimer = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.displayedScore = 0;
    this.bossContainer.style.display = 'none';
    this.comboEl.style.display = 'none';
  }
}
