Shipyard = {
  menuTitle:"Shipyard",
  backButton:{title:"Back",index:-1,click:function(){
    Shipyard.hide();
    StationMenu.show();
  }},
  currentSelection:-1,
  bButton : function(){
    Shipyard.backButton.click();
  },
  ships:[],
  showCurrentCredits:true
};

Shipyard.comparison = function(ship) {
  return {
    upgrade : ship.level > gameModel.p1.ship.level,
    equipped : false
  };
};

Shipyard.generateBlueprint = function(level, seed, rarity) {
  if (!gameModel.dropsSinceLastGoodOne) gameModel.dropsSinceLastGoodOne = 0;

  var weaponRarity = Weapons.rarity[1];

  if (!rarity) {
    gameModel.dropsSinceLastGoodOne++;

    var randomNumber = Math.random() * Talents.rarityModifier() * Math.pow(0.95, gameModel.dropsSinceLastGoodOne);

    for (var i=1; i<Weapons.rarity.length; i++) {
      if (randomNumber < Weapons.rarity[i].chance) {
        weaponRarity = Weapons.rarity[i];
        if (i > 1) gameModel.dropsSinceLastGoodOne = 0;
      }
    }
  }

  weaponRarity = rarity || weaponRarity;

  return Shipyard.generateShip(level, seed, weaponRarity);
};

Shipyard.generateShip = function(level, seed, rarity) {
  var shipRarity = rarity || Weapons.rarity[0];

  Math.seedrandom(seed);

  var critChance = 0.05;
  var critDamage = 1.5;
  if (!shipRarity.normal) {
    critChance = 0.05 + Math.random() * 0.1 + shipRarity.index * 0.05;
    critDamage = 1.5 + Math.random() * 0.5 + shipRarity.index * 0.15;
  }
  var talent = false;
  if (shipRarity.hyper) {
    var talentTree = Talents.talentTrees[Math.floor(Math.random() * Talents.talentTrees.length)];
    talent = talentTree.talents[Math.floor(Math.random() * talentTree.talents.length)].name;
  }


  var levelMod = Math.pow(Constants.shipLevelPriceScaling, level - 1);
	var prefix = Shipyard.prefixes[Math.floor(Math.random() * Shipyard.prefixes.length)];
  var ship = {
    type:"ship",
    seed:seed,
    level:level,
    critChance : critChance,
    critDamage : critDamage,
    talent : talent,
    normal:shipRarity.normal,
    super:shipRarity.super,
    ultra:shipRarity.ultra,
    hyper:shipRarity.hyper,
    rarity : shipRarity.index,
    frontWeaponLevel:   level,
    turretWeaponLevel:  level,
    rearWeaponLevel:    level,
    shieldLevel:        level,
    sortOrder: shipRarity.factor,
    speed : Math.min(0.99 + Math.min(0.5, level / 150)) + (shipRarity.factor / 100),
    range : 13 + (level / 5) + (Math.random() * 0.1 * level) + shipRarity.factor,
		colorIndex : prefix.index,
    name:shipRarity.prefix + prefix.name + " " + Shipyard.suffixes[Math.floor(Math.random() * Shipyard.suffixes.length)],
    dualEngines : Math.random() > 0.7
  };

  var priceMultiplier = (ship.range / 15) * ship.speed;

  ship.price = Math.round(level * levelMod * (1000 + 200 * priceMultiplier) * shipRarity.factor);
  return ship;
};

Shipyard.hide = function() {
  Shipyard.menuContainer.visible = false;
  for (i = Shipyard.menuContainer.children.length - 1; i >= 0; i--){
    var item = Shipyard.menuContainer.children[i];
    item.destroy(true);
  }
  Shipyard.blueprintContainer.destroy(true);
  Shipyard.ship = false;
  Shipyard.buyButton = false;
  Shipyard.currentSelection=-1;
};

Shipyard.show = function() {
  Shipyard.initialize();
  Shipyard.menuContainer.visible = true;
};

Shipyard.levelReqText = function(value, currentShipValue) {
  return value + (value - currentShipValue !== 0 ? "   ( " + (value - currentShipValue > 0 ? "+" : "") + (value - currentShipValue) + " )" : "");
};

