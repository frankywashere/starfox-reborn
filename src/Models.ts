import * as THREE from 'three';

export function buildArwing(): THREE.Group {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xccccdd,
    metalness: 0.7,
    roughness: 0.3,
  });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x8888aa,
    metalness: 0.6,
    roughness: 0.4,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x2244ff,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x112288,
    emissiveIntensity: 0.3,
  });
  const cockpitMat = new THREE.MeshStandardMaterial({
    color: 0x44ddff,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x22aaff,
    emissiveIntensity: 1.0,
  });
  const engineMat = new THREE.MeshStandardMaterial({
    color: 0xff4400,
    emissive: 0xff2200,
    emissiveIntensity: 1.0,
  });

  // Fuselage - elongated shape
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.5, 8), bodyMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = -2.5;
  group.add(nose);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 3, 8), bodyMat);
  body.rotation.x = Math.PI / 2;
  body.position.z = -0.5;
  group.add(body);

  const rear = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 1.5, 8), bodyMat);
  rear.rotation.x = Math.PI / 2;
  rear.position.z = 1.0;
  group.add(rear);

  // Cockpit canopy
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), cockpitMat);
  cockpit.position.set(0, 0.35, -1.5);
  group.add(cockpit);

  // Cockpit interior glow light
  const cockpitLight = new THREE.PointLight(0x44ddff, 1.5, 5);
  cockpitLight.position.set(0, 0.4, -1.5);
  group.add(cockpitLight);

  // Wings - using box geometry angled
  const wingShape = new THREE.BoxGeometry(5, 0.08, 1.8);
  const leftWing = new THREE.Mesh(wingShape, wingMat);
  leftWing.position.set(-2.8, 0, 0.2);
  leftWing.rotation.z = -0.05;
  leftWing.rotation.y = 0.15;
  group.add(leftWing);

  const rightWing = new THREE.Mesh(wingShape, wingMat);
  rightWing.position.set(2.8, 0, 0.2);
  rightWing.rotation.z = 0.05;
  rightWing.rotation.y = -0.15;
  group.add(rightWing);

  // Wing stripes
  const stripeGeo = new THREE.BoxGeometry(4.8, 0.1, 0.3);
  const leftStripe = new THREE.Mesh(stripeGeo, accentMat);
  leftStripe.position.set(-2.8, 0.06, 0.2);
  group.add(leftStripe);

  const rightStripe = new THREE.Mesh(stripeGeo, accentMat);
  rightStripe.position.set(2.8, 0.06, 0.2);
  group.add(rightStripe);

  // Wing tips / fins
  const finGeo = new THREE.BoxGeometry(0.15, 0.8, 0.6);
  const leftFin = new THREE.Mesh(finGeo, accentMat);
  leftFin.position.set(-5.2, 0.4, 0.3);
  group.add(leftFin);

  const rightFin = new THREE.Mesh(finGeo, accentMat);
  rightFin.position.set(5.2, 0.4, 0.3);
  group.add(rightFin);

  // Wing tip point lights (blue)
  const leftWingTipLight = new THREE.PointLight(0x2244ff, 1.5, 4);
  leftWingTipLight.position.set(-5.2, 0.4, 0.3);
  group.add(leftWingTipLight);

  const rightWingTipLight = new THREE.PointLight(0x2244ff, 1.5, 4);
  rightWingTipLight.position.set(5.2, 0.4, 0.3);
  group.add(rightWingTipLight);

  // Tail fin
  const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 1.0), accentMat);
  tailFin.position.set(0, 0.7, 1.2);
  group.add(tailFin);

  // Engine nacelles on wings
  const engineGeo = new THREE.CylinderGeometry(0.25, 0.3, 1.2, 8);
  const leftEngine = new THREE.Mesh(engineGeo, bodyMat);
  leftEngine.rotation.x = Math.PI / 2;
  leftEngine.position.set(-3.5, -0.1, 0.8);
  group.add(leftEngine);

  const rightEngine = new THREE.Mesh(engineGeo, bodyMat);
  rightEngine.rotation.x = Math.PI / 2;
  rightEngine.position.set(3.5, -0.1, 0.8);
  group.add(rightEngine);

  // Engine glow
  const glowGeo = new THREE.CircleGeometry(0.25, 8);
  const leftGlow = new THREE.Mesh(glowGeo, engineMat);
  leftGlow.position.set(-3.5, -0.1, 1.4);
  group.add(leftGlow);

  const rightGlow = new THREE.Mesh(glowGeo, engineMat);
  rightGlow.position.set(3.5, -0.1, 1.4);
  group.add(rightGlow);

  // Main engine glow
  const mainGlow = new THREE.Mesh(new THREE.CircleGeometry(0.3, 8), engineMat);
  mainGlow.position.set(0, 0, 1.75);
  group.add(mainGlow);

  // Engine lights
  const engineLight = new THREE.PointLight(0xff4400, 2, 8);
  engineLight.position.set(0, 0, 2);
  group.add(engineLight);

  // Laser cannons on wings
  const cannonMat = new THREE.MeshStandardMaterial({
    color: 0x999999,
    metalness: 0.9,
    roughness: 0.1,
  });
  for (const side of [-1, 1]) {
    const cannon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.5, 6),
      cannonMat
    );
    cannon.rotation.x = Math.PI / 2;
    cannon.position.set(side * 4.0, -0.1, -0.5);
    group.add(cannon);
  }

  // Ventral fin
  const ventralFin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.8), accentMat);
  ventralFin.position.set(0, -0.5, 0.8);
  group.add(ventralFin);

  group.scale.set(0.6, 0.6, 0.6);
  return group;
}

