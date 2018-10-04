Asteroids = {

  minShipsPerWave : 3,
  maxShipsPerWave : 5,
  startSize : 128,

  createTexture : function(seed, damage, size) {
    var colors = Ships.colors.brown;
    size = Math.round(size * scalingFactor) % 2 === 0 ? Math.round(size * scalingFactor) : Math.round(size * scalingFactor) + 1;
    Math.seedrandom(seed);
    var shipLines = 23;
    var shipCanvas = document.createElement('canvas');
    shipCanvas.width = size;
    shipCanvas.height = size;
    var shipctx = shipCanvas.getContext('2d');

    // shipctx.lineWidth = Math.min(Math.max(1,Math.floor(size / PlayerShip.SHIP_SIZE)), 5);
    shipctx.lineWidth = scalingFactor;

    var shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = size + 2;
    shadowCanvas.height = size + 2;
    var shadowCtx = shadowCanvas.getContext('2d');
    shadowCtx.save();
    shadowCtx.shadowBlur = 5 * scalingFactor;

    var shadowColor = hexToRgb(colors[colors.length-1]);
    shadowColor = "rgb(" + Math.round(shadowColor.r * (0.5 + Math.random() * 0.2)) + "," + Math.round(shadowColor.g * (0.5 + Math.random() * 0.2)) + "," + Math.round(shadowColor.b * (0.5 + Math.random() * 0.2)) + ")";

    shadowCtx.shadowColor = shadowColor;
    shadowCtx.fillStyle = shadowColor;
    shadowCtx.beginPath();

    shipctx.shadowBlur = shipctx.lineWidth;
    shipctx.shadowColor = colors[Math.round(colors.length / 2)];

    var approxPositions = [
      {x:0.5,y:0.1},
      {x:0.77,y:0.22},
      {x:0.9,y:0.5},
      {x:0.77,y:0.77},
      {x:0.5,y:0.9},
      {x:0.22,y:0.77},
      {x:0.1,y:0.5},
      {x:0.22,y:0.22}
    ];

    var currentPos = 0;
    var colorindex = 3;
    var xRandom = 0;

    var posMod = function(pos) {
      return pos - 0.1 + Math.random() * 0.2;
    };

    var lastX = posMod(approxPositions[currentPos].x) * size;
    var lastY = posMod(approxPositions[currentPos].y) * size;
    currentPos++;

    var endX = lastX;
    var endY = lastY;

    shadowCtx.moveTo(1 + lastX, 1 + lastY);

    for (var i = 0; i < shipLines; i++) {

      nextXLoc = posMod(approxPositions[currentPos].x) * size;
      nextYLoc = posMod(approxPositions[currentPos].y) * size;

      drawline(shipctx, damage ? "#FFFFFF" : colors[colorindex], lastX, lastY, nextXLoc, nextYLoc);
      shadowCtx.lineTo(1 + nextXLoc, 1 + nextYLoc);

      lastX = nextXLoc;
      lastY = nextYLoc;

      colorindex++;
      if (colorindex >= colors.length - 1)
          colorindex = 3;

      currentPos++;
      if (currentPos >= approxPositions.length)
        currentPos = 0;
    }

    drawline(shipctx, damage ? "#FFFFFF" : colors[colorindex], nextXLoc, nextYLoc, endX, endY);
    shadowCtx.lineTo(1 + endX, 1 + endY);

    shadowCtx.fill();
    shadowCtx.fill();
    shadowCtx.fill();
    shadowCtx.restore();
    shadowCtx.drawImage(shipCanvas,1,1,size,size);
    return glowTexture(PIXI.Texture.fromCanvas(shadowCanvas), {blurAmount: 1});
  },

  sizeTextures : [],
  sizeGranularity : 8,
  seed : Date.now(),
  getASizedTexture : function(size) {

    if (!this.sizeTextures[Math.round(size / this.sizeGranularity)]) {
      this.seed++;
      this.sizeTextures[Math.round(size / this.sizeGranularity)] = {texture:Asteroids.createTexture(this.seed, false, size), damageTexture:Asteroids.createTexture(this.seed, true, size)};
    }

    return this.sizeTextures[Math.round(size / this.sizeGranularity)];
  },

  deleteTextures : function() {
    for (var i = 0; i < this.sizeTextures.length; i++) {
      if (this.sizeTextures[i]) {
        this.sizeTextures[i].texture.destroy(true);
        this.sizeTextures[i].damageTexture.destroy(true);
      }
    }
    this.sizeTextures = [];
  }
};

