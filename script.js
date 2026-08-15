const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');

// Configurações do Jogo
let score = 0;
let lives = 3;
let gameOver = false;
let gameWon = false;

// Configurações da Raquete (Barra)
const paddle = {
  width: 100,
  height: 15,
  x: canvas.width / 2 - 50,
  y: canvas.height - 25,
  speed: 7,
  dx: 0,
  color: '#4cc9f0'
};

// Configurações da Bola
const ball = {
  x: canvas.width / 2,
  y: canvas.height - 40,
  radius: 8,
  speed: 4,
  dx: 4 * (Math.random() < 0.5 ? 1 : -1),
  dy: -4,
  color: '#f72585'
};

// Configurações dos Blocos
const brickRowCount = 5;
const brickColumnCount = 8;
const brickPadding = 10;
const brickOffsetTop = 40;
const brickOffsetLeft = 35;
const brickWidth = 55;
const brickHeight = 20;

const colors = ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557'];

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1, color: colors[r] };
  }
}

// Sistema de Power-ups
const powerUps = [];
const powerUpTypes = {
  expandPaddle: { name: 'Raquete Maior', icon: '▪', color: '#FFD60A', duration: 5000 },
  shrinkBall: { name: 'Desaceleração', icon: '●', color: '#06D6A0', duration: 5000 },
  expandBall: { name: 'Bola Maior', icon: '◉', color: '#EF476F', duration: 5000 },
  slowBall: { name: 'Bola Lenta', icon: '◎', color: '#00BBF9', duration: 5000 },
  extraLife: { name: 'Vida Extra', icon: '❤', color: '#FF006E', duration: 0 }
};

function createPowerUp(x, y) {
  const types = Object.keys(powerUpTypes);
  const randomType = types[Math.floor(Math.random() * types.length)];
  
  powerUps.push({
    x: x,
    y: y,
    type: randomType,
    width: 20,
    height: 20,
    dy: 2,
    active: true
  });
}

function drawPowerUps() {
  for (let i = 0; i < powerUps.length; i++) {
    const p = powerUps[i];
    if (p.active) {
      const typeInfo = powerUpTypes[p.type];
      ctx.fillStyle = typeInfo.color;
      ctx.fillRect(p.x, p.y, p.width, p.height);
      
      // Desenhar ícone
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typeInfo.icon, p.x + p.width / 2, p.y + p.height / 2);
    }
  }
}

function movePowerUps() {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i];
    if (p.active) {
      p.y += p.dy;
      
      // Remove se sair da tela
      if (p.y > canvas.height) {
        powerUps.splice(i, 1);
      }
    }
  }
}

function checkPowerUpCollision() {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i];
    if (p.active && 
        p.x < paddle.x + paddle.width &&
        p.x + p.width > paddle.x &&
        p.y < paddle.y + paddle.height &&
        p.y + p.height > paddle.y) {
      
      applyPowerUp(p.type);
      powerUps.splice(i, 1);
    }
  }
}

function applyPowerUp(type) {
  const originalPaddleWidth = 100;
  const originalBallRadius = 8;
  const originalBallSpeed = 4;
  
  switch(type) {
    case 'expandPaddle':
      paddle.width = 150;
      setTimeout(() => { paddle.width = originalPaddleWidth; }, 5000);
      break;
      
    case 'shrinkBall':
      ball.dx *= 0.7;
      ball.dy *= 0.7;
      setTimeout(() => {
        ball.dx /= 0.7;
        ball.dy /= 0.7;
      }, 5000);
      break;
      
    case 'expandBall':
      ball.radius = 12;
      setTimeout(() => { ball.radius = originalBallRadius; }, 5000);
      break;
      
    case 'slowBall':
      ball.dx *= 0.5;
      ball.dy *= 0.5;
      setTimeout(() => {
        ball.dx /= 0.5;
        ball.dy /= 0.5;
      }, 5000);
      break;
      
    case 'extraLife':
      lives++;
      livesDisplay.textContent = lives;
      break;
  }
  
  score += 50;
  scoreDisplay.textContent = score;
}

