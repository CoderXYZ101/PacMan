const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 16;
const ROWS = 31;
const COLS = 28;

let pacman = {
  x: 14 * TILE_SIZE,
  y: 23 * TILE_SIZE,
  dx: 0,
  dy: 0,
  speed: 2,
  radius: 7,
  angle: 0,
};

const maze = [
  // Simplified layout: W = wall, . = dot, space = empty
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW",
  "W............WW............W",
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W",
  "W*WWWW.WWWWW.WW.WWWWW.WWWW*W",
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W",
  "W..........................W",
  "W.WWWW.WW.WWWWWWWW.WW.WWWW.W",
  "W.WWWW.WW.WWWWWWWW.WW.WWWW.W",
  "W......WW....WW....WW......W",
  "WWWWWW.WWWWW WW WWWWW.WWWWWW",
  "     W.WWWWW WW WWWWW.W     ",
  "     W.WW          WW.W     ",
  "     W.WW WWW  WWW WW.W     ",
  "WWWWWW.WW W      W WW.WWWWWW",
  "      .   W      W   .      ",
  "WWWWWW.WW W      W WW.WWWWWW",
  "     W.WW WWWWWWWW WW.W     ",
  "     W.WW          WW.W     ",
  "     W.WW WWWWWWWW WW.W     ",
  "WWWWWW.WW WWWWWWWW WW.WWWWWW",
  "W............WW............W",
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W",
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W",
  "W*..WW................WW..*W",
  "WWW.WW.WW.WWWWWWWW.WW.WW.WWW",
  "WWW.WW.WW.WWWWWWWW.WW.WW.WWW",
  "W......WW....WW....WW......W",
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W",
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W",
  "W..........................W",
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW",
];

function drawMaze() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = maze[row][col];
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      if (tile === "W") {
        ctx.fillStyle = "blue";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (tile === ".") {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 2, 0, 2 * Math.PI);
        ctx.fill();
      } else if (tile === "*") {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}

function drawPacman() {
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(pacman.x, pacman.y, pacman.radius, pacman.angle + 0.2, pacman.angle + Math.PI * 2 - 0.2);
  ctx.lineTo(pacman.x, pacman.y);
  ctx.fill();
}

function update() {
  pacman.x += pacman.dx * pacman.speed;
  pacman.y += pacman.dy * pacman.speed;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawPacman();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', (e) => {
  if (e.key === "ArrowUp") {
    pacman.dy = -1; pacman.dx = 0; pacman.angle = 1.5 * Math.PI;
  } else if (e.key === "ArrowDown") {
    pacman.dy = 1; pacman.dx = 0; pacman.angle = 0.5 * Math.PI;
  } else if (e.key === "ArrowLeft") {
    pacman.dx = -1; pacman.dy = 0; pacman.angle = Math.PI;
  } else if (e.key === "ArrowRight") {
    pacman.dx = 1; pacman.dy = 0; pacman.angle = 0;
  }
});

loop();


let score = 0;
const ghosts = [
  { x: 13 * TILE_SIZE, y: 11 * TILE_SIZE, color: 'red', dx: 1, dy: 0 },
  { x: 14 * TILE_SIZE, y: 11 * TILE_SIZE, color: 'pink', dx: -1, dy: 0 },
];

function drawGhosts() {
  ghosts.forEach(ghost => {
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(ghost.x, ghost.y, pacman.radius, 0, 2 * Math.PI);
    ctx.fill();
  });
}

function moveGhosts() {
  ghosts.forEach(ghost => {
    ghost.x += ghost.dx;
    ghost.y += ghost.dy;
    // Basic bounce on walls
    if (Math.random() < 0.01) {
      let temp = ghost.dx;
      ghost.dx = ghost.dy;
      ghost.dy = -temp;
    }
  });
}

function checkCollisions() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = maze[row][col];
      const x = col * TILE_SIZE + TILE_SIZE / 2;
      const y = row * TILE_SIZE + TILE_SIZE / 2;
      const dist = Math.hypot(pacman.x - x, pacman.y - y);
      if ((tile === '.' || tile === '*') && dist < TILE_SIZE / 2) {
        maze[row] = maze[row].substring(0, col) + ' ' + maze[row].substring(col + 1);
        score += tile === '.' ? 10 : 50;
        playSound('eat');
      }
    }
  }

  ghosts.forEach(ghost => {
    if (Math.hypot(pacman.x - ghost.x, pacman.y - ghost.y) < TILE_SIZE) {
      playSound('death');
      alert('Game Over! Final Score: ' + score);
      document.location.reload();
    }
  });
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText('Score: ' + score, 10, canvas.height - 10);
}

function playSound(type) {
  const audio = new Audio(type === 'eat' ? 'eat.wav' : 'death.wav');
  audio.play();
}

// Add to existing update and draw loop
const originalUpdate = update;
update = function() {
  originalUpdate();
  moveGhosts();
  checkCollisions();
};

const originalDraw = draw;
draw = function() {
  originalDraw();
  drawGhosts();
  drawScore();
};


let fruit = {
  x: 13 * TILE_SIZE,
  y: 17 * TILE_SIZE,
  visible: true,
  image: null
};

fruit.image = new Image();
fruit.image.src = 'cherry.png';

function drawFruit() {
  if (fruit.visible) {
    ctx.drawImage(fruit.image, fruit.x - TILE_SIZE / 2, fruit.y - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
  }
}

function checkFruitCollision() {
  if (fruit.visible && Math.hypot(pacman.x - fruit.x, pacman.y - fruit.y) < TILE_SIZE) {
    score += 100;
    fruit.visible = false;
    playSound('eat');
  }
}

// Add to update and draw
const oldUpdate = update;
update = function () {
  oldUpdate();
  checkFruitCollision();
};

const oldDraw = draw;
draw = function () {
  oldDraw();
  drawFruit();
};
