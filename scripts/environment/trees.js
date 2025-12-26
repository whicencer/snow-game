import * as THREE from 'three';
import { FBXLoader } from 'three/addons';

const fbxLoader = new FBXLoader();

/* =========================
  TREES
========================= */
export function createTree(scene, x, z) {
  fbxLoader.load(
    import.meta.env.BASE_URL + 'models/tree.fbx',
    (object) => {
      // 1. Визуальная модель
      object.scale.set(0.5, 0.5, 0.5);
      object.position.set(x, 0, z);

      scene.add(object);

      // 2. Вычисляем bounding box ПОСЛЕ scale
      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();

      box.getSize(size);
      box.getCenter(center);

      // 3. Создаём collider под дерево
      const treeCollider = new THREE.Mesh(
        new THREE.BoxGeometry(
          size.x * 0.6, // уже, чем крона
          size.y,       // ВСЯ высота дерева
          size.z * 0.6
        ),
        new THREE.MeshBasicMaterial({ visible: false })
      );

      // 4. Ставим collider ровно под дерево
      treeCollider.position.set(
        x,
        size.y / 2,
        z
      );

      treeCollider.userData.collidable = true;

      scene.add(treeCollider);
    },
    undefined,
    (error) => {
      console.error('FBX load error:', error);
    }
  );
}