Shipyard.createBluePrintList = function() {

  if (Shipyard.blueprintContainer) {
    Shipyard.blueprintContainer.destroy(true);
  }

  var star = StarChart.generateStar(gameModel.currentSystem.x, gameModel.currentSystem.y);

  var level = calculateAdjustedStarLevel(star.level);
  var shipBlueprints = [];
  Shipyard.ships = [];
  if (gameModel.p1.shipBlueprints)
    gameModel.p1.shipBlueprints.forEach(function(blueprint){
      shipBlueprints.push(Shipyard.generateShip(blueprint.level, blueprint.seed, Weapons.rarity[blueprint.rarity]));
    });

  var startLevel = Math.max(1, gameModel.currentLevel - 2);
  for (i = startLevel; i <= gameModel.currentLevel + 2; i++) {
      shipBlueprints.push(Shipyard.generateShip(i, star.seed + i));
  }

  if (gameModel.shipBlueprintPosition && gameModel.shipBlueprintPosition.x == star.x && gameModel.shipBlueprintPosition.y == star.y) {
      shipBlueprints.push(Shipyard.generateShip(Boss.currentLevel(), star.seed + 37, Weapons.rarity[3]));
  }

  shipBlueprints.forEach(function(shipBlueprint){
    var alreadyInList = false;
    Shipyard.ships.forEach(function(blueprintInList){
      if (blueprintInList.level == shipBlueprint.level && blueprintInList.seed == shipBlueprint.seed && blueprintInList.rarity == shipBlueprint.rarity)
        alreadyInList = true;
    });
    if (!alreadyInList)
      Shipyard.ships.push(shipBlueprint);
  });



  Shipyard.ships.sort(function(ship1, ship2){
    if (ship1.level < ship2.level)
      return -1;
    if (ship1.level > ship2.level)
      return 1;
    if (ship1.sortOrder < ship2.sortOrder)
      return -1;
    if (ship1.sortOrder > ship2.sortOrder)
      return 1;
  });

  var blueprintWidth = renderer.width * 0.3;
  var blueprintHeight = 48 * scalingFactor;

  Shipyard.blueprintTexture = PIXI.RenderTexture.create(blueprintWidth, renderer.height * 0.7);
  Shipyard.blueprintSprite = new PIXI.Sprite(Shipyard.blueprintTexture);
  Shipyard.blueprintSprite.position = {x:renderer.width * 0.05, y: renderer.height * 0.15};
  Shipyard.blueprintContainer = new PIXI.Container();
  Shipyard.blueprintContainers = [];
  var yPos = 2 * gameModel.resolutionFactor;

  for (i = Shipyard.ships.length -1; i >= 0; i--) {

    var backgroundCol = Shipyard.ships[i].hyper ? Constants.itemColors.hyper : Shipyard.ships[i].ultra ? Constants.itemColors.ultra : Shipyard.ships[i].super ? Constants.itemColors.super :Constants.itemColors.normal;
    var borderCol = Shipyard.ships[i].hyper ? Constants.itemBorders.hyper : Shipyard.ships[i].ultra ? Constants.itemBorders.ultra : Shipyard.ships[i].super ? Constants.itemBorders.super :Constants.itemBorders.normal;

    var container = new PIXI.Container();
    container.ship = Shipyard.ships[i];

    container.blueprintBackground = new PIXI.Graphics();
    container.blueprintBackground.beginFill(backgroundCol);
    container.blueprintBackground.lineStyle(3 * gameModel.resolutionFactor, borderCol);
    container.blueprintBackground.drawRect(0, 0, blueprintWidth - 5 * gameModel.resolutionFactor, blueprintHeight);

    container.addChild(container.blueprintBackground);

    container.shipName = getText(Shipyard.ships[i].name, 18 * scalingFactor, {
      fill: '#FFF',
      stroke: "#000",
      strokeThickness: 3
    });
    container.shipName.anchor = {x:0.5, y:0};
    container.shipName.position.x = container.blueprintBackground.width / 2;
    container.addChild(container.shipName);

    var levelText = getText("Level " + Shipyard.ships[i].level + " " + (Shipyard.ships[i].level > gameModel.p1.ship.level ? arrow.up : ""), 16 * scalingFactor, {
      fill: '#FFF',
      stroke: "#000",
      strokeThickness: 3
    });

    levelText.position = {x: 3 * scalingFactor, y: 25 * scalingFactor};

    container.addChild(levelText);

    container.priceText = getText(formatMoney(Shipyard.ships[i].price * getBuyPriceModifier()) + " Credits", 16 * scalingFactor, {
      fill: '#FFF',
      stroke: "#000",
      strokeThickness: 3
    });
    container.priceText.anchor = {x:1, y: 0};
    container.priceText.position = {x:container.blueprintBackground.width - 4 * scalingFactor, y:25 * scalingFactor};

    container.addChild(container.priceText);

    if (gameModel.p1.ownedShips) {
      gameModel.p1.ownedShips.forEach(function(ownedShip){
        if (container.ship.seed == ownedShip.seed && container.ship.level == ownedShip.level && container.ship.rarity == ownedShip.rarity) {
          container.priceText.text = "Owned";
          container.priceText.tint = 0xFFFF00;
        }
      });
    }

    if (container.ship.seed == gameModel.p1.ship.seed && container.ship.level == gameModel.p1.ship.level && container.ship.rarity == gameModel.p1.ship.rarity) {
      container.priceText.text = "Current Ship";
      container.priceText.tint = 0xFFFF00;
    }

    container.position.x = 3 * gameModel.resolutionFactor;
    container.position.y = yPos;
    yPos += blueprintHeight + scalingFactor + 6 * gameModel.resolutionFactor;

    container.children.forEach(function(child) {
      child.tint = 0xAAAAAA;
    });

    Shipyard.blueprintContainer.addChild(container);
    Shipyard.blueprintContainers.push(container);
  }
  renderer.render(Shipyard.blueprintContainer, Shipyard.blueprintTexture);
  Shipyard.menuContainer.addChild(Shipyard.blueprintSprite);
};

