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

	create : function (weapon, container) {
		return new BioGelGun.weaponLogic(weapon, container);
	}

};

BioGelGun.weaponLogic = function(weapon, container) {
	weapon.lastShot = 0;
	this.weapon = weapon;
	this.spritePool = new SpritePool(BioGelGun.generateTexture(), container);
};

BioGelGun.weaponLogic.prototype.individualBullet = function (speed, position, damage, scale) {
	var sprite = this.spritePool.nextSprite();

	sprite.bulletStrength = damage;
	sprite.lastSpread = 0;

	if (this.weapon.ultra || this.weapon.hyper) {
		sprite.tint = rgbToHex(0, 150 + Math.random() * 35, 180);
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
	sprite.weapon = this.weapon;

	sprite.visible = true;
	sprite.scale.x = sprite.scale.y = scale;
	sprite.position.x = sprite.xLoc * scalingFactor;
	sprite.position.y = sprite.yLoc * scalingFactor;
};

BioGelGun.weaponLogic.prototype.destroy = function() {
	this.spritePool.destroy();
};

BioGelGun.weaponLogic.prototype.fireShot = function(position, damageModifier) {
	this.weapon.lastShot = 0;
	var wobble = (1 - this.weapon.accuracy) * 0.2;
	var speed = RotateVector2d(0, BioGelGun.startSpeed, -position.angle - wobble + Math.random() * wobble * 2);

	Sounds.playerBullets.play(position.x);

	// var angle = Math.atan2(speed.x, speed.y);

	if (Math.random() > 0.8) {
		var leftSize = 0.2 + Math.random() * 0.6;
		var leftPosAdj = RotateVector2d(0, -8, -position.angle + Math.PI / 2);
		this.individualBullet(speed, {
			x: position.x + leftPosAdj.x,
			y: position.y + leftPosAdj.y
		}, this.weapon.damagePerShot * damageModifier * 0.5, leftSize);


		speed = RotateVector2d(0, BioGelGun.startSpeed, -position.angle - wobble + Math.random() * wobble * 2);
		var rightPosAdj = RotateVector2d(0, -8, -position.angle - Math.PI / 2);
		this.individualBullet(speed, {
			x: position.x + rightPosAdj.x,
			y: position.y + rightPosAdj.y
		}, this.weapon.damagePerShot * damageModifier * 0.5, 1 - leftSize);

	} else {
		this.individualBullet(speed, {
			x: position.x,
			y: position.y
		}, this.weapon.damagePerShot * damageModifier, 1);

	}
};

BioGelGun.weaponLogic.prototype.update = function(timeDiff) {
	if (this.spritePool.destroyed)
		return;

	for (var i = 0; i < this.spritePool.sprites.length; i++) {
		var sprite = this.spritePool.sprites[i];
		var vector;
		var speed;
		if (sprite.visible) {

			if (sprite.ship) {
				if (sprite.ship.inPlay) {

					sprite.scale.x = sprite.scale.y -= timeDiff * (1 / BioGelGun.damageOverTimeSec);
					sprite.lastSpread += timeDiff;

					if (sprite.scale.x < 0) {
						this.spritePool.discardSprite(sprite);
					} else {
						Enemies.damageEnemy(sprite.ship, sprite.ship.xLoc + sprite.xLoc, sprite.ship.yLoc + sprite.yLoc, sprite.bulletStrength * timeDiff * (1 / BioGelGun.damageOverTimeSec), true);
						vector = RotateVector2d(sprite.xLoc, sprite.yLoc, sprite.ship.sprite.rotation - sprite.shipRotation);
						sprite.position.x = (sprite.ship.xLoc + vector.x) * scalingFactor;
						sprite.position.y = (sprite.ship.yLoc + vector.y) * scalingFactor;
					}
					if (this.weapon.spread && sprite.lastSpread > 1 && sprite.bulletStrength >= this.weapon.damagePerShot * 0.5) {
						sprite.lastSpread = 0;
						speed = RotateVector2d(0, BioGelGun.minSpeed, Math.random() * 2 * Math.PI);
						this.individualBullet(speed, {
							x: sprite.position.x / scalingFactor,
							y: sprite.position.y / scalingFactor
						}, sprite.bulletStrength * 0.5, 0.5);
					}
				} else {
					speed = RotateVector2d(0, BioGelGun.minSpeed, Math.random() * 2 * Math.PI);
					this.individualBullet(speed, {
						x: sprite.position.x / scalingFactor,
						y: sprite.position.y / scalingFactor
					}, sprite.bulletStrength * 0.5, 0.5);
					this.spritePool.discardSprite(sprite);
				}
			} else {

				if (magnitude(sprite.xSpeed, sprite.ySpeed) > BioGelGun.minSpeed) {
					var newSpeed = magnitude(sprite.xSpeed, sprite.ySpeed) - BioGelGun.decelleration * timeDiff;
					vector = RotateVector2d(0, newSpeed, -sprite.rotation);
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
					this.spritePool.discardSprite(sprite);
				} else {
					for (var j = 0; j < Enemies.activeShips.length; j++) {
						var enemyShip = Enemies.activeShips[j];
						if (enemyShip.detectCollision(sprite.xLoc, sprite.yLoc)) {
							Enemies.damageEnemy(enemyShip, sprite.xLoc, sprite.yLoc, sprite.bulletStrength * BioGelGun.initialDamage);
							sprite.ship = enemyShip;
							sprite.scale.x = sprite.scale.y = 1;
							sprite.xLoc -= enemyShip.xLoc;
							sprite.yLoc -= enemyShip.yLoc;
							sprite.shipRotation = sprite.ship.sprite.rotation;
						}
					}
				}
			}
		}
	}
};

BioGelGun.weaponLogic.prototype.resize = function() {
	this.spritePool.changeTexture(BioGelGun.generateTexture());
};

BioGelGun.weaponLogic.prototype.readyToFire = function(isWeaponFiring, timeDiff) {
	if (isWeaponFiring) {
		this.weapon.lastShot += timeDiff;
		return this.weapon.lastShot > 1 / this.weapon.shotsPerSecond;
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
			bioGelGun.ultraName = "Toxic Avenger";
			bioGelGun.ultraText = "Gel will periodically spread";
			bioGelGun.spread = true;
	}

	return bioGelGun;
};
