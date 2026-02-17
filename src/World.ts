import * as THREE from 'three';
import { EnemyManager, EnemyType } from './Enemies';
import { buildAsteroid, buildBuilding, buildRing, buildPowerUp, PowerUpType } from './Models';

// Level definitions
export interface LevelWave {
  time: number;
  enemies: Array<{
    type: EnemyType;
    x: number;
    y: number;
    behavior?: 'straight' | 'sine' | 'chase' | 'strafe' | 'boss';
  }>;
}

export interface LevelDef {
  name: string;
  subtitle: string;
  duration: number;
  environment: 'crystal_depths' | 'neon_city' | 'volcanic_core';
  waves: LevelWave[];
  hasBoss: boolean;
  fogColor: number;
  fogDensity: number;
  skyColor: number;
  groundColor: number;
  ambientIntensity: number;
  sunIntensity: number;
}

const LEVELS: LevelDef[] = [
  // Level 1: Bioluminescent alien ocean planet
  {
    name: 'PLANET AZURIS',
    subtitle: 'The Crystal Depths',
    duration: 60,
    environment: 'crystal_depths',
    waves: [
      { time: 3, enemies: [
        { type: EnemyType.FIGHTER, x: 0, y: 4, behavior: 'straight' },
        { type: EnemyType.FIGHTER, x: -5, y: 5, behavior: 'straight' },
        { type: EnemyType.FIGHTER, x: 5, y: 5, behavior: 'straight' },
      ]},
      { time: 8, enemies: [
        { type: EnemyType.FIGHTER, x: -8, y: 3, behavior: 'sine' },
        { type: EnemyType.FIGHTER, x: 8, y: 3, behavior: 'sine' },
      ]},
      { time: 14, enemies: [
        { type: EnemyType.INTERCEPTOR, x: 0, y: 6, behavior: 'chase' },
        { type: EnemyType.FIGHTER, x: -6, y: 4 },
        { type: EnemyType.FIGHTER, x: 6, y: 4 },
      ]},
      { time: 20, enemies: [
        { type: EnemyType.BOMBER, x: 0, y: 5 },
        { type: EnemyType.FIGHTER, x: -10, y: 3, behavior: 'sine' },
        { type: EnemyType.FIGHTER, x: 10, y: 3, behavior: 'sine' },
      ]},
      { time: 26, enemies: [
        { type: EnemyType.FIGHTER, x: -3, y: 3, behavior: 'straight' },
        { type: EnemyType.FIGHTER, x: 0, y: 5, behavior: 'straight' },
        { type: EnemyType.FIGHTER, x: 3, y: 3, behavior: 'straight' },
        { type: EnemyType.FIGHTER, x: -6, y: 4, behavior: 'straight' },
        { type: EnemyType.FIGHTER, x: 6, y: 4, behavior: 'straight' },
      ]},
      { time: 32, enemies: [
        { type: EnemyType.TURRET, x: -8, y: 1, behavior: 'straight' },
        { type: EnemyType.TURRET, x: 8, y: 1, behavior: 'straight' },
        { type: EnemyType.INTERCEPTOR, x: 0, y: 6, behavior: 'sine' },
      ]},
      { time: 38, enemies: [
        { type: EnemyType.BOMBER, x: -5, y: 5 },
        { type: EnemyType.BOMBER, x: 5, y: 5 },
        { type: EnemyType.FIGHTER, x: 0, y: 3, behavior: 'chase' },
      ]},
      { time: 44, enemies: [
        { type: EnemyType.INTERCEPTOR, x: -4, y: 5, behavior: 'sine' },
        { type: EnemyType.INTERCEPTOR, x: 4, y: 5, behavior: 'sine' },
        { type: EnemyType.INTERCEPTOR, x: 0, y: 3, behavior: 'chase' },
        { type: EnemyType.FIGHTER, x: -8, y: 4, behavior: 'strafe' },
        { type: EnemyType.FIGHTER, x: 8, y: 4, behavior: 'strafe' },
      ]},
      { time: 52, enemies: [
        { type: EnemyType.BOMBER, x: 0, y: 6 },
        { type: EnemyType.TURRET, x: -5, y: 2 },
        { type: EnemyType.TURRET, x: 5, y: 2 },
        { type: EnemyType.FIGHTER, x: -10, y: 5, behavior: 'sine' },
        { type: EnemyType.FIGHTER, x: 10, y: 5, behavior: 'sine' },
      ]},
    ],
    hasBoss: false,
    fogColor: 0x0a1533,
    fogDensity: 0.002,
    skyColor: 0x020818,
    groundColor: 0x0a2244,
    ambientIntensity: 0.5,
    sunIntensity: 0.7,
  },
  // Level 2: Cyberpunk neon megacity
  {
    name: 'NOVA PRIME',
    subtitle: 'Neon Megacity',
    duration: 65,
    environment: 'neon_city',
    waves: [
      { time: 3, enemies: [
        { type: EnemyType.FIGHTER, x: -6, y: 4, behavior: 'sine' },
        { type: EnemyType.FIGHTER, x: 6, y: 4, behavior: 'sine' },
      ]},
      { time: 8, enemies: [
        { type: EnemyType.INTERCEPTOR, x: 0, y: 5, behavior: 'chase' },
        { type: EnemyType.INTERCEPTOR, x: -8, y: 3, behavior: 'chase' },
        { type: EnemyType.INTERCEPTOR, x: 8, y: 3, behavior: 'chase' },
      ]},
      { time: 14, enemies: [
        { type: EnemyType.BOMBER, x: -4, y: 5 },
        { type: EnemyType.BOMBER, x: 4, y: 5 },
        { type: EnemyType.FIGHTER, x: 0, y: 3, behavior: 'straight' },
      ]},
      { time: 20, enemies: [
        { type: EnemyType.FIGHTER, x: -3, y: 2, behavior: 'strafe' },
        { type: EnemyType.FIGHTER, x: 3, y: 6, behavior: 'strafe' },
        { type: EnemyType.INTERCEPTOR, x: 0, y: 4, behavior: 'sine' },
        { type: EnemyType.INTERCEPTOR, x: -7, y: 5, behavior: 'sine' },
        { type: EnemyType.INTERCEPTOR, x: 7, y: 5, behavior: 'sine' },
      ]},
      { time: 28, enemies: [
        { type: EnemyType.TURRET, x: -6, y: 3 },
        { type: EnemyType.TURRET, x: 6, y: 3 },
        { type: EnemyType.TURRET, x: 0, y: 6 },
        { type: EnemyType.FIGHTER, x: -10, y: 4, behavior: 'sine' },
        { type: EnemyType.FIGHTER, x: 10, y: 4, behavior: 'sine' },
      ]},
      { time: 35, enemies: [
        { type: EnemyType.BOMBER, x: 0, y: 5 },
        { type: EnemyType.INTERCEPTOR, x: -5, y: 3, behavior: 'chase' },
        { type: EnemyType.INTERCEPTOR, x: 5, y: 3, behavior: 'chase' },
        { type: EnemyType.INTERCEPTOR, x: -8, y: 6, behavior: 'chase' },
        { type: EnemyType.INTERCEPTOR, x: 8, y: 6, behavior: 'chase' },
      ]},
      { time: 42, enemies: [
        { type: EnemyType.FIGHTER, x: -2, y: 3 },
        { type: EnemyType.FIGHTER, x: 2, y: 3 },
        { type: EnemyType.FIGHTER, x: -6, y: 5 },
        { type: EnemyType.FIGHTER, x: 6, y: 5 },
        { type: EnemyType.BOMBER, x: 0, y: 7 },
        { type: EnemyType.BOMBER, x: -8, y: 4 },
        { type: EnemyType.BOMBER, x: 8, y: 4 },
      ]},
      { time: 50, enemies: [
        { type: EnemyType.TURRET, x: -4, y: 2 },
        { type: EnemyType.TURRET, x: 4, y: 2 },
        { type: EnemyType.INTERCEPTOR, x: 0, y: 5, behavior: 'chase' },
        { type: EnemyType.INTERCEPTOR, x: -6, y: 4, behavior: 'sine' },
        { type: EnemyType.INTERCEPTOR, x: 6, y: 4, behavior: 'sine' },
        { type: EnemyType.BOMBER, x: 0, y: 7 },
      ]},
    ],
    hasBoss: false,
    fogColor: 0x110818,
    fogDensity: 0.002,
    skyColor: 0x08040e,
    groundColor: 0x1a1a2e,
    ambientIntensity: 0.3,
    sunIntensity: 0.4,
  },
  // Level 3: Volcanic alien core with boss
  {
    name: 'PLANET INFERNUS',
    subtitle: 'The Molten Core',
    duration: 70,
    environment: 'volcanic_core',
    waves: [
      { time: 3, enemies: [
        { type: EnemyType.FIGHTER, x: -5, y: 4, behavior: 'straight' },
        { type: EnemyType.FIGHTER, x: 0, y: 3, behavior: 'straight' },
        { type: EnemyType.FIGHTER, x: 5, y: 4, behavior: 'straight' },
        { type: EnemyType.INTERCEPTOR, x: -8, y: 6, behavior: 'sine' },
        { type: EnemyType.INTERCEPTOR, x: 8, y: 6, behavior: 'sine' },
      ]},
      { time: 10, enemies: [
        { type: EnemyType.BOMBER, x: -4, y: 5 },
        { type: EnemyType.BOMBER, x: 4, y: 5 },
        { type: EnemyType.TURRET, x: 0, y: 2 },
        { type: EnemyType.INTERCEPTOR, x: -10, y: 4, behavior: 'chase' },
        { type: EnemyType.INTERCEPTOR, x: 10, y: 4, behavior: 'chase' },
      ]},
      { time: 18, enemies: [
        { type: EnemyType.INTERCEPTOR, x: -3, y: 3, behavior: 'chase' },
        { type: EnemyType.INTERCEPTOR, x: 3, y: 3, behavior: 'chase' },
        { type: EnemyType.INTERCEPTOR, x: -6, y: 6, behavior: 'chase' },
        { type: EnemyType.INTERCEPTOR, x: 6, y: 6, behavior: 'chase' },
        { type: EnemyType.BOMBER, x: 0, y: 4 },
      ]},
      { time: 26, enemies: [
        { type: EnemyType.TURRET, x: -8, y: 2 },
        { type: EnemyType.TURRET, x: 8, y: 2 },
        { type: EnemyType.TURRET, x: -4, y: 6 },
        { type: EnemyType.TURRET, x: 4, y: 6 },
        { type: EnemyType.BOMBER, x: 0, y: 4 },
        { type: EnemyType.FIGHTER, x: -10, y: 5, behavior: 'strafe' },
        { type: EnemyType.FIGHTER, x: 10, y: 5, behavior: 'strafe' },
      ]},
      { time: 34, enemies: [
        { type: EnemyType.FIGHTER, x: -2, y: 3, behavior: 'sine' },
        { type: EnemyType.FIGHTER, x: 2, y: 5, behavior: 'sine' },
        { type: EnemyType.FIGHTER, x: -6, y: 4, behavior: 'sine' },
        { type: EnemyType.FIGHTER, x: 6, y: 4, behavior: 'sine' },
        { type: EnemyType.BOMBER, x: -8, y: 6 },
        { type: EnemyType.BOMBER, x: 8, y: 6 },
        { type: EnemyType.INTERCEPTOR, x: 0, y: 3, behavior: 'chase' },
      ]},
      { time: 42, enemies: [
        { type: EnemyType.BOMBER, x: -3, y: 5 },
        { type: EnemyType.BOMBER, x: 3, y: 5 },
        { type: EnemyType.BOMBER, x: 0, y: 7 },
        { type: EnemyType.TURRET, x: -10, y: 2 },
        { type: EnemyType.TURRET, x: 10, y: 2 },
        { type: EnemyType.INTERCEPTOR, x: -6, y: 4, behavior: 'chase' },
        { type: EnemyType.INTERCEPTOR, x: 6, y: 4, behavior: 'chase' },
      ]},
      // Boss wave
      { time: 55, enemies: [
        { type: EnemyType.BOSS, x: 0, y: 5, behavior: 'boss' },
      ]},
    ],
    hasBoss: true,
    fogColor: 0x1a0808,
    fogDensity: 0.0015,
    skyColor: 0x0c0303,
    groundColor: 0x221100,
    ambientIntensity: 0.4,
    sunIntensity: 0.9,
  },
];