export function buildEnemyFighter(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xaa6633,
    metalness: 0.6,
    roughness: 0.4,
    emissive: 0x331100,
    emissiveIntensity: 0.3,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xff2200,
    emissive: 0xff0000,
    emissiveIntensity: 0.3,
  });

  // Body (nose points toward +Z to face player)
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3, 6), mat);
  body.rotation.x = Math.PI / 2;
  group.add(body);

  // Wings
  const wingGeo = new THREE.BoxGeometry(3.5, 0.08, 1.2);
  const wings = new THREE.Mesh(wingGeo, mat);
  wings.position.set(0, 0, 0.3);
  group.add(wings);

  // Red accents
  const accent = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 0.2), accentMat);
  accent.position.set(0, 0.05, 0.3);
  group.add(accent);

  // Engine
  const engine = new THREE.Mesh(new THREE.CircleGeometry(0.3, 6), accentMat);
  engine.position.set(0, 0, 1.5);
  group.add(engine);

  group.scale.set(0.7, 0.7, 0.7);
  return group;
}

export function buildEnemyInterceptor(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x66aa66,
    metalness: 0.5,
    roughness: 0.5,
    emissive: 0x113311,
    emissiveIntensity: 0.3,
  });

  // Sleek body (nose toward +Z)
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.3, 4, 4), mat);
  body.rotation.x = Math.PI / 2;
  group.add(body);

  // Swept wings
  const wingGeo = new THREE.BoxGeometry(4, 0.06, 0.8);
  const wings = new THREE.Mesh(wingGeo, mat);
  wings.position.z = 0.8;
  wings.rotation.y = 0;
  group.add(wings);

  group.scale.set(0.6, 0.6, 0.6);
  return group;
}

