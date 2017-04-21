var Bullets = {};

Bullets.splashDamage = {
	splashes : [],
	maxSplashes : 10,
	currSplash : 0,
	update: function(timeDiff) {

		// if (!Bullets.splashDamage.trackingLines) {
		// 	Bullets.splashDamage.trackingLines = new PIXI.Graphics();
		// 	bulletContainer.addChild(Bullets.splashDamage.trackingLines);
		// }
		// bulletContainer.addChild(Bullets.splashDamage.trackingLines);
		// Bullets.splashDamage.trackingLines.clear();
		// Bullets.splashDamage.trackingLines.lineStyle(1, 0xFF0000);

		for (var i = 0; i < Bullets.splashDamage.maxSplashes; i++) {
			if (Bullets.splashDamage.splashes[i] && Bullets.splashDamage.splashes[i].active) {
				Bullets.splashDamage.splashes[i].spread += timeDiff * Bullets.splashDamage.splashes[i].speed;
				Bullets.splashDamage.splashes[i].damage -= timeDiff * Bullets.splashDamage.splashes[i].decay;

				// Bullets.splashDamage.trackingLines.drawCircle(Bullets.splashDamage.splashes[i].xLoc * scalingFactor, Bullets.splashDamage.splashes[i].yLoc * scalingFactor, Bullets.splashDamage.splashes[i].spread * scalingFactor);

				if (Bullets.splashDamage.splashes[i].damage <= 0) {
					Bullets.splashDamage.splashes[i].active = 0;
				}
			}
		}
	},
	createSplash: function (x, y, speed, damage, decay) {
		Bullets.splashDamage.currSplash++;
		if (Bullets.splashDamage.currSplash >= Bullets.splashDamage.maxSplashes) {
			Bullets.splashDamage.currSplash = 0;
		}

		Bullets.splashDamage.splashes[Bullets.splashDamage.currSplash] = {
			xLoc : x,
			yLoc : y,
			spread : 1,
			speed : speed,
			damage : damage,
			decay : decay,
			active : 1,
			shipsDamaged : []
		};
	}
};

Bullets.blasts = {
	texture: (function() {
		var blast = document.createElement('canvas');
		blast.width = 32;
		blast.height = 32;
		var blastCtx = blast.getContext('2d');

		var radgrad = blastCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
		radgrad.addColorStop(0, 'rgba(255,255,255,1)');
		radgrad.addColorStop(0.8, 'rgba(255,255,128,0.2)');
		radgrad.addColorStop(1, 'rgba(255,180,0,0)');

		// draw shape
		blastCtx.fillStyle = radgrad;
		blastCtx.fillRect(0, 0, 32, 32);

		return PIXI.Texture.fromCanvas(blast);
	}()),
	getSpritePool : function() {
		if (!this.spritePool) {
			this.spritePool = SpritePool.create(this.texture, explosionContainer);
		}
		return this.spritePool;
	},
	newBlast: function(x, y) {

		var sprite = this.getSpritePool().nextSprite();
		sprite.visible = true;
		sprite.scale = {
			x: scalingFactor,
			y: scalingFactor
		};
		sprite.position.x = x * scalingFactor;
		sprite.position.y = y * scalingFactor;
	},
	updateBlasts: function(timeDiff) {
		this.getSpritePool();
		for (var i = 0; i < this.spritePool.sprites.length; i++) {
			var sprite = this.spritePool.sprites[i];
			if (sprite.visible) {
				sprite.scale.y -= (5 * timeDiff) * scalingFactor;
				sprite.scale.x = sprite.scale.y;
				if (sprite.scale.x <= 0) {
					this.spritePool.discardSprite(sprite);
				}
			}
		}
	}
};

