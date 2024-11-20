let imgPaths = [
  'https://deckard.openprocessing.org/user482283/visual2451383/h02e16ffa13a74e43ec706744a2c9a236/%E8%B3%B4%E6%B8%85%E5%BE%B7%E7%B8%BD%E7%B5%B1_1.jpg',
  'https://deckard.openprocessing.org/user482283/visual2456276/hf346e93cbff9e95cb2ae45ced271c0b5/%E8%94%A3%E4%B8%AD%E6%AD%A3%E8%82%96%E5%83%8F(%E4%B8%8A%E8%89%B2).jpg',
  'https://deckard.openprocessing.org/user482283/visual2456276/hf346e93cbff9e95cb2ae45ced271c0b5/images.jpeg'
];
imgIndex = 0;
let img;
const particles = [];
let scatter = false; // 控制是否進入散去階段
let timer = 0; // 計時器
let loadingNextImage = false; // 防止重複載入圖片
const FORMATION_TIME = 300; // 形成階段持續時間（幀數）
const SCATTER_START_TIME = 500; // 散去階段開始時間（幀數）
const PARTICLE_FADE_RATE = 0.02; // 粒子縮小速度

function preload() {
  img = loadImage(imgPaths[imgIndex], () => console.log('Initial image loaded.'));
}

function setup() {
  createCanvas(600, 600);
  colorMode(RGB);
  background(0);
  initializeParticles();
}

function initializeParticles() {
  particles.length = 0;
  scatter = false;
  timer = 0;
  loadingNextImage = false; // 重置旗標

  if (img) {
    img.resize(width, height);

    for (let x = 0; x <= width; x += 5) {
      for (let y = 0; y <= height; y += 5) {
        let targetColor = img.get(x, y);
        let brightnessValue = brightness(targetColor);
        particles.push({
          x: random(width),
          y: random(height),
          targetX: x,
          targetY: y,
          size: map(brightnessValue, 0, 100, 2, 6),
          clr: color(targetColor),
          baseSpeed: random(0.02, 0.05),
          scatterX: noise(x * 0.1, y * 0.1) * 10 - 5,
          scatterY: noise(x * 0.1 + 1000, y * 0.1 + 1000) * 10 - 5,
        });
      }
    }
  }
}

function draw() {
  background(0, 20);
  timer++;

  const speedFactor = min(1, timer / FORMATION_TIME);

  noStroke();
  for (const p of particles) {
    fill(p.clr);
    circle(p.x, p.y, p.size);

    if (!scatter) {
      let speed = p.baseSpeed * speedFactor;
      p.x += (p.targetX - p.x) * speed;
      p.y += (p.targetY - p.y) * speed;

      if (timer > SCATTER_START_TIME) {
        scatter = true;
      }
    } else {
      p.x += p.scatterX * 0.1;
      p.y += p.scatterY * 0.1;
      p.size = max(0, p.size - PARTICLE_FADE_RATE);
    }
  }

  // 當粒子完全消失且未處於圖片切換中時，切換到下一張圖片
  if (scatter && particles.every(p => p.size <= 0) && !loadingNextImage) {
    loadNextImage();
  }
}

function loadNextImage() {
  loadingNextImage = true; 
  imgIndex = (imgIndex + 1) % imgPaths.length;

  loadImage(imgPaths[imgIndex], (loadedImg) => {
    img = loadedImg;
    console.log('Loaded new image:', imgPaths[imgIndex]);
    initializeParticles();
  });
}