export function buildEnemyBomber(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x7777aa,
    metalness: 0.7,
    roughness: 0.3,
    emissive: 0x111122,
    emissiveIntensity: 0.2,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xff8800,
    emissiveIntensity: 0.3,
  });

  // Large body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 3), mat);
  group.add(body);

  // Top turret
  const turret = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), accentMat);
  turret.position.set(0, 0.6, 0);
  group.add(turret);

  // Wings
  const wingGeo = new THREE.BoxGeometry(4, 0.1, 1.5);
  const wings = new THREE.Mesh(wingGeo, mat);
  wings.position.y = -0.1;
  group.add(wings);

  // Engines
  for (const x of [-1.5, 1.5]) {
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.8, 6), mat);
    engine.rotation.x = Math.PI / 2;
    engine.position.set(x, -0.2, 1.5);
    group.add(engine);
  }

  group.scale.set(0.8, 0.8, 0.8);
  return group;
}

export function buildTurret(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x666677,
    metalness: 0.8,
    roughness: 0.2,
  });
  const barrelMat = new THREE.MeshStandardMaterial({
    color: 0x444455,
    metalness: 0.9,
    roughness: 0.1,
  });

  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.5, 8), mat);
  group.add(base);

  // Dome
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 6), mat);
  dome.position.y = 0.5;
  group.add(dome);

  // Barrel
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 6), barrelMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.5, -0.75);
  group.add(barrel);

  return group;
}

export function buildBoss(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x334455,
    metalness: 0.8,
    roughness: 0.2,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xff0044,
    emissive: 0xff0022,
    emissiveIntensity: 0.5,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xff4400,
    emissive: 0xff2200,
    emissiveIntensity: 0.8,
  });

  // Main body - large angular shape
  const mainBody = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 8), mat);
  group.add(mainBody);

  // Core (weak point) - glowing sphere
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 12), coreMat);
  core.position.set(0, 0, -2);
  core.name = 'bossCore';
  group.add(core);

  // Core light
  const coreLight = new THREE.PointLight(0xff4400, 5, 15);
  coreLight.position.copy(core.position);
  group.add(coreLight);

  // Wing arms
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(8, 0.8, 3), mat);
    arm.position.set(side * 7, 0, 1);
    arm.rotation.z = side * 0.1;
    group.add(arm);

    // Weapon pods
    const pod = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), accentMat);
    pod.position.set(side * 10, 0, 0);
    group.add(pod);

    // Fin
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 2), accentMat);
    fin.position.set(side * 10, 1.5, 1);
    group.add(fin);
  }

  // Top structure
  const tower = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 3), mat);
  tower.position.set(0, 2.5, 1);
  group.add(tower);

  // Antenna
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 4), accentMat);
  antenna.position.set(0, 4.5, 1);
  group.add(antenna);

  // Front armor plates
  for (const side of [-1, 1]) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 1), mat);
    plate.position.set(side * 2.5, -0.3, -3.5);
    plate.rotation.y = side * 0.3;
    group.add(plate);
  }

  // Engine exhausts
  const exhaustMat = new THREE.MeshStandardMaterial({
    color: 0xff6600,
    emissive: 0xff4400,
    emissiveIntensity: 1.0,
  });
  for (const side of [-1, 1]) {
    const exhaust = new THREE.Mesh(new THREE.CircleGeometry(0.5, 8), exhaustMat);
    exhaust.position.set(side * 7, 0, 4);
    group.add(exhaust);

    // Exhaust lights
    const exLight = new THREE.PointLight(0xff4400, 2, 8);
    exLight.position.set(side * 7, 0, 4.5);
    group.add(exLight);
  }

  // Bottom cannons
  for (const x of [-3, 3]) {
    const cannon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 2, 6),
      new THREE.MeshStandardMaterial({ color: 0x555566, metalness: 0.9, roughness: 0.1 })
    );
    cannon.rotation.x = Math.PI / 2;
    cannon.position.set(x, -1.2, -3);
    group.add(cannon);
  }

  group.scale.set(0.5, 0.5, 0.5);
  return group;
}

export function buildPlayerLaser(): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(0.06, 0.06, 2.0, 4);
  geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x00ff44,
    emissive: 0x00ff22,
    emissiveIntensity: 2.0,
    transparent: true,
    opacity: 0.9,
  });
  return new THREE.Mesh(geo, mat);
}