Bullets.enemyRails = {
	getSpritePool:function() {
		if (!this.spritePool) {
			this.spritePool = SpritePool.create(Stars.stars.texture, bulletContainer);
		}
		return this.spritePool;
	},
	newRail : function(ship) {
		Sounds.playerLaser.play(ship.xLoc);
		var angle = Math.atan2(PlayerShip.playerShip.xLoc - ship.xLoc,  ship.yLoc - PlayerShip.playerShip.yLoc);
		var sprite = this.getSpritePool().nextSprite();
		sprite.anchor = {
			x: 0.5,
			y: 1
		};
		sprite.tint = 0xE030E0;
		sprite.scale.y = 640 * scalingFactor;
		sprite.xLoc = ship.xLoc;
		sprite.yLoc = ship.yLoc;
		sprite.position.x = ship.xLoc * scalingFactor;
		sprite.position.y = ship.yLoc * scalingFactor;
		sprite.visible = true;
		sprite.alpha = 1;
		sprite.speed = RotateVector2d(0, -200, angle);
		sprite.scale.x = 7 * scalingFactor;
		sprite.rotation = angle;
		Bullets.generateExplosion(PlayerShip.playerShip.xLoc, PlayerShip.playerShip.yLoc);
		PlayerShip.damagePlayerShip(PlayerShip.playerShip, Bullets.enemyBullets.enemyShotStrength);
	},
	update:function(timeDiff) {
		for (var i = 0; i < this.getSpritePool().sprites.length; i++) {
			var sprite = this.getSpritePool().sprites[i];
			if (sprite.visible) {
				sprite.position.x += sprite.speed.x * timeDiff * scalingFactor;
				sprite.position.y += sprite.speed.y * timeDiff * scalingFactor;
				sprite.scale.x = Math.max(sprite.scale.x - 16 * scalingFactor * timeDiff, 0);
				sprite.alpha -= 0.5 * timeDiff;
				if (sprite.scale.x <= 0) {
					this.spritePool.discardSprite(sprite);
				}
			}
		}
	}
};

Bullets.enemyBullets = {
	texture: function() {
		var blast = document.createElement('canvas');
		var size = 12 * scalingFactor;
		blast.width = size + 4;
		blast.height = size + 4;
		var blastCtx = blast.getContext('2d');

		blastCtx.shadowBlur = 5;
		blastCtx.shadowColor = "red";

		var radgrad = blastCtx.createRadialGradient(size / 2 + 2, size / 2 + 2, 0, size / 2, size / 2, size / 2);
		radgrad.addColorStop(0, 'rgba(255,255,128,1)');
		radgrad.addColorStop(0.8, 'rgba(255,0,0,0.4)');
		radgrad.addColorStop(1, 'rgba(255,180,0,0)');

		// draw shape
		blastCtx.fillStyle = radgrad;
		blastCtx.fillRect(0, 0, size, size);

		return glowTexture(PIXI.Texture.fromCanvas(blast), {blurAmount: 0.7});
	},
	getSpritePool:function() {
		if (!this.spritePool) {
			this.spritePool = SpritePool.create(Bullets.enemyBullets.texture(), bulletContainer);
		}
		return this.spritePool;
	},
	enemyShotSpeed: 100,
	enemyShotStrength: 1,
	newEnemyBullet: function(ship, rotation) {

		if (ship.xLoc < 0 || ship.xLoc > canvasWidth || ship.yLoc < 0 || ship.yLoc > canvasHeight)
			return;

		var bullet = this.spritePool.nextSprite();

		bullet.xLoc = ship.xLoc;
		bullet.yLoc = ship.yLoc + 16;

		var travelTime = Math.min(
				distanceBetweenPoints(
					bullet.xLoc,
					bullet.yLoc,
					PlayerShip.playerShip.xLoc,
					PlayerShip.playerShip.yLoc) / Bullets.enemyBullets.enemyShotSpeed,
			0.8);

		travelTime = travelTime / 2 + (travelTime * Math.random());

		var xDiff = (PlayerShip.playerShip.xLoc + PlayerShip.playerShip.xSpeed * travelTime) - ship.xLoc;
		var yDiff = ship.yLoc - (PlayerShip.playerShip.yLoc + PlayerShip.playerShip.ySpeed * travelTime);
		var multi = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

		bullet.xSpeed = xDiff / multi * Bullets.enemyBullets.enemyShotSpeed;
		bullet.ySpeed = yDiff / multi * Bullets.enemyBullets.enemyShotSpeed;

		if (rotation) {
			var rotated = RotateVector2d(
				bullet.xSpeed,
				bullet.ySpeed,
				rotation);
			bullet.xSpeed = rotated.x;
			bullet.ySpeed = rotated.y;
		}
		Sounds.enemyShot.play(
			ship.xLoc
		);
		bullet.travelSoundId = Sounds.enemyShotTravel.play(
			(ship.xLoc - PlayerShip.playerShip.xLoc) / 3,
			(ship.yLoc - PlayerShip.playerShip.yLoc) / 3
		);
		bullet.visible = true;
		bullet.lastTrail = 0;
		bullet.position.x = bullet.xLoc * scalingFactor;
		bullet.position.y = bullet.yLoc * scalingFactor;
	},
	update : function(timeDiff) {
		Bullets.enemyRails.update(timeDiff);
		this.getSpritePool();
		for (var i = 0; i < this.spritePool.sprites.length; i++) {

			var bullet = this.spritePool.sprites[i];

			if (bullet.visible) {

				bullet.xLoc += bullet.xSpeed * timeDiff;
				bullet.yLoc -= bullet.ySpeed * timeDiff;

				if (bullet.yLoc < 0 || bullet.yLoc > canvasHeight ||
					bullet.xLoc < 0 || bullet.xLoc > canvasWidth) {
					Bullets.enemyBullets.spritePool.discardSprite(bullet);
					Sounds.enemyShotTravel.stop(bullet.travelSoundId);
				} else {
					if (Ships.detectCollision(PlayerShip.playerShip, bullet.xLoc, bullet.yLoc)) {
						Bullets.enemyBullets.spritePool.discardSprite(bullet);
						Bullets.generateExplosion(bullet.xLoc, bullet.yLoc);
						PlayerShip.damagePlayerShip(PlayerShip.playerShip, Bullets.enemyBullets.enemyShotStrength);
						Sounds.enemyShotTravel.stop(bullet.travelSoundId);
					} else {

						bullet.lastTrail += timeDiff * 1000;
						if (gameModel.detailLevel > 0.5 && bullet.lastTrail > 65) {
							bullet.lastTrail = 0;
							Stars.powerupParts.newPowerupPart(
								bullet.position.x - (4 * scalingFactor) + (8 * scalingFactor * Math.random()),
								bullet.position.y - (4 * scalingFactor) + (8 * scalingFactor * Math.random())
							);
						}

						bullet.position.x = bullet.xLoc * scalingFactor;
						bullet.position.y = bullet.yLoc * scalingFactor;
						bullet.tint = calculateTint(0);

						Sounds.enemyShotTravel.updatePosition(
							(bullet.xLoc - PlayerShip.playerShip.xLoc) / 3,
							(bullet.yLoc - PlayerShip.playerShip.yLoc) / 3,
							bullet.travelSoundId
						);
					}
				}

			}
		}
	}
};

