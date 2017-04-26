var EnemyShips = {};

EnemyShips.maxShipsPerWave = 16;
EnemyShips.minShipsPerWave = 4;
EnemyShips.shipHealth = 2;
EnemyShips.maxBulletsPerShot=1;

EnemyShips.waveBulletFrequency = 3000;

EnemyShips.wavePatterns = [
	{
		xCoords:[0.9, 0.9,0.1,0.1,0.9,0.9,0.1,0.1,0.9,0.9,0.1,0.1,0.9,0.9,0.1,0.1,0.9,0.9],
		yCoords:[-0.2,0.1,0.1,0.2,0.2,0.3,0.3,0.4,0.5,0.6,0.6,0.7,0.7,0.8,0.8,0.9,0.9,1.3]
	},
    {
        xCoords: [-0.2, 0.1, 0.3, 0.5, 0.7, 0.9, 0.7, 0.5, 0.3, 0.1, -0.3],
        yCoords: [0.45, 0.45, 0.2, 0.1, 0.2, 0.5, 0.7, 0.9, 0.7, 0.55, 0.55]
    },
    {
        xCoords: [-0.2, 0.8, 0.9],
        yCoords: [0.2 , 0.1, 1.3]
    },
	{
        xCoords: [0.9, 0.2, 0.1],
        yCoords: [-0.2 , 0.5, 1.3]
    },
	{
        xCoords: [0.5, 0.5, 0.1, 0.9, 0.2, 0.9, 0.2],
        yCoords: [-0.2 , 0.1, 0.3, 0.5, 0.7, 0.9, 1.3]
	},
    {
        xCoords: [-0.2,0.15,0.2,0.7,0.8,0.75,0.8,0.75,0.9],
        yCoords: [0.9,0.85,0.1,0.1,0.3,0.5,0.7,0.9,1.3]
    },
    {
        xCoords: [0.9, 0.9, 0.9, 0.5, 0],
        yCoords: [1.1, 0.9, 0.1, 0.1, 1.3]
    }
];
EnemyShips.patternCounter = Math.floor(Math.random() * EnemyShips.wavePatterns.length);

EnemyShips.wave = function () {

	var size;

	if (Math.random() > 0.5) {
		this.shipFrequency = (500 + (Math.random() * 300));
		this.shipsInWave = (EnemyShips.minShipsPerWave + Math.round(Math.random() * (EnemyShips.maxShipsPerWave - EnemyShips.minShipsPerWave) * Enemies.difficultyFactor)) * 2;
		this.maxSpeed = 150 + Math.random() * 30;
		size = Math.round(32 + Math.random() * 16);
		this.shipHealth = EnemyShips.shipHealth * 0.7;
	} else {
		this.shipFrequency = (1000 + (Math.random() * 1000));
		this.shipsInWave = EnemyShips.minShipsPerWave + Math.round(Math.random() * (EnemyShips.maxShipsPerWave - EnemyShips.minShipsPerWave) * Enemies.difficultyFactor);
		this.maxSpeed = 75 + Math.random() * 30;
		size = Math.round(42 + Math.random() * 22);
		this.shipHealth = EnemyShips.shipHealth;
	}

	this.update = EnemyShips.update;
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

	this.shipsSpawned = 0;
	this.shipsDestroyed = 0;

	this.colors = Ships.enemyColors[Math.floor(Math.random() * Ships.enemyColors.length)];

	this.lastBullet = 0;

	var seed = Date.now();

	this.texture = glowTexture(PIXI.Texture.fromCanvas(Ships.shipArt(size, seed, this.colors)));
	this.damageTexture = glowTexture(PIXI.Texture.fromCanvas(Ships.shipArt(size, seed, this.colors, true)));
	this.spritePool = SpritePool.create(this.texture, frontEnemyContainer);

	this.offset = Math.round(size / 2);
	this.ships = [];
	this.shipsExited = 0;

	this.destroy = function() {
		this.spritePool.destroy();
		this.finished = true;
	};
};

EnemyShips.enemyShip = function (wave) {

	this.damage = EnemyShips.damageEnemyShip;
	this.destroy = EnemyShips.destroy;
	this.detectCollision = Ships.detectCollision;

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
	this.lastTrail=0;
	this.lastParticle=0;
	this.bulletsLeft=0;
	this.lastBullet = 0;
	this.allDeadSurvivalTime = Math.random() * 1000;
	this.id = Enemies.currShipId++;

	var chanceOfSuicide = Math.min(0.6, (gameModel.currentLevel - 1) * 0.05);

	if (Math.random() < chanceOfSuicide) {
		this.suicidal = true;
	}

	this.sprite = wave.spritePool.nextSprite();
	this.sprite.texture = wave.texture;
	this.sprite.visible = true;
	this.sprite.tint = 0xFFFFFF;
	this.sprite.scale.y = -1;
	this.sprite.position.x = this.xLoc * scalingFactor;
	this.sprite.position.y = this.yLoc * scalingFactor;
	this.sprite.anchor = {x:0.5,y:0.5};

	Enemies.enemiesSpawned++;

};

