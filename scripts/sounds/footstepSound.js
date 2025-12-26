import * as THREE from 'three';
import { listener, audioLoader } from '../core/audio';

export const footstepSound = new THREE.Audio(listener);

audioLoader.load(import.meta.env.BASE_URL + 'sounds/fast-footsteps-on-snow.mp3', (buffer) => {
  footstepSound.setBuffer(buffer);
  footstepSound.setLoop(true); // Зацикливаем длинный файл
  footstepSound.setVolume(0.5);
});