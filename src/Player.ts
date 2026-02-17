import * as THREE from 'three';
import { InputManager } from './Input';
import { buildArwing } from './Models';
import { ProjectileManager } from './Projectiles';
import { ParticleSystem } from './Effects';
import { AudioManager } from './Audio';

const MOVE_SPEED = 22;
const BOUNDS_X = 14;
const BOUNDS_Y = 8;
const FIRE_COOLDOWN = 0.1;
const BARREL_ROLL_DURATION = 0.45;
const BARREL_ROLL_COOLDOWN = 1.2;
const INVINCIBILITY_AFTER_HIT = 1.5;
const BANK_SPEED = 5;
const MAX_BANK_ANGLE = 0.6;
const MAX_PITCH_ANGLE = 0.4;

export class Player {
  mesh: THREE.Group;
  position: THREE.Vector3;
  health = 100;
  maxHealth = 100;
  shields = 50;
  maxShields = 50;
  score = 0;
  lives = 3;
  bombs = 3;
  laserLevel = 1;

  private fireCooldown = 0;
  private barrelRollTimer = 0;
  private barrelRollCooldown = 0;
  private invincibilityTimer = 0;
  private currentBank = 0;
  private currentPitch = 0;
  private alive = true;
  private respawnTimer = 0;
  private flashTimer = 0;
  bombFired = false; // Set true on frame bomb is used, read by Game

  constructor() {
    this.mesh = buildArwing();
    this.position = new THREE.Vector3(0, 3, 0);
    this.mesh.position.copy(this.position);
  }

  get isBarrelRolling(): boolean {
    return this.barrelRollTimer > 0;
  }

  get isInvincible(): boolean {
    return this.invincibilityTimer > 0 || this.isBarrelRolling;
  }

  get isAlive(): boolean {
    return this.alive;
  }