// Environment management
interface EnvironmentObject {
  mesh: THREE.Object3D;
  speed: number;
  rotationSpeed: THREE.Vector3;
}

export interface PowerUp {
  mesh: THREE.Group;
  type: PowerUpType;
  position: THREE.Vector3;
  age: number;
  active: boolean;
}

const POWERUP_DESPAWN_TIME = 10;
const POWERUP_BOB_SPEED = 3;
const POWERUP_BOB_AMPLITUDE = 0.3;
const POWERUP_ROTATE_SPEED = 2;

export class World {
  group: THREE.Group;
  private ground: THREE.Mesh | null = null;
  private ground2: THREE.Mesh | null = null;
  private groundGroup: THREE.Group;
  private envObjects: EnvironmentObject[] = [];
  private starField: THREE.Points | null = null;
  private spawnTimer = 0;
  private envSpawnInterval = 0.3;
  private powerUps: PowerUp[] = [];

  currentLevel = 0;
  levelTimer = 0;
  private waveIndex = 0;
  private bossSpawned = false;
  bossDefeated = false;
  levelComplete = false;
  allLevelsComplete = false;

  private scrollSpeed = 40;
  private groundLength = 800;

  constructor() {
    this.group = new THREE.Group();
    this.groundGroup = new THREE.Group();
    this.group.add(this.groundGroup);
  }