Bullets.getTurretAngle = function() {
	if (playerOneAxes[2] > 0.25 || playerOneAxes[2] < -0.25 || playerOneAxes[3] > 0.25 || playerOneAxes[3] < -0.25) {
		aimLocX = aimLocY = 0;
		cursorPosition.x = cursorPosition.y = -100;
		return Math.atan2(playerOneAxes[2], -playerOneAxes[3]);
	} else if (aimLocX && aimLocY) {
		var xDiff;
		if (stageSprite.visible) {
			if (aimLocX < stageSprite.x || aimLocX > stageSprite.x + stageSprite.width)
				return 0;
			xDiff = (aimLocX / scalingFactor) - (PlayerShip.playerShip.xLoc) - (stageSprite.x / scalingFactor);
		} else {
			xDiff = (aimLocX / scalingFactor) - (PlayerShip.playerShip.xLoc);
		}
		var yDiff = (PlayerShip.playerShip.yLoc) - (aimLocY / scalingFactor);
		return Math.atan2(xDiff, yDiff);
	}
	return 0;
};

Bullets.explosionBits = {
	bitsPerExplosion: 10,
	getSpritePool : function() {
		if (!this.spritePool) {
			this.spritePool = SpritePool.create(Stars.stars.texture, explosionContainer);
		}
		return this.spritePool;
	},
	update: function(timeDiff) {
		this.getSpritePool();
		for (var i = 0; i < this.spritePool.sprites.length; i++) {
			var sprite = this.spritePool.sprites[i];
			if (sprite.visible) {
				sprite.scale.x -= 4 * timeDiff;
				sprite.scale.y -= 4 * timeDiff;
				if (sprite.scale.x <= 0) {
					this.spritePool.discardSprite(sprite);
				} else {
					sprite.position.x += sprite.xSpeed * timeDiff;
					sprite.position.y += sprite.ySpeed * timeDiff;
				}
			}
		}
	},
	newExplosionBit: function(x, y) {

		var sprite = this.getSpritePool().nextSprite();

		sprite.visible = true;
		sprite.position.x = x;
		sprite.position.y = y;
		sprite.scale.x = sprite.scale.y = (1 + Math.random()) * scalingFactor;
		sprite.tint = rgbToHex(255, 255, 255 * Math.random());

		var speed = RotateVector2d(0, 25 + Math.random() * 75, Math.random() * 2 * Math.PI);

		sprite.xSpeed = speed.x * scalingFactor;
		sprite.ySpeed = speed.y * scalingFactor;
	}
};

Bullets.generateExplosion = function(x, y) {
	for (var i = 0; i < Bullets.explosionBits.bitsPerExplosion * gameModel.detailLevel; i++) {
		Bullets.explosionBits.newExplosionBit(x * scalingFactor, y * scalingFactor);
	}
	Bullets.blasts.newBlast(x, y);
};
