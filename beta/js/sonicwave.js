SonicWave = {

	widenPerSecond : 1.3,
	maxWidth : 10,
	heightenPerSecond : 0.5,
	maxHeight: 5,


	generateTexture : function() {
    var size = 8 * scalingFactor;
    var blast = document.createElement('canvas');
    blast.width = size + 4;
    blast.height = size + 4;
    var blastCtx = blast.getContext('2d');
    blastCtx.shadowBlur = 5;
    blastCtx.shadowColor = "white";
    var radgrad = blastCtx.createRadialGradient(size / 2 + 2, size / 2 + 2, 0, size / 2 + 2, size / 2 + 2, size / 2);
    radgrad.addColorStop(0, 'rgba(255,255,255,1)');
    radgrad.addColorStop(0.8, 'rgba(255,255,255,0.5)');
    radgrad.addColorStop(1, 'rgba(255,255,255,0)');
    blastCtx.fillStyle = radgrad;
    // blastCtx.fillRect(0, 0, size + 4, size + 4);
		blastCtx.beginPath();
		blastCtx.arc(size / 2 + 2, size / 2 + 2, size / 2, Math.PI, 0, false);
		blastCtx.closePath();
		blastCtx.fill();

    return glowTexture(
			PIXI.Texture.fromCanvas(blast),
			{blurAmount : 0.4}
		);
  },

	updateBullets : function(timeDiff, spritePool) {
		if (spritePool.destroyed)
			return;
		for (var i = 0; i < spritePool.sprites.length; i++) {
			var sprite = spritePool.sprites[i];

			if (sprite.visible) {
				sprite.xLoc += sprite.xSpeed * timeDiff;
				sprite.yLoc -= sprite.ySpeed * timeDiff;

				if (sprite.scale.x < SonicWave.maxWidth || (sprite.doubleWidth && sprite.scale.x < SonicWave.maxWidth * 2))
					sprite.scale.x = sprite.scale.x * (1 + SonicWave.widenPerSecond * timeDiff);

				if (sprite.scale.y < SonicWave.maxHeight)
					sprite.scale.y = sprite.scale.y * (1 + SonicWave.heightenPerSecond * timeDiff);

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
						spritePool.discardSprite(sprite);
					}
				} else {
					for (var j = 0; j < Enemies.activeShips.length; j++) {
						var enemyShip = Enemies.activeShips[j];
						var leftEdge = RotateVector2d(-4 * sprite.scale.x, 0, sprite.rotation);
						var leftSide = RotateVector2d(-2 * sprite.scale.x, 0, sprite.rotation);
						var rightEdge = RotateVector2d(4 * sprite.scale.x, 0, sprite.rotation);
						var rightSide = RotateVector2d(2 * sprite.scale.x, 0, sprite.rotation);

						if (enemyShip.detectCollision(enemyShip, sprite.xLoc, sprite.yLoc)) {
							Enemies.damageEnemy(enemyShip, sprite.xLoc, sprite.yLoc, sprite.bulletStrength);
							spritePool.discardSprite(sprite);
						} else if (enemyShip.detectCollision(enemyShip, sprite.xLoc + leftEdge.x, sprite.yLoc + leftEdge.y)) {
							Enemies.damageEnemy(enemyShip, sprite.xLoc + leftEdge.x, sprite.yLoc + leftEdge.y, sprite.bulletStrength);
							spritePool.discardSprite(sprite);
						} else if (enemyShip.detectCollision(enemyShip, sprite.xLoc + rightEdge.x, sprite.yLoc + rightEdge.y)) {
							Enemies.damageEnemy(enemyShip, sprite.xLoc + rightEdge.x, sprite.yLoc + rightEdge.y, sprite.bulletStrength);
							spritePool.discardSprite(sprite);
						} else if (enemyShip.detectCollision(enemyShip, sprite.xLoc + leftSide.x, sprite.yLoc + leftSide.y)) {
							Enemies.damageEnemy(enemyShip, sprite.xLoc + leftSide.x, sprite.yLoc + leftSide.y, sprite.bulletStrength);
							spritePool.discardSprite(sprite);
						} else if (enemyShip.detectCollision(enemyShip, sprite.xLoc + rightSide.x, sprite.yLoc + rightSide.y)) {
							Enemies.damageEnemy(enemyShip, sprite.xLoc + rightSide.x, sprite.yLoc + rightSide.y, sprite.bulletStrength);
							spritePool.discardSprite(sprite);
						}
					}
				}
			}
		}
	},

	individualBullet: function(spritePool, speed, position, damage, scale, weapon) {

		var sprite = spritePool.nextSprite();

		sprite.bulletStrength = damage;
		sprite.tint = rgbToHex(35, 220 + Math.random() * 35, 100);
		sprite.xLoc = position.x + (speed.x * 0.02);
		sprite.yLoc = position.y - (speed.y * 0.02);
		sprite.xSpeed = speed.x;
		sprite.ySpeed = speed.y;

		sprite.doubleWidth = weapon.doubleWidth;

		if (!position.rear)
			sprite.rotation = Math.atan2(speed.x, speed.y);

		sprite.visible = true;
		sprite.scale.x = sprite.scale.y = scale;
		sprite.position.x = sprite.xLoc * scalingFactor;
		sprite.position.y = sprite.yLoc * scalingFactor;
	},

  create: function(weapon, container) {

		weapon.lastShot = 0;

		return {
			weapon : weapon,
			spritePool : SpritePool.create(SonicWave.generateTexture(), container),
			resize : function(){
				this.spritePool.changeTexture(SonicWave.generateTexture());
			},
			update : function(timeDiff) {
				SonicWave.updateBullets(timeDiff, this.spritePool);
			},
			readyToFire : function(isWeaponFiring, timeDiff) {
				if (isWeaponFiring) {
					this.weapon.lastShot += timeDiff;
					return this.weapon.lastShot > 1 / this.weapon.shotsPerSecond;
				}
			},
			fireShot : function(position, damageModifier) {
				this.weapon.lastShot = 0;
				var wobble = (1 - this.weapon.accuracy) * 0.1;
				var speed = RotateVector2d(0, this.weapon.bulletSpeed, -position.angle - wobble + Math.random() * wobble * 2);

				Sounds.playerBullets.play(position.x);

				var damagePerShot = weapon.damagePerShot * damageModifier;
				SonicWave.individualBullet(this.spritePool, speed, position, damagePerShot, 1.7, this.weapon);
			},
			destroy : function() {
        this.spritePool.destroy();
      }
		};
  }
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
		sonicWave.ultraName = "Encroaching Doom";
		sonicWave.ultraText = "Waves can grow to twice the normal size";
		sonicWave.doubleWidth = 1;
	}

	return sonicWave;
};
