const counterEl = document.getElementById('targets_counter');

export function updateTargetsUI(value) {
  if (!counterEl) return;
  counterEl.textContent = value;
}