  get levelDef(): LevelDef {
    return LEVELS[this.currentLevel];
  }

  get totalLevels(): number {
    return LEVELS.length;
  }

  setupLevel(scene: THREE.Scene): void {
    this.clearEnvironment();
    const level = this.levelDef;

    // Fog
    scene.fog = new THREE.FogExp2(level.fogColor, level.fogDensity);
    scene.background = new THREE.Color(level.skyColor);

    // All levels get ground tiles
    const groundMat = this.createGroundMaterial(level);
    this.ground = this.createGroundTile(level, groundMat);
    this.ground.position.set(0, -2, -this.groundLength / 2);
    this.groundGroup.add(this.ground);

    this.ground2 = this.createGroundTile(level, groundMat);
    this.ground2.position.set(0, -2, -this.groundLength / 2 - this.groundLength);
    this.groundGroup.add(this.ground2);

    // Starfield (always, for all levels)
    this.createStarfield(scene);

    // Environment-specific setup
    switch (level.environment) {
      case 'crystal_depths':
        this.setupCrystalDepths();
        break;
      case 'neon_city':
        this.setupNeonCity();
        break;
      case 'volcanic_core':
        this.setupVolcanicCore();
        break;
    }
  }

  private createGroundMaterial(level: LevelDef): THREE.MeshStandardMaterial {
    switch (level.environment) {
      case 'crystal_depths':
        return new THREE.MeshStandardMaterial({
          color: 0x0e2a55,
          metalness: 0.4,
          roughness: 0.5,
          flatShading: true,
          emissive: 0x061833,
          emissiveIntensity: 0.5,
        });
      case 'neon_city':
        return new THREE.MeshStandardMaterial({
          color: 0x1a1a2e,
          metalness: 0.8,
          roughness: 0.2,
          flatShading: false,
          emissive: 0x0a0a15,
          emissiveIntensity: 0.2,
        });
      case 'volcanic_core':
        return new THREE.MeshStandardMaterial({
          color: 0x2a1508,
          metalness: 0.3,
          roughness: 0.8,
          flatShading: true,
          emissive: 0x1a0a00,
          emissiveIntensity: 0.4,
        });
    }
  }

  private setupCrystalDepths(): void {
    // Deep ocean water plane below terrain
    const waterGeo = new THREE.PlaneGeometry(600, 1200);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0044aa,
      metalness: 0.95,
      roughness: 0.05,
      transparent: true,
      opacity: 0.8,
      emissive: 0x001144,
      emissiveIntensity: 0.3,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -6, -300);
    this.groundGroup.add(water);

