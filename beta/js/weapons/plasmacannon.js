PlasmaCannon = {


	hotDogTexture : function() {
			return glowTexture(PIXI.Texture.fromImage("img/hot-dog.svg"), {resize:0.06 * scalingFactor, blurAmount : 0.4, dontDestroyOriginal:true});
	},


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
    blastCtx.fillRect(0, 0, size + 4, size + 4);
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

				sprite.position.x = sprite.xLoc * scalingFactor;
				sprite.position.y = sprite.yLoc * scalingFactor;

				if (sprite.yLoc < -8 || sprite.yLoc > canvasHeight + 8 ||
					sprite.xLoc < -8 || sprite.xLoc > canvasWidth + 8) {
					if (Math.random() < sprite.weapon.ricochet) {

						var speed = RotateVector2d(0, sprite.weapon.bulletSpeed, Math.random() * 2 * Math.PI);

						if (Loadout.weaponMenuOpen) {
							PlasmaCannon.individualBullet(spritePool, speed, {
								x: Loadout.shipSprite.position.x / scalingFactor,
								y: Loadout.shipSprite.position.y / scalingFactor
							}, sprite.bulletStrength, sprite.scale.x, sprite.weapon);
						} else {
							PlasmaCannon.individualBullet(spritePool, speed, {
								x: PlayerShip.playerShip.xLoc,
								y: PlayerShip.playerShip.yLoc
							}, sprite.bulletStrength, sprite.scale.x, sprite.weapon);
						}


					}
					spritePool.discardSprite(sprite);

				} else {
					for (var j = 0; j < Enemies.activeShips.length; j++) {
						var enemyShip = Enemies.activeShips[j];
						if (sprite.lastEnemyDamaged != enemyShip.id && enemyShip.detectCollision(enemyShip, sprite.xLoc, sprite.yLoc)) {
							Enemies.damageEnemy(enemyShip, sprite.xLoc, sprite.yLoc, sprite.bulletStrength);
							if (Math.random() < sprite.weapon.empChance) {
								EMP.newEmp(sprite.xLoc, sprite.yLoc, sprite.weapon.emp, Math.random() > 0.5 ? 0xf92a2a : 0xf9b32a, 250);
							}
							if (Math.random() < sprite.weapon.passThrough) {
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
		sprite.tint = rgbToHex(255, 220 + Math.random() * 35, 75);
		sprite.xLoc = position.x + (speed.x * 0.02);
		sprite.yLoc = position.y - (speed.y * 0.02);
		sprite.xSpeed = speed.x;
		sprite.ySpeed = speed.y;
		sprite.lastEnemyDamaged = undefined;

		sprite.weapon = weapon;
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
			spritePool : SpritePool.create(weapon.alternateTexture == "hotdog" ? PlasmaCannon.hotDogTexture() : PlasmaCannon.generateTexture(), container),
			resize : function(){
				this.spritePool.changeTexture(weapon.alternateTexture == "hotdog" ? PlasmaCannon.hotDogTexture() : PlasmaCannon.generateTexture());
			},
			update : function(timeDiff) {
				PlasmaCannon.updateBullets(timeDiff, this.spritePool);
			},
			readyToFire : function(isWeaponFiring, timeDiff) {
				if (isWeaponFiring) {
					this.weapon.lastShot += timeDiff;
					return this.weapon.lastShot > 1 / this.weapon.shotsPerSecond;
				}
			},
			destroy : function() {
        this.spritePool.destroy();
      },
			fireShot : function(position, damageModifier) {
				this.weapon.lastShot = 0;
				var wobble = (1 - this.weapon.accuracy) * 0.2;
				var speed = RotateVector2d(0, this.weapon.bulletSpeed, -position.angle - wobble + Math.random() * wobble * 2);

				Sounds.playerBullets.play(position.x);

				var damagePerShot = weapon.damagePerShot * damageModifier;
				switch (this.weapon.bullets) {
					case 1:
						PlasmaCannon.individualBullet(this.spritePool, speed, position, damagePerShot, 1.7, this.weapon);
						break;
					case 2:
						var angle = Math.atan2(speed.x, speed.y);
						var leftPosAdj = RotateVector2d(0, -5, angle + Math.PI / 2);
						var rightPosAdj = RotateVector2d(0, -5, angle - Math.PI / 2);
						PlasmaCannon.individualBullet(this.spritePool, speed, {
							x: position.x + leftPosAdj.x,
							y: position.y + leftPosAdj.y
						}, damagePerShot / 2, 1.2, this.weapon);
						PlasmaCannon.individualBullet(this.spritePool, speed, {
							x: position.x + rightPosAdj.x,
							y: position.y + rightPosAdj.y
						}, damagePerShot / 2, 1.2, this.weapon);
						break;
					case 3:
						var angleTrip = Math.atan2(speed.x, speed.y);
						var leftPosAdjTrip = RotateVector2d(0, -10, angleTrip + Math.PI / 2);
						var rightPosAdjTrip = RotateVector2d(0, -10, angleTrip - Math.PI / 2);
						PlasmaCannon.individualBullet(this.spritePool, speed, {
							x: position.x + leftPosAdjTrip.x,
							y: position.y + leftPosAdjTrip.y
						}, damagePerShot / 3, 1, this.weapon);
						PlasmaCannon.individualBullet(this.spritePool, speed, {
							x: position.x,
							y: position.y
						}, damagePerShot / 3, 1, this.weapon);
						PlasmaCannon.individualBullet(this.spritePool, speed, {
							x: position.x + rightPosAdjTrip.x,
							y: position.y + rightPosAdjTrip.y
						}, damagePerShot / 3, 1, this.weapon);
						break;
				}
			}
		};
  }
};

PlasmaCannon.plasmaCannon = function(level,seed,rarity) {

	var levelMod = Math.pow(Constants.weaponLevelScaling, level - 1);
	Math.seedrandom(seed);
	var dps = (level * 9 + (Math.random() * level * 2)) * levelMod * rarity.factor;
	var shotsPerSecond = 6 + Math.random() * 5;
	var damagePerShot = dps / shotsPerSecond;
  var bulletsPerShot = 1;

  if (level >= 5 && Math.random() > 0.7)
	  bulletsPerShot++;

  if (level >= 10 && Math.random() > 0.7)
	  bulletsPerShot++;

	var plasmaCannon =  {
		ultra:rarity.ultra,
    hyper:rarity.hyper,
    super:rarity.super,
		type: Constants.itemTypes.weapon,
		name: (bulletsPerShot == 3 ? "Triple " : (bulletsPerShot == 2 ? "Double " : "")) + rarity.prefix + "Plasma Cannon",
		bullets : bulletsPerShot,
		seed: seed,
		level: level,
		dps: dps,
		shotsPerSecond: shotsPerSecond,
		damagePerShot: damagePerShot,
		accuracy: 0.5 + Math.random() * 0.5,
		bulletSpeed: 400,
		price: Math.round(dps * 30),
		id: gameModel.weaponIdCounter++,
		weaponType : Weapons.types.plasmaCannon,
		empChance : -1
	};

	if (rarity.ultra || rarity.hyper) {
		if (Math.random() > 0.9 && bulletsPerShot == 1) {
			plasmaCannon.ultraName = "Ketchup or Mustard";
			plasmaCannon.name = "Ultra Hot Dog Blaster";
			plasmaCannon.alternateTexture = "hotdog";
			plasmaCannon.empChance = 0.05;
			plasmaCannon.emp = damagePerShot * 2;
			plasmaCannon.ultraText = "5% chance on hit to cover the screen with condiments for " + formatMoney(plasmaCannon.emp) + " damage";
		} else {
			if (Math.random() > 0.5 ) {
				plasmaCannon.ricochet = 0.25 + (Math.random() * 0.25);
				plasmaCannon.ultraName = "Second Chances";
				plasmaCannon.ultraText = "Missed shots have a " + Math.round(plasmaCannon.ricochet * 100) + "% chance to fire a new bullet";
			} else {
				plasmaCannon.passThrough = 0.25 + (Math.random() * 0.25);
				plasmaCannon.ultraName = "Deep Thunder";
				plasmaCannon.ultraText = "Bullets have a " + Math.round(plasmaCannon.passThrough * 100) + "% chance to not be destroyed";
			}
		}
	}

	return plasmaCannon;
};
