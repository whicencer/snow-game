import * as THREE from 'three';
import { listener, audioLoader } from '../core/audio';

export const fireworksSound = new THREE.Audio(listener);

audioLoader.load(import.meta.env.BASE_URL + 'sounds/fireworks.mp3', (buffer) => {
  fireworksSound.setBuffer(buffer);
  fireworksSound.setVolume(0.5);
});