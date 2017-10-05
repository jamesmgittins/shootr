Loadout = {
  menuTitle:"Weapons Loadout",
  positions:{
    frontWeapon:0,
    turretWeapon:1,
    rearWeapon:2,
    shield:3
  },
  weapons:[],
  shields:[],
  gridWidth : 3,
  menuOptions:[
    {index:0,title:"Front Weapon Position", click:function(){
      Loadout.selectPosition(0);
    }},
    {index:1,title:"Turret Weapon Position", click:function(){
      Loadout.selectPosition(1);
    }},
    {index:2,title:"Rear Weapon Position", click:function(){
      Loadout.selectPosition(2);
    }},
    {index:3,title:"Shield Position", click:function(){
      Loadout.selectPosition(3);
    }}
  ],
  backButton:{index:4,title:"Back",buttonDesc:buttonTypes.back, click:function(){
    Loadout.hide();
    StationMenu.show();
  }},
  weaponSelection:0,
  currentSelection:0,
  bButton : function(){},
  levelAllowed : 1,
  showCurrentCredits:true
};

Loadout.selectPosition = function(index) {

  Loadout.positionSelector.clear();
  Loadout.positionSelector.lineStyle(2 * gameModel.resolutionFactor, 0xFFFFFF);
  Loadout.positionSelector.tint = MainMenu.buttonTint;
  var bounds = Loadout.menuOptions[index].text.getBounds();
  Loadout.positionSelector.drawRect(bounds.x - 20 * scalingFactor,bounds.y - 5 * scalingFactor,bounds.width + 40 * scalingFactor,bounds.height + 10 * scalingFactor);

  Loadout.positionSelector.visible=true;

  Loadout.currentPosition = index;

  Loadout.locationSelector.clear();
  // Loadout.locationSelector.filters = [new PIXI.filters.BlurFilter()];
  Loadout.locationSelector.lineStyle(2 * gameModel.resolutionFactor, 0xFFFFFF);
  Loadout.locationSelector.drawCircle(0,0,Loadout.shipSprite.width / 16);

  // Loadout.locationSelector.moveTo(0,0);

  Loadout.locationSelector.tint = MainMenu.buttonTint;

  Loadout.weapons = [];
  Loadout.shields = [];

  switch (index) {
    case 0:
      Loadout.locationSelector.position.x = Loadout.shipSprite.position.x + Loadout.renderSprite.position.x;
      Loadout.locationSelector.position.y = Loadout.shipSprite.position.y + Loadout.renderSprite.position.y - Loadout.shipSprite.height / 8;
      Loadout.showWeapons();
      break;
    case 1:
      Loadout.locationSelector.position.x = Loadout.shipSprite.position.x + Loadout.renderSprite.position.x;
      Loadout.locationSelector.position.y = Loadout.shipSprite.position.y + Loadout.renderSprite.position.y;
      Loadout.showWeapons();
      break;
    case 2:
      Loadout.locationSelector.position.x = Loadout.shipSprite.position.x + Loadout.renderSprite.position.x;
      Loadout.locationSelector.position.y = Loadout.shipSprite.position.y + Loadout.renderSprite.position.y + Loadout.shipSprite.height / 8;
      Loadout.locationSelector.clear();
      Loadout.locationSelector.lineStyle(2 * gameModel.resolutionFactor, 0xFFFFFF);
      Loadout.locationSelector.drawCircle(0,0,Loadout.shipSprite.width / 8);
      Loadout.showWeapons();
      break;
    case 3:
      Loadout.locationSelector.position.x = Loadout.shipSprite.position.x + Loadout.renderSprite.position.x;
      Loadout.locationSelector.position.y = Loadout.shipSprite.position.y + Loadout.renderSprite.position.y;
      Loadout.locationSelector.clear();
      Loadout.locationSelector.lineStyle(2 * gameModel.resolutionFactor, 0xFFFFFF);
      Loadout.locationSelector.drawCircle(0,0,Loadout.shipSprite.width / 3);
      Loadout.showShields();
      break;
  }

  Loadout.locationSelector.lineStyle(2 * gameModel.resolutionFactor, 0xFFFFFF);
  Loadout.locationSelector.moveTo((bounds.x - 20 * scalingFactor) + (bounds.width + 40 * scalingFactor) - (Loadout.locationSelector.position.x), (bounds.y - 5 * scalingFactor) + (bounds.height / 2) - (Loadout.locationSelector.position.y));
  Loadout.locationSelector.lineTo(0, 0);

  Loadout.locationSelector.visible = true;
};

