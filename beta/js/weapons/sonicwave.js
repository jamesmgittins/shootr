SonicWave = {

	widenPerSecond : 1.35,
	maxWidth : 5,
	heightenPerSecond : 0.5,
	maxHeight: 3,
	spriteSize : 16,

	generateTexture : function() {
    var size = this.spriteSize * scalingFactor;
    var blast = document.createElement('canvas');
    blast.width = size + 4;
    blast.height = (size / 2) + 4;
    var blastCtx = blast.getContext('2d');
    blastCtx.shadowBlur = 5;
    blastCtx.shadowColor = "white";
    var radgrad = blastCtx.createRadialGradient(size / 2 + 2, size / 4 + 2, 0, size / 2 + 2, size / 2 + 2, size / 2);
    radgrad.addColorStop(0, 'rgba(255,255,255,0)');
		radgrad.addColorStop(0.5, 'rgba(255,255,255,0)');
    radgrad.addColorStop(0.8, 'rgba(255,255,255,0.5)');
		radgrad.addColorStop(0.9, 'rgba(255,255,255,1)');
    radgrad.addColorStop(1, 'rgba(255,255,255,0)');
    blastCtx.fillStyle = radgrad;
    // blastCtx.fillRect(0, 0, size + 4, size + 4);
		blastCtx.beginPath();
		blastCtx.arc(size / 2 + 2, size / 4 + 2, size / 2, Math.PI, 0, false);
		blastCtx.closePath();
		blastCtx.fill();

    return glowTexture(
			PIXI.Texture.fromCanvas(blast),
			{blurAmount : 0.4}
		);
  }

};

SonicWave.weaponLogic = function(weapon, container) {
	weapon.lastShot = 0;
	this.weapon = weapon;
	this.spritePool = new SpritePool(SonicWave.generateTexture(), container);
};

SonicWave.weaponLogic.prototype.individualBullet = function(speed, position, damage, scale) {
	var sprite = this.spritePool.nextSprite();

	sprite.bulletStrength = damage;
	sprite.tint = rgbToHex(35, 220 + Math.random() * 35, 100);
	sprite.xLoc = position.x + (speed.x * 0.02);
	sprite.yLoc = position.y - (speed.y * 0.02);
	sprite.xSpeed = speed.x;
	sprite.ySpeed = speed.y;

	sprite.doubleWidth = this.weapon.doubleWidth;

	if (!position.rear)
		sprite.rotation = Math.atan2(speed.x, speed.y);

	sprite.visible = true;
	sprite.scale.x = sprite.scale.y = scale;
	sprite.position.x = sprite.xLoc * scalingFactor;
	sprite.position.y = sprite.yLoc * scalingFactor;
};

SonicWave.weaponLogic.prototype.destroy = function() {
	this.spritePool.destroy();
};

SonicWave.weaponLogic.prototype.fireShot = function(position, damageModifier) {
	this.weapon.lastShot = 0;
	var wobble = (1 - this.weapon.accuracy) * 0.1;
	var speed = RotateVector2d(0, this.weapon.bulletSpeed, position.rear ? (-position.angle * 0.7) - wobble + Math.random() * wobble * 2 : -position.angle - wobble + Math.random() * wobble * 2);

	Sounds.playerBullets.play(position.x);

	var damagePerShot = this.weapon.damagePerShot * damageModifier;
	this.individualBullet(speed, position, damagePerShot, 1);
};

SonicWave.weaponLogic.prototype.readyToFire = function(isWeaponFiring, timeDiff, fireRateModifier) {
	if (isWeaponFiring) {
		this.weapon.lastShot += timeDiff;
		return this.weapon.lastShot > 1 / (this.weapon.shotsPerSecond * fireRateModifier);
	}
};

SonicWave.weaponLogic.prototype.emp = function(sprite, x, y) {
	if (this.weapon.emp > 0 && sprite.scale.x >= SonicWave.maxWidth) {
		EMP.newEmp(x, y, sprite.bulletStrength, sprite.tint, 150, (sprite.bulletStrength * 2));
	}
};

