MissileLauncher = {

  startVelocity: 160,
  maxVelocity: 250,
  acceleration: 250,
  rearAngleMod : 2.5,
  trailFrequency : 0.02,

	generateTexture : function() {
    return PIXI.Texture.fromImage("img/missile.svg", undefined, undefined, 0.1);
  },

  generateExplosion : function (xLoc, yLoc) {
    var size = Math.random();
    var explosionSize = 35 + size * 10;
    var numParts = 16;
    for (var i = 0; i < numParts; i++) {
        Ships.explosionBits.newExplosionBit(xLoc, yLoc, ["#FFFF00","#FF0000", "#FF9900", "#FFFF76"], explosionSize);
    }
  }

};

MissileLauncher.missileTrails = function(container) {
  this.spritePool = new SpritePool((function() {
    var size = 8 * scalingFactor;
    var blast = document.createElement('canvas');
    blast.width = size + 4;
    blast.height = size + 4;
    var blastCtx = blast.getContext('2d');
    blastCtx.shadowBlur = 5;
    blastCtx.shadowColor = "white";
    var radgrad = blastCtx.createRadialGradient(size / 2 + 2, size / 2 + 2, 0, size / 2 + 2, size / 2 + 2, size / 2);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.05)');
    radgrad.addColorStop(0.5, 'rgba(255,255,255,0.1)');
    radgrad.addColorStop(1, 'rgba(255,255,255,0)');
    blastCtx.fillStyle = radgrad;
    blastCtx.fillRect(0, 0, size + 4, size + 4);
    return PIXI.Texture.fromCanvas(blast);
  })(), container);
};

MissileLauncher.missileTrails.prototype.newPart = function(x, y) {
  var scale = 1 + Math.random() * 0.5;
  var part = this.spritePool.nextSprite();
  part.fadeSpeed= 2 * scalingFactor;
  part.visible = true;
  part.position = {
    x: x,
    y: y
  };
  part.scale.x = scale;
  part.scale.y = scale;
  part.xSpeed = (-40 + Math.random() * 80) * scalingFactor;
  part.ySpeed = (-40 + Math.random() * 80) * scalingFactor;
};

MissileLauncher.missileTrails.prototype.update = function(timeDiff) {
  if (this.spritePool.destroyed)
    return;

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
};

MissileLauncher.weaponLogic = function(weapon, container) {
  weapon.lastShot = 0;
  this.weapon = weapon;
  this.rearAngleMod = MissileLauncher.rearAngleMod;
  this.spritePool = new SpritePool(MissileLauncher.generateTexture(), container);
  this.missileTrails = new MissileLauncher.missileTrails(container);
};

MissileLauncher.weaponLogic.prototype.individualBullet = function(speed, position, damage, scale) {

  var sprite = this.spritePool.nextSprite();

  Sounds.playerMissile.play(position.x);
  sprite.visible = true;
  sprite.xLoc = position.x;
  sprite.yLoc = position.y;
  sprite.lastTrail = 0;
  sprite.position.x = position.x * scalingFactor;
  sprite.position.y = position.y * scalingFactor;
  sprite.lowHealthSeek = this.weapon.lowHealthSeek;

  sprite.tint = this.weapon.ultra || this.weapon.hyper ? 0xffffff : 0xff9999;

  var wobble = (1 - this.weapon.accuracy) * 0.5;
  position.angle += -wobble + Math.random() * wobble * 2;

  sprite.rotation = position.angle;
  sprite.target = false;
  sprite.speed = RotateVector2d(0, -MissileLauncher.startVelocity, position.angle);
  sprite.damage = damage;
  sprite.scale.x = sprite.scale.y = 0.4 * scalingFactor;
};

MissileLauncher.weaponLogic.prototype.fireShot = function(position, damageModifier) {
  this.weapon.lastShot = 0;
  var wobble = (1.03 - this.weapon.accuracy) * 0.15;

  if (position.rear)
    position.angle = position.angle * this.rearAngleMod;

  var speed = RotateVector2d(0, this.weapon.bulletSpeed, -position.angle - wobble + Math.random() * wobble * 2);

  this.individualBullet(speed, position, this.weapon.damagePerShot * damageModifier, 1);
};

