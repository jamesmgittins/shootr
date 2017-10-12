var Squarepusher = {
	minShipsPerWave : 1,
	maxShipsPerWave : 1,
	waveBulletFrequency : 2,
	maxBulletsPerShot : 1,
	SHIP_SIZE : 64,
	spawnTime : 1.5,
	size : Constants.canvasWidth / 10,
	ySpeed : 50,
	xSpeed : 300
};



Squarepusher.getMirrorTexture = function(size, seed, colors, white) {
	size = Math.round(size * scalingFactor) % 2 === 0 ? Math.round(size * scalingFactor) : Math.round(size * scalingFactor) + 1;
	Math.seedrandom(seed);
	var shipLines = 15;
	var shipCanvas = document.createElement('canvas');
	shipCanvas.width = size;
	shipCanvas.height = size;
	var shipctx = shipCanvas.getContext('2d');

	shipctx.lineWidth = Math.min(Math.max(1,Math.floor(2 * scalingFactor)), 5);

	var shadowCanvas = document.createElement('canvas');
	shadowCanvas.width = size + 2;
	shadowCanvas.height = size + 2;
	var shadowCtx = shadowCanvas.getContext('2d');
	shadowCtx.save();
	shadowCtx.shadowBlur = 5 * scalingFactor;

	var shadowColor = hexToRgb(colors[colors.length-1]);
	shadowColor = "rgb(" + Math.round(shadowColor.r * 0.5) + "," + Math.round(shadowColor.g * 0.5) + "," + Math.round(shadowColor.b * 0.5) + ")";

	shadowCtx.shadowColor = shadowColor;
	shadowCtx.fillStyle = shadowColor;
	shadowCtx.beginPath();

	shipctx.shadowBlur = shipctx.lineWidth;
	shipctx.shadowColor = colors[Math.round(colors.length / 2)];

	var lastX = size / 2;
	var lastY = 0;

	shadowCtx.moveTo(1 + size / 2, 0);

	var colorindex = 0;
	for (var i = 0; i < shipLines; i++) {

			var yVal = Math.random() * size / 2;
			// var xVal = Math.sqrt(Math.abs(Math.pow(size / 2, 2) - Math.pow(yVal, 2)));
			var xVal = Math.random() * size / 2;

			nextYLoc = size / 2 - yVal;
			nextXLoc = size / 2 + (Math.random() * xVal);

			if (i == shipLines - 1){
				nextYLoc = size / 2;
				nextXLoc = size;
			}

			drawline(shipctx, white ? "#FFFFFF" : colors[colorindex], lastX, lastY, nextXLoc, nextYLoc);
			shadowCtx.lineTo(1 + nextXLoc, 1 + nextYLoc);

			lastX = nextXLoc;
			lastY = nextYLoc;

			colorindex++;
			if (colorindex >= colors.length - 1)
					colorindex = 0;
	}

	shadowCtx.fill();
	shadowCtx.fill();
	shadowCtx.fill();
	shadowCtx.restore();

	shadowCtx.save();
	shadowCtx.translate(size / 2 + 1, 0);
	shadowCtx.scale(-1, 1);
	shadowCtx.drawImage(shadowCanvas, -size / 2 - 1, 0);
	shadowCtx.restore();

	shadowCtx.save();
	shadowCtx.translate(0, size / 2 + 1);
	shadowCtx.scale(1, -1);
	shadowCtx.drawImage(shadowCanvas, 0, -size / 2 - 1);
	shadowCtx.restore();

	shipctx.save();
	shipctx.translate(size / 2, 0);
	shipctx.scale(-1, 1);
	shipctx.drawImage(shipCanvas, -size / 2, 0);
	shipctx.restore();

	shipctx.save();
	shipctx.translate(0, size / 2);
	shipctx.scale(1, -1);
	shipctx.drawImage(shipCanvas, 0, -size / 2);
	shipctx.restore();

	shadowCtx.drawImage(shipCanvas,1,1,size,size);
	return shadowCanvas;
};



