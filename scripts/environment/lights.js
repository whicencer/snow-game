import * as THREE from 'three';

export function initLights(scene) {
  const ambient = new THREE.AmbientLight(0x99bbff, 0.6);
  scene.add(ambient);

  const moonLight = new THREE.DirectionalLight(0xffffff, 0.8);
  moonLight.position.set(20, 40, 10);
  scene.add(moonLight);
}
