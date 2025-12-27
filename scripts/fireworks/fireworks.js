import * as THREE from 'three';
import { fireworksSound } from '../sounds/fireworks.js';
import { fireworks } from './state.js';
import { trackGameEvent } from '../../metrics/trackGameEvent.js';

/* =========================
  CREATE FIREWORK
========================= */
function get2026Points() {
  const points = [];
  const step = 0.1; // Плотность точек в линиях
  
  // Описываем сегменты цифр (как на электронном табло)
  const glyphs = {
    '2': [[0,2,1,2], [1,2,1,1], [1,1,0,1], [0,1,0,0], [0,0,1,0]],
    '0': [[0,0,0,2], [0,2,1,2], [1,2,1,0], [1,0,0,0]],
    '6': [[1,2,0,2], [0,2,0,0], [0,0,1,0], [1,0,1,1], [1,1,0,1]]
  };

  const sequence = ['2', '0', '2', '6'];
  const spacing = 2.5; // Расстояние между цифрами

  sequence.forEach((char, index) => {
    const xOffset = (index - 1.5) * spacing;
    const segments = glyphs[char];

    segments.forEach(([x1, y1, x2, y2]) => {
      // Заполняем линии точками для густоты салюта
      for (let t = 0; t <= 1; t += step) {
        points.push(new THREE.Vector3(
          (x1 + (x2 - x1) * t) + xOffset,
          (y1 + (y2 - y1) * t),
          0
        ));
      }
    });
  });
  return points;
}

export function launchFirework(scene, camera, offsetMultiplier = 0) {
  const points = get2026Points();
  const particleCount = points.length;
  
  // 1. Позиция взрыва перед камерой
  const distance = 40;
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
  const origin = new THREE.Vector3().copy(camera.position).add(direction.multiplyScalar(distance));

  // 4. Смещаем точку влево или вправо
  // Умножаем на 15, чтобы расстояние между взрывами было заметным
  const sideSpacing = 15; 
  origin.add(right.multiplyScalar(offsetMultiplier * sideSpacing));
  
  origin.y += 10; // Поднимаем в небо

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  // --- ЛОГИКА ПОВОРОТА К КАМЕРЕ ---
  // Копируем поворот камеры
  const rotation = new THREE.Quaternion().copy(camera.quaternion);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Базовая точка из генератора
    const basePos = new THREE.Vector3(points[i].x, points[i].y, points[i].z);
    
    // Добавляем немного случайности к каждой точке, чтобы надпись была "жирнее"
    basePos.x += (Math.random() - 0.5) * 0.2;
    basePos.y += (Math.random() - 0.5) * 0.2;
    
    basePos.applyQuaternion(rotation);

    positions[i3] = origin.x;
    positions[i3 + 1] = origin.y;
    positions[i3 + 2] = origin.z;

    // Скорость разлета
    velocities[i3] = basePos.x * 0.1;
    velocities[i3 + 1] = basePos.y * 0.1;
    velocities[i3 + 2] = basePos.z * 0.1;
  }
  // --------------------------------

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    color: new THREE.Color().setHSL(Math.random(), 1, 0.6),
    size: .3,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const firework = new THREE.Points(geometry, material);

  // Сохраняем данные для анимации в userData
  firework.userData = {
    velocities: velocities,
    opacity: 1.0,
    isDead: false
  };

  scene.add(firework);
  fireworks.push(firework);
}

export function updateFireworks(scene, delta) {
  const timeScale = delta * 60;

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const fw = fireworks[i];
    const pos = fw.geometry.attributes.position.array;
    const vels = fw.userData.velocities;

    for (let j = 0; j < pos.length; j++) {
      // Движение
      pos[j] += vels[j] * timeScale;

      // Гравитация для Y компонентов
      if (j % 3 === 1) {
        vels[j] -= 0.001 * timeScale;
      }

      // Сопротивление воздуха
      vels[j] *= Math.pow(0.98, timeScale);
    }

    fw.geometry.attributes.position.needsUpdate = true;

    // Затухание
    fw.userData.opacity -= 0.004 * timeScale;
    fw.material.opacity = fw.userData.opacity;

    // Удаление
    if (fw.userData.opacity <= 0) {
      scene.remove(fw);
      fw.geometry.dispose();
      fw.material.dispose();
      fireworks.splice(i, 1);
    }
  }
}

export function launchFireworksWithAudio(scene, camera) {
  trackGameEvent('firework_launch', 'Firework Celebration', 1);
  // --- ЗВУК ---
    if (fireworksSound.isPlaying) fireworksSound.stop(); // Сбрасываем, если уже играет
    fireworksSound.play(); 
  // ------------

  // Определяем позиции: -1 (лево), 0 (центр), 1 (право)
  const positions = Array.from({length: 7}, () => Math.random() * 2 - 1);

  positions.forEach((offsetMultiplier, i) => {
    setTimeout(() => {
      // Передаем множитель смещения в функцию
      launchFirework(scene, camera, offsetMultiplier);
    }, i * 400); // Задержка между залпами 0.4 сек
  });
}
