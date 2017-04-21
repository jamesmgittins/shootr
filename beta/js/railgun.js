RailGun = {

	generateTexture : function() {
    return Stars.stars.texture;
  },

	updateBullets : function(timeDiff, spritePool) {
    for (var i = 0; i < spritePool.sprites.length; i++) {
      var sprite = spritePool.sprites[i];
      if (sprite.visible) {
        sprite.position.x += sprite.speed.x * timeDiff * scalingFactor;
        sprite.position.y += sprite.speed.y * timeDiff * scalingFactor;
        sprite.scale.x = Math.max(sprite.scale.x - 16 * scalingFactor * timeDiff, 0);
        sprite.alpha -= 0.5 * timeDiff;
        if (sprite.scale.x <= 0) {
          spritePool.discardSprite(sprite);
        }
      }
    }
	},

  create: function(weapon, container) {

		weapon.lastShot = 0;

		return {
			weapon : weapon,
			spritePool : SpritePool.create(RailGun.generateTexture(), container),
			resize : function(){
				this.spritePool.changeTexture(RailGun.generateTexture());
			},
			update : function(timeDiff) {
				this.beamTrails.update(timeDiff);
				RailGun.updateBullets(timeDiff, this.spritePool);
			},
			readyToFire : function(isWeaponFiring, timeDiff) {
				if (isWeaponFiring) {
					this.weapon.lastShot += timeDiff;
					return this.weapon.lastShot > 1 / this.weapon.shotsPerSecond;
				}
			},
			fireShot : function(position, damageModifier) {
				this.weapon.lastShot = 0;
        Sounds.playerLaser.play(position.x);
        var sprite = this.spritePool.nextSprite();
        sprite.anchor = {
          x: 0.5,
          y: 1
        };
        sprite.tint = 0x6030E0;
        sprite.scale.y = 640 * scalingFactor;
        sprite.xLoc = position.x;
        sprite.yLoc = position.y;
        sprite.position.x = position.x * scalingFactor;
        sprite.position.y = position.y * scalingFactor;
        sprite.visible = true;
        sprite.alpha = 1;
        sprite.speed = RotateVector2d(0, -200, position.angle);
        sprite.scale.x = 7 * scalingFactor;
        var wobble = (1 - this.weapon.accuracy) * 0.03;
        sprite.rotation = position.angle - wobble + (Math.random() * wobble * 2);

        // perform hitscan
        var vector = RotateVector2d(0, -3, position.angle);
        var location = {
          x: position.x,
          y: position.y
        };
         var damage = this.weapon.damagePerShot * damageModifier;

        for (var i = 0; i < 256; i++) {
          location.x += vector.x;
          location.y += vector.y;
          if (location.x < 0 || location.x > canvasWidth || location.y < 0 || location.y > canvasHeight)
            i = 256;

          if (Math.random() > 0.9)
            this.beamTrails.newPart(location.x * scalingFactor, location.y * scalingFactor);

          for (var j = 0; j < Enemies.activeShips.length; j ++) {
            if (!Enemies.activeShips[j].damagedByRailgun &&
								distanceBetweenPoints(location.x, location.y, Enemies.activeShips[j].xLoc, Enemies.activeShips[j].yLoc) <= 100 &&
								Enemies.activeShips[j].detectCollision(Enemies.activeShips[j], location.x, location.y)) {

              Enemies.damageEnemy(Enemies.activeShips[j], location.x, location.y, damage);
              Enemies.activeShips[j].damagedByRailgun = true;

							if (!Enemies.activeShips[j].inPlay && this.weapon.splitBeamOnKill) {
								this.fireShot({x:location.x, y:location.y, angle:Math.random() * 2 * Math.PI}, 0.5);
							}
              damage *= 0.5;
            }
          }
        }
        for (var k = 0; k < Enemies.activeShips.length; k ++) {
          Enemies.activeShips[k].damagedByRailgun = false;
        }
			},
			beamTrails : {
				// spritePool : SpritePool.create(Stars.stars.texture, container),
				spritePool : SpritePool.create(Stars.stars.texture, container),
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
					var scale = 1 + Math.random() * 2;
					var part = this.spritePool.nextSprite();
					part.tint = 0x6060A0;
					part.fadeSpeed= 1 * scalingFactor;
					// part.tint = tint || (Math.random() > 0.4 ? 0xffff00 : 0xff5600);
					part.visible = true;
					// part.alpha = Math.random();
					part.position = {
						x: x,
						y: y
					};
					part.scale.x = scale * scalingFactor;
					part.scale.y = scale * scalingFactor;
					part.xSpeed = (-40 + Math.random() * 80) * scalingFactor;
					part.ySpeed = (-40 + Math.random() * 80) * scalingFactor;
				}
			}
		};
  }
};