SonicWave.weaponLogic.prototype.detectCollision = function(enemyShip, sprite) {

	var leftEdge = RotateVector2d(-8 * sprite.scale.x, 0, sprite.rotation);
	var leftSide = RotateVector2d(-4 * sprite.scale.x, 0, sprite.rotation);
	var rightEdge = RotateVector2d(8 * sprite.scale.x, 0, sprite.rotation);
	var rightSide = RotateVector2d(4 * sprite.scale.x, 0, sprite.rotation);

	if (enemyShip.detectCollision(sprite.xLoc, sprite.yLoc)) {
		return ({x:sprite.xLoc, y:sprite.yLoc});
	} else if (enemyShip.detectCollision(sprite.xLoc + leftEdge.x, sprite.yLoc + leftEdge.y)) {
		return ({x:sprite.xLoc + leftEdge.x, y:sprite.yLoc + leftEdge.y});
	} else if (enemyShip.detectCollision(sprite.xLoc + rightEdge.x, sprite.yLoc + rightEdge.y)) {
		return ({x:sprite.xLoc + rightEdge.x, y:sprite.yLoc + rightEdge.y});
	} else if (enemyShip.detectCollision(sprite.xLoc + leftSide.x, sprite.yLoc + leftSide.y)) {
		return ({x:sprite.xLoc + leftSide.x, y:sprite.yLoc + leftSide.y});
	} else if (enemyShip.detectCollision(sprite.xLoc + rightSide.x, sprite.yLoc + rightSide.y)) {
		return ({x:sprite.xLoc + rightSide.x, y:sprite.yLoc + rightSide.y});
	}
	return false;
};

SonicWave.weaponLogic.prototype.update = function(timeDiff) {
	if (this.spritePool.destroyed)
		return;
	for (var i = 0; i < this.spritePool.sprites.length; i++) {
		var sprite = this.spritePool.sprites[i];

		if (sprite.visible) {
			sprite.xLoc += sprite.xSpeed * timeDiff;
			sprite.yLoc -= sprite.ySpeed * timeDiff;

			if (sprite.scale.x < SonicWave.maxWidth || (sprite.doubleWidth && sprite.scale.x < SonicWave.maxWidth * 2)) {
				sprite.scale.x = sprite.scale.x * (1 + SonicWave.widenPerSecond * timeDiff);
			}


			if (sprite.scale.y < SonicWave.maxHeight)
				sprite.scale.y = sprite.scale.y * (1 + SonicWave.heightenPerSecond * timeDiff);

			sprite.position.x = sprite.xLoc * scalingFactor;
			sprite.position.y = sprite.yLoc * scalingFactor;

			if (sprite.yLoc < -8 || sprite.yLoc > canvasHeight + 8 ||
					sprite.xLoc < -32 || sprite.xLoc > canvasWidth + 32) {
				this.spritePool.discardSprite(sprite);
			} else {
				for (var j = 0; j < Enemies.activeShips.length; j++) {
					var enemyShip = Enemies.activeShips[j];
					var collision = this.detectCollision(enemyShip, sprite);
					if (collision) {
						Enemies.damageEnemy(enemyShip, collision.x, collision.y, sprite.bulletStrength);
						this.emp(sprite, collision.x, collision.y);
						this.spritePool.discardSprite(sprite);
					}
				}
			}
		}
	}
};

SonicWave.weaponLogic.prototype.resize = function() {
	this.spritePool.changeTexture(SonicWave.generateTexture());
};

SonicWave.sonicWave = function(level,seed,rarity) {

	var levelMod = Math.pow(Constants.weaponLevelScaling, level - 1);
	Math.seedrandom(seed);
	var dps = (level * 9 + (Math.random() * level * 2)) * levelMod * rarity.factor;
	var shotsPerSecond = 2.5 + Math.random() * 1;
	var damagePerShot = dps / shotsPerSecond;
  var bulletsPerShot = 1;

	var sonicWave =  {
		ultra:rarity.ultra,
    hyper:rarity.hyper,
    super:rarity.super,
		type: Constants.itemTypes.weapon,
		name: rarity.prefix + "Sonic Wave",
		bullets : bulletsPerShot,
		seed: seed,
		level: level,
		dps: dps,
		shotsPerSecond: shotsPerSecond,
		damagePerShot: damagePerShot,
		accuracy: 0.5 + Math.random() * 0.5,
		bulletSpeed: 300,
		price: Math.round(dps * 30),
		id: gameModel.weaponIdCounter++,
		weaponType : Weapons.types.sonicWave
	};


	if (rarity.ultra || rarity.hyper) {
		if (Math.random() > 0.7) {
			sonicWave.ultraName = "Encroaching Doom";
			sonicWave.ultraText = "Waves can grow to twice the normal size";
			sonicWave.doubleWidth = 1;
		} else {
			sonicWave.ultraName = "Sonic Boom";
			sonicWave.ultraText = "Waves that reach maximum size will release\n a shockwave for up to " + formatMoney(damagePerShot) + " damage on impact";
			sonicWave.emp = damagePerShot;
		}
	}

	return sonicWave;
};
