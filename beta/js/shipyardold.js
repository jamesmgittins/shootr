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

Shipyard.generateShip = function(level, seed, ultra) {
  Math.seedrandom(seed);
  var levelMod = Math.pow(Constants.shipLevelPriceScaling, level - 1);
	var prefix = Shipyard.prefixes[Math.floor(Math.random() * Shipyard.prefixes.length)];
  var ship = {
    seed:seed,
    level:level,
    ultra:ultra,
    frontWeaponLevel:   Math.max(1,Math.round(level - 0.7 + Math.random() * 1.5)),
    turretWeaponLevel:  Math.max(1,Math.round(level - 0.7 + Math.random() * 1.5)),
    rearWeaponLevel:    Math.max(1,Math.round(level - 0.7 + Math.random() * 1.5)),
    shieldLevel:        Math.max(1,Math.round(level - 0.7 + Math.random() * 1.5)),
    speed : Math.min(0.99 + Math.min(0.5, level / 150), 1.6),
    range : 12 + (level / 5) + (Math.random() * 0.1 * level),
		colorIndex : prefix.index,
    name:(ultra? "Ultra " : "") + prefix.name + " " + Shipyard.suffixes[Math.floor(Math.random() * Shipyard.suffixes.length)],
    dualEngines : Math.random() > 0.7
  };

  var priceMultiplier = (ship.frontWeaponLevel / level) * (ship.turretWeaponLevel / level) * (ship.rearWeaponLevel / level) * (ship.shieldLevel / level) * (ship.range / 15) * ship.speed;

  ship.price = Math.round(level * levelMod * (1000 + 200 * priceMultiplier));
  return ship;
};

Shipyard.hide = function() {
  Shipyard.menuContainer.visible = false;
  for (i = Shipyard.menuContainer.children.length - 1; i >= 0; i--){
    var item = Shipyard.menuContainer.children[i];
    item.destroy(true);
  }
  Shipyard.currentSelection=-1;
};

Shipyard.show = function() {
  Shipyard.initialize();
  Shipyard.menuContainer.visible = true;
};

Shipyard.levelReqText = function(value, currentShipValue) {
  return value + (value - currentShipValue !== 0 ? "   ( " + (value - currentShipValue > 0 ? "+" : "") + (value - currentShipValue) + " )" : "");
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

  var star = StarChart.generateStar(gameModel.currentSystem.x, gameModel.currentSystem.y);
  var shipLayoutWidth = renderer.width * 0.9 / 3;

  var level = calculateAdjustedStarLevel(star.level);

  for (i = 0; i < 3; i++) {
    var randomLevel = Math.max(1, Math.round(gameModel.currentLevel + (Math.random() * (Boss.currentLevel() - gameModel.currentLevel) * 0.8)));
    var ship = Shipyard.generateShip(randomLevel, star.seed + i, false);

    Shipyard.ships[i] = ship;
    Shipyard.ships[i].background = new PIXI.Graphics();
    Shipyard.ships[i].background.beginFill(0x000000);
    Shipyard.ships[i].background.alpha = MainMenu.backgroundAlpha;
    Shipyard.ships[i].background.drawRect(renderer.width * 0.05 + i * shipLayoutWidth + 15, renderer.height * 0.15, shipLayoutWidth - 30, renderer.height * 0.7);

    var bounds = Shipyard.ships[i].background.getBounds();

    Shipyard.menuContainer.addChild(Shipyard.ships[i].background);

    var shipBacking = new PIXI.Graphics();
    shipBacking.beginFill(0x000000);
    shipBacking.drawRect(bounds.x + 15, bounds.y + bounds.height / 9, bounds.width - 30, bounds.height / 2.5);
    Shipyard.menuContainer.addChild(shipBacking);

    var sprite = new PIXI.Sprite(
      glowTexture(
        PIXI.Texture.fromCanvas(Ships.shipArt(PlayerShip.SHIP_SIZE * 2, Shipyard.ships[i].seed, Ships.enemyColors[Shipyard.ships[i].colorIndex]))
      )
    );
    sprite.anchor = {x:0.5,y:0.5};
    sprite.position = {x:shipBacking.getBounds().x + shipBacking.getBounds().width / 2, y:shipBacking.getBounds().y + shipBacking.getBounds().height / 2};
    Shipyard.menuContainer.addChild(sprite);
    Shipyard.ships[i].sprite = sprite;

    var frontWeaponString = "Front Weapon Level: " + Shipyard.levelReqText(ship.frontWeaponLevel, gameModel.p1.ship.frontWeaponLevel);
    var turretWeaponString = "Turret Weapon Level: " + Shipyard.levelReqText(ship.turretWeaponLevel, gameModel.p1.ship.turretWeaponLevel);
    var rearWeaponString = "Rear Weapon Level: " + Shipyard.levelReqText(ship.rearWeaponLevel, gameModel.p1.ship.rearWeaponLevel);
    var shieldString = "Shield Level: " + Shipyard.levelReqText(ship.shieldLevel, gameModel.p1.ship.shieldLevel);
    var fuelRangeString = "Fuel Range: " + ship.range.toFixed(2) + " light years   ( " + (ship.range > gameModel.p1.ship.range ? "+" : "") + (ship.range - gameModel.p1.ship.range).toFixed(2) +  " )";
    var speedString = "Movement Speed: " + (Math.round(ship.speed * 1000)/10) + "%   ( " + (ship.speed > gameModel.p1.ship.speed ? "+" : "") + Math.round((ship.speed - gameModel.p1.ship.speed) * 100) +  "% )";

    var shipDetails = getText(frontWeaponString + "\n" + turretWeaponString + "\n" + rearWeaponString + "\n" + shieldString + "\n" + fuelRangeString + "\n" + speedString + "\n", fontSize, { });
    shipDetails.position = {x:shipBacking.getBounds().x + 5, y:shipBacking.getBounds().y + shipBacking.getBounds().height + 10};
    shipDetails.tint = MainMenu.buttonTint;
    Shipyard.menuContainer.addChild(shipDetails);

    var shipName = getText("Level " + Shipyard.ships[i].level + " - " + Shipyard.ships[i].name, fontSize, { });
    shipName.anchor = anchor = {x:0,y:0.5};
    shipName.tint = MainMenu.titleTint;
    shipName.position = {x:bounds.x + 15, y:bounds.y + (20 * scalingFactor)};
    Shipyard.menuContainer.addChild(shipName);

    var shipPrice = getText(formatMoney(Shipyard.ships[i].price * getBuyPriceModifier())+ " Credits", fontSize, { });
    shipPrice.anchor = anchor = {x:1,y:0.5};
    shipPrice.tint = Shipyard.ships[i].price * getBuyPriceModifier()> gameModel.p1.credits ? MainMenu.unselectableTint : MainMenu.titleTint;
    shipPrice.position = {x:bounds.x + bounds.width - 15, y:bounds.y + (20 * scalingFactor)};
    Shipyard.menuContainer.addChild(shipPrice);

    Shipyard.ships[i].buyButton = {
      title: ship.seed == gameModel.p1.ship.seed && ship.level == gameModel.p1.ship.level ? "Already Owned" : "Buy",
      owned : ship.seed == gameModel.p1.ship.seed && ship.level == gameModel.p1.ship.level, index:i
    };
    Shipyard.ships[i].buyButton.text = getText(Shipyard.ships[i].buyButton.title, fontSize, { align: 'center' });
    Shipyard.ships[i].buyButton.text.tint = MainMenu.buttonTint;
    Shipyard.ships[i].buyButton.text.anchor = {x:0.5,y:0.5};
    Shipyard.ships[i].buyButton.text.position = {x:bounds.x + bounds.width / 2, y:bounds.y + bounds.height - (20 * scalingFactor)};
    Shipyard.menuContainer.addChild(Shipyard.ships[i].buyButton.text);

    if (ship.seed == gameModel.p1.ship.seed && ship.level == gameModel.p1.ship.level) {
      var soldText = getText("S O L D", fontSize * 3, { stroke : "#000", strokeThickness : 5, align: 'center' });
      soldText.tint = 0xFF0000;
      soldText.anchor = {x:0.5,y:0.5};
      soldText.rotation = -0.3;
      soldText.position = sprite.position;
      Shipyard.menuContainer.addChild(soldText);
    }
  }

};