    // Floating bioluminescent particles (like plankton)
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 30 + 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      // Cyan/teal/purple bioluminescent colors
      const hue = 0.5 + Math.random() * 0.25;
      const c = new THREE.Color().setHSL(hue, 0.8, 0.6);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(pGeo, pMat);
    this.group.add(particles);
    this.envObjects.push({
      mesh: particles,
      speed: 2,
      rotationSpeed: new THREE.Vector3(0, 0, 0),
    });

    // Giant glowing jellyfish-like structures in the distance
    for (let i = 0; i < 4; i++) {
      const jellyGroup = new THREE.Group();
      const domeMat = new THREE.MeshStandardMaterial({
        color: 0x6622cc,
        emissive: 0x4411aa,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      });
      const dome = new THREE.Mesh(new THREE.SphereGeometry(8 + Math.random() * 6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
      jellyGroup.add(dome);

      // Tentacles
      const tentMat = new THREE.MeshStandardMaterial({
        color: 0x8844ff,
        emissive: 0x6622dd,
        emissiveIntensity: 1.0,
        transparent: true,
        opacity: 0.3,
      });
      for (let t = 0; t < 5; t++) {
        const tent = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.05, 15 + Math.random() * 10, 4), tentMat);
        tent.position.set((Math.random() - 0.5) * 6, -8 - Math.random() * 5, (Math.random() - 0.5) * 6);
        jellyGroup.add(tent);
      }

      // Glow light
      const light = new THREE.PointLight(0x6622cc, 3, 30);
      light.position.y = 2;
      jellyGroup.add(light);

      jellyGroup.position.set(
        (Math.random() - 0.5) * 80,
        15 + Math.random() * 15,
        -150 - Math.random() * 200
      );
      this.group.add(jellyGroup);
      this.envObjects.push({
        mesh: jellyGroup,
        speed: 3 + Math.random() * 3,
        rotationSpeed: new THREE.Vector3(0, 0.1, 0),
      });
    }
  }

  private setupNeonCity(): void {
    // Rain/particle effect - falling light streaks
    const rainCount = 800;
    const positions = new Float32Array(rainCount * 3);
    const colors = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = Math.random() * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
      colors[i * 3] = 0.3;
      colors[i * 3 + 1] = 0.3;
      colors[i * 3 + 2] = 0.5;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    rainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const rainMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
    });
    const rain = new THREE.Points(rainGeo, rainMat);
    this.group.add(rain);
    this.envObjects.push({
      mesh: rain,
      speed: 3,
      rotationSpeed: new THREE.Vector3(0, 0, 0),
    });

    // Neon fog/haze layers
    for (let i = 0; i < 6; i++) {
      const hazeGeo = new THREE.PlaneGeometry(120, 40);
      const hazeColors = [0xff00ff, 0x00ffff, 0xff0088, 0x0088ff, 0xff4400, 0x00ff88];
      const hazeMat = new THREE.MeshBasicMaterial({
        color: hazeColors[i % hazeColors.length],
        transparent: true,
        opacity: 0.03 + Math.random() * 0.02,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const haze = new THREE.Mesh(hazeGeo, hazeMat);
      haze.position.set(
        (Math.random() - 0.5) * 100,
        5 + Math.random() * 20,
        -80 - Math.random() * 200
      );
      haze.rotation.set(Math.random() * 0.3, Math.random() * Math.PI, 0);
      this.group.add(haze);
      this.envObjects.push({
        mesh: haze,
        speed: 6 + Math.random() * 4,
        rotationSpeed: new THREE.Vector3(0, 0, 0),
      });
    }
  }

  private setupVolcanicCore(): void {
    // Lava ocean below
    const lavaGeo = new THREE.PlaneGeometry(600, 1200);
    const lavaMat = new THREE.MeshStandardMaterial({
      color: 0xff4400,
      emissive: 0xff2200,
      emissiveIntensity: 0.8,
      metalness: 0.3,
      roughness: 0.7,
    });
    const lava = new THREE.Mesh(lavaGeo, lavaMat);
    lava.rotation.x = -Math.PI / 2;
    lava.position.set(0, -8, -300);
    this.groundGroup.add(lava);

    // Lava glow light from below
    const lavaLight = new THREE.PointLight(0xff4400, 3, 100);
    lavaLight.position.set(0, -5, -50);
    this.group.add(lavaLight);
    this.envObjects.push({
      mesh: lavaLight as any,
      speed: 0,
      rotationSpeed: new THREE.Vector3(0, 0, 0),
    });

    // Smoke/ash clouds with red glow
    for (let i = 0; i < 12; i++) {
      const cloudGeo = new THREE.PlaneGeometry(80 + Math.random() * 60, 30 + Math.random() * 20);
      const cloudMat = new THREE.MeshBasicMaterial({
        color: i < 6 ? 0x331111 : 0x441a0a,
        transparent: true,
        opacity: 0.04 + Math.random() * 0.06,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.set(
        (Math.random() - 0.5) * 150,
        20 + Math.random() * 30,
        -100 - Math.random() * 200
      );
      cloud.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, 0);
      this.group.add(cloud);
      this.envObjects.push({
        mesh: cloud,
        speed: 8 + Math.random() * 6,
        rotationSpeed: new THREE.Vector3(0, 0.05, 0),
      });
    }

    // Floating embers/sparks
    const emberCount = 300;
    const positions = new Float32Array(emberCount * 3);
    const colors = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 40 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness * 0.3;
      colors[i * 3 + 2] = 0;
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    emberGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const emberMat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    this.group.add(embers);
    this.envObjects.push({
      mesh: embers,
      speed: 4,
      rotationSpeed: new THREE.Vector3(0, 0, 0),
    });
  }

  private createGroundTile(level: LevelDef, groundMat: THREE.MeshStandardMaterial): THREE.Mesh {
    const groundGeo = new THREE.PlaneGeometry(400, this.groundLength, 80, 160);
    const pos = groundGeo.getAttribute('position') as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      let height = 0;

      switch (level.environment) {
        case 'crystal_depths':
          // Jagged underwater canyon terrain
          height += Math.sin(x * 0.08) * Math.cos(z * 0.06) * 8;
          height += Math.sin(x * 0.15 + z * 0.12) * 4;
          height += Math.cos(x * 0.03 - z * 0.04) * 6;
          // Sharp crystal spikes
          if (Math.sin(x * 0.5) * Math.cos(z * 0.5) > 0.8) {
            height += 12;
          }
          break;
        case 'neon_city':
          // Flat city floor with slight grid-like texture
          height = -3;
          // Occasional raised blocks (city blocks)
          if (Math.abs(x) > 15 && Math.sin(z * 0.2) > 0.6) {
            height = -1;
          }
          break;
        case 'volcanic_core':
          // Rough volcanic terrain with cracks
          height += Math.sin(x * 0.1) * Math.cos(z * 0.07) * 5;
          height += Math.sin(x * 0.2 + z * 0.15) * 3;
          // Sharp ridges
          height += Math.abs(Math.sin(x * 0.05) * Math.cos(z * 0.08)) * 8;
          break;
      }
      pos.setY(i, height);
    }
    groundGeo.computeVertexNormals();
    const mesh = new THREE.Mesh(groundGeo, groundMat);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  private createStarfield(scene: THREE.Scene): void {
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 500;
      positions[i * 3 + 1] = Math.random() * 200 + 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 600;
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness;
      colors[i * 3 + 2] = brightness + Math.random() * 0.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    this.starField = new THREE.Points(geo, mat);
    this.group.add(this.starField);
  }

  private disposeObject(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      }
      if ((child as THREE.Points).isPoints) {
        const points = child as THREE.Points;
        points.geometry?.dispose();
        if (points.material) {
          (points.material as THREE.Material).dispose();
        }
      }
      if ((child as THREE.Light).isLight) {
        const light = child as THREE.Light;
        if ((light as THREE.PointLight).shadow) {
          (light as THREE.PointLight).shadow.map?.dispose();
        }
        light.dispose();
      }
    });
  }

  private clearEnvironment(): void {
    // Remove env objects
    for (const obj of this.envObjects) {
      this.group.remove(obj.mesh);
      this.disposeObject(obj.mesh);
    }
    this.envObjects = [];

    // Remove power-ups
    this.clearPowerUps();

    // Remove ground tiles
    if (this.ground) {
      this.groundGroup.remove(this.ground);
      this.ground.geometry.dispose();
      this.ground = null;
    }
    if (this.ground2) {
      this.groundGroup.remove(this.ground2);
      this.ground2.geometry.dispose();
      this.ground2 = null;
    }

    // Remove starfield
    if (this.starField) {
      this.group.remove(this.starField);
      this.starField = null;
    }
  }

  update(dt: number, enemies: EnemyManager): void {
    const level = this.levelDef;
    this.levelTimer += dt;

    // Scroll ground tiles
    if (this.ground) {
      this.ground.position.z += this.scrollSpeed * dt;
      if (this.ground.position.z > this.groundLength / 2) {
        this.ground.position.z -= this.groundLength * 2;
      }
    }
    if (this.ground2) {
      this.ground2.position.z += this.scrollSpeed * dt;
      if (this.ground2.position.z > this.groundLength / 2) {
        this.ground2.position.z -= this.groundLength * 2;
      }
    }

    // Scroll environment objects
    for (let i = this.envObjects.length - 1; i >= 0; i--) {
      const obj = this.envObjects[i];
      obj.mesh.position.z += obj.speed * dt;
      obj.mesh.rotation.x += obj.rotationSpeed.x * dt;
      obj.mesh.rotation.y += obj.rotationSpeed.y * dt;
      obj.mesh.rotation.z += obj.rotationSpeed.z * dt;

      if (obj.mesh.position.z > 40) {
        this.group.remove(obj.mesh);
        this.disposeObject(obj.mesh);
        this.envObjects.splice(i, 1);
      }
    }

    // Spawn environment objects
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.envSpawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnvironmentObject();
    }

    // Spawn enemy waves
    while (this.waveIndex < level.waves.length && this.levelTimer >= level.waves[this.waveIndex].time) {
      const wave = level.waves[this.waveIndex];
      for (const enemyDef of wave.enemies) {
        const z = -80 - Math.random() * 30;
        enemies.spawn(enemyDef.type, enemyDef.x, enemyDef.y, z, enemyDef.behavior as any);
      }
      this.waveIndex++;
    }

    // Update power-ups
    this.updatePowerUps(dt);

    // Check level completion
    if (!this.levelComplete) {
      if (level.hasBoss) {
        if (this.bossDefeated) {
          this.levelComplete = true;
        }
      } else if (this.levelTimer >= level.duration && enemies.getActive().length === 0) {
        this.levelComplete = true;
      }
    }
  }

  private spawnEnvironmentObject(): void {
    const level = this.levelDef;
    const z = -150 - Math.random() * 50;

    switch (level.environment) {
      case 'crystal_depths': {
        // Giant crystals
        if (Math.random() < 0.35) {
          const crystalGroup = new THREE.Group();
          const hue = 0.5 + Math.random() * 0.3; // Cyan to purple
          const crystalColor = new THREE.Color().setHSL(hue, 0.8, 0.4);
          const emissiveColor = new THREE.Color().setHSL(hue, 0.9, 0.3);
          const crystalMat = new THREE.MeshStandardMaterial({
            color: crystalColor,
            emissive: emissiveColor,
            emissiveIntensity: 1.0,
            metalness: 0.5,
            roughness: 0.15,
            transparent: true,
            opacity: 0.85,
          });
          const height = 4 + Math.random() * 12;
          const crystal = new THREE.Mesh(
            new THREE.ConeGeometry(0.8 + Math.random() * 1.5, height, 5),
            crystalMat
          );
          crystal.rotation.x = (Math.random() - 0.5) * 0.5;
          crystal.rotation.z = (Math.random() - 0.5) * 0.5;
          crystalGroup.add(crystal);

          // Small secondary crystals
          for (let c = 0; c < 2 + Math.floor(Math.random() * 3); c++) {
            const smallH = 2 + Math.random() * 4;
            const small = new THREE.Mesh(
              new THREE.ConeGeometry(0.3 + Math.random() * 0.5, smallH, 5),
              crystalMat
            );
            small.position.set(
              (Math.random() - 0.5) * 3,
              Math.random() * 2,
              (Math.random() - 0.5) * 3
            );
            small.rotation.set(
              (Math.random() - 0.5) * 0.8,
              Math.random() * Math.PI,
              (Math.random() - 0.5) * 0.8
            );
            crystalGroup.add(small);
          }

          // Glow
          const light = new THREE.PointLight(crystalColor.getHex(), 2, 15);
          light.position.y = height / 2;
          crystalGroup.add(light);

          const side = Math.random() < 0.5 ? -1 : 1;
          crystalGroup.position.set(
            side * (10 + Math.random() * 25),
            -2 + Math.random() * 3,
            z
          );
          this.group.add(crystalGroup);
          this.envObjects.push({
            mesh: crystalGroup,
            speed: this.scrollSpeed,
            rotationSpeed: new THREE.Vector3(0, 0, 0),
          });
        }

        // Coral-like branching structures
        if (Math.random() < 0.2) {
          const coralGroup = new THREE.Group();
          const coralColor = Math.random() < 0.5 ? 0xff4488 : 0x44ffaa;
          const coralMat = new THREE.MeshStandardMaterial({
            color: coralColor,
            emissive: coralColor,
            emissiveIntensity: 0.7,
            roughness: 0.6,
          });
          // Main stalk
          const stalk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.6, 6, 6),
            coralMat
          );
          stalk.position.y = 3;
          coralGroup.add(stalk);
          // Branches
          for (let b = 0; b < 4; b++) {
            const branch = new THREE.Mesh(
              new THREE.CylinderGeometry(0.1, 0.25, 3, 5),
              coralMat
            );
            const angle = (b / 4) * Math.PI * 2;
            branch.position.set(Math.cos(angle) * 1.5, 4 + Math.random() * 2, Math.sin(angle) * 1.5);
            branch.rotation.set(Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5);
            coralGroup.add(branch);
          }

          const side = Math.random() < 0.5 ? -1 : 1;
          coralGroup.position.set(side * (12 + Math.random() * 20), -2, z);
          this.group.add(coralGroup);
          this.envObjects.push({
            mesh: coralGroup,
            speed: this.scrollSpeed,
            rotationSpeed: new THREE.Vector3(0, 0, 0),
          });
        }

        // Floating bubble clusters
        if (Math.random() < 0.15) {
          const bubbleGroup = new THREE.Group();
          const bubbleMat = new THREE.MeshStandardMaterial({
            color: 0x88ddff,
            emissive: 0x44aadd,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.25,
            metalness: 0.1,
            roughness: 0.0,
          });
          for (let b = 0; b < 5 + Math.floor(Math.random() * 8); b++) {
            const size = 0.3 + Math.random() * 1.2;
            const bubble = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 8), bubbleMat);
            bubble.position.set(
              (Math.random() - 0.5) * 6,
              (Math.random() - 0.5) * 6,
              (Math.random() - 0.5) * 4
            );
            bubbleGroup.add(bubble);
          }
          bubbleGroup.position.set(
            (Math.random() - 0.5) * 30,
            5 + Math.random() * 10,
            z
          );
          this.group.add(bubbleGroup);
          this.envObjects.push({
            mesh: bubbleGroup,
            speed: this.scrollSpeed * 0.8,
            rotationSpeed: new THREE.Vector3(0, 0.2, 0),
          });
        }
        break;
      }
      case 'neon_city': {
        // Neon skyscrapers
        if (Math.random() < 0.45) {
          const bw = 3 + Math.random() * 5;
          const bh = 10 + Math.random() * 30;
          const bd = 3 + Math.random() * 5;
          const building = buildBuilding(bw, bh, bd);
          // Neon accent strips
          const neonColors = [0xff00ff, 0x00ffff, 0xff0088, 0x00ff88, 0xffaa00];
          const neonColor = neonColors[Math.floor(Math.random() * neonColors.length)];
          const neonMat = new THREE.MeshStandardMaterial({
            color: neonColor,
            emissive: neonColor,
            emissiveIntensity: 1.5,
          });
          // Horizontal neon strip
          const stripH = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.2, 0.15, bd + 0.2), neonMat);
          stripH.position.y = bh * 0.3 - bh / 2;
          building.add(stripH);
          const stripH2 = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.2, 0.15, bd + 0.2), neonMat);
          stripH2.position.y = bh * 0.7 - bh / 2;
          building.add(stripH2);
          // Neon light
          const nLight = new THREE.PointLight(neonColor, 1, 15);
          nLight.position.y = bh / 2;
          building.add(nLight);

          const side = Math.random() < 0.5 ? -1 : 1;
          building.position.set(
            side * (12 + Math.random() * 18),
            -2 + bh / 2,
            z
          );
          this.group.add(building);
          this.envObjects.push({
            mesh: building,
            speed: this.scrollSpeed,
            rotationSpeed: new THREE.Vector3(0, 0, 0),
          });
        }

        // Holographic billboards
        if (Math.random() < 0.1) {
          const adGroup = new THREE.Group();
          const adColors = [0xff00ff, 0x00ffff, 0xff8800, 0x00ff44];
          const adColor = adColors[Math.floor(Math.random() * adColors.length)];
          const adMat = new THREE.MeshBasicMaterial({
            color: adColor,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
          });
          const billboard = new THREE.Mesh(
            new THREE.PlaneGeometry(8 + Math.random() * 6, 4 + Math.random() * 3),
            adMat
          );
          adGroup.add(billboard);
          // Frame
          const frameMat = new THREE.MeshStandardMaterial({
            color: 0x333344,
            metalness: 0.9,
            roughness: 0.1,
          });
          const frame = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 5 + Math.random() * 3, 0.3),
            frameMat
          );
          frame.position.y = -4;
          adGroup.add(frame);
          // Glow
          const adLight = new THREE.PointLight(adColor, 1.5, 12);
          adGroup.add(adLight);

          const side = Math.random() < 0.5 ? -1 : 1;
          adGroup.position.set(
            side * (8 + Math.random() * 12),
            8 + Math.random() * 8,
            z
          );
          this.group.add(adGroup);
          this.envObjects.push({
            mesh: adGroup,
            speed: this.scrollSpeed,
            rotationSpeed: new THREE.Vector3(0, 0, 0),
          });
        }

        // Flying traffic (light streaks)
        if (Math.random() < 0.15) {
          const trafficGroup = new THREE.Group();
          const tColor = Math.random() < 0.5 ? 0xff4400 : 0xffaa00;
          const tMat = new THREE.MeshStandardMaterial({
            color: tColor,
            emissive: tColor,
            emissiveIntensity: 2.0,
          });
          const car = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 1.5), tMat);
          trafficGroup.add(car);
          const tLight = new THREE.PointLight(tColor, 0.5, 5);
          trafficGroup.add(tLight);

          trafficGroup.position.set(
            (Math.random() - 0.5) * 20,
            3 + Math.random() * 10,
            z
          );
          this.group.add(trafficGroup);
          this.envObjects.push({
            mesh: trafficGroup,
            speed: this.scrollSpeed * (0.7 + Math.random() * 0.6),
            rotationSpeed: new THREE.Vector3(0, 0, 0),
          });
        }

        // Overhead bridges/walkways
        if (Math.random() < 0.08) {
          const bridge = new THREE.Mesh(
            new THREE.BoxGeometry(30 + Math.random() * 10, 0.5, 3),
            new THREE.MeshStandardMaterial({
              color: 0x333344,
              metalness: 0.8,
              roughness: 0.2,
              emissive: 0x111122,
              emissiveIntensity: 0.1,
            })
          );
          bridge.position.set(0, 14 + Math.random() * 6, z);
          this.group.add(bridge);
          this.envObjects.push({
            mesh: bridge,
            speed: this.scrollSpeed,
            rotationSpeed: new THREE.Vector3(0, 0, 0),
          });
        }
        break;
      }
      case 'volcanic_core': {
        // Obsidian rock pillars
        if (Math.random() < 0.3) {
          const pillarGroup = new THREE.Group();
          const rockMat = new THREE.MeshStandardMaterial({
            color: 0x2a1810,
            roughness: 0.8,
            metalness: 0.2,
            flatShading: true,
            emissive: 0x110500,
            emissiveIntensity: 0.3,
          });
          const height = 5 + Math.random() * 15;
          const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(1 + Math.random() * 2, 2 + Math.random() * 3, height, 6),
            rockMat
          );
          pillar.position.y = height / 2;
          pillarGroup.add(pillar);

          // Lava veins (emissive strips)
          const veinMat = new THREE.MeshStandardMaterial({
            color: 0xff4400,
            emissive: 0xff2200,
            emissiveIntensity: 2.0,
          });
          for (let v = 0; v < 3; v++) {
            const vein = new THREE.Mesh(
              new THREE.BoxGeometry(0.3, height * 0.7, 0.3),
              veinMat
            );
            vein.position.set(
              (Math.random() - 0.5) * 2,
              height * 0.3 + Math.random() * height * 0.3,
              (Math.random() - 0.5) * 2
            );
            vein.rotation.z = (Math.random() - 0.5) * 0.5;
            pillarGroup.add(vein);
          }

          const side = Math.random() < 0.5 ? -1 : 1;
          pillarGroup.position.set(side * (10 + Math.random() * 25), -2, z);
          this.group.add(pillarGroup);
          this.envObjects.push({
            mesh: pillarGroup,
            speed: this.scrollSpeed,
            rotationSpeed: new THREE.Vector3(0, 0, 0),
          });
        }

        // Floating lava rocks (like asteroids but volcanic)
        if (Math.random() < 0.25) {
          const size = 1 + Math.random() * 3;
          const rock = buildAsteroid(size);
          (rock.material as THREE.MeshStandardMaterial).color.set(0x2a1508);
          (rock.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x441100);
          (rock.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;

          rock.position.set(
            (Math.random() - 0.5) * 40,
            3 + Math.random() * 12,
            z
          );
          this.group.add(rock);
          this.envObjects.push({
            mesh: rock,
            speed: this.scrollSpeed + Math.random() * 8 - 4,
            rotationSpeed: new THREE.Vector3(
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3
            ),
          });
        }

        // Lava geysers (vertical light columns)
        if (Math.random() < 0.05) {
          const geyserGroup = new THREE.Group();
          const geyserMat = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff4400,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.4,
          });
          const height = 15 + Math.random() * 20;
          const geyser = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 1.5, height, 8),
            geyserMat
          );
          geyser.position.y = height / 2 - 5;
          geyserGroup.add(geyser);

          const gLight = new THREE.PointLight(0xff4400, 3, 20);
          gLight.position.y = height / 2;
          geyserGroup.add(gLight);

          geyserGroup.position.set(
            (Math.random() - 0.5) * 40,
            0,
            z
          );
          this.group.add(geyserGroup);
          this.envObjects.push({
            mesh: geyserGroup,
            speed: this.scrollSpeed,
            rotationSpeed: new THREE.Vector3(0, 0, 0),
          });
        }
        break;
      }
    }

    // Occasional health ring
    if (Math.random() < 0.02) {
      const ring = buildRing();
      ring.position.set(
        (Math.random() - 0.5) * 20,
        2 + Math.random() * 6,
        z
      );
      (ring as any).isRing = true;
      this.group.add(ring);
      this.envObjects.push({
        mesh: ring,
        speed: this.scrollSpeed,
        rotationSpeed: new THREE.Vector3(0, 2, 0),
      });
    }
  }

  nextLevel(): boolean {
    this.currentLevel++;
    if (this.currentLevel >= LEVELS.length) {
      this.allLevelsComplete = true;
      return false;
    }
    this.levelTimer = 0;
    this.waveIndex = 0;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.levelComplete = false;
    return true;
  }

  reset(): void {
    this.currentLevel = 0;
    this.levelTimer = 0;
    this.waveIndex = 0;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.levelComplete = false;
    this.allLevelsComplete = false;
    this.clearEnvironment();
    this.clearPowerUps();
  }

  // --- Power-Up System ---

  spawnPowerUp(position: THREE.Vector3, type: PowerUpType): void {
    const mesh = buildPowerUp(type);
    mesh.position.copy(position);
    this.group.add(mesh);
    this.powerUps.push({
      mesh,
      type,
      position: position.clone(),
      age: 0,
      active: true,
    });
  }

  updatePowerUps(dt: number): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pu = this.powerUps[i];
      if (!pu.active) continue;

      pu.age += dt;

      // Despawn after timeout or if past player
      if (pu.age >= POWERUP_DESPAWN_TIME || pu.mesh.position.z > 30) {
        this.removePowerUp(pu);
        continue;
      }

      // Scroll toward player (same as environment)
      pu.position.z += this.scrollSpeed * dt;
      pu.mesh.position.z = pu.position.z;

      // Bobbing motion (vertical oscillation around spawn position)
      const bobOffset = Math.sin(pu.age * POWERUP_BOB_SPEED) * POWERUP_BOB_AMPLITUDE;
      pu.mesh.position.y = pu.position.y + bobOffset;

      // Rotation
      pu.mesh.rotation.y += POWERUP_ROTATE_SPEED * dt;

      // Fade out in last 2 seconds (blink effect)
      if (pu.age > POWERUP_DESPAWN_TIME - 2) {
        pu.mesh.visible = Math.sin(pu.age * 15) > 0;
      }
    }
  }

  getActivePowerUps(): PowerUp[] {
    return this.powerUps.filter(pu => pu.active);
  }

  removePowerUp(powerUp: PowerUp): void {
    const idx = this.powerUps.indexOf(powerUp);
    if (idx >= 0) {
      powerUp.active = false;
      this.group.remove(powerUp.mesh);
      this.disposeObject(powerUp.mesh);
      this.powerUps.splice(idx, 1);
    }
  }

  private clearPowerUps(): void {
    for (const pu of this.powerUps) {
      this.group.remove(pu.mesh);
      this.disposeObject(pu.mesh);
    }
    this.powerUps = [];
  }

  getRingObjects(): EnvironmentObject[] {
    return this.envObjects.filter(o => (o.mesh as any).isRing);
  }

  removeEnvObject(obj: EnvironmentObject): void {
    const idx = this.envObjects.indexOf(obj);
    if (idx >= 0) {
      this.group.remove(obj.mesh);
      this.envObjects.splice(idx, 1);
    }
  }
}