Loadout.showWeapons = function() {

  Loadout.weaponsContainer.visible = true;
  Loadout.weaponMenuOpen = true;
  Loadout.shieldMenuOpen = false;
  Loadout.weaponSelection = 0;

  for (var i=Loadout.weaponsContainer.children.length - 1; i >= 0; i--){
    var item = Loadout.weaponsContainer.children[i];
    // Loadout.weaponsContainer.removeChild(item);
    item.visible=false;
  }

  var fontSize = Math.round(MainMenu.fontSize * scalingFactor);
  var positionText = "";

  switch(Loadout.currentPosition) {
    case Loadout.positions.frontWeapon:
      Loadout.equippedWeapon = gameModel.p1.frontWeapon;
      Loadout.levelAllowed = gameModel.p1.ship.frontWeaponLevel;
      positionText = " Front";
      break;
    case Loadout.positions.turretWeapon:
      Loadout.equippedWeapon = gameModel.p1.turretWeapon;
      Loadout.levelAllowed = gameModel.p1.ship.turretWeaponLevel;
      positionText = " Turret";
      break;
    case Loadout.positions.rearWeapon:
      Loadout.equippedWeapon = gameModel.p1.rearWeapon;
      Loadout.levelAllowed = gameModel.p1.ship.rearWeaponLevel;
      positionText = " Rear";
      break;
  }

  var screenPosition = renderer.height * 0.18;
  var positionSpacing = 110;
  var startingXPos = renderer.width * 0.65 + (renderer.width * 0.35 - positionSpacing * Loadout.gridWidth * scalingFactor) / 2;
  var index = 0;
  var currentCol = 0;
  var currentRow = 0;

  gameModel.p1.weapons.sort(function(a,b){
    return b.dps - a.dps;
  });

  for (i=0; i<gameModel.p1.weapons.length; i++) {
    if (!Loadout.equippedWeapon || gameModel.p1.weapons[i].id != Loadout.equippedWeapon.id) {
      var equippedText = "";
      if (gameModel.p1.frontWeapon && gameModel.p1.frontWeapon.id == gameModel.p1.weapons[i].id)
        equippedText = " [Equipped Front]";
      if (gameModel.p1.turretWeapon && gameModel.p1.turretWeapon.id == gameModel.p1.weapons[i].id)
        equippedText = " [Equipped Turret]";
      if (gameModel.p1.rearWeapon && gameModel.p1.rearWeapon.id == gameModel.p1.weapons[i].id)
        equippedText = " [Equipped Rear]";

      Loadout.weapons[index] = {
        index : index,
        weapon : gameModel.p1.weapons[i],
        text : ArmsDealer.createItemIcon(gameModel.p1.weapons[i], {buy:false, loadout:true, slotLevel : Loadout.levelAllowed, compareItem:Loadout.equippedWeapon, scale:0.8})
      };
      Loadout.weapons[index].defaultTint = gameModel.p1.weapons[i].level <= Loadout.levelAllowed ? MainMenu.buttonTint : MainMenu.unselectableTint;
      Loadout.weapons[index].text.tint = Loadout.weapons[index].defaultTint;
      Loadout.weapons[index].text.position = {x:startingXPos + (currentCol * positionSpacing * scalingFactor), y:renderer.height * 0.18 + (currentRow * positionSpacing * scalingFactor) - (20 * scalingFactor)};
      Loadout.weaponsContainer.addChild(Loadout.weapons[index].text);

      currentCol++;
      if (currentCol > Loadout.gridWidth - 1) {
        currentCol = 0;
        currentRow++;
      }
      index++;
    }
  }
};

Loadout.selectShield = function(index) {

  if (Loadout.shields[index].weapon.level > Loadout.levelAllowed) {
    Sounds.damage.play();
    return;
  }

  gameModel.p1.shield = Loadout.shields[index].weapon;
  Loadout.menuOptions[3].equippedText.text = "";
  Loadout.menuOptions[3].equippedText.tint = Loadout.menuOptions[3].equippedText.defaultTint = MainMenu.buttonTint;

  var iconPosition = Loadout.menuOptions[3].equippedIcon.position;
  Loadout.menuOptions[3].text.removeChild(Loadout.menuOptions[3].equippedIcon);
  Loadout.menuOptions[3].equippedIcon = ArmsDealer.createItemIcon(Loadout.shields[index].weapon, {buy:false, loadout:true, scale:0.7});
  Loadout.menuOptions[3].equippedIcon.position = iconPosition;
  // Loadout.menuOptions[3].equippedIcon.scale = {x:0.7, y:0.7};
  Loadout.menuOptions[3].text.addChild(Loadout.menuOptions[3].equippedIcon);
  Loadout.menuOptions[3].weapon = Loadout.shields[index].weapon;

  Loadout.showShields();
  Loadout.selectPosition(Loadout.currentPosition);
  Loadout.hideItemHover();
};