Shipyard.initialize = function () {
  var i;
  if (!Shipyard.menuContainer) {
    Shipyard.menuContainer = new PIXI.Container();
    gameContainer.addChild(Shipyard.menuContainer);
  } else {
    for (i = Shipyard.menuContainer.children.length - 1; i >= 0; i--){
      var item = Shipyard.menuContainer.children[i];
      item.destroy(true);
    }
  }
  var fontSize = Math.round(MainMenu.fontSize * scalingFactor);

  Shipyard.menuContainer.visible = false;

  Shipyard.menuBackground = new PIXI.Graphics();
  Shipyard.menuBackground.beginFill(MainMenu.backgroundColor);
  Shipyard.menuBackground.drawRect(0, renderer.height * 0.05, renderer.width, renderer.height * 0.9);
  Shipyard.menuBackground.alpha = MainMenu.backgroundAlpha;

  Shipyard.menuContainer.addChild(Shipyard.menuBackground);

  Shipyard.titleText = getText(Shipyard.menuTitle, fontSize, { align: 'center' });
  Shipyard.titleText.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.05 + 25};
  Shipyard.titleText.tint = MainMenu.titleTint;
  Shipyard.menuContainer.addChild(Shipyard.titleText);

  Shipyard.currentCredits = getText(formatMoney(gameModel.p1.credits) + " Credits", fontSize, { align: 'center' });
  Shipyard.currentCredits.tint = MainMenu.titleTint;
  Shipyard.currentCredits.anchor = {x:1,y:0};
  Shipyard.currentCredits.position = {x:renderer.width * 0.95 - 25,y: renderer.height * 0.05 + 25};
  Shipyard.menuContainer.addChild(Shipyard.currentCredits);

  Shipyard.backButton.text = getText(Shipyard.backButton.title + " (" + ShootrUI.getInputButtonDescription(buttonTypes.back) + ")", fontSize, { align: 'center' });
  Shipyard.backButton.text.tint = MainMenu.buttonTint;
  Shipyard.backButton.text.anchor = {x:0,y:1};
  Shipyard.backButton.text.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.95 - 25};
  Shipyard.menuContainer.addChild(Shipyard.backButton.text);

  Shipyard.createBluePrintList();
};

Shipyard.resize = function () {
  var visible = Shipyard.menuContainer.visible;
  Shipyard.initialize();
  Shipyard.menuContainer.visible = visible;
};

