import * as THREE from 'three';
import { playerState, snowballs, snowImpacts } from './state';
import { snowballSound, hitSound } from '../sounds/snowball.js';
import { actions } from '../input/controls.js';
import { updateTargetsUI } from '../ui/targetsUi.js';
import { trackGameEvent } from '../../metrics/trackGameEvent.js';

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

  snowball.position.copy(camera.position).add(direction.clone().multiplyScalar(0.5));

  // скорость
  const speed = 1.2;
  snowball.userData.velocity = direction.multiplyScalar(speed);
  snowball.userData.life = 120; // кадров жизни

  scene.add(snowball);
  snowballs.push(snowball);

  // звук (клонируем, чтобы не обрывался)
  snowballSound.cloneNode().play();
  trackGameEvent('snowball_throw', 'Throw Snowball', 1);
}

export function updateSnowballs(scene, delta) {
  // Константа для нормализации скорости. 
  // Если раньше код писался под 60 FPS, то delta будет ~0.016.
  // Мы будем умножать перемещение на delta * 60, чтобы сохранить привычные значения.
  const timeScale = delta * 60; 

  for (let i = snowballs.length - 1; i >= 0; i--) {
    const ball = snowballs[i];
    const velocity = ball.userData.velocity;

    // 1. Вычисляем смещение за этот кадр
    // .clone().multiplyScalar(timeScale) позволяет перемещению зависеть от времени
    const frameVelocity = velocity.clone().multiplyScalar(timeScale);
    const nextPosition = ball.position.clone().add(frameVelocity);
    
    const hitObject = checkCollision(ball, nextPosition, scene);

    if (hitObject?.userData?.isTarget) {
      trackGameEvent('snowball_hit', hitObject.name || 'default_target', 1);
      if (hitObject.userData.isUp) {
        playerState.targetsShot += 1;
        updateTargetsUI(playerState.targetsShot);
      }

      if (!hitObject.userData.isTargetStrong) {
        hitObject.userData.isUp = false;
        // Таймер респауна тоже должен зависеть от времени
        hitObject.userData.respawnTimer = 0.5 / delta; 
      }
    }

    if (hitObject || ball.position.y < 0) {
      hitSound.cloneNode().play();
      createSnowImpact(ball.position.clone(), scene);
      scene.remove(ball);
      ball.geometry.dispose();
      ball.material.dispose();
      snowballs.splice(i, 1);
      continue;
    }

    // 2. Реальное перемещение
    ball.position.copy(nextPosition);

    // 3. Гравитация (тоже умножаем на timeScale)
    // 0.01 была подобрана под один кадр, теперь она привязана ко времени
    velocity.y -= 0.01 * timeScale; 

    // 4. Время жизни (Life)
    // Если раньше life было, например, 100 кадров, 
    // то теперь вычитаем время, чтобы снежок жил условно 2-3 секунды.
    ball.userData.life -= timeScale; 
    ball.castShadow = false;
    
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

export function updateSnowImpacts(scene, delta) {
  const timeScale = delta * 60;

  for (let i = snowImpacts.length - 1; i >= 0; i--) {
    const impact = snowImpacts[i];

    impact.userData.life -= timeScale;

    impact.children.forEach(p => {
      // 2. Движение частицы
      // Умножаем вектор скорости на timeScale
      p.position.x += p.userData.velocity.x * timeScale;
      p.position.y += p.userData.velocity.y * timeScale;
      p.position.z += p.userData.velocity.z * timeScale;

      // 3. Гравитация для каждой частицы
      p.userData.velocity.y -= 0.01 * timeScale;
    });

    // Удаление эффекта
    if (impact.userData.life <= 0) {
      scene.remove(impact);

      impact.children.forEach(child => {
        child.geometry.dispose();
        child.material.dispose();
      });
      
      snowImpacts.splice(i, 1);
    }
  }
}
