import * as THREE from 'three';
import { camera } from '../core/scene';

export const listener = new THREE.AudioListener();
camera.add(listener);

export const audioLoader = new THREE.AudioLoader();