Asteroids.wave = function() {

  this.shipsInWave = Asteroids.minShipsPerWave + Math.round(Math.random() * (Asteroids.maxShipsPerWave - Asteroids.minShipsPerWave) * Enemies.difficultyFactor);
  this.shipsDestroyed = 0;
  this.colors = Ships.colors.brown;

  this.asteroidWave = true;

  this.shipHealth = EnemyShips.shipHealth * 2.5;

  // var seed = Date.now();

  this.texture = Asteroids.createTexture(this.seed, false, 20);
  this.spritePool = new SpritePool(this.texture, backgroundEnemyContainer);
  this.spritePool.container.visible = false;

  this.ships = [];
  this.newAsteroids = [];
  var offset = Math.round(Asteroids.startSize / 2);

  for (var i = 0; i < this.shipsInWave; i++) {
    this.ships.push(new Asteroids.asteroid(this, 128 + Math.random() * 64, offset + (canvasWidth - offset) * Math.random(), -25 -offset - Math.random() * 200));
  }
  this.shipsExited = 0;

  this.destroy = function() {
    this.spritePool.destroy(true);
    this.finished = true;
  };
};

Asteroids.wave.prototype.update = function(timeDiff) {
  for (var i = 0; i < this.newAsteroids.length; i++) {
    this.ships.push(this.newAsteroids[i]);
  }

  this.newAsteroids = [];

  this.finished = true;

  for (var j = 0; j < this.ships.length; j++) {
    this.ships[j].update(timeDiff);
    if (this.ships[j].inPlay)
      this.finished = false;
  }

  if (this.finished) {
    this.destroy(true);
  }
};

Asteroids.asteroid = function(wave, size, x, y) {
  this.wave = wave;
  this.size = size;
  this.offset = Math.round(size / 2.5);

  var factor = this.size / Asteroids.startSize;

  this.xLoc = x;
  this.yLoc = y;

  this.xSpeed = (-20 + Math.random() * 40) * Math.min(1 / factor, 2);
  this.ySpeed = (40 + Math.random() * 20) * Math.min(1 / factor, 1.6);

  this.health = wave.shipHealth * Enemies.difficultyFactor * factor;
  this.inPlay = 1;
  this.enemyShip = true;
  this.rotation=Math.random() * 2 * Math.PI;
  this.rotationSpeed = -0.3 + Math.random() * 0.6;

  this.allDeadSurvivalTime = Math.random() * 1000;
  this.id = Enemies.currShipId++;

  var textures = Asteroids.getASizedTexture(size);
  this.normalTexture = textures.texture;
  this.damageTexture = textures.damageTexture;

  this.sprite = wave.spritePool.nextSprite();
  this.sprite.texture = this.normalTexture;
  this.sprite.visible = true;
  this.sprite.tint = 0xFFFFFF;
  // this.sprite.scale.x = this.sprite.scale.y = factor;
  this.sprite.scale.x = this.sprite.scale.y = 1;
  this.sprite.position.x = this.xLoc * scalingFactor;
  this.sprite.position.y = this.yLoc * scalingFactor;
  this.sprite.anchor = {x:0.5,y:0.5};
  this.sprite.rotation = -this.rotation;
};

Asteroids.asteroid.prototype.detectAsteroidCollision = function(asteroid) {
  if (this.inPlay === 1 && asteroid.inPlay === 1 && distanceBetweenPoints(this.xLoc, this.yLoc, asteroid.xLoc, asteroid.yLoc) < this.offset + asteroid.offset)
    return true;
  return false;
};

