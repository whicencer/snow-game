import { targets } from './targetsState.js';

export function updateTargets() {
  targets.forEach(target => {
    if (!target.userData.isUp) {
      target.rotation.x = Math.max(
        target.rotation.x - 0.08,
        0
      );

      target.userData.respawnTimer--;

      // восстановление
      if (target.userData.respawnTimer <= 0) {
        target.userData.isUp = true;
      }
    } else {
      target.rotation.x = Math.min(
        target.rotation.x + 0.08,
        target.userData.baseRotation
      );
    }
  });
}
