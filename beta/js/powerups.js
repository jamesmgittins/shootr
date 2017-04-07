var MoneyPickup = {
	xAcceleration:25,
	xMaxSpeed : 20,
	sprites:[],
	discardedSprites:[],
	speed:50,
	inPlay:function() {
		return MoneyPickup.discardedSprites.length < MoneyPickup.sprites.length;
	},
	createTexture : function() {
		var blast = document.createElement('canvas');
		blast.width = 13 * scalingFactor;
		blast.height = 13 * scalingFactor;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = "#ffffff";
		blastCtx.fillRect(0, 0, blast.width, blast.height);

		blastCtx.fillStyle = "#000";
		var fontSize = 9 * scalingFactor;
		blastCtx.font = fontSize + "px Arial";
		blastCtx.fillText("$",4 * scalingFactor,10 * scalingFactor);

		return glowTexture(PIXI.Texture.fromCanvas(blast));
	},
	initialize:function(){
		// MoneyPickup.texture = MoneyPickup.createTexture();
		MoneyPickup.texture = glowTexture(
			PIXI.Texture.fromImage("img/sapphire.svg",undefined,undefined,0.04 * scalingFactor),
			{resize:0.04 * scalingFactor, blurAmount : 0.5}
		);
		MoneyPickup.container = new PIXI.Container();
		starContainer.addChild(MoneyPickup.container);
	},
	newMoneyPickup:function(x, y, value){
		var pickup;
		if (MoneyPickup.discardedSprites.length > 0) {
			pickup = MoneyPickup.discardedSprites.pop();
		} else {
			pickup = new PIXI.Sprite(MoneyPickup.texture);
			pickup.anchor = { x: 0.5, y: 0.5 };
			MoneyPickup.sprites.push(pickup);
			MoneyPickup.container.addChild(pickup);
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
		for (var i = 0; i < MoneyPickup.sprites.length; i++) {
			MoneyPickup.container.removeChild(MoneyPickup.sprites[i]);
			MoneyPickup.sprites[i].destroy();
		}
		MoneyPickup.sprites = [];
		MoneyPickup.discardedSprites = [];
	},
	update : function(timeDiff) {
		MoneyPickup.sprites.forEach(function(pickup){
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

						Sounds.powerup.play();

						addCredits(pickup.moneyValue);
						GameText.credits.newCreditText(pickup.xLoc,pickup.yLoc - 15,"+" + formatMoney(pickup.moneyValue));

						pickup.visible = false;
						MoneyPickup.discardedSprites.push(pickup);
					}

				pickup.tintNumber += pickup.tintMod * timeDiff;
				pickup.tint = rgbToHex(Math.min(255,Math.max(pickup.tintNumber,0)),255,Math.min(255,Math.max(pickup.tintNumber,0)));

				pickup.lastTrail += timeDiff;
				if (pickup.lastTrail > 0.5) {
					pickup.lastTrail = 0;
					Stars.shipTrails.newPowerupPart(pickup.position.x,pickup.position.y,pickup.tint);
				}

				if (pickup.tintNumber >= 200 && pickup.tintMod > 0)
							pickup.tintMod *= -1;

				if (pickup.tintNumber <= 0 && pickup.tintMod < 0)
							pickup.tintMod *= -1;

				} else {
					pickup.visible = false;
					MoneyPickup.discardedSprites.push(pickup);
				}
			}
		});
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
	inPLay:function(){
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

		MoneyPickup.initialize();

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
		starContainer.addChild(Powerups.sprites);
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

				Powerups.sprite[i].position.x = Powerups.xLoc[i] * scalingFactor
				Powerups.sprite[i].position.y = Powerups.yLoc[i] * scalingFactor;
				Powerups.sprite[i].rotation += Powerups.rotSpeed[i] * timeDiff;

				Powerups.lastTrail += timeDiff * 1000;
				if (Powerups.lastTrail > 60) {
					Powerups.lastTrail = 0;
					Stars.shipTrails.newPowerupPart(
					Powerups.sprite[i].position.x - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor),
					Powerups.sprite[i].position.y - (20 * scalingFactor) + (Math.random() * 40 * scalingFactor));
				}

				Powerups.sprite[i].tint = rgbToHex(255,Math.min(255,Math.max(Powerups.tint,0)),0);

				if (distanceBetweenPoints(PlayerShip.playerShip.xLoc, PlayerShip.playerShip.yLoc, Powerups.xLoc[i], Powerups.yLoc[i]) < 35) {

					Sounds.powerup.play();

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
							GameText.status.lootIcons.push(ArmsDealer.createItemIcon(shield, {buy:false}));
						} else {
							var weapon = Weapons.generateWeapon(level, baseSeed + i, true);
							gameModel.lootCollected.push(weapon);
							GameText.levelComplete.lootLayouts.push(ArmsDealer.createItemLayout(weapon, false, true));
							GameText.status.lootIcons.push(ArmsDealer.createItemIcon(weapon, {buy:false}));
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