Squarepusher.wave = function () {
	var seed = Date.now();

	this.shipFrequency = (3000 + (Math.random() * 1000));
	this.lastShipSpawned = 0;
	this.spawnsCreated = 0;
	this.spawnsDestroyed = 0;

	this.shipsInWave = Squarepusher.minShipsPerWave + Math.round(Math.random() * (Squarepusher.maxShipsPerWave - Squarepusher.minShipsPerWave) * Enemies.difficultyFactor);
	this.shipsSpawned = 0;
	this.shipsDestroyed = 0;
	this.size = Squarepusher.size;
	this.colors = Ships.enemyColors[Math.floor(Math.random() * Ships.enemyColors.length)];

	this.shipHealth = EnemyShips.shipHealth * 5;
	this.spawnHealth = EnemyShips.shipHealth;
	this.firing = false;
	this.rotationDirection = Math.random() > 0.5 ? -1 : 1;

	this.maxSpeed = 50 + Math.random() * 20;

	this.offset = Math.round(this.size / 2);
	this.ships = [];
	this.shipsExited = 0;

	this.texture = glowTexture(PIXI.Texture.fromCanvas(Squarepusher.getMirrorTexture(this.size, seed, this.colors)));
	this.damageTexture = glowTexture(PIXI.Texture.fromCanvas(Squarepusher.getMirrorTexture(this.size, seed, this.colors, true)));
	this.spawnSpritePool = new SpritePool(this.texture, backgroundEnemyContainer);
	this.spritePool = new SpritePool(this.texture, backgroundEnemyContainer);
	this.firingTime = Squarepusher.spawnTime;
};

Squarepusher.wave.prototype.destroy = function() {
	this.spawnSpritePool.destroy();
	this.spritePool.destroy();
	this.damageTexture.destroy(true);
	this.texture.destroy(true);
	this.finished = true;
};

Squarepusher.wave.prototype.update = function (timeDiff) {

	this.lastShipSpawned += timeDiff * 1000;

	if (this.shipsSpawned < this.shipsInWave && this.lastShipSpawned >= this.shipFrequency && timeLeft > 0) {
		this.ships.push(new Squarepusher.enemyShip(this));
		this.lastShipSpawned = 0;
		this.shipsSpawned++;
	}

	for (var j = 0; j < this.ships.length; j++) {
		this.ships[j].update(timeDiff);
	}
	if (
		this.shipsExited + this.shipsDestroyed + this.spawnsDestroyed >= this.shipsInWave + this.spawnsCreated ||
		(this.shipsExited + this.shipsDestroyed + this.spawnsDestroyed >= this.shipsSpawned + this.spawnsCreated && timeLeft < 0)) {

		this.destroy();
	}
};



Squarepusher.enemyShip = function (wave, position) {

	this.wave = wave;

	if (position) {
		this.sprite = wave.spawnSpritePool.nextSprite();
		this.spawn = true;
		this.xSpeed = 0;
		this.xLoc = position.x;
		this.yLoc = position.y;
		this.health = wave.spawnHealth * Enemies.difficultyFactor;
		this.sprite.alpha = 0.5;
	} else {
		this.sprite = wave.spritePool.nextSprite();
		this.spawn = false;
		this.spawned = 0;
		this.xDirection = Math.random() > 0.5 ? 1 : -1;
		this.xLoc = this.xDirection === 1 ? -wave.size : canvasWidth + wave.size;
		this.yLoc = canvasHeight * Math.random() * 0.1;
		this.xSpeed = this.xDirection === 1 ? Squarepusher.xSpeed / 5 : -Squarepusher.xSpeed / 5;
		this.health = wave.shipHealth * Enemies.difficultyFactor;
		Enemies.enemiesSpawned++;
	}
	this.sprite.texture = wave.texture;
	this.sprite.visible = true;
	this.sprite.tint = 0xFFFFFF;
	this.sprite.anchor = {x:0.5, y:0.5};
	this.sprite.position.x = this.xLoc * scalingFactor;
	this.sprite.position.y = this.yLoc * scalingFactor;
	this.ySpeed = Squarepusher.ySpeed;

	this.inPlay = 1;
	this.enemyShip = true;
	this.rotation=0;
	this.offset = wave.offset;
	this.lastParticle=0;
	this.bulletsLeft=0;
	this.firing = false;
	this.allDeadSurvivalTime = Math.random() * 1000;
	this.id = Enemies.currShipId++;
};