// Controles por teclado
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
// Controle por mouse
document.addEventListener('mousemove', mouseMoveHandler);

function keyDownHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    paddle.dx = paddle.speed;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    paddle.dx = -paddle.speed;
  }
}

function keyUpHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'Left' || e.key === 'ArrowLeft') {
    paddle.dx = 0;
  }
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddle.x = relativeX - paddle.width / 2;
  }
}

// Desenhar a Raquete
function drawPaddle() {
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 5);
  ctx.fillStyle = paddle.color;
  ctx.fill();
  ctx.closePath();
}

// Desenhar a Bola
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.closePath();
}

// Desenhar os Blocos
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        ctx.beginPath();
        ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 3);
        ctx.fillStyle = bricks[c][r].color;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// Detectar Colisão da Bola com os Blocos
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          ball.x > b.x &&
          ball.x < b.x + brickWidth &&
          ball.y > b.y &&
          ball.y < b.y + brickHeight
        ) {
          ball.dy = -ball.dy;
          b.status = 0;
          score += 10;
          scoreDisplay.textContent = score;

          // Gerar power-up (30% de chance)
          if (Math.random() < 0.3) {
            createPowerUp(b.x + brickWidth / 2, b.y + brickHeight / 2);
          }

          // Condição de Vitória
          if (score === brickRowCount * brickColumnCount * 10) {
            gameWon = true;
          }
        }
      }
    }
  }
}

// Mover os elementos e tratar colisões de borda
function move() {
  if (gameOver || gameWon) return;

  // Movimentação da raquete
  paddle.x += paddle.dx;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;

  // Movimentação dos power-ups
  movePowerUps();
  checkPowerUpCollision();

  // Movimentação da bola
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Colisão com paredes laterais
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }

  // Colisão com o teto
  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }
  // Colisão com a raquete
  else if (ball.y + ball.radius > paddle.y && ball.y - ball.radius < paddle.y + paddle.height) {
    if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
      // Muda a direção vertical e dá um efeito baseado em onde bateu na raquete
      let hitPoint = ball.x - (paddle.x + paddle.width / 2);
      ball.dx = hitPoint * 0.15;
      ball.dy = -Math.abs(ball.dy);
    }
  }

  // Colisão com o chão (Perde Vida)
  if (ball.y + ball.radius > canvas.height) {
    lives--;
    livesDisplay.textContent = lives;

    if (lives === 0) {
      gameOver = true;
    } else {
      // Reinicia a posição da bola e da raquete
      ball.x = canvas.width / 2;
      ball.y = canvas.height - 40;
      ball.dx = 4 * (Math.random() < 0.5 ? 1 : -1);
      ball.dy = -4;
      paddle.x = canvas.width / 2 - paddle.width / 2;
    }
  }

  collisionDetection();
}

// Desenhar mensagens na tela (Fim de Jogo ou Vitória)
function drawOverlay() {
  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 36px Segoe UI';
    ctx.fillStyle = '#f72585';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);

    ctx.font = '18px Segoe UI';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Pressione F5 para jogar novamente', canvas.width / 2, canvas.height / 2 + 30);
  } else if (gameWon) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 36px Segoe UI';
    ctx.fillStyle = '#4cc9f0';
    ctx.textAlign = 'center';
    ctx.fillText('VOCÊ VENCEU!', canvas.width / 2, canvas.height / 2 - 10);

    ctx.font = '18px Segoe UI';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Pressione F5 para jogar novamente', canvas.width / 2, canvas.height / 2 + 30);
  }
}

// Loop Principal do Jogo
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPowerUps();
  drawPaddle();
  drawOverlay();

  move();

  requestAnimationFrame(update);
}

// Iniciar o jogo
update();
