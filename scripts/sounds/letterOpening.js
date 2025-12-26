import * as THREE from 'three';
import { listener, audioLoader } from '../core/audio';

export const letterOpeningSound = new THREE.Audio(listener);

audioLoader.load(import.meta.env.BASE_URL + 'sounds/book-opening.mp3', (buffer) => {
  letterOpeningSound.setBuffer(buffer);
  letterOpeningSound.setVolume(7);
});