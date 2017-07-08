var UFOs = {
	minShipsPerWave : 1,
	maxShipsPerWave : 3,
	waveBulletFrequency : 3000,
	maxBulletsPerShot : 1,
	SHIP_SIZE : 64,
	railFiringTime : 7,
	bulletFiringTime : 4
};



UFOs.engineTexture = function(){
	var size = 32 * scalingFactor;
	var blast = document.createElement('canvas');
	blast.width = size + 4;
	blast.height = size + 4;
	var blastCtx = blast.getContext('2d');
	blastCtx.shadowBlur = 5;
	blastCtx.shadowColor = "white";
	var radgrad = blastCtx.createRadialGradient(size / 2 + 2, size / 2 + 2, 0, size / 2 + 2, size / 2 + 2, size / 2);
	radgrad.addColorStop(0, 'rgba(255,255,255,0.5)');
	radgrad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
	radgrad.addColorStop(1, 'rgba(255,255,255,0)');
	blastCtx.fillStyle = radgrad;
	blastCtx.fillRect(0, 0, size + 4, size + 4);
	return PIXI.Texture.fromCanvas(blast);
};



UFOs.getMirrorTexture = function(size, seed, colors, white) {
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
			var xVal = Math.sqrt(Math.abs(Math.pow(size / 2, 2) - Math.pow(yVal, 2)));

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



UFOs.getRotateTexture = function(size, seed, colors, white) {
	size = Math.round(size * scalingFactor) % 2 === 0 ? Math.round(size * scalingFactor) : Math.round(size * scalingFactor) + 1;
	Math.seedrandom(seed);

	var rotations  = Math.round(5 + Math.random() * 4);
	// var rotations = 4;

	var eachRotation = Math.PI * 2 / rotations;

	var shipLines = Math.round(60 / rotations);
	// var shipLines = 1;

	var shipCanvas = document.createElement('canvas');
	shipCanvas.width = size;
	shipCanvas.height = size;
	var shipctx = shipCanvas.getContext('2d');

	shipctx.lineWidth = Math.min(Math.max(1,Math.floor( 2 * scalingFactor)), 5);
	// shipctx.lineWidth = Math.min(Math.max(1,Math.floor(size / PlayerShip.SHIP_SIZE)), 5);

	var shadowCanvas = document.createElement('canvas');
	shadowCanvas.width = size + 2;
	shadowCanvas.height = size + 2;
	var shadowCtx = shadowCanvas.getContext('2d');
	shadowCtx.save();
	shadowCtx.shadowBlur = 5 * scalingFactor;

	var shadowColor = hexToRgb(colors[colors.length-2]);
	shadowColor = "rgb(" + Math.round(shadowColor.r * 0.5) + "," + Math.round(shadowColor.g * 0.5) + "," + Math.round(shadowColor.b * 0.5) + ")";

	shadowCtx.shadowColor = shadowColor;
	shadowCtx.fillStyle = shadowColor;
	shadowCtx.beginPath();

	// shipctx.shadowBlur = Math.max(0,shipctx.lineWidth - 1);
	shipctx.shadowBlur = shipctx.lineWidth;
	shipctx.shadowColor = colors[Math.round(colors.length / 2)];

	var lastX = size / 2;
	var lastY = 0;

	shadowCtx.moveTo(1 + size / 2, 0);

	var center = {x:size/2,y:size /2};

	var rotatePoint = function(x, y, angle){
		var x1 = x - center.x;
		var y1 = y - center.y;

		var x2 = (x1 * Math.cos(angle)) - (y1 * Math.sin(angle));
		var y2 = (x1 * Math.sin(angle)) + (y1 * Math.cos(angle));
		var point = {
			x:x2 + center.x,
			y:y2 + center.y
		};
		return point;
	};

	var colorindex = 0;
	for (var i = 0; i < shipLines; i++) {

			var yVal = Math.random() * size / 2;
			var xVal = Math.sqrt(Math.abs(Math.pow(size / 2, 2) - Math.pow(yVal, 2)));

			nextYLoc = size / 2 - yVal;
			nextXLoc = size / 2 + (Math.random() * xVal);

			if (i == shipLines - 1){
				nextYLoc = size / 2;
				nextXLoc = size;
			}

			drawline(shipctx, white ? "#FFFFFF" : colors[colorindex], lastX, lastY, nextXLoc, nextYLoc);
			shadowCtx.lineTo(1 + nextXLoc, 1 + nextYLoc);

			for (var j = 1; j < rotations; j ++) {
				var lastPoint = rotatePoint(lastX, lastY, eachRotation * j);
				var nextPoint = rotatePoint(nextXLoc, nextYLoc, eachRotation * j);

				drawline(shipctx, white ? "#FFFFFF" : colors[colorindex], lastPoint.x, lastPoint.y, nextPoint.x, nextPoint.y);
				// shadowCtx.lineTo(1 + nextPoint.x, 1 + nextPoint.y);
			}

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


	for (i = 1; i < rotations; i ++) {
		shadowCtx.save();
		shadowCtx.translate(size / 2 + 1, size / 2 + 1);
		shadowCtx.rotate(eachRotation * i);
		shadowCtx.drawImage(shadowCanvas, -size / 2 - 1, -size / 2 - 1);
		shadowCtx.restore();

		// shipctx.save();
		// shipctx.translate(size / 2, size / 2);
		// shipctx.rotate(eachRotation * i);
		// shipctx.drawImage(shipCanvas, -size / 2, -size / 2);
		// shipctx.restore();
	}

	shadowCtx.drawImage(shipCanvas,1,1,size,size);
	return shadowCanvas;
};



UFOs.railWave = function() {
	var wave = new UFOs.wave();
	var seed = Date.now();
	wave.texture = glowTexture(PIXI.Texture.fromCanvas(UFOs.getMirrorTexture(wave.size, seed, wave.colors)));
	wave.damageTexture = glowTexture(PIXI.Texture.fromCanvas(UFOs.getMirrorTexture(wave.size, seed, wave.colors, true)));
	wave.spritePool = SpritePool.create(this.texture, frontEnemyContainer);
	wave.bulletType = false;
	wave.firingTime = UFOs.railFiringTime;
	return wave;
};



UFOs.bulletWave = function() {
	var wave = new UFOs.wave();
	var seed = Date.now();
	wave.texture = glowTexture(PIXI.Texture.fromCanvas(UFOs.getRotateTexture(wave.size, seed, wave.colors)));
	wave.damageTexture = glowTexture(PIXI.Texture.fromCanvas(UFOs.getRotateTexture(wave.size, seed, wave.colors, true)));
	wave.spritePool = SpritePool.create(this.texture, frontEnemyContainer);
	wave.bulletType = true;
	wave.firingTime = UFOs.bulletFiringTime;
	return wave;
};



UFOs.wave = function () {

	this.update = UFOs.update;

	this.shipFrequency = (3000 + (Math.random() * 1000));
	this.lastShipSpawned = 0;

	while (typeof this.wavePattern === 'undefined') {
		if (EnemyShips.wavePatterns[EnemyShips.patternCounter].inUse) {
			EnemyShips.patternCounter++;
			if (EnemyShips.patternCounter >= EnemyShips.wavePatterns.length)
				EnemyShips.patternCounter = 0;
		} else {
			this.wavePattern = EnemyShips.wavePatterns[EnemyShips.patternCounter];
			this.wavePattern.inUse = true;
		}
	}

	this.shipsInWave = UFOs.minShipsPerWave + Math.round(Math.random() * (UFOs.maxShipsPerWave - UFOs.minShipsPerWave) * Enemies.difficultyFactor);
	this.shipsSpawned = 0;
	this.shipsDestroyed = 0;
	this.size = Math.round(64 + Math.random() * 16);
	this.colors = Ships.enemyColors[Math.floor(Math.random() * Ships.enemyColors.length)];

	this.engineSpritePool = SpritePool.create(UFOs.engineTexture(), frontEnemyContainer);

	this.shipHealth = EnemyShips.shipHealth * 2.5;
	this.firing = false;
	this.rotationDirection = Math.random() > 0.5 ? -1 : 1;

	this.maxSpeed = 50 + Math.random() * 20;

	this.offset = Math.round(this.size / 2.2);
	this.ships = [];
	this.shipsExited = 0;

	this.destroy = function() {
		this.engineSpritePool.destroy();
		this.spritePool.destroy();
		this.finished = true;
	};
};



UFOs.enemyShip = function (wave) {

	this.damage = UFOs.damageEnemyShip;
	this.destroy = UFOs.destroy;
	this.detectCollision = UFOs.detectCollision;

	this.wave = wave;
	this.xLoc = canvasWidth * wave.wavePattern.xCoords[0];
	this.xTar = canvasWidth * wave.wavePattern.xCoords[1];
	this.yLoc = canvasHeight * wave.wavePattern.yCoords[0];
	this.yTar = canvasHeight * wave.wavePattern.yCoords[1];
	this.nextCoord = 1;
	this.maxSpeed = wave.maxSpeed;
	this.xSpeed = 0;
	this.ySpeed = 0;
	this.health = wave.shipHealth * Enemies.difficultyFactor;
	this.inPlay = 1;
	this.enemyShip = true;
	this.rotation=0;
	this.offset = wave.offset;
	this.lastParticle=0;
	this.bulletsLeft=0;
	this.firing = false;
	this.allDeadSurvivalTime = Math.random() * 1000;
	this.id = Enemies.currShipId++;

	this.engineSprite = wave.engineSpritePool.nextSprite();
	this.engineSprite.anchor = {x:0.5, y:0.5};
	this.engineSprite.visible = true;

	this.sprite = wave.spritePool.nextSprite();
	this.sprite.texture = wave.texture;
	this.sprite.visible = true;
	this.sprite.tint = 0xFFFFFF;
	this.sprite.position.x = this.xLoc * scalingFactor;
	this.sprite.position.y = this.yLoc * scalingFactor;
	this.engineSprite.position = this.sprite.position;
	this.sprite.anchor = {x:0.5, y:0.5};

	Enemies.enemiesSpawned++;

};



UFOs.detectCollision = function (ufo, xLoc, yLoc) {
	if (ufo.inPlay === 1 && distanceBetweenPoints(ufo.xLoc, ufo.yLoc, xLoc, yLoc) < ufo.offset) {
		return true;
	}
	return false;
};



UFOs.damageEnemyShip = function(xLoc, yLoc, damage, noEffect) {
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



UFOs.updateShip = function (eShip, timeDiff) {
	if (eShip.inPlay) {

		if (eShip.xLoc > 0 && eShip.xLoc < canvasWidth && eShip.yLoc > 0 && eShip.yLoc < canvasHeight)
			Enemies.activeShips.push(eShip);

		if (Math.sqrt(Math.pow(eShip.xLoc - eShip.xTar, 2) +
						Math.pow(eShip.yLoc - eShip.yTar, 2)) > 35) {

			EnemyShips.updateShipSpeed(eShip, timeDiff);

			eShip.sprite.position.x = eShip.xLoc * scalingFactor;
			eShip.sprite.position.y = eShip.yLoc * scalingFactor;
			eShip.engineSprite.position = eShip.sprite.position;
			eShip.engineSprite.alpha = 0.3 + Math.random() * 0.5;

			eShip.sprite.rotation += eShip.wave.rotationDirection * timeDiff;

			eShip.lastDamaged += timeDiff;
			if (eShip.lastDamaged > 0.06)
				eShip.sprite.texture = eShip.wave.texture;

			if (eShip.health < eShip.wave.shipHealth / 3) {

				eShip.lastParticle += timeDiff;
				if (eShip.lastParticle > 0.1) {
					Stars.powerupParts.newPowerupPart(eShip.sprite.position.x - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor),
																				eShip.sprite.position.y - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor),
																				calculateTintFromString(eShip.wave.colors[Math.floor(Math.random() * eShip.wave.colors.length)]));
					eShip.lastParticle = 0;
				}

			}

		} else {
			eShip.nextCoord++;

			if (eShip.nextCoord >= eShip.wave.wavePattern.xCoords.length) {
				eShip.inPlay = 0;
				eShip.wave.spritePool.discardSprite(eShip.sprite);
				eShip.wave.shipsExited++;
				if (eShip.firing)
					eShip.wave.firing = false;
			} else {
				eShip.xTar = canvasWidth * eShip.wave.wavePattern.xCoords[eShip.nextCoord];
				eShip.yTar = canvasHeight * eShip.wave.wavePattern.yCoords[eShip.nextCoord];
			}
		}
		EnemyShips.checkForSplashDamage(eShip);
		EnemyShips.checkForPlayerCollision(eShip, timeDiff);

		if (eShip.health < eShip.wave.shipHealth)
			eShip.sprite.tint = calculateTint(eShip.health / eShip.wave.shipHealth);

		eShip.engineSprite.scale.x = eShip.engineSprite.scale.y = 1;
		eShip.engineSprite.tint = 0xFFFFFF;

		if (eShip.inPlay && !eShip.wave.firing && Math.random() > 0.9 && (eShip.xLoc > 0 && eShip.xLoc < canvasWidth && eShip.yLoc > 0 && eShip.yLoc < canvasHeight)) {
			eShip.firingTime = 0;
			eShip.firing = true;
			eShip.wave.firing = true;
		}
		if (eShip.firing) {
			eShip.firingTime += timeDiff;
			eShip.sprite.rotation += eShip.wave.rotationDirection * eShip.firingTime * timeDiff;
			eShip.engineSprite.scale.x = eShip.engineSprite.scale.y = 1 + eShip.firingTime / UFOs.railFiringTime;

			if (eShip.firingTime > eShip.wave.firingTime - 0.5) {
				eShip.engineSprite.tint = 0xFF0000;
			}

			if (eShip.firingTime > eShip.wave.firingTime) {
				eShip.firing = false;
				eShip.wave.firing = false;
				if (eShip.wave.bulletType) {
					Bullets.enemyBullets.newBulletFan(eShip, 7);
				} else {
					Bullets.enemyRails.newRail(eShip);
				}
			}
		}
	}
};



UFOs.update = function (timeDiff) {

	this.lastShipSpawned += timeDiff * 1000;

	for (var j = 0; j < this.shipsInWave; j++) {
		if (!this.ships[j]) {
			if (this.lastShipSpawned >= this.shipFrequency && timeLeft > 0) {
				this.ships[j] = new UFOs.enemyShip(this);
				this.lastShipSpawned = 0;
				this.shipsSpawned++;
			}
		} else {
			UFOs.updateShip(this.ships[j],timeDiff);
		}
	}
	if (this.shipsExited + this.shipsDestroyed >= this.shipsInWave || (this.shipsExited + this.shipsDestroyed >= this.shipsSpawned && timeLeft < 0)) {
		this.finished = true;
		this.wavePattern.inUse = false;
		this.spritePool.destroy();
		this.engineSpritePool.destroy();
	}
};



UFOs.destroy = function (ship) {

	EnemyShips.destroy(ship);
	ship.wave.engineSpritePool.discardSprite(ship.engineSprite);

};