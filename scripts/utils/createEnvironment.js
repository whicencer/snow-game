import { createHouse } from "../environment/houses";
import { createTree } from "../environment/trees";

export function createEnvironment(scene) {
  const HOUSE_COUNT = 200;
  const TREE_COUNT = 300;

  const WORLD_RADIUS = 170;

  const FORBIDDEN_RADIUS = 20;
  const MIN_DISTANCE_BETWEEN_OBJECTS = 6;

  const forbiddenPoints = [
    { x: 0, z: 0 },
    { x: 10, z: 20 },
    { x: 3, z: -5 },
    { x: -5, z: -5 },
    { x: 10, z: -10 },
    { x: 13, z: -10 },
    { x: 16, z: -10 },
  ];

  const placedObjects = [];

  function isTooClose(x, z, points, minDist) {
    return points.some(p => {
      const dx = p.x - x;
      const dz = p.z - z;
      return Math.sqrt(dx * dx + dz * dz) < minDist;
    });
  }

  function isForbidden(x, z) {
    return forbiddenPoints.some(p => {
      const dx = p.x - x;
      const dz = p.z - z;
      return Math.sqrt(dx * dx + dz * dz) < FORBIDDEN_RADIUS;
    });
  }

  function getRandomPosition() {
    return {
      x: (Math.random() - 0.5) * WORLD_RADIUS * 2,
      z: (Math.random() - 0.5) * WORLD_RADIUS * 2
    };
  }

  /* =========================
    ДОМА
  ========================= */

  let houseAttempts = 0;
  while (placedObjects.length < HOUSE_COUNT && houseAttempts < 5000) {
    houseAttempts++;

    const { x, z } = getRandomPosition();

    if (isForbidden(x, z)) continue;
    if (isTooClose(x, z, placedObjects, MIN_DISTANCE_BETWEEN_OBJECTS * 2)) continue;

    createHouse(scene, x, z);
    placedObjects.push({ x, z });
  }

  /* =========================
    ДЕРЕВЬЯ
  ========================= */

  let treeCount = 0;
  let treeAttempts = 0;

  while (treeCount < TREE_COUNT && treeAttempts < 8000) {
    treeAttempts++;

    const { x, z } = getRandomPosition();

    if (isForbidden(x, z)) continue;
    if (isTooClose(x, z, placedObjects, MIN_DISTANCE_BETWEEN_OBJECTS)) continue;

    createTree(scene, x, z);
    placedObjects.push({ x, z });
    treeCount++;
  }

  console.log(
    `🌲 Trees: ${treeCount}, 🏠 Houses: ${placedObjects.length - treeCount}`
  );
}