Shipyard.buyShip = function(ship) {
  if (Shipyard.buyButton.owned) {
    gameModel.p1.ship = ship;
    Shipyard.buyButton.owned = true;
    Shipyard.buyButton.text.text = "This is your current ship";
    PlayerShip.updateSize();
    Shipyard.createBluePrintList();
    save();
  } else if (ship.price * getBuyPriceModifier() <= gameModel.p1.credits && !Shipyard.buyButton.owned) {
    gameModel.p1.credits -= ship.price * getBuyPriceModifier();
    gameModel.p1.ship = ship;

    if (!gameModel.p1.ownedShips)
      gameModel.p1.ownedShips = [];
    gameModel.p1.ownedShips.push({level:ship.level, seed:ship.seed, rarity:ship.rarity});

    if (!gameModel.p1.shipBlueprints)
      gameModel.p1.shipBlueprints = [];
    gameModel.p1.shipBlueprints.push({level:ship.level, seed:ship.seed, rarity:ship.rarity});

    if (gameModel.p1.frontWeapon && gameModel.p1.frontWeapon.level > gameModel.p1.ship.frontWeaponLevel) {
      gameModel.p1.frontWeapon = undefined;
    }
    if (gameModel.p1.rearWeapon && gameModel.p1.rearWeapon.level > gameModel.p1.ship.rearWeaponLevel) {
      gameModel.p1.rearWeapon = undefined;
    }
    if (gameModel.p1.turretWeapon && gameModel.p1.turretWeapon.level > gameModel.p1.ship.turretWeaponLevel) {
      gameModel.p1.turretWeapon = undefined;
    }
    if (gameModel.p1.shield && gameModel.p1.shield.level > gameModel.p1.ship.shieldLevel) {
      gameModel.p1.shield = undefined;
    }
    Shipyard.buyButton.owned = true;
    Shipyard.buyButton.text.text = "This is your current ship";
    PlayerShip.updateSize();
    Shipyard.createBluePrintList();
    save();
    Sounds.powerup.play();
  } else {
    Sounds.enemyShot.play();
  }
};

Shipyard.checkMouseOver = function () {
  if (!Shipyard.menuContainer || !Shipyard.menuContainer.visible)
    return false;

  if (MainMenu.checkButton(Shipyard.backButton)) {
    Shipyard.select(Shipyard.backButton);
    return true;
  }

  if (Shipyard.buyButton && MainMenu.checkButton(Shipyard.buyButton)) {
    Shipyard.select(Shipyard.buyButton);
    return true;
  }

  if (MainMenu.checkMouseOverContainer(Shipyard.blueprintSprite)) {
    for (var i = 0; i < Shipyard.blueprintContainers.length; i++) {
      if (MainMenu.checkMouseOverContainer(Shipyard.blueprintContainers[i],Shipyard.blueprintSprite.x, Shipyard.blueprintSprite.y)) {
        Shipyard.select(Shipyard.blueprintContainers[i]);
        return true;
      }
    }
  }

  return false;
};

