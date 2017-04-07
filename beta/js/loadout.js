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
  levelAllowed : 1
};

Loadout.selectPosition = function(index) {

  Loadout.positionSelector.clear();
  Loadout.positionSelector.lineStyle(2, 0xFFFFFF);
  Loadout.positionSelector.tint = MainMenu.buttonTint;
  var bounds = Loadout.menuOptions[index].text.getBounds();
  Loadout.positionSelector.drawRect(bounds.x - 20 * scalingFactor,bounds.y - 5 * scalingFactor,bounds.width + 40 * scalingFactor,bounds.height + 10 * scalingFactor);

  Loadout.positionSelector.visible=true;

  Loadout.currentPosition = index;

  Loadout.locationSelector.clear();
  // Loadout.locationSelector.filters = [new PIXI.filters.BlurFilter()];
  Loadout.locationSelector.lineStyle(2 * scalingFactor, 0xFFFFFF);
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
      Loadout.locationSelector.lineStyle(2 * scalingFactor, 0xFFFFFF);
      Loadout.locationSelector.drawCircle(0,0,Loadout.shipSprite.width / 8);
      Loadout.showWeapons();
      break;
    case 3:
      Loadout.locationSelector.position.x = Loadout.shipSprite.position.x + Loadout.renderSprite.position.x;
      Loadout.locationSelector.position.y = Loadout.shipSprite.position.y + Loadout.renderSprite.position.y;
      Loadout.locationSelector.clear();
      Loadout.locationSelector.lineStyle(2 * scalingFactor, 0xFFFFFF);
      Loadout.locationSelector.drawCircle(0,0,Loadout.shipSprite.width / 3);
      Loadout.showShields();
      break;
  }

  Loadout.locationSelector.lineStyle(1 * scalingFactor, 0xFFFFFF);
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
    Loadout.weaponsContainer.removeChild(item);
    item.destroy();
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

  for (var i=0; i<gameModel.p1.weapons.length; i++) {
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
        // text : new PIXI.Text("Level " + gameModel.p1.weapons[i].level + " " + gameModel.p1.weapons[i].name + equippedText + "\n" + formatMoney(gameModel.p1.weapons[i].dps) + " DPS / " + gameModel.p1.weapons[i].shotsPerSecond.toFixed(2) + " shots per second", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 1, align: 'left' })
        text : ArmsDealer.createItemIcon(gameModel.p1.weapons[i], {buy:false, loadout:true, slotLevel : Loadout.levelAllowed, compareItem:Loadout.equippedWeapon, scale:0.8})
      };
      // Loadout.weapons[index].text.scale = {x:0.8, y:0.8};
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

  Loadout.showShields();
  Loadout.selectPosition(Loadout.currentPosition);
};