EnemyShips.destroy = function (ship) {

	stageSprite.screenShake += gameModel.maxScreenShake;
	ship.inPlay = 0;

	Enemies.enemiesKilled++;

	if (ship.wave) {
		ship.wave.spritePool.discardSprite(ship.sprite);
		ship.wave.shipsDestroyed++;
		if (ship.wave.shipsDestroyed >= ship.wave.shipsInWave) {
			addCredits(ship.wave.shipHealth * ship.wave.shipsInWave * 0.3);
			GameText.credits.newCreditText(canvasWidth/2,canvasHeight/3,"Wave destroyed\nBonus Credits: " + formatMoney(ship.wave.shipHealth * ship.wave.shipsInWave * 0.5));
		}

		if (Math.random() > 0.8)
			MoneyPickup.newMoneyPickup(ship.xLoc, ship.yLoc, (ship.wave.shipHealth + Math.random() * ship.wave.shipHealth * 5));

		Powerups.newPowerup(ship.xLoc,ship.yLoc);
	} else {
		ship.spritePool.discardSprite(ship.sprite);
		for (var i=0; i<5; i++) {
			Ships.generateExplosion(ship, -50 + Math.random() * 100, -50 + Math.random() * 100, Math.random() * 2000);
		}

		Enemies.allDeadTimer = 0;
	}

	Ships.generateExplosion(ship);
};

EnemyShips.checkForPlayerCollision = function (ship, timeDiff) {
	if (typeof ship.lastPlayerCollision == "undefined") {
		ship.lastPlayerCollision = 1;
	}
	ship.lastPlayerCollision += timeDiff;

  if (ship.lastPlayerCollision > 0.3 && Ships.detectShipCollision(ship, PlayerShip.playerShip)) {

		var damageDone = Math.min(PlayerShip.playerShip.maxShield * 0.3, ship.health);

		// calculate speed to bump player ship away from collision
		PlayerShip.playerShip.bumpSpeedX = PlayerShip.playerShip.xLoc - ship.xLoc;
		PlayerShip.playerShip.bumpSpeedY = PlayerShip.playerShip.yLoc - ship.yLoc;
		PlayerShip.playerShip.bumpMagnitude = 200;
		PlayerShip.playerShip.bumpMagMulti = magnitude(PlayerShip.playerShip.bumpSpeedX, PlayerShip.playerShip.bumpSpeedY);

		PlayerShip.damagePlayerShip(PlayerShip.playerShip, damageDone);
		ship.damage((ship.xLoc + PlayerShip.playerShip.xLoc) / 2, (ship.yLoc + PlayerShip.playerShip.yLoc) / 2, damageDone);
		ship.lastPlayerCollision = 0;
  }
};

EnemyShips.checkForSplashDamage = function (ship){
  for (var i = 0; i < Bullets.splashDamage.maxSplashes; i++) {
    if (Bullets.splashDamage.splashes[i] && Bullets.splashDamage.splashes[i].active) {
      if (distanceBetweenPoints(ship.xLoc, ship.yLoc, Bullets.splashDamage.splashes[i].xLoc, Bullets.splashDamage.splashes[i].yLoc) < Bullets.splashDamage.splashes[i].spread &&
        !Bullets.splashDamage.splashes[i].shipsDamaged[ship.id]) {
          Bullets.splashDamage.splashes[i].shipsDamaged[ship.id] = 1;
          Enemies.damageEnemy(ship, ship.xLoc, ship.yLoc, Bullets.splashDamage.splashes[i].damage);
      }
    }
  }
};

EnemyShips.damageEnemyShip = function(xLoc, yLoc, damage, noEffect) {
	if (this.health > 0) {

		if (!noEffect) {
			Bullets.generateExplosion(xLoc, yLoc);
			Sounds.enemyDamage.play(this.xLoc);
			// this.sprite.rotation = -this.rotation - 0.1 + (Math.random() * 0.2);
			this.sprite.texture = this.damageTexture || this.wave.damageTexture;
			this.lastDamaged = 0;
		}

		this.health -= damage;

		GameText.damage.newText(damage, this);

		if (this.wave) {
			var percentOfShipDamaged = damage / this.wave.shipHealth;

			stageSprite.screenShake += gameModel.maxScreenShake * percentOfShipDamaged;

			if (this.health + damage > this.wave.shipHealth / 2 && this.health < this.wave.shipHealth / 2) {
				this.maxSpeed *= 0.90;
				if (this.suicidal) {
					this.xTar = PlayerShip.playerShip.xLoc;
					this.yTar = PlayerShip.playerShip.yLoc;
				}
			}

			if (!noEffect) {
				var bumpSpeedX = this.xLoc - xLoc;
				var bumpSpeedY = this.yLoc - yLoc;
				var bumpMagMulti = ((damage / this.wave.shipHealth) * 70) / (magnitude(bumpSpeedX, bumpSpeedY) || 1);
				this.xSpeed += bumpSpeedX * bumpMagMulti;
				this.ySpeed += bumpSpeedY * bumpMagMulti;
			}

		}

		if (this.health <= 0) {
			this.destroy(this);
		}
	}
};



