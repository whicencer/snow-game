import * as THREE from 'three';

const SNOW_COUNT = 700;
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

export function updateSnow(player, delta) {
  if (!snow) return;

  const positions = snow.geometry.attributes.position.array;
  const timeScale = delta * 60; // Коэффициент для сохранения привычной скорости

  for (let i = 0; i < SNOW_COUNT; i++) {
    // 1. Падение вниз
    // Раньше: positions[i * 3 + 1] -= velocities[i];
    positions[i * 3 + 1] -= velocities[i] * timeScale;

    // 2. Покачивание (синусоида)
    // Date.now() сам по себе зависит от времени, но амплитуду нужно масштабировать
    positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * (0.01 * delta);

    // 3. Респаун снежинки сверху
    if (positions[i * 3 + 1] < -10) { // Сделаем чуть ниже 0, чтобы не исчезали мгновенно
      positions[i * 3 + 1] = SNOW_HEIGHT;
    }
  }

  snow.geometry.attributes.position.needsUpdate = true;

  // снег всегда вокруг игрока
  snow.position.copy(player.position);
}