Loadout.selectWeapon = function(index) {

  if (Loadout.weapons[index].weapon.level > Loadout.levelAllowed) {
    Sounds.damage.play();
    return;
  }

  var deselectMenuOption = function(menuOption){
    menuOption.equippedText.text = "Empty Slot";
    menuOption.text.removeChild(menuOption.equippedIcon);
    menuOption.equippedText.tint = menuOption.equippedText.defaultTint = MainMenu.unselectableTint;
    menuOption.weapon = false;
  };

  if (gameModel.p1.frontWeapon && gameModel.p1.frontWeapon.id == Loadout.weapons[index].weapon.id) {
    gameModel.p1.frontWeapon = undefined;
    deselectMenuOption(Loadout.menuOptions[0]);
  }
  if (gameModel.p1.turretWeapon && gameModel.p1.turretWeapon.id == Loadout.weapons[index].weapon.id) {
    gameModel.p1.turretWeapon = undefined;
    deselectMenuOption(Loadout.menuOptions[1]);
  }
  if (gameModel.p1.rearWeapon && gameModel.p1.rearWeapon.id == Loadout.weapons[index].weapon.id) {
    gameModel.p1.rearWeapon = undefined;
    deselectMenuOption(Loadout.menuOptions[2]);
  }

  var selectMenuOption = function(menuOption) {
    menuOption.equippedText.text = "";
    menuOption.equippedText.tint = menuOption.equippedText.defaultTint = MainMenu.buttonTint;
    iconPosition = menuOption.equippedIcon.position;
    menuOption.text.removeChild(menuOption.equippedIcon);
    menuOption.equippedIcon = ArmsDealer.createItemIcon(Loadout.weapons[index].weapon, {buy:false, loadout:true, scale:0.7});
    menuOption.equippedIcon.position = iconPosition;
    menuOption.text.addChild(menuOption.equippedIcon);
    menuOption.weapon = Loadout.weapons[index].weapon;
  };

  var iconPosition;
  switch(Loadout.currentPosition) {
    case Loadout.positions.frontWeapon:
      gameModel.p1.frontWeapon = Loadout.weapons[index].weapon;
      selectMenuOption(Loadout.menuOptions[0]);
      break;
    case Loadout.positions.turretWeapon:
      gameModel.p1.turretWeapon = Loadout.weapons[index].weapon;
      selectMenuOption(Loadout.menuOptions[1]);
      break;
    case Loadout.positions.rearWeapon:
      gameModel.p1.rearWeapon = Loadout.weapons[index].weapon;
      selectMenuOption(Loadout.menuOptions[2]);
      break;
  }
  Loadout.showWeapons();
  Loadout.updateTotalDPS();
  Loadout.selectPosition(Loadout.currentPosition);
  Loadout.hideItemHover();
};

Loadout.showShields = function() {

  Loadout.weaponsContainer.visible = true;
  Loadout.shieldMenuOpen = true;
  Loadout.weaponMenuOpen = false;
  Loadout.weaponSelection = 0;
  Loadout.levelAllowed = gameModel.p1.ship.shieldLevel;

  for (var i=Loadout.weaponsContainer.children.length - 1; i >= 0; i--){
    var item = Loadout.weaponsContainer.children[i];
    // Loadout.weaponsContainer.removeChild(item);
    // item.destroy();
    item.visible = false;
  }

  var fontSize = Math.round(MainMenu.fontSize * scalingFactor);

  var equippedShield = gameModel.p1.shield;

  var screenPosition = renderer.height * 0.18;
  var positionSpacing = 110;
  var startingXPos = renderer.width * 0.65 + (renderer.width * 0.35 - positionSpacing * Loadout.gridWidth * scalingFactor) / 2;
  var index = 0;
  var currentCol = 0;
  var currentRow = 0;

  gameModel.p1.shields.sort(function(a,b){
    return b.capacity - a.capacity;
  });

  for (i=0; i<gameModel.p1.shields.length; i++) {
    if (!equippedShield || gameModel.p1.shields[i].id != equippedShield.id) {
      Loadout.shields[index] = {
        index : index,
        weapon : gameModel.p1.shields[i],
        text : ArmsDealer.createItemIcon(gameModel.p1.shields[i], {buy:false, loadout:true, compareItem : gameModel.p1.shield, scale:0.8})
      };
      Loadout.shields[index].defaultTint = gameModel.p1.shields[i].level <= Loadout.levelAllowed ? MainMenu.buttonTint : MainMenu.unselectableTint;
      Loadout.shields[index].text.tint = Loadout.shields[index].defaultTint;
      Loadout.shields[index].text.position = {x:startingXPos + (currentCol * positionSpacing * scalingFactor), y:renderer.height * 0.18 + (currentRow * positionSpacing * scalingFactor) - (20 * scalingFactor)};
      Loadout.weaponsContainer.addChild(Loadout.shields[index].text);
      currentCol++;
      if (currentCol > Loadout.gridWidth - 1) {
        currentCol = 0;
        currentRow++;
      }
      index++;
    }
  }
};

