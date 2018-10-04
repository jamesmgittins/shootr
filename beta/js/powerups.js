var MoneyPickup = {
	xAcceleration:25,
	xMaxSpeed : 20,
	speed:50,
	initialize : function () {
		if (!this.diamondTexture)
		this.diamondTexture = glowTexture(PIXI.Texture.fromImage("img/diamond.svg"), {resize:0.04 * scalingFactor, blurAmount : 0.5, dontDestroyOriginal:true});
		if (!this.sapphireTexture)
		this.sapphireTexture = glowTexture(PIXI.Texture.fromImage("img/sapphire.svg"), {resize:0.04 * scalingFactor, blurAmount : 0.5, dontDestroyOriginal:true});
	},
	getSpritePool : function() {
		if (!this.spritePool && this.sapphireTexture) {
			this.spritePool = new SpritePool(
				[this.sapphireTexture,this.diamondTexture],
				powerupContainer);
		}
		return this.spritePool;
	},
	inPlay:function() {
		return this.spritePool && this.spritePool.discardedSprites.length < this.spritePool.sprites.length;
	},
	reset : function() {
		this.getSpritePool().discardAll();
	},
	newMoneyPickup:function(x, y, value, alternate){
		if (this.getSpritePool()) {
			var pickup = this.getSpritePool().nextSprite();
			if (alternate) {
				pickup.texture = this.diamondTexture;
				pickup.alternate = true;
			} else {
				pickup.texture = this.sapphireTexture;
				pickup.alternate = false;
			}
			pickup.visible = true;
			pickup.moneyValue = value;
			pickup.xLoc = x;
			pickup.yLoc = y;
			pickup.xSpeed = 0;
			pickup.speed = MoneyPickup.speed + Math.random() * MoneyPickup.speed;
			pickup.position = {x:x * scalingFactor, y: y * scalingFactor};
			pickup.rotSpeed = -2 + Math.random() * 4;
			pickup.tintNumber = 0;
			pickup.tintMod = 600;
			pickup.lastTrail = 0;
		}
	},
	resize : function() {
		if (this.diamondTexture && this.sapphireTexture) {
			this.diamondTexture.destroy(true);
			this.sapphireTexture.destroy(true);
			this.diamondTexture = false;
			this.sapphireTexture = false;

			if (this.spritePool) {
				this.getSpritePool().destroy();
				this.spritePool = false;
			}
			this.initialize();
		}
	},
	update : function(timeDiff) {
		if (this.spritePool) {
			for (var i = 0; i < this.spritePool.sprites.length; i++) {
				var pickup = this.spritePool.sprites[i];
				if (pickup.visible) {
					pickup.rotation += pickup.rotSpeed * timeDiff;
					pickup.yLoc += pickup.speed * timeDiff;
					pickup.xLoc += pickup.xSpeed * timeDiff;

					if (pickup.yLoc > -10 && pickup.yLoc < canvasHeight + 10 && pickup.xLoc > -10 && pickup.xLoc < canvasWidth + 10) {
						pickup.position = {x:pickup.xLoc * scalingFactor, y: pickup.yLoc * scalingFactor};

						if (pickup.xLoc > PlayerShip.playerShip.xLoc && pickup.xSpeed > -1 * MoneyPickup.xMaxSpeed) {
							pickup.xSpeed -= MoneyPickup.xAcceleration * timeDiff;
						}
						if (pickup.xLoc < PlayerShip.playerShip.xLoc && pickup.xSpeed < MoneyPickup.xMaxSpeed) {
							pickup.xSpeed += MoneyPickup.xAcceleration * timeDiff;
						}

						var distanceFromPlayer = distanceBetweenPoints(PlayerShip.playerShip.xLoc, PlayerShip.playerShip.yLoc, pickup.xLoc, pickup.yLoc);

						if (distanceFromPlayer < Powerups.getAttractRange() && PlayerShip.playerShip.inPlay) {

							if (distanceFromPlayer < 35) {

								Sounds.powerup.play(pickup.xLoc);

								addCredits(Talents.combatCredits(pickup.moneyValue));
								GameText.credits.newCreditText(pickup.xLoc,pickup.yLoc - 15,"+" + formatMoney(Talents.combatCredits(pickup.moneyValue)));

								this.spritePool.discardSprite(pickup);
							} else {
								var accelX = PlayerShip.playerShip.xLoc - pickup.xLoc;
								var accelY = PlayerShip.playerShip.yLoc - pickup.yLoc;
								var factor = (Powerups.acceleration * Powerups.attractRange * 2 / distanceFromPlayer) / magnitude(accelX, accelY);
								pickup.xSpeed += accelX * factor * timeDiff;
								pickup.speed += accelY * factor * timeDiff;

								if (magnitude(pickup.xSpeed, pickup.speed) > Powerups.attractMaxSpeed) {
				          var speedFactor = Powerups.attractMaxSpeed / magnitude(pickup.xSpeed, pickup.speed);
				          pickup.xSpeed *= speedFactor;
				          pickup.speed *= speedFactor;
				        }
							}
						}

						pickup.tintNumber += pickup.tintMod * timeDiff;
						pickup.tint = pickup.alternate ?
							rgbToHex(Math.min(255,Math.max(pickup.tintNumber,150)),Math.min(255,Math.max(pickup.tintNumber,150)),255) :
							rgbToHex(Math.min(255,Math.max(pickup.tintNumber,0)),255,Math.min(255,Math.max(pickup.tintNumber,0)));

						pickup.lastTrail += timeDiff;
						if (pickup.lastTrail > 0.5) {
							pickup.lastTrail = 0;
							Stars.powerupParts.newPowerupPart(pickup.position.x,pickup.position.y,pickup.tint);
						}

						if (pickup.tintNumber >= 200 && pickup.tintMod > 0)
									pickup.tintMod *= -1;

						if (pickup.tintNumber <= 0 && pickup.tintMod < 0)
									pickup.tintMod *= -1;

					} else {
						this.spritePool.discardSprite(pickup);
					}
				}
			}
		}
	}
};

