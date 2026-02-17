import * as THREE from 'three';
import { buildPlayerLaser, buildEnemyLaser } from './Models';

export interface Projectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  isPlayerOwned: boolean;
  damage: number;
  lifetime: number;
  age: number;
  active: boolean;
}

const POOL_SIZE = 200;

export class ProjectileManager {
  private playerPool: Projectile[] = [];
  private enemyPool: Projectile[] = [];
  group: THREE.Group;

  constructor() {
    this.group = new THREE.Group();

    for (let i = 0; i < POOL_SIZE; i++) {
      const pMesh = buildPlayerLaser();
      pMesh.visible = false;
      this.group.add(pMesh);
      this.playerPool.push({
        mesh: pMesh,
        velocity: new THREE.Vector3(),
        isPlayerOwned: true,
        damage: 10,
        lifetime: 3,
        age: 0,
        active: false,
      });

      const eMesh = buildEnemyLaser();
      eMesh.visible = false;
      this.group.add(eMesh);
      this.enemyPool.push({
        mesh: eMesh,
        velocity: new THREE.Vector3(),
        isPlayerOwned: false,
        damage: 15,
        lifetime: 4,
        age: 0,
        active: false,
      });
    }
  }

  firePlayerLaser(position: THREE.Vector3, direction: THREE.Vector3): void {
    const p = this.playerPool.find(p => !p.active);
    if (!p) return;

    p.active = true;
    p.mesh.visible = true;
    p.mesh.position.copy(position);
    p.velocity.copy(direction).multiplyScalar(150);
    p.age = 0;
    p.lifetime = 2;
    p.damage = 10;
  }

  fireEnemyLaser(position: THREE.Vector3, direction: THREE.Vector3, speed: number = 50): void {
    const p = this.enemyPool.find(p => !p.active);
    if (!p) return;

    p.active = true;
    p.mesh.visible = true;
    p.mesh.position.copy(position);
    p.velocity.copy(direction).normalize().multiplyScalar(speed);
    p.age = 0;
    p.lifetime = 5;
    p.damage = 15;
  }

  update(dt: number): void {
    const allProjectiles = [...this.playerPool, ...this.enemyPool];
    for (const p of allProjectiles) {
      if (!p.active) continue;
      p.age += dt;
      if (p.age >= p.lifetime) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }
      p.mesh.position.addScaledVector(p.velocity, dt);
    }
  }

  getActivePlayerProjectiles(): Projectile[] {
    return this.playerPool.filter(p => p.active);
  }

  getActiveEnemyProjectiles(): Projectile[] {
    return this.enemyPool.filter(p => p.active);
  }

  deactivate(p: Projectile): void {
    p.active = false;
    p.mesh.visible = false;
  }

  reset(): void {
    for (const p of [...this.playerPool, ...this.enemyPool]) {
      p.active = false;
      p.mesh.visible = false;
    }
  }
}
