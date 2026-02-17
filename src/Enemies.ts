import * as THREE from 'three';
import {
  buildEnemyFighter,
  buildEnemyInterceptor,
  buildEnemyBomber,
  buildTurret,
  buildBoss,
} from './Models';
import { ProjectileManager } from './Projectiles';

export enum EnemyType {
  FIGHTER,
  INTERCEPTOR,
  BOMBER,
  TURRET,
  BOSS,
}

export interface Enemy {
  mesh: THREE.Group;
  type: EnemyType;
  health: number;
  maxHealth: number;
  speed: number;
  fireRate: number;
  fireCooldown: number;
  scoreValue: number;
  active: boolean;
  behavior: 'straight' | 'sine' | 'chase' | 'strafe' | 'boss';
  phaseTimer: number;
  hitRadius: number;
  // Hit flash
  hitFlashTimer: number;
  // Boss specific
  bossPhase: number;
  bossAttackTimer: number;
  startX: number;
  startY: number;
}

const ENEMY_CONFIGS: Record<EnemyType, Omit<Enemy, 'mesh' | 'active' | 'phaseTimer' | 'fireCooldown' | 'hitFlashTimer' | 'bossPhase' | 'bossAttackTimer' | 'startX' | 'startY'>> = {
  [EnemyType.FIGHTER]: {
    type: EnemyType.FIGHTER,
    health: 10,
    maxHealth: 10,
    speed: 25,
    fireRate: 2,
    scoreValue: 100,
    behavior: 'straight',
    hitRadius: 1.5,
  },
  [EnemyType.INTERCEPTOR]: {
    type: EnemyType.INTERCEPTOR,
    health: 8,
    maxHealth: 8,
    speed: 40,
    fireRate: 1.5,
    scoreValue: 150,
    behavior: 'sine',
    hitRadius: 1.2,
  },
  [EnemyType.BOMBER]: {
    type: EnemyType.BOMBER,
    health: 40,
    maxHealth: 40,
    speed: 15,
    fireRate: 3,
    scoreValue: 250,
    behavior: 'straight',
    hitRadius: 2.5,
  },
  [EnemyType.TURRET]: {
    type: EnemyType.TURRET,
    health: 25,
    maxHealth: 25,
    speed: 20,
    fireRate: 1.5,
    scoreValue: 200,
    behavior: 'straight',
    hitRadius: 1.8,
  },
  [EnemyType.BOSS]: {
    type: EnemyType.BOSS,
    health: 500,
    maxHealth: 500,
    speed: 5,
    fireRate: 0.5,
    scoreValue: 5000,
    behavior: 'boss',
    hitRadius: 5,
  },
};

function buildMeshForType(type: EnemyType): THREE.Group {
  switch (type) {
    case EnemyType.FIGHTER: return buildEnemyFighter();
    case EnemyType.INTERCEPTOR: return buildEnemyInterceptor();
    case EnemyType.BOMBER: return buildEnemyBomber();
    case EnemyType.TURRET: return buildTurret();
    case EnemyType.BOSS: return buildBoss();
  }
}

export class EnemyManager {
  private pool: Enemy[] = [];
  group: THREE.Group;
  activeBoss: Enemy | null = null;

  constructor() {
    this.group = new THREE.Group();
  }

  spawn(type: EnemyType, x: number, y: number, z: number, behavior?: Enemy['behavior']): Enemy {
    // Try to reuse inactive enemy of same type
    let enemy = this.pool.find(e => !e.active && e.type === type);

    if (!enemy) {
      const mesh = buildMeshForType(type);
      this.group.add(mesh);
      const config = ENEMY_CONFIGS[type];
      enemy = {
        ...config,
        mesh,
        active: false,
        phaseTimer: Math.random() * Math.PI * 2,
        fireCooldown: Math.random() * config.fireRate,
        hitFlashTimer: 0,
        bossPhase: 0,
        bossAttackTimer: 0,
        startX: x,
        startY: y,
      };
      this.pool.push(enemy);
    }

    const config = ENEMY_CONFIGS[type];
    enemy.active = true;
    enemy.mesh.visible = true;
    enemy.health = config.health;
    enemy.maxHealth = config.health;
    enemy.mesh.position.set(x, y, z);
    enemy.phaseTimer = Math.random() * Math.PI * 2;
    enemy.fireCooldown = Math.random() * config.fireRate;
    enemy.startX = x;
    enemy.startY = y;
    enemy.mesh.rotation.set(0, Math.PI, 0); // Face toward player (+Z)
    if (behavior) enemy.behavior = behavior;
    else enemy.behavior = config.behavior;

    if (type === EnemyType.BOSS) {
      enemy.bossPhase = 0;
      enemy.bossAttackTimer = 0;
      this.activeBoss = enemy;
    }

    return enemy;
  }

