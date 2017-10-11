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
  }

};

VulcanCannon.weaponLogic = function(weapon, container) {
	weapon.lastShot = 0;
	this.weapon = weapon;
	this.rearAngleMod = 0.8;
	this.spritePool = new SpritePool(VulcanCannon.generateTexture(), container);
};

VulcanCannon.weaponLogic.prototype.individualBullet = function(speed, position, damage, scale) {
	var sprite = this.spritePool.nextSprite();

	sprite.bulletStrength = damage;

	if (this.weapon.ultra || this.weapon.hyper) {
		sprite.tint = rgbToHex(255, 200 + Math.random() * 35, 100);
	} else {
		sprite.tint = rgbToHex(255, 100 + Math.random() * 20, 0);
	}
	sprite.xLoc = position.x + (speed.x * 0.02);
	sprite.yLoc = position.y - (speed.y * 0.02);
	sprite.xSpeed = speed.x;
	sprite.ySpeed = speed.y;

	sprite.rotation = Math.atan2(speed.x, speed.y);

	sprite.lastEnemyDamaged = 0;

	sprite.visible = true;
	sprite.scale.x = sprite.scale.y = scale;
	sprite.position.x = sprite.xLoc * scalingFactor;
	sprite.position.y = sprite.yLoc * scalingFactor;
};

VulcanCannon.weaponLogic.prototype.fireShot = function(position, damageModifier) {
	this.weapon.lastShot = 0;
	var wobble = (1 - this.weapon.accuracy) * 0.2;
	var speed;
	if (position.rear) {
		speed = RotateVector2d(0, this.weapon.bulletSpeed, (-position.angle * this.rearAngleMod) - wobble + Math.random() * wobble * 2);
	} else {
		speed = RotateVector2d(0, this.weapon.bulletSpeed, -position.angle - wobble + Math.random() * wobble * 2);
	}

	Sounds.playerBullets.play(position.x);
	this.individualBullet(speed, position, this.weapon.damagePerShot * damageModifier, 1);
};

VulcanCannon.weaponLogic.prototype.destroy = function() {
	this.spritePool.destroy();
};

VulcanCannon.weaponLogic.prototype.resize = function() {
	this.spritePool.changeTexture(VulcanCannon.generateTexture());
};

VulcanCannon.weaponLogic.prototype.update = function(timeDiff) {
	if (this.spritePool.destroyed)
		return;

	for (var i = 0; i < this.spritePool.sprites.length; i++) {
		var sprite = this.spritePool.sprites[i];

		if (sprite.visible) {
			sprite.xLoc += sprite.xSpeed * timeDiff;
			sprite.yLoc -= sprite.ySpeed * timeDiff;

			sprite.position.x = sprite.xLoc * scalingFactor;
			sprite.position.y = sprite.yLoc * scalingFactor;

			if (sprite.yLoc < -8 || sprite.yLoc > canvasHeight + 8 ||
				sprite.xLoc < -8 || sprite.xLoc > canvasWidth + 8) {
					this.spritePool.discardSprite(sprite);
			} else {
				for (var j = 0; j < Enemies.activeShips.length; j++) {
					var enemyShip = Enemies.activeShips[j];
					if (sprite.lastEnemyDamaged != enemyShip.id && enemyShip.detectCollision(sprite.xLoc, sprite.yLoc)) {
						Enemies.damageEnemy(enemyShip, sprite.xLoc, sprite.yLoc, sprite.bulletStrength);
						if (this.weapon.passThrough) {
							sprite.bulletStrength = sprite.bulletStrength * 0.6;
							sprite.lastEnemyDamaged = enemyShip.id;
						} else {
							this.spritePool.discardSprite(sprite);
						}
					}
				}
			}
		}
	}
};

VulcanCannon.weaponLogic.prototype.readyToFire = function(isWeaponFiring, timeDiff, fireRateModifier) {
	if (isWeaponFiring) {
		this.weapon.lastShot += timeDiff;
		return this.weapon.lastShot > 1 / (this.weapon.shotsPerSecond * fireRateModifier);
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
		accuracy: 0.7 + Math.random() * 0.25,
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
