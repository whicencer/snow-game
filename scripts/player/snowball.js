import * as THREE from 'three';
import { playerState, snowballs, snowImpacts } from './state';
import { snowballSound, hitSound } from '../sounds/snowball.js';
import { actions } from '../input/controls.js';
import { updateTargetsUI } from '../ui/targetsUi.js';

export function updateSnowballAbility(player, camera, scene) {
  if (!actions.throwSnowball) return;

  throwSnowball(player, camera, scene);

  // сбрасываем intent
  actions.throwSnowball = false;
}

function throwSnowball(player, camera, scene) {
  // геометрия снежка
  const geometry = new THREE.SphereGeometry(0.25, 12, 12);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const snowball = new THREE.Mesh(geometry, material);

  // стартовая позиция — перед камерой
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  snowball.position.copy(camera.position).add(direction.clone().multiplyScalar(-1));

  // скорость
  const speed = 1.2;
  snowball.userData.velocity = direction.multiplyScalar(speed);
  snowball.userData.life = 120; // кадров жизни

  scene.add(snowball);
  snowballs.push(snowball);

  // звук (клонируем, чтобы не обрывался)
  snowballSound.cloneNode().play();
}

export function updateSnowballs(scene) {
  for (let i = snowballs.length - 1; i >= 0; i--) {
    const ball = snowballs[i];

    // 1. Сначала проверяем столкновение ОТ старой позиции К новой (которую мы сейчас вычислим)
    const velocity = ball.userData.velocity;
    const nextPosition = ball.position.clone().add(velocity);
    
    // Передаем в функцию текущую позицию и ту, где он окажется через мгновение
    const hitObject = checkCollision(ball, nextPosition, scene);

    if (hitObject?.userData?.isTarget) {
      if (hitObject.userData.isUp) {
        playerState.targetsShot += 1;
        updateTargetsUI(playerState.targetsShot);
      }
      hitObject.userData.isUp = false;
      hitObject.userData.respawnTimer = 120;
    }

    if (hitObject || ball.position.y < 0) {
      hitSound.cloneNode().play();
      createSnowImpact(ball.position.clone(), scene);
      scene.remove(ball);
      snowballs.splice(i, 1);
      continue;
    }

    // 2. Только если столкновения нет — реально перемещаем объект
    ball.position.copy(nextPosition);
    ball.userData.velocity.y -= 0.01; // Гравитация

    ball.userData.life--;
    if (ball.userData.life <= 0) {
      scene.remove(ball);
      snowballs.splice(i, 1);
    }
  }
}

function checkCollision(snowball, nextPos, scene) {
  const currentPos = snowball.position;
  
  // Вычисляем вектор направления и расстояние до следующей точки
  const direction = new THREE.Vector3().subVectors(nextPos, currentPos).normalize();
  const distance = currentPos.distanceTo(nextPos);

  // Пускаем луч. Добавляем небольшой запас (0.25 - радиус снежка), 
  // чтобы он реагировал краем сферы, а не только центром.
  const raycaster = new THREE.Raycaster(currentPos, direction, 0, distance + 0.25);
  
  // Находим все объекты с флагом collidable
  const targets = scene.children.filter(obj => obj.userData.collidable);
  
  // Проверка пересечений (true — проверять вложенные объекты, если мишень сложная)
  const intersects = raycaster.intersectObjects(targets, true);

  if (intersects.length > 0) {
    // Возвращаем самый верхний родительский объект, у которого есть userData.collidable
    // Это важно, если луч попал в дочерний Mesh внутри группы мишени
    let target = intersects[0].object;
    while (target.parent && !target.userData.collidable) {
        target = target.parent;
    }
    return target;
  }

  return null;
}

function createSnowImpact(position, scene) {
  const group = new THREE.Group();
  const count = 12;

  for (let i = 0; i < count; i++) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );

    particle.position.copy(position);

    // случайное направление
    particle.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      Math.random() * 0.25,
      (Math.random() - 0.5) * 0.2
    );

    group.add(particle);
  }

  group.userData.life = 25; // кадров жизни
  scene.add(group);
  snowImpacts.push(group);
}

export function updateSnowImpacts(scene) {
  for (let i = snowImpacts.length - 1; i >= 0; i--) {
    const impact = snowImpacts[i];

    impact.userData.life--;

    impact.children.forEach(p => {
      p.position.add(p.userData.velocity);
      p.userData.velocity.y -= 0.01; // гравитация
    });

    if (impact.userData.life <= 0) {
      scene.remove(impact);
      snowImpacts.splice(i, 1);
    }
  }
}