  update(dt: number, playerPos: THREE.Vector3, projectiles: ProjectileManager): void {
    for (const enemy of this.pool) {
      if (!enemy.active) continue;

      enemy.phaseTimer += dt;

      switch (enemy.behavior) {
        case 'straight':
          enemy.mesh.position.z += enemy.speed * dt;
          break;

        case 'sine':
          enemy.mesh.position.z += enemy.speed * dt;
          enemy.mesh.position.x = enemy.startX + Math.sin(enemy.phaseTimer * 3) * 6;
          enemy.mesh.position.y = enemy.startY + Math.cos(enemy.phaseTimer * 2) * 2;
          break;

        case 'chase':
          enemy.mesh.position.z += enemy.speed * dt;
          const dx = playerPos.x - enemy.mesh.position.x;
          const dy = playerPos.y - enemy.mesh.position.y;
          enemy.mesh.position.x += Math.sign(dx) * Math.min(Math.abs(dx), 8 * dt);
          enemy.mesh.position.y += Math.sign(dy) * Math.min(Math.abs(dy), 8 * dt);
          break;

        case 'strafe':
          enemy.mesh.position.z += enemy.speed * 0.5 * dt;
          enemy.mesh.position.x = enemy.startX + Math.sin(enemy.phaseTimer * 2) * 10;
          break;

        case 'boss':
          this.updateBoss(enemy, dt, playerPos, projectiles);
          break;
      }

      // Shooting (non-boss)
      if (enemy.behavior !== 'boss') {
        enemy.fireCooldown -= dt;
        if (enemy.fireCooldown <= 0 && enemy.mesh.position.z < playerPos.z + 20) {
          enemy.fireCooldown = enemy.fireRate;
          const dir = new THREE.Vector3();
          dir.subVectors(playerPos, enemy.mesh.position).normalize();
          projectiles.fireEnemyLaser(enemy.mesh.position.clone(), dir, 40);
        }
      }

      // Hit flash update
      if (enemy.hitFlashTimer > 0) {
        enemy.hitFlashTimer -= dt;
        if (enemy.hitFlashTimer <= 0) {
          // Restore original materials
          enemy.mesh.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              const mat = mesh.material as THREE.MeshStandardMaterial;
              if (mat.isMeshStandardMaterial && (mat as any)._origEmissive) {
                mat.emissive.copy((mat as any)._origEmissive);
                mat.emissiveIntensity = (mat as any)._origEmissiveIntensity;
              }
            }
          });
        }
      }

      // Despawn if past player
      if (enemy.mesh.position.z > 30) {
        enemy.active = false;
        enemy.mesh.visible = false;
        if (enemy.type === EnemyType.BOSS) this.activeBoss = null;
      }
    }
  }

  private updateBoss(boss: Enemy, dt: number, playerPos: THREE.Vector3, projectiles: ProjectileManager): void {
    // Boss hovers at a position ahead of player
    const targetZ = playerPos.z - 30;
    boss.mesh.position.z += (targetZ - boss.mesh.position.z) * dt;

    boss.bossAttackTimer += dt;
    const healthPercent = boss.health / boss.maxHealth;

    // Phase transitions based on health
    const prevPhase = boss.bossPhase;
    if (healthPercent < 0.3) boss.bossPhase = 2;
    else if (healthPercent < 0.6) boss.bossPhase = 1;
    if (boss.bossPhase !== prevPhase) boss.bossAttackTimer = 0;

    // Movement pattern based on phase
    switch (boss.bossPhase) {
      case 0: // Slow strafe
        boss.mesh.position.x = Math.sin(boss.phaseTimer * 0.5) * 8;
        boss.mesh.position.y = 4 + Math.cos(boss.phaseTimer * 0.3) * 2;
        break;
      case 1: // Faster, more erratic
        boss.mesh.position.x = Math.sin(boss.phaseTimer * 1.0) * 10;
        boss.mesh.position.y = 4 + Math.sin(boss.phaseTimer * 0.8) * 3;
        break;
      case 2: // Aggressive
        boss.mesh.position.x = Math.sin(boss.phaseTimer * 1.5) * 12;
        boss.mesh.position.y = 4 + Math.sin(boss.phaseTimer * 1.2) * 4;
        break;
    }

    // Shooting patterns
    const fireInterval = boss.bossPhase === 2 ? 0.3 : boss.bossPhase === 1 ? 0.5 : 0.8;

    if (boss.bossAttackTimer >= fireInterval) {
      boss.bossAttackTimer = 0;

      const bPos = boss.mesh.position;
      const dirToPlayer = new THREE.Vector3().subVectors(playerPos, bPos).normalize();

      // Main cannon
      projectiles.fireEnemyLaser(bPos.clone(), dirToPlayer, 55);

      // Side cannons
      if (boss.bossPhase >= 1) {
        const leftPos = bPos.clone().add(new THREE.Vector3(-5, 0, 0));
        const rightPos = bPos.clone().add(new THREE.Vector3(5, 0, 0));
        projectiles.fireEnemyLaser(leftPos, dirToPlayer.clone(), 45);
        projectiles.fireEnemyLaser(rightPos, dirToPlayer.clone(), 45);
      }

      // Spray pattern in phase 2
      if (boss.bossPhase >= 2) {
        for (let i = -2; i <= 2; i++) {
          const spreadDir = dirToPlayer.clone();
          spreadDir.x += i * 0.15;
          spreadDir.normalize();
          projectiles.fireEnemyLaser(bPos.clone(), spreadDir, 50);
        }
      }
    }
  }

  getActive(): Enemy[] {
    return this.pool.filter(e => e.active);
  }

  damageEnemy(enemy: Enemy, damage: number): boolean {
    enemy.health -= damage;
    if (enemy.health <= 0) {
      enemy.active = false;
      enemy.mesh.visible = false;
      if (enemy.type === EnemyType.BOSS) this.activeBoss = null;
      return true;
    }

    // Hit flash - make enemy flash white briefly
    enemy.hitFlashTimer = 0.12;
    enemy.mesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.isMeshStandardMaterial) {
          // Save original emissive values if not already saved
          if (!(mat as any)._origEmissive) {
            (mat as any)._origEmissive = mat.emissive.clone();
            (mat as any)._origEmissiveIntensity = mat.emissiveIntensity;
          }
          mat.emissive.set(0xffffff);
          mat.emissiveIntensity = 1.5;
        }
      }
    });

    return false;
  }

  reset(): void {
    for (const e of this.pool) {
      e.active = false;
      e.mesh.visible = false;
    }
    this.activeBoss = null;
  }
}
