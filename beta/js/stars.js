var Stars = {};

Stars.NUM_STARS = 250;

Stars.StartEndStars = {
	acceleration : 0.4,
	maxSpeed : 1,
	sprite  : {},
	texture : function (starSize) {
		var size = 32 * scalingFactor * starSize;
		var blast = document.createElement('canvas');
		blast.width = size;
		blast.height = size;
		var blastCtx = blast.getContext('2d');

		var radgrad = blastCtx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
		radgrad.addColorStop(0, 'rgba(255,255,255,1)');
		radgrad.addColorStop(0.8, 'rgba(255,255,255,0.9)');
		radgrad.addColorStop(1, 'rgba(255,255,255,0)');

		// draw shape
		blastCtx.fillStyle = radgrad;
		blastCtx.fillRect(0, 0, size, size);

		return PIXI.Texture.fromCanvas(blast);
	},
	initialize : function () {
		Stars.StartEndStars.sprite = new PIXI.Sprite(Stars.StartEndStars.texture(1));
		Stars.StartEndStars.sprite.visible = false;
		Stars.StartEndStars.sprite.anchor = {x:0.5, y:0.5};
		Stars.stars.sprites.addChild(Stars.StartEndStars.sprite);
	},
	update : function(timeDiff) {
		if (currentState == states.running) {
			Stars.stars.speedFactor = 1;
			if (Stars.StartEndStars.sprite.visible) {
				if (Stars.StartEndStars.sprite.yLoc > canvasHeight * 0.1)
					Stars.StartEndStars.sprite.ySpeed = Math.max(0,Math.min(Stars.StartEndStars.sprite.ySpeed + Stars.StartEndStars.sprite.acceleration * timeDiff, Stars.StartEndStars.maxSpeed));

				Stars.StartEndStars.sprite.yLoc += (Stars.StartEndStars.sprite.ySpeed * 50) * timeDiff;
				Stars.StartEndStars.sprite.position = {x:Stars.StartEndStars.sprite.xLoc * scalingFactor, y:Stars.StartEndStars.sprite.yLoc * scalingFactor};
				Stars.StartEndStars.sprite.scale.x = Stars.StartEndStars.sprite.scale.y = Math.max(1,Math.min(0.1,1 - Stars.StartEndStars.sprite.ySpeed / Stars.StartEndStars.maxSpeed));
				Stars.stars.speedFactor = Stars.StartEndStars.sprite.ySpeed / Stars.StartEndStars.maxSpeed;
				if (Stars.StartEndStars.sprite.yLoc > canvasHeight * 1.3) {
					Stars.StartEndStars.sprite.visible = false;
				}
			} else {
				if (timeLeft / levelTime > 0.95) {
					Stars.StartEndStars.sprite.texture = Stars.StartEndStars.texture(startStar.scale * 5);
					Stars.StartEndStars.sprite.star = startStar;
					Stars.StartEndStars.sprite.visible = true;
					Stars.StartEndStars.sprite.scale.x = Stars.StartEndStars.sprite.scale.y = 1;
					Stars.StartEndStars.sprite.tint = rgbToHex(startStar.tint.r,startStar.tint.g,startStar.tint.b);
					Stars.StartEndStars.sprite.xLoc = canvasWidth * 0.15 + (Math.random() * canvasWidth * 0.7);
					Stars.StartEndStars.sprite.yLoc = canvasWidth * 0.8;
					Stars.StartEndStars.sprite.ySpeed = 0;
					Stars.stars.speedFactor = 0;
					Stars.StartEndStars.sprite.position = {x:Stars.StartEndStars.sprite.xLoc * scalingFactor, y:Stars.StartEndStars.sprite.yLoc * scalingFactor};
					Stars.StartEndStars.sprite.acceleration = Stars.StartEndStars.acceleration;
				}
				else if (timeLeft / levelTime < 0.01) {
					Stars.StartEndStars.sprite.texture = Stars.StartEndStars.texture(endStar.scale * 5);
					Stars.StartEndStars.sprite.star = endStar;
					Stars.StartEndStars.sprite.visible = true;
					Stars.StartEndStars.sprite.tint = rgbToHex(endStar.tint.r,endStar.tint.g,endStar.tint.b);
					Stars.StartEndStars.sprite.xLoc = canvasWidth * 0.15 + (Math.random() * canvasWidth * 0.7);
					Stars.StartEndStars.sprite.yLoc = 0 - canvasWidth * 0.1;
					Stars.StartEndStars.sprite.ySpeed = Stars.StartEndStars.maxSpeed;
					Stars.StartEndStars.sprite.position = {x:Stars.StartEndStars.sprite.xLoc * scalingFactor, y:Stars.StartEndStars.sprite.yLoc * scalingFactor};
					Stars.StartEndStars.sprite.acceleration = -1 * Stars.StartEndStars.acceleration;
				}
			}
		} else {
			Stars.stars.speedFactor = 0;
		}
	}
};

