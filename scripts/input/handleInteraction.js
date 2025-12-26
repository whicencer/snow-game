import { wishes } from '../../constants/wishes.js';
import { openRandomGift } from '../ui/giftModal.js';

export function handleInteraction(objName) {
  switch(objName) {
    case 'tg_block':
      window.open('https://t.me/whocencer', '_blank');
      break;
    case 'receive_gift':
      openRandomGift(wishes);
      break;
    case 'ton_rate':
      window.open('https://coinmarketcap.com/currencies/toncoin', '_block');
      break;
    default:
      console.log('IDK');
  }
}