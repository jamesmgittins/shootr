Asteroids = {



  minShipsPerWave : 3,
  maxShipsPerWave : 6,
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

    lastX = posMod(approxPositions[currentPos].x) * size;
    lastY = posMod(approxPositions[currentPos].y) * size;
    currentPos++;

    var endX = lastX;
    var endY = lastY;

    shadowCtx.moveTo(1 + lastX, 1 + lastY);

    for (var i = 0; i < shipLines; i++) {

      nextXLoc = posMod(approxPositions[currentPos].x) * size;
      nextYLoc = posMod(approxPositions[currentPos].y) * size;

      drawline(shipctx, damage ? "#FFFFFF" : colors[colorindex], lastX, lastY, nextXLoc, nextYLoc);

      shadowCtx.lineTo(1 + nextXLoc, 1 + nextYLoc);

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
    return glowTexture(PIXI.Texture.fromCanvas(shadowCanvas), {blurAmount: 0.7});
  },


  numTextures : 8,
  textureCounter : 0,
  getATexture : function() {
    if (!Asteroids.textures) {
      var seed = Date.now();
      Asteroids.textures = [];
      for (var i =0; i < Asteroids.numTextures * gameModel.detailLevel; i++) {
        seed++;
        Asteroids.textures.push(
          {
            texture:Asteroids.createTexture(seed, false, 128),
            damageTexture:Asteroids.createTexture(seed, true, 128)
          }
        );
      }
    }
    Asteroids.textureCounter++;
    if (Asteroids.textureCounter >= Asteroids.textures.length)
      Asteroids.textureCounter = 0;

    return Asteroids.textures[Asteroids.textureCounter];
  },



  wave : function() {
    this.update = Asteroids.updateWave;

    this.shipsInWave = Asteroids.minShipsPerWave + Math.round(Math.random() * (Asteroids.maxShipsPerWave - Asteroids.minShipsPerWave) * Enemies.difficultyFactor);
    this.shipsDestroyed = 0;
    this.colors = Ships.colors.brown;

    this.asteroidWave = true;

    this.shipHealth = EnemyShips.shipHealth * 3;

    var seed = Date.now();

    this.texture = Asteroids.getATexture().texture;
    this.spritePool = SpritePool.create(this.texture, backgroundEnemyContainer);

    this.ships = [];
    this.newAsteroids = [];
    var offset = Math.round(Asteroids.startSize / 2);

    for (var i = 0; i < this.shipsInWave; i++) {
      this.ships.push(new Asteroids.asteroid(this, 128 + Math.random() * 64, offset + (canvasWidth - offset) * Math.random(), -offset - Math.random() * 200));
    }
    this.shipsExited = 0;
  },



  asteroid : function(wave, size, x, y) {

    this.damage = Asteroids.damageAsteroid;
    this.destroy = Asteroids.destroy;
    this.detectCollision = Asteroids.detectCollision;

    this.wave = wave;
    this.size = size;
    this.offset = Math.round(size / 2.5);

    var factor = this.size / Asteroids.startSize;

    this.xLoc = x;
    this.yLoc = y;

    this.xSpeed = (-20 + Math.random() * 40) * (1 / factor);
    this.ySpeed = (40 + Math.random() * 20) * (1 / factor);
    this.maxSpeed = 0;

    this.health = wave.shipHealth * Enemies.difficultyFactor * factor;
    this.inPlay = 1;
    this.enemyShip = true;
    this.rotation=Math.random() * 2 * Math.PI;
    this.rotationSpeed = -0.3 + Math.random() * 0.6;

    this.allDeadSurvivalTime = Math.random() * 1000;
    this.id = EnemyShips.currShipId++;

    var textures = Asteroids.getATexture();
    this.normalTexture = textures.texture;
    this.damageTexture = textures.damageTexture;

    this.sprite = wave.spritePool.nextSprite();
    this.sprite.texture = this.normalTexture;
    this.sprite.visible = true;
    this.sprite.tint = 0xFFFFFF;
    this.sprite.scale.x = this.sprite.scale.y = factor;
    this.sprite.position.x = this.xLoc * scalingFactor;
    this.sprite.position.y = this.yLoc * scalingFactor;
    this.sprite.anchor = {x:0.5,y:0.5};
    this.sprite.rotation = -this.rotation;

    Enemies.enemiesSpawned++;
  },



  updateWave : function(timeDiff) {

    for (var i = 0; i < this.newAsteroids.length; i++) {
      this.ships.push(this.newAsteroids[i]);
    }

    this.newAsteroids = [];

    this.finished = true;

    for (var j = 0; j < this.ships.length; j++) {
      Asteroids.updateAsteroid(this.ships[j],timeDiff);
      if (this.ships[j].inPlay)
        this.finished = false;
    }

    if (this.finished) {
      this.spritePool.destroy();
    }
  },

  updateAsteroid : function(asteroid, timeDiff) {

    if (asteroid.inPlay) {

			Enemies.activeShips.push(asteroid);

      if (asteroid.yLoc + asteroid.offset > PlayerShip.playerShip.yLoc && asteroid.ySpeed < 100) {
        asteroid.ySpeed += 20 * timeDiff;
      }
      asteroid.xLoc += asteroid.xSpeed * timeDiff;
      asteroid.yLoc += asteroid.ySpeed * timeDiff;
      asteroid.rotation += asteroid.rotationSpeed * timeDiff;

      if (asteroid.xLoc < 0 || asteroid.xLoc > canvasWidth)
        asteroid.xSpeed *= -1;

      if (asteroid.yLoc > canvasHeight + asteroid.offset) {
        asteroid.inPlay = 0;
        asteroid.wave.shipsExited++;
        asteroid.wave.spritePool.discardSprite(asteroid.sprite);
      }

      // check for collisions with other asteroids in this wave
      for (var i = 0; i < Enemies.activeWaves.length; i++) {
        if (Enemies.activeWaves[i].asteroidWave) {
          for (var j = 0; j < Enemies.activeWaves[i].ships.length; j++) {
            var asteroidToCheck = Enemies.activeWaves[i].ships[j];
            if (asteroid.id !== asteroidToCheck.id) {
              if (Asteroids.detectAsteroidCollision(asteroid, asteroidToCheck)) {

                if (asteroid.xLoc < asteroidToCheck.xLoc) {
                  asteroid.xSpeed = -1 * Math.abs(asteroid.xSpeed);
                  asteroidToCheck.xSpeed = Math.abs(asteroidToCheck.xSpeed);
                } else {
                  asteroid.xSpeed = Math.abs(asteroid.xSpeed);
                  asteroidToCheck.xSpeed = -1 * Math.abs(asteroidToCheck.xSpeed);
                }

                if (asteroid.yLoc < asteroidToCheck.yLoc && asteroid.ySpeed > asteroidToCheck.ySpeed) {
                  var speed = asteroid.ySpeed;
                  asteroid.ySpeed = asteroidToCheck.ySpeed;
                  asteroidToCheck.ySpeed = speed;
                }

              }
            }
          }
        }
      }

      asteroid.sprite.position.x = asteroid.xLoc * scalingFactor;
      asteroid.sprite.position.y = asteroid.yLoc * scalingFactor;
      asteroid.sprite.rotation = -asteroid.rotation;

      asteroid.lastDamaged += timeDiff;

      if (asteroid.lastDamaged > 0.05)
        asteroid.sprite.texture = asteroid.normalTexture;

      EnemyShips.checkForPlayerCollision(asteroid, timeDiff);

      if (asteroid.health < asteroid.wave.shipHealth)
        asteroid.sprite.tint = calculateTint(asteroid.health / asteroid.wave.shipHealth);

  	}
  },



  generateExplosion: function(asteroid) {
    Ships.generateExplosion(asteroid);
  },


  destroy : function (asteroid) {

  	stageSprite.screenShake += gameModel.maxScreenShake;
  	asteroid.inPlay = 0;

  	Enemies.enemiesKilled++;

		asteroid.wave.spritePool.discardSprite(asteroid.sprite);
		asteroid.wave.shipsDestroyed++;

    if (asteroid.size > 64) {
      asteroid.wave.newAsteroids.push(
        new Asteroids.asteroid(asteroid.wave, asteroid.size / 1.5, asteroid.xLoc - (asteroid.offset / 2), asteroid.yLoc - (asteroid.offset / 2) + Math.random() * asteroid.offset),
        new Asteroids.asteroid(asteroid.wave, asteroid.size / 1.5, asteroid.xLoc + (asteroid.offset / 2), asteroid.yLoc - (asteroid.offset / 2) + Math.random() * asteroid.offset)
      );
    }

		MoneyPickup.newMoneyPickup(asteroid.xLoc, asteroid.yLoc, (asteroid.wave.shipHealth + Math.random() * asteroid.wave.shipHealth * 2), true);

  	Sounds.shipExplosion.play();
  	Asteroids.generateExplosion(asteroid);
  },



  detectCollision : function (asteroid, xLoc, yLoc) {
    if (asteroid.inPlay === 1 && distanceBetweenPoints(asteroid.xLoc, asteroid.yLoc, xLoc, yLoc) < asteroid.offset) {
  		return true;
  	}
  	return false;
  },



  detectAsteroidCollision : function(asteroid1, asteroid2) {
    if (asteroid1.inPlay === 1 && asteroid2.inPlay === 1 && distanceBetweenPoints(asteroid1.xLoc, asteroid1.yLoc, asteroid2.xLoc, asteroid2.yLoc) < asteroid1.offset + asteroid2.offset)
      return true;
    return false;
  },


  damageAsteroid : function(xLoc, yLoc, damage, noEffect) {
  	if (this.health > 0) {

  		if (!noEffect) {
  			Bullets.generateExplosion(xLoc, yLoc);
  			Sounds.enemyDamage.play();
  			this.sprite.texture = this.damageTexture;
  			this.lastDamaged = 0;
        Ships.fragments.newFragment(xLoc, yLoc, this.wave.colors, 100 + Math.random() * 50);
  		}

  		this.health -= damage;

  		GameText.damage.newText(damage, this);

  		if (this.wave) {
  			var percentOfShipDamaged = damage / this.wave.shipHealth;

  			stageSprite.screenShake += gameModel.maxScreenShake * percentOfShipDamaged;

  			if (this.health + damage > this.wave.shipHealth / 2 && this.health < this.wave.shipHealth / 2) {
  				this.maxSpeed *= 0.90;
  			}
  		}

  		if (this.health <= 0) {
  			this.destroy(this);
  		}
  	}
  }


};
