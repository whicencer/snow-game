import * as THREE from 'three';
import { targets } from './targetsState.js';

export function createTarget(scene, x, z) {
  const group = new THREE.Group();

  /* =========================
    BACK PLATE
  ========================= */
  const back = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.75, 0.12, 24),
    new THREE.MeshStandardMaterial({
      color: 0x5a3a1a,
      roughness: 0.9
    })
  );
  group.add(back);

  /* =========================
    WHITE TARGET
  ========================= */
  const white = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.65, 0.02, 24),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  white.position.y = 0.07;
  group.add(white);

  /* =========================
    RED CENTER
  ========================= */
  const center = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.03, 24),
    new THREE.MeshStandardMaterial({
      color: 0xff3333,
      emissive: 0x330000
    })
  );
  center.position.y = 0.09;
  group.add(center);

  /* =========================
    ORIENTATION
  ========================= */
  // СТАВИМ МИШЕНЬ ВЕРТИКАЛЬНО
  group.rotation.x = Math.PI / 2;

  group.position.set(x, 1.6, z);

  group.userData = {
    isTarget: true,
    isUp: true,
    respawnTimer: 0,
    baseRotation: Math.PI / 2
  };

  group.userData.collidable = true;

  scene.add(group);
  targets.push(group);
}
