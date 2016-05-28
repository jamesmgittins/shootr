var EnemyShips = {};

EnemyShips.allDeadTimer = 0;
EnemyShips.maxShipsPerWave = 16;
EnemyShips.minShipsPerWave = 4;
EnemyShips.shipHealth = 2;
EnemyShips.maxWaves = 3;
EnemyShips.maxBulletsPerShot=1;

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
    
    this.texture = PIXI.Texture.fromCanvas(Ships.shipArt(size, Date.now(), true, this.colors));

    this.maxSpeed = 60 + Math.random() * 30;
	
    this.offset = Math.round(size / 2);
    this.ships = [];
    this.shipsExited = 0;
	
	this.shipContainer = new PIXI.Container();
	enemyShipContainer.addChild(this.shipContainer);
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
	this.bulletsLeft=0;
	this.lastBullet = 0;

	this.sprite = new PIXI.Sprite(wave.texture);
	this.sprite.position.x = this.xLoc;
	this.sprite.position.y = this.yLoc;
	this.sprite.anchor = {x:0.5,y:0.5};
	wave.shipContainer.addChild(this.sprite);

};

EnemyShips.destroy = function (ship) {
  ship.sprite.visible = false;
	ship.inPlay = 0;
	ship.wave.shipsDestroyed++;
	if (ship.wave.shipsDestroyed >= ship.wave.shipsInWave) {
		ship.wave.shipContainer.visible = false;

	  addCredits(ship.wave.shipHealth * ship.wave.shipsInWave * 0.5);

		GameText.credits.newCreditText(canvasWidth/2,canvasHeight/3,"Wave destroyed\nBonus Credits: " + formatMoney(ship.wave.shipHealth * ship.wave.shipsInWave * 0.5));
	}
	enemiesKilled++;
	Ships.generateExplosion(ship);
	addCredits(ship.wave.shipHealth);
	GameText.credits.newCreditText(ship.xLoc,ship.yLoc - 15,"+" + formatMoney(ship.wave.shipHealth));
	
	Sounds.shipExplosion.play();

	if (enemiesKilled >= enemiesToKill) {
	    EnemyShips.allDeadTimer = 0;
		for (var i = 0; i < EnemyShips.waves.length; i++) {
			EnemyShips.waves[i].shipContainer.visible=false;
		}
	}
	Powerups.newPowerup(ship.xLoc,ship.yLoc);
};

EnemyShips.checkForPlayerCollision = function (ship) {
    if (Ships.detectShipCollision(ship, PlayerShip.playerShip)) {
        PlayerShip.damagePlayerShip(PlayerShip.playerShip, ship.health);
		EnemyShips.destroy(ship);
    }
};

EnemyShips.checkForBulletCollisions = function (ship){
    for (var i = 0; i < Bullets.playerBullets.maxPlayerBullets; i++) {
        if (Bullets.playerBullets.inPlay[i] === 1) {
            if (Ships.detectCollision(ship, Bullets.playerBullets.xLoc[i], Bullets.playerBullets.yLoc[i])) {

                Bullets.generateExplosion(Bullets.playerBullets.xLoc[i], Bullets.playerBullets.yLoc[i]);
                ship.health -= Bullets.playerBullets.bulletStrength[i];
								Sounds.enemyDamage.play();
								
                if (ship.health <= 0) {
									EnemyShips.destroy(ship);
									Bullets.playerBullets.bulletStrength[i] -= ship.health + Bullets.playerBullets.bulletStrength[i];
                } else {
									Bullets.playerBullets.inPlay[i] = 0;
	                Bullets.playerBullets.sprite[i].visible = false;
								}
            }
        }
    }
};

EnemyShips.updateShip = function (eShip, timeDiff) {
	if (eShip.inPlay) {
		if (enemiesKilled >= enemiesToKill) {
			eShip.inPlay = 0;
			if (eShip.xLoc > 0 && eShip.yLoc > 0)
				Ships.generateExplosion(eShip);
		}
		if (Math.sqrt(Math.pow(eShip.xLoc - eShip.xTar, 2) +
						Math.pow(eShip.yLoc - eShip.yTar, 2)) > 5) {

			var xDiff = eShip.xTar - eShip.xLoc;
			var yDiff = eShip.yTar - eShip.yLoc;

			Ships.updateShipSpeed(eShip, xDiff, yDiff, timeDiff);
			Ships.updateRotation(eShip, timeDiff);

			eShip.sprite.position.x = eShip.xLoc;
			eShip.sprite.position.y = eShip.yLoc;
			eShip.sprite.rotation = -eShip.rotation;

		} else {
			eShip.nextCoord++;

			if (eShip.nextCoord >= eShip.wave.wavePattern.xCoords.length) {
				eShip.inPlay = 0;
				eShip.sprite.visible = false;
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
		//else
			//eShip.sprite.tint = 0xFFFFFF;

		if (eShip.inPlay && (eShip.wave.lastBullet >= EnemyShips.waveBulletFrequency && Math.random() > 0.9 || eShip.bulletsLeft > 0)) {
			if (eShip.bulletsLeft <= 0) {
				eShip.bulletsLeft = Math.max(1,Math.round(Math.random() * EnemyShips.maxBulletsPerShot));
			}
			if (eShip.lastBullet >= 0.15) {
				Bullets.enemyBullets.newEnemyBullet(eShip);
				eShip.lastBullet = 0;
				eShip.bulletsLeft--;
			}
			eShip.lastBullet+=timeDiff;

			eShip.wave.lastBullet = 0;
		}
	}
};

EnemyShips.update = function (timeDiff) {

    EnemyShips.lastWave += timeDiff * 1000;

    if (enemiesKilled >= enemiesToKill) {
        EnemyShips.allDeadTimer += (timeDiff * 1000);
        if (EnemyShips.allDeadTimer > PlayerShip.allDeadTime) {
            changeState(states.levelComplete);
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
                    if (EnemyShips.waves[i].lastShipSpawned >= EnemyShips.waves[i].shipFrequency) {
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
				EnemyShips.waves[i].shipContainer.visible = false;
			}
        }
    }
};