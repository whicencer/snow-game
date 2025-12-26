import * as THREE from 'three';
import { yaw, pitch, keys, GROUND_Y, GRAVITY } from '../input/controls.js';
import { playerState } from '../player/state.js';
import { footstepSound } from '../sounds/footstepSound.js';

/* =========================
  UPDATE FIRST PERSON
========================= */
export function updateFirstPerson(player, camera) {
  if (!player) return;

  keys.ShiftLeft ? playerState.isRunning = true : playerState.isRunning = false;
  const moveSpeed = playerState.isRunning ? 0.3 : 0.1;

  // 1. ПОВОРОТ ИГРОКА
  player.rotation.y = yaw;

  // 2. ДВИЖЕНИЕ
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion);
  const right   = new THREE.Vector3(1, 0, 0).applyQuaternion(player.quaternion);

  // 1. Сначала сбрасываем флаг движения в каждом кадре
  playerState.isMoving = false;

  // 2. Проверяем нажатие клавиш и двигаем игрока
  if (keys.KeyW) {
    player.position.addScaledVector(forward, moveSpeed);
    playerState.isMoving = true;
  }
  if (keys.KeyS) {
    player.position.addScaledVector(forward, -moveSpeed);
    playerState.isMoving = true;
  }
  if (keys.KeyA) {
    player.position.addScaledVector(right, -moveSpeed);
    playerState.isMoving = true;
  }
  if (keys.KeyD) {
    player.position.addScaledVector(right, moveSpeed);
    playerState.isMoving = true;
  }

  // 3. ЕДИНАЯ ЛОГИКА АУДИО (с плавным затуханием)
  if (playerState.isRunning) {
    footstepSound.setPlaybackRate(1.3);
  } else {
    footstepSound.setPlaybackRate(1);
  }

  if (playerState.isMoving && playerState.isGrounded) {
    // Начинаем играть, если еще не играет
    if (footstepSound.buffer && !footstepSound.isPlaying) {
      footstepSound.play();
    }
    // Плавно повышаем громкость до 0.5
    let vol = footstepSound.getVolume();
    if (vol < 0.5) {
      footstepSound.setVolume(Math.min(vol + 0.05, 0.5));
    }
  } else {
    // Игрок стоит или в воздухе — плавно снижаем громкость
    if (footstepSound.isPlaying) {
      let vol = footstepSound.getVolume();
      if (vol > 0.05) {
        footstepSound.setVolume(vol - 0.05);
      } else {
        footstepSound.pause(); // Или stop(), если хотите начинать звук сначала
        footstepSound.setVolume(0); 
      }
    }
  }

  // 3. ГРАВИТАЦИЯ
  playerState.velocityY += GRAVITY;
  player.position.y += playerState.velocityY;

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
