BioGelGun = {

	initialDamage: 0.01,
	damageOverTimeSec : 3,
	startSpeed : 500,
	decelleration:300,
	minSpeed : 190,

	generateTexture : function() {
    var size = 24 * scalingFactor;
    var blast = document.createElement('canvas');
    blast.width = size + 4;
    blast.height = size + 4;
    var blastCtx = blast.getContext('2d');
    var radgrad = blastCtx.createRadialGradient(size / 2 + 2, size / 2 + 2, 0, size / 2 + 2, size / 2 + 2, size / 2);
    radgrad.addColorStop(0, 'rgba(255,255,255,1)');
    radgrad.addColorStop(0.9, 'rgba(255,255,255,0.7)');
		radgrad.addColorStop(0.95, 'rgba(200,200,200,0.9)');
    radgrad.addColorStop(1, 'rgba(100,100,100,0)');
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

				if (sprite.ship) {
					if (sprite.ship.inPlay) {

						sprite.scale.x = sprite.scale.y -= timeDiff * (1 / BioGelGun.damageOverTimeSec);
						if (sprite.scale.x < 0) {
							spritePool.discardSprite(sprite);
						} else {
							EnemyShips.damageEnemyShip(sprite.ship, sprite.ship.xLoc + sprite.xLoc, sprite.ship.yLoc + sprite.yLoc, sprite.bulletStrength * timeDiff * (1 / BioGelGun.damageOverTimeSec), true);
							var vector = RotateVector2d(sprite.xLoc, sprite.yLoc, sprite.ship.sprite.rotation);
							sprite.position.x = (sprite.ship.xLoc + vector.x) * scalingFactor;
							sprite.position.y = (sprite.ship.yLoc + vector.y) * scalingFactor;
						}
					} else {
						spritePool.discardSprite(sprite);
					}
				} else {

					if (magnitude(sprite.xSpeed, sprite.ySpeed) > BioGelGun.minSpeed) {
						var newSpeed = magnitude(sprite.xSpeed, sprite.ySpeed) - BioGelGun.decelleration * timeDiff;
						var vector = RotateVector2d(0, newSpeed, -sprite.rotation);
						sprite.xSpeed = vector.x;
						sprite.ySpeed = vector.y;
					}

					sprite.xLoc += sprite.xSpeed * timeDiff;
					sprite.yLoc -= sprite.ySpeed * timeDiff;

					sprite.position.x = sprite.xLoc * scalingFactor;
					sprite.position.y = sprite.yLoc * scalingFactor;

					sprite.squish += 5 * timeDiff;

					sprite.scale.x = (0.7 + Math.abs(Math.sin(sprite.squish)) * 0.3) * sprite.scale.y;

					if (sprite.yLoc < -8 || sprite.yLoc > canvasHeight + 8 ||
							sprite.xLoc < -8 || sprite.xLoc > canvasWidth + 8) {
						spritePool.discardSprite(sprite);
					} else {
						for (var j = 0; j < EnemyShips.activeShips.length; j++) {
							var enemyShip = EnemyShips.activeShips[j];
							if (Ships.detectCollision(enemyShip, sprite.xLoc, sprite.yLoc)) {
								EnemyShips.damageEnemyShip(enemyShip, sprite.xLoc, sprite.yLoc, sprite.bulletStrength * BioGelGun.initialDamage);
								sprite.ship = enemyShip;
								sprite.scale.x = sprite.scale.y = 1;
								sprite.xLoc -= enemyShip.xLoc;
								sprite.yLoc -= enemyShip.yLoc;
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
			sprite.tint = rgbToHex(0, 100 + Math.random() * 35, 100);
		} else {
			sprite.tint = rgbToHex(0, 150 + Math.random() * 20, 0);
		}
		sprite.xLoc = position.x + (speed.x * 0.02);
		sprite.yLoc = position.y - (speed.y * 0.02);
		sprite.xSpeed = speed.x;
		sprite.ySpeed = speed.y;

		sprite.squish = Math.random() * Math.PI / 2;
		sprite.rotation = Math.atan2(speed.x, speed.y);
		sprite.ship = false;

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
			spritePool : SpritePool.create(BioGelGun.generateTexture(), container),
			resize : function(){
				this.spritePool.changeTexture(BioGelGun.generateTexture());
			},
			update : function(timeDiff) {
				BioGelGun.updateBullets(timeDiff, this.spritePool);
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
				var speed = RotateVector2d(0, BioGelGun.startSpeed, -position.angle - wobble + Math.random() * wobble * 2);

				Sounds.playerBullets.play();

				// var angle = Math.atan2(speed.x, speed.y);

				if (Math.random() > 0.8) {
					var leftSize = 0.2 + Math.random() * 0.6;
					var leftPosAdj = RotateVector2d(0, -8, -position.angle + Math.PI / 2);
					BioGelGun.individualBullet(this.spritePool, speed, {
						x: position.x + leftPosAdj.x,
						y: position.y + leftPosAdj.y
					}, weapon.damagePerShot * damageModifier * 0.5, leftSize, this.weapon);
					this.weapon.alternateFire = false;

					speed = RotateVector2d(0, BioGelGun.startSpeed, -position.angle - wobble + Math.random() * wobble * 2);
					var rightPosAdj = RotateVector2d(0, -8, -position.angle - Math.PI / 2);
					BioGelGun.individualBullet(this.spritePool, speed, {
						x: position.x + rightPosAdj.x,
						y: position.y + rightPosAdj.y
					}, weapon.damagePerShot * damageModifier * 0.5, 1 - leftSize, this.weapon);
					this.weapon.alternateFire = true;
				} else {
					BioGelGun.individualBullet(this.spritePool, speed, {
						x: position.x,
						y: position.y
					}, weapon.damagePerShot * damageModifier, 1, this.weapon);
					this.weapon.alternateFire = true;
				}
			}
		};
  }
};


BioGelGun.bioGelGun = function(level,seed,rarity) {

	var levelMod = Math.pow(Constants.weaponLevelScaling, level - 1);
	Math.seedrandom(seed);
	var dps = (level * 9 + (Math.random() * level * 2)) * levelMod * rarity.factor;
	var shotsPerSecond = 2 + Math.random() * 2;
	var damagePerShot = dps / shotsPerSecond;
  var bulletsPerShot = 1;

	var bioGelGun =  {
		ultra:rarity.ultra,
    hyper:rarity.hyper,
    super:rarity.super,
		type: Constants.itemTypes.weapon,
		name: rarity.prefix + "Biogel Gun",
		bullets : bulletsPerShot,
		seed: seed,
		level: level,
		dps: dps,
		shotsPerSecond: shotsPerSecond,
		damagePerShot: damagePerShot,
		accuracy: 0.6 + Math.random() * 0.1,
		bulletSpeed: BioGelGun.startSpeed,
		price: Math.round(dps * 30),
		id: gameModel.weaponIdCounter++,
		weaponType : Weapons.types.bioGelGun
	};

	if (rarity.ultra || rarity.hyper) {
			bioGelGun.ultraName = "Spooge";
			bioGelGun.ultraText = "Bullets will not be destroyed when damaging an enemy";
	}

	return bioGelGun;
};
