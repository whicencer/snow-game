import * as THREE from 'three';
import { setCurrentInteractable } from './state.js';

const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);

const INTERACT_DISTANCE = 4;

let lastHighlighted = null;
const hint = document.getElementById('hint');

export function updateInteraction(camera, scene, player) {
  if (!hint || !player) return;

  raycaster.setFromCamera(center, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  let found = null;

  for (const hit of intersects) {
    const obj = hit.object;
    // console.log(obj);

    if (!obj.userData.interactable) continue;

    // 📏 проверка дистанции
    const distance = obj.getWorldPosition(new THREE.Vector3())
      .distanceTo(player.position);

    if (distance <= INTERACT_DISTANCE) {
      found = obj;
      break;
    }
  }

  // === ОБНОВЛЕНИЕ ФОКУСА ===
  if (found !== lastHighlighted) {

    // снять подсветку
    if (lastHighlighted?.material?.emissive) {
      lastHighlighted.material.emissive.setHex(0x000000);
    }

    if (found?.material?.emissive) {
      found.material.emissive.setHex(0x5e53b2);
    }

    // hint
    if (found) {
      hint.classList.add('active');
      setCurrentInteractable(found.userData.parentInteractable || found);
    } else {
      hint.classList.remove('active');
      setCurrentInteractable(null);
    }

    lastHighlighted = found;
  }
}
