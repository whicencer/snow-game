import * as THREE from 'three';
import { yaw, pitch, keys, GROUND_Y, GRAVITY } from '../input/controls.js';
import { playerState } from '../player/state.js';
import { footstepSound } from '../sounds/footstepSound.js';

/* =========================
  UPDATE FIRST PERSON
========================= */
export function updateFirstPerson(player, camera, delta) {
  if (!player) return;

  // 0. Создаем коэффициент масштабирования (база — 60 кадров в секунду)
  const timeScale = delta * 60;

  keys.ShiftLeft ? playerState.isRunning = true : playerState.isRunning = false;
  
  // Скорость теперь — это "единиц в секунду", умножаем её на delta
  // Если раньше было 0.1 на кадр (при 60fps), то теперь это 6 единиц в сек (0.1 * 60)
  const baseSpeed = playerState.isRunning ? 18 : 6; 
  const moveDistance = baseSpeed * delta;

  // 1. ПОВОРОТ ИГРОКА
  player.rotation.y = yaw;

  // 2. ДВИЖЕНИЕ
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion);
  const right   = new THREE.Vector3(1, 0, 0).applyQuaternion(player.quaternion);

  playerState.isMoving = false;

  if (keys.KeyW) {
    player.position.addScaledVector(forward, moveDistance);
    playerState.isMoving = true;
  }
  if (keys.KeyS) {
    player.position.addScaledVector(forward, -moveDistance);
    playerState.isMoving = true;
  }
  if (keys.KeyA) {
    player.position.addScaledVector(right, -moveDistance);
    playerState.isMoving = true;
  }
  if (keys.KeyD) {
    player.position.addScaledVector(right, moveDistance);
    playerState.isMoving = true;
  }

  // 3. ЛОГИКА АУДИО (зависит от времени)
  if (playerState.isRunning) {
    footstepSound.setPlaybackRate(1.3);
  } else {
    footstepSound.setPlaybackRate(1);
  }

  const fadeSpeed = 2 * delta; // Скорость изменения громкости в секунду

  if (playerState.isMoving && playerState.isGrounded) {
    if (footstepSound.buffer && !footstepSound.isPlaying) {
      footstepSound.play();
    }
    let vol = footstepSound.getVolume();
    if (vol < 0.5) {
      footstepSound.setVolume(Math.min(vol + fadeSpeed, 0.5));
    }
  } else {
    if (footstepSound.isPlaying) {
      let vol = footstepSound.getVolume();
      if (vol > 0.01) {
        footstepSound.setVolume(Math.max(vol - fadeSpeed, 0));
      } else {
        footstepSound.pause();
        footstepSound.setVolume(0); 
      }
    }
  }

  // 3. ГРАВИТАЦИЯ
  // GRAVITY должна быть константой ускорения за секунду в квадрате.
  // Если у вас была маленькая GRAVITY (например -0.01), умножаем её на timeScale
  playerState.velocityY += GRAVITY * timeScale;
  player.position.y += playerState.velocityY * timeScale;

  if (player.position.y <= GROUND_Y) {
    player.position.y = GROUND_Y;
    playerState.velocityY = 0;
    playerState.isGrounded = true;
  }

  // 4. КАМЕРА (ГЛАЗА)
  camera.position.set(
    player.position.x,
    player.position.y + 0.8,
    player.position.z
  );

  // 5. ВЗГЛЯД
  const lookDir = new THREE.Vector3(0, 0, -1);
  lookDir.applyEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
  camera.lookAt(camera.position.clone().add(lookDir));
}