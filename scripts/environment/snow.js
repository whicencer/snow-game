import * as THREE from 'three';

const SNOW_COUNT = 2000;
const SNOW_AREA = 80;
const SNOW_HEIGHT = 40;

let snow;
let velocities;

export function initSnow(scene) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(SNOW_COUNT * 3);
  velocities = new Float32Array(SNOW_COUNT);

  for (let i = 0; i < SNOW_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * SNOW_AREA;
    positions[i * 3 + 1] = Math.random() * SNOW_HEIGHT;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SNOW_AREA;

    velocities[i] = 0.02 + Math.random() * 0.05;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.25,
    transparent: true,
    opacity: 0.9,
    depthWrite: false
  });

  snow = new THREE.Points(geometry, material);
  scene.add(snow);
}

export function updateSnow(player) {
  if (!snow) return;

  const positions = snow.geometry.attributes.position.array;

  for (let i = 0; i < SNOW_COUNT; i++) {
    positions[i * 3 + 1] -= velocities[i];
    positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.002;

    if (positions[i * 3 + 1] < 0) {
      positions[i * 3 + 1] = SNOW_HEIGHT;
      positions[i * 3] = (Math.random() - 0.5) * SNOW_AREA;
      positions[i * 3 + 2] = (Math.random() - 0.5) * SNOW_AREA;
    }
  }

  snow.geometry.attributes.position.needsUpdate = true;

  // снег всегда вокруг игрока
  snow.position.copy(player.position);
}