export function buildEnemyLaser(): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 4);
  geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xff2200,
    emissive: 0xff1100,
    emissiveIntensity: 2.0,
    transparent: true,
    opacity: 0.9,
  });
  return new THREE.Mesh(geo, mat);
}

export function buildAsteroid(size: number): THREE.Mesh {
  const geo = new THREE.IcosahedronGeometry(size, 1);
  // Displace vertices for rocky appearance
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z);
    const noise = 1 + (Math.random() - 0.5) * 0.4;
    pos.setXYZ(i, x / len * size * noise, y / len * size * noise, z / len * size * noise);
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x887766,
    metalness: 0.3,
    roughness: 0.8,
    flatShading: true,
  });
  return new THREE.Mesh(geo, mat);
}

export function buildBuilding(width: number, height: number, depth: number): THREE.Mesh {
  const geo = new THREE.BoxGeometry(width, height, depth);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x8899aa,
    metalness: 0.4,
    roughness: 0.6,
    emissive: 0x112233,
    emissiveIntensity: 0.15,
  });
  const mesh = new THREE.Mesh(geo, mat);

  // Add window lights as small emissive planes on the front face
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xffddaa,
    emissive: 0xffcc88,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.8,
  });
  const rows = Math.floor(height / 1.5);
  const cols = Math.floor(Math.max(width, depth) / 1.5);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < 0.6) { // 60% of windows are lit
        const win = new THREE.Mesh(
          new THREE.PlaneGeometry(0.4, 0.3),
          windowMat
        );
        win.position.set(
          -width / 2 + 0.8 + c * 1.4 + Math.random() * 0.2,
          -height / 2 + 1.0 + r * 1.5,
          depth / 2 + 0.01
        );
        mesh.add(win);
      }
    }
  }

  return mesh;
}

export function buildRing(): THREE.Group {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.15, 8, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffdd00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
    })
  );
  group.add(ring);

  const glow = new THREE.PointLight(0xffdd00, 2, 8);
  group.add(glow);

  return group;
}

export enum PowerUpType {
  LASER_UPGRADE,
  HEALTH,
  BOMB,
  SHIELD,
}

const POWERUP_CONFIGS: Record<PowerUpType, { color: number; emissive: number; lightColor: number }> = {
  [PowerUpType.LASER_UPGRADE]: { color: 0xff2222, emissive: 0xff0000, lightColor: 0xff4444 },
  [PowerUpType.HEALTH]:        { color: 0x22ff44, emissive: 0x00ff22, lightColor: 0x44ff66 },
  [PowerUpType.BOMB]:          { color: 0xffdd00, emissive: 0xffaa00, lightColor: 0xffee44 },
  [PowerUpType.SHIELD]:        { color: 0x4488ff, emissive: 0x2244ff, lightColor: 0x66aaff },
};

export function buildPowerUp(type: PowerUpType): THREE.Group {
  const group = new THREE.Group();
  const config = POWERUP_CONFIGS[type];

  // Inner glowing sphere
  const innerMat = new THREE.MeshStandardMaterial({
    color: config.color,
    emissive: config.emissive,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.9,
  });
  const inner = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), innerMat);
  group.add(inner);

  // Outer transparent shell
  const outerMat = new THREE.MeshStandardMaterial({
    color: config.color,
    emissive: config.emissive,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
  });
  const outer = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), outerMat);
  group.add(outer);

  // Orbiting ring for visual distinction
  const ringMat = new THREE.MeshStandardMaterial({
    color: config.color,
    emissive: config.emissive,
    emissiveIntensity: 1.0,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 8, 16), ringMat);
  group.add(ring);

  // Point light for glow
  const light = new THREE.PointLight(config.lightColor, 2, 6);
  group.add(light);

  return group;
}
