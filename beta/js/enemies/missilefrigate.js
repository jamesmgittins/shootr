var MissileFrigate = {
	minShipsPerWave : 2,
	maxShipsPerWave : 5,
	waveBulletFrequency : 0.8,
	maxBulletsPerShot : 1,
	SHIP_SIZE : 64,
	size : Constants.canvasWidth / 10,
	ySpeed : 20,
	xSpeed : 50
};


MissileFrigate.getMirrorTexture = function(size, seed, colors, white) {
	size = Math.round(size * scalingFactor) % 2 === 0 ? Math.round(size * scalingFactor) : Math.round(size * scalingFactor) + 1;
	Math.seedrandom(seed);
	var shipLines = 25;
	var shipCanvas = document.createElement('canvas');
	shipCanvas.width = size;
	shipCanvas.height = size * 2;
	var shipctx = shipCanvas.getContext('2d');

	shipctx.lineWidth = Math.min(Math.max(1,Math.floor(size / PlayerShip.SHIP_SIZE)), 5);

	var shadowCanvas = document.createElement('canvas');
	shadowCanvas.width = shipCanvas.width + 2;
	shadowCanvas.height = shipCanvas.height + 2;
	var shadowCtx = shadowCanvas.getContext('2d');
	shadowCtx.save();
	shadowCtx.shadowBlur = 5 * scalingFactor;
	// shadowCtx.shadowColor = "#000";

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
			nextYLoc = (Math.random() * size * 2);
			var maxX = nextYLoc < size/2 ? Math.sqrt(Math.pow(size/2,2) - Math.pow(nextYLoc,2)) : size;
			nextXLoc = (((Math.random() * size / 2) * (maxX / size)) + size / 2);

			if (i == shipLines - 2){
				nextYLoc = size;
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

	shipctx.save();
	shipctx.translate(size / 2, 0);
	shipctx.scale(-1, 1);
	shipctx.drawImage(shipCanvas, -size / 2, 0);
	shipctx.restore();

	shadowCtx.drawImage(shipCanvas,1,1,size,size * 2);
	return shadowCanvas;
};


MissileFrigate.wave = function () {
	var seed = Date.now();

	this.shipFrequency = (1500 + (Math.random() * 500));
	this.lastShipSpawned = 0;


	this.shipsInWave = currentLevel > 3 ? MissileFrigate.minShipsPerWave + Math.round(Math.random() * (MissileFrigate.maxShipsPerWave - MissileFrigate.minShipsPerWave) * Enemies.difficultyFactor) : 1;
	this.shipsSpawned = 0;
	this.shipsDestroyed = 0;
	this.size = MissileFrigate.size;
	this.colors = Ships.enemyColors[Math.floor(Math.random() * Ships.enemyColors.length)];

	this.shipHealth = EnemyShips.shipHealth * 4;
	this.direction = Math.random() > 0.5 ? -1 : 1;
	this.yLoc = canvasHeight * Math.random() * 0.2;

	this.maxSpeed = 50 + Math.random() * 20;

	this.offset = Math.round(this.size / 2);
	this.ships = [];
	this.shipsExited = 0;

	this.texture = glowTexture(PIXI.Texture.fromCanvas(MissileFrigate.getMirrorTexture(this.size, seed, this.colors)));
	this.damageTexture = glowTexture(PIXI.Texture.fromCanvas(MissileFrigate.getMirrorTexture(this.size, seed, this.colors, true)));
	this.spritePool = new SpritePool(this.texture, backgroundEnemyContainer);
};

MissileFrigate.wave.prototype.destroy = function() {
	this.spritePool.destroy();
	this.damageTexture.destroy(true);
	this.texture.destroy(true);
	this.finished = true;
};

MissileFrigate.wave.prototype.update = function (timeDiff) {

	this.lastShipSpawned += timeDiff * 1000;

	if (this.shipsSpawned < this.shipsInWave && this.lastShipSpawned >= this.shipFrequency && timeLeft > 0) {
		this.ships.push(new MissileFrigate.enemyShip(this));
		this.lastShipSpawned = 0;
		this.shipsSpawned++;
	}

	for (var j = 0; j < this.ships.length; j++) {
		this.ships[j].update(timeDiff);
	}
	if (
		this.shipsExited + this.shipsDestroyed  >= this.shipsInWave  ||
		(this.shipsExited + this.shipsDestroyed >= this.shipsSpawned && timeLeft < 0)) {

		this.destroy();
	}
};



MissileFrigate.enemyShip = function (wave) {

	this.wave = wave;

	this.sprite = wave.spritePool.nextSprite();
	this.xDirection = wave.direction;
	wave.direction *= -1;
	this.xLoc = this.xDirection === 1 ? -wave.size : canvasWidth + wave.size;
	this.yLoc = wave.yLoc;
	this.xSpeed = this.xDirection === 1 ? MissileFrigate.xSpeed : -MissileFrigate.xSpeed;
	this.health = wave.shipHealth * Enemies.difficultyFactor;
	Enemies.enemiesSpawned++;

	// this.sprite.scale = {x:1,y:1.2};
	this.sprite.rotation = this.xDirection > 0 ? Math.PI / 2 : -Math.PI / 2;
	this.sprite.texture = wave.texture;
	this.sprite.visible = true;
	this.sprite.tint = 0xFFFFFF;
	this.sprite.anchor = {x:0.5, y:0.5};
	this.sprite.position.x = this.xLoc * scalingFactor;
	this.sprite.position.y = this.yLoc * scalingFactor;
	this.ySpeed = MissileFrigate.ySpeed;

	this.inPlay = 1;
	this.enemyShip = true;
	this.rotation=0;
	this.offset = wave.offset;
	this.lastParticle=0;
	this.lastTrail = 0;
	this.lastShot=0;
	this.missilePosition = 0;
	this.firing = false;
	this.allDeadSurvivalTime = Math.random() * 1000;
	this.id = Enemies.currShipId++;
};

MissileFrigate.enemyShip.prototype.detectCollision = function (xLoc, yLoc) {
	if (this.inPlay === 1 && (distanceBetweenPoints(this.xLoc, this.yLoc, xLoc, yLoc) < this.offset) || isPointInsideRectangle(xLoc, yLoc, this.xLoc, this.yLoc, this.offset * 4, this.offset * 0.6)) {
		return true;
	}
	return false;
};

MissileFrigate.enemyShip.prototype.damage = function(xLoc, yLoc, inputDamage, noEffect) {
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

MissileFrigate.enemyShip.prototype.destroy = function () {

	stageSprite.screenShake += gameModel.maxScreenShake;

	if (Math.random() > 0.8)
		MoneyPickup.newMoneyPickup(this.xLoc, this.yLoc, (this.wave.shipHealth + Math.random() * this.wave.shipHealth * 2));

	Powerups.newPowerup(this.xLoc, this.yLoc);
	Ships.generateExplosion(this, -50, 0, 0);
	Ships.generateExplosion(this, 0, 0, 150);
	Ships.generateExplosion(this, +50, 0, 300);
	var shipToBlow = this;
	setTimeout(function(){
		shipToBlow.wave.spritePool.discardSprite(shipToBlow.sprite);
		shipToBlow.wave.shipsDestroyed++;
		shipToBlow.inPlay = 0;
		Talents.enemyDestroyed();
		Enemies.enemiesKilled++;
	}, 200);
};


MissileFrigate.enemyShip.prototype.update = function (timeDiff) {
	if (this.inPlay) {

		if (this.xLoc > 0 && this.xLoc < canvasWidth && this.yLoc > 0 && this.yLoc < canvasHeight)
			Enemies.activeShips.push(this);

		this.xLoc += this.xSpeed * timeDiff;
		this.yLoc += this.ySpeed * timeDiff;

		if (this.yLoc < -this.wave.size || this.yLoc > canvasHeight + this.wave.size || this.xLoc < -this.wave.size || this.xLoc > canvasWidth + this.wave.size) {
			this.inPlay = 0;
			this.wave.spritePool.discardSprite(this.sprite);
			this.wave.shipsExited++;
		} else {
			this.lastTrail += timeDiff * 1000;
			if (this.lastTrail > Stars.shipTrails.trailFrequency) {
				this.lastTrail = 0;
				this.trailX = this.xLoc - this.xDirection * 20;
				this.trailY = this.yLoc - 10;
				Stars.shipTrails.newPart(this, -this.xDirection);
				this.trailY = this.yLoc + 10;
				Stars.shipTrails.newPart(this, -this.xDirection);
			}
		}

		this.sprite.position.x = this.xLoc * scalingFactor;
		this.sprite.position.y = this.yLoc * scalingFactor;

		this.lastShot += timeDiff;
		if (this.lastShot > EnemyShips.waveBulletFrequency / 900) {
			this.missilePosition++;
			if (this.missilePosition > 1) {
				this.missilePosition = -1;
			}
			Bullets.enemyMissiles.newEnemyMissile(this.xLoc + (this.missilePosition * 20), this.yLoc + 20);
			this.lastShot = 0;
		}

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

		if (this.health < this.wave.shipHealth)
			this.sprite.tint = calculateTint(this.health / this.wave.shipHealth);
		}
};