EnemyShips.updateShipSpeed = function(ship, timeDiff) {

	var accelX = ship.xTar - ship.xLoc;
	var accelY = ship.yTar - ship.yLoc;
	var factor = ship.maxSpeed * 1.5 / (magnitude(accelX, accelY) || 1);
	ship.xSpeed += accelX * factor * timeDiff;
	ship.ySpeed += accelY * factor * timeDiff;

	if (magnitude(ship.xSpeed, ship.ySpeed) > ship.maxSpeed) {
		ship.xSpeed -= ship.xSpeed * timeDiff * 8;
		ship.ySpeed -= ship.ySpeed * timeDiff * 8;
	}
	ship.xLoc += ship.xSpeed * timeDiff;
	ship.yLoc += ship.ySpeed * timeDiff;
};



EnemyShips.updateShip = function (eShip, timeDiff) {
	if (eShip.inPlay) {

		if (eShip.xLoc > 0 && eShip.xLoc < canvasWidth && eShip.yLoc > 0 && eShip.yLoc < canvasHeight)
			Enemies.activeShips.push(eShip);

		if (Math.sqrt(Math.pow(eShip.xLoc - eShip.xTar, 2) +
						Math.pow(eShip.yLoc - eShip.yTar, 2)) < eShip.maxSpeed) {

			if (eShip.suicidal && eShip.health < eShip.wave.shipHealth / 2) {
				eShip.xTar = PlayerShip.playerShip.xLoc;
				eShip.yTar = PlayerShip.playerShip.yLoc;
			} else {
				eShip.nextCoord++;

				if (eShip.nextCoord >= eShip.wave.wavePattern.xCoords.length) {
					eShip.inPlay = 0;
					eShip.wave.spritePool.discardSprite(eShip.sprite);
					eShip.wave.shipsExited++;
				} else {
					eShip.xTar = canvasWidth * eShip.wave.wavePattern.xCoords[eShip.nextCoord];
					eShip.yTar = canvasHeight * eShip.wave.wavePattern.yCoords[eShip.nextCoord];
				}
			}
		}

		if (eShip.inPlay) {
			EnemyShips.updateShipSpeed(eShip, timeDiff);
			Ships.updateRotation(eShip, timeDiff);

			eShip.sprite.position.x = eShip.xLoc * scalingFactor;
			eShip.sprite.position.y = eShip.yLoc * scalingFactor;
			eShip.sprite.rotation = -eShip.rotation;
			eShip.lastDamaged += timeDiff;
			if (eShip.lastDamaged > 0.06)
				eShip.sprite.texture = eShip.wave.texture;

			if (eShip.health < eShip.wave.shipHealth / 3) {
				eShip.sprite.rotation = -eShip.rotation - 0.05 + (Math.random() * 0.1);

				eShip.lastParticle += timeDiff;
				if (eShip.lastParticle > 0.1) {
					Stars.powerupParts.newPowerupPart(eShip.sprite.position.x - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor),
																				eShip.sprite.position.y - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor),
																				calculateTintFromString(eShip.wave.colors[Math.floor(Math.random() * eShip.wave.colors.length)]));
					eShip.lastParticle = 0;
				}

			}

			EnemyShips.checkForSplashDamage(eShip);
			EnemyShips.checkForPlayerCollision(eShip, timeDiff);
			Stars.shipTrails.updateShip(eShip,timeDiff);

			if (eShip.health < eShip.wave.shipHealth)
				eShip.sprite.tint = calculateTint(eShip.health / eShip.wave.shipHealth);

			if (eShip.inPlay && (eShip.wave.lastBullet >= EnemyShips.waveBulletFrequency + eShip.wave.shipsDestroyed * EnemyShips.waveBulletFrequency * 0.1 && Math.random() > 0.9 || eShip.bulletsLeft > 0)) {
				if (eShip.bulletsLeft <= 0) {
					eShip.bulletsLeft = Math.max(1,Math.round(Math.random() * EnemyShips.maxBulletsPerShot));
				}
				if (eShip.lastBullet >= 0.2) {
					Bullets.enemyBullets.newEnemyBullet(eShip);
					eShip.lastBullet = 0;
					eShip.bulletsLeft--;
				}
				eShip.lastBullet+=timeDiff;

				eShip.wave.lastBullet = 0;
			}
		}
	}
};

Enemies.activeShips = [];

EnemyShips.update = function (timeDiff) {

	this.lastShipSpawned += timeDiff * 1000;
	this.lastBullet += timeDiff * 1000;

	for (var j = 0; j < this.shipsInWave; j++) {
		if (!this.ships[j]) {
			if (this.lastShipSpawned >= this.shipFrequency && timeLeft > 0) {
				this.ships[j] = new EnemyShips.enemyShip(this);
				this.lastShipSpawned = 0;
				this.shipsSpawned++;
			}
		} else {
			EnemyShips.updateShip(this.ships[j],timeDiff);
		}
	}
	if (this.shipsExited + this.shipsDestroyed >= this.shipsInWave || (this.shipsExited + this.shipsDestroyed >= this.shipsSpawned && timeLeft < 0)) {
		this.finished = true;
		this.wavePattern.inUse = false;
		this.spritePool.destroy();
	}
};
