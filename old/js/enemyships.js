var EnemyShips = {};

EnemyShips.allDeadTimer = 0;
EnemyShips.maxShipsPerWave = 16;
EnemyShips.minShipsPerWave = 4;
EnemyShips.shipHealth = 2;
EnemyShips.maxWaves = 3;
EnemyShips.maxBulletsPerShot=1;
EnemyShips.currShipId = 1;

EnemyShips.waveBulletFrequency = 3000;

EnemyShips.lastWave = 6000;
EnemyShips.waveFrequency = 5000;

EnemyShips.wavePatterns = [
	{
		xCoords:[0.9, 0.9,0.1,0.1,0.9,0.9,0.1,0.1,0.9,0.9,0.1,0.1,0.9,0.9,0.1,0.1,0.9,0.9],
		yCoords:[-0.2,0.1,0.1,0.2,0.2,0.3,0.3,0.4,0.5,0.6,0.6,0.7,0.7,0.8,0.8,0.9,0.9,1.1]
	},
    {
        xCoords: [-0.2, 0.1, 0.3, 0.5, 0.7, 0.9, 0.7, 0.5, 0.3, 0.1, -0.2],
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
        yCoords: [-0.2 , 0.1, 0.3, 0.5, 0.7, 0.9, 1.1]
	},
    {
        xCoords: [-0.2,0.15,0.2,0.7,0.8,0.75,0.8,0.75,0.9],
        yCoords: [0.9,0.85,0.1,0.1,0.3,0.5,0.7,0.9,1.1]
    },
    {
        xCoords: [0.9, 0.9, 0.9, 0.5, 0],
        yCoords: [1.1, 0.9, 0.1, 0.1, 1.2]
    }
];
EnemyShips.patternCounter = Math.floor(Math.random() * EnemyShips.wavePatterns.length);
EnemyShips.discardedSprites = [];
EnemyShips.sprites = [];
EnemyShips.waves = [];

EnemyShips.wave = function () {

	this.shipFrequency = 1000 + (Math.random() * 1000);
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

	this.shipsInWave = EnemyShips.minShipsPerWave + Math.round(Math.random() * (EnemyShips.maxShipsPerWave - EnemyShips.minShipsPerWave));
	this.shipsDestroyed = 0;
	var size = Math.round(32 + Math.random() * 32);
	this.colors = Ships.enemyColors[Math.floor(Math.random() * Ships.enemyColors.length)];

	this.shipHealth = EnemyShips.shipHealth;
	this.lastBullet = 0;

	var seed = Date.now();

	this.texture = PIXI.Texture.fromCanvas(Ships.shipArt(size, seed, true, this.colors));
	this.damageTexture = PIXI.Texture.fromCanvas(Ships.shipArt(size, seed, true, this.colors, true));

	this.maxSpeed = 60 + Math.random() * 30;

	this.offset = Math.round(size / 2);
	this.ships = [];
	this.shipsExited = 0;
};

EnemyShips.enemyShip = function (wave) {

	this.wave = wave;
	this.xLoc = canvasWidth * wave.wavePattern.xCoords[0];
	this.xTar = canvasWidth * wave.wavePattern.xCoords[1];
	this.yLoc = canvasHeight * wave.wavePattern.yCoords[0];
	this.yTar = canvasHeight * wave.wavePattern.yCoords[1];
	this.nextCoord = 1;
	this.maxSpeed = wave.maxSpeed;
	this.health = wave.shipHealth;
	this.inPlay = 1;
	this.enemyShip = true;
	this.rotation=0;
	this.offset = wave.offset;
	this.lastTrail=0;
	this.lastParticle=0;
	this.bulletsLeft=0;
	this.lastBullet = 0;
	this.allDeadSurvivalTime = Math.random() * 1000;
	this.id = EnemyShips.currShipId++;

	if (EnemyShips.discardedSprites.length > 0) {
		this.sprite = EnemyShips.discardedSprites.pop();
		this.sprite.texture = wave.texture;
		this.sprite.visible = true;
		this.sprite.tint = 0xFFFFFF;
	} else {
		this.sprite = new PIXI.Sprite(wave.texture);
		enemyShipContainer.addChild(this.sprite);
		EnemyShips.sprites.push(this.sprite);
	}

	this.sprite.position.x = this.xLoc * scalingFactor;
	this.sprite.position.y = this.yLoc * scalingFactor;
	this.sprite.anchor = {x:0.5,y:0.5};

};

