import * as THREE from 'three';

export function initMoon(scene) {
  const moonGroup = new THREE.Group();

  const moonGeometry = new THREE.SphereGeometry(2, 32, 32);
  const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffcc,
    transparent: true,
    opacity: 0.2
  });
  const moonGlow = new THREE.Mesh(new THREE.SphereGeometry(2.5, 32, 32), glowMaterial);

  const moonLight = new THREE.DirectionalLight(0xffffff, 0.8);
  moonLight.position.set(20, 40, 10);

  moonGroup.add(moonMesh);
  moonGroup.add(moonGlow);
  moonGroup.add(moonLight);

  // === ДОБАВЛЯЕМ ЭТО ===
  // Запрещаем "отсечение" объекта, чтобы он был виден всегда
  moonGroup.traverse((obj) => {
    obj.frustumCulled = false;
  });

  moonGroup.position.set(20, 40, -50);
  scene.add(moonGroup);

  moonLight.target.position.set(0, 0, 0);
  
  // Возвращаем группу, чтобы к ней можно было обратиться в цикле анимации
  return moonGroup;
}