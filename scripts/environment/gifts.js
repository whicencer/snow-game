import * as THREE from 'three';
import { FBXLoader } from 'three/addons';

const fbxLoader = new FBXLoader();

/* =========================
  GIFTS
========================= */
export function createGifts(scene, x, z) {
  fbxLoader.load(
    import.meta.env.BASE_URL + 'models/gifts.fbx',
    (object) => {
      object.scale.set(0.5, 0.5, 0.5);
      object.position.set(x, 0, z);

      object.traverse(child => {
        if (!child.isMesh) return;

        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(Math.random(), .8, .5),
          roughness: 0.4,
          metalness: 0.1
        });

        // 🔑 ВАЖНО: interactable НА МЕШ
        child.userData.interactable = true;
        child.userData.parentInteractable = object;

        child.castShadow = true;
        child.receiveShadow = true;
      });

      object.userData.interactable = true;
      object.userData.collidable = true;
      object.name = 'receive_gift';

      scene.add(object);
    },
    undefined,
    (error) => {
      console.error('FBX load error:', error);
    }
  );
}