Loadout.updateTotalDPS = function() {
  var total = 0;
  if (gameModel.p1.frontWeapon)
    total += gameModel.p1.frontWeapon.dps;
  if (gameModel.p1.turretWeapon)
    total += gameModel.p1.turretWeapon.dps;
  if (gameModel.p1.rearWeapon)
    total += gameModel.p1.rearWeapon.dps;
  Loadout.totalDPS.text = "Total Damage Per Second: " + formatMoney(total);
};


Loadout.hide = function() {
  Loadout.menuContainer.visible = false;
  Loadout.weaponsContainer.visible = false;
  Loadout.weapons = [];
  Loadout.shields = [];
  Loadout.weaponMenuOpen = false;

  if (Loadout.firingWeapon)
    Loadout.firingWeapon.destroy();

  if (Loadout.menuContainer) {
    for (i = Loadout.menuContainer.children.length - 1; i >= 0; i--){
      var item = Loadout.menuContainer.children[i];
      Loadout.menuContainer.removeChild(item);
      item.destroy(true);
    }
  }

};

Loadout.show = function() {
  Loadout.initialize();
  Loadout.menuContainer.visible = true;
};

Loadout.initialize = function () {
  var i;
  if (!Loadout.menuContainer) {
    Loadout.menuContainer = new PIXI.Container();
    gameContainer.addChild(Loadout.menuContainer);
  } else {
    for (i = Loadout.menuContainer.children.length - 1; i >= 0; i--){
      var item = Loadout.menuContainer.children[i];
      Loadout.menuContainer.removeChild(item);
      item.destroy(true);
    }
  }
  Loadout.firingWeapons = [];
  Loadout.firingWeapon = null;

  Loadout.menuContainer.visible = false;

  Loadout.weaponMenuOpen = false;
  Loadout.shieldMenuOpen = false;

  Loadout.menuBackground = new PIXI.Graphics();
  Loadout.menuBackground.beginFill(MainMenu.backgroundColor);
  Loadout.menuBackground.drawRect(0, renderer.height * 0.05, renderer.width, renderer.height * 0.9);
  Loadout.menuBackground.alpha = MainMenu.backgroundAlpha;

  Loadout.menuContainer.addChild(Loadout.menuBackground);

  var fontSize = Math.round(MainMenu.fontSize * scalingFactor);

  Loadout.titleText = getText(Loadout.menuTitle, fontSize, { align: 'center' });
  Loadout.titleText.tint = MainMenu.titleTint;
  Loadout.titleText.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.05 + 25};
  Loadout.menuContainer.addChild(Loadout.titleText);

  Loadout.backButton.text = getText(Loadout.backButton.title + " (" + ShootrUI.getInputButtonDescription(Loadout.backButton.buttonDesc) + ")", fontSize, { align: 'center' });
  Loadout.backButton.text.tint = MainMenu.buttonTint;

  Loadout.backButton.text.anchor = {x:0,y:1};
  Loadout.backButton.text.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.95 - 25};
  Loadout.menuContainer.addChild(Loadout.backButton.text);

  Loadout.totalDPS = getText("Total Damage Per Second: ", 26 * scalingFactor, { align: 'center' });
  Loadout.totalDPS.tint = MainMenu.buttonTint;

  Loadout.totalDPS.anchor = {x:0.5,y:1};
  Loadout.totalDPS.position = {x:renderer.width / 2,y: renderer.height * 0.95 - 25};
  Loadout.menuContainer.addChild(Loadout.totalDPS);

  Loadout.shipName = getText("Level " + gameModel.p1.ship.level + " " + gameModel.p1.ship.name, 26 * scalingFactor, { align: 'center' });
  Loadout.shipName.tint = MainMenu.buttonTint;

  Loadout.shipName.anchor = {x:0.5,y:0};
  Loadout.shipName.position = {x:renderer.width / 2,y: renderer.height * 0.05 + 25 };
  Loadout.menuContainer.addChild(Loadout.shipName);

  Loadout.currentCredits = getText(formatMoney(gameModel.p1.credits) + " Credits", fontSize, { align: 'center' });
	Loadout.currentCredits.tint = MainMenu.titleTint;
	Loadout.currentCredits.anchor = {x: 1,y: 0};
	Loadout.currentCredits.position = {x: renderer.width * 0.95 - 25,y: renderer.height * 0.05 + 25};
	Loadout.menuContainer.addChild(Loadout.currentCredits);


  Loadout.updateTotalDPS();

  Loadout.renderContainer = new PIXI.Container();
  Loadout.shipRenderTexture = PIXI.RenderTexture.create(renderer.width * 0.3, renderer.height * 0.7);
  Loadout.renderSprite = new PIXI.Sprite(Loadout.shipRenderTexture);
  Loadout.menuContainer.addChild(Loadout.renderSprite);

  Loadout.renderSprite.position = {x:renderer.width * 0.35,y:renderer.height * 0.15};

  Loadout.shipBackground = new PIXI.Graphics();
  Loadout.shipBackground.beginFill(0x000000);
  Loadout.shipBackground.drawRect(0, 0, Loadout.shipRenderTexture.width, Loadout.shipRenderTexture.height);
  Loadout.shipBackground.alpha = 0.5;
  Loadout.renderContainer.addChild(Loadout.shipBackground);

  Loadout.bulletContainer = new PIXI.Container();
  Loadout.renderContainer.addChild(Loadout.bulletContainer);

  Loadout.shipSprite = new PIXI.Sprite(
    glowTexture(
      PIXI.Texture.fromCanvas(Ships.shipArt(PlayerShip.SHIP_SIZE, gameModel.p1.ship.seed, Ships.enemyColors[gameModel.p1.ship.colorIndex]))
    )
  );
  Loadout.shipSprite.anchor = {x:0.5,y:0.5};
  Loadout.shipSprite.position = {x:Loadout.shipRenderTexture.width / 2, y:Loadout.shipRenderTexture.height * 0.7};
  Loadout.renderContainer.addChild(Loadout.shipSprite);

  var positionSpacing = 110;

  for (i = 0; i < Loadout.menuOptions.length; i++) {
    var level = 1;
    var weapon = undefined;
    switch (i) {
      case 0:
        level = gameModel.p1.ship.frontWeaponLevel;
        weapon = gameModel.p1.frontWeapon;
        break;
      case 1:
        level = gameModel.p1.ship.turretWeaponLevel;
        weapon = gameModel.p1.turretWeapon;
        break;
      case 2:
        level = gameModel.p1.ship.rearWeaponLevel;
        weapon = gameModel.p1.rearWeapon;
        break;
      case 3:
        level = gameModel.p1.ship.shieldLevel;
        weapon = gameModel.p1.shield;
        break;
    }
    Loadout.menuOptions[i].text = new PIXI.Container();
    Loadout.menuOptions[i].positionText = getText("Level " + level + "\n" + Loadout.menuOptions[i].title, fontSize, { });

    Loadout.menuOptions[i].equippedText = getText((typeof weapon === "undefined" ? "Empty Slot " : ""), 12 * scalingFactor, { });

    if (weapon) {
      Loadout.menuOptions[i].equippedIcon = ArmsDealer.createItemIcon(weapon, {buy:false, loadout:true, scale:0.7});
      Loadout.menuOptions[i].text.addChild(Loadout.menuOptions[i].equippedIcon);
      Loadout.menuOptions[i].weapon = weapon;
    } else {
      Loadout.menuOptions[i].equippedIcon = new PIXI.Container();
    }
    Loadout.menuOptions[i].equippedIcon.position = {x:renderer.width * 0.2 + (25 * scalingFactor), y:renderer.height * 0.18 + (i * positionSpacing * scalingFactor) - (20 * scalingFactor)};

    Loadout.menuOptions[i].positionText.tint = Loadout.menuOptions[i].positionText.defaultTint = MainMenu.buttonTint;
    Loadout.menuOptions[i].equippedText.tint = Loadout.menuOptions[i].equippedText.defaultTint = typeof weapon !== "undefined" ? MainMenu.buttonTint : MainMenu.unselectableTint;

    if (Loadout.currentSelection == i) {
      Loadout.menuOptions[i].text.tint = MainMenu.selectedButtonTint;
    }

    Loadout.menuOptions[i].positionText.position = {x:renderer.width * 0.05 + 25, y:renderer.height * 0.18 + (i * positionSpacing * scalingFactor)};
    Loadout.menuOptions[i].equippedText.position = {x:renderer.width * 0.2 + (35 * scalingFactor), y:Loadout.menuOptions[i].positionText.position.y + Loadout.menuOptions[i].positionText.getBounds().height / 2};
    Loadout.menuOptions[i].text.addChild(Loadout.menuOptions[i].positionText);
    Loadout.menuOptions[i].text.addChild(Loadout.menuOptions[i].equippedText);
    Loadout.menuContainer.addChild(Loadout.menuOptions[i].text);
  }

  Loadout.positionSelector = new PIXI.Graphics();
  Loadout.positionSelector.lineStyle(2 * gameModel.resolutionFactor, 0xFFFFFF);
  Loadout.positionSelector.drawRect(0,0,110 * scalingFactor,26 * scalingFactor);
  Loadout.positionSelector.visible=false;
  Loadout.menuContainer.addChild(Loadout.positionSelector);

  Loadout.locationSelector = new PIXI.Graphics();
  Loadout.locationSelector.visible=false;
  Loadout.menuContainer.addChild(Loadout.locationSelector);

  Loadout.weaponsContainer = new PIXI.Container();
  Loadout.menuContainer.addChild(Loadout.weaponsContainer);

  Loadout.select(Loadout.menuOptions[0]);

};