Loadout.selectWeapon = function(index) {

  if (Loadout.weapons[index].weapon.level > Loadout.levelAllowed) {
    Sounds.damage.play();
    return;
  }

  if (gameModel.p1.frontWeapon && gameModel.p1.frontWeapon.id == Loadout.weapons[index].weapon.id) {
    gameModel.p1.frontWeapon = undefined;
    Loadout.menuOptions[0].equippedText.text = "Empty Slot";
    Loadout.menuOptions[0].text.removeChild(Loadout.menuOptions[0].equippedIcon);
    Loadout.menuOptions[0].equippedText.tint = Loadout.menuOptions[0].equippedText.defaultTint = MainMenu.unselectableTint;
  }
  if (gameModel.p1.turretWeapon && gameModel.p1.turretWeapon.id == Loadout.weapons[index].weapon.id) {
    gameModel.p1.turretWeapon = undefined;
    Loadout.menuOptions[1].equippedText.text = "Empty Slot";
    Loadout.menuOptions[1].text.removeChild(Loadout.menuOptions[1].equippedIcon);
    Loadout.menuOptions[1].equippedText.tint = Loadout.menuOptions[1].equippedText.defaultTint = MainMenu.unselectableTint;
  }
  if (gameModel.p1.rearWeapon && gameModel.p1.rearWeapon.id == Loadout.weapons[index].weapon.id) {
    gameModel.p1.rearWeapon = undefined;
    Loadout.menuOptions[2].equippedText.text = "Empty Slot";
    Loadout.menuOptions[2].text.removeChild(Loadout.menuOptions[2].equippedIcon);
    Loadout.menuOptions[2].equippedText.tint = Loadout.menuOptions[2].equippedText.defaultTint = MainMenu.unselectableTint;
  }

  switch(Loadout.currentPosition) {
    case Loadout.positions.frontWeapon:
      gameModel.p1.frontWeapon = Loadout.weapons[index].weapon;
      Loadout.menuOptions[0].equippedText.text = "";
      Loadout.menuOptions[0].equippedText.tint = Loadout.menuOptions[0].equippedText.defaultTint = MainMenu.buttonTint;

      var iconPosition = Loadout.menuOptions[0].equippedIcon.position;
      Loadout.menuOptions[0].text.removeChild(Loadout.menuOptions[0].equippedIcon);
      Loadout.menuOptions[0].equippedIcon = ArmsDealer.createItemIcon(Loadout.weapons[index].weapon, {buy:false, loadout:true, scale:0.7});
      Loadout.menuOptions[0].equippedIcon.position = iconPosition;
      // Loadout.menuOptions[0].equippedIcon.scale = {x:0.7, y:0.7};
      Loadout.menuOptions[0].text.addChild(Loadout.menuOptions[0].equippedIcon);
      Loadout.showWeapons();
      break;
    case Loadout.positions.turretWeapon:
      gameModel.p1.turretWeapon = Loadout.weapons[index].weapon;
      Loadout.menuOptions[1].equippedText.text = "";
      Loadout.menuOptions[1].equippedText.tint = Loadout.menuOptions[1].equippedText.defaultTint = MainMenu.buttonTint;

      var iconPosition = Loadout.menuOptions[1].equippedIcon.position;
      Loadout.menuOptions[1].text.removeChild(Loadout.menuOptions[1].equippedIcon);
      Loadout.menuOptions[1].equippedIcon = ArmsDealer.createItemIcon(Loadout.weapons[index].weapon, {buy:false, loadout:true, scale:0.7});
      Loadout.menuOptions[1].equippedIcon.position = iconPosition;
      // Loadout.menuOptions[1].equippedIcon.scale = {x:0.7, y:0.7};
      Loadout.menuOptions[1].text.addChild(Loadout.menuOptions[1].equippedIcon);
      Loadout.showWeapons();
      break;
    case Loadout.positions.rearWeapon:
      gameModel.p1.rearWeapon = Loadout.weapons[index].weapon;
      Loadout.menuOptions[2].equippedText.text = "";
      Loadout.menuOptions[2].equippedText.tint = Loadout.menuOptions[2].equippedText.defaultTint = MainMenu.buttonTint;

      var iconPosition = Loadout.menuOptions[2].equippedIcon.position;
      Loadout.menuOptions[2].text.removeChild(Loadout.menuOptions[2].equippedIcon);
      Loadout.menuOptions[2].equippedIcon = ArmsDealer.createItemIcon(Loadout.weapons[index].weapon, {buy:false, loadout:true, scale:0.7});
      Loadout.menuOptions[2].equippedIcon.position = iconPosition;
      // Loadout.menuOptions[2].equippedIcon.scale = {x:0.7, y:0.7};
      Loadout.menuOptions[2].text.addChild(Loadout.menuOptions[2].equippedIcon);
      Loadout.showWeapons();
      break;
  }
  Loadout.updateTotalDPS();
  Loadout.selectPosition(Loadout.currentPosition);
};

