'use strict';
// 公開画像を差し替える場合は、このURLを変更してください。
const IMAGE_BASE_URL = 'https://yongmars.github.io/halloween-slide-puzzle/';
const IMAGE_FILES = {3: 'スライドパズル用_3x3.png', 4: 'スライドパズル用.png'};
const board = document.querySelector('#board');
const sizeSelect = document.querySelector('#size');
const movesLabel = document.querySelector('#moves');
const statusLabel = document.querySelector('#status');
const clearPanel = document.querySelector('#clear');
const shuffleButton = document.querySelector('#shuffle');
const resetButton = document.querySelector('#reset');
const retryButton = document.querySelector('#retry');
let size = 3, tiles = [], initial = [], moves = 0, ready = false, finished = false, imageUrl = '';
function neighbors(index, n) {
  const result = [], row = Math.floor(index / n), col = index % n;
  if (row > 0) result.push(index - n);
  if (row < n - 1) result.push(index + n);
  if (col > 0) result.push(index - 1);
  if (col < n - 1) result.push(index + 1);
  return result;
}
function isSolved(values) { return values.every((value, index) => value === index); }
function shuffled(n) {
  const values = Array.from({length:n*n}, (_,i) => i);
  let blank = values.length - 1, previous = -1;
  for (let step = 0; step < n*n*40; step++) {
    const choices = neighbors(blank,n).filter(index => index !== previous);
    const next = choices[Math.floor(Math.random()*choices.length)];
    [values[blank],values[next]] = [values[next],values[blank]];
    previous = blank; blank = next;
  }
  if (isSolved(values)) {
    const next = neighbors(blank,n)[0];
    [values[blank],values[next]] = [values[next],values[blank]];
  }
  return values;
}
function render() {
  board.replaceChildren(); board.style.setProperty('--size',size);
  movesLabel.textContent = moves;
  clearPanel.hidden = !finished;
  if (finished) {
    const img = document.createElement('img'); img.src = imageUrl;
    img.alt = '完成したハロウィンのイラスト'; img.className = 'finished'; board.append(img);
    statusLabel.textContent = `${moves}手で完成しました！`;
    return;
  }
  const blank = tiles.indexOf(size*size-1), adjacent = neighbors(blank,size);
  tiles.forEach((value,index) => {
    if (value === size*size-1) {
      const empty = document.createElement('div'); empty.className = 'empty';
      empty.setAttribute('aria-label','空白'); board.append(empty); return;
    }
    const tile = document.createElement('button'); tile.className = 'tile';
    tile.style.backgroundImage = `url("${imageUrl}")`;
    tile.style.backgroundSize = `${size*100}% ${size*100}%`;
    tile.style.backgroundPosition = `${value%size/(size-1)*100}% ${Math.floor(value/size)/(size-1)*100}%`;
    tile.disabled = !adjacent.includes(index); tile.classList.toggle('movable',!tile.disabled);
    tile.setAttribute('aria-label',`ピース${value+1}${tile.disabled?'':'を空白へ移動'}`);
    const label = document.createElement('span'); label.textContent = value+1; label.setAttribute('aria-hidden','true'); tile.append(label);
    tile.addEventListener('click',() => move(index)); board.append(tile);
  });
  statusLabel.textContent = '空白のとなりのピースをタップしてね';
}
function move(index) {
  if (!ready || finished) return;
  const blank = tiles.indexOf(size*size-1);
  if (!neighbors(blank,size).includes(index)) return;
  [tiles[blank],tiles[index]] = [tiles[index],tiles[blank]];
  moves++; finished = isSolved(tiles); render();
  if (finished) document.querySelector('#again').focus();
  else board.children[blank]?.focus();
}
function start() {
  if (!ready) return;
  size = Number(sizeSelect.value); tiles = shuffled(size); initial = [...tiles];
  moves = 0; finished = false; render();
}
shuffleButton.addEventListener('click',start);
sizeSelect.addEventListener('change',loadImage);
document.querySelector('#again').addEventListener('click',start);
resetButton.addEventListener('click',() => {
  if (!ready) return;
  tiles = [...initial]; moves = 0; finished = false; render();
});
function loadImage() {
  size = Number(sizeSelect.value);
  ready = false; sizeSelect.disabled = true; shuffleButton.disabled = resetButton.disabled = true;
  retryButton.hidden = true; statusLabel.textContent = '画像を読み込んでいます…';
  const local = location.protocol === 'file:' || ['localhost','127.0.0.1'].includes(location.hostname);
  imageUrl = (local ? './' : IMAGE_BASE_URL) + IMAGE_FILES[size];
  const img = new Image();
  img.onload = () => {
    ready = true; sizeSelect.disabled = false; shuffleButton.disabled = resetButton.disabled = false; start();
  };
  img.onerror = () => {statusLabel.textContent = '画像を読み込めませんでした。もう一度試してね。'; retryButton.hidden = false;};
  img.src = imageUrl;
}
retryButton.addEventListener('click',loadImage);
loadImage();
