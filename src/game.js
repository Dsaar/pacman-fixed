import TileMap from "./tileMap.js";

const tileSize = 32;
const velocity = 2;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const tileMap = new TileMap(tileSize);
const pacMan = tileMap.getPacman(velocity);
const enemies = tileMap.getEnemies(velocity);

let gameOver = false;
let gameWin = false;
const gameOverSound = new Audio("sound/gameOver.wav");
const gameWinSound = new Audio("sound/gameWin.wav");

function gameLoop() {
  tileMap.draw(ctx);
  drawGameEnd();
  pacMan.draw(ctx, pause(), enemies);
  enemies.forEach((enemy) => enemy.draw(ctx, pause(), pacMan));
  checkGameOver();
  checkGameWin();
}

function checkGameWin() {
  if (!gameWin) {
    gameWin = tileMap.didWin();
    if (gameWin) gameWinSound.play();
  }
}

function checkGameOver() {
  if (!gameOver) {
    gameOver = isGameOver();
    if (gameOver) gameOverSound.play();
  }
}

function isGameOver() {
  return enemies.some((enemy) => !pacMan.powerDotActive && enemy.collideWith(pacMan));
}

function pause() {
  return !pacMan.madeFirstMove || gameOver || gameWin;
}

function drawGameEnd() {
  if (gameOver || gameWin) {
    let text = gameWin ? "You Win" : "Game Over";
    ctx.fillStyle = "black";
    ctx.fillRect(0, canvas.height / 3.2, canvas.clientWidth, 80);

    ctx.font = "80px comic sans";
    const gradient = ctx.createLinearGradient(0, 0, canvas.clientWidth, 0);
    gradient.addColorStop("0", "magenta");
    gradient.addColorStop("0.5", "blue");
    gradient.addColorStop("1.0", "red");

    ctx.fillStyle = gradient;
    ctx.fillText(text, 10, canvas.height / 2);
  }
}

tileMap.setCanvasSize(canvas);
setInterval(gameLoop, 1000 / 75);

document.getElementById("restartButton").addEventListener("click", () => {
  gameOver = false;
  gameWin = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tileMap.reset();

  const newPacman = tileMap.getPacman(velocity);
  pacMan.x = newPacman.x;
  pacMan.y = newPacman.y;
  pacMan.reset();

  const newEnemies = tileMap.getEnemies(velocity);
  enemies.length = 0;
  enemies.push(...newEnemies);
});
