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



Squarepusher.bulletWave = function() {
	var wave = new Squarepusher.wave();
	var seed = Date.now();
	wave.texture = glowTexture(PIXI.Texture.fromCanvas(Squarepusher.getMirrorTexture(wave.size, seed, wave.colors)));
	wave.damageTexture = glowTexture(PIXI.Texture.fromCanvas(Squarepusher.getMirrorTexture(wave.size, seed, wave.colors, true)));
	wave.spawnSpritePool = SpritePool.create(this.texture, backgroundEnemyContainer);
	wave.spritePool = SpritePool.create(this.texture, backgroundEnemyContainer);
	wave.firingTime = Squarepusher.spawnTime;
	return wave;
};



Squarepusher.wave = function () {

	this.update = Squarepusher.update;

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
	this.firing = false;
	this.rotationDirection = Math.random() > 0.5 ? -1 : 1;

	this.maxSpeed = 50 + Math.random() * 20;

	this.offset = Math.round(this.size / 2.2);
	this.ships = [];
	this.shipsExited = 0;

	this.destroy = function() {
		this.spawnSpritePool.destroy();
		this.spritePool.destroy();
		this.damageTexture.destroy(true);
		this.texture.destroy(true);
		this.finished = true;
	};
};



Squarepusher.enemyShip = function (wave, position) {

	this.damage = Squarepusher.damageEnemyShip;
	this.destroy = Squarepusher.destroy;
	this.detectCollision = Squarepusher.detectCollision;

	this.wave = wave;

	if (position) {
		this.sprite = wave.spawnSpritePool.nextSprite();
		this.spawn = true;
		this.xSpeed = 0;
		this.xLoc = position.x;
		this.yLoc = position.y;
		this.health = wave.shipHealth * Enemies.difficultyFactor / 5;
		this.sprite.alpha = 0.5;
	} else {
		this.sprite = wave.spritePool.nextSprite();
		this.spawn = false;
		this.spawned = 0;
		this.xDirection = Math.random() > 0.5 ? 1 : -1;
		this.xLoc = this.xDirection === 1 ? -wave.size : canvasWidth + wave.size;
		this.yLoc = canvasHeight * Math.random() * 0.2;
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



Squarepusher.detectCollision = function (ufo, xLoc, yLoc) {
	if (ufo.inPlay === 1 && distanceBetweenPoints(ufo.xLoc, ufo.yLoc, xLoc, yLoc) < ufo.offset) {
		return true;
	}
	return false;
};



Squarepusher.damageEnemyShip = function(xLoc, yLoc, damage, noEffect) {
	if (this.health > 0) {

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
			if (this.firing)
				this.wave.firing = false;
		}
	}
};



Squarepusher.updateShip = function (ship, timeDiff) {
	if (ship.inPlay) {

		if (ship.xLoc > 0 && ship.xLoc < canvasWidth && ship.yLoc > 0 && ship.yLoc < canvasHeight)
			Enemies.activeShips.push(ship);

		if (!ship.spawn) {

			var nextSpawnLoc;

			if (ship.xDirection === 1) {
				nextSpawnLoc = ship.spawned * ship.wave.size + ship.wave.size / 2;

				if (ship.xLoc < nextSpawnLoc && ship.xLoc + ship.xSpeed * timeDiff > nextSpawnLoc) {
					ship.xSpeed = Squarepusher.xSpeed;
					ship.wave.ships.push(new Squarepusher.enemyShip(ship.wave, {x:nextSpawnLoc, y:ship.yLoc}));
					ship.spawned++;
					ship.wave.spawnsCreated++;
				}

				if (ship.xLoc > canvasWidth - ship.wave.size / 2.5) {
					ship.xDirection = 0;
					ship.ySpeed = -Squarepusher.xSpeed;
					ship.xSpeed = 0;
					ship.climbStartedAt = ship.yLoc;
				}
			}

			if (ship.xDirection === -1) {
				nextSpawnLoc = canvasWidth - (ship.spawned * ship.wave.size + ship.wave.size / 2);

				if (ship.xLoc > nextSpawnLoc && ship.xLoc + ship.xSpeed * timeDiff < nextSpawnLoc) {
					ship.xSpeed = -Squarepusher.xSpeed;
					ship.wave.ships.push(new Squarepusher.enemyShip(ship.wave, {x:nextSpawnLoc, y:ship.yLoc}));
					ship.spawned++;
					ship.wave.spawnsCreated++;
				}

				if (ship.xLoc < ship.wave.size / 2.5) {
					ship.xDirection = 0;
					ship.ySpeed = -Squarepusher.xSpeed;
					ship.xSpeed = 0;
					ship.climbStartedAt = ship.yLoc;
				}
			}

			if (ship.xDirection === 0 && ship.yLoc <= ship.climbStartedAt - ship.wave.size * 0.9) {
				ship.xDirection = ship.xLoc > canvasWidth / 2 ? -1 : 1;
				ship.ySpeed = Squarepusher.ySpeed;
				ship.xSpeed = ship.xDirection === 1 ? Squarepusher.xSpeed : -Squarepusher.xSpeed;
				ship.spawned = 0;
				Bullets.enemyBullets.newEnemyBullet(ship);
			}

			if (ship.yLoc < -ship.wave.size / 2 || ship.yLoc > canvasHeight + ship.wave.size / 2) {
				ship.inPlay = 0;
				ship.wave.spritePool.discardSprite(ship.sprite);
				ship.wave.shipsExited++;
			}
		} else {
			if (ship.ySpeed < Squarepusher.ySpeed) {
				ship.ySpeed += 10 * timeDiff;
			}
		}

		ship.xLoc += ship.xSpeed * timeDiff;
		ship.yLoc += ship.ySpeed * timeDiff;

		if (ship.spawn && (
				ship.xLoc < -ship.wave.size / 2 || ship.xLoc > canvasWidth + ship.wave.size / 2 || ship.yLoc < -ship.wave.size / 2 || ship.yLoc > canvasHeight + ship.wave.size / 2
			)) {
			ship.inPlay = 0;
			ship.wave.spawnSpritePool.discardSprite(ship.sprite);
			ship.wave.shipsExited++;
		}

		ship.sprite.position.x = ship.xLoc * scalingFactor;
		ship.sprite.position.y = ship.yLoc * scalingFactor;

		ship.lastDamaged += timeDiff;
		if (ship.lastDamaged > 0.06)
			ship.sprite.texture = ship.wave.texture;

		if (ship.health < ship.wave.shipHealth / 3) {
			ship.lastParticle += timeDiff;
			if (ship.lastParticle > 0.1) {
				Stars.powerupParts.newPowerupPart(ship.sprite.position.x - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor),
																			ship.sprite.position.y - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor),
																			calculateTintFromString(ship.wave.colors[Math.floor(Math.random() * ship.wave.colors.length)]));
				ship.lastParticle = 0;
			}
		}

		EnemyShips.checkForSplashDamage(ship);
		EnemyShips.checkForPlayerCollision(ship, timeDiff);

		if (ship.health < ship.wave.shipHealth)
			ship.sprite.tint = calculateTint(ship.health / ship.wave.shipHealth);
	}
};



