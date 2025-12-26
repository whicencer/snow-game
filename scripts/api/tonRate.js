export async function getTonRate() {
  const response = await fetch('https://api.split.tg/buy/ton_rate');
  const data = await response.json();

  if (data.ok) {
    return data.ton_rate.toString().substr(0,4);
  }

  return "0";
}