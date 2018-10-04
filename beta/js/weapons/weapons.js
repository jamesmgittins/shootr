Weapons = {
  types : {
    plasmaCannon:0,
  	railGun:1,
	  missileLauncher:2,
    vulcanCannon:3,
    bioGelGun: 4,
    sonicWave: 5
  },
  rarity : [
    {
      normal:true,
      factor:1,
      chance:1,
      prefix: "",
      index : 0
    },
    {
      super:true,
      factor:1.5,
      chance:0.3,
      prefix : "Super ",
      index : 1
    },
    {
      ultra:true,
      factor:1.8,
      chance:0.04,
      prefix : "Ultra ",
      index : 2
    },
    {
      hyper:true,
      factor:2.2,
      chance:0.01,
      prefix : "Hyper ",
      index : 3
    }
  ]
};


Weapons.missileLauncher = function(level, seed, rarity) {

	var levelMod = Math.pow(Constants.weaponLevelScaling, level - 1);
	Math.seedrandom(seed);
	var dps = (level * 9 + (Math.random() * level * 2)) * levelMod * rarity.factor;
	var shotsPerSecond = 1 + Math.random();
	var damagePerShot = dps / shotsPerSecond;
	var missileLauncher = {
    normal:rarity.normal,
    super:rarity.super,
		ultra:rarity.ultra,
    hyper:rarity.hyper,
		type: Constants.itemTypes.weapon,
		name: rarity.prefix + "Missile Launcher",
		seed: seed,
		level: level,
		dps: dps,
		shotsPerSecond: shotsPerSecond,
		damagePerShot: damagePerShot,
		accuracy: 0.5 + Math.random() * 0.5,
		price: Math.round(dps * 30),
		id: gameModel.weaponIdCounter++,
		weaponType : Weapons.types.missileLauncher
	};

	if (rarity.ultra || rarity.hyper) {

    if (Math.random() > 0.5) {
      missileLauncher.lowHealthSeek = true;
      missileLauncher.ultraText = "Missiles automatically lock on to the most damaged enemy ship";
      missileLauncher.ultraName = "Widowmaker";
    } else {
      missileLauncher.highHealthSeek = true;
		  missileLauncher.ultraText = "Missiles automatically lock on to the most powerful enemy ship";
		  missileLauncher.ultraName = "Goliath Buster";
    }
		
	}

	return missileLauncher;
};

Weapons.getIconSvg =  function(item) {
  if (item.weaponType == Weapons.types.plasmaCannon) {
    if (item.alternateTexture == "hotdog")
      return "img/hot-dog-icon.svg";
    if (item.bullets == 3)
      return "img/level-three.svg";
    if (item.bullets == 2)
      return "img/level-two.svg";
    return "img/level-one.svg";
  }
  if (item.weaponType == Weapons.types.railGun)
    return "img/target-laser.svg";
  if (item.weaponType == Weapons.types.missileLauncher)
    return "img/barbed-arrow.svg";
  if (item.weaponType == Weapons.types.vulcanCannon)
      return "img/blaster.svg";
  if (item.weaponType == Weapons.types.bioGelGun)
      return "img/biohazard.svg";
  if (item.weaponType == Weapons.types.sonicWave)
      return "img/wifi.svg";
};

Weapons.generateWeapon = function(level, seed, rarity) {

  if (!gameModel.dropsSinceLastGoodOne) gameModel.dropsSinceLastGoodOne = 0;

  var weaponRarity = Weapons.rarity[0];

  if (!rarity) {
    gameModel.dropsSinceLastGoodOne++;

    var randomNumber = Math.random() * Talents.rarityModifier() * Math.pow(0.95, gameModel.dropsSinceLastGoodOne);

    for (var i=0; i<Weapons.rarity.length; i++) {
      if (randomNumber < Weapons.rarity[i].chance) {
        weaponRarity = Weapons.rarity[i];
        if (i > 2) gameModel.dropsSinceLastGoodOne = 0;
      }
    }
    // console.log("generating random weapn, random number = " + randomNumber + " rarity = " + weaponRarity.prefix);
  }
  weaponRarity = rarity || weaponRarity;

  var weaponGenFunctions = [
    RailGun.laserCannon,
    Weapons.missileLauncher,
    VulcanCannon.vulcanCannon,
    BioGelGun.bioGelGun,
    PlasmaCannon.plasmaCannon,
    SonicWave.sonicWave
  ];

  return weaponGenFunctions[Math.floor(Math.random() * weaponGenFunctions.length)](level,seed,weaponRarity);
};

// used to test drop rates are behaving
function testWeaponGeneration(number) {
	var normal = 0;
	var superRare = 0;
	var ultra = 0;
	var hyper = 0;
	var seed = Date.now();
	for (var i = 0; i < number; i++) {
		var weapon = Weapons.generateWeapon(10, seed++);
		if (weapon.hyper) {
			hyper++;
		} else if (weapon.ultra) {
			ultra++;
		} else if (weapon.super) {
			superRare++;
		} else {
			normal++;
		}
	}
	console.log(number + " weapons generated, normal: " + normal +", super: " + superRare + ", ultra: " +ultra + ", hyper: " + hyper);
}