Shipyard.resize = function () {
  var visible = Shipyard.menuContainer.visible;
  Shipyard.initialize();
  Shipyard.menuContainer.visible = visible;
};

Shipyard.buyShip = function(ship) {
  if (ship.price * getBuyPriceModifier() <= gameModel.p1.credits && !ship.buyButton.owned) {
    gameModel.p1.credits -= ship.price * getBuyPriceModifier();
    gameModel.p1.ship = Shipyard.generateShip(ship.level, ship.seed, ship.ultra);
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
    PlayerShip.updateSize();
    save();
    Shipyard.initialize();
    Shipyard.menuContainer.visible = true;
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

  for (var i=0; i<Shipyard.ships.length; i++) {
    if (MainMenu.checkButton(Shipyard.ships[i].buyButton)) {
      Shipyard.select(Shipyard.ships[i].buyButton);
      return true;
    }
  }

  return false;
};

Shipyard.checkClicks = function() {

  if (!Shipyard.menuContainer.visible)
    return false;

  if (MainMenu.checkButton(Shipyard.backButton)) {
    Shipyard.backButton.click();
    return true;
  }

  for (var i=0; i<Shipyard.ships.length; i++) {
    if (MainMenu.checkButton(Shipyard.ships[i].buyButton)) {
      Shipyard.buyShip(Shipyard.ships[i]);
    }
  }

  return false;
};

Shipyard.select = function(button) {
  Shipyard.backButton.text.tint = MainMenu.buttonTint;

  for (var i=0; i<Shipyard.ships.length; i++) {
    Shipyard.ships[i].buyButton.text.tint = MainMenu.buttonTint;
  }

  button.text.tint = MainMenu.selectedButtonTint;
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
    Shipyard.select(Shipyard.ships[Shipyard.currentSelection].buyButton);
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
    Shipyard.select(Shipyard.ships[Shipyard.currentSelection].buyButton);
  }

  return true;
};

Shipyard.aButton = function() {
  if (!Shipyard.menuContainer.visible)
    return false;

  if (Shipyard.currentSelection == -1)
    Shipyard.backButton.click();
  else
    Shipyard.buyShip(Shipyard.ships[Shipyard.currentSelection]);

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

  for (var i=0; i < Shipyard.ships.length; i++) {
    if (i == Shipyard.currentSelection) {
      Shipyard.ships[i].sprite.rotation += 0.5 * timeDiff;
    } else {
      if (Shipyard.ships[i].sprite.rotation !== 0) {
        if (Shipyard.ships[i].sprite.rotation > 0 && Shipyard.ships[i].sprite.rotation < Math.PI) {
          if (Shipyard.ships[i].sprite.rotation - 2 * timeDiff < 0 )
            Shipyard.ships[i].sprite.rotation = 0;
          else
            Shipyard.ships[i].sprite.rotation -= 2 * timeDiff;
        }
        else {
          if (Shipyard.ships[i].sprite.rotation + 2 * timeDiff > 2 * Math.PI )
            Shipyard.ships[i].sprite.rotation = 0;
          else
            Shipyard.ships[i].sprite.rotation += 2 * timeDiff;
        }
      }
    }
  }
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