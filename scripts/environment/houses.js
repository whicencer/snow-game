import * as THREE from 'three';

let wallMaterial;
let roofMaterial;

/* =========================
  HOUSE WALL TEXTURE
========================= */
export function initHouseMaterials() {
  const textureLoader = new THREE.TextureLoader();

  const houseWallTexture = textureLoader.load(import.meta.env.BASE_URL + 'textures/wall.png');
  houseWallTexture.wrapS = THREE.RepeatWrapping;
  houseWallTexture.wrapT = THREE.RepeatWrapping;
  houseWallTexture.repeat.set(1, 1);

  wallMaterial = new THREE.MeshStandardMaterial({
    map: houseWallTexture
  });
}

/* =========================
  HOUSE ROOF TEXTURE
========================= */
export function initRoofMaterials() {
  const textureLoader = new THREE.TextureLoader();

  const roofMaterialTexture = textureLoader.load(import.meta.env.BASE_URL + 'textures/roof.png');
  roofMaterialTexture.wrapS = THREE.RepeatWrapping;
  roofMaterialTexture.wrapT = THREE.RepeatWrapping;
  roofMaterialTexture.repeat.set(1, 1);

  roofMaterial = new THREE.MeshStandardMaterial({
    map: roofMaterialTexture
  });
}

/* =========================
  HOUSES
========================= */
export function createHouse(scene, x, z) {
  if (!wallMaterial) initHouseMaterials();
  if (!roofMaterial) initRoofMaterials();
  
  // --- WALLS WITH TEXTURE ---
  const house = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 3),
    wallMaterial
  );
  house.position.set(x, 1, z);

  // --- ROOF ---
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.5, 1.5, 4),
    roofMaterial
  );
  roof.position.set(x, 2.75, z);
  roof.rotation.y = Math.PI / 4;
  
  // --- HOUSE COLLISION BOX ---
  const houseCollider = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 3),
    new THREE.MeshBasicMaterial({ visible: false })
  );

  houseCollider.position.set(x, 1, z);
  houseCollider.userData.collidable = true;

  const buildingGroup = new THREE.Group();
  buildingGroup.add(house);
  buildingGroup.add(roof);

  scene.add(buildingGroup, houseCollider);
}
