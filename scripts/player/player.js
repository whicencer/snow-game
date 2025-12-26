import * as THREE from 'three';

export function createPlayer(scene) {
  // Создаем группу, которая будет основным объектом игрока
  const player = new THREE.Group();
  scene.add(player);
  
  // ВАЖНО: Устанавливаем начальную позицию группы на уровне земли
  player.position.set(0, 1, 0);
  
  // --- Создаем визуальную модель (тело) ---
  // Если загрузится FBX, мы добавим его в эту группу, а пока используем Capsule
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 1.2, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0xcc0000 })
  );
  // Смещаем меш так, чтобы центр группы был в ногах, а не в животе
  body.position.y = 0.6;
  player.add(body);

  return player;
}