EnemyShips.destroy = function (ship) {
  ship.sprite.visible = false;
	EnemyShips.discardedSprites.push(ship.sprite);
	stageSprite.screenShake += gameModel.maxScreenShake;
	ship.inPlay = 0;

	enemiesKilled++;

	if (ship.wave) {
		ship.wave.shipsDestroyed++;
		if (ship.wave.shipsDestroyed >= ship.wave.shipsInWave) {
			addCredits(ship.wave.shipHealth * ship.wave.shipsInWave * 0.3);
			GameText.credits.newCreditText(canvasWidth/2,canvasHeight/3,"Wave destroyed\nBonus Credits: " + formatMoney(ship.wave.shipHealth * ship.wave.shipsInWave * 0.5));
		}


		if (Math.random() > 0.8)
			MoneyPickup.newMoneyPickup(ship.xLoc, ship.yLoc, (ship.wave.shipHealth + Math.random() * ship.wave.shipHealth * 5));

		Powerups.newPowerup(ship.xLoc,ship.yLoc);
	}

	Sounds.shipExplosion.play();
	Ships.generateExplosion(ship);


	if (!PlayerShip.playerShip.superCharged)
		PlayerShip.playerShip.charge = Math.min(105,PlayerShip.playerShip.charge + 3);
};

EnemyShips.checkForPlayerCollision = function (ship) {
    if (Ships.detectShipCollision(ship, PlayerShip.playerShip)) {
			PlayerShip.damagePlayerShip(PlayerShip.playerShip, ship.health);
			EnemyShips.destroy(ship);
    }
};

EnemyShips.damageEnemyShip = function(ship, xLoc, yLoc, damage) {
	if (ship.health > 0) {
		Bullets.generateExplosion(xLoc, yLoc);
		ship.health -= damage;
		ship.lastDamaged = 0;
		ship.sprite.rotation = -ship.rotation - 0.1 + (Math.random() * 0.2);
		ship.sprite.texture = ship.damageTexture || ship.wave.damageTexture;
		Sounds.enemyDamage.play();
		GameText.damage.newText(damage, ship);

		if (ship.wave) {
			var percentOfShipDamaged = damage / ship.wave.shipHealth;

			stageSprite.screenShake += gameModel.maxScreenShake * percentOfShipDamaged;

			if (!PlayerShip.playerShip.superCharged)
				PlayerShip.playerShip.charge = Math.min(105,PlayerShip.playerShip.charge + 3 * percentOfShipDamaged);

			if (ship.health + damage > ship.wave.shipHealth / 2 && ship.health < ship.wave.shipHealth / 2) {
				ship.maxSpeed *= 0.90;
			}
		}

		if (ship.health <= 0) {
			EnemyShips.destroy(ship);
		}
	}
}

EnemyShips.checkForBulletCollisions = function (ship){
	Bullets.playerBullets.sprite.forEach(function(sprite){
		if (sprite.visible) {
			if (Ships.detectCollision(ship, sprite.xLoc, sprite.yLoc)) {

				EnemyShips.damageEnemyShip(ship, sprite.xLoc, sprite.yLoc, sprite.bulletStrength);
				sprite.visible = false;
				Bullets.playerBullets.discardedSprites.push(sprite);
			}
		}
	});
  for (var i = 0; i < Bullets.splashDamage.maxSplashes; i++) {
    if (Bullets.splashDamage.splashes[i] && Bullets.splashDamage.splashes[i].active) {
      if (distanceBetweenPoints(ship.xLoc, ship.yLoc, Bullets.splashDamage.splashes[i].xLoc, Bullets.splashDamage.splashes[i].yLoc) < Bullets.splashDamage.splashes[i].spread &&
        !Bullets.splashDamage.splashes[i].shipsDamaged[ship.id]) {
          Bullets.splashDamage.splashes[i].shipsDamaged[ship.id] = 1;
          EnemyShips.damageEnemyShip(ship, ship.xLoc, ship.yLoc, Bullets.splashDamage.splashes[i].damage);
        }
    }
  }
};

