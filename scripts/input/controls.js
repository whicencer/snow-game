import { trackGameEvent } from '../../metrics/trackGameEvent.js';
import { currentInteractable } from '../interaction/state.js';
import { playerState } from '../player/state.js';
import { music } from '../sounds/music.js';
import { closeGift } from '../ui/giftModal.js';
import { uiState } from '../ui/uiState.js';
import { handleInteraction } from './handleInteraction.js';

export const GRAVITY = -0.012;
export const JUMP_FORCE = 0.3;
export const GROUND_Y = 1; // Высота ног игрока над нулем сцены

export const keys = {};
export let yaw = 0;   // Поворот влево-вправо
export let pitch = 0; // Поворот вверх-вниз

export const sensitivity = 0.001;
export const MIN_PITCH = -Math.PI / 2.1; // Почти 90 градусов вверх
export const MAX_PITCH = Math.PI / 2.1;  // Почти 90 градусов вниз

export const actions = {
  throwSnowball: false,
  launchFirework: false,
  resetPlayerPosition: false,
};

export function initControls() {
  window.addEventListener('keydown', e => {
    if (uiState.modalOpen && e.code !== 'Escape') return;

    keys[e.code] = true;
    if (e.code === 'Space' && playerState.isGrounded) {
      playerState.velocityY = JUMP_FORCE;
      playerState.isGrounded = false;
    }

    if (e.code === 'KeyM') {
      music.paused ? music.play() : music.pause();
    }

    if (e.code === 'KeyP') {
      actions.launchFirework = true;
    }

    if (e.code === 'KeyE' && currentInteractable) {
      handleInteraction(currentInteractable.name);
      trackGameEvent('interaction', currentInteractable.name || 'unknown_object', 1);
    }

    if (e.code == 'Escape' && uiState.modalOpen) {
      closeGift();
    }

    if (e.code === 'KeyI') {
      actions.resetPlayerPosition = true;
    }
  });
  window.addEventListener('keyup', e => keys[e.code] = false);

  // Pointer Lock для управления мышью
  document.body.addEventListener('click', () => {
    // если открыта модалка — НЕЛЬЗЯ захватывать мышь
    if (uiState.modalOpen) return;

    document.body.requestPointerLock();
  });

  // Throw snowball
  document.addEventListener('mousedown', (e) => {
    if (uiState.modalOpen) return;
    if (document.pointerLockElement !== document.body) return;

    if (e.button === 0) {
      actions.throwSnowball = true;
    }
  });

  document.addEventListener('mousemove', (event) => {
    if (uiState.modalOpen) return;
    if (document.pointerLockElement !== document.body) return;

    yaw   -= event.movementX * sensitivity;
    pitch -= event.movementY * sensitivity;

    // Ограничиваем вертикальный обзор
    pitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitch));
  });
}