import * as THREE from 'three';
import { getTonRate } from '../api/tonRate.js';

let blockMaterial;

/* =========================
  BLOCK WALL TEXTURE
========================= */
function initTonRateBlockMaterials() {
  const textureLoader = new THREE.TextureLoader();

  const blockWallTexture = textureLoader.load(import.meta.env.BASE_URL + 'textures/durov.png');
  blockWallTexture.wrapS = THREE.ClampToEdgeWrapping;
  blockWallTexture.wrapT = THREE.ClampToEdgeWrapping;

  blockMaterial = new THREE.MeshStandardMaterial({
    map: blockWallTexture
  });
}

/* =========================
  BLOCK
========================= */
export async function createTonRateBlock(scene, x, z) {
  if (!blockMaterial) initTonRateBlockMaterials();

  /* ---------- CANVAS ---------- */
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  /* ---------- LOAD IMAGE INTO CANVAS ---------- */
  const img = new Image();
  img.src = import.meta.env.BASE_URL + 'textures/durov.png';

  await new Promise(resolve => {
    img.onload = resolve;
  });

  // рисуем ТЕКСТУРУ как фон
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // текст "Loading..."
  ctx.fillStyle = '#00ffcc';
  ctx.font = '28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Loading TON rate...', canvas.width / 2, canvas.height / 2);

  const canvasTexture = new THREE.CanvasTexture(canvas);

  const frontMaterial = new THREE.MeshStandardMaterial({
    map: canvasTexture
  });

  /* ---------- BLOCK ---------- */
  const block = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2, 1),
    [
      blockMaterial, // right
      blockMaterial, // left
      blockMaterial, // top
      blockMaterial, // bottom
      frontMaterial, // FRONT (текст НА текстуре)
      blockMaterial  // back
    ]
  );

  block.position.set(x, 1, z);
  block.userData.collidable = true;
  block.userData.interactable = true;
  block.name = 'ton_rate';

  scene.add(block);

  /* ---------- UPDATE TEXT FROM API ---------- */
  try {
    const text = await getTonRate();

    // перерисовываем: сначала фон
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // затем текст
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 26px monospace';

    wrapText(ctx, `1 TON = $${text}`, canvas.width / 2, (canvas.height / 2 + 20), 460, 32);

    canvasTexture.needsUpdate = true;
  } catch (e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff4444';
    ctx.fillText('API ERROR', canvas.width / 2, canvas.height / 2);

    canvasTexture.needsUpdate = true;
  }
}

/* =========================
  TEXT WRAP
========================= */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  lines.forEach((l, i) => {
    ctx.fillText(
      l,
      x,
      y + (i - lines.length / 2) * lineHeight
    );
  });
}
