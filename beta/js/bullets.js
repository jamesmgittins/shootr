var Bullets = {};

Bullets.splashDamage = {
	splashes : [],
	maxSplashes : 10,
	currSplash : 0,
	update: function(timeDiff) {

		// if (!Bullets.splashDamage.trackingLines) {
		// 	Bullets.splashDamage.trackingLines = new PIXI.Graphics();
		// 	if (!Bullets.splashDamage.spriteContainer) {
		// 		Bullets.splashDamage.spriteContainer = new PIXI.Container();
		// 		bulletContainer.addChild(Bullets.splashDamage.spriteContainer);
		// 	}
		// 	Bullets.splashDamage.spriteContainer.addChild(Bullets.splashDamage.trackingLines);
		// }
		// Bullets.splashDamage.trackingLines.clear();
		// Bullets.splashDamage.trackingLines.lineStyle(1, 0xFF0000);

		for (var i = 0; i < Bullets.splashDamage.maxSplashes; i++) {
			if (Bullets.splashDamage.splashes[i] && Bullets.splashDamage.splashes[i].active) {
				Bullets.splashDamage.splashes[i].spread += timeDiff * Bullets.splashDamage.splashes[i].speed;
				Bullets.splashDamage.splashes[i].damage -= timeDiff * Bullets.splashDamage.splashes[i].decay;

				//Bullets.splashDamage.trackingLines.drawCircle(Bullets.splashDamage.splashes[i].xLoc * scalingFactor, Bullets.splashDamage.splashes[i].yLoc * scalingFactor, Bullets.splashDamage.splashes[i].spread * scalingFactor);

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
	sprite: [],
	discardedSprites: [],
	newBlast: function(x, y) {

		var sprite;
		if (Bullets.blasts.discardedSprites.length > 0) {
			sprite = Bullets.blasts.discardedSprites.pop();
		} else {
			sprite = new PIXI.Sprite(Bullets.blasts.texture);
			sprite.anchor = {
				x: 0.5,
				y: 0.5
			};
			Bullets.blasts.sprites.addChild(sprite);
			Bullets.blasts.sprite.push(sprite);
		}
		sprite.visible = true;
		sprite.scale = {
			x: scalingFactor,
			y: scalingFactor
		};
		sprite.position.x = x * scalingFactor;
		sprite.position.y = y * scalingFactor;
	},
	initialize: function() {
		Bullets.blasts.sprites = new PIXI.Container();
		explosionContainer.addChild(Bullets.blasts.sprites);
	},
	updateBlasts: function(timeDiff) {
		for (var i = 0; i < Bullets.blasts.sprite.length; i++) {
			if (Bullets.blasts.sprite[i].visible) {
				Bullets.blasts.sprite[i].scale.y -= (5 * timeDiff) * scalingFactor;
				Bullets.blasts.sprite[i].scale.x = Bullets.blasts.sprite[i].scale.y;
				if (Bullets.blasts.sprite[i].scale.x <= 0) {
					Bullets.blasts.sprite[i].visible = false;
					Bullets.blasts.discardedSprites.push(Bullets.blasts.sprite[i]);
				}
			}
		}
	}
};

Bullets.enemyBullets = {
	maxEnemyBullets: 100,
	currentEnemyBullet: 0,
	enemyShotSpeed: 100,
	enemyShotStrength: 1,
	xLoc: [],
	yLoc: [],
	ySpeed: [],
	xSpeed: [],
	inPlay: [],
	sprite: [],
	resetAll: function() {
		for (var i = 0; i < Bullets.enemyBullets.maxEnemyBullets; i++) {
			Bullets.enemyBullets.inPlay[i] = 0;
			Bullets.enemyBullets.sprite[i].visible = false;
		}
	},
	newEnemyBullet: function(ship, rotation) {
		if (Bullets.enemyBullets.currentEnemyBullet >= Bullets.enemyBullets.maxEnemyBullets) {
			Bullets.enemyBullets.currentEnemyBullet = 0;
		}

		if (ship.xLoc < 0 || ship.xLoc > canvasWidth || ship.yLoc < 0 || ship.yLoc > canvasHeight)
			return;

		Bullets.enemyBullets.xLoc[Bullets.enemyBullets.currentEnemyBullet] = ship.xLoc;
		Bullets.enemyBullets.yLoc[Bullets.enemyBullets.currentEnemyBullet] = ship.yLoc + 16;

		var travelTime = Math.min(
				distanceBetweenPoints(
					Bullets.enemyBullets.xLoc[Bullets.enemyBullets.currentEnemyBullet],
					Bullets.enemyBullets.yLoc[Bullets.enemyBullets.currentEnemyBullet],
					PlayerShip.playerShip.xLoc,
					PlayerShip.playerShip.yLoc) / Bullets.enemyBullets.enemyShotSpeed,
			0.8);

		travelTime = travelTime / 2 + (travelTime * Math.random());

		var xDiff = (PlayerShip.playerShip.xLoc + PlayerShip.playerShip.xSpeed * travelTime) - ship.xLoc;
		var yDiff = ship.yLoc - (PlayerShip.playerShip.yLoc + PlayerShip.playerShip.ySpeed * travelTime);
		var multi = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

		Bullets.enemyBullets.xSpeed[Bullets.enemyBullets.currentEnemyBullet] = xDiff / multi * Bullets.enemyBullets.enemyShotSpeed;
		Bullets.enemyBullets.ySpeed[Bullets.enemyBullets.currentEnemyBullet] = yDiff / multi * Bullets.enemyBullets.enemyShotSpeed;

		if (rotation) {
			var rotated = RotateVector2d(
				Bullets.enemyBullets.xSpeed[Bullets.enemyBullets.currentEnemyBullet],
				Bullets.enemyBullets.ySpeed[Bullets.enemyBullets.currentEnemyBullet],
				rotation);
			Bullets.enemyBullets.xSpeed[Bullets.enemyBullets.currentEnemyBullet] = rotated.x;
			Bullets.enemyBullets.ySpeed[Bullets.enemyBullets.currentEnemyBullet] = rotated.y;
		}


		Bullets.enemyBullets.inPlay[Bullets.enemyBullets.currentEnemyBullet] = 1;

		Sounds.enemyShot.play();

		Bullets.enemyBullets.sprite[Bullets.enemyBullets.currentEnemyBullet].visible = true;
		Bullets.enemyBullets.sprite[Bullets.enemyBullets.currentEnemyBullet].lastTrail = 0;
		Bullets.enemyBullets.sprite[Bullets.enemyBullets.currentEnemyBullet].position.x = ship.xLoc * scalingFactor;
		Bullets.enemyBullets.sprite[Bullets.enemyBullets.currentEnemyBullet].position.y = (ship.yLoc - 16) * scalingFactor;
		//Bullets.enemyBullets.sprite[Bullets.enemyBullets.currentEnemyBullet].scale = {x:scalingFactor,y:scalingFactor};
		Bullets.enemyBullets.currentEnemyBullet++;
	},
	initialize: function() {
		Bullets.enemyBullets.texture = (function() {
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

			return PIXI.Texture.fromCanvas(blast);
		})();

		if (!Bullets.enemyBullets.sprites) {
			Bullets.enemyBullets.sprites = new PIXI.Container();
			bulletContainer.addChild(Bullets.enemyBullets.sprites);
		}

		for (var i = 0; i < Bullets.enemyBullets.maxEnemyBullets; i++) {
			if (Bullets.enemyBullets.sprite[i]) {
				Bullets.enemyBullets.sprite[i].texture = Bullets.enemyBullets.texture;
			} else {
				Bullets.enemyBullets.sprite[i] = new PIXI.Sprite(Bullets.enemyBullets.texture);
				Bullets.enemyBullets.sprite[i].visible = false;
				Bullets.enemyBullets.sprite[i].anchor = {
					x: 0.5,
					y: 0.5
				};
				Bullets.enemyBullets.sprites.addChild(Bullets.enemyBullets.sprite[i]);
			}
		}

	}
};

Bullets.playerBullets = {
	texture: {},
	shotFrequency: 200,
	lastPlayerShot: 0,
	shotSpeed: 300,
	strength: 0.25,
	sprite: [],
	discardedSprites: [],
	resetAll: function() {
		for (var i = 0; i < Bullets.playerBullets.sprite.length; i++) {
			Bullets.playerBullets.sprite[i].inPlay = 0;
			Bullets.playerBullets.sprite[i].visible = false;
		}
		Bullets.playerBullets.discardedSprites = Bullets.playerBullets.sprite.slice();
	},
	initialize: function() {
		Bullets.playerBullets.texture = (function() {
			var size = 8 * scalingFactor;
			var blast = document.createElement('canvas');
			blast.width = size + 4;
			blast.height = size + 4;
			var blastCtx = blast.getContext('2d');

			blastCtx.shadowBlur = 5;
			blastCtx.shadowColor = "white";

			var radgrad = blastCtx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
			radgrad.addColorStop(0, 'rgba(255,255,255,1)');
			radgrad.addColorStop(0.8, 'rgba(255,255,255,0.5)');
			radgrad.addColorStop(1, 'rgba(255,255,255,0)');

			// draw shape
			blastCtx.fillStyle = radgrad;
			blastCtx.fillRect(0, 0, size, size);

			return PIXI.Texture.fromCanvas(blast);
		})();

		Bullets.playerBullets.sprite.forEach(function(sprite){
			sprite.texture = Bullets.playerBullets.texture;
		});

		if (!Bullets.playerBullets.sprites) {
			Bullets.playerBullets.sprites = new PIXI.Container();
			bulletContainer.addChild(Bullets.playerBullets.sprites);
		}
	},
	individualBullet: function(speed, position, damage, scale) {

		var sprite;

		if (Bullets.playerBullets.discardedSprites.length > 0) {
			sprite = Bullets.playerBullets.discardedSprites.pop();
		} else {
			sprite = new PIXI.Sprite(Bullets.playerBullets.texture);
			sprite.anchor = {
				x: 0.5,
				y: 0.5
			};
			Bullets.playerBullets.sprite.push(sprite);
			Bullets.playerBullets.sprites.addChild(sprite);
		}

		sprite.bulletStrength = PlayerShip.playerShip.superCharged ? damage * 2 : damage;
		sprite.superCharged = PlayerShip.playerShip.superCharged;
		sprite.tint = rgbToHex(255, 220 + Math.random() * 35, 75);
		sprite.xLoc = position.x + (speed.x * 0.02);
		sprite.yLoc = position.y - (speed.y * 0.02);
		sprite.xSpeed = speed.x;
		sprite.ySpeed = speed.y;

		sprite.ricochet = Bullets.playerBullets.ricochet;

		sprite.visible = true;
		sprite.scale.x = sprite.scale.y = sprite.superCharged ? 2 : scale;
		sprite.position.x = sprite.xLoc * scalingFactor;
		sprite.position.y = sprite.yLoc * scalingFactor;
	},
	newBullet: function(speed, position, weapon) {

		var wobble = (1 - weapon.accuracy) * 0.2;
		speed = RotateVector2d(speed.x, speed.y, -wobble + Math.random() * wobble * 2);
		Sounds.playerBullets.play();

		Bullets.playerBullets.ricochet = weapon.ricochet;

		var damagePerShot = weapon.rear ? weapon.damagePerShot * 0.5 : weapon.damagePerShot;

		switch (weapon.bullets) {
			case 1:
				Bullets.playerBullets.individualBullet(speed, position, damagePerShot, 1.7);
				break;
			case 2:
				var angle = Math.atan2(speed.x, speed.y);
				var leftPosAdj = RotateVector2d(0, -5, angle + Math.PI / 2);
				var rightPosAdj = RotateVector2d(0, -5, angle - Math.PI / 2);
				Bullets.playerBullets.individualBullet(speed, {
					x: position.x + leftPosAdj.x,
					y: position.y + leftPosAdj.y
				}, damagePerShot / 2, 1.2);
				Bullets.playerBullets.individualBullet(speed, {
					x: position.x + rightPosAdj.x,
					y: position.y + rightPosAdj.y
				}, damagePerShot / 2, 1.2);
				break;
			case 3:
				var angle = Math.atan2(speed.x, speed.y);
				var leftPosAdj = RotateVector2d(0, -10, angle + Math.PI / 2);
				var rightPosAdj = RotateVector2d(0, -10, angle - Math.PI / 2);
				Bullets.playerBullets.individualBullet(speed, {
					x: position.x + leftPosAdj.x,
					y: position.y + leftPosAdj.y
				}, damagePerShot / 3, 1);
				Bullets.playerBullets.individualBullet(speed, {
					x: position.x,
					y: position.y
				}, damagePerShot / 3, 1);
				Bullets.playerBullets.individualBullet(speed, {
					x: position.x + rightPosAdj.x,
					y: position.y + rightPosAdj.y
				}, damagePerShot / 3, 1);
				break;
		}

	},
	fireBullets: function() {

		var speed = {
			x: 0,
			y: gameModel.p1.turretWeapon.bulletSpeed
		};

		if (playerOneAxes[2] > 0.25 || playerOneAxes[2] < -0.25 || playerOneAxes[3] > 0.25 || playerOneAxes[3] < -0.25) {

			aimLocX = aimLocY = 0;
			cursorPosition.x = cursorPosition.y = -100;

			var multi = Math.sqrt(Math.pow(playerOneAxes[2], 2) + Math.pow(playerOneAxes[3], 2));

			speed.x = playerOneAxes[2] / multi * gameModel.p1.turretWeapon.bulletSpeed;
			speed.y = -1 * playerOneAxes[3] / multi * gameModel.p1.turretWeapon.bulletSpeed;

		} else if (aimLocX && aimLocY) {

			var xDiff = (aimLocX / scalingFactor) - PlayerShip.playerShip.xLoc;
			var yDiff = (PlayerShip.playerShip.yLoc) - (aimLocY / scalingFactor);
			var multi = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

			speed.x = xDiff / multi * gameModel.p1.turretWeapon.bulletSpeed;
			speed.y = yDiff / multi * gameModel.p1.turretWeapon.bulletSpeed;
		}

		var position = {
			x: PlayerShip.playerShip.xLoc,
			y: PlayerShip.playerShip.yLoc
		};
		var damage = gameModel.p1.turretWeapon.damagePerShot;
		var accuracy = gameModel.p1.turretWeapon.accuracy;

		Bullets.playerBullets.newBullet(speed, position, gameModel.p1.turretWeapon);

		if (PlayerShip.playerShip.spreadShot) {
			Bullets.playerBullets.newBullet(RotateVector2d(speed.x, speed.y, -0.12), position, gameModel.p1.turretWeapon);
			Bullets.playerBullets.newBullet(RotateVector2d(speed.x, speed.y, 0.12), position, gameModel.p1.turretWeapon);
		} else if (PlayerShip.playerShip.crossShot) {
			Bullets.playerBullets.newBullet(RotateVector2d(speed.x, speed.y, Math.PI), position, gameModel.p1.turretWeapon);
			Bullets.playerBullets.newBullet(RotateVector2d(speed.x, speed.y, Math.PI / 2), position, gameModel.p1.turretWeapon);
			Bullets.playerBullets.newBullet(RotateVector2d(speed.x, speed.y, -Math.PI / 2), position, gameModel.p1.turretWeapon);
		}
		Bullets.playerBullets.lastPlayerShot = 0;
	}
};

Bullets.getTurretAngle = function() {
	if (playerOneAxes[2] > 0.25 || playerOneAxes[2] < -0.25 || playerOneAxes[3] > 0.25 || playerOneAxes[3] < -0.25) {
		aimLocX = aimLocY = 0;
		cursorPosition.x = cursorPosition.y = -100;
		return Math.atan2(playerOneAxes[2], -playerOneAxes[3]);
	} else if (aimLocX && aimLocY) {
		var xDiff = (aimLocX / scalingFactor) - PlayerShip.playerShip.xLoc;
		var yDiff = (PlayerShip.playerShip.yLoc) - (aimLocY / scalingFactor);
		return Math.atan2(xDiff, yDiff);
	}
	return 0;
};

Bullets.explosionBits = {
	bitsPerExplosion: 10,
	sprite: [],
	discardedSprites: [],
	update: function(timeDiff) {
		for (var i = 0; i < Bullets.explosionBits.sprite.length; i++) {
			if (Bullets.explosionBits.sprite[i].visible) {
				Bullets.explosionBits.sprite[i].scale.x -= 4 * timeDiff;
				Bullets.explosionBits.sprite[i].scale.y -= 4 * timeDiff;
				if (Bullets.explosionBits.sprite[i].scale.x <= 0) {
					Bullets.explosionBits.sprite[i].visible = false;
					Bullets.explosionBits.discardedSprites.push(Bullets.explosionBits.sprite[i]);
				} else {
					Bullets.explosionBits.sprite[i].position.x += Bullets.explosionBits.sprite[i].xSpeed * timeDiff;
					Bullets.explosionBits.sprite[i].position.y += Bullets.explosionBits.sprite[i].ySpeed * timeDiff;
				}
			}
		}
	},
	initialize: function() {
		Bullets.explosionBits.sprites = new PIXI.Container();
		starContainer.addChild(Bullets.explosionBits.sprites);
	},
	newExplosionBit: function(x, y) {

		var sprite;

		if (Bullets.explosionBits.discardedSprites.length > 0) {
			sprite = Bullets.explosionBits.discardedSprites.pop();
		} else {
			sprite = new PIXI.Sprite(Stars.stars.texture);
			Bullets.explosionBits.sprite.push(sprite);
			Bullets.explosionBits.sprites.addChild(sprite);
		}

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
	for (var i = 0; i < Bullets.explosionBits.bitsPerExplosion; i++) {
		Bullets.explosionBits.newExplosionBit(x * scalingFactor, y * scalingFactor);
	}
	Bullets.blasts.newBlast(x, y);
};

Bullets.updatePlasmaBullets = function(timeDiff) {

	Bullets.playerBullets.lastPlayerShot += timeDiff * 1000;

	Bullets.playerBullets.sprite.forEach(function(sprite) {
		if (sprite.visible) {
			sprite.xLoc += sprite.xSpeed * timeDiff;
			sprite.yLoc -= sprite.ySpeed * timeDiff;

			sprite.position.x = sprite.xLoc * scalingFactor;
			sprite.position.y = sprite.yLoc * scalingFactor;


			if (sprite.yLoc < -8 || sprite.yLoc > canvasHeight + 8 ||
				sprite.xLoc < -8 || sprite.xLoc > canvasWidth + 8) {
				if (Math.random() < sprite.ricochet) {
			 		if (sprite.yLoc < -8 || sprite.yLoc > canvasHeight + 8)
						sprite.ySpeed *= -1;
					if (sprite.xLoc < -8 || sprite.xLoc > canvasWidth + 8)
						sprite.xSpeed *= -1;
				} else {
					sprite.visible = false;
					Bullets.playerBullets.discardedSprites.push(sprite);
				}
			}
		}
	});

	if (PlayerShip.playerShip.inPlay && PlayerShip.playerShip.rolling > 1 && (timeLeft > 0 || Boss.bossActive())) {

		if (gameModel.p1.frontWeapon && gameModel.p1.frontWeapon.weaponType === Weapons.types.plasmaCannon) {
			gameModel.p1.frontWeapon.lastPlayerShot = (gameModel.p1.frontWeapon.lastPlayerShot ? gameModel.p1.frontWeapon.lastPlayerShot : 0) + timeDiff;
			if (gameModel.p1.frontWeapon.lastPlayerShot >= 1 / gameModel.p1.frontWeapon.shotsPerSecond) {
				Bullets.playerBullets.newBullet({
					x: 0,
					y: gameModel.p1.frontWeapon.bulletSpeed
				}, {
					x: PlayerShip.playerShip.xLoc,
					y: PlayerShip.playerShip.yLoc - 8
				}, gameModel.p1.frontWeapon);
				gameModel.p1.frontWeapon.lastPlayerShot = 0;
			}
		}

		if (gameModel.p1.turretWeapon && gameModel.p1.turretWeapon.weaponType === Weapons.types.plasmaCannon) {
			gameModel.p1.turretWeapon.lastPlayerShot = (gameModel.p1.turretWeapon.lastPlayerShot ? gameModel.p1.turretWeapon.lastPlayerShot : 0) + timeDiff;
			if (gameModel.p1.turretWeapon.lastPlayerShot >= 1 / gameModel.p1.turretWeapon.shotsPerSecond) {
				Bullets.playerBullets.fireBullets();
				gameModel.p1.turretWeapon.lastPlayerShot = 0;
			}
		}

		if (gameModel.p1.rearWeapon && gameModel.p1.rearWeapon.weaponType === Weapons.types.plasmaCannon) {
			gameModel.p1.rearWeapon.lastPlayerShot = (gameModel.p1.rearWeapon.lastPlayerShot ? gameModel.p1.rearWeapon.lastPlayerShot : 0) + timeDiff;
			if (gameModel.p1.rearWeapon.lastPlayerShot >= 1 / gameModel.p1.rearWeapon.shotsPerSecond) {
				Bullets.playerBullets.newBullet(RotateVector2d(0, gameModel.p1.rearWeapon.bulletSpeed, Math.PI / 8), {
					x: PlayerShip.playerShip.xLoc - 16,
					y: PlayerShip.playerShip.yLoc + 16
				}, gameModel.p1.rearWeapon);
				Bullets.playerBullets.newBullet(RotateVector2d(0, gameModel.p1.rearWeapon.bulletSpeed, -Math.PI / 8), {
					x: PlayerShip.playerShip.xLoc + 16,
					y: PlayerShip.playerShip.yLoc + 16
				}, gameModel.p1.rearWeapon);
				gameModel.p1.rearWeapon.lastPlayerShot = 0;
			}
		}

	}

};

Bullets.railgunBeams = {
	sprites: [],
	discardedSprites: [],
	// 	filters : [new PIXI.filters.BlurFilter()],
	newBeam: function(angle, position, weapon) {
		if (!Bullets.railgunBeams.spriteContainer) {
			Bullets.railgunBeams.spriteContainer = new PIXI.Container();
			bulletContainer.addChild(Bullets.railgunBeams.spriteContainer);
			// 			Bullets.railgunBeams.filters[0].blur = 5;
		}
		var sprite;
		if (Bullets.railgunBeams.discardedSprites.length > 0) {
			sprite = Bullets.railgunBeams.discardedSprites.pop();
		} else {
			sprite = new PIXI.Sprite(Stars.stars.texture);
			sprite.tint = 0x6030E0;
			// 			sprite.filters = Bullets.railgunBeams.filters;
			Bullets.railgunBeams.sprites.push(sprite);
			Bullets.railgunBeams.spriteContainer.addChild(sprite);
		}
		Sounds.playerLaser.play();
		sprite.anchor = {
			x: 0.5,
			y: 1
		};
		sprite.scale.y = 640 * scalingFactor;
		sprite.xLoc = position.x;
		sprite.yLoc = position.y;
		sprite.position.x = position.x * scalingFactor;
		sprite.position.y = position.y * scalingFactor;
		sprite.visible = true;
		sprite.alpha = 1;
		sprite.speed = RotateVector2d(0, -500, angle);

		sprite.superCharged = PlayerShip.playerShip.superCharged;
		sprite.scale.x = sprite.superCharged ? 12 * scalingFactor : 7 * scalingFactor;
		var wobble = (1 - weapon.accuracy) * 0.03;
		sprite.rotation = angle - wobble + (Math.random() * wobble * 2);

		// perform hitscan
		var vector = RotateVector2d(0, -5, angle);
		var location = {
			x: position.x,
			y: position.y
		};
		var damage = sprite.superCharged ? weapon.damagePerShot * 2 : weapon.damagePerShot;
		if (weapon.rear)
			damage *= 0.5;

		for (var i = 0; i < 128; i++) {
			location.x += vector.x;
			location.y += vector.y;
			if (location.x < 0 || location.x > canvasWidth || location.y < 0 || location.y > canvasHeight)
				i = 128;

			if (Math.random() > 0.7)
				Stars.shipTrails.newPowerupPart(location.x * scalingFactor, location.y * scalingFactor, 0x6060A0);

			for (var j = 0; i < EnemyShips.activeShips.length; j ++) {
				if (!EnemyShips.activeShips[j].damagedByRailgun && distanceBetweenPoints(location.x, location.y, EnemyShips.activeShips[j].xLoc, EnemyShips.activeShips[j].yLoc) <= 24) {
					EnemyShips.damageEnemyShip(EnemyShips.activeShips[j], location.x, location.y, damage);
					EnemyShips.activeShips[j].damagedByRailgun = true;
					damage *= 0.5;
				}
			}
		}
		EnemyShips.activeShips.forEach(function(ship) {
			ship.damagedByRailgun = false;
		});
	},
	update: function(timeDiff) {
		Bullets.railgunBeams.sprites.forEach(function(sprite) {
			if (sprite.visible) {
				sprite.position.x += sprite.speed.x * timeDiff * scalingFactor;
				sprite.position.y += sprite.speed.y * timeDiff * scalingFactor;
				sprite.scale.x = Math.max(sprite.scale.x - 12 * scalingFactor * timeDiff, 0);
				sprite.alpha -= 0.5 * timeDiff;
				if (sprite.scale.x <= 0) {
					sprite.visible = false;
					Bullets.railgunBeams.discardedSprites.push(sprite);
				}
			}
		});

		if (PlayerShip.playerShip.inPlay && PlayerShip.playerShip.rolling > 1 && (timeLeft > 0 || Boss.bossActive())) {

			if (gameModel.p1.frontWeapon && gameModel.p1.frontWeapon.weaponType === Weapons.types.laserCannon) {
				gameModel.p1.frontWeapon.lastPlayerShot = (gameModel.p1.frontWeapon.lastPlayerShot ? gameModel.p1.frontWeapon.lastPlayerShot : 0) + timeDiff;
				if (gameModel.p1.frontWeapon.lastPlayerShot >= 1 / gameModel.p1.frontWeapon.shotsPerSecond) {
					Bullets.railgunBeams.newBeam(0, {
						x: PlayerShip.playerShip.xLoc,
						y: PlayerShip.playerShip.yLoc - 8
					}, gameModel.p1.frontWeapon);
					gameModel.p1.frontWeapon.lastPlayerShot = 0;
				}
			}

			if (gameModel.p1.turretWeapon && gameModel.p1.turretWeapon.weaponType === Weapons.types.laserCannon) {
				gameModel.p1.turretWeapon.lastPlayerShot = (gameModel.p1.turretWeapon.lastPlayerShot ? gameModel.p1.turretWeapon.lastPlayerShot : 0) + timeDiff;
				if (gameModel.p1.turretWeapon.lastPlayerShot >= 1 / gameModel.p1.turretWeapon.shotsPerSecond) {
					Bullets.railgunBeams.newBeam(Bullets.getTurretAngle(), {
						x: PlayerShip.playerShip.xLoc,
						y: PlayerShip.playerShip.yLoc
					}, gameModel.p1.turretWeapon);
					if (PlayerShip.playerShip.spreadShot) {
						Bullets.railgunBeams.newBeam(Bullets.getTurretAngle() - 0.08, {
							x: PlayerShip.playerShip.xLoc,
							y: PlayerShip.playerShip.yLoc
						}, gameModel.p1.turretWeapon);
						Bullets.railgunBeams.newBeam(Bullets.getTurretAngle() + 0.08, {
							x: PlayerShip.playerShip.xLoc,
							y: PlayerShip.playerShip.yLoc
						}, gameModel.p1.turretWeapon);
					} else if (PlayerShip.playerShip.crossShot) {
						Bullets.railgunBeams.newBeam(Bullets.getTurretAngle() + Math.PI, {
							x: PlayerShip.playerShip.xLoc,
							y: PlayerShip.playerShip.yLoc
						}, gameModel.p1.turretWeapon);
						Bullets.railgunBeams.newBeam(Bullets.getTurretAngle() + Math.PI / 2, {
							x: PlayerShip.playerShip.xLoc,
							y: PlayerShip.playerShip.yLoc
						}, gameModel.p1.turretWeapon);
						Bullets.railgunBeams.newBeam(Bullets.getTurretAngle() - Math.PI / 2, {
							x: PlayerShip.playerShip.xLoc,
							y: PlayerShip.playerShip.yLoc
						}, gameModel.p1.turretWeapon);
					}
					gameModel.p1.turretWeapon.lastPlayerShot = 0;
				}
			}

			if (gameModel.p1.rearWeapon && gameModel.p1.rearWeapon.weaponType === Weapons.types.laserCannon) {
				gameModel.p1.rearWeapon.lastPlayerShot = (gameModel.p1.rearWeapon.lastPlayerShot ? gameModel.p1.rearWeapon.lastPlayerShot : 0) + timeDiff;
				if (gameModel.p1.rearWeapon.lastPlayerShot >= 1 / gameModel.p1.rearWeapon.shotsPerSecond) {
					Bullets.railgunBeams.newBeam(-Math.PI / 12, {
						x: PlayerShip.playerShip.xLoc - 16,
						y: PlayerShip.playerShip.yLoc + 16
					}, gameModel.p1.rearWeapon);
					Bullets.railgunBeams.newBeam(Math.PI / 12, {
						x: PlayerShip.playerShip.xLoc + 16,
						y: PlayerShip.playerShip.yLoc + 16
					}, gameModel.p1.rearWeapon);
					gameModel.p1.rearWeapon.lastPlayerShot = 0;
				}
			}

		}
	}
};

Bullets.missiles = {
	texture: function() {
		var blast = document.createElement('canvas');
		blast.width = 3;
		blast.height = 4;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = "#ffffff";
		blastCtx.fillRect(1, 0, 1, 1); // top point
		blastCtx.fillRect(0, 1, 3, 2); // middle section
		blastCtx.fillStyle = "#ffff00";
		blastCtx.fillRect(0, 3, 1, 1); // bottom left point
		blastCtx.fillRect(2, 3, 1, 1); // bottom right point
		// 		blastCtx.fillStyle = "#ff0000";
		// 		blastCtx.fillRect(1, 3, 1, 1); // bottom right point

		return PIXI.Texture.fromCanvas(blast);
	}(),
	startVelocity: 100,
	maxVelocity: 250,
	acceleration: 250,
	sprites: [],
	discardedSprites: [],
	reset : function() {
		Bullets.missiles.sprites.forEach(function(sprite){
			sprite.visible = false;
		});
		Bullets.missiles.discardedSprites = Bullets.missiles.sprites.slice();
	},
	newMissile: function(angle, position, weapon) {
		if (!Bullets.missiles.spriteContainer) {
			Bullets.missiles.spriteContainer = new PIXI.Container();
			bulletContainer.addChild(Bullets.missiles.spriteContainer);
		}
		var sprite;
		if (Bullets.missiles.discardedSprites.length > 0) {
			sprite = Bullets.missiles.discardedSprites.pop();
		} else {
			sprite = new PIXI.Sprite(Bullets.missiles.texture);
			sprite.tint = 0xFFFFFF;
			sprite.anchor = {
				x: 0.5,
				y: 0.5
			};
			Bullets.missiles.sprites.push(sprite);
			Bullets.missiles.spriteContainer.addChild(sprite);
		}
		Sounds.playerMissile.play();
		sprite.visible = true;
		sprite.xLoc = position.x;
		sprite.yLoc = position.y;
		sprite.lastTrail = 0;
		sprite.position.x = position.x * scalingFactor;
		sprite.position.y = position.y * scalingFactor;
		sprite.lowHealthSeek = weapon.lowHealthSeek;

		sprite.tint = weapon.ultra || weapon.hyper ? 0xffffff : 0x999999;

		var wobble = (1 - weapon.accuracy) * 0.5;
		angle += -wobble + Math.random() * wobble * 2;

		sprite.rotation = angle;
		sprite.target = false;
		sprite.speed = RotateVector2d(0, -Bullets.missiles.startVelocity, angle);
		sprite.superCharged = PlayerShip.playerShip.superCharged;
		sprite.damage = sprite.superCharged ? weapon.damagePerShot * 2 : weapon.damagePerShot;
		if (weapon.rear) {
			sprite.damage = sprite.damage * 0.5;
		}
		sprite.scale.y = 3 * scalingFactor * (sprite.superCharged ? 2 : 1);
		sprite.scale.x = 1.5 * scalingFactor * (sprite.superCharged ? 2 : 1);
	},
	generateExplosion : function (xLoc, yLoc) {
		var size = Math.random();
		var explosionSize = 35 + size * 10;
		var numParts = 16;
		for (var i = 0; i < numParts; i++) {
				Ships.explosionBits.newExplosionBit(xLoc, yLoc, ["#FFFF00","#FF0000", "#FF9900", "#FFFF76"], explosionSize);
		}
	},
	update: function(timeDiff) {
// 		if (!Bullets.missiles.trackingLines) {
// 			Bullets.missiles.trackingLines = new PIXI.Graphics();
// 			if (!Bullets.missiles.spriteContainer) {
// 				Bullets.missiles.spriteContainer = new PIXI.Container();
// 				bulletContainer.addChild(Bullets.missiles.spriteContainer);
// 			}
// 			Bullets.missiles.spriteContainer.addChild(Bullets.missiles.trackingLines);
// 		}

// 		Bullets.missiles.trackingLines.clear();
// 		Bullets.missiles.trackingLines.lineStyle(1, 0xFF0000);

		for (var missileCount = 0; missileCount < Bullets.missiles.sprites.length; missileCount++) {
			var sprite = Bullets.missiles.sprites[missileCount];

			if (sprite.visible) {

				if (sprite.target && sprite.target.inPlay === 1) {
					var timeToTarget = distanceBetweenPoints(sprite.xLoc, sprite.yLoc, sprite.target.xLoc, sprite.target.yLoc) / Bullets.missiles.maxVelocity;
					var predictedTargetX = sprite.target.xLoc + sprite.target.xSpeed * timeToTarget;
					var predictedTargetY = sprite.target.yLoc + sprite.target.ySpeed * timeToTarget;
					var accelX = predictedTargetX - sprite.xLoc;
					var accelY = predictedTargetY - sprite.yLoc;
					var factor = timeToTarget < 0.7 ? Bullets.missiles.acceleration * 3 / magnitude(accelX, accelY) : Bullets.missiles.acceleration / magnitude(accelX, accelY);
					sprite.speed.x += accelX * factor * timeDiff;
					sprite.speed.y += accelY * factor * timeDiff;
				} else {
					sprite.speed.y -= Bullets.missiles.acceleration * timeDiff;

					// look for target
					if (sprite.lowHealthSeek) {
						for (var enemyShipCount=0; enemyShipCount < EnemyShips.activeShips.length; enemyShipCount++) {
							if (!sprite.target || sprite.target.health > EnemyShips.activeShips[enemyShipCount].health)
								sprite.target = EnemyShips.activeShips[enemyShipCount];
						}
					} else {
						var angle = Math.atan2(sprite.speed.x, -sprite.speed.y);
						var vector = RotateVector2d(0, -5, angle);
						var location = {
							x: sprite.xLoc,
							y: sprite.yLoc
						};
						sprite.target = false;
						var closestShip = false;
						var shipDistance = 100;
						for (var i = 0; i < 128; i++) {
							location.x += vector.x;
							location.y += vector.y;
							if (location.x < -20 || location.x > canvasWidth + 20 || location.y < -20 || location.y > canvasHeight + 20)
								i = 128;

							for (var j = 0; j < EnemyShips.activeShips.length; j++) {
								if (!sprite.target && distanceBetweenPoints(location.x, location.y, EnemyShips.activeShips[j].xLoc, EnemyShips.activeShips[j].yLoc) <= shipDistance) {
									closestShip = EnemyShips.activeShips[j];
									shipDistance = distanceBetweenPoints(location.x, location.y, EnemyShips.activeShips[j].xLoc, EnemyShips.activeShips[j].yLoc);
								}
							}
							sprite.target = closestShip;
						}
					}

				}

// 				if (sprite.target) {
// 					Bullets.missiles.trackingLines.moveTo(sprite.position.x, sprite.position.y);
// 					var timeToTarget = distanceBetweenPoints(sprite.xLoc, sprite.yLoc, sprite.target.xLoc, sprite.target.yLoc) / Bullets.missiles.maxVelocity;
// 					var predictedTargetX = sprite.target.xLoc + sprite.target.xSpeed * timeToTarget;
// 					var predictedTargetY = sprite.target.yLoc + sprite.target.ySpeed * timeToTarget;
// 					Bullets.missiles.trackingLines.lineTo(predictedTargetX * scalingFactor, predictedTargetY * scalingFactor);
// 				}

				if (magnitude(sprite.speed.x, sprite.speed.y) > Bullets.missiles.maxVelocity) {
					var speedFactor = Bullets.missiles.maxVelocity / magnitude(sprite.speed.x, sprite.speed.y);
					sprite.speed.x *= speedFactor;
					sprite.speed.y *= speedFactor;
				}

				sprite.xLoc += sprite.speed.x * timeDiff;
				sprite.yLoc += sprite.speed.y * timeDiff;
				sprite.rotation = Math.atan2(sprite.speed.x, -sprite.speed.y);
				sprite.position.x = sprite.xLoc * scalingFactor;
				sprite.position.y = sprite.yLoc * scalingFactor;

				sprite.lastTrail += timeDiff;
				if (sprite.lastTrail > 0.2) {
					Stars.shipTrails.newPowerupPart(sprite.position.x, sprite.position.y, 0x909090, 0.6);
					sprite.lastTrail = 0;
				}

				if (sprite.xLoc > canvasWidth || sprite.xLoc < 0 || sprite.yLoc < 0 || sprite.yLoc > canvasHeight) {
					sprite.visible = false;
					Bullets.missiles.discardedSprites.push(sprite);
				}

				for (var k = 0; k < EnemyShips.activeShips.length; k++) {
					if (sprite.visible && Ships.detectCollision(EnemyShips.activeShips[k], sprite.xLoc, sprite.yLoc)) {
						sprite.visible = false;
						Bullets.missiles.discardedSprites.push(sprite);
						EnemyShips.damageEnemyShip(EnemyShips.activeShips[k], sprite.xLoc, sprite.yLoc, sprite.damage);
						Bullets.missiles.generateExplosion(sprite.xLoc, sprite.yLoc);
					}
				}
			}
		}

		if (PlayerShip.playerShip.inPlay && PlayerShip.playerShip.rolling > 1 && (timeLeft > 0 || Boss.bossActive())) {

			if (gameModel.p1.frontWeapon && gameModel.p1.frontWeapon.weaponType === Weapons.types.missileLauncher) {
				gameModel.p1.frontWeapon.lastPlayerShot = (gameModel.p1.frontWeapon.lastPlayerShot ? gameModel.p1.frontWeapon.lastPlayerShot : 0) + timeDiff;
				if (gameModel.p1.frontWeapon.lastPlayerShot >= 1 / gameModel.p1.frontWeapon.shotsPerSecond) {
					Bullets.missiles.newMissile(0, {
						x: PlayerShip.playerShip.xLoc,
						y: PlayerShip.playerShip.yLoc - 8
					}, gameModel.p1.frontWeapon);
					gameModel.p1.frontWeapon.lastPlayerShot = 0;
				}
			}

			if (gameModel.p1.turretWeapon && gameModel.p1.turretWeapon.weaponType === Weapons.types.missileLauncher) {
				gameModel.p1.turretWeapon.lastPlayerShot = (gameModel.p1.turretWeapon.lastPlayerShot ? gameModel.p1.turretWeapon.lastPlayerShot : 0) + timeDiff;
				if (gameModel.p1.turretWeapon.lastPlayerShot >= 1 / gameModel.p1.turretWeapon.shotsPerSecond) {
					Bullets.missiles.newMissile(Bullets.getTurretAngle(), {
						x: PlayerShip.playerShip.xLoc,
						y: PlayerShip.playerShip.yLoc
					}, gameModel.p1.turretWeapon);
					if (PlayerShip.playerShip.spreadShot) {
						Bullets.missiles.newMissile(Bullets.getTurretAngle() - 0.08, {
							x: PlayerShip.playerShip.xLoc,
							y: PlayerShip.playerShip.yLoc
						}, gameModel.p1.turretWeapon);
						Bullets.missiles.newMissile(Bullets.getTurretAngle() + 0.08, {
							x: PlayerShip.playerShip.xLoc,
							y: PlayerShip.playerShip.yLoc
						}, gameModel.p1.turretWeapon);
					} else if (PlayerShip.playerShip.crossShot) {
						Bullets.missiles.newMissile(Bullets.getTurretAngle() + Math.PI, {
							x: PlayerShip.playerShip.xLoc,
							y: PlayerShip.playerShip.yLoc
						}, gameModel.p1.turretWeapon);
						Bullets.missiles.newMissile(Bullets.getTurretAngle() + Math.PI / 2, {
							x: PlayerShip.playerShip.xLoc,
							y: PlayerShip.playerShip.yLoc
						}, gameModel.p1.turretWeapon);
						Bullets.missiles.newMissile(Bullets.getTurretAngle() - Math.PI / 2, {
							x: PlayerShip.playerShip.xLoc,
							y: PlayerShip.playerShip.yLoc
						}, gameModel.p1.turretWeapon);
					}
					gameModel.p1.turretWeapon.lastPlayerShot = 0;
				}
			}

			if (gameModel.p1.rearWeapon && gameModel.p1.rearWeapon.weaponType === Weapons.types.missileLauncher) {
				gameModel.p1.rearWeapon.lastPlayerShot = (gameModel.p1.rearWeapon.lastPlayerShot ? gameModel.p1.rearWeapon.lastPlayerShot : 0) + timeDiff;
				if (gameModel.p1.rearWeapon.lastPlayerShot >= 1 / gameModel.p1.rearWeapon.shotsPerSecond) {
					Bullets.missiles.newMissile(-Math.PI / 3, {
						x: PlayerShip.playerShip.xLoc - 16,
						y: PlayerShip.playerShip.yLoc + 16
					}, gameModel.p1.rearWeapon);
					Bullets.missiles.newMissile(Math.PI / 3, {
						x: PlayerShip.playerShip.xLoc + 16,
						y: PlayerShip.playerShip.yLoc + 16
					}, gameModel.p1.rearWeapon);
					gameModel.p1.rearWeapon.lastPlayerShot = 0;
				}
			}

		}
	}
};


Bullets.updateEnemyBullets = function(timeDiff) {
	for (var i = 0; i < Bullets.enemyBullets.maxEnemyBullets; i++) {

		if (Bullets.enemyBullets.inPlay[i] === 1) {

			if (timeLeft < 0 && !Boss.bossActive()) {
				Bullets.enemyBullets.inPlay[i] = 0;
				Bullets.generateExplosion(Bullets.enemyBullets.xLoc[i], Bullets.enemyBullets.yLoc[i]);
				Bullets.enemyBullets.sprite[i].visible = false;
			} else {
				Bullets.enemyBullets.xLoc[i] += Bullets.enemyBullets.xSpeed[i] * timeDiff;
				Bullets.enemyBullets.yLoc[i] -= Bullets.enemyBullets.ySpeed[i] * timeDiff;

				if (Bullets.enemyBullets.yLoc[i] < 0 || Bullets.enemyBullets.yLoc[i] > canvasHeight ||
					Bullets.enemyBullets.xLoc[i] < 0 || Bullets.enemyBullets.xLoc[i] > canvasWidth) {
					Bullets.enemyBullets.inPlay[i] = 0;
					Bullets.enemyBullets.sprite[i].visible = false;
				} else {
					if (Ships.detectCollision(PlayerShip.playerShip, Bullets.enemyBullets.xLoc[i], Bullets.enemyBullets.yLoc[i])) {
						Bullets.enemyBullets.inPlay[i] = 0;
						Bullets.enemyBullets.sprite[i].visible = false;
						Bullets.generateExplosion(Bullets.enemyBullets.xLoc[i], Bullets.enemyBullets.yLoc[i]);
						PlayerShip.damagePlayerShip(PlayerShip.playerShip, Bullets.enemyBullets.enemyShotStrength);
					} else {

						Bullets.enemyBullets.sprite[i].lastTrail += timeDiff * 1000;
						if (Bullets.enemyBullets.sprite[i].lastTrail > 65) {
							Bullets.enemyBullets.sprite[i].lastTrail = 0;
							Stars.shipTrails.newPowerupPart(
								Bullets.enemyBullets.sprite[i].position.x - (4 * scalingFactor) + (8 * scalingFactor * Math.random()),
								Bullets.enemyBullets.sprite[i].position.y - (4 * scalingFactor) + (8 * scalingFactor * Math.random())
							);
						}

						Bullets.enemyBullets.sprite[i].position.x = Bullets.enemyBullets.xLoc[i] * scalingFactor;
						Bullets.enemyBullets.sprite[i].position.y = Bullets.enemyBullets.yLoc[i] * scalingFactor;
						Bullets.enemyBullets.sprite[i].tint = calculateTint(0);
					}
				}
			}
		}
	}
};
