import { uiState } from './uiState.js';
import { letterOpeningSound } from '../sounds/letterOpening.js';

const modal = document.getElementById('random_gift');
const textEl = document.getElementById('random_gift_text');
const closeBtn = document.getElementById('closeGiftBtn');

export function openRandomGift(wishes) {
  if (!modal || uiState.modalOpen) return;

  uiState.modalOpen = true;

  modal.classList.add('active');
  textEl.innerText = wishes[Math.floor(Math.random() * wishes.length)];

  // отпускаем мышь
  document.exitPointerLock();

  // play letter opening sound
  letterOpeningSound.play();

  closeBtn.onclick = closeGift;
}

export function closeGift() {
  modal.classList.remove('active');
  textEl.innerText = '';
  uiState.modalOpen = false;
  
  document.body.requestPointerLock();
}