EnemyShips.updateShip = function (eShip, timeDiff) {
	if (eShip.inPlay) {
		if (timeLeft < 0 && EnemyShips.allDeadTimer >= eShip.allDeadSurvivalTime) {
			eShip.inPlay = 0;
			eShip.sprite.visible = false;
			EnemyShips.discardedSprites.push(eShip.sprite);

			if (eShip.xLoc > 0 && eShip.yLoc > 0) {
				Ships.generateExplosion(eShip);
				stageSprite.screenShake += gameModel.maxScreenShake;
				Sounds.shipExplosion.play();
			}
		} else {
			EnemyShips.activeShips.push(eShip);
		}
		if (Math.sqrt(Math.pow(eShip.xLoc - eShip.xTar, 2) +
						Math.pow(eShip.yLoc - eShip.yTar, 2)) > 5) {

			var xDiff = eShip.xTar - eShip.xLoc;
			var yDiff = eShip.yTar - eShip.yLoc;

			Ships.updateShipSpeed(eShip, xDiff, yDiff, timeDiff);
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
					Stars.shipTrails.newPowerupPart(eShip.sprite.position.x - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor),
																				eShip.sprite.position.y - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor),
																				calculateTintFromString(eShip.wave.colors[Math.floor(Math.random() * eShip.wave.colors.length)]))
					eShip.lastParticle = 0;
				}

			}

		} else {
			eShip.nextCoord++;

			if (eShip.nextCoord >= eShip.wave.wavePattern.xCoords.length) {
				eShip.inPlay = 0;
				eShip.sprite.visible = false;
				EnemyShips.discardedSprites.push(eShip.sprite);
				eShip.wave.shipsExited++;
			} else {
				eShip.xTar = canvasWidth * eShip.wave.wavePattern.xCoords[eShip.nextCoord];
				eShip.yTar = canvasHeight * eShip.wave.wavePattern.yCoords[eShip.nextCoord];
			}
		}
		EnemyShips.checkForBulletCollisions(eShip);
		EnemyShips.checkForPlayerCollision(eShip);
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
};

EnemyShips.activeShips = [];

EnemyShips.update = function (timeDiff) {

	EnemyShips.lastWave += timeDiff * 1000;

	EnemyShips.activeShips = [];

	if (timeLeft > 0) {
		EnemyShips.allDeadTimer = 0;
	}

	if (timeLeft < 0) {
		EnemyShips.allDeadTimer += (timeDiff * 1000);
		if (EnemyShips.allDeadTimer > PlayerShip.allDeadTime && !Powerups.inPLay() && !MoneyPickup.inPlay()) {
			if (Boss.bossActive()) {
				Boss.update(timeDiff);
			} else {
				Boss.shield.hide();
				changeState(states.levelComplete);
			}
		}
	}

	for (var i = 0; i < EnemyShips.maxWaves; i++) {

		if (!EnemyShips.waves[i] || EnemyShips.waves[i].finished) {
			if (EnemyShips.lastWave >= EnemyShips.waveFrequency && Math.random() > 0.9) {
				EnemyShips.waves[i] = new EnemyShips.wave();
				EnemyShips.lastWave = 0;
			}
		} else {
			EnemyShips.waves[i].lastShipSpawned += timeDiff * 1000;
			EnemyShips.waves[i].lastBullet += timeDiff * 1000;
			for (var j = 0; j < EnemyShips.waves[i].shipsInWave; j++) {
				if (!EnemyShips.waves[i].ships[j]) {
					if (EnemyShips.waves[i].lastShipSpawned >= EnemyShips.waves[i].shipFrequency && timeLeft > 0) {
						EnemyShips.waves[i].ships[j] = new EnemyShips.enemyShip(EnemyShips.waves[i]);
						EnemyShips.waves[i].lastShipSpawned = 0;
					}
				} else {
					EnemyShips.updateShip(EnemyShips.waves[i].ships[j],timeDiff);
				}
			}
			if (EnemyShips.waves[i].shipsExited + EnemyShips.waves[i].shipsDestroyed >= EnemyShips.waves[i].shipsInWave) {
				EnemyShips.waves[i].finished = true;
				EnemyShips.waves[i].wavePattern.inUse = false;
			}
		}
	}
};
