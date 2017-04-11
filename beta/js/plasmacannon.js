PlasmaCannon = {

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
					for (var j = 0; j < Enemies.activeShips.length; j++) {
						var enemyShip = Enemies.activeShips[j];
						if (enemyShip.detectCollision(enemyShip, sprite.xLoc, sprite.yLoc)) {
							Enemies.damageEnemy(enemyShip, sprite.xLoc, sprite.yLoc, sprite.bulletStrength);
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
		sprite.tint = rgbToHex(255, 220 + Math.random() * 35, 75);
		sprite.xLoc = position.x + (speed.x * 0.02);
		sprite.yLoc = position.y - (speed.y * 0.02);
		sprite.xSpeed = speed.x;
		sprite.ySpeed = speed.y;

		sprite.ricochet = weapon.ricochet;

		sprite.visible = true;
		sprite.scale.x = sprite.scale.y = scale;
		sprite.position.x = sprite.xLoc * scalingFactor;
		sprite.position.y = sprite.yLoc * scalingFactor;
	},

  create: function(weapon, container) {

		weapon.lastShot = 0;

		return {
			weapon : weapon,
			spritePool : SpritePool.create(PlasmaCannon.generateTexture(), container),
			resize : function(){
				this.spritePool.changeTexture(PlasmaCannon.generateTexture());
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
			fireShot : function(position, damageModifier) {
				this.weapon.lastShot = 0;
				var wobble = (1 - this.weapon.accuracy) * 0.2;
				var speed = RotateVector2d(0, this.weapon.bulletSpeed, -position.angle - wobble + Math.random() * wobble * 2);

				Sounds.playerBullets.play();

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