Squarepusher.update = function (timeDiff) {

	this.lastShipSpawned += timeDiff * 1000;

	if (this.shipsSpawned < this.shipsInWave && this.lastShipSpawned >= this.shipFrequency && timeLeft > 0) {
		this.ships.push(new Squarepusher.enemyShip(this));
		this.lastShipSpawned = 0;
		this.shipsSpawned++;
	}

	for (var j = 0; j < this.ships.length; j++) {
		Squarepusher.updateShip(this.ships[j],timeDiff);
	}
	if (
		this.shipsExited + this.shipsDestroyed + this.spawnsDestroyed >= this.shipsInWave + this.spawnsCreated ||
		(this.shipsExited + this.shipsDestroyed + this.spawnsDestroyed >= this.shipsSpawned + this.spawnsCreated && timeLeft < 0)) {

		this.finished = true;
		this.destroy();
	}
};



Squarepusher.destroy = function (ship) {

	stageSprite.screenShake += gameModel.maxScreenShake;
	ship.inPlay = 0;

	if (ship.spawn) {
		ship.wave.spawnSpritePool.discardSprite(ship.sprite);
		ship.wave.spawnsDestroyed++;

		if (Math.random() > 0.8)
			MoneyPickup.newMoneyPickup(ship.xLoc, ship.yLoc, (ship.wave.shipHealth + Math.random() * ship.wave.shipHealth * 5) / 10);

	} else {
		Enemies.enemiesKilled++;
		ship.wave.spritePool.discardSprite(ship.sprite);
		ship.wave.shipsDestroyed++;

		if (Math.random() > 0.8)
			MoneyPickup.newMoneyPickup(ship.xLoc, ship.yLoc, (ship.wave.shipHealth + Math.random() * ship.wave.shipHealth * 5));
	}

	Powerups.newPowerup(ship.xLoc,ship.yLoc);

	Ships.generateExplosion(ship);

};