Loadout.resize = function () {
  var visible = Loadout.menuContainer.visible;
  Loadout.initialize();
  Loadout.menuContainer.visible = visible;
};

Loadout.checkMouseOver = function () {
  if (!Loadout.menuContainer || !Loadout.menuContainer.visible)
    return false;

  if (MainMenu.checkButton(Loadout.backButton)) {
    Loadout.select(Loadout.backButton);
    return true;
  }

  for (var i=0; i< Loadout.menuOptions.length;i++) {
    if (MainMenu.checkButton(Loadout.menuOptions[i])) {
      Loadout.select(Loadout.menuOptions[i]);
      return true;
    }
  }

  for (i = 0; i < Loadout.weapons.length; i++) {
    if (MainMenu.checkButton(Loadout.weapons[i])) {
      Loadout.select(Loadout.weapons[i]);
      return true;
    }
  }

  for (i = 0; i < Loadout.shields.length; i++) {
    if (MainMenu.checkButton(Loadout.shields[i])) {
      Loadout.select(Loadout.shields[i]);
      return true;
    }
  }

  Loadout.hideItemHover();

  return false;
};

Loadout.checkClicks = function() {

  if (!Loadout.menuContainer.visible)
    return false;

  if (MainMenu.checkButton(Loadout.backButton)) {
    Loadout.backButton.click();
    return true;
  }

  for (var i=0; i< Loadout.menuOptions.length;i++) {
    if (MainMenu.checkButton(Loadout.menuOptions[i])) {
      Loadout.menuOptions[i].click();
      return true;
    }
  }

  Loadout.weapons.forEach(function(currentValue) {
    if (MainMenu.checkButton(currentValue)) {
      setTimeout(function(){Loadout.selectWeapon(currentValue.index);});
      return true;
    }
  });

  Loadout.shields.forEach(function(currentValue) {
    if (MainMenu.checkButton(currentValue)) {
      setTimeout(function(){Loadout.selectShield(currentValue.index);});
      return true;
    }
  });

  return false;
};