Squarepusher.enemyShip.prototype.detectCollision = function (xLoc, yLoc) {
	if (this.inPlay === 1 && distanceBetweenPoints(this.xLoc, this.yLoc, xLoc, yLoc) < this.offset) {
		return true;
	}
	return false;
};

Squarepusher.enemyShip.prototype.damage = function(xLoc, yLoc, inputDamage, noEffect) {
	if (this.health > 0) {

		var damage = Talents.enemyDamaged(inputDamage, xLoc, yLoc);

		var isCrit = Math.random() < getCritChance();
		if (isCrit) {
			damage *= getCritDamage();
		}

		if (!noEffect) {
			Bullets.generateExplosion(xLoc, yLoc);
			Sounds.enemyDamage.play(this.xLoc);
			this.sprite.texture = this.damageTexture || this.wave.damageTexture;
			this.lastDamaged = 0;

			var bumpSpeedX = this.xLoc - xLoc;
			var bumpSpeedY = this.yLoc - yLoc;
			var bumpMagMulti = ((damage / this.wave.shipHealth) * 100) / (magnitude(bumpSpeedX, bumpSpeedY) || 1);
			this.xSpeed += bumpSpeedX * bumpMagMulti;
			this.ySpeed += bumpSpeedY * bumpMagMulti;
		}

		this.health -= damage;

		GameText.damage.newText(damage, this, isCrit && !noEffect);

		if (this.wave) {
			var percentOfShipDamaged = damage / this.wave.shipHealth;

			stageSprite.screenShake += gameModel.maxScreenShake * percentOfShipDamaged;

			if (this.health + damage > this.wave.shipHealth / 2 && this.health < this.wave.shipHealth / 2) {
				this.maxSpeed *= 0.90;
			}
		}

		if (this.health <= 0) {
			this.destroy(this);
			if (this.firing)
				this.wave.firing = false;
		}
	}
};

Squarepusher.enemyShip.prototype.destroy = function () {

	stageSprite.screenShake += gameModel.maxScreenShake;
	this.inPlay = 0;
	Talents.enemyDestroyed();
	if (this.spawn) {
		this.wave.spawnSpritePool.discardSprite(this.sprite);
		this.wave.spawnsDestroyed++;

		if (Math.random() > 0.9)
			MoneyPickup.newMoneyPickup(this.xLoc, this.yLoc, (this.wave.shipHealth + Math.random() * this.wave.shipHealth * 5) / 10);

	} else {
		Enemies.enemiesKilled++;
		this.wave.spritePool.discardSprite(this.sprite);
		this.wave.shipsDestroyed++;

		if (Math.random() > 0.8)
			MoneyPickup.newMoneyPickup(this.xLoc, this.yLoc, (this.wave.shipHealth + Math.random() * this.wave.shipHealth * 2));
	}

	Powerups.newPowerup(this.xLoc, this.yLoc);
	Ships.generateExplosion(this);

};


