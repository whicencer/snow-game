import * as THREE from 'three';

/**
 * Создает снеговика, устанавливает его позицию и поворот, и добавляет в сцену.
 * @param {THREE.Scene} scene - Сцена для добавления
 * @param {number} x - Позиция X
 * @param {number} z - Позиция Z
 * @param {number} rotationY - Поворот вокруг своей оси (в радианах, например Math.PI)
 */
export function createSnowman(scene, x, z, rotationY = 0) {
  const snowman = new THREE.Group();

  // 1. Материал снега
  const snowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.05,
  });

  // 2. Тело (уменьшенные размеры для реализма)
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), snowMaterial);
  bottom.position.y = 0.6;
  
  const middle = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), snowMaterial);
  middle.position.y = 1.4;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 32), snowMaterial);
  head.position.y = 2.0;

  snowman.add(bottom, middle, head);

  // 3. Лицо (угольки-глаза)
  const coalMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });
  const coalGeo = new THREE.SphereGeometry(0.03, 8, 8);

  const eyeL = new THREE.Mesh(coalGeo, coalMaterial);
  eyeL.position.set(-0.1, 2.05, 0.25);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.1;
  snowman.add(eyeL, eyeR);

  // 4. Нос (морковка)
  const carrotGeo = new THREE.ConeGeometry(0.04, 0.25, 12);
  const carrotMat = new THREE.MeshStandardMaterial({ color: 0xff6600 });
  const carrot = new THREE.Mesh(carrotGeo, carrotMat);
  carrot.position.set(0, 2.0, 0.28);
  carrot.rotation.x = Math.PI / 2;
  snowman.add(carrot);

  // 5. Руки-веточки
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f });
  const armGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.7);

  const leftArm = new THREE.Mesh(armGeo, woodMat);
  leftArm.position.set(-0.4, 1.5, 0);
  leftArm.rotation.z = Math.PI / 2.5;
  
  const rightArm = leftArm.clone();
  rightArm.position.x = 0.4;
  rightArm.rotation.z = -Math.PI / 2.5;

  snowman.add(leftArm, rightArm);

  // 6. Новогодняя шапка!
  const hatGroup = new THREE.Group();
  const redHatMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.6 });
  const whitePomponMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });

  // Основная часть колпака
  const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 16), redHatMaterial);
  hatCone.position.y = 2.2 + 0.2; // Немного выше головы

  // Белая полоска по низу колпака
  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 16), whitePomponMaterial);
  hatBrim.position.y = 2.2;

  // Помпон
  const pompon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), whitePomponMaterial);
  pompon.position.set(0, 2.2 + 0.4 - 0.04, 0); // На самом кончике колпака, слегка согнут
  
  // Легкий наклон колпака и помпона
  hatCone.rotation.z = -0.1; // Небольшой наклон, чтобы не был идеально ровным
  pompon.rotation.z = -0.1;
  pompon.position.x = 0.04; // Смещаем помпон из-за наклона

  hatGroup.add(hatCone, hatBrim, pompon);
  snowman.add(hatGroup);


  // 7. Трансформации всей группы снеговика
  snowman.position.set(x, 0, z);
  snowman.rotation.y = rotationY;
  
  // Настройки для коллизий
  snowman.userData.collidable = true;
  snowman.userData.isTarget = true;
  snowman.userData.isUp = true;

  // Траверс для включения теней на всех вложенных объектах
  snowman.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  scene.add(snowman);
}