Loadout.select = function(button) {
  if (typeof button === "undefined")
    return;

  Loadout.backButton.text.tint = MainMenu.buttonTint;
  if (Loadout.weaponMenuOpen || Loadout.shieldMenuOpen) {
    Loadout.weaponSelection = button.index;
  }
  else {
    Loadout.currentSelection = button.index;
  }


  for (var i=0; i< Loadout.menuOptions.length;i++) {
    Loadout.menuOptions[i].positionText.tint = Loadout.menuOptions[i].positionText.defaultTint;
    Loadout.menuOptions[i].equippedText.tint = Loadout.menuOptions[i].equippedText.defaultTint;
    Loadout.menuOptions[i].equippedIcon.children.forEach(function(child){
      child.tint = child.defaultTint;
    });
  }

  Loadout.weapons.forEach(function(currentValue) {
    currentValue.text.tint = currentValue.defaultTint;
    currentValue.text.children.forEach(function(child){
      child.tint = child.defaultTint;
    });
  });

  Loadout.shields.forEach(function(currentValue) {
    currentValue.text.tint = currentValue.defaultTint;
    currentValue.text.children.forEach(function(child){
      child.tint = child.defaultTint;
    });
  });

  if (button.text.children && button.text.children.length > 0) {
    button.text.children.forEach(function(child){
      child.tint = MainMenu.selectedButtonTint;
      if (child.children.length > 0) {
        child.children.forEach(function(grandChild){
          grandChild.tint = MainMenu.selectedButtonTint;
        });
      }
    });
  }  else {
    button.text.tint = MainMenu.selectedButtonTint;
  }

  if (button.weapon) {
    Loadout.showItemHover(button.weapon, button);
  }
};