  update(dt: number, input: InputManager, projectiles: ProjectileManager, particles: ParticleSystem, audio: AudioManager): void {
    if (!this.alive) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0 && this.lives > 0) {
        this.respawn();
      }
      this.mesh.visible = false;
      return;
    }

    // Movement
    const mx = input.moveX;
    const my = input.moveY;

    this.position.x += mx * MOVE_SPEED * dt;
    this.position.y += my * MOVE_SPEED * dt;

    // Clamp to bounds
    this.position.x = Math.max(-BOUNDS_X, Math.min(BOUNDS_X, this.position.x));
    this.position.y = Math.max(1, Math.min(BOUNDS_Y, this.position.y));

    // Banking animation
    const targetBank = -mx * MAX_BANK_ANGLE;
    this.currentBank += (targetBank - this.currentBank) * BANK_SPEED * dt;

    const targetPitch = my * MAX_PITCH_ANGLE;
    this.currentPitch += (targetPitch - this.currentPitch) * BANK_SPEED * dt;

    // Barrel roll
    if (this.barrelRollTimer > 0) {
      this.barrelRollTimer -= dt;
      const rollProgress = 1 - this.barrelRollTimer / BARREL_ROLL_DURATION;
      this.mesh.rotation.z = rollProgress * Math.PI * 2 + this.currentBank;
    } else {
      this.mesh.rotation.z = this.currentBank;

      if (input.barrelRoll && this.barrelRollCooldown <= 0) {
        this.barrelRollTimer = BARREL_ROLL_DURATION;
        this.barrelRollCooldown = BARREL_ROLL_COOLDOWN;
        audio.playBarrelRoll();
      }
    }

    if (this.barrelRollCooldown > 0) this.barrelRollCooldown -= dt;

    this.mesh.rotation.x = this.currentPitch;
    this.mesh.position.copy(this.position);

    // Shooting
    this.fireCooldown -= dt;
    if (input.fire && this.fireCooldown <= 0) {
      this.fireCooldown = FIRE_COOLDOWN;
      const firePos = this.position.clone();
      const dir = new THREE.Vector3(0, 0, -1);

      if (this.laserLevel >= 2) {
        // Dual lasers
        projectiles.firePlayerLaser(firePos.clone().add(new THREE.Vector3(-0.5, 0, -1)), dir);
        projectiles.firePlayerLaser(firePos.clone().add(new THREE.Vector3(0.5, 0, -1)), dir);
      } else {
        projectiles.firePlayerLaser(firePos.clone().add(new THREE.Vector3(0, 0, -1)), dir);
      }

      if (this.laserLevel >= 3) {
        // Spread shot
        const leftDir = new THREE.Vector3(-0.15, 0, -1).normalize();
        const rightDir = new THREE.Vector3(0.15, 0, -1).normalize();
        projectiles.firePlayerLaser(firePos.clone().add(new THREE.Vector3(-1, 0, -0.5)), leftDir);
        projectiles.firePlayerLaser(firePos.clone().add(new THREE.Vector3(1, 0, -0.5)), rightDir);
      }

      audio.playLaser();
    }

    // Bombs
    this.bombFired = false;
    if (input.bomb && this.bombs > 0) {
      this.bombs--;
      this.bombFired = true;
      audio.playBomb();
    }

    // Invincibility flash
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= dt;
      this.flashTimer += dt;
      this.mesh.visible = Math.sin(this.flashTimer * 20) > 0;
    } else {
      this.mesh.visible = true;
      this.flashTimer = 0;
    }

    // Engine trail particles - more intense when moving fast
    const moveIntensity = Math.sqrt(mx * mx + my * my);
    const boostIntensity = 1 + moveIntensity * 1.5;
    const leftEngine = this.position.clone().add(new THREE.Vector3(-2.1, -0.06, 0.84));
    const rightEngine = this.position.clone().add(new THREE.Vector3(2.1, -0.06, 0.84));
    const mainEngine = this.position.clone().add(new THREE.Vector3(0, 0, 1.05));
    particles.engineTrail(leftEngine, boostIntensity);
    particles.engineTrail(rightEngine, boostIntensity);
    particles.engineTrail(mainEngine, 1.5 * boostIntensity);

    // Extra engine flare particles when moving fast
    if (moveIntensity > 0.5) {
      const extraCount = Math.ceil(moveIntensity * 3);
      for (let i = 0; i < extraCount; i++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.2,
          1.2 + Math.random() * 0.3
        );
        particles.emit(this.position.clone().add(offset), 1, {
          speed: 6 + moveIntensity * 4,
          spread: 0.5,
          direction: new THREE.Vector3(0, 0, 1),
          life: 0.2,
          scaleStart: 0.2 * moveIntensity,
          scaleEnd: 0,
          colorStart: new THREE.Color(0.4, 0.7, 1),
          colorEnd: new THREE.Color(0.1, 0.2, 0.8),
        });
      }
    }

    // Shield regeneration (slow)
    if (this.shields < this.maxShields) {
      this.shields = Math.min(this.maxShields, this.shields + 2 * dt);
    }
  }

  takeDamage(amount: number): boolean {
    if (this.isInvincible || !this.alive) return false;

    // Shields absorb first
    if (this.shields > 0) {
      const shieldDamage = Math.min(this.shields, amount);
      this.shields -= shieldDamage;
      amount -= shieldDamage;
    }

    this.health -= amount;
    this.invincibilityTimer = INVINCIBILITY_AFTER_HIT;

    if (this.health <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  private die(): void {
    this.alive = false;
    this.lives--;
    this.respawnTimer = 2;
    this.mesh.visible = false;
  }

  private respawn(): void {
    this.alive = true;
    this.health = this.maxHealth;
    this.shields = this.maxShields;
    this.invincibilityTimer = 3;
    this.position.set(0, 3, 0);
    this.mesh.visible = true;
    this.laserLevel = 1;
  }

  addScore(points: number): void {
    this.score += points;
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  addShields(amount: number): void {
    this.shields = Math.min(this.maxShields, this.shields + amount);
  }

  upgradeLaser(): void {
    this.laserLevel = Math.min(3, this.laserLevel + 1);
  }

  reset(): void {
    this.health = this.maxHealth;
    this.shields = this.maxShields;
    this.score = 0;
    this.lives = 3;
    this.bombs = 3;
    this.laserLevel = 1;
    this.alive = true;
    this.position.set(0, 3, 0);
    this.mesh.position.copy(this.position);
    this.mesh.visible = true;
    this.invincibilityTimer = 0;
    this.barrelRollTimer = 0;
    this.barrelRollCooldown = 0;
    this.fireCooldown = 0;
    this.currentBank = 0;
    this.currentPitch = 0;
  }
}
