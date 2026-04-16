const gameArea = document.getElementById("game-area");
const scoreElement = document.getElementById("score");
const startBtn = document.getElementById("start-btn");

let score = 0;
let gameActive = false;
let spawnInterval;

// Inicia o jogo
startBtn.addEventListener("click", () => {
  if (gameActive) return;

  resetGame();
  gameActive = true;
  startBtn.style.display = "none";

  // setInterval: Gerar inimigos continuamente (requisito)
  spawnInterval = setInterval(spawnEnemy, 800);

  // setTimeout: Limitar duração do jogo (requisito: 15 segundos)
  setTimeout(endGame, 15000);
});

function spawnEnemy() {
  if (!gameActive) return;

  // createElement e Manipulação do DOM
  const enemy = document.createElement("img");
  enemy.src = "mask_yami.png"; // Certifique-se que o arquivo existe na pasta
  enemy.classList.add("enemy");

  // Math.random para posições aleatórias
  const maxX = gameArea.clientWidth - 80;
  const maxY = gameArea.clientHeight - 80;

  enemy.style.left = Math.random() * maxX + "px";
  enemy.style.top = Math.random() * maxY + "px";

  // Evento de clique
  enemy.onclick = (e) => {
    if (!gameActive) return;
    score++;
    scoreElement.innerText = score;
    createBloodEffect(e.pageX, e.pageY);
    enemy.remove(); // Remove ao clicar
  };

  gameArea.appendChild(enemy);

  // Desaparece automaticamente após 1 segundo se não for clicado
  setTimeout(() => {
    if (enemy.parentNode) {
      enemy.remove();
    }
  }, 1200);
}

// Efeito visual adicional: Rastro/Sangue
function createBloodEffect(x, y) {
  for (let i = 0; i < 5; i++) {
    const drop = document.createElement("div");
    drop.classList.add("blood-drop");
    drop.style.left = x + "px";
    drop.style.top = y + "px";
    document.body.appendChild(drop);

    setTimeout(() => drop.remove(), 800);
  }
}

function resetGame() {
  score = 0;
  scoreElement.innerText = score;
  gameArea.innerHTML = "";
}

function endGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  alert(`RITUAL ENCERRADO! Sua pontuação: ${score}`);
  startBtn.style.display = "block";
  startBtn.innerText = "TENTAR NOVAMENTE";
}

let isDragging = false;

document.addEventListener("dragstart", () => {
  isDragging = true;
});

document.addEventListener("dragend", () => {
  isDragging = false;
});

document.addEventListener("dragover", (e) => {
  if (!isDragging) return;

  const trail = document.createElement("div");
  trail.className = "trail";

  trail.style.left = e.clientX + "px";
  trail.style.top = e.clientY + "px";

  document.body.appendChild(trail);

  setTimeout(() => trail.remove(), 600);
});

let lastTime = 0;

document.addEventListener("mousemove", (e) => {
  const now = Date.now();

  // limita a criação (1 a cada 30ms)
  if (now - lastTime < 30) return;
  lastTime = now;

  const trail = document.createElement("div");
  trail.className = "trail";

  trail.style.left = e.clientX + "px";
  trail.style.top = e.clientY + "px";

  document.body.appendChild(trail);

  setTimeout(() => trail.remove(), 500);
});
