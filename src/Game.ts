import * as THREE from 'three';
import { InputManager } from './Input';
import { Player } from './Player';
import { EnemyManager, EnemyType } from './Enemies';
import { ProjectileManager } from './Projectiles';
import { ParticleSystem, ScreenShake } from './Effects';
import { World } from './World';
import { PowerUpType } from './Models';
import { HUD } from './HUD';
import { AudioManager } from './Audio';
import { PostProcessing } from './PostFX';

enum GameState {
  MENU,
  PLAYING,
  PAUSED,
  LEVEL_TRANSITION,
  GAME_OVER,
  VICTORY,
}

const CAMERA_BASE = new THREE.Vector3(0, 6, 12);
const CAMERA_LOOK_OFFSET = new THREE.Vector3(0, 1, -20);

// Dynamic camera settings
const CAM_FOLLOW_X = 0.6;        // How much camera follows player X
const CAM_FOLLOW_Y = 0.35;       // How much camera follows player Y
const CAM_BANK_FACTOR = 0.015;   // Camera roll when player moves sideways
const CAM_SWOOP_SPEED = 0.8;     // Speed of cinematic intro swoop
const CAM_BOSS_FOV = 70;         // Wider FOV during boss fights
const CAM_NORMAL_FOV = 60;       // Normal FOV
const CAM_SPEED_Z_OFFSET = 1.5;  // Camera pulls back slightly when player moves fast
const CAM_COMBAT_SHAKE_FACTOR = 0.15; // Subtle camera sway during combat

export class Game {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private postFX: PostProcessing;

  private input: InputManager;
  private player: Player;
  private enemies: EnemyManager;
  private projectiles: ProjectileManager;
  private particles: ParticleSystem;
  private screenShake: ScreenShake;
  private world: World;
  private hud: HUD;
  private audio: AudioManager;

  private state: GameState = GameState.MENU;
  private lastTime = 0;
  private transitionTimer = 0;
  private pauseOverlay: HTMLDivElement | null = null;
  private bossWasActive = false;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private sunLight: THREE.DirectionalLight;

  // Dynamic camera state
  private camSwoopProgress = 0;  // 0 = swooping, >= 1 = done
  private camTargetFov = CAM_NORMAL_FOV;
  private camCurrentFov = CAM_NORMAL_FOV;
  private camCombatTimer = 0;
  private camPrevPlayerX = 0;
  private camVelocityX = 0;  // Smoothed player X velocity for camera look-ahead

