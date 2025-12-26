import * as THREE from 'three';

let blockMaterial;

/* =========================
  BLOCK WALL TEXTURE
========================= */
function initTelegramBlockMaterials() {
  const textureLoader = new THREE.TextureLoader();

  const blockWallTexture = textureLoader.load(import.meta.env.BASE_URL + 'textures/telegram_channel.png');
  blockWallTexture.wrapS = THREE.RepeatWrapping;
  blockWallTexture.wrapT = THREE.RepeatWrapping;
  blockWallTexture.repeat.set(1, 1);

  blockMaterial = new THREE.MeshStandardMaterial({
    map: blockWallTexture
  });
}

/* =========================
  BLOCK
========================= */
export function createTelegramBlock(scene, x, z) {
  if (!blockMaterial) initTelegramBlockMaterials();
  
  // --- BLOCK WITH TEXTURE ---
  const block = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2, 1),
    blockMaterial,
  );
  block.position.set(x, 1, z);

  block.userData.collidable = true;
  block.userData.interactable = true;
  block.name = 'tg_block';

  scene.add(block);
}