MissileLauncher.weaponLogic.prototype.update = function(timeDiff) {
  this.missileTrails.update(timeDiff);

  if (this.spritePool.destroyed)
		return;

  for (var missileCount = 0; missileCount < this.spritePool.sprites.length; missileCount++) {
		var sprite = this.spritePool.sprites[missileCount];

		if (sprite.visible) {

			if (sprite.target && sprite.target.inPlay === 1) {
				var timeToTarget = 0.9 * distanceBetweenPoints(sprite.xLoc, sprite.yLoc, sprite.target.xLoc, sprite.target.yLoc) / magnitude(sprite.speed.x,sprite.speed.y);
				var predictedTargetX = sprite.target.xLoc + sprite.target.xSpeed * timeToTarget;
				var predictedTargetY = sprite.target.yLoc + sprite.target.ySpeed * timeToTarget;
				var accelX = predictedTargetX - sprite.xLoc;
				var accelY = predictedTargetY - sprite.yLoc;
				var factor = timeToTarget < 1 ? MissileLauncher.acceleration * 2.5 / magnitude(accelX, accelY) : timeToTarget < 0.5 ? MissileLauncher.acceleration * 5 / magnitude(accelX, accelY) : MissileLauncher.acceleration / magnitude(accelX, accelY);
				sprite.speed.x += accelX * factor * timeDiff;
				sprite.speed.y += accelY * factor * timeDiff;

				if (!sprite.lowHealthSeek) {
					var angleFromTarget = AngleVector2d(sprite.speed.x, sprite.speed.y, predictedTargetX - sprite.xLoc, predictedTargetY - sprite.yLoc);
					if (angleFromTarget > 1)
						sprite.target = false;
				}
			} else {
				sprite.speed.y -= MissileLauncher.acceleration * timeDiff;

				// look for target
				if (sprite.lowHealthSeek) {
					for (var enemyShipCount=0; enemyShipCount < Enemies.activeShips.length; enemyShipCount++) {
						if (!sprite.target || sprite.target.health > Enemies.activeShips[enemyShipCount].health)
							sprite.target = Enemies.activeShips[enemyShipCount];
					}
				} else {
					var vector = RotateVector2d(0, -5, Math.atan2(sprite.speed.x, -sprite.speed.y));
					var location = {
						x: sprite.xLoc,
						y: sprite.yLoc
					};
					sprite.target = false;
					var closestShip = false;
					var shipDistance = 100;
					for (var i = 0; i < 128; i++) {
						location.x += vector.x;
						location.y += vector.y;
						if (location.x < -20 || location.x > canvasWidth + 20 || location.y < -20 || location.y > canvasHeight + 20)
							i = 128;

						for (var j = 0; j < Enemies.activeShips.length; j++) {
							if (!sprite.target && distanceBetweenPoints(location.x, location.y, Enemies.activeShips[j].xLoc, Enemies.activeShips[j].yLoc) <= shipDistance) {
								closestShip = Enemies.activeShips[j];
								shipDistance = distanceBetweenPoints(location.x, location.y, Enemies.activeShips[j].xLoc, Enemies.activeShips[j].yLoc);
							}
						}
						sprite.target = closestShip;
					}
				}
			}
      if (magnitude(sprite.speed.x, sprite.speed.y) > MissileLauncher.maxVelocity) {
        var speedFactor = MissileLauncher.maxVelocity / magnitude(sprite.speed.x, sprite.speed.y);
        sprite.speed.x *= speedFactor;
        sprite.speed.y *= speedFactor;
      }

      sprite.xLoc += sprite.speed.x * timeDiff;
      sprite.yLoc += sprite.speed.y * timeDiff;
      sprite.rotation = Math.atan2(sprite.speed.x, -sprite.speed.y);
      sprite.position.x = sprite.xLoc * scalingFactor;
      sprite.position.y = sprite.yLoc * scalingFactor;

      sprite.lastTrail += timeDiff;
      if (sprite.lastTrail > MissileLauncher.trailFrequency / gameModel.detailLevel) {
        var posAdjust = RotateVector2d(0, 12 * scalingFactor, sprite.rotation);
        this.missileTrails.newPart(sprite.position.x + posAdjust.x, sprite.position.y + posAdjust.y);
        sprite.lastTrail = 0;
      }

      if (sprite.xLoc > canvasWidth || sprite.xLoc < 0 || sprite.yLoc < 0 || sprite.yLoc > canvasHeight) {
        this.spritePool.discardSprite(sprite);
      }

      for (var k = 0; k < Enemies.activeShips.length; k++) {
        if (sprite.visible && Enemies.activeShips[k].detectCollision(sprite.xLoc, sprite.yLoc)) {
          this.spritePool.discardSprite(sprite);
          Enemies.damageEnemy(Enemies.activeShips[k], sprite.xLoc, sprite.yLoc, sprite.damage);
          MissileLauncher.generateExplosion(sprite.xLoc, sprite.yLoc);
        }
      }
    }
  }
};

MissileLauncher.weaponLogic.prototype.readyToFire = function(isWeaponFiring, timeDiff, fireRateModifier) {
  if (isWeaponFiring) {
    this.weapon.lastShot += timeDiff;
    return this.weapon.lastShot > 1 / (this.weapon.shotsPerSecond * fireRateModifier);
  }
};

MissileLauncher.weaponLogic.prototype.destroy = function() {
  this.missileTrails.spritePool.destroy();
  this.spritePool.destroy();
};

MissileLauncher.weaponLogic.prototype.resize = function() {
  this.spritePool.changeTexture(MissileLauncher.generateTexture());
};
