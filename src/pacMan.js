import movingDirection from "./movingDirection.js";

export default class pacMan {
  constructor(x, y, tileSize, velocity, tileMap) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.velocity = velocity;
    this.tileMap = tileMap;
    this.startX = x;
    this.startY = y;

    this.currentMovingDirection = null;
    this.requestedMovingDirection = null;
    this.pacManAnimationTimerDefault = 10;
    this.pacManAnimationTimer = null;
    this.pacManRotation = this.Rotation.right;
    this.wakaSound = new Audio("sound/waka.wav");
    this.powerDotSound = new Audio("sound/power_dot.wav");
    this.eatGhostSound = new Audio("sound/eat_ghost.wav");

    this.powerDotActive = false;
    this.powerDotAboutToExpire = false;
    this.timers = [];
    this.madeFirstMove = false;

    document.addEventListener("keydown", this.keydown);
    this.loadImages();
  }

  Rotation = {
    right: 0,
    down: 1,
    left: 2,
    up: 3
  }

  loadImages() {
    const i1 = new Image(); i1.src = "images/pac0.png";
    const i2 = new Image(); i2.src = "images/pac1.png";
    const i3 = new Image(); i3.src = "images/pac2.png";
    const i4 = new Image(); i4.src = "images/pac1.png";
    this.pacManImages = [i1, i2, i3, i4];
    this.pacManImageIndex = 0;
  }

  keydown = (event) => {
    const keyMap = {
      38: movingDirection.up, 87: movingDirection.up,
      40: movingDirection.down, 83: movingDirection.down,
      37: movingDirection.left, 65: movingDirection.left,
      39: movingDirection.right, 68: movingDirection.right
    };

    if (keyMap[event.keyCode] !== undefined) {
      this.requestedMovingDirection = keyMap[event.keyCode];
      this.madeFirstMove = true;
    }
  };

  draw(ctx, pause, enemies) {
    if (!pause) {
      this.move();
      this.animate();
    }
    this.eatDot();
    this.eatPowerDot();
    this.eatGhost(enemies);

    const size = this.tileSize / 2;
    ctx.save();
    ctx.translate(this.x + size, this.y + size);
    ctx.rotate((this.pacManRotation * 90 * Math.PI) / 180);
    ctx.drawImage(this.pacManImages[this.pacManImageIndex], -size, -size, this.tileSize, this.tileSize);
    ctx.restore();
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.currentMovingDirection = null;
    this.requestedMovingDirection = null;
    this.madeFirstMove = false;
    this.powerDotActive = false;
    this.powerDotAboutToExpire = false;
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  move() {
    if (this.currentMovingDirection !== this.requestedMovingDirection) {
      if (
        Number.isInteger(this.x / this.tileSize) &&
        Number.isInteger(this.y / this.tileSize) &&
        !this.tileMap.didCollideWithEnvironment(this.x, this.y, this.requestedMovingDirection)
      ) {
        this.currentMovingDirection = this.requestedMovingDirection;
      }
    }

    if (this.tileMap.didCollideWithEnvironment(this.x, this.y, this.currentMovingDirection)) {
      this.pacManAnimationTimer = null;
      this.pacManImageIndex = 1;
      return;
    } else if (this.currentMovingDirection != null && this.pacManAnimationTimer == null) {
      this.pacManAnimationTimer = this.pacManAnimationTimerDefault;
    }

    switch (this.currentMovingDirection) {
      case movingDirection.up: this.y -= this.velocity; this.pacManRotation = this.Rotation.up; break;
      case movingDirection.down: this.y += this.velocity; this.pacManRotation = this.Rotation.down; break;
      case movingDirection.left: this.x -= this.velocity; this.pacManRotation = this.Rotation.left; break;
      case movingDirection.right: this.x += this.velocity; this.pacManRotation = this.Rotation.right; break;
    }
  }

  animate() {
    if (this.pacManAnimationTimer == null) return;
    this.pacManAnimationTimer--;
    if (this.pacManAnimationTimer === 0) {
      this.pacManAnimationTimer = this.pacManAnimationTimerDefault;
      this.pacManImageIndex = (this.pacManImageIndex + 1) % this.pacManImages.length;
    }
  }

  eatDot() {
    if (this.tileMap.eatDot(this.x, this.y) && this.madeFirstMove) this.wakaSound.play();
  }

  eatPowerDot() {
    if (this.tileMap.eatPowerDot(this.x, this.y)) {
      this.powerDotSound.play();
      this.powerDotActive = true;
      this.powerDotAboutToExpire = false;
      this.timers.forEach(clearTimeout);
      this.timers = [];

      this.timers.push(setTimeout(() => {
        this.powerDotAboutToExpire = true;
      }, 3000));
      this.timers.push(setTimeout(() => {
        this.powerDotActive = false;
        this.powerDotAboutToExpire = false;
      }, 6000));
    }
  }

  eatGhost(enemies) {
    if (this.powerDotActive) {
      const hitEnemies = enemies.filter(e => e.collideWith(this));
      hitEnemies.forEach(e => {
        enemies.splice(enemies.indexOf(e), 1);
        this.eatGhostSound.play();
      });
    }
  }
}