Loadout.showItemHover = function(item, button) {
  if (lastUsedInput == inputTypes.controller || Loadout.menuContainer.visible === false)
    return;

  if (Loadout.itemHover && Loadout.itemHover.item.id != item.id) {
    // Loadout.menuContainer.removeChild(Loadout.itemHover);
    Loadout.itemHover.destroy(true);
    Loadout.itemHover = false;
  }
  if (!Loadout.itemHover) {
    Loadout.itemHover = new PIXI.Container();
    var itemDetails = ArmsDealer.createItemLayout(item, false, true, true);
    var bg = new PIXI.Graphics();
    bg.beginFill(MainMenu.modalBackgroundTint);
    bg.drawRect(0,0,itemDetails.getBounds().width + itemDetails.getBounds().x * 2,itemDetails.getBounds().height + itemDetails.getBounds().y * 2);
    bg.alpha = 0.95;
    Loadout.itemHover.addChild(bg);
    Loadout.itemHover.addChild(itemDetails);
    Loadout.itemHover.item = item;
    Loadout.menuContainer.addChild(Loadout.itemHover);
  }
  if (Loadout.itemHover) {
    var hoverPositionX = cursorPosition.x;
    var hoverPositionY = cursorPosition.y;

    if (lastUsedInput == inputTypes.controller) {
      var buttonBounds = button.text.getBounds();
      hoverPositionX = buttonBounds.x < renderer.width / 2 ? buttonBounds.x + buttonBounds.width : buttonBounds.x;
      hoverPositionY = buttonBounds.y;
    }
    var bounds = Loadout.itemHover.getBounds();
    if (renderer.width / 2 > hoverPositionX) {
      Loadout.itemHover.position = {x:hoverPositionX, y:Math.min(hoverPositionY, renderer.height - bounds.height - 50 * scalingFactor)};
    } else {
      Loadout.itemHover.position = {x:hoverPositionX - bounds.width,y:Math.min(hoverPositionY, renderer.height - bounds.height - 50 * scalingFactor)};
    }
  }
};

Loadout.hideItemHover = function() {
  if (Loadout.itemHover) {
    Loadout.itemHover.destroy(true);
    Loadout.itemHover = false;
  }
};

Loadout.up = function() {
  if (!Loadout.menuContainer.visible)
    return false;

  if (Loadout.weaponMenuOpen) {
    Loadout.select(Loadout.weapons[gridSelection(0, -1, Loadout.weaponSelection, Loadout.weapons.length, Loadout.gridWidth)]);
  } else if (Loadout.shieldMenuOpen) {
    Loadout.select(Loadout.shields[gridSelection(0, -1, Loadout.weaponSelection, Loadout.shields.length, Loadout.gridWidth)]);
  }
  else {
    var selection = Loadout.currentSelection - 1;
    if (selection < 0)
      selection = Loadout.menuOptions.length - 1;

    Loadout.select(Loadout.menuOptions[selection]);
  }

  return true;
};

Loadout.down = function() {
  if (!Loadout.menuContainer.visible)
    return false;

  if (Loadout.weaponMenuOpen) {
    Loadout.select(Loadout.weapons[gridSelection(0, 1, Loadout.weaponSelection, Loadout.weapons.length, Loadout.gridWidth)]);
  } else if (Loadout.shieldMenuOpen) {
    Loadout.select(Loadout.shields[gridSelection(0, 1, Loadout.weaponSelection, Loadout.shields.length, Loadout.gridWidth)]);
  } else {
    var selection = Loadout.currentSelection + 1;
    if (selection >= Loadout.menuOptions.length)
      selection = 0;

    Loadout.select(Loadout.menuOptions[selection]);
  }

  return true;
};

Loadout.left = function() {
  if (!Loadout.menuContainer.visible)
    return false;

  if (Loadout.weaponMenuOpen) {
    Loadout.select(Loadout.weapons[gridSelection(-1, 0, Loadout.weaponSelection, Loadout.weapons.length, Loadout.gridWidth)]);
  } else if (Loadout.shieldMenuOpen) {
    Loadout.select(Loadout.shields[gridSelection(-1, 0, Loadout.weaponSelection, Loadout.shields.length, Loadout.gridWidth)]);
  }
};

