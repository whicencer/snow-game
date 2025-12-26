import * as THREE from 'three';

export const GROUND_Y = 0;

export function createGround(scene) {
  const loader = new THREE.TextureLoader();
  const snowTexture = loader.load(import.meta.env.BASE_URL + 'textures/snow.png');

  // повторяем текстуру, чтобы не растягивалась
  snowTexture.wrapS = THREE.RepeatWrapping;
  snowTexture.wrapT = THREE.RepeatWrapping;
  snowTexture.repeat.set(20, 20);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({
      map: snowTexture,
      roughness: 0.9,
      metalness: 0.0
    })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = GROUND_Y;
  ground.receiveShadow = true;

  scene.add(ground);
}