  constructor() {
    const container = document.getElementById('game-container')!;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.copy(CAMERA_BASE);

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(this.ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x8888cc, 0x444422, 0.4);
    this.scene.add(hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    this.sunLight.position.set(10, 20, 10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.scene.add(this.sunLight);

    // Post-processing
    this.postFX = new PostProcessing(this.renderer, this.scene, this.camera);

    // Systems
    this.input = new InputManager();
    this.player = new Player();
    this.enemies = new EnemyManager();
    this.projectiles = new ProjectileManager();
    this.particles = new ParticleSystem();
    this.screenShake = new ScreenShake();
    this.world = new World();
    this.hud = new HUD();
    this.audio = new AudioManager();

    // Add to scene
    this.scene.add(this.player.mesh);
    this.scene.add(this.enemies.group);
    this.scene.add(this.projectiles.group);
    this.scene.add(this.particles.group);
    this.scene.add(this.world.group);

    // Event listeners
    window.addEventListener('resize', () => this.onResize());

    // Menu buttons
    document.getElementById('start-btn')!.addEventListener('click', () => this.startGame());
    document.getElementById('restart-btn')!.addEventListener('click', () => this.startGame());
    document.getElementById('victory-restart-btn')!.addEventListener('click', () => this.startGame());
    document.getElementById('level-select-btn')!.addEventListener('click', () => this.showLevelSelect());
    document.getElementById('level-select-back')!.addEventListener('click', () => this.hideLevelSelect());

    // Build level select cards
    this.buildLevelSelectCards();

    // Create pause overlay
    this.createPauseOverlay();
  }

  private createPauseOverlay(): void {
    this.pauseOverlay = document.createElement('div');
    this.pauseOverlay.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      display: none; justify-content: center; align-items: center;
      background: rgba(0,0,0,0.7); z-index: 15;
      font-family: 'Courier New', monospace; font-size: 48px;
      color: #0f0; text-shadow: 0 0 20px #0f0;
    `;
    this.pauseOverlay.textContent = 'PAUSED';
    document.getElementById('game-container')!.appendChild(this.pauseOverlay);
  }

  private startGame(): void {
    // Init audio on user interaction
    this.audio.init();

    // Reset everything
    this.player.reset();
    this.enemies.reset();
    this.projectiles.reset();
    this.particles.reset();
    this.screenShake.reset();
    this.world.reset();
    this.hud.reset();
    this.bossWasActive = false;

    // Debug: skip to level via URL param ?level=N
    const urlLevel = new URLSearchParams(window.location.search).get('level');
    if (urlLevel) {
      const skip = parseInt(urlLevel);
      for (let i = 0; i < skip; i++) this.world.nextLevel();
    }

    // Setup level
    this.world.setupLevel(this.scene);
    this.updateLighting();

    // Reset dynamic camera
    this.camSwoopProgress = 0;
    this.camCurrentFov = CAM_NORMAL_FOV;
    this.camera.fov = CAM_NORMAL_FOV;
    this.camera.updateProjectionMatrix();
    this.camPrevPlayerX = 0;
    this.camVelocityX = 0;
    this.camCombatTimer = 0;

    // UI
    document.getElementById('menu-screen')!.style.display = 'none';
    document.getElementById('gameover-screen')!.style.display = 'none';
    document.getElementById('victory-screen')!.style.display = 'none';
    document.getElementById('level-select-screen')!.style.display = 'none';
    this.hud.show();
    this.hud.showLevelTitle(this.world.levelDef.name, this.world.levelDef.subtitle);

    this.state = GameState.PLAYING;
    this.audio.startMusic();
  }

  private updateLighting(): void {
    const level = this.world.levelDef;
    this.ambientLight.intensity = level.ambientIntensity;
    this.sunLight.intensity = level.sunIntensity;

    // Set light colors per environment
    switch (level.environment) {
      case 'crystal_depths':
        this.ambientLight.color.set(0x2244aa);
        this.sunLight.color.set(0x88aaff);
        break;
      case 'neon_city':
        this.ambientLight.color.set(0x221144);
        this.sunLight.color.set(0xcc88ff);
        break;
      case 'volcanic_core':
        this.ambientLight.color.set(0x442200);
        this.sunLight.color.set(0xff8844);
        break;
      case 'emerald_planet':
        this.ambientLight.color.set(0x446644);
        this.sunLight.color.set(0xffeedd);
        this.sunLight.position.set(20, 30, -10);
        break;
    }
  }

  start(): void {
    this.lastTime = performance.now();
    this.loop();
  }

  private loop = (): void => {
    requestAnimationFrame(this.loop);

    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Clamp dt to prevent spiral of death
    dt = Math.min(dt, 1 / 30);

    switch (this.state) {
      case GameState.MENU:
        this.renderMenu(dt);
        break;
      case GameState.PLAYING:
        this.updatePlaying(dt);
        break;
      case GameState.PAUSED:
        this.updatePaused();
        break;
      case GameState.LEVEL_TRANSITION:
        this.updateTransition(dt);
        break;
      case GameState.GAME_OVER:
      case GameState.VICTORY:
        // Just render
        break;
    }

    // Always render
    this.postFX.render();
    this.input.endFrame();
  };

  private menuInitialized = false;

  private renderMenu(dt: number): void {
    // Set up a nice background scene on first render
    if (!this.menuInitialized) {
      this.menuInitialized = true;
      this.scene.background = new THREE.Color(0x020818);
      this.scene.fog = new THREE.FogExp2(0x0a1533, 0.003);
    }

    // Slowly rotating camera for menu background
    const time = performance.now() * 0.001;
    this.camera.position.set(
      Math.sin(time * 0.08) * 15,
      6 + Math.sin(time * 0.12) * 2,
      Math.cos(time * 0.08) * 15
    );
    this.camera.lookAt(0, 3, -10);
    this.particles.update(dt);
  }

  private updatePlaying(dt: number): void {
    // Pause check
    if (this.input.pause) {
      this.state = GameState.PAUSED;
      this.pauseOverlay!.style.display = 'flex';
      return;
    }

    // Update systems
    this.player.update(dt, this.input, this.projectiles, this.particles, this.audio);
    this.enemies.update(dt, this.player.position, this.projectiles);
    this.projectiles.update(dt);
    this.particles.update(dt);
    this.world.update(dt, this.enemies);

    // Collision detection
    this.checkCollisions();

    // Bomb (damages all enemies on screen)
    if (this.player.bombFired && this.player.isAlive) {
      this.doBombAttack();
    }

    // Camera follow
    this.updateCamera(dt);

    // Screen shake
    this.screenShake.update(dt, this.camera);

    // Update crosshair position
    this.hud.updateCrosshair(this.input.mouseX, this.input.mouseY);

    // HUD
    const boss = this.enemies.activeBoss;
    this.hud.update(dt, {
      score: this.player.score,
      lives: this.player.lives,
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      shields: this.player.shields,
      maxShields: this.player.maxShields,
      bombs: this.player.bombs,
      laserLevel: this.player.laserLevel,
      bossHealth: boss?.health,
      bossMaxHealth: boss?.maxHealth,
      bossName: boss ? 'CORE GUARDIAN' : undefined,
    });

    // Check game over
    if (!this.player.isAlive && this.player.lives <= 0) {
      this.gameOver();
      return;
    }

    // Check if boss was just defeated (must be before level complete check)
    if (this.world.levelDef.hasBoss) {
      if (this.enemies.activeBoss) {
        this.bossWasActive = true;
      } else if (this.bossWasActive) {
        this.world.bossDefeated = true;
        this.bossWasActive = false;
      }
    }

    // Check level complete
    if (this.world.levelComplete) {
      if (this.world.allLevelsComplete || !this.world.nextLevel()) {
        this.victory();
      } else {
        this.state = GameState.LEVEL_TRANSITION;
        this.transitionTimer = 4;
        this.enemies.reset();
        this.projectiles.reset();
        this.bossWasActive = false;
        this.hud.showMissionComplete();
        // Delay setting up next level for a moment
        setTimeout(() => {
          this.world.setupLevel(this.scene);
          this.updateLighting();
          this.camSwoopProgress = 0; // Trigger camera swoop for new level
          this.hud.showLevelTitle(this.world.levelDef.name, this.world.levelDef.subtitle);
        }, 1500);
      }
    }
  }

  private checkCollisions(): void {
    const playerPos = this.player.position;
    const playerRadius = 1.2;

    // Player lasers vs enemies
    const playerProjectiles = this.projectiles.getActivePlayerProjectiles();
    const activeEnemies = this.enemies.getActive();

    for (const proj of playerProjectiles) {
      for (const enemy of activeEnemies) {
        const dist = proj.mesh.position.distanceTo(enemy.mesh.position);
        if (dist < enemy.hitRadius) {
          // Hit!
          const killed = this.enemies.damageEnemy(enemy, proj.damage);
          this.projectiles.deactivate(proj);
          this.particles.laserImpact(proj.mesh.position.clone());

          if (killed) {
            this.particles.explosion(enemy.mesh.position.clone(),
              enemy.type === EnemyType.BOSS ? 3 : 1); // Boss = big explosion
            this.hud.addComboHit();
            const comboMult = this.hud.getComboMultiplier();
            const points = enemy.scoreValue * comboMult;
            this.player.addScore(points);
            this.audio.playExplosion();
            this.screenShake.add(enemy.type === EnemyType.BOSS ? 1.5 : 0.3);

            if (enemy.type === EnemyType.BOSS) {
              // Boss killed
              this.audio.playBigExplosion();
              this.particles.bigExplosion(enemy.mesh.position.clone());
            }

            // Chance to drop a power-up (20%, not from bosses)
            if (enemy.type !== EnemyType.BOSS && Math.random() < 0.2) {
              const puType = this.rollPowerUpType();
              this.world.spawnPowerUp(enemy.mesh.position.clone(), puType);
            }
          } else {
            this.audio.playHit();
          }
          break;
        }
      }
    }

    // Enemy lasers vs player
    if (this.player.isAlive && !this.player.isInvincible) {
      const enemyProjectiles = this.projectiles.getActiveEnemyProjectiles();
      for (const proj of enemyProjectiles) {
        const dist = proj.mesh.position.distanceTo(playerPos);
        if (dist < playerRadius + 0.3) {
          const killed = this.player.takeDamage(proj.damage);
          this.projectiles.deactivate(proj);
          this.audio.playHit();
          this.screenShake.add(0.5);
          this.particles.laserImpact(proj.mesh.position.clone());

          if (killed) {
            this.particles.bigExplosion(playerPos.clone());
            this.audio.playBigExplosion();
            this.screenShake.add(1.0);
          }
        }
      }
    }

    // Enemy ships vs player (collision)
    if (this.player.isAlive && !this.player.isInvincible) {
      for (const enemy of activeEnemies) {
        const dist = enemy.mesh.position.distanceTo(playerPos);
        if (dist < playerRadius + enemy.hitRadius * 0.7) {
          this.player.takeDamage(30);
          this.enemies.damageEnemy(enemy, 50);
          this.audio.playHit();
          this.screenShake.add(0.8);
          this.particles.explosion(
            playerPos.clone().lerp(enemy.mesh.position, 0.5),
            0.5
          );
        }
      }
    }

    // Player vs health rings
    const rings = this.world.getRingObjects();
    for (const ring of rings) {
      const dist = ring.mesh.position.distanceTo(playerPos);
      if (dist < 2.5) {
        this.player.heal(25);
        this.player.addShields(15);
        this.audio.playPowerUp();
        this.particles.emit(ring.mesh.position.clone(), 20, {
          speed: 8,
          spread: 2,
          life: 0.5,
          scaleStart: 0.5,
          scaleEnd: 0,
          colorStart: new THREE.Color(1, 1, 0),
          colorEnd: new THREE.Color(1, 0.8, 0),
        });
        this.world.removeEnvObject(ring);
      }
    }

    // Player vs power-ups
    if (this.player.isAlive) {
      const activePowerUps = this.world.getActivePowerUps();
      for (const pu of activePowerUps) {
        const dist = pu.mesh.position.distanceTo(playerPos);
        if (dist < 2.0) {
          this.applyPowerUp(pu.type);
          this.audio.playPowerUp();
          this.particles.emit(pu.mesh.position.clone(), 25, {
            speed: 10,
            spread: 2,
            life: 0.6,
            scaleStart: 0.6,
            scaleEnd: 0,
            colorStart: new THREE.Color(1, 1, 1),
            colorEnd: new THREE.Color(0.5, 1, 0.5),
          });
          this.world.removePowerUp(pu);
        }
      }
    }
  }

  private doBombAttack(): void {
    // The bomb input was already handled in Player.ts (bombs decremented)
    // Apply damage to all visible enemies
    const activeEnemies = this.enemies.getActive();
    for (const enemy of activeEnemies) {
      if (enemy.mesh.position.z > -100) {
        const killed = this.enemies.damageEnemy(enemy, 100);
        if (killed) {
          this.particles.explosion(enemy.mesh.position.clone());
          this.player.addScore(enemy.scoreValue);
          this.audio.playExplosion();
        }
      }
    }
    this.screenShake.add(1.5);
    // Big flash
    this.particles.emit(this.player.position.clone().add(new THREE.Vector3(0, 0, -20)), 60, {
      speed: 30,
      spread: 5,
      life: 1.0,
      scaleStart: 2,
      scaleEnd: 0,
      colorStart: new THREE.Color(1, 1, 1),
      colorEnd: new THREE.Color(0.5, 0.5, 1),
    });
  }

  private rollPowerUpType(): PowerUpType {
    const roll = Math.random();
    if (roll < 0.50) return PowerUpType.HEALTH;         // 50%
    if (roll < 0.70) return PowerUpType.SHIELD;          // 20%
    if (roll < 0.90) return PowerUpType.LASER_UPGRADE;   // 20%
    return PowerUpType.BOMB;                              // 10%
  }

  private applyPowerUp(type: PowerUpType): void {
    switch (type) {
      case PowerUpType.HEALTH:
        this.player.heal(40);
        break;
      case PowerUpType.SHIELD:
        this.player.addShields(30);
        break;
      case PowerUpType.LASER_UPGRADE:
        this.player.upgradeLaser();
        break;
      case PowerUpType.BOMB:
        this.player.bombs = Math.min(this.player.bombs + 1, 9);
        break;
    }
  }

  private updateCamera(dt: number): void {
    // Track player velocity for look-ahead
    const playerVelX = (this.player.position.x - this.camPrevPlayerX) / Math.max(dt, 0.001);
    this.camPrevPlayerX = this.player.position.x;
    this.camVelocityX += (playerVelX - this.camVelocityX) * 3 * dt;

    // Player movement intensity (0-1)
    const moveIntensity = Math.min(1, Math.abs(this.camVelocityX) / 20);

    // Cinematic level intro swoop
    if (this.camSwoopProgress < 1) {
      this.camSwoopProgress += CAM_SWOOP_SPEED * dt;
      const t = Math.min(1, this.camSwoopProgress);
      const ease = t * t * (3 - 2 * t); // smoothstep

      // Camera starts high and behind, swoops down to game position
      const swoopStartY = CAMERA_BASE.y + 15;
      const swoopStartZ = CAMERA_BASE.z + 20;
      const swoopY = swoopStartY + (CAMERA_BASE.y - swoopStartY) * ease;
      const swoopZ = swoopStartZ + (CAMERA_BASE.z - swoopStartZ) * ease;

      this.camera.position.set(
        Math.sin(t * Math.PI * 0.5) * 5 * (1 - ease), // slight lateral sweep
        swoopY,
        swoopZ
      );

      const lookTarget = new THREE.Vector3(
        0,
        this.player.position.y * 0.3 + CAMERA_LOOK_OFFSET.y,
        CAMERA_LOOK_OFFSET.z
      );
      this.camera.lookAt(lookTarget);
      return;
    }

    // Boss fight: widen FOV and pull camera back slightly
    const hasBoss = this.enemies.activeBoss !== null;
    this.camTargetFov = hasBoss ? CAM_BOSS_FOV : CAM_NORMAL_FOV;
    this.camCurrentFov += (this.camTargetFov - this.camCurrentFov) * 2 * dt;
    if (Math.abs(this.camCurrentFov - this.camera.fov) > 0.1) {
      this.camera.fov = this.camCurrentFov;
      this.camera.updateProjectionMatrix();
    }

    // Combat sway - subtle camera movement during active combat
    const activeEnemyCount = this.enemies.getActive().length;
    this.camCombatTimer += dt;
    const combatSway = activeEnemyCount > 0
      ? Math.sin(this.camCombatTimer * 1.5) * CAM_COMBAT_SHAKE_FACTOR * Math.min(1, activeEnemyCount / 5)
      : 0;

    // Speed-based Z offset (camera pulls back when moving fast)
    const speedZOffset = moveIntensity * CAM_SPEED_Z_OFFSET;

    // Look-ahead: camera leads slightly in the direction player is moving
    const lookAheadX = this.camVelocityX * 0.08;

    // Target camera position
    const targetPos = new THREE.Vector3(
      this.player.position.x * CAM_FOLLOW_X + lookAheadX,
      CAMERA_BASE.y + this.player.position.y * CAM_FOLLOW_Y + combatSway,
      CAMERA_BASE.z + speedZOffset + (hasBoss ? 4 : 0)
    );
    this.camera.position.lerp(targetPos, 3.5 * dt);

    // Look target with look-ahead
    const lookAt = new THREE.Vector3(
      this.player.position.x * 0.4 + lookAheadX * 1.5,
      this.player.position.y * 0.4 + CAMERA_LOOK_OFFSET.y,
      CAMERA_LOOK_OFFSET.z
    );
    this.camera.lookAt(lookAt);

    // Camera bank/roll - tilts with player movement
    const targetBank = -this.player.position.x * CAM_BANK_FACTOR - this.camVelocityX * 0.003;
    this.camera.rotation.z = this.camera.rotation.z + (targetBank - this.camera.rotation.z) * 4 * dt;
  }

  private updatePaused(): void {
    if (this.input.pause) {
      this.state = GameState.PLAYING;
      this.pauseOverlay!.style.display = 'none';
    }
  }

  private updateTransition(dt: number): void {
    this.transitionTimer -= dt;
    this.particles.update(dt);
    this.world.update(dt, this.enemies);
    this.player.update(dt, this.input, this.projectiles, this.particles, this.audio);
    this.camera.position.y += 0.5 * dt;
    this.updateCamera(dt);

    this.hud.update(dt, {
      score: this.player.score,
      lives: this.player.lives,
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      shields: this.player.shields,
      maxShields: this.player.maxShields,
      bombs: this.player.bombs,
      laserLevel: this.player.laserLevel,
    });

    if (this.transitionTimer <= 0) {
      this.state = GameState.PLAYING;
    }
  }

  private gameOver(): void {
    this.screenShake.add(1.0);
    this.state = GameState.GAME_OVER;
    this.hud.hide();
    this.audio.stopMusic();

    const el = document.getElementById('gameover-screen')!;
    el.style.display = 'flex';
    document.getElementById('gameover-score')!.textContent =
      `SCORE: ${this.player.score.toString().padStart(8, '0')}`;
  }

  private victory(): void {
    this.screenShake.add(0.5);
    this.state = GameState.VICTORY;
    this.hud.hide();
    this.audio.stopMusic();

    const el = document.getElementById('victory-screen')!;
    el.style.display = 'flex';
    document.getElementById('victory-score')!.textContent =
      `SCORE: ${this.player.score.toString().padStart(8, '0')}`;
  }

  private buildLevelSelectCards(): void {
    const grid = document.getElementById('level-grid')!;
    const levelData = [
      { name: 'PLANET AZURIS', sub: 'The Crystal Depths', env: 'crystal_depths' },
      { name: 'NOVA PRIME', sub: 'Neon Megacity', env: 'neon_city' },
      { name: 'PLANET INFERNUS', sub: 'The Molten Core', env: 'volcanic_core' },
      { name: 'PLANET VERDANA', sub: 'The Emerald Expanse', env: 'emerald_planet' },
    ];

    for (let i = 0; i < levelData.length; i++) {
      const data = levelData[i];
      const card = document.createElement('div');
      card.className = 'level-card';
      card.setAttribute('data-env', data.env);
      card.innerHTML = `
        <div class="level-num">MISSION ${i + 1}</div>
        <div class="level-name">${data.name}</div>
        <div class="level-sub">${data.sub}</div>
        <div class="level-env-strip"></div>
      `;
      card.addEventListener('click', () => this.startGameAtLevel(i));
      grid.appendChild(card);
    }
  }

  private showLevelSelect(): void {
    document.getElementById('menu-screen')!.style.display = 'none';
    document.getElementById('level-select-screen')!.style.display = 'flex';
  }

  private hideLevelSelect(): void {
    document.getElementById('level-select-screen')!.style.display = 'none';
    document.getElementById('menu-screen')!.style.display = 'flex';
  }

  private startGameAtLevel(levelIndex: number): void {
    // Init audio on user interaction
    this.audio.init();

    // Reset everything
    this.player.reset();
    this.enemies.reset();
    this.projectiles.reset();
    this.particles.reset();
    this.screenShake.reset();
    this.world.reset();
    this.hud.reset();
    this.bossWasActive = false;

    // Skip to chosen level
    for (let i = 0; i < levelIndex; i++) this.world.nextLevel();

    // Setup level
    this.world.setupLevel(this.scene);
    this.updateLighting();

    // Reset dynamic camera
    this.camSwoopProgress = 0;
    this.camCurrentFov = CAM_NORMAL_FOV;
    this.camera.fov = CAM_NORMAL_FOV;
    this.camera.updateProjectionMatrix();
    this.camPrevPlayerX = 0;
    this.camVelocityX = 0;
    this.camCombatTimer = 0;

    // UI
    document.getElementById('menu-screen')!.style.display = 'none';
    document.getElementById('gameover-screen')!.style.display = 'none';
    document.getElementById('victory-screen')!.style.display = 'none';
    document.getElementById('level-select-screen')!.style.display = 'none';
    this.hud.show();
    this.hud.showLevelTitle(this.world.levelDef.name, this.world.levelDef.subtitle);

    this.state = GameState.PLAYING;
    this.audio.startMusic();
  }

  private onResize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.postFX.resize(w, h, this.renderer.getPixelRatio());
  }
}
