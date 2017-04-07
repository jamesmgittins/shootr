MissileLauncher = {

  startVelocity: 160,
  maxVelocity: 250,
  acceleration: 250,
  rearAngleMod : 2.5,
  trailFrequency : 0.02,

	generateTexture : function() {
    var blast = document.createElement('canvas');
    blast.width = 3;
    blast.height = 4;
    var blastCtx = blast.getContext('2d');

    // draw shape
    blastCtx.fillStyle = "#ffffff";
    blastCtx.fillRect(1, 0, 1, 1); // top point
    blastCtx.fillRect(0, 1, 3, 2); // middle section
    blastCtx.fillStyle = "#ffff00";
    blastCtx.fillRect(0, 3, 1, 1); // bottom left point
    blastCtx.fillRect(2, 3, 1, 1); // bottom right point
    // 		blastCtx.fillStyle = "#ff0000";
    // 		blastCtx.fillRect(1, 3, 1, 1); // bottom right point

    // return PIXI.Texture.fromCanvas(blast);

    return PIXI.Texture.fromImage("img/missile.svg", undefined, undefined, 0.1);
  },

  generateExplosion : function (xLoc, yLoc) {
    var size = Math.random();
    var explosionSize = 35 + size * 10;
    var numParts = 16;
    for (var i = 0; i < numParts; i++) {
        Ships.explosionBits.newExplosionBit(xLoc, yLoc, ["#FFFF00","#FF0000", "#FF9900", "#FFFF76"], explosionSize);
    }
  },

	updateBullets : function(timeDiff, spritePool, missileTrails) {

    for (var missileCount = 0; missileCount < spritePool.sprites.length; missileCount++) {
			var sprite = spritePool.sprites[missileCount];

			if (sprite.visible) {

				if (sprite.target && sprite.target.inPlay === 1) {
					var timeToTarget = distanceBetweenPoints(sprite.xLoc, sprite.yLoc, sprite.target.xLoc, sprite.target.yLoc) / magnitude(sprite.speed.x,sprite.speed.y);
					var predictedTargetX = sprite.target.xLoc + sprite.target.xSpeed * timeToTarget;
					var predictedTargetY = sprite.target.yLoc + sprite.target.ySpeed * timeToTarget;
					var accelX = predictedTargetX - sprite.xLoc;
					var accelY = predictedTargetY - sprite.yLoc;
					var factor = timeToTarget < 0.5 ? MissileLauncher.acceleration * 4 / magnitude(accelX, accelY) : MissileLauncher.acceleration / magnitude(accelX, accelY);
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
						for (var enemyShipCount=0; enemyShipCount < EnemyShips.activeShips.length; enemyShipCount++) {
							if (!sprite.target || sprite.target.health > EnemyShips.activeShips[enemyShipCount].health)
								sprite.target = EnemyShips.activeShips[enemyShipCount];
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

							for (var j = 0; j < EnemyShips.activeShips.length; j++) {
								if (!sprite.target && distanceBetweenPoints(location.x, location.y, EnemyShips.activeShips[j].xLoc, EnemyShips.activeShips[j].yLoc) <= shipDistance) {
									closestShip = EnemyShips.activeShips[j];
									shipDistance = distanceBetweenPoints(location.x, location.y, EnemyShips.activeShips[j].xLoc, EnemyShips.activeShips[j].yLoc);
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
        if (sprite.lastTrail > MissileLauncher.trailFrequency) {
          var posAdjust = RotateVector2d(0, 12 * scalingFactor, sprite.rotation);
          missileTrails.newPart(sprite.position.x + posAdjust.x, sprite.position.y + posAdjust.y);
          sprite.lastTrail = 0;
        }

        if (sprite.xLoc > canvasWidth || sprite.xLoc < 0 || sprite.yLoc < 0 || sprite.yLoc > canvasHeight) {
          spritePool.discardSprite(sprite);
        }

        for (var k = 0; k < EnemyShips.activeShips.length; k++) {
          if (sprite.visible && Ships.detectCollision(EnemyShips.activeShips[k], sprite.xLoc, sprite.yLoc)) {
            spritePool.discardSprite(sprite);
            EnemyShips.damageEnemyShip(EnemyShips.activeShips[k], sprite.xLoc, sprite.yLoc, sprite.damage);
            MissileLauncher.generateExplosion(sprite.xLoc, sprite.yLoc);
          }
        }
      }
    }
	},

	individualBullet: function(spritePool, speed, position, damage, scale, weapon) {

    var sprite = spritePool.nextSprite();

		Sounds.playerMissile.play();
		sprite.visible = true;
		sprite.xLoc = position.x;
		sprite.yLoc = position.y;
		sprite.lastTrail = 0;
		sprite.position.x = position.x * scalingFactor;
		sprite.position.y = position.y * scalingFactor;
		sprite.lowHealthSeek = weapon.lowHealthSeek;

		sprite.tint = weapon.ultra || weapon.hyper ? 0xffffff : 0xff9999;

		var wobble = (1 - weapon.accuracy) * 0.5;
		position.angle += -wobble + Math.random() * wobble * 2;

		sprite.rotation = position.angle;
		sprite.target = false;
		sprite.speed = RotateVector2d(0, -MissileLauncher.startVelocity, position.angle);
		sprite.damage = damage;
		// sprite.scale.y = 3 * scalingFactor;
		// sprite.scale.x = 1.5 * scalingFactor;
    sprite.scale.x = sprite.scale.y = 0.4 * scalingFactor;
	},

  create: function(weapon, container) {

		weapon.lastShot = 0;

		return {
			weapon : weapon,
      rearAngleMod : MissileLauncher.rearAngleMod,
			spritePool : SpritePool.create(MissileLauncher.generateTexture(), container),
			resize : function(){
				this.spritePool.changeTexture(MissileLauncher.generateTexture());
			},
			update : function(timeDiff) {
        this.missileTrails.update(timeDiff);
				MissileLauncher.updateBullets(timeDiff, this.spritePool, this.missileTrails);
			},
			readyToFire : function(isWeaponFiring, timeDiff) {
				if (isWeaponFiring) {
					this.weapon.lastShot += timeDiff;
					return this.weapon.lastShot > 1 / this.weapon.shotsPerSecond;
				}
			},
			fireShot : function(position, damageModifier) {
				this.weapon.lastShot = 0;
				var wobble = (1.03 - this.weapon.accuracy) * 0.15;
				var speed = RotateVector2d(0, this.weapon.bulletSpeed, -position.angle - wobble + Math.random() * wobble * 2);

				Sounds.playerMissile.play();
				MissileLauncher.individualBullet(this.spritePool, speed, position, weapon.damagePerShot * damageModifier, 1, this.weapon);
			},
      missileTrails : {
        spritePool : SpritePool.create((function() {
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
        })(), container),

        update:function(timeDiff) {
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
        },
        newPart:function(x, y) {
          var scale = 1 + Math.random() * 0.5;
          var part = this.spritePool.nextSprite();
          part.fadeSpeed= 2 * scalingFactor;
          // part.tint = tint || (Math.random() > 0.4 ? 0xffff00 : 0xff5600);
          part.visible = true;
          // part.alpha = Math.random();
          part.position = {
            x: x,
            y: y
          };
          part.scale.x = scale;
          part.scale.y = scale;
          part.xSpeed = (-40 + Math.random() * 80) * scalingFactor;
          part.ySpeed = (-40 + Math.random() * 80) * scalingFactor;
        }
      }
		};
  }
};