Squarepusher.enemyShip.prototype.update = function (timeDiff) {
	if (this.inPlay) {

		if (this.xLoc > 0 && this.xLoc < canvasWidth && this.yLoc > 0 && this.yLoc < canvasHeight)
			Enemies.activeShips.push(this);

		if (!this.spawn) {

			var nextSpawnLoc;

			if (this.xDirection === 1) {
				nextSpawnLoc = this.spawned * this.wave.size + this.wave.size / 2;

				if (this.xLoc < nextSpawnLoc && this.xLoc + this.xSpeed * timeDiff > nextSpawnLoc) {
					this.xSpeed = Squarepusher.xSpeed;
					this.wave.ships.push(new Squarepusher.enemyShip(this.wave, {x:nextSpawnLoc, y:this.yLoc}));
					this.spawned++;
					this.wave.spawnsCreated++;
				}

				if (this.xLoc > canvasWidth - this.wave.size / 2.5) {
					this.xDirection = 0;
					this.ySpeed = -Squarepusher.xSpeed;
					this.xSpeed = 0;
					this.climbStartedAt = this.yLoc;
				}
			}

			if (this.xDirection === -1) {
				nextSpawnLoc = canvasWidth - (this.spawned * this.wave.size + this.wave.size / 2);

				if (this.xLoc > nextSpawnLoc && this.xLoc + this.xSpeed * timeDiff < nextSpawnLoc) {
					this.xSpeed = -Squarepusher.xSpeed;
					this.wave.ships.push(new Squarepusher.enemyShip(this.wave, {x:nextSpawnLoc, y:this.yLoc}));
					this.spawned++;
					this.wave.spawnsCreated++;
				}

				if (this.xLoc < this.wave.size / 2.5) {
					this.xDirection = 0;
					this.ySpeed = -Squarepusher.xSpeed;
					this.xSpeed = 0;
					this.climbStartedAt = this.yLoc;
				}
			}

			if (this.xDirection === 0 && this.yLoc <= this.climbStartedAt - this.wave.size * 0.9) {
				this.xDirection = this.xLoc > canvasWidth / 2 ? -1 : 1;
				this.ySpeed = Squarepusher.ySpeed;
				this.xSpeed = this.xDirection === 1 ? Squarepusher.xSpeed : -Squarepusher.xSpeed;
				this.spawned = 0;
				Bullets.enemyBullets.newEnemyBullet(this);
			}

			if (this.yLoc < -this.wave.size / 2 || this.yLoc > canvasHeight + this.wave.size / 2) {
				this.inPlay = 0;
				this.wave.spritePool.discardSprite(this.sprite);
				this.wave.shipsExited++;
			}
		} else {
			if (this.ySpeed < Squarepusher.ySpeed) {
				this.ySpeed += 10 * timeDiff;
			}
		}

		this.xLoc += this.xSpeed * timeDiff;
		this.yLoc += this.ySpeed * timeDiff;

		if (this.spawn && (
				this.xLoc < -this.wave.size / 2 || this.xLoc > canvasWidth + this.wave.size / 2 || this.yLoc < -this.wave.size / 2 || this.yLoc > canvasHeight + this.wave.size / 2
			)) {
			this.inPlay = 0;
			this.wave.spawnSpritePool.discardSprite(this.sprite);
			this.wave.shipsExited++;
		}

		this.sprite.position.x = this.xLoc * scalingFactor;
		this.sprite.position.y = this.yLoc * scalingFactor;

		this.lastDamaged += timeDiff;
		if (this.lastDamaged > 0.06)
			this.sprite.texture = this.wave.texture;

		if (this.health < this.wave.shipHealth / 3) {
			this.lastParticle += timeDiff;
			if (this.lastParticle > 0.1) {
				Stars.powerupParts.newPowerupPart(this.sprite.position.x - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor),
																			this.sprite.position.y - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor),
																			calculateTintFromString(this.wave.colors[Math.floor(Math.random() * this.wave.colors.length)]));
				this.lastParticle = 0;
			}
		}

		EnemyShips.checkForSplashDamage(this);
		EnemyShips.checkForPlayerCollision(this, timeDiff);

		if (this.spawn) {
			if (this.health < this.wave.spawnHealth)
				this.sprite.tint = calculateTint(this.health / this.wave.spawnHealth);
		} else {
			if (this.health < this.wave.shipHealth)
				this.sprite.tint = calculateTint(this.health / this.wave.shipHealth);
		}
	}
};
