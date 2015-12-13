var Stars = {};

Stars.NUM_STARS = 200;

Stars.stars = {
	texture: (function() {
		var blast = document.createElement('canvas');
		blast.width = 1;
		blast.height = 1;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = "#ffffff";
		blastCtx.fillRect(0, 0, 1, 1);

		return PIXI.Texture.fromCanvas(blast);
	})(),
	speed: [],
	sprite: [],
	initialize: function() {

		Stars.stars.sprites = new PIXI.Container();

		for (var i = 0; i < Stars.NUM_STARS; i++) {
			Stars.stars.speed[i] = 10 + Math.random() * 10;
			Stars.stars.sprite[i] = new PIXI.Sprite(Stars.stars.texture);
			Stars.stars.sprite[i].position.x = Math.random() * canvasWidth;
			Stars.stars.sprite[i].position.y = Math.random() * canvasHeight;
			Stars.stars.sprite[i].anchor = {
				x: 0.5,
				y: 0.5
			};
			if (Math.random() > 0.8)
				Stars.stars.sprite[i].tint = 0x808080 + Math.random() * 0x808080;
			if(Stars.stars.speed[i]>17)			
				Stars.stars.sprite[i].scale.x = Stars.stars.sprite[i].scale.y = 2;
			Stars.stars.sprites.addChild(Stars.stars.sprite[i]);
		}
		starContainer.addChild(Stars.stars.sprites);

	},
	update: function(timeDiff) {

		for (var i = 0; i < Stars.NUM_STARS; i++) {
			Stars.stars.sprite[i].position.y += Stars.stars.speed[i] * timeDiff;
			if (Stars.stars.sprite[i].position.y > canvasHeight + 5) {
				Stars.stars.sprite[i].position.y = -5;
				Stars.stars.sprite[i].position.x = Math.random() * canvasWidth;
				if (Math.random() > 0.8)
					Stars.stars.sprite[i].tint = 0x808080 + Math.random() * 0x808080;
				else
					Stars.stars.sprite[i].tint = 0xFFFFFF;
			}
		}
	}
};

Stars.shipTrails = {
	texture: (function() {
		var blast = document.createElement('canvas');
		blast.width = 1;
		blast.height = 2;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = "#ffff00";
		blastCtx.fillRect(0, 0, 1, 2);

		return PIXI.Texture.fromCanvas(blast);
	})(),
	texture2: (function() {
		var blast = document.createElement('canvas');
		blast.width = 1;
		blast.height = 2;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = "#ff5600";
		blastCtx.fillRect(0, 0, 1, 2);

		return PIXI.Texture.fromCanvas(blast);
	})(),
	maxTrails: 200,
	currTrail: 0,
	fadeSpeed: [],
	speedY: [],
	speedX: [],
	sprite: [],
	newPowerupPart:function(x,y) {
		if (Stars.shipTrails.currTrail >= Stars.shipTrails.maxTrails)
			Stars.shipTrails.currTrail = 0;

		Stars.shipTrails.fadeSpeed[Stars.shipTrails.currTrail] = 1;
		Stars.shipTrails.sprite[Stars.shipTrails.currTrail].visible = true;
		Stars.shipTrails.sprite[Stars.shipTrails.currTrail].alpha = 1;
		Stars.shipTrails.sprite[Stars.shipTrails.currTrail].position = {
			x: x,
			y: y
		};
		Stars.shipTrails.sprite[Stars.shipTrails.currTrail].scale.x = 1 + Math.random() * 2;
		Stars.shipTrails.sprite[Stars.shipTrails.currTrail].scale.y = 1 + Math.random() * 2;
		Stars.shipTrails.speedY[Stars.shipTrails.currTrail] = -40 + Math.random() * 80;
		Stars.shipTrails.speedX[Stars.shipTrails.currTrail] = -40 + Math.random() * 80;

		Stars.shipTrails.currTrail++;
	},
	newPart: function(ship) {
		if (Stars.shipTrails.currTrail >= Stars.shipTrails.maxTrails)
			Stars.shipTrails.currTrail = 0;

		Stars.shipTrails.sprite[Stars.shipTrails.currTrail].visible = true;
		Stars.shipTrails.sprite[Stars.shipTrails.currTrail].alpha = 1;
		Stars.shipTrails.sprite[Stars.shipTrails.currTrail].position = {
			x: ship.trailX - 3 + (Math.random() * 6),
			y: ship.trailY
		};
		Stars.shipTrails.fadeSpeed[Stars.shipTrails.currTrail] = 7;
		Stars.shipTrails.sprite[Stars.shipTrails.currTrail].scale.x = 1 + Math.random() * 2;
		Stars.shipTrails.sprite[Stars.shipTrails.currTrail].scale.y = 1 + Math.random() * 2;
		Stars.shipTrails.speedY[Stars.shipTrails.currTrail] = (ship.enemyShip ? -1 : 1) * (150 + Math.random() * 100);
		Stars.shipTrails.speedX[Stars.shipTrails.currTrail] = -10 + Math.random() * 20;

		Stars.shipTrails.currTrail++;
	},
	initialize: function() {
		Stars.shipTrails.sprites = new PIXI.Container();
		Stars.shipTrails.sprites2 = new PIXI.Container();
		
		for (var i = 0; i < Stars.shipTrails.maxTrails; i++) {

			if (Math.random() > 0.4) {
				Stars.shipTrails.sprite[i] = new PIXI.Sprite(Stars.shipTrails.texture);
				Stars.shipTrails.sprites.addChild(Stars.shipTrails.sprite[i]);
			} else {
				Stars.shipTrails.sprite[i] = new PIXI.Sprite(Stars.shipTrails.texture2);
				Stars.shipTrails.sprites2.addChild(Stars.shipTrails.sprite[i]);
			}


			Stars.shipTrails.sprite[i].visible = false;
			Stars.shipTrails.sprite[i].anchor = {
				x: 0.5,
				y: 0
			};

		}
		starContainer.addChild(Stars.shipTrails.sprites2);
		starContainer.addChild(Stars.shipTrails.sprites);

	},
	updateShip: function(ship, timeDiff) {
		ship.lastTrail += timeDiff * 1000;
		if (ship.lastTrail > 30) {
			ship.lastTrail = 0;
			Stars.shipTrails.newPart(ship);
		}
	},
	update: function(timeDiff) {
		for (var i = 0; i < Stars.shipTrails.maxTrails; i++) {
			if (Stars.shipTrails.sprite[i].visible) {

				Stars.shipTrails.sprite[i].scale.x -= Stars.shipTrails.fadeSpeed[i] * timeDiff;
				Stars.shipTrails.sprite[i].scale.y -= Stars.shipTrails.fadeSpeed[i] * timeDiff;

				if (Stars.shipTrails.sprite[i].scale.x <= 0) {
					Stars.shipTrails.sprite[i].visible = false;
				} else {
					Stars.shipTrails.sprite[i].position.y += Stars.shipTrails.speedY[i] * timeDiff;
					Stars.shipTrails.sprite[i].position.x += Stars.shipTrails.speedX[i] * timeDiff;
				}

			}
		}
	}
};