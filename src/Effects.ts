import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
  scaleStart: number;
  scaleEnd: number;
  colorStart: THREE.Color;
  colorEnd: THREE.Color;
}

const POOL_SIZE = 1000;
const DEFAULT_COLOR_START = new THREE.Color(1, 1, 0.5);
const DEFAULT_COLOR_END = new THREE.Color(1, 0, 0);

export class ParticleSystem {
  private particles: Particle[] = [];
  group: THREE.Group;
  private geo: THREE.SphereGeometry;

  constructor() {
    this.group = new THREE.Group();
    this.geo = new THREE.SphereGeometry(0.1, 6, 6);

    for (let i = 0; i < POOL_SIZE; i++) {
      const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(this.geo, mat);
      mesh.visible = false;
      this.group.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
        active: false,
        scaleStart: 1,
        scaleEnd: 0,
        colorStart: new THREE.Color(1, 1, 1),
        colorEnd: new THREE.Color(1, 1, 1),
      });
    }
  }

  private getParticle(): Particle | null {
    for (const p of this.particles) {
      if (!p.active) return p;
    }
    return null;
  }

  emit(
    position: THREE.Vector3,
    count: number,
    options: {
      speed?: number;
      spread?: number;
      direction?: THREE.Vector3;
      life?: number;
      scaleStart?: number;
      scaleEnd?: number;
      colorStart?: THREE.Color;
      colorEnd?: THREE.Color;
    } = {}
  ): void {
    const speed = options.speed ?? 10;
    const spread = options.spread ?? 1;
    const dir = options.direction ?? new THREE.Vector3(0, 0, 0);
    const life = options.life ?? 0.5;
    const scaleStart = options.scaleStart ?? 1;
    const scaleEnd = options.scaleEnd ?? 0;
    const colorStart = options.colorStart ?? DEFAULT_COLOR_START;
    const colorEnd = options.colorEnd ?? DEFAULT_COLOR_END;

    for (let i = 0; i < count; i++) {
      const p = this.getParticle();
      if (!p) break;

      p.active = true;
      p.mesh.visible = true;
      p.mesh.position.copy(position);
      p.velocity.set(
        (Math.random() - 0.5) * spread + dir.x,
        (Math.random() - 0.5) * spread + dir.y,
        (Math.random() - 0.5) * spread + dir.z
      ).normalize().multiplyScalar(speed * (0.5 + Math.random() * 0.5));
      p.life = life * (0.8 + Math.random() * 0.4);
      p.maxLife = p.life;
      p.scaleStart = scaleStart;
      p.scaleEnd = scaleEnd;
      p.colorStart.copy(colorStart);
      p.colorEnd.copy(colorEnd);

      const s = scaleStart;
      p.mesh.scale.set(s, s, s);
      (p.mesh.material as THREE.MeshBasicMaterial).color.copy(colorStart);
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = 1;
    }
  }

  explosion(position: THREE.Vector3, size: number = 1): void {
    this.emit(position, Math.floor(30 * size), {
      speed: 15 * size,
      spread: 2,
      life: 0.6 * size,
      scaleStart: 0.8 * size,
      scaleEnd: 0,
      colorStart: new THREE.Color(1, 0.9, 0.3),
      colorEnd: new THREE.Color(1, 0.1, 0),
    });
    // Smoke
    this.emit(position, Math.floor(15 * size), {
      speed: 5 * size,
      spread: 1.5,
      life: 0.7 * size,
      scaleStart: 0.6 * size,
      scaleEnd: 1.2 * size,
      colorStart: new THREE.Color(0.5, 0.3, 0.1),
      colorEnd: new THREE.Color(0.2, 0.2, 0.2),
    });
  }

  bigExplosion(position: THREE.Vector3): void {
    this.explosion(position, 2.5);
    // Extra ring of particles
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const ringPos = position.clone().add(new THREE.Vector3(Math.cos(angle) * 2, Math.sin(angle) * 2, 0));
      this.emit(ringPos, 3, {
        speed: 20,
        spread: 0.5,
        life: 0.8,
        scaleStart: 1.5,
        scaleEnd: 0,
        colorStart: new THREE.Color(1, 1, 1),
        colorEnd: new THREE.Color(1, 0.5, 0),
      });
    }
  }

  engineTrail(position: THREE.Vector3, intensity: number = 1): void {
    this.emit(position, Math.ceil(2 * intensity), {
      speed: 3,
      spread: 0.3,
      direction: new THREE.Vector3(0, 0, 1),
      life: 0.3,
      scaleStart: 0.3 * intensity,
      scaleEnd: 0,
      colorStart: new THREE.Color(0.2, 0.5, 1),
      colorEnd: new THREE.Color(0.1, 0.1, 0.5),
    });
  }

  laserImpact(position: THREE.Vector3): void {
    this.emit(position, 8, {
      speed: 8,
      spread: 2,
      life: 0.2,
      scaleStart: 0.3,
      scaleEnd: 0,
      colorStart: new THREE.Color(0, 1, 0.5),
      colorEnd: new THREE.Color(0, 0.5, 0),
    });
  }

  sparkle(position: THREE.Vector3): void {
    this.emit(position, 6, {
      speed: 5,
      spread: 1.5,
      life: 0.15,
      scaleStart: 0.4,
      scaleEnd: 0,
      colorStart: new THREE.Color(1, 1, 1),
      colorEnd: new THREE.Color(0.5, 1, 0.5),
    });
  }

  update(dt: number): void {
    for (const p of this.particles) {
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      const t = 1 - p.life / p.maxLife;

      // Move
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.velocity.multiplyScalar(1 - dt * 2); // drag

      // Scale
      const s = p.scaleStart + (p.scaleEnd - p.scaleStart) * t;
      p.mesh.scale.set(s, s, s);

      // Color
      const mat = p.mesh.material as THREE.MeshBasicMaterial;
      mat.color.lerpColors(p.colorStart, p.colorEnd, t);
      mat.opacity = 1 - t * t;
    }
  }

  reset(): void {
    for (const p of this.particles) {
      p.active = false;
      p.mesh.visible = false;
    }
  }
}

// Screen shake
export class ScreenShake {
  intensity = 0;
  private decay = 5;
  private offsetX = 0;
  private offsetY = 0;

  add(amount: number): void {
    this.intensity = Math.min(this.intensity + amount, 2);
  }

  update(dt: number, camera: THREE.Camera): void {
    // Remove previous frame's shake offset
    camera.position.x -= this.offsetX;
    camera.position.y -= this.offsetY;

    if (this.intensity > 0.01) {
      this.offsetX = (Math.random() - 0.5) * this.intensity;
      this.offsetY = (Math.random() - 0.5) * this.intensity;
      camera.position.x += this.offsetX;
      camera.position.y += this.offsetY;
      this.intensity *= Math.max(0, 1 - this.decay * dt);
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
      this.intensity = 0;
    }
  }

  reset(): void {
    this.intensity = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }
}