var Powerups = {
	acceleration : 1000,
	attractRange : 75,
	attractMaxSpeed : 300,
	texture:{} ,
	lastTrail:0,
	tint:0,
	tintMod:400,
	powerupLength:10,
	maxPowerups: 1,
	currPowerup: 0,
	maxSpeed: 50,
	sprite : [],
	xLoc : [],
	yLoc : [],
	xSpeed : [],
	ySpeed: [],
	rotSpeed: [],
	chance : 0.95,
	baseChance : 0.95,
	lastPowerupSpawned : 0,
	minFrequency: 15,
	baseSeed : Date.now(),
	getAttractRange : function() {
		if (Buffs.isBuffActive("Magnetic"))
			return Powerups.attractRange * 3;
		return Powerups.attractRange;
	},
	inPlay:function(){
		return Powerups.sprite[0].visible;
	},
	reset:function() {
		MoneyPickup.reset();
		this.sprite.forEach(function(sprite){
			sprite.visible = false;
		});
		PlayerShip.playerShip.powerupTime = Powerups.powerupLength + 1;
	},
	resize:function() {
		MoneyPickup.resize();
		for (var i = 0; i < Powerups.sprite.length; i++) {
			Powerups.sprite[i].destroy(true);
		}
		Powerups.sprite = [];
		Powerups.initialize();
	},
	initialize : function() {
		if (powerupContainer) {
			MoneyPickup.initialize();
			Powerups.texture = glowTexture(
				PIXI.Texture.fromImage("img/perspective-dice-random.svg",undefined,undefined,0.5 * scalingFactor),
				{resize:0.1 * scalingFactor, blurAmount : 0.6, dontDestroyOriginal:true}
			);

			Powerups.sprites = new PIXI.Container();
			powerupContainer.addChild(Powerups.sprites);
		}
	},
	getRandomItem : function() {
		var maxLevelDifference = Boss.currentLevel() - gameModel.currentLevel;
		var level = gameModel.currentLevel > 1 ?
			Math.max(1, Math.round(gameModel.currentLevel + (Math.random() * maxLevelDifference * (1 - maxLevelDifference * 0.1)))) :
			gameModel.currentLevel;
		if (Math.random() > 0.97) {
			return Shipyard.generateBlueprint(level, this.baseSeed++);
		} else {
			if (Math.random() > 0.75) {
				return Shields.generateShield(level, this.baseSeed++);
			} else {
				return Weapons.generateWeapon(level, this.baseSeed++);
			}
		}
	},
	update : function(timeDiff) {
		MoneyPickup.update(timeDiff);
		Powerups.lastPowerupSpawned += timeDiff;

		Powerups.tint += Powerups.tintMod * timeDiff;

		if (Powerups.tint >= 255 && Powerups.tintMod > 0)
			Powerups.tintMod *= -1;

		if (Powerups.tint <= 0 && Powerups.tintMod < 0)
			Powerups.tintMod *= -1;

		for (var i = 0; i < Powerups.maxPowerups; i++) {
			if (!Powerups.sprite[i]) {
				Powerups.sprite[i] = new PIXI.Sprite(Powerups.texture);
				Powerups.sprite[i].visible = false;
				Powerups.sprite[i].anchor = { x: 0.5, y: 0.5 };
				Powerups.sprites.addChild(Powerups.sprite[i]);
			}
			if (Powerups.sprite[i].visible) {
				Powerups.xLoc[i] += Powerups.xSpeed[i] * timeDiff;
				Powerups.yLoc[i] += Powerups.ySpeed[i] * timeDiff;

				if (Powerups.xLoc[i] < -50 || Powerups.xLoc[i] > canvasWidth + 50 || Powerups.yLoc[i] < -50 || Powerups.yLoc[i] > canvasHeight + 50)
					Powerups.sprite[i].visible = false;

				Powerups.sprite[i].position.x = Powerups.xLoc[i] * scalingFactor;
				Powerups.sprite[i].position.y = Powerups.yLoc[i] * scalingFactor;
				Powerups.sprite[i].rotation += Powerups.rotSpeed[i] * timeDiff;

				Powerups.lastTrail += timeDiff * 1000;
				if (Powerups.lastTrail > 60) {
					Powerups.lastTrail = 0;
					Stars.powerupParts.newPowerupPart(
					Powerups.sprite[i].position.x - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor),
					Powerups.sprite[i].position.y - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor));
				}

				Powerups.sprite[i].tint = rgbToHex(255,Math.min(255,Math.max(Powerups.tint,0)),0);

				var distanceFromPlayer = distanceBetweenPoints(PlayerShip.playerShip.xLoc, PlayerShip.playerShip.yLoc, Powerups.xLoc[i], Powerups.yLoc[i]);

				if (distanceFromPlayer < Powerups.getAttractRange() && PlayerShip.playerShip.inPlay) {

					if (distanceFromPlayer < 35) {

						Sounds.powerup.play(Powerups.xLoc[i]);
						Talents.crateCollected();

						var number = Math.random();

						if (number > 0.8) {
								Buffs.addSpreadShotBuff();
								Powerups.sprite[i].visible = false;
						} else if (number > 0.6 ){
								Buffs.addCrossShotBuff();
								Powerups.sprite[i].visible = false;
						} else {
							GameText.bigText.newBigText("Cargo Crate Collected!");
							Powerups.sprite[i].visible = false;
							// gameModel.lootCollected++;


							var lootInCrate = Math.random() > 0.8 ? 2 : 1;

							for (var j = 0; j < lootInCrate; j++ ) {
								var item = Powerups.getRandomItem();
								gameModel.lootCollected.push(item);
								GameText.status.lootIcons.push(ArmsDealer.createItemIcon(item, {buy:false, cache:true, scale:0.8}));
							}


						}
					} else {
						var accelX = PlayerShip.playerShip.xLoc - Powerups.xLoc[i];
						var accelY = PlayerShip.playerShip.yLoc - Powerups.yLoc[i];
						var factor = (Powerups.acceleration * Powerups.attractRange * 2 / distanceFromPlayer) / magnitude(accelX, accelY);
						Powerups.xSpeed[i] += accelX * factor * timeDiff;
						Powerups.ySpeed[i] += accelY * factor * timeDiff;

						if (magnitude(Powerups.xSpeed[i], Powerups.ySpeed[i]) > Powerups.attractMaxSpeed) {
							var speedFactor = Powerups.attractMaxSpeed / magnitude(Powerups.xSpeed[i], Powerups.ySpeed[i]);
							Powerups.xSpeed[i] *= speedFactor;
							Powerups.ySpeed[i] *= speedFactor;
						}

					}
				}
			}
		}
	},
	newPowerup : function (x, y) {
	  if (Powerups.lastPowerupSpawned > Powerups.minFrequency) {
			if (Math.random() > Powerups.chance) {
				Powerups.chance = Powerups.baseChance;

				Powerups.lastPowerupSpawned = 0;
				Powerups.sprite[Powerups.currPowerup].visible = true;
				Powerups.xLoc[Powerups.currPowerup] = x;
				Powerups.yLoc[Powerups.currPowerup] = y;
				Powerups.sprite[Powerups.currPowerup].position = { x: x * scalingFactor, y: y * scalingFactor};
				//Powerups.sprite[Powerups.currPowerup].scale = {x:scalingFactor,y:scalingFactor};
				Powerups.sprite[Powerups.currPowerup].rotation = Math.random() * 5;
				Powerups.rotSpeed[Powerups.currPowerup] = -2 + Math.random() * 4;

				var xDiff = (canvasWidth / 2) - x;
				var yDiff = (canvasHeight / 2) - y;
				var multi = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

				Powerups.xSpeed[Powerups.currPowerup] = xDiff / multi * Powerups.maxSpeed;
				Powerups.ySpeed[Powerups.currPowerup] = yDiff / multi * Powerups.maxSpeed;
			} else {
				Powerups.chance *= Powerups.baseChance;
			}
		}
	}
};
