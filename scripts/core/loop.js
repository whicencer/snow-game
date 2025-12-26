import * as THREE from 'three';

const clock = new THREE.Clock();

export function updateLoop(callback) {
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta(); // Получаем дельту здесь
    callback(delta); // Передаем её в основной цикл
  }
  animate();
}