import * as THREE from 'three';

import { scene, camera, renderer } from './scripts/core/scene.js';
import { updateLoop } from './scripts/core/loop.js';
import { actions, initControls } from './scripts/input/controls.js';
import { createPlayer } from './scripts/player/player.js';
import { initSnow, updateSnow } from './scripts/environment/snow.js';
import { createGround } from './scripts/environment/ground.js';
import { initLights } from './scripts/environment/lights.js';
import { initStars } from './scripts/environment/stars.js';
import { updateFirstPerson } from './scripts/camera/firstPerson.js';
import { initMoon } from './scripts/environment/moon.js';
import { updateSnowballAbility, updateSnowballs, updateSnowImpacts } from './scripts/player/snowball.js';
import { launchFireworksWithAudio, updateFireworks } from './scripts/fireworks/fireworks.js';
import { createTelegramBlock } from './scripts/environment/telegramBlock.js';
import { updateInteraction } from './scripts/interaction/interaction.js';
import { createGifts } from './scripts/environment/gifts.js';
import { createTonRateBlock } from './scripts/environment/tonRateBlock.js';
import { createEnvironment } from './scripts/utils/createEnvironment.js';
import { createTarget } from './scripts/environment/targets/target.js';
import { updateTargets } from './scripts/environment/targets/updateTargets.js';
import { createSnowman } from './scripts/environment/snowman.js';

/* =========================
  STATS
========================= */
import Stats from 'three/examples/jsm/libs/stats.module';

let stats;

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('debug')) {
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}

/* =========================
  INIT
========================= */
initControls();

const player = createPlayer(scene);

/* =========================
  LIGHTING
========================= */
const ambientLight = new THREE.AmbientLight(0x99bbff, 0.6);
scene.add(ambientLight);

/* =========================
  ENVIRONMENT
========================= */
initLights(scene);
createGround(scene);
initStars(scene);
initSnow(scene);
createTelegramBlock(scene, 0, -5);
createEnvironment(scene);
createTarget(scene, 10, -10);
createTarget(scene, 13, -10);
createTarget(scene, 16, -10);
createSnowman(scene, -8.3, -5, 25 * (Math.PI / 180));
createGifts(scene, 3, -5);
(async () => createTonRateBlock(scene, -5, -5))();
const moon = initMoon(scene);

/* =========================
  MAIN LOOP
========================= */
updateLoop((delta) => {
  if (stats) stats.begin();

  updateFirstPerson(player, camera, delta);
  updateSnow(player, delta);
  updateSnowballs(scene, delta);
  updateSnowballAbility(player, camera, scene);
  updateSnowImpacts(scene, delta);
  updateInteraction(camera, scene, player);
  updateTargets();
  updateFireworks(scene, delta);

  if (actions.launchFirework) {
    launchFireworksWithAudio(scene, camera);
    actions.launchFirework = false;
  }

  if (actions.resetPlayerPosition) {
    player.position.set(0, 0, 0);
    actions.resetPlayerPosition = false;
  }

  if (moon) {
    // Луна копирует позицию камеры + изначальный офсет (20, 40, -50)
    // Таким образом, вы никогда не сможете "пройти мимо" неё или "уйти" от неё
    moon.position.set(
      camera.position.x + 20,
      camera.position.y + 40,
      camera.position.z - 50
    );
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.render(scene, camera);

  if (stats) stats.end(); // Заканчиваем замер
});