Loadout.showShields = function() {

  Loadout.weaponsContainer.visible = true;
  Loadout.shieldMenuOpen = true;
  Loadout.weaponMenuOpen = false;
  Loadout.weaponSelection = 0;
  Loadout.levelAllowed = gameModel.p1.ship.shieldLevel;

  for (var i=Loadout.weaponsContainer.children.length - 1; i >= 0; i--){
    var item = Loadout.weaponsContainer.children[i];
    Loadout.weaponsContainer.removeChild(item);
    item.destroy();
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

  for (var i=0; i<gameModel.p1.shields.length; i++) {
    if (!equippedShield || gameModel.p1.shields[i].id != equippedShield.id) {
      Loadout.shields[index] = {
        index : index,
        weapon : gameModel.p1.shields[i],
        // text : new PIXI.Text("Level " + gameModel.p1.shields[i].level + " " + gameModel.p1.shields[i].name + "\n" + formatMoney(gameModel.p1.shields[i].capacity) + " Capacity / " + formatMoney(gameModel.p1.shields[i].chargePerSecond) + " charge per sec", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 1, align: 'left' })
        text : ArmsDealer.createItemIcon(gameModel.p1.shields[i], {buy:false, loadout:true, compareItem : gameModel.p1.shield, scale:0.8})
      };
      // Loadout.shields[index].text.scale = {x:0.8, y:0.8};
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
};

Loadout.show = function() {
  Loadout.initialize();
  Loadout.menuContainer.visible = true;
};

Loadout.initialize = function () {
  if (!Loadout.menuContainer) {
    Loadout.menuContainer = new PIXI.Container();
    gameContainer.addChild(Loadout.menuContainer);
  } else {
    for (var i=Loadout.menuContainer.children.length - 1; i >= 0; i--){
      var item = Loadout.menuContainer.children[i];
      Loadout.menuContainer.removeChild(item);
      item.destroy();
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

  Loadout.titleText = new PIXI.Text(Loadout.menuTitle, { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
  Loadout.titleText.tint = MainMenu.titleTint;
  Loadout.titleText.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.05 + 25};
  Loadout.menuContainer.addChild(Loadout.titleText);

  Loadout.backButton.text = new PIXI.Text(Loadout.backButton.title + " (" + ShootrUI.getInputButtonDescription(Loadout.backButton.buttonDesc) + ")", { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
  Loadout.backButton.text.tint = MainMenu.buttonTint;

  Loadout.backButton.text.anchor = {x:0,y:1};
  Loadout.backButton.text.position = {x:renderer.width * 0.05 + 25,y: renderer.height * 0.95 - 25};
  Loadout.menuContainer.addChild(Loadout.backButton.text);

  Loadout.totalDPS = new PIXI.Text("Total Damage Per Second: ", { font: Math.round(26 * scalingFactor) + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
  Loadout.totalDPS.tint = MainMenu.buttonTint;

  Loadout.totalDPS.anchor = {x:0.5,y:1};
  Loadout.totalDPS.position = {x:renderer.width / 2,y: renderer.height * 0.95 - 25};
  Loadout.menuContainer.addChild(Loadout.totalDPS);

  Loadout.shipName = new PIXI.Text("Level " + gameModel.p1.ship.level + " " + gameModel.p1.ship.name, { font: Math.round(26 * scalingFactor) + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'center' });
  Loadout.shipName.tint = MainMenu.buttonTint;

  Loadout.shipName.anchor = {x:0.5,y:0};
  Loadout.shipName.position = {x:renderer.width / 2,y: renderer.height * 0.05 + 25 };
  Loadout.menuContainer.addChild(Loadout.shipName);

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
      PIXI.Texture.fromCanvas(Ships.shipArt(PlayerShip.SHIP_SIZE, gameModel.p1.ship.seed, false, Ships.enemyColors[gameModel.p1.ship.colorIndex]))
    )
  );
  Loadout.shipSprite.anchor = {x:0.5,y:0.5};
  Loadout.shipSprite.position = {x:Loadout.shipRenderTexture.width / 2, y:Loadout.shipRenderTexture.height * 0.7};
  Loadout.renderContainer.addChild(Loadout.shipSprite);

  var positionSpacing = 110;

  for (var i=0; i< Loadout.menuOptions.length;i++) {
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
    Loadout.menuOptions[i].positionText = new PIXI.Text("Level " + level + "\n" + Loadout.menuOptions[i].title,
                                                { font: fontSize + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'left' });

    // Loadout.menuOptions[i].equippedText = new PIXI.Text((typeof weapon !== "undefined" ? "Level " + weapon.level + " " + weapon.name + " equipped" : "Empty Slot"),
    //                                             { font: Math.round(12 * scalingFactor) + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'left' });

    Loadout.menuOptions[i].equippedText = new PIXI.Text((typeof weapon === "undefined" ? "Empty Slot " : ""),
                                                { font: Math.round(12 * scalingFactor) + 'px Dosis', fill: '#FFF', stroke: "#000", strokeThickness: 0, align: 'left' });

    if (weapon) {
      Loadout.menuOptions[i].equippedIcon = ArmsDealer.createItemIcon(weapon, {buy:false, loadout:true, scale:0.7});
      Loadout.menuOptions[i].text.addChild(Loadout.menuOptions[i].equippedIcon);
    } else {
      Loadout.menuOptions[i].equippedIcon = new PIXI.Container();
    }
    Loadout.menuOptions[i].equippedIcon.position = {x:renderer.width * 0.2 + (25 * scalingFactor), y:renderer.height * 0.18 + (i * positionSpacing * scalingFactor) - (20 * scalingFactor)};
    // Loadout.menuOptions[i].equippedIcon.scale = {x:0.7, y:0.7};


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
  Loadout.positionSelector.lineStyle(2, 0xFFFFFF);
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
  if (!Loadout.menuContainer.visible)
    return false;

  if (MainMenu.checkButton(Loadout.backButton)) {
    Loadout.select(Loadout.backButton);
    return true;
  }

  for (var i=0; i< Loadout.menuOptions.length;i++) {
    if (MainMenu.checkButton(Loadout.menuOptions[i])) {
      Loadout.select(Loadout.menuOptions[i]);
    }
  }

  Loadout.weapons.forEach(function(currentValue) {
    if (MainMenu.checkButton(currentValue)) {
      Loadout.select(currentValue);
    }
  });

  Loadout.shields.forEach(function(currentValue) {
    if (MainMenu.checkButton(currentValue)) {
      Loadout.select(currentValue);
    }
  });

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
    var selection = gridSelection(-1, 0, Loadout.weaponSelection, Loadout.weapons.length, Loadout.gridWidth);
    Loadout.select(Loadout.weapons[selection]);
  } else if (Loadout.shieldMenuOpen) {
    var selection = gridSelection(-1, 0, Loadout.weaponSelection, Loadout.shields.length, Loadout.gridWidth);
    Loadout.select(Loadout.shields[selection]);
  }
};

Loadout.right = function() {
  if (!Loadout.menuContainer.visible)
    return false;

    if (Loadout.weaponMenuOpen) {
      var selection = gridSelection(1, 0, Loadout.weaponSelection, Loadout.weapons.length, Loadout.gridWidth);
      Loadout.select(Loadout.weapons[selection]);
    } else if (Loadout.shieldMenuOpen) {
      var selection = gridSelection(1, 0, Loadout.weaponSelection, Loadout.shields.length, Loadout.gridWidth);
      Loadout.select(Loadout.shields[selection]);
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
            PlayerShip.playerShip.xLoc = Loadout.shipSprite.position.x;
            PlayerShip.playerShip.yLoc = Loadout.shipSprite.position.y;
            Loadout.firingWeapon.fireShot({x: Loadout.shipSprite.position.x / scalingFactor, y: (Loadout.shipSprite.position.y / scalingFactor), angle:Bullets.getTurretAngle()}, 1);
          }
        }
        if (Loadout.currentPosition === Loadout.positions.rearWeapon) {
          // rear
          if (Loadout.firingWeapon.readyToFire(true, timeDiff)) {
            Loadout.firingWeapon.fireShot({x: Loadout.shipSprite.position.x / scalingFactor + 16, y: (Loadout.shipSprite.position.y / scalingFactor) + 16, angle: (Math.PI / 8) * (Loadout.firingWeapon.rearAngleMod || 1)}, 0.5);
            Loadout.firingWeapon.fireShot({x: Loadout.shipSprite.position.x / scalingFactor - 16, y: (Loadout.shipSprite.position.y / scalingFactor) + 16, angle:(-Math.PI / 8) * (Loadout.firingWeapon.rearAngleMod || 1)}, 0.5);
          }
        }
      } else {
        // set up weapon
        Loadout.firingWeapon = Weapons.createWeaponLogic(Loadout.equippedWeapon, Loadout.bulletContainer);
        Loadout.equippedWeapon.lastShot = 1;
        Loadout.firingWeapons.push(Loadout.firingWeapon);
      }

    }

    renderer.render(Loadout.renderContainer, Loadout.shipRenderTexture);
  }
};