Shipyard.showShipDetails = function(ship) {
  Shipyard.ship = ship;
  if (Shipyard.shipContainer) {
    Shipyard.shipContainer.destroy(true);
  }
  var fontSize = Math.round(MainMenu.fontSize * scalingFactor);
  Shipyard.shipContainer = new PIXI.Container();

  var background = new PIXI.Graphics();
  background.beginFill(0x000000);
  background.alpha = MainMenu.backgroundAlpha;
  background.drawRect(renderer.width * 0.05 + renderer.width * 0.32, renderer.height * 0.15, renderer.width * 0.5, renderer.height * 0.7);

  var bounds = background.getBounds();

  Shipyard.shipContainer.addChild(background);

  var shipBacking = new PIXI.Graphics();
  shipBacking.beginFill(0x000000);
  shipBacking.drawRect(bounds.x + 15, bounds.y + bounds.height / 9, bounds.width - 30, bounds.height / 2.5);
  Shipyard.shipContainer.addChild(shipBacking);

  var sprite = new PIXI.Sprite(
    glowTexture(
      PIXI.Texture.fromCanvas(Ships.shipArt(PlayerShip.SHIP_SIZE * 2, ship.seed, Ships.enemyColors[ship.colorIndex]))
    )
  );
  sprite.anchor = {x:0.5,y:0.5};
  sprite.position = {x:shipBacking.getBounds().x + shipBacking.getBounds().width / 2, y:shipBacking.getBounds().y + shipBacking.getBounds().height / 2};
  Shipyard.shipContainer.addChild(sprite);

  var spriteLeft = new PIXI.Sprite(
    glowTexture(
      PIXI.Texture.fromCanvas(Ships.shipArt(PlayerShip.SHIP_SIZE * 2, ship.seed, Ships.enemyColors[ship.colorIndex]))
    )
  );
  spriteLeft.anchor = {x:0.5,y:0.5};
  spriteLeft.rotation = -Math.PI / 2;
  spriteLeft.position = {x:shipBacking.getBounds().x + shipBacking.getBounds().width * 0.2, y:shipBacking.getBounds().y + shipBacking.getBounds().height / 2};
  Shipyard.shipContainer.addChild(spriteLeft);

  var spriteRight = new PIXI.Sprite(
    glowTexture(
      PIXI.Texture.fromCanvas(Ships.shipArt(PlayerShip.SHIP_SIZE * 2, ship.seed, Ships.enemyColors[ship.colorIndex]))
    )
  );
  spriteRight.anchor = {x:0.5,y:0.5};
  spriteRight.rotation = Math.PI / 2;
  spriteRight.position = {x:shipBacking.getBounds().x + shipBacking.getBounds().width * 0.8, y:shipBacking.getBounds().y + shipBacking.getBounds().height / 2};
  Shipyard.shipContainer.addChild(spriteRight);

  var frontWeaponString = "Front Weapon Level: " + Shipyard.levelReqText(ship.frontWeaponLevel, gameModel.p1.ship.frontWeaponLevel);
  var turretWeaponString = "Turret Weapon Level: " + Shipyard.levelReqText(ship.turretWeaponLevel, gameModel.p1.ship.turretWeaponLevel);
  var rearWeaponString = "Rear Weapon Level: " + Shipyard.levelReqText(ship.rearWeaponLevel, gameModel.p1.ship.rearWeaponLevel);
  var shieldString = "Shield Level: " + Shipyard.levelReqText(ship.shieldLevel, gameModel.p1.ship.shieldLevel);
  var fuelRangeString = "Fuel Range: " + ship.range.toFixed(2) + " LY   ( " + (ship.range > gameModel.p1.ship.range ? "+" : "") + (ship.range - gameModel.p1.ship.range).toFixed(2) +  " )";
  var speedString = "Movement Speed: " + (Math.round(ship.speed * 1000)/10) + "%   ( " + (ship.speed > gameModel.p1.ship.speed ? "+" : "") + Math.round((ship.speed - gameModel.p1.ship.speed) * 100) +  "% )";

  var shipDetails = getText(frontWeaponString + "\n" + turretWeaponString + "\n" + rearWeaponString + "\n" + shieldString + "\n" + fuelRangeString + "\n" + speedString + "\n", fontSize, { });
  shipDetails.position = {x:shipBacking.getBounds().x + 5, y:shipBacking.getBounds().y + shipBacking.getBounds().height + 10};
  shipDetails.tint = MainMenu.buttonTint;
  Shipyard.shipContainer.addChild(shipDetails);

  var critChance = "Crit Chance: " + (ship.critChance * 100).toFixed(2) + "%  (" + (ship.critChance > gameModel.p1.ship.critChance ? "+" : "") +((ship.critChance - gameModel.p1.ship.critChance) * 100).toFixed(2) + "%)";
  var critDamage = "Crit Damage: " + (ship.critDamage * 100).toFixed(2) + "%  (" + (ship.critDamage > gameModel.p1.ship.critDamage ? "+" : "") + ((ship.critDamage - gameModel.p1.ship.critDamage) * 100).toFixed(2) + "%)";
  var talentText = ship.talent ? "This ship grants the benefit of\nthe \"" + ship.talent + "\" talent" : "";
  var shipDetailsRight = getText(critChance + "\n" + critDamage + "\n" + talentText, fontSize, { });
  shipDetailsRight.position = {x:shipBacking.getBounds().x + 5 + (shipBacking.getBounds().width / 2), y:shipBacking.getBounds().y + shipBacking.getBounds().height + 10};
  shipDetailsRight.tint = MainMenu.buttonTint;
  Shipyard.shipContainer.addChild(shipDetailsRight);

  var shipName = getText("Level " + ship.level + " - " + ship.name, fontSize, { });
  shipName.anchor = anchor = {x:0,y:0.5};
  shipName.tint = MainMenu.titleTint;
  shipName.position = {x:bounds.x + 15, y:bounds.y + (20 * scalingFactor)};
  Shipyard.shipContainer.addChild(shipName);

  var shipPrice = getText(formatMoney(ship.price * getBuyPriceModifier())+ " Credits", fontSize, { });
  shipPrice.anchor = anchor = {x:1,y:0.5};
  shipPrice.tint = ship.price * getBuyPriceModifier()> gameModel.p1.credits ? MainMenu.unselectableTint : MainMenu.titleTint;
  shipPrice.position = {x:bounds.x + bounds.width - 15, y:bounds.y + (20 * scalingFactor)};
  Shipyard.shipContainer.addChild(shipPrice);

  var alreadyOwned = false;
  if (gameModel.p1.ownedShips) {
    gameModel.p1.ownedShips.forEach(function(anOwnedShip){
      if (anOwnedShip.seed == ship.seed && anOwnedShip.level == ship.level && anOwnedShip.rarity == ship.rarity)
        alreadyOwned = true;
    });
  }

  if (alreadyOwned)
    shipPrice.text = "Owned";

  Shipyard.buyButton = {
    owned : alreadyOwned,
    current : ship.seed == gameModel.p1.ship.seed && ship.level == gameModel.p1.ship.level && ship.rarity == gameModel.p1.ship.rarity
  };
  Shipyard.buyButton.text = getText(Shipyard.buyButton.current ? "This is your current ship" : Shipyard.buyButton.owned ? "Switch to this ship" : "Build this ship for " + formatMoney(ship.price * getBuyPriceModifier()) + " Credits", fontSize, { align: 'center' });
  Shipyard.buyButton.text.tint = MainMenu.buttonTint;
  Shipyard.buyButton.text.anchor = {x:0.5,y:0.5};
  Shipyard.buyButton.text.position = {x:bounds.x + bounds.width / 2, y:bounds.y + bounds.height - (20 * scalingFactor)};
  Shipyard.shipContainer.addChild(Shipyard.buyButton.text);

  Shipyard.menuContainer.addChild(Shipyard.shipContainer);
};

