export function updateLoop(callback) {
  function animate() {
    requestAnimationFrame(animate);
    callback();
  }
  animate();
}