Loadout.right = function() {
  if (!Loadout.menuContainer.visible)
    return false;

    if (Loadout.weaponMenuOpen) {
      Loadout.select(Loadout.weapons[gridSelection(1, 0, Loadout.weaponSelection, Loadout.weapons.length, Loadout.gridWidth)]);
    } else if (Loadout.shieldMenuOpen) {
      Loadout.select(Loadout.shields[gridSelection(1, 0, Loadout.weaponSelection, Loadout.shields.length, Loadout.gridWidth)]);
    }
};

Loadout.aButton = function() {
  if (!Loadout.menuContainer.visible)
    return false;

  if (Loadout.weaponMenuOpen) {
    Loadout.selectWeapon(Loadout.weaponSelection);
  } else if (Loadout.shieldMenuOpen) {
    Loadout.selectShield(Loadout.weaponSelection);
  } else {
    Loadout.menuOptions[Loadout.currentSelection].click();
    if (Loadout.weaponMenuOpen)
      Loadout.select(Loadout.weapons[Loadout.weaponSelection]);
    else
      Loadout.select(Loadout.shields[Loadout.weaponSelection]);
  }

  return true;
};

Loadout.bButtonPress = function() {
  if (!Loadout.menuContainer.visible)
    return false;

  if (Loadout.weaponMenuOpen || Loadout.shieldMenuOpen) {
    Loadout.weaponsContainer.visible = false;
    Loadout.weaponMenuOpen = false;
    Loadout.shieldMenuOpen = false;
    Loadout.locationSelector.visible = false;
    Loadout.positionSelector.visible=false;
    Loadout.select(Loadout.menuOptions[Loadout.currentSelection]);
  } else {
    Loadout.backButton.click();
  }
  return true;
};

Loadout.update = function(timeDiff) {
  if (!Loadout.menuContainer.visible)
    return;

  if (Loadout.shipRenderTexture) {

    // if a weapon exists
    if (Loadout.firingWeapons) {

      // update the bullets
      Loadout.firingWeapons.forEach(function(weapon){
        weapon.update(timeDiff);
      });
    } else {
      Loadout.firingWeapons = [];
    }

    // if weapon selection open
    if (Loadout.weaponMenuOpen && Loadout.equippedWeapon) {

      // if weapon already set up
      if (Loadout.firingWeapon && Loadout.firingWeapon.weapon.id === Loadout.equippedWeapon.id) {

        // fire it
        if (Loadout.currentPosition === Loadout.positions.frontWeapon) {
          // front
          if (Loadout.firingWeapon.readyToFire(true, timeDiff)) {
            Loadout.firingWeapon.fireShot({x: Loadout.shipSprite.position.x / scalingFactor, y: (Loadout.shipSprite.position.y / scalingFactor) - 8, angle:0}, 1);
          }
        }
        if (Loadout.currentPosition === Loadout.positions.turretWeapon) {
          // turret
          if (Loadout.firingWeapon.readyToFire(true, timeDiff)) {
            PlayerShip.playerShip.xLoc = (Loadout.renderSprite.position.x + Loadout.shipSprite.position.x) / scalingFactor;
            PlayerShip.playerShip.yLoc = (Loadout.renderSprite.position.y + Loadout.shipSprite.position.y) / scalingFactor;
            Loadout.firingWeapon.fireShot({x: Loadout.shipSprite.position.x / scalingFactor, y: (Loadout.shipSprite.position.y / scalingFactor), angle:Bullets.getTurretAngle()}, 1);
          }
        }
        if (Loadout.currentPosition === Loadout.positions.rearWeapon) {
          // rear
          if (Loadout.firingWeapon.readyToFire(true, timeDiff)) {
            Loadout.firingWeapon.fireShot({x: Loadout.shipSprite.position.x / scalingFactor + 16, y: (Loadout.shipSprite.position.y / scalingFactor) + 16, angle: (Math.PI / 8), rear:true}, 0.5);
            Loadout.firingWeapon.fireShot({x: Loadout.shipSprite.position.x / scalingFactor - 16, y: (Loadout.shipSprite.position.y / scalingFactor) + 16, angle:(-Math.PI / 8), rear:true}, 0.5);
          }
        }
      } else {
        // set up weapon
        if (Loadout.firingWeapon)
          Loadout.firingWeapon.destroy();
        Loadout.firingWeapon = Weapons.createWeaponLogic(Loadout.equippedWeapon, Loadout.bulletContainer);
        Loadout.equippedWeapon.lastShot = 1;
        Loadout.firingWeapons.push(Loadout.firingWeapon);
      }

    }

    renderer.render(Loadout.renderContainer, Loadout.shipRenderTexture);
  }
};