Weapons.createWeaponLogic = function(weapon, container) {
  if (weapon.weaponType == Weapons.types.plasmaCannon)
    return new PlasmaCannon.weaponLogic(weapon, container);

  if (weapon.weaponType == Weapons.types.vulcanCannon)
    return new VulcanCannon.weaponLogic(weapon, container);

  if (weapon.weaponType == Weapons.types.railGun)
    return new RailGun.weaponLogic(weapon, container);

  if (weapon.weaponType == Weapons.types.missileLauncher)
    return new MissileLauncher.weaponLogic(weapon, container);

  if (weapon.weaponType == Weapons.types.bioGelGun)
    return new BioGelGun.weaponLogic(weapon, container);

  if (weapon.weaponType == Weapons.types.sonicWave)
    return new SonicWave.weaponLogic(weapon, container);
};

Weapons.attackDrone = {
  drone : true,
  xLoc : 0,
  yLoc : 0,
  xSpeed : 0,
  ySpeed : 0,
  rotation: 0,
  acceleration : 150,
  maxSpeed : 70,
  lastTrail : 0,
};

Weapons.weaponLogic = {};


Weapons.update = function(timeDiff) {

  var shouldPlayerShoot = PlayerShip.playerShip.inPlay && PlayerShip.playerShip.rolling > 1 && (timeLeft > 0 || Boss.bossActive() || Enemies.waves.length > 0);
  var shouldDroneShoot = PlayerShip.playerShip.inPlay && (timeLeft > 0 || Boss.bossActive() || Enemies.waves.length > 0);
  var fireRateModifier = Talents.fireRateModifier();

  if (Talents.attackDrone()) {
    if (!Weapons.attackDrone.sprite) {
      Weapons.attackDrone.sprite = new PIXI.Sprite(glowTexture(PIXI.Texture.fromCanvas(Ships.shipArt(PlayerShip.SHIP_SIZE / 3, gameModel.p1.ship.seed + 1, Ships.enemyColors[gameModel.p1.ship.colorIndex]))));
      // Weapons.attackDrone.sprite.scale = {x:0.4, y:0.4};
      Weapons.attackDrone.sprite.anchor = {x:0.5, y: 0.5};
      Weapons.attackDrone.sprite.tint = 0xEEEEEE;
      Weapons.attackDrone.colors = PlayerShip.playerShip.colors;
      Weapons.attackDroneContainer.addChild(Weapons.attackDrone.sprite);
    }
    var distanceFromPlayer = distanceBetweenPoints(Weapons.attackDrone.xLoc, Weapons.attackDrone.yLoc, PlayerShip.playerShip.xLoc, PlayerShip.playerShip.yLoc);
    if (distanceFromPlayer > 75)  {
      var accelX = PlayerShip.playerShip.xLoc - Weapons.attackDrone.xLoc;
      var accelY = PlayerShip.playerShip.yLoc - Weapons.attackDrone.yLoc;
      var factor = Weapons.attackDrone.acceleration / magnitude(accelX, accelY);

      Weapons.attackDrone.xSpeed += accelX * factor * timeDiff;
      Weapons.attackDrone.ySpeed += accelY * factor * timeDiff;

      if (magnitude(Weapons.attackDrone.xSpeed, Weapons.attackDrone.ySpeed) > 100) {
        var speedFactor = 100 / magnitude(Weapons.attackDrone.xSpeed, Weapons.attackDrone.ySpeed);
        Weapons.attackDrone.xSpeed *= speedFactor;
        Weapons.attackDrone.ySpeed *= speedFactor;
      }

      Weapons.attackDrone.xLoc += Weapons.attackDrone.xSpeed * timeDiff;
      Weapons.attackDrone.yLoc += Weapons.attackDrone.ySpeed * timeDiff;
      Weapons.attackDrone.sprite.tint = 0xDDDDDD;
    } else {
      Weapons.attackDrone.xSpeed *= 0.95;
      Weapons.attackDrone.ySpeed *= 0.95;
      Weapons.attackDrone.xLoc += Weapons.attackDrone.xSpeed * timeDiff;
      Weapons.attackDrone.yLoc += Weapons.attackDrone.ySpeed * timeDiff;
      Weapons.attackDrone.sprite.tint = rgbToHex(221 - (75 - distanceFromPlayer),221 - (75 - distanceFromPlayer),221 - (75 - distanceFromPlayer));
    }

    Ships.updateRotation(Weapons.attackDrone, timeDiff);
    Weapons.attackDrone.trailX = Weapons.attackDrone.xLoc;
    Weapons.attackDrone.trailY = Weapons.attackDrone.yLoc;
    Weapons.attackDrone.sprite.rotation = Weapons.attackDrone.rotation;
    Weapons.attackDrone.sprite.position = {x : Weapons.attackDrone.xLoc * scalingFactor, y : Weapons.attackDrone.yLoc * scalingFactor};
    Weapons.attackDrone.lastTrail += timeDiff;
    if (Weapons.attackDrone.lastTrail > 0.08) {
      Weapons.attackDrone.lastTrail = 0;
      Stars.shipTrails.newPart(Weapons.attackDrone);
    }


  }

  if (gameModel.p1.frontWeapon && !Weapons.weaponLogic.frontWeapon)
    Weapons.weaponLogic.frontWeapon = Weapons.createWeaponLogic(gameModel.p1.frontWeapon, playerBulletContainer);

  if (gameModel.p1.turretWeapon && !Weapons.weaponLogic.turretWeapon)
    Weapons.weaponLogic.turretWeapon = Weapons.createWeaponLogic(gameModel.p1.turretWeapon, playerBulletContainer);

  if (gameModel.p1.rearWeapon && !Weapons.weaponLogic.rearWeapon)
    Weapons.weaponLogic.rearWeapon = Weapons.createWeaponLogic(gameModel.p1.rearWeapon, playerBulletContainer);


  if (Weapons.weaponLogic.frontWeapon) {
    Weapons.weaponLogic.frontWeapon.update(timeDiff);
    if (Weapons.weaponLogic.frontWeapon.readyToFire(shouldDroneShoot, timeDiff, fireRateModifier)) {
      if (Weapons.weaponLogic.frontWeapon.readyToFire(shouldPlayerShoot, timeDiff, fireRateModifier)) {
        Weapons.weaponLogic.frontWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc - 8, angle:0}, 1);
      }
      if (Talents.attackDrone()) {
        Weapons.weaponLogic.frontWeapon.fireShot({x: Weapons.attackDrone.xLoc, y: Weapons.attackDrone.yLoc - 2, angle:0}, 0.5);
      }
    }
  }

  if (Weapons.weaponLogic.turretWeapon) {
    Weapons.weaponLogic.turretWeapon.update(timeDiff);
    if (Weapons.weaponLogic.turretWeapon.readyToFire(shouldPlayerShoot, timeDiff, fireRateModifier)) {
      Weapons.weaponLogic.turretWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc, angle:Bullets.getTurretAngle()}, 1);

      if (Buffs.isBuffActive(Buffs.buffNames.spreadShot)) {
        Weapons.weaponLogic.turretWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc, angle:Bullets.getTurretAngle() - 0.12}, 1);
        Weapons.weaponLogic.turretWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc, angle:Bullets.getTurretAngle() + 0.12}, 1);
      } else if (Buffs.isBuffActive(Buffs.buffNames.crossShot)) {
        Weapons.weaponLogic.turretWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc, angle:Bullets.getTurretAngle() + Math.PI}, 1);
        Weapons.weaponLogic.turretWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc, angle:Bullets.getTurretAngle() + Math.PI / 2}, 1);
        Weapons.weaponLogic.turretWeapon.fireShot({x: PlayerShip.playerShip.xLoc, y: PlayerShip.playerShip.yLoc, angle:Bullets.getTurretAngle() - Math.PI / 2}, 1);
      }
    }

  }

  if (Weapons.weaponLogic.rearWeapon) {
    Weapons.weaponLogic.rearWeapon.update(timeDiff);
    if (Weapons.weaponLogic.rearWeapon.readyToFire(shouldPlayerShoot, timeDiff, fireRateModifier)) {
      Weapons.weaponLogic.rearWeapon.fireShot({x: PlayerShip.playerShip.xLoc + 16, y: PlayerShip.playerShip.yLoc + 16, angle: (Math.PI / 8), rear:true}, 0.5);
      Weapons.weaponLogic.rearWeapon.fireShot({x: PlayerShip.playerShip.xLoc - 16, y: PlayerShip.playerShip.yLoc + 16, angle:(-Math.PI / 8), rear:true}, 0.5);
    }
  }

  EMP.update(timeDiff);
};

Weapons.reset = function() {

  PlayerShip.playerShip.spreadShot = 0;
  PlayerShip.playerShip.crossShot = 0;

  if (Weapons.attackDrone.sprite) {
    Weapons.attackDrone.sprite.destroy();
    Weapons.attackDrone.sprite = false;
  }

  Bullets.enemyBullets.destroy();
  EMP.destroy();

  if (Weapons.weaponLogic.frontWeapon) {
    Weapons.weaponLogic.frontWeapon.destroy();
  }
  if (Weapons.weaponLogic.turretWeapon){
    Weapons.weaponLogic.turretWeapon.destroy();
  }
  if (Weapons.weaponLogic.rearWeapon) {
    Weapons.weaponLogic.rearWeapon.destroy();
  }
  Weapons.weaponLogic = {};

  if (playerBulletContainer)
    playerBulletContainer.removeChildren(0);
};
