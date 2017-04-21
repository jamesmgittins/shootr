var MoneyPickup = {
	xAcceleration:25,
	xMaxSpeed : 20,
	speed:50,
	getSpritePool : function() {
		if (!this.spritePool) {
			this.diamondTexture =  glowTexture(PIXI.Texture.fromImage("img/diamond.svg"), {resize:0.04 * scalingFactor, blurAmount : 0.5});
			this.sapphireTexture = glowTexture(PIXI.Texture.fromImage("img/sapphire.svg"), {resize:0.04 * scalingFactor, blurAmount : 0.5});
			this.spritePool = SpritePool.create(
				[this.sapphireTexture,this.diamondTexture],
				powerupContainer);
		}
		return this.spritePool;
	},
	inPlay:function() {
		return this.spritePool && this.spritePool.discardedSprites.length < this.spritePool.sprites.length;
	},
	newMoneyPickup:function(x, y, value, alternate){
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
	},
	resize : function() {
		this.getSpritePool().destroy();
		this.spritePool = false;
	},
	update : function(timeDiff) {
		if (this.spritePool) {
			for (var i = 0; i < this.spritePool.sprites.length; i++) {
				var pickup = this.spritePool.sprites[i];
				if (pickup.visible) {
					pickup.rotation += pickup.rotSpeed * timeDiff;
					pickup.yLoc += pickup.speed * timeDiff;
					pickup.xLoc += pickup.xSpeed * timeDiff;

					if (pickup.yLoc < canvasHeight + 10) {
						pickup.position = {x:pickup.xLoc * scalingFactor, y: pickup.yLoc * scalingFactor};

						if (pickup.xLoc > PlayerShip.playerShip.xLoc && pickup.xSpeed > -1 * MoneyPickup.xMaxSpeed) {
							pickup.xSpeed -= MoneyPickup.xAcceleration * timeDiff;
						}
						if (pickup.xLoc < PlayerShip.playerShip.xLoc && pickup.xSpeed < MoneyPickup.xMaxSpeed) {
							pickup.xSpeed += MoneyPickup.xAcceleration * timeDiff;
						}

						if (distanceBetweenPoints(PlayerShip.playerShip.xLoc, PlayerShip.playerShip.yLoc, pickup.xLoc, pickup.yLoc) < 30) {

							Sounds.powerup.play(pickup.xLoc);

							addCredits(pickup.moneyValue);
							GameText.credits.newCreditText(pickup.xLoc,pickup.yLoc - 15,"+" + formatMoney(pickup.moneyValue));

							this.spritePool.discardSprite(pickup);
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
	inPlay:function(){
		return Powerups.sprite[0].visible;
	},
	reset:function() {
		for (var i = 0; i < Powerups.maxPowerups; i++) {
			if (Powerups.sprite[i].visible) {
				Powerups.sprite[i].visible = false;
			}
		}
		PlayerShip.playerShip.powerupTime = Powerups.powerupLength + 1;
	},
	resize:function() {
		MoneyPickup.resize();
		for (var i = 0; i < Powerups.sprite.length; i++) {
			Powerups.sprites.removeChild(Powerups.sprite[i]);
			Powerups.sprite[i].destroy();
		}
		Powerups.initialize();
	},
	createTexture : function() {
		var size = scalingFactor * 32;
		var blast = document.createElement('canvas');
		blast.width = size;
		blast.height = size;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = "#ffffff";
		blastCtx.fillRect(0, 0, size, size);

		blastCtx.fillStyle = "#000";
		var fontSize = 30 * scalingFactor;
		blastCtx.font = fontSize + "px Arial";
		blastCtx.fillText("?",8 * scalingFactor,27 * scalingFactor);

		return PIXI.Texture.fromCanvas(blast);
	},
	initialize : function() {

		// Powerups.texture = Powerups.createTexture();
		Powerups.texture = glowTexture(
			PIXI.Texture.fromImage("img/perspective-dice-random.svg",undefined,undefined,0.1 * scalingFactor),
			{resize:0.1 * scalingFactor, blurAmount : 0.6}
		);

		Powerups.sprites = new PIXI.Container();
		for (var i = 0; i < Powerups.maxPowerups; i++) {
			Powerups.sprite[i] = new PIXI.Sprite(Powerups.texture);
			Powerups.sprite[i].visible = false;
			Powerups.sprite[i].anchor = { x: 0.5, y: 0.5 };
			Powerups.sprites.addChild(Powerups.sprite[i]);
		}
		powerupContainer.addChild(Powerups.sprites);
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

				if (distanceBetweenPoints(PlayerShip.playerShip.xLoc, PlayerShip.playerShip.yLoc, Powerups.xLoc[i], Powerups.yLoc[i]) < 35) {

					Sounds.powerup.play(Powerups.xLoc[i]);

					var number = Math.random();

					if (number > 0.8) {
							GameText.bigText.newBigText("Spread shot!");
							Powerups.sprite[i].visible = false;
							PlayerShip.playerShip.powerupTime = 0;
							PlayerShip.playerShip.spreadShot = 1;
					} else if (number > 0.6 ){
							GameText.bigText.newBigText("Cross shot!");
							Powerups.sprite[i].visible = false;
							PlayerShip.playerShip.powerupTime = 0;
							PlayerShip.playerShip.crossShot = 1;
					} else {
						GameText.bigText.newBigText("Cargo Crate Collected!");
						Powerups.sprite[i].visible = false;
						// gameModel.lootCollected++;

						var baseSeed = Date.now();
						var level = gameModel.currentLevel > 1 ? Math.max(1,Math.round(gameModel.currentLevel + (Math.random() * 2.6) - 1)) : gameModel.currentLevel;
						if (Math.random() > 0.75) {
							var shield = ArmsDealer.generateShield(level, baseSeed + i, true);
							gameModel.lootCollected.push(shield);
							GameText.levelComplete.lootLayouts.push(ArmsDealer.createItemLayout(shield, false, true));
							GameText.status.lootIcons.push(ArmsDealer.createItemIcon(shield, {buy:false, cache:true}));
						} else {
							var weapon = Weapons.generateWeapon(level, baseSeed + i, true);
							gameModel.lootCollected.push(weapon);
							GameText.levelComplete.lootLayouts.push(ArmsDealer.createItemLayout(weapon, false, true));
							GameText.status.lootIcons.push(ArmsDealer.createItemIcon(weapon, {buy:false, cache:true}));
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