Stars.nebulaBackground = {
	size: 640,
	initTexture: function(seed) {
		Math.seedrandom(seed);
		var size = Stars.nebulaBackground.size;
		var nebulaCanvas = document.createElement('canvas');
    nebulaCanvas.width = size;
    nebulaCanvas.height = size * 2;

		var ctx = nebulaCanvas.getContext('2d');

		var numBlobs = 20 + Math.random() * 10;

		for (var i = 0; i < numBlobs; i++) {
			var x = Math.random() * size;
			var y = Math.random() * size * 2;
			var width = size / 5 + Math.random() * size / 2;

			var radgrad = ctx.createRadialGradient(x, y, 0, x, y, width);
			radgrad.addColorStop(0, 'rgba(255,255,255,0.05)');
			radgrad.addColorStop(0.8, 'rgba(255,255,255,0.03)');
			radgrad.addColorStop(1, 'rgba(255,255,255,0)');
			ctx.fillStyle = radgrad;
			ctx.fillRect(0, 0, size, size * 2);
		}


		if (!Stars.nebulaBackground.sprite) {
			Stars.nebulaBackground.sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(nebulaCanvas));
			starContainer.addChild(Stars.nebulaBackground.sprite);
		} else {
			Stars.nebulaBackground.sprite.texture = PIXI.Texture.fromCanvas(nebulaCanvas);
		}
		var colours = Ships.enemyColors[Math.floor(Math.random() * Ships.enemyColors.length)];
		Stars.nebulaBackground.sprite.tint = calculateTintFromString(colours[2 + Math.floor(Math.random() * (colours.length - 2))]);

	},
	update: function(timeDiff) {
		if (Stars.nebulaBackground.sprite) {
			Stars.nebulaBackground.sprite.scale.x = canvasHeight / Stars.nebulaBackground.size * scalingFactor;
			Stars.nebulaBackground.sprite.scale.y = Stars.nebulaBackground.sprite.scale.x * 2;
			var adjustment = Math.max(0,Math.min(1,(levelTime - timeLeft) / levelTime));
			Stars.nebulaBackground.sprite.position.y = ((-1 * canvasHeight) + (adjustment * canvasHeight)) * scalingFactor;
		}
	}
};

Stars.stars = {
	getTexture: function() {
		var blast = document.createElement('canvas');
		blast.width = 1;
		blast.height = 1;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = "#ffffff";
		blastCtx.fillRect(0, 0, 1, 1);

		return PIXI.Texture.fromCanvas(blast);
	},
	speed: [],
	sprite: [],
	xLoc: [],
	yLoc: [],
	speedFactor : 1,
	show:function() {
		Math.seedrandom(Date.now());
		for (var i = 0; i < Stars.stars.sprite.length; i++) {
			Stars.stars.speed[i] = 10 + Math.random() * 10;
			Stars.stars.xLoc[i] = canvasWidth * Math.random();
			Stars.stars.yLoc[i] = -10 + (canvasWidth + 10) * Math.random();

			if (Math.random() > 0.8)
				Stars.stars.sprite[i].tint = 0x808080 + Math.random() * 0x808080;

			Stars.stars.sprite[i].scale.x = Stars.stars.sprite[i].scale.y = (Stars.stars.speed[i] / 10) * gameModel.resolutionFactor;
		}
		Stars.stars.sprites.visible = true;
	},
	hide:function() {
		Stars.stars.sprites.visible = false;
	},
	initialize: function() {
		Stars.stars.texture = Stars.stars.getTexture();
		Math.seedrandom(Date.now());

		Stars.stars.sprites = new PIXI.Container();
		starContainer.addChild(Stars.stars.sprites);

		for (var i = 0; i < Stars.NUM_STARS * gameModel.detailLevel; i++) {
			Stars.stars.speed[i] = 10 + Math.random() * 10;
			Stars.stars.sprite[i] = new PIXI.Sprite(Stars.stars.texture);
			Stars.stars.xLoc[i] = canvasWidth * Math.random();
			Stars.stars.yLoc[i] = canvasWidth * Math.random();

			if (Math.random() > 0.8)
				Stars.stars.sprite[i].tint = 0x808080 + Math.random() * 0x808080;

			Stars.stars.sprite[i].scale.x = Stars.stars.sprite[i].scale.y = (Stars.stars.speed[i] / 10) * gameModel.resolutionFactor;

			Stars.stars.sprites.addChild(Stars.stars.sprite[i]);
		}
		Stars.StartEndStars.initialize();
	},
	update: function(timeDiff) {

		if (!Stars.stars.sprites.visible)
			return;

		// Math.seedrandom(Date.now());
		for (var i = 0; i < Stars.stars.sprite.length; i++) {

			Stars.stars.yLoc[i] += Stars.stars.speed[i] * timeDiff * Stars.stars.speedFactor;
			Stars.stars.sprite[i].position.x = Stars.stars.xLoc[i] * scalingFactor;
			Stars.stars.sprite[i].position.y = Stars.stars.yLoc[i] * scalingFactor;

			if (Stars.stars.yLoc[i] > canvasHeight + 5) {
				Stars.stars.yLoc[i] = -5;
				Stars.stars.xLoc[i] = Math.random() * canvasWidth;
				Stars.stars.sprite[i].position.x = Stars.stars.xLoc[i] * scalingFactor;
   			Stars.stars.sprite[i].position.y = Stars.stars.yLoc[i] * scalingFactor;
				if (Math.random() > 0.8)
					Stars.stars.sprite[i].tint = 0x808080 + Math.random() * 0x808080;
				else
					Stars.stars.sprite[i].tint = 0xFFFFFF;
			}
		}
		Stars.StartEndStars.update(timeDiff);
	}
};

