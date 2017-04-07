VulcanCannon = {

	generateTexture : function() {
    var size = 16 * scalingFactor;
		var squish = 0.25;
    var blast = document.createElement('canvas');
    blast.width = (size + 4) * squish;
    blast.height = size + 4;
    var blastCtx = blast.getContext('2d');
    blastCtx.shadowBlur = 5;
    blastCtx.shadowColor = "white";
    var radgrad = blastCtx.createRadialGradient(size / 2 + 2, size / 2 + 2, 0, size / 2 + 2, size / 2 + 2, size / 2);
    radgrad.addColorStop(0, 'rgba(255,255,255,1)');
    radgrad.addColorStop(0.8, 'rgba(255,255,255,0.8)');
    radgrad.addColorStop(1, 'rgba(255,255,255,0)');
		blastCtx.scale(squish,1);
    blastCtx.fillStyle = radgrad;
      blastCtx.fillRect(0, 0, size + 4, size + 4);
    return glowTexture(
			PIXI.Texture.fromCanvas(blast),
			{blurAmount : 0.2}
		);
  },

	updateBullets : function(timeDiff, spritePool) {
		for (var i = 0; i < spritePool.sprites.length; i++) {
			var sprite = spritePool.sprites[i];

			if (sprite.visible) {
				sprite.xLoc += sprite.xSpeed * timeDiff;
				sprite.yLoc -= sprite.ySpeed * timeDiff;

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
					for (var j = 0; j < EnemyShips.activeShips.length; j++) {
						var enemyShip = EnemyShips.activeShips[j];
						if (sprite.lastEnemyDamaged != enemyShip.id && Ships.detectCollision(enemyShip, sprite.xLoc, sprite.yLoc)) {
							EnemyShips.damageEnemyShip(enemyShip, sprite.xLoc, sprite.yLoc, sprite.bulletStrength);
							if (sprite.passThrough) {
								sprite.lastEnemyDamaged = enemyShip.id;
							} else {
								spritePool.discardSprite(sprite);
							}
						}
					}
				}
			}
		}
	},

	individualBullet: function(spritePool, speed, position, damage, scale, weapon) {

		var sprite = spritePool.nextSprite();

		sprite.bulletStrength = damage;

		if (weapon.ultra || weapon.hyper) {
			sprite.tint = rgbToHex(255, 200 + Math.random() * 35, 100);
		} else {
			sprite.tint = rgbToHex(255, 100 + Math.random() * 20, 0);
		}
		sprite.xLoc = position.x + (speed.x * 0.02);
		sprite.yLoc = position.y - (speed.y * 0.02);
		sprite.xSpeed = speed.x;
		sprite.ySpeed = speed.y;

		sprite.rotation = Math.atan2(speed.x, speed.y);

		sprite.passThrough = weapon.passThrough;
		sprite.lastEnemyDamaged = 0;

		sprite.visible = true;
		sprite.scale.x = sprite.scale.y = scale;
		sprite.position.x = sprite.xLoc * scalingFactor;
		sprite.position.y = sprite.yLoc * scalingFactor;
	},

  create: function(weapon, container) {

		weapon.lastShot = 0;

		return {
			weapon : weapon,
			rearAngleMod:0.8,
			spritePool : SpritePool.create(VulcanCannon.generateTexture(), container),
			resize : function(){
				this.spritePool.changeTexture(VulcanCannon.generateTexture());
			},
			update : function(timeDiff) {
				VulcanCannon.updateBullets(timeDiff, this.spritePool);
			},
			readyToFire : function(isWeaponFiring, timeDiff) {
				if (isWeaponFiring) {
					this.weapon.lastShot += timeDiff;
					return this.weapon.lastShot > 1 / this.weapon.shotsPerSecond;
				}
			},
			fireShot : function(position, damageModifier) {
				this.weapon.lastShot = 0;
				var wobble = (1 - this.weapon.accuracy) * 0.2;
				var speed = RotateVector2d(0, this.weapon.bulletSpeed, -position.angle - wobble + Math.random() * wobble * 2);

				Sounds.playerBullets.play();

				VulcanCannon.individualBullet(this.spritePool, speed, position, weapon.damagePerShot * damageModifier, 1, this.weapon);
			}
		};
  }
};


VulcanCannon.vulcanCannon = function(level,seed,rarity) {

	var levelMod = Math.pow(Constants.weaponLevelScaling, level - 1);
	Math.seedrandom(seed);
	var dps = (level * 9 + (Math.random() * level * 2)) * levelMod * rarity.factor;
	var shotsPerSecond = 16 + Math.random() * 5;
	var damagePerShot = dps / shotsPerSecond;
  var bulletsPerShot = 1;

	var vulcanCannon =  {
		ultra:rarity.ultra,
    hyper:rarity.hyper,
    super:rarity.super,
		type: Constants.itemTypes.weapon,
		name: rarity.prefix + "Vulcan Cannon",
		bullets : bulletsPerShot,
		seed: seed,
		level: level,
		dps: dps,
		shotsPerSecond: shotsPerSecond,
		damagePerShot: damagePerShot,
		accuracy: 0.7 + Math.random() * 0.3,
		bulletSpeed: 700,
		price: Math.round(dps * 30),
		id: gameModel.weaponIdCounter++,
		weaponType : Weapons.types.vulcanCannon
	};

	if (rarity.ultra || rarity.hyper) {
			vulcanCannon.ultraName = "Rip and Tear";
			vulcanCannon.ultraText = "Bullets will not be destroyed when damaging an enemy";
			vulcanCannon.passThrough = 1;
	}

	return vulcanCannon;
};