Shipyard.mousewheel = function(data) {
  if (Shipyard.menuContainer.visible) {
    if (MainMenu.checkMouseOverContainer(Shipyard.blueprintSprite) && Shipyard.blueprintContainer.height > Shipyard.blueprintSprite.height) {
      Shipyard.blueprintContainer.position.y += data;
      if (Shipyard.blueprintContainer.position.y > 0) {
        Shipyard.blueprintContainer.position.y = 0;
      }
      if (Shipyard.blueprintContainer.height + Shipyard.blueprintContainer.position.y < Shipyard.blueprintSprite.height) {
        Shipyard.blueprintContainer.position.y = Shipyard.blueprintSprite.height - Shipyard.blueprintContainer.height;
      }
      // renderer.render(Shipyard.blueprintContainer, Shipyard.blueprintTexture);
      Shipyard.checkMouseOver();
    }
  }
};


Shipyard.checkClicks = function() {

  if (!Shipyard.menuContainer.visible)
    return false;

  if (MainMenu.checkButton(Shipyard.backButton)) {
    Shipyard.backButton.click();
    return true;
  }

  if (Shipyard.buyButton && MainMenu.checkButton(Shipyard.buyButton)) {
    Shipyard.buyShip(Shipyard.ship);
    return true;
  }

  if (MainMenu.checkMouseOverContainer(Shipyard.blueprintSprite)) {
    for (var i = 0; i < Shipyard.blueprintContainers.length; i++) {
      if (MainMenu.checkMouseOverContainer(Shipyard.blueprintContainers[i],Shipyard.blueprintSprite.x, Shipyard.blueprintSprite.y)) {
        Shipyard.showShipDetails(Shipyard.blueprintContainers[i].ship);
        return true;
      }
    }
  }

  return false;
};

Shipyard.select = function(button) {
  Shipyard.backButton.text.tint = MainMenu.buttonTint;

  if (Shipyard.buyButton) {
    Shipyard.buyButton.text.tint = MainMenu.buttonTint;
  }

  for (var i = 0; i < Shipyard.blueprintContainers.length; i++) {
    Shipyard.blueprintContainers[i].children.forEach(function(child) {
			child.tint = 0xAAAAAA;
		});
  }

  if (button.text)
    button.text.tint = MainMenu.selectedButtonTint;
  else {
    button.children.forEach(function(child) {
			child.tint = 0xFFFFFF;
		});
  }
  renderer.render(Shipyard.blueprintContainer, Shipyard.blueprintTexture);
};