Stars.powerupParts = {
	getSpritePool : function() {
		if (!this.spritePool) {
			this.spritePool = SpritePool.create(Stars.stars.texture, uiContainer);
		}
		return this.spritePool;
	},
	newPowerupPart:function(x,y,tint,scale) {
		var part = this.getSpritePool().nextSprite();
		part.visible = true;
		part.fadeSpeed= 2 * scalingFactor;
		part.tint = tint || (Math.random() > 0.4 ? 0xffff00 : 0xff5600);
		part.visible = true;
		part.alpha = 1;
		part.position = {
			x: x,
			y: y
		};
		part.scale.x = (1 + Math.random() * 2) * scalingFactor * (scale || 1);
		part.scale.y = (2 + Math.random() * 2) * scalingFactor * (scale || 1);
		part.xSpeed = (-40 + Math.random() * 80) * scalingFactor * (scale || 1);
		part.ySpeed = (-40 + Math.random() * 80) * scalingFactor * (scale || 1);
	},
	update: function(timeDiff) {
		this.getSpritePool();
		var sprite;
		for (var i = 0; i < this.spritePool.sprites.length; i++) {
			sprite = this.spritePool.sprites[i];
			if (sprite.visible) {
				sprite.scale.x -= sprite.fadeSpeed * timeDiff;
				sprite.scale.y -= sprite.fadeSpeed * timeDiff;

				if (sprite.scale.x <= 0) {
					this.spritePool.discardSprite(sprite);
				} else {
					sprite.position.y += sprite.ySpeed * timeDiff;
					sprite.position.x += sprite.xSpeed * timeDiff;
				}
			}
		}
	}
};

Stars.shipTrails = {
	getSpritePool : function() {
		if (!this.spritePool) {
			this.spritePool = SpritePool.create(Stars.stars.texture, starContainer);
		}
		return this.spritePool;
	},
	trailFrequency : 30,
	newPart: function(ship) {

		if (ship.trailX < 0 || ship.trailX > canvasWidth)
			return;

		var part = this.getSpritePool().nextSprite();
		part.visible = true;
		part.tint = Math.random() > 0.4 ? 0xffff00 : 0xff5600;
		part.alpha = 1;
		part.position = {
			x: (ship.trailX - 3 + (Math.random() * 6)) * scalingFactor,
			y: ship.trailY * scalingFactor
		};
		part.fadeSpeed = 8 * scalingFactor;
		part.scale.x = (1 + Math.random() * 2) * scalingFactor;
		part.scale.y = (2 + Math.random() * 2) * scalingFactor;
		part.ySpeed = ((ship.enemyShip ? -1 : 1) * (150 + Math.random() * 100)) * scalingFactor;
		part.xSpeed = (-10 + Math.random() * 20) * scalingFactor;
	},
	updateShip: function(ship, timeDiff) {
		ship.lastTrail += timeDiff * 1000;
		if ((!ship.enemyShip && ship.lastTrail > Stars.shipTrails.trailFrequency + (ship.ySpeed / 2)) || (ship.enemyShip && ship.lastTrail > Stars.shipTrails.trailFrequency)) {
			ship.lastTrail = 0;
			Stars.shipTrails.newPart(ship);
		}
	},
	update: function(timeDiff) {
		this.getSpritePool();
		for (var i = 0; i < this.spritePool.sprites.length; i++) {

			var sprite = this.spritePool.sprites[i];

			if (sprite.visible) {

				sprite.scale.x -= sprite.fadeSpeed * timeDiff;
				sprite.scale.y -= sprite.fadeSpeed * timeDiff;

				if (sprite.scale.x <= 0) {
					this.spritePool.discardSprite(sprite);
				} else {
					sprite.position.y += sprite.ySpeed * timeDiff;
					sprite.position.x += sprite.xSpeed * timeDiff;
				}
			}
		}
	}
};