Asteroids.asteroid.prototype.update = function(timeDiff) {
  if (this.inPlay) {

    Enemies.activeShips.push(this);

    if (this.yLoc + this.offset > PlayerShip.playerShip.yLoc && this.ySpeed < 100) {
      this.ySpeed += 10 * timeDiff;
    }
    this.xLoc += this.xSpeed * timeDiff;
    if (this.ySpeed < 40) {
      this.ySpeed += 20 * timeDiff;
    }
    this.yLoc += this.ySpeed * timeDiff;
    this.rotation += this.rotationSpeed * timeDiff;

    if (this.xLoc < 0 || this.xLoc > canvasWidth)
      this.xSpeed *= -1;

    if (this.yLoc > canvasHeight + this.offset) {
      this.inPlay = 0;
      this.wave.shipsExited++;
      this.wave.spritePool.discardSprite(this.sprite);
    }

    // check for collisions with other asteroids in this wave
    for (var i = 0; i < Enemies.activeWaves.length; i++) {
      if (Enemies.activeWaves[i].asteroidWave) {
        for (var j = 0; j < Enemies.activeWaves[i].ships.length; j++) {
          var asteroidToCheck = Enemies.activeWaves[i].ships[j];
          if (this.id !== asteroidToCheck.id) {
            if (this.detectAsteroidCollision(asteroidToCheck)) {

              if (this.xLoc < asteroidToCheck.xLoc) {
                this.xSpeed = -1 * Math.abs(this.xSpeed);
                asteroidToCheck.xSpeed = Math.abs(asteroidToCheck.xSpeed);
              } else {
                this.xSpeed = Math.abs(this.xSpeed);
                asteroidToCheck.xSpeed = -1 * Math.abs(asteroidToCheck.xSpeed);
              }

              if (this.yLoc < asteroidToCheck.yLoc && this.ySpeed > asteroidToCheck.ySpeed) {
                var speed = this.ySpeed;
                this.ySpeed = asteroidToCheck.ySpeed;
                asteroidToCheck.ySpeed = speed;
              }

            }
          }
        }
      }
    }

    this.sprite.position.x = this.xLoc * scalingFactor;
    this.sprite.position.y = this.yLoc * scalingFactor;
    this.sprite.rotation = -this.rotation;

    this.lastDamaged += timeDiff;

    if (this.lastDamaged > 0.05)
      this.sprite.texture = this.normalTexture;

    EnemyShips.checkForPlayerCollision(this, timeDiff);

    if (this.health < this.wave.shipHealth)
      this.sprite.tint = calculateTint(this.health / this.wave.shipHealth);

  }
};

Asteroids.asteroid.prototype.destroy = function() {
  stageSprite.screenShake += gameModel.maxScreenShake;
  this.inPlay = 0;
  this.wave.spritePool.discardSprite(this.sprite);
  this.wave.shipsDestroyed++;

  Talents.enemyDestroyed();

  if (this.size > 64) {
    this.wave.newAsteroids.push(
      new Asteroids.asteroid(this.wave, this.size / 1.5, this.xLoc - (this.offset / 2), this.yLoc - (this.offset / 2) + Math.random() * this.offset),
      new Asteroids.asteroid(this.wave, this.size / 1.5, this.xLoc + (this.offset / 2), this.yLoc - (this.offset / 2) + Math.random() * this.offset)
    );
  }

  MoneyPickup.newMoneyPickup(this.xLoc, this.yLoc, (this.wave.shipHealth + Math.random() * this.wave.shipHealth * 1.5), true);
  Ships.generateExplosion(this);
};

Asteroids.asteroid.prototype.detectCollision = function(xLoc, yLoc) {
  if (this.inPlay === 1 && distanceBetweenPoints(this.xLoc, this.yLoc, xLoc, yLoc) < this.offset) {
    return true;
  }
  return false;
};

Asteroids.asteroid.prototype.damage = function (xLoc, yLoc, inputDamage, noEffect) {
  if (this.health > 0) {

    var damage = Talents.enemyDamaged(inputDamage, xLoc, yLoc);

    var isCrit = Math.random() < getCritChance();
		if (isCrit) {
			damage *= getCritDamage();
		}

    if (!noEffect) {
      Bullets.generateExplosion(xLoc, yLoc);
      Sounds.enemyDamage.play();
      this.sprite.texture = this.damageTexture;
      this.lastDamaged = 0;
      Ships.fragments.newFragment(xLoc, yLoc, this.wave.colors, 100 + Math.random() * 50);

      var bumpSpeedX = this.xLoc - xLoc;
      var bumpSpeedY = this.yLoc - yLoc;
      var bumpMagMulti = ((damage / this.wave.shipHealth) * 50) / (magnitude(bumpSpeedX, bumpSpeedY) || 1);
      this.xSpeed += bumpSpeedX * bumpMagMulti;
      this.ySpeed += bumpSpeedY * bumpMagMulti;
    }

    this.health -= damage;

    GameText.damage.newText(damage, this, isCrit && !noEffect);

    if (this.wave) {
      var percentOfShipDamaged = damage / this.wave.shipHealth;
      stageSprite.screenShake += gameModel.maxScreenShake * percentOfShipDamaged;
    }

    if (this.health <= 0) {
      this.destroy(this);
    }
  }
};