Shipyard.down = function() {
  if (!Shipyard.menuContainer.visible)
    return false;

  Shipyard.select(Shipyard.backButton);
  Shipyard.currentSelection = -1;
  return true;
};

Shipyard.left = function() {
  if (!Shipyard.menuContainer.visible)
    return false;

  if (Shipyard.currentSelection == -1) {
    Shipyard.select(Shipyard.ships[2].buyButton);
    Shipyard.currentSelection = 2;
  } else if (Shipyard.currentSelection === 0) {
    Shipyard.select(Shipyard.backButton);
    Shipyard.currentSelection = -1;
  } else {
    Shipyard.currentSelection--;
    // Shipyard.select(Shipyard.ships[Shipyard.currentSelection].buyButton);
  }

  return true;
};

Shipyard.right = function() {
  if (!Shipyard.menuContainer.visible)
    return false;

  if (Shipyard.currentSelection == -1) {
    Shipyard.select(Shipyard.ships[0].buyButton);
    Shipyard.currentSelection = 0;
  } else if (Shipyard.currentSelection === 2) {
    Shipyard.select(Shipyard.backButton);
    Shipyard.currentSelection = -1;
  } else {
    Shipyard.currentSelection++;
    // Shipyard.select(Shipyard.ships[Shipyard.currentSelection].buyButton);
  }

  return true;
};

Shipyard.aButton = function() {
  if (!Shipyard.menuContainer.visible)
    return false;

  if (Shipyard.currentSelection == -1)
    Shipyard.backButton.click();
  else
    // Shipyard.buyShip(Shipyard.ships[Shipyard.currentSelection]);

  return true;
};

Shipyard.bButtonPress = function() {
  if (!Shipyard.menuContainer.visible)
    return false;

  Shipyard.bButton();
  return true;
};

Shipyard.update = function(timeDiff) {
  if (!Shipyard.menuContainer.visible)
    return;
};

Shipyard.prefixes = [
{name:"Alabaster",index:10},
{name:"Amaranth",index:0},
{name:"Amber",index:7},
{name:"Amethyst",index:11},
{name:"Ash",index:10},
{name:"Azure",index:2},
{name:"Black",index:10},
{name:"Blue",index:2},
{name:"Brilliant",index:1},
{name:"Cardinal",index:0},
{name:"Cinnabar",index:8},
{name:"Copper",index:7},
{name:"Crimson",index:0},
{name:"Cyan",index:11},
{name:"Dark",index:9},
{name:"Diamond",index:4},
{name:"Electric",index:4},
{name:"Golden",index:6},
{name:"Green",index:5},
{name:"Indigo",index:4},
{name:"Light",index:6},
{name:"Orange",index:8},
{name:"Purple",index:3},
{name:"Red",index:0},
{name:"Saffron",index:6},
{name:"Shadow",index:10},
{name:"Shining",index:1},
{name:"Silver",index:5},
{name:"Sky",index:5},
{name:"Stealth",index:9},
{name:"Vermillion",index:1},
{name:"Violet",index:4},
{name:"White",index:10},
{name:"Yellow",index:6}
];

Shipyard.suffixes = [
  "Adder",
  "Ant",
  "Barracuda",
  "Bear",
  "Bison",
  "Buzzard",
  "Centipede",
  "Cobra",
  "Coyote",
  "Deathstalker",
  "Dragon",
  "Eagle",
  "Eel",
  "Falcon",
  "Flea",
  "Fox",
  "Gator",
  "Gazelle",
  "Ghost",
  "Hawk",
  "Hornet",
  "Komodo",
  "Leopard",
  "Lion",
  "Lizard",
  "Mosquito",
  "Panther",
  "Parasite",
  "Rhino",
  "Scorpion",
  "Shark",
  "Shrew",
  "Snake",
  "Spectre",
  "Spider",
  "Stinger",
  "Tiger",
  "Vampire",
  "Viper",
  "Vulture",
  "Warthog",
  "Wasp",
  "